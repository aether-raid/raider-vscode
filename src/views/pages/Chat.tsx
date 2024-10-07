import { ReactElement, useContext, useEffect, useState } from "react";
import ReactDOMServer, { renderToString } from "react-dom/server";
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
  SubtaskCard,
  // SendButton,
} from "./Chat.styles";
import { Message } from "../types";
import { Box, Card, CardContent, Fab } from "@mui/material";
import {
  /* Replay, RotateLeft, */ RotateLeftOutlined,
} from "@mui/icons-material";
import { md } from "../util/markdown";
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

  const addChatBubble = (
    content: string, //| ReactElement,
    role: string,
    flag: any | undefined = undefined
    // isHtml: boolean = false
  ) => {
    setMessages((prevMessages) => [...prevMessages, { content, role, flag }]);
    callApi("sendMessage", {
      content, //: typeof content === "string" ? content : renderToString(content),
      role,
    });
  };

  const updateLastMessage = (content: string) => {
    setMessages((prevMessages) => {
      let lastMessage = prevMessages.pop();

      if (lastMessage) {
        // lastMessage["content"] = lastMessage.content + content;
        return [
          ...prevMessages,
          {
            content: lastMessage.content + content,
            role: lastMessage.role,
          },
        ];
      } else {
        return [...prevMessages, { content, role: "assistant" }];
      }
    });
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

      // let subtasks = [
      //   { task_body: "This is a test subtask", task_type: "User action" },
      //   { task_body: "This is a test subtask", task_type: "User action" },
      // ];

      if (subtasks.length === 0) {
        addChatBubble(
          "RAiDer was unable to formulate a plan based on the provided codebase and prompt. This most likely means that the functionality is already implemented and is hence unnecessary for us to update.",
          "assistant"
        );
        return;
      }

      // let subtaskBubble = //renderToString(
      //   (
      //     <Box>
      //       Generated Subtasks:
      //       <ul>
      //         {subtasks.map((value, idx) => (
      //           // <Card key={idx}>
      //           //   <CardContent
      //           //     dangerouslySetInnerHTML={{
      //           //       __html: md.render(value.task_body),
      //           //     }}
      //           //   />
      //           // </Card>
      //           <SubtaskCard subtask={value} key={idx} />
      //         ))}
      //       </ul>
      //     </Box>
      //   );
      //);

      let subtaskGeneration = `Generated Subtasks:\n\n${subtasks
        .map(
          (value, idx) =>
            `${idx + 1}. ${value.task_body.replace("\n- ", "\n\t-")}`
        )
        .join("\n")}\n`;
      addChatBubble(
        // subtaskBubble,
        subtaskGeneration,
        "assistant"
      );

      for (let i = 0; i < subtasks.length; i++) {
        addChatBubble(`## Running Subtask ${i + 1}`, "assistant");
        // addChatBubble("", "assistant");
        addListener("sendChunk", updateLastMessage);
        let result = await callApi("runSubtask", subtasks[i].task_body);
        removeListener("sendChunk", updateLastMessage);
        addChatBubble(result, "assistant");
      }

      // let response =

      // addChatBubble("Running Subtask");
      // addListener("sendChunk", updateLastMessage);

      // let g = await callApi("runSubtask", subtasks[0].task_body);

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
          <MessageBubble
            message={msg}
            key={index}
            render={!("isHtml" in msg && msg.isHtml)}
          />
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
