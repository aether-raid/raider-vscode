import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<{ text: string, className: string }[]>([]);
    const [input, setInput] = useState('');

    const addChatBubble = (text: string, className: string) => {
        setMessages(prevMessages => [...prevMessages, { text, className }]);
    };

    const handleSend = () => {
        if (input.trim()) {
            addChatBubble(input, 'user');
            vscode.postMessage({
                command: 'query',
                text: input
            });
            setInput('');
        }
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.command === 'response') {
                addChatBubble(message.text, 'assistant');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <div id="chat-container">
            <div id="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-bubble ${msg.className}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <textarea
                id="chat-input"
                rows={2}
                cols={50}
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button id="send-button" onClick={handleSend}>Send</button>
        </div>
    );
};

const vscode = acquireVsCodeApi();
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<Chat />);
