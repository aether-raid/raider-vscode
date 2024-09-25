import * as vscode from "vscode";
import { ViewKey } from "./views";
import { registerView } from "./registerView";
import {
  Message,
  SearchResult,
  ViewApi,
  ViewApiError,
  ViewApiEvent,
  ViewApiRequest,
  ViewApiResponse,
  ViewEvents,
} from "./viewApi";
// import fs from "node:fs/promises";
import { SessionManager } from "./sessionManager";
import { CodebaseManager } from "./codebaseManager";
import { startPythonServer } from "./pythonServer";
import path from "path";

export const activate = async (ctx: vscode.ExtensionContext) => {
  const connectedViews: Partial<Record<ViewKey, vscode.WebviewView>> = {};

  console.log("raider: ", ctx.storageUri || "no uri???");
  console.log("raider: ", ctx.storageUri?.path || "no path???");
  console.log("raider: ", ctx.storageUri?.fsPath || "no fspath???");

  const sessionManager = new SessionManager(ctx.storageUri?.fsPath || "");
  const codebaseManager = new CodebaseManager(ctx.storageUri?.fsPath || "");

  let currentPage = "chat";

  const pythonConfig = vscode.workspace.getConfiguration("python");
  const pythonPath = pythonConfig.get<string>("pythonPath");

  if (pythonPath) {
    const pythonServer = startPythonServer(
      pythonPath,
      path.join(ctx.extensionPath, "dummy-server")
    );
  }

  // let pythonServer = startPythonServer();

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
    sendMessage: (msg: Message) => {
      sessionManager.getCurrentSession().message(msg.role, msg.content);
    },
    getMessages: () => {
      return sessionManager.getCurrentSession().messages;
    },
    getSessions: () => {
      return sessionManager.export();
    },
    resetMessageHistory: () => {
      sessionManager.getCurrentSession().reset();
      triggerEvent("sendMessages", sessionManager.getCurrentSession().messages);
    },
    newSession: () => {
      console.log("new session???");
      triggerEvent("showPage", "chat");
      currentPage = "chat";
      sessionManager.openSession();
    },
    deleteSession: (sessionId: string) => {
      console.log("delete", sessionId);
      sessionManager.deleteSession(sessionId);
      triggerEvent("sendHistory", sessionManager.export());
    },
    openSessionChat: async (sessionId: string) => {
      sessionManager.openSession(sessionId);
      triggerEvent("showPage", "chat");
      currentPage = "chat";
      triggerEvent("sendMessages", sessionManager.getCurrentSession().messages);
    },

    getCodebases: () => {
      return codebaseManager.codebases.map((c) => c.uri);
    },

    openAddCodebase: async () => {
      const uris = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select folder",
        title: "Select folder",
      });

      if (uris?.length) codebaseManager.add(uris[0].fsPath);
    },

    removeCodebase(uri: string) {
      codebaseManager.remove(uri);
    },

    async search(query: string): Promise<SearchResult[]> {
      // TODO: query
      function shuffle<T>(array: T[]) {
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {
          // Pick a remaining element...
          let randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;

          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
          ];
        }
      }

      let results = [
        {
          type: "github",
          name: "codebase 1",
          url: "https://github.com/microsoft/vscode",
        },
        {
          type: "gitlab",
          name: "codebase 2",
          url: "https://gitlab.com/gitlab-org/gitlab",
        },
        {
          type: "bitbucket",
          name: "codebase 3",
          url: "https://bitbucket.io/hello/world",
        },
        {
          type: "gitee",
          name: "codebase 4",
          url: "https://gitee.com/woodywrx/pity",
        },
      ] as SearchResult[];

      shuffle(results);

      return results.slice(0, Math.max(1, Math.ceil(Math.random() * 5)));
    },

    navigateTo: (
      page: "chat" | "history" | "codebases" | "settings" | "search"
    ) => {
      console.log("navigate to", page, "called");
      triggerEvent("showPage", page);
      currentPage = page;
    },
    renderMarkdown: async (text: string) => {
      return (await vscode.commands.executeCommand(
        "markdown.api.render",
        text
      )) as string;
    },

    openInNewWindow: (dir: string) => {
      console.log("raider: open in new window", dir);
      vscode.commands.executeCommand(
        "vscode.openFolder",
        vscode.Uri.file(dir),
        true
      );
    },

    writeToClipboard: (text: string) => {
      vscode.env.clipboard.writeText(text);
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

  // vscode.commands.registerCommand("raider.reset", () => {
  //   sessionManager.getCurrentSession().reset();
  //   console.log("raider.reset called");
  //   triggerEvent("sendMessages", sessionManager.getCurrentSession().messages);
  // });

  vscode.commands.registerCommand("raider.new", () => {
    triggerEvent("showPage", "chat");
    currentPage = "chat";
    sessionManager.openSession();
  });

  type Page = "chat" | "history" | "codebases" | "settings" | "search";

  let pages: Page[] = ["chat", "history", "codebases", "settings"];

  pages.forEach((page) => {
    vscode.commands.registerCommand(`raider.${page}`, () => {
      // TODO
      console.log(`raider.${page} called`);
      console.log(page, "cooked");
      triggerEvent("showPage", page);
      currentPage = page;
    });
  });

  ctx.subscriptions.push({
    dispose: () => {
      pythonServer.kill();
    },
  });
};

export const deactivate = () => {
  return;
};
