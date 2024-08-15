import * as vscode from 'vscode';
import { ReactProvider } from "./panel";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'chatView',
            new ReactProvider(context.extensionUri)
        )
    );
}


export function deactivate() { }
