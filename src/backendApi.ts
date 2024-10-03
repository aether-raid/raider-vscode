import WebSocket, { RawData } from "ws";
import { v4 as uuidv4 } from "uuid";

export type InitAgentManagerParams = {
  timeout?: number;
};

export type InitExternalRepoParams = {
  repo_dir: string;
  model_name?: string;
  timeout?: number;
};

export type GenerateSubtasksParams = {
  objective: string;
};

export type RunSubtaskParams = {
  subtask: string;
};

export type ToggleExternalRepoParams = {
  agent_id: string;
};

export type WebRaiderQueryParams = {
  user_query: string;
};

export type RequestMethod =
  | "init_agent_manager"
  | "init_external_repo_agent"
  | "get_external_repo_agents"
  | "generate_subtasks"
  | "run_subtask"
  | "generate_commands"
  | "disable_external_repo_agent"
  | "enable_external_repo_agent"
  | "query"
  | "undo"
  | "shutdown";

export type RequestParams =
  | InitAgentManagerParams
  | InitExternalRepoParams
  | GenerateSubtasksParams
  | RunSubtaskParams
  | ToggleExternalRepoParams
  | WebRaiderQueryParams;

export type Request = {
  main_repo_dir: string;
  method: RequestMethod;
  params?: RequestParams;
};

export type Subtask = {
  task_type: "User action" | "Command execution" | "Coding";
  task_body: string;
};

export type WebRaiderResult = {
  type: "github" | "gitlab" | "bitbucket" | "gitee";
  name: string;
  url: string;
};

export class Backend {
  sessionId: string;
  workspaceDir: string;

  isOpen: boolean = false;

  serverPort: number = 10000;

  expectingResponse: boolean = false;
  responding: boolean = false;

  currentGeneration: string = "";

  currentPromise: Promise<string> | null = null;

  onCloseAction: () => void = () => {};

  onMessageAction: (self: this, message: any) => void = (_, __) => {};

  serverRoute(): string {
    return `ws://localhost:${this.serverPort}/ws/${this.sessionId}`;
  }

  ws: WebSocket | null = null;

  constructor(workspaceDir: string, onCloseAction = () => {}) {
    this.sessionId = uuidv4();
    this.workspaceDir = workspaceDir;
    this.start();
    this.onCloseAction = onCloseAction;
  }

  start() {
    this.isOpen = false;
    this.expectingResponse = false;
    this.responding = false;
    this.currentGeneration = "";
    this.currentPromise = null;

    this.ws = new WebSocket(this.serverRoute());

    let _self = this;

    this.ws.on("open", () => {
      this.onOpen(_self);
    });
    this.ws.on("close", () => {
      this.onClose(_self);
    });
    this.ws.on("message", (data: RawData) => {
      console.log(`raider-chat 0: ${data}`);

      function processData(data: any) {
        return JSON.parse(
          Object.getOwnPropertyNames(data)
            .map((value) => {
              return String.fromCharCode(data[value]);
            })
            .join("") || "{}"
        );
      }

      this.processMessage(_self, processData(data));
    });
  }

  createPromise(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      setInterval(() => {
        if (!this.expectingResponse && !this.responding) {
          let generation = this.currentGeneration;
          this.currentGeneration = "";
          resolve(generation);
        }
      }, 1000);
    });
  }

  processMessage(self: this, message: any) {
    console.log(
      `raider-chat 3: ${message} ${Object.getOwnPropertyNames(
        message
      )} ${typeof message}`
    );

    let propertyNames = Object.getOwnPropertyNames(message);
    propertyNames.forEach((value) => {
      console.log(`raider-chat 3: ${value} ${message[value]}`);
    });

    if ("<PING>" in message) {
      console.log("raider-chat pinged");
      return;
    }
    // if (isEquivalent(message, keepAlivePing)) return;
    if ("<END_OF_MESSAGE>" in message) {
      //|| isEquivalent(message, endOfMessageResponse)) {
      console.log("raider-chat end of message hit woohoo");
      console.log(`raider-chat generated shit malig ${self.currentGeneration}`);
      self.responding = false;
      self.expectingResponse = false;
      return;
    }

    console.log("raider-chat it survived! it SURVIVED!!!!!!!!!!!!");

    self.responding = true;

    self.onMessageAction(self, message);

    // if ("error" in message) {
    //   self.currentGeneration = message["error"] as string;
    // } else if ("result" in message) {
    //   console.log(`messaging ${message["result"]} ${typeof message["result"]}`);
    //   self.currentGeneration = JSON.stringify(message["result"]);
    // }
  }

  async sendMsg(
    method: RequestMethod,
    params: RequestParams | undefined = undefined,
    onMessageAction: (self: this, message: any) => void = (_, __) => {}
  ): Promise<string> {
    if (this.ws === null) throw Error("raider-chat: disconnected!");
    console.log(`raider-chat: ws is not null, running ${method}`);
    await this.currentPromise;
    console.log(`raider-chat: awaited previous promise which never closed!`);
    this.onMessageAction = onMessageAction;
    this.ws.send(
      JSON.stringify({
        main_repo_dir: this.workspaceDir,
        method,
        params,
      } as Request)
    );
    this.expectingResponse = true;
    this.currentPromise = this.createPromise();
    return await this.currentPromise;
  }

  async initAgentManager(timeout: number = 60) {
    await this.sendMsg("init_agent_manager", {
      timeout,
    } as InitAgentManagerParams);
  }

  async initExternalRepo(
    repoDir: string,
    modelName: string = "azure/gpt4o",
    timeout: number = 60
  ) {
    console.log(`raider init external repo ${repoDir}`);
    await this.sendMsg("init_external_repo_agent", {
      repo_dir: repoDir,
      model_name: modelName,
      timeout,
    } as InitExternalRepoParams);
  }

  async getExternalRepoAgents(): Promise<string[]> {
    let response = await this.sendMsg(
      "get_external_repo_agents",
      undefined,
      (self, message) => {
        if ("error" in message) {
          self.currentGeneration = JSON.stringify(message["error"]);
        } else if ("result" in message) {
          console.log(
            `messaging ${message["result"]} ${typeof message["result"]}`
          );
          self.currentGeneration = JSON.stringify(message["result"]);
        }
      }
    );
    return JSON.parse(response || "[]") as string[];
  }

  async disableExternalRepoAgent(agent_id: string): Promise<void> {
    await this.sendMsg("disable_external_repo_agent", {
      agent_id,
    } as ToggleExternalRepoParams);
  }

  async enableExternalRepoAgent(agent_id: string): Promise<void> {
    await this.sendMsg("enable_external_repo_agent", {
      agent_id,
    } as ToggleExternalRepoParams);
  }

  async webRaiderQuery(user_query: string): Promise<WebRaiderResult[]> {
    let response = await this.sendMsg(
      "query",
      { user_query },
      (self, message) => {
        if ("error" in message) {
          self.currentGeneration = JSON.stringify(message["error"]);
        } else if ("result" in message) {
          console.log(
            `messaging ${message["result"]} ${typeof message["result"]}`
          );
          self.currentGeneration = JSON.stringify(message["result"]);
        }
      }
    );
    console.log(
      `${response} ${typeof response} ${JSON.stringify(response)} ${JSON.parse(
        response || "[]"
      )}`
    );
    return JSON.parse(response || "[]") as WebRaiderResult[];
  }

  async generateSubtasks(objective: string): Promise<Subtask[]> {
    let response = await this.sendMsg(
      "generate_subtasks",
      { objective },
      (self, message) => {
        if ("error" in message) {
          self.currentGeneration = JSON.stringify(message["error"]);
        } else if ("result" in message) {
          console.log(
            `messaging ${message["result"]} ${typeof message["result"]}`
          );
          self.currentGeneration = JSON.stringify(message["result"]);
        }
      }
    );
    return JSON.parse(response || "[]") as Subtask[];
  }

  async runSubtask(
    subtask: string,
    onChunk: (chunk: string) => void = () => {}
  ): Promise<string> {
    return await this.sendMsg("run_subtask", { subtask }, (self, message) => {
      if ("error" in message) {
        self.currentGeneration += JSON.stringify(message["error"]);
      } else if ("result" in message) {
        console.log(
          `messaging ${message["result"]} ${typeof message["result"]}`
        );
        self.currentGeneration += JSON.stringify(message["result"]);
        onChunk(JSON.stringify(message["result"]));
      }
    });
  }

  onOpen(self: this) {
    self.isOpen = true;
    console.log(`Connected to server`);
    self.initAgentManager();
  }

  onClose(self: this) {
    self.isOpen = false;
    self.onCloseAction();
    console.log("Disconnected from server");
    this.ws = null;
  }

  async open() {
    await new Promise<void>((resolve, reject) => {
      setInterval(() => {
        if (this.isOpen) resolve();
      });
    });
  }

  async close() {
    await this.sendMsg("shutdown");
    await new Promise<void>((resolve, reject) => {
      setInterval(() => {
        if (!this.isOpen) resolve();
      });
    });
  }
}
