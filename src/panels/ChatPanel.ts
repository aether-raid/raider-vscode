




    private _update() {
        const webview = this._panel.webview;

        this._panel.title = 'Chat';
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chat</title>
            <style>
                body {
                    color: white;
                    background-color: #1e1e1e;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                }
                #chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    padding: 10px;
                }
                #chat-input {
                    background-color: #333;
                    color: white;
                    border: 1px solid #555;
                    border-radius: 4px;
                    padding: 10px;
                    margin-bottom: 10px;
                }
                #send-button {
                    background-color: #007acc;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 10px;
                    cursor: pointer;
                }
                #send-button:hover {
                    background-color: #005a9e;
                }
            </style>
        </head>
        <body>
            <div id="chat-container">
                <textarea id="chat-input" rows="4" cols="50"></textarea>
                <button id="send-button">Send</button>
            </div>
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();

                    function addChatBubble(text, className) {
                        const chatMessages = document.getElementById('chat-messages');
                        const bubble = document.createElement('div');
                        bubble.className = \`chat-bubble \${className}\`;
                        bubble.textContent = text;
                        chatMessages.appendChild(bubble);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }

                    document.getElementById('send-button').addEventListener('click', () => {
                        const input = document.getElementById('chat-input').value;
                        if (input.trim()) {
                            addChatBubble(input, 'user');
                            vscode.postMessage({
                                command: 'query',
                                text: input
                            });
                            document.getElementById('chat-input').value = '';
                        }
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;

                        switch (message.command) {
                            case 'response':
                                addChatBubble(message.text, 'assistant');
                                break;
                        }
                    });
                })();
            </script>
        </body>
        </html>`;
    }

    private _queryApi(text: string) {
        // Implement the logic to query the external API here
        console.log(`Querying API with text: ${text}`);
    }
}
