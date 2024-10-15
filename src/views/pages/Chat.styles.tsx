import styled from "@emotion/styled";
import { Box, InputAdornment, OutlinedInput, IconButton } from "@mui/material";
import { Message } from "../types";
import { fontArray } from "../theme/theme";
import { SendOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { md } from "../util/markdown";

type ChatBubbleProps = {
  role: string;
};

const roleColors = {
  assistant: "#fff0",
  user: "#313244",
};
// #007acc

function getRoleColor(role: string) {
  return Object.entries(roleColors).find(([key /*val*/]) => key === role)?.[1];
}

const ChatBubbleContainer = styled.div<ChatBubbleProps>`
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

  & > ul,
  ol {
    margin-left: 20px;
  }
`;

class MessageBubbleProps {
  message!: Message;
  html?: boolean = true; // set false for debugging
}

export const MessageBubble = (props: MessageBubbleProps) => {
  const [text, setText] = useState(props.message.content);

  useEffect(() => {
    async function render(text: string) {
      let renderedText = md.render(text.trim()).trim();
      setText(renderedText);
    }

    if (typeof props.message.content === "string") {
      render(props.message.content);
    }
  }, []);
  return (
    <ChatBubbleContainer
      role={props.message.role}
      dangerouslySetInnerHTML={{ __html: text }}
    ></ChatBubbleContainer>
  );
};

export const ChatContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: calc(100vw-0px);
  height: 100vh;
  padding: 0px;
  overflow: hidden;
`;

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

const ChatInputContainer = styled(Box)`
  position: sticky;
  bottom: 0;
  margin-left: 10px;
  margin-right: 10px;
`;

const ChatInput = styled(OutlinedInput)`
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

type ChatFieldProps = {
  input: string;
  setInput: (it: string) => void;
  handleSend: () => void;
};

const ChatInputIconContainer = styled(InputAdornment)`
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
