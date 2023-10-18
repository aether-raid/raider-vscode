import { useContext, useEffect, useState } from "react";
import { WebviewContext } from "./WebviewContext";
import styled from "@emotion/styled";

type Message = {
  role: string;
  content: string;
};

type ChatBubbleProps = {
  role: string;
};

const roleColors = {
  assistant: "#333",
  user: "#007acc",
};

function getRoleColor(role: string) {
  return Object.entries(roleColors).find(([key, val]) => key === role)?.[1];
}

const ChatBubbleContainer = styled.div<ChatBubbleProps>`
  max-width: 100%;
  padding: 10px;
  color: white;
  align-self: ${(props) => (props.role == "user" ? "flex-end" : "flex-start")};
  background-color: ${(props) => getRoleColor(props.role)};
`;

type MessageBubbleProps = {
  message: Message;
};

const MessageBubble = (props: MessageBubbleProps) => {
  return (
    <ChatBubbleContainer role={props.message.role}>
      {props.message.content}
    </ChatBubbleContainer>
  );
};

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 10px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const ChatInput = styled.textarea`
  background-color: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
`;

const SendButton = styled.button`
  background-color: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: #005a9e;
  }
`;

export const Chat = () => {
  const { callApi } = useContext(WebviewContext);
  const [messages, setMessages] = useState(
    [] as { role: string; content: string }[]
  );
  const [input, setInput] = useState("");

  const addChatBubble = (content: string, role: string) => {
    setMessages((prevMessages) => [...prevMessages, { content, role }]);
    callApi("sendMessageToClient", { role, content });
  };

  const handleSend = () => {
    if (input.trim()) {
      addChatBubble(input, "user");
      setInput("");

      // llm processing thingy, rn not relevant
      let output = "I'm a helpful assistant, sorry";

      addChatBubble(output, "assistant");
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setMessages(await callApi("getMessagesFromClient"));
    };
    fetchMessages();
  }, []);

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <MessageBubble message={msg} key={index} />
        ))}
      </MessagesContainer>
      <ChatInput
        rows={2}
        cols={50}
        value={input}
        onChange={(e) => setInput((e.target as HTMLTextAreaElement).value)}
      />
      <SendButton onClick={handleSend}>Send</SendButton>
    </ChatContainer>
  );
};

export const ExampleViewA = () => {
  const { callApi } = useContext(WebviewContext);
  const [bMessage, setBMessage] = useState<string>("");

  return (
    <div>
      <div style={{ display: "flex" }}>
        <button
          onClick={() => {
            callApi("showExampleViewB");
          }}
        >
          Show Example View B
        </button>
      </div>
      <div style={{ display: "flex", marginTop: 10 }}>
        <input
          type="text"
          value={bMessage}
          onChange={(e) => setBMessage(e.target.value)}
        />
        <button
          onClick={() => {
            callApi("sendMessageToExampleB", bMessage);
            setBMessage("");
          }}
        >
          Send to Example View B
        </button>
      </div>
    </div>
  );
};
