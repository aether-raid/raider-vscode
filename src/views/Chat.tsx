import { useContext, useEffect, useState } from "react";
// import { useRef } from "react";
import { WebviewContext } from "./WebviewContext";
import {
  ChatContainer,
  ChatField,
  // ChatHeader,
  // ChatInfoContainer,
  // ChatInput,
  // ChatStatus,
  // CloseChatButton,
  MessageBubble,
  MessagesContainer,
  // SendButton,
} from "./Chat.styles";
import { Message } from "./types";
// import {
//   ChatBubbleOutlineOutlined,
//   KeyboardDoubleArrowRight,
//   RotateLeftOutlined,
// } from "@mui/icons-material";
// import { IconButton, Typography } from "@mui/material";

export const Chat = () => {
  const { callApi, addListener, removeListener } = useContext(WebviewContext);

  const [messages, setMessages] = useState([] as Message[]);
  const [input, setInput] = useState("");

  // const [isStreaming, setIsStreaming] = useState(false);

  const addChatBubble = (content: string, role: string) => {
    setMessages((prevMessages) => [...prevMessages, { content, role }]);
    callApi("sendMessage", { role, content });
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

  // const resetMessageHistory = () => {
  //   // TODO
  //   callApi("resetMessageHistory");
  //   setMessages([]);
  // };

  useEffect(() => {
    const fetchMessages = async () => {
      setMessages(await callApi("getMessages"));
    };
    fetchMessages();

    const getMessagesSent = (messages: Message[]) => {
      setMessages(messages);
    };

    addListener("sendMessages", getMessagesSent);

    let interval = setInterval(() => {
      fetchMessages();
    }, 500);

    return () => {
      removeListener("sendMessages", getMessagesSent);
      clearInterval(interval);
    };
  }, []);

  return (
    <ChatContainer>
      {/* <ChatHeader> */}
      {/* <CloseChatButton>
          <KeyboardDoubleArrowRight />
        </CloseChatButton> */}
      {/* <ChatInfoContainer> */}
      {/* <Typography variant={"h5"}>RAiDer</Typography> */}
      {/* <ChatStatus disabled>
            <ChatBubbleOutlineOutlined sx={{ width: "16px", height: "16px" }} />
            <Typography variant={"caption"} sx={{ color: "#43ff00" }}>
              Active
            </Typography>
          </ChatStatus> */}
      {/* </ChatInfoContainer> */}
      {/* <IconButton
          aria-label="reset conversation"
          onClick={resetMessageHistory}
        >
          <RotateLeftOutlined style={{ color: "white" }} />
        </IconButton> */}
      {/* </ChatHeader> */}
      <MessagesContainer>
        {messages.map((msg, index) => (
          <MessageBubble message={msg} key={index} />
        ))}
      </MessagesContainer>
      <ChatField input={input} setInput={setInput} handleSend={handleSend} />
      {/* <SendButton variant="contained" onClick={handleSend}>
        Send
      </SendButton> */}
    </ChatContainer>
  );
};

/* export const ExampleViewA = () => {
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
}; */
