import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";

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
    | "init_external_repo_agent"
    | "get_external_repo_agents"
    | "generate_subtasks"
    | "run_subtask"
    | "generate_commands"
    | "undo"
    | "shutdown";
  params?: InitExternalRepoParams | GenerateSubtasksParams | RunSubtaskParams;
};

const keepAlivePing = {
  "<PING>": "",
};

const endOfMessageResponse = {
  "<END_OF_MESSAGE>": "",
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

    this.ws.on("open", this.onOpen);
    this.ws.on("close", this.onClose);
    this.ws.on("message", this.processMessage);
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

  async sendMsg(
    method:
      | "init_external_repo_agent"
      | "get_external_repo_agents"
      | "generate_subtasks"
      | "run_subtask"
      | "generate_commands"
      | "undo"
      | "shutdown",
    params:
      | InitExternalRepoParams
      | GenerateSubtasksParams
      | RunSubtaskParams
      | undefined = undefined
  ): Promise<string> {
    if (this.ws === null) return "";
    await this.currentPromise;
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

  async initExternalRepo(
    repoDir: string,
    modelName: string = "azure/gpt4o",
    timeout: number = 20
  ) {
    await this.sendMsg("init_external_repo_agent", {
      repo_dir: repoDir,
      model_name: modelName,
      timeout,
    } as InitExternalRepoParams);
  }

  async getExternalRepoAgents(): Promise<string> {
    return await this.sendMsg("get_external_repo_agents");
  }

  async generateSubtasks(objective: string): Promise<string[]> {
    let response = await this.sendMsg("generate_subtasks", { objective });
    return JSON.parse(response) as string[];
  }

  async runSubtask(subtask: string) {
    return await this.sendMsg("run_subtask", { subtask });
  }

  processMessage(message: string) {
    let partialResponseData = JSON.parse(message);

    if (partialResponseData == keepAlivePing) return;
    if (partialResponseData == endOfMessageResponse) {
      this.responding = false;
      this.expectingResponse = false;
    }

    this.responding = true;
    if ("error" in partialResponseData) {
      this.currentGeneration += partialResponseData["error"] as string;
    } else if ("result" in partialResponseData) {
      this.currentGeneration += partialResponseData["result"] as string;
    }
  }

  onOpen() {
    console.log(`Connected to ${this.serverRoute()}`);
    this.isOpen = true;
  }

  onClose() {
    console.log("Disconnected from server");
    this.isOpen = false;
    this.onCloseAction();
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
