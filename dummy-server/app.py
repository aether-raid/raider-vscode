import argparse
from fastapi import WebSocket, WebSocketDisconnect, FastAPI
import uvicorn
from typing import Any
import asyncio
import json, random

class ConnectionManager:
    """
    Manages WebSocket connections and message buffering.
    """
    END_OF_MESSAGE_RESPONSE = {"<END_OF_MESSAGE>": ""}
    KEEP_ALIVE_PING = {"<PING>", ""}
    
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.message_buffer: dict[str, list[dict[str, Any]]] = {}
        
        self.external_repos = []
    
    async def _on_connect(self, websocket: WebSocket, session_id: str):
        """
        Accepts a new WebSocket connection and adds it to the list of
        active connections.

        :param websocket: The WebSocket connection to accept.
        """
        await websocket.accept()
        self.active_connections.append(websocket)
    
    async def _on_disconnect(self, websocket: WebSocket) -> None:
        """
        Removes a WebSocket connection from the list of active
        connections.

        :param websocket: The WebSocket connection to remove.
        """
        self.active_connections.remove(websocket)
        
    async def _on_receive(self, websocket: WebSocket, session_id: str, data: dict[str, Any]) -> None:
        method = data.get("method")
        params = data.get("params", {})


        if method == "init_external_repo_agent":
            repo_dir = params.get("repo_dir")
            model_name = params.get("model_name", "azure/gpt-4o")
            timeout = params.get("timeout", 10)
            result = random.random() > 0.95
            if result:
                self.external_repos.append(dict(repo_dir=repo_dir, model_name=model_name, timeout=timeout))
            response = {"result": "Success" if result else "Failure"}
            await self.send_message(websocket, response, session_id)

        elif method == "get_external_repo_agents":
            agents = json.dumps(self.external_repos)
            response = {"result": agents}
            await self.send_message(websocket, response, session_id)

        # elif method == "generate_subtasks":
        #     objective = params.get("objective")
        #     async for response in agent_manager.generate_subtasks(objective):
        #         await self.send_message(websocket, {"result": response}, session_id)

        # elif method == "run_subtask":
        #     subtask = params.get("subtask")
        #     async for response in agent_manager.run_subtask(subtask):
        #         await self.send_message(websocket, {"result": response}, session_id)

        # elif method == "run_multiple_subtasks":
        #     subtasks = params.get("subtasks")
        #     async for response in agent_manager.run_multiple_subtasks(subtasks):
        #         await self.send_message(websocket, {"result": response}, session_id)

        # elif method == "undo":
        #     agent_manager.undo()
        #     await self.send_message(websocket, {"result": "Undo completed"}, session_id)

        # elif method == "shutdown":
        #     result = agent_manager.shutdown()
        #     await self.send_message(websocket, {"result": result}, session_id)
        #     self.agent_managers.pop(session_id)

        else:
            await self.send_message(websocket, {"error": f"Unknown method: {method}"}, session_id)

        await self.send_message(websocket, self.END_OF_MESSAGE_RESPONSE, session_id)
    
    async def send_message(self, websocket: WebSocket,
                           message: dict[str, Any], session_id: str) -> None:
        """
        Sends a message to a specific WebSocket connection. If the
        connection is disconnected, the message is buffered.

        :param websocket: The WebSocket connection to send the message
            to.
        :param message: The message to send.
        """
        try:
            await websocket.send_json(message)
        except WebSocketDisconnect:
            self.message_buffer[session_id].append(message)
            self.logger.warning("Message buffered due to disconnection")
    
    async def send_buffered_messages(
            self,
            websocket: WebSocket,
            session_id: str) -> None:
        """
        Sends all buffered messages to a specific WebSocket connection.

        :param websocket: The WebSocket connection to send the buffered
            messages to.
        """
        if session_id not in self.message_buffer:
            return

        while self.message_buffer[session_id]:
            buffered_message = self.message_buffer[session_id].pop(0)
            await self.send_message(websocket, buffered_message, session_id)
            self.logger.info("Sent buffered message: %s", buffered_message)

    async def send_keepalive_pings(
            self,
            websocket: WebSocket,
            session_id: str) -> None:
        """
        Sends keepalive pings to a specific WebSocket connection at
        regular intervals.

        :param websocket: The WebSocket connection to send the
            keepalive pings to.
        """
        while True:
            await asyncio.sleep(10)  # Adjust the interval as needed
            await self.send_message(websocket, ConnectionManager.KEEP_ALIVE_PING, session_id)
            self.logger.debug("Sent keepalive ping")

    async def websocket_endpoint(
            self,
            websocket: WebSocket,
            session_id: str) -> None:
        """
        WebSocket endpoint to handle various agent management tasks.

        This endpoint manages WebSocket connections and processes
        incoming messages to perform tasks such as initializing
        external repo agents, generating and fine-tuning subtasks,
        running subtasks, and shutting down the agent manager.

        :param websocket: The WebSocket connection instance.
        :param session_id: The session identifier for the connection.

        :raises WebSocketDisconnect: If the WebSocket connection is
            disconnected.
        """
        await self._on_connect(websocket, session_id)
        keepalive_task = asyncio.create_task(
            self.send_keepalive_pings(websocket, session_id))

        try:
            await self.send_buffered_messages(websocket, session_id)

            while True:
                data = await websocket.receive_json()
                self.logger.info("Received data: %s", data)
                await self._on_receive(websocket, session_id, data)

        except WebSocketDisconnect:
            await self._on_disconnect(websocket)
        finally:
            keepalive_task.cancel()
            self.logger.info("Keepalive task cancelled")

    def ping(self) -> str:
        result = "pong"
        return result

conn_manager = ConnectionManager()

app = FastAPI()
app.add_api_websocket_route("/ws/{session_id}", conn_manager.websocket_endpoint)

def main():
    """
    Main function to run the application.
    """
    parser = argparse.ArgumentParser(
        description="Launch the AgentManager with a Websocket endpoint.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument(
        '--port',
        type=int,
        help='Port of the websocket',
        default=10000)
    
    args = parser.parse_args()

    uvicorn.run(app, host="0.0.0.0", port=args.port)

if __name__ == "__main__":
    main()