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

export const activate = async (ctx: vscode.ExtensionContext) => {
  const connectedViews: Partial<Record<ViewKey, vscode.WebviewView>> = {};

  console.log("raider: ", ctx.storageUri || "no uri???");
  console.log("raider: ", ctx.storageUri?.path || "no path???");
  console.log("raider: ", ctx.storageUri?.fsPath || "no fspath???");

  const sessionManager = new SessionManager(ctx.storageUri?.fsPath || "");
  const codebaseManager = new CodebaseManager(ctx.storageUri?.fsPath || "");

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
    getSessions: () => {
      return sessionManager.export();
    },
    // resetMessageHistory: () => {
    //   messages.length = 0;
    // },
    // getResetCommand: () => {
    //   console.log("reset");
    // },
    newSession: () => {
      console.log("new session???");
      triggerEvent("showPage", "chat");
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

  vscode.commands.registerCommand("raider.reset", () => {
    sessionManager.getCurrentSession().reset();
    console.log("raider.reset called");
    triggerEvent("sendMessages", sessionManager.getCurrentSession().messages);
  });

  vscode.commands.registerCommand("raider.new", () => {
    triggerEvent("showPage", "chat");
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
    });
  });

  // vscode.commands.registerCommand("raider.chat", () => {
  //   // TODO
  //   console.log("raider.chat called");
  //   triggerEvent("showChatPage");
  // });

  // vscode.commands.registerCommand("raider.history", () => {
  //   // TODO
  //   console.log("raider.history called");
  //   triggerEvent("showHistoryPage");
  // });

  // vscode.commands.registerCommand("raider.settings", () => {
  //   // TODO
  //   console.log("raider.settings called");
  //   triggerEvent("showSettingsPage");
  // });
};

export const deactivate = () => {
  return;
};
