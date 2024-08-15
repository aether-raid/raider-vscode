import * as vscode from 'vscode';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'chatView';

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'query':
                        webviewView.webview.postMessage({
                            command: 'response',
                            text: 'I am a friendly assistant'
                        });
                        return;
                }
            },
            null,
            []
        );
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

            </style>
        </head>
        <body>
            <div id="chat-container">
                <div id="chat-messages"></div>
                <textarea id="chat-input" rows="2" cols="50"></textarea>
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
}
