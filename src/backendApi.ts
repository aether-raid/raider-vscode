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

export type Request = {
  main_repo_dir: string;
  method:
    | "init_agent_manager"
    | "init_external_repo_agent"
    | "get_external_repo_agents"
    | "generate_subtasks"
    | "run_subtask"
    | "generate_commands"
    | "undo"
    | "shutdown";
  params?:
    | InitAgentManagerParams
    | InitExternalRepoParams
    | GenerateSubtasksParams
    | RunSubtaskParams;
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
          resolve(this.currentGeneration);
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
      console.log("raider-chat pinged off");
      return;
    }
    // if (isEquivalent(message, keepAlivePing)) return;
    if ("<END_OF_MESSAGE>" in message) {
      //|| isEquivalent(message, endOfMessageResponse)) {
      console.log("raider-chat end of message hit woohoo");
      self.responding = false;
      self.expectingResponse = false;
      return;
    }

    console.log("raider-chat it survived! it SURVIVED!!!!!!!!!!!!");

    self.responding = true;
    if ("error" in message) {
      self.currentGeneration += message["error"] as string;
    } else if ("result" in message) {
      self.currentGeneration += message["result"] as string;
    }
  }

  async sendMsg(
    method:
      | "init_agent_manager"
      | "init_external_repo_agent"
      | "get_external_repo_agents"
      | "generate_subtasks"
      | "run_subtask"
      | "generate_commands"
      | "undo"
      | "shutdown",
    params:
      | InitAgentManagerParams
      | InitExternalRepoParams
      | GenerateSubtasksParams
      | RunSubtaskParams
      | undefined = undefined
  ): Promise<string> {
    if (this.ws === null) throw Error("raider: oi you're disconnected cibai");
    console.log(`ws is not null, running ${method}`);
    await this.currentPromise;
    console.log(`awaiting current promise which never closed!`);
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
    let response = await this.sendMsg("get_external_repo_agents");
    return JSON.parse(response || "[]") as string[];
  }

  async generateSubtasks(objective: string): Promise<string[]> {
    let response = await this.sendMsg("generate_subtasks", { objective });
    return JSON.parse(response || "[]") as string[];
  }

  async runSubtask(subtask: string) {
    return await this.sendMsg("run_subtask", { subtask });
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
