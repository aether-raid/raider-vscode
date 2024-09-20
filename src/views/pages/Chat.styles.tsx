import styled from "@emotion/styled";
import {
  Button,
  Box,
  Typography,
  TextField,
  InputAdornment,
  OutlinedInput,
  IconButton,
} from "@mui/material";
import { Message } from "../types";
import { ThemeButton, fontArray } from "../theme/theme";
import { SendOutlined } from "@mui/icons-material";
import { useContext, useEffect, useState } from "react";
import { WebviewContext } from "../WebviewContext";

export type ChatBubbleProps = {
  role: string;
};

export const roleColors = {
  assistant: "#fff0",
  user: "#313244",
};
// #007acc

function getRoleColor(role: string) {
  return Object.entries(roleColors).find(([key, val]) => key === role)?.[1];
}

export const ChatBubbleContainer = styled.div<ChatBubbleProps>`
  max-width: 100%;
  padding: 10px 10px;
  color: white;
  align-self: ${(props: ChatBubbleProps) =>
    props.role === "user" ? "flex-end" : "flex-start"};
  background-color: ${(props: ChatBubbleProps) => getRoleColor(props.role)};
  margin: ${(props: ChatBubbleProps) =>
    props.role === "user" ? "8px" : "0px"};
  border-radius: ${(props: ChatBubbleProps) =>
    props.role === "user" ? "5px" : "0px"};
  white-space: pre-line;
  font-family: ${fontArray};
`;

export class MessageBubbleProps {
  message!: Message;
  html?: boolean = true; // set false for debugging
}

export const MessageBubble = (props: MessageBubbleProps) => {
  const { callApi } = useContext(WebviewContext);
  const [text, setText] = useState(props.message.content);

  useEffect(() => {
    async function render(text: string) {
      let renderedText = (await callApi("renderMarkdown", text.trim())).trim();
      setText(renderedText.replace(/^<[^>]+>|<\/[^>]+>$/gi, ""));
    }

    render(props.message.content);

    let interval = setInterval(() => {
      render(props.message.content);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  return true ? (
    <ChatBubbleContainer
      role={props.message.role}
      dangerouslySetInnerHTML={{ __html: text }}
    >
      {/* <Typography fontFamily={fontArray}> */}
      {/* {text} */}
      {/* </Typography> */}
    </ChatBubbleContainer>
  ) : (
    <ChatBubbleContainer role={props.message.role}>
      {/* <Typography fontFamily={fontArray}> */}
      {text}
      {/* </Typography> */}
    </ChatBubbleContainer>
  );
};

export const ChatHeader = styled(Box)`
  position: sticky;
  width: calc(100% - 0.75rem);
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-bottom: 2px solid white;
`;

export const CloseChatButton = styled(IconButton)`
  background-color: #2c2c2e;
  color: #fdfdfd;
`;

export const ChatInfoContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  margin: auto;
  align-items: center;
  color: #aeaeb2;
`;

export const ChatStatus = styled(Button)`
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #2c2c2e;
  border-radius: 16px;
  column-gap: 4px;
`;

export const ChatContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: calc(100vw-0px);
  height: 100vh;
  padding: 0px;
  overflow: hidden;
`;

/**
 *   font-family: ${fontArray};
  font-weight: 900;
  font-style: normal;
  font-size: 14px;
  font-optical-sizing: auto;
 */

export const MessagesContainer = styled(Box)`
  flex: 1;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 20px;
`;

export const ChatInputContainer = styled(Box)`
  position: sticky;
  bottom: 0;
  margin-left: 10px;
  margin-right: 10px;
`;

export const ChatInput = styled(OutlinedInput)`
  background-color: #313244;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  font-family: ${fontArray};
  width: 100%;

  & .Mui-focused {
    outline: none;
  }
`;

export type ChatFieldProps = {
  input: string;
  setInput: (it: string) => void;
  handleSend: () => void;
};

export const ChatInputIconContainer = styled(InputAdornment)`
  align-items: center;
  justify-content: bottom;
  display: flex;
  flex-direction: row;
  column-gap: 0.5rem;
  margin-top: auto;
  margin-bottom: 0.75rem;
`;

export const ChatField = ({ input, setInput, handleSend }: ChatFieldProps) => {
  const onEnter = (evt: React.KeyboardEvent) => {
    if (evt.key === "Enter" && !evt.shiftKey) {
      evt.preventDefault();
      handleSend();
    }
  };
  return (
    <ChatInputContainer>
      <ChatInput
        maxRows={10}
        placeholder="Type here..."
        multiline
        value={input}
        onChange={(e) => setInput((e.target as HTMLTextAreaElement).value)}
        onKeyDown={onEnter}
        endAdornment={
          <ChatInputIconContainer position="end">
            <IconButton
              aria-label="send chat"
              edge="end"
              onClick={handleSend}
              disabled={input && input.length == 0 ? true : false}
            >
              <SendOutlined />
            </IconButton>
          </ChatInputIconContainer>
        }
      />
    </ChatInputContainer>
  );
};

export const SendButton = styled(ThemeButton)`
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
