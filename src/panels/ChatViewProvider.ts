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
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

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
            <script src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}
