import * as vscode from "vscode";
import { ViewKey } from "./views";
import { registerView } from "./registerView";
import {
  Message,
  ViewApi,
  ViewApiError,
  ViewApiEvent,
  ViewApiRequest,
  ViewApiResponse,
  ViewEvents,
} from "./viewApi";
// import fs from "node:fs/promises";
import { SessionManager } from "./sessionManager";

export const activate = async (ctx: vscode.ExtensionContext) => {
  const connectedViews: Partial<Record<ViewKey, vscode.WebviewView>> = {};

  console.log("raider: ", ctx.storageUri || "no uri???");
  console.log("raider: ", ctx.storageUri?.path || "no path???");
  console.log("raider: ", ctx.storageUri?.fsPath || "no fspath???");

  const sessionManager = new SessionManager(ctx.storageUri?.fsPath || "");

  // const messages = [] as Message[];

  // const currentSessionId = uuid

  const triggerEvent = <E extends keyof ViewEvents>(
    key: E,
    ...params: Parameters<ViewEvents[E]>
  ) => {
    Object.values(connectedViews).forEach((view) => {
      view.webview.postMessage({
        type: "event",
        key,
        value: params,
      } as ViewApiEvent<E>);
    });
  };

  const api: ViewApi = {
    // getFileContents: async () => {
    //   const uris = await vscode.window.showOpenDialog({
    //     canSelectFiles: true,
    //     canSelectFolders: false,
    //     canSelectMany: false,
    //     openLabel: "Select file",
    //     title: "Select file to read",
    //   });

    //   if (!uris?.length) {
    //     return "";
    //   }

    //   const contents = await fs.readFile(uris[0].fsPath, "utf-8");
    //   return contents;
    // },
    // showExampleViewB: () => {
    //   connectedViews?.raiderTerminal?.show?.(true);
    //   vscode.commands.executeCommand(`raiderTerminal.focus`);
    // },
    // sendMessageToExampleB: (msg: string) => {
    //   triggerEvent("exampleBMessage", msg);
    // },
    sendMessage: (msg: Message) => {
      sessionManager.getCurrentSession().message(msg.role, msg.content);
    },
    getMessages: () => {
      return sessionManager.getCurrentSession().messages;
    },
    // resetMessageHistory: () => {
    //   messages.length = 0;
    // },
    // getResetCommand: () => {
    //   console.log("reset");
    // },
    openSessionChat: async (sessionId: string) => {
      sessionManager.openSession(sessionId);
      triggerEvent("sendMessages", sessionManager.getCurrentSession().messages);
    },
  };

  const isViewApiRequest = <K extends keyof ViewApi>(
    msg: unknown
  ): msg is ViewApiRequest<K> =>
    msg != null &&
    typeof msg === "object" &&
    "type" in msg &&
    msg.type === "request";

  const registerAndConnectView = async <V extends ViewKey>(key: V) => {
    const view = await registerView(ctx, key);
    connectedViews[key] = view;
    const onMessage = async (msg: Record<string, unknown>) => {
      if (!isViewApiRequest(msg)) {
        return;
      }
      try {
        // @ts-expect-error
        const val = await Promise.resolve(api[msg.key](...msg.params));
        const res: ViewApiResponse = {
          type: "response",
          id: msg.id,
          value: val,
        };
        view.webview.postMessage(res);
      } catch (e: unknown) {
        const err: ViewApiError = {
          type: "error",
          id: msg.id,
          value:
            e instanceof Error ? e.message : "An unexpected error occurred",
        };
        view.webview.postMessage(err);
      }
    };

    view.webview.onDidReceiveMessage(onMessage);
  };

  registerAndConnectView("raiderChat");
  // registerAndConnectView("raiderTerminal");

  vscode.commands.registerCommand("raider.reset", () => {
    sessionManager.getCurrentSession().reset();
    console.log("raider.reset called");
    triggerEvent("sendMessages", sessionManager.getCurrentSession().messages);
  });

  vscode.commands.registerCommand("raider.chat", () => {
    // TODO
    console.log("raider.chat called");
    triggerEvent("showChatPage");
  });

  vscode.commands.registerCommand("raider.history", () => {
    // TODO
    console.log("raider.history called");
    triggerEvent("showHistoryPage");
  });

  vscode.commands.registerCommand("raider.settings", () => {
    // TODO
    console.log("raider.settings called");
    triggerEvent("showSettingsPage");
  });
};

export const deactivate = () => {
  return;
};
