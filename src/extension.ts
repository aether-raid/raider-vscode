import * as vscode from 'vscode';
import {ChatPanel} from "./panels/ChatPanel";

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.openChat', () => {
        ChatPanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}


export function deactivate() { }
