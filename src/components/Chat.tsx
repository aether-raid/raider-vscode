import * as vscode from 'vscode';
import React, { useState, useEffect } from 'react';
import styled from "@emotion/styled";

type Message = {
    role: string
    content: string
};

type ChatBubbleProps = { 
    role: string 
};

const roleColors = {
    assistant: '#333',
    user: '#007acc'
};

function getRoleColor(role: string) {
    return Object.entries(roleColors).find(([key, val]) => key === role)?.[1];
}

const ChatBubbleContainer = styled.div<ChatBubbleProps>`
    max-width: 60%;
    padding: 10px;
    margin: 5px 0;
    border-radius: 10px;
    color: white;
    align-self: ${props => props.role == "user" ? 'flex-end': 'flex-start'};
    background-color: ${props => getRoleColor(props.role)};
`;

type MessageBubbleProps = {
    message: Message
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
    const [messages, setMessages] = useState([] as Message[]);
    const [input, setInput] = useState('');

    const addChatBubble = (content: string, role: string) => {
        setMessages(prevMessages => [...prevMessages, { content, role }]);
    };

    const handleSend = () => {
        if (input.trim()) {
            addChatBubble(input, 'user');
            setInput('');

            // llm processing thingy, rn not relevant
            addChatBubble(
                "I'm a helpful assistant, sorry",
                'assistant'
            );
        }
    };

    return (
        <ChatContainer>
            <MessagesContainer>
                {messages.map((msg, index) => (
                    <MessageBubble message={msg} key={index}/>
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