import * as vscode from 'vscode';
import {ChatViewProvider} from "./panels/ChatViewProvider";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'chatView',
            new ChatViewProvider(context.extensionUri)
        )
    );
}


export function deactivate() { }
