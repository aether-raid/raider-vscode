import { useContext, useEffect, useState } from "react";
// import { useRef } from "react";
import { WebviewContext } from "../WebviewContext";
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
import { Message } from "../types";
import { Fab } from "@mui/material";
import {
  /* Replay, RotateLeft, */ RotateLeftOutlined,
} from "@mui/icons-material";
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
    callApi("sendMessage", { content, role });
  };

  const handleSend = async () => {
    if (input.trim()) {
      let prompt = input.trim();
      addChatBubble(prompt, "user");
      addChatBubble("Thinking...\n\n", "assistant");
      setInput("");

      let subtasks = (await callApi("generateSubtasks", prompt)).filter(
        (it) => it.task_type !== "User action"
      );

      if (subtasks.length === 0) {
        addChatBubble(
          "RAiDer was unable to formulate a plan based on the provided codebase and prompt. This most likely means that the functionality is already implemented and is hence unnecessary for us to update.",
          "assistant"
        );
        return;
      }

      let subtaskGeneration = `Generated Subtasks:\n\n${subtasks
        .map((value, idx) => `${idx + 1}. ${value.task_body}`)
        .join("\n")}\n`;
      addChatBubble(subtaskGeneration, "assistant");

      // for(let subtask of subtasks) {
      //   let result = await callApi("runSubtask", subtask.task_body);
      //   addChatBubble(result, "assistant");
      // }

      // let response =
      // let g = await callApi("sendMessage", {
      //   role: "user",
      //   content: prompt,
      // });

      // console.log(
      //   `raider-chat ${g} ${typeof g} ${JSON.stringify(
      //     g
      //   )} ${Object.getOwnPropertyNames(g)}`
      // );

      // for await (const result of g) {
      //   addChatBubble(result, "assistant");
      // }

      // console.log(`raider-chat ${response}`);
      // console.log(`raider-chat ${typeof response}`);

      // let propertyNames = Object.getOwnPropertyNames(response);
      // console.log(`raider-chat ${propertyNames}`);
      // propertyNames.forEach((value) => {
      // console.log(`raider-chat 3: ${value} ${(response as any)[value]}`);
      // });

      // for await (const result of response) {
      // setMessages((messages) => {
      // let lastMessage = messages.pop() || {
      // role: "assistant",
      // content: "",
      // };
      // lastMessage.content += result;
      // return [...messages, lastMessage];
      // });
      // }

      // // llm processing thingy, rn not relevant
      // let output = "I'm a helpful assistant, sorry";

      // addChatBubble(output, "assistant");
    }
  };

  const fetchMessages = async () => {
    setMessages(await callApi("getMessages"));
  };

  const getMessagesSent = (messages: Message[]) => {
    setMessages(messages);
  };

  useEffect(() => {
    fetchMessages();

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
      <MessagesContainer>
        {messages.map((msg, index) => (
          <MessageBubble message={msg} key={index} />
        ))}
      </MessagesContainer>
      <ChatField input={input} setInput={setInput} handleSend={handleSend} />
      <Fab
        size="small"
        sx={{ position: "absolute", top: "16px", right: "16px" }}
        aria-label="reset"
        color="primary"
        onClick={() => {
          callApi("resetMessageHistory");
          fetchMessages();
        }}
      >
        <RotateLeftOutlined />
      </Fab>
    </ChatContainer>
  );
};
