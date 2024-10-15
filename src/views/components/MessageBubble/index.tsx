import { useEffect, useState } from "react";
import { Message } from "src/views/types";
import { md } from "src/views/util/markdown";
import { ChatBubbleContainer } from "./styles";

export class MessageBubbleProps {
  message!: Message;
  html?: boolean = true; // set false for debugging
}

export default function MessageBubble(props: MessageBubbleProps) {
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
}
