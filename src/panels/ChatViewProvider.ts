import * as vscode from 'vscode';
import { ChatPanel } from './ChatPanel';

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
                        ChatPanel.createOrShow(this._extensionUri);
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
