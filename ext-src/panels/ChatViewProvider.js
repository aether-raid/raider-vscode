"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatViewProvider = void 0;
const vscode = __importStar(require("vscode"));
class ChatViewProvider {
    _extensionUri;
    static viewType = 'chatView';
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'media')]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'query':
                    webviewView.webview.postMessage({
                        command: 'response',
                        text: 'I am a friendly assistant'
                    });
                    return;
            }
        }, null, []);
    }
    _getHtmlForWebview(webview) {
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
exports.ChatViewProvider = ChatViewProvider;
//# sourceMappingURL=ChatViewProvider.js.map