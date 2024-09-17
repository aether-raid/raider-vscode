import { v4 as uuid4 } from "uuid";
import fs from "node:fs/promises";
import path from "node:path";
import { Message } from "./viewApi";

async function exists(path: string): Promise<boolean> {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
}

export class SessionNotFoundError extends Error {
  sessionId: string;
  constructor(sessionId: string) {
    super(`${sessionId} not found.`);

    this.sessionId = sessionId;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, SessionNotFoundError.prototype);
  }
}

export type SessionData = {
  messages: Message[];
  id: string;
};

export class Session {
  static storageDir: string = "";

  readonly id: string;
  messages: Message[];

  fileExists: boolean;
  savedToFile: boolean;

  constructor(id: string) {
    this.id = id;
    this.messages = [];

    this.fileExists = false;
    this.savedToFile = false;

    this.read().then((data) => {
      if (data !== null) {
        this.messages = data.messages;
        this.savedToFile = true;
      }
    });
  }

  length(): number {
    return this.messages.length;
  }

  reset(): boolean {
    this.messages.length = 0;
    return this.messages.length === 0;
  }

  message(role: string, content: string) {
    this.messages.push({ role, content });
  }

  static async setStorage(dir: string): Promise<boolean> {
    dir = path.join(dir, ".raider");
    let flag = await exists(dir);
    if (!flag) {
      await fs.mkdir(dir);
    }

    this.storageDir = dir;
    return this.storageDir == dir;
  }

  getFilePath(): string {
    return path.join(Session.storageDir, `${this.id}.json`);
  }

  async read(): Promise<SessionData | null> {
    let filePath = this.getFilePath();
    let flag = await exists(filePath);
    if (flag) {
      let sessionData = JSON.parse(
        await fs.readFile(filePath, "utf8")
      ) as SessionData;
      return sessionData;
    }
    return null;
  }

  setMessages(messages: Message[]) {
    let changed =
      messages.length === this.messages.length &&
      this.messages.every(
        (message, index) =>
          message.role === messages[index].role &&
          message.content === messages[index].content
      );
    this.savedToFile = this.savedToFile && changed;
    if (!changed) this.messages = messages;
  }

  async save(): Promise<boolean> {
    try {
      await fs.writeFile(
        this.getFilePath(),
        JSON.stringify({ id: this.id, messages: this.messages }),
        "utf8"
      );
      this.fileExists = true;
      this.savedToFile = true;
      return true;
    } catch {
      return false;
    }
  }
}

export type SessionManagerData = {
  sessions: string[];
  currentSession: string | null;
  storagePath: string;
  jsonPath: string;
};

export class SessionManager {
  sessions = {} as { [index: string]: Session };
  currentSession: string | null = null;

  storagePath: string;
  jsonPath: string;

  constructor(storagePath: string) {
    this.storagePath = path.join(storagePath, ".raider");
    this.jsonPath = path.join(this.storagePath, "sessions.json");

    exists(this.storagePath).then(async (flag) => {
      if (flag) {
        let flag2 = await exists(this.jsonPath);

        if (flag2) {
          // file exists
          let data = await fs.readFile(this.jsonPath, "utf8");
          let sessions = JSON.parse(data) as SessionManagerData;
          this.sessions = sessions.sessions
            .map((it) => new Session(it))
            .reduce(
              (prev, it) => ({
                ...prev,
                [it.id]: it,
              }),
              {} as { [index: string]: Session }
            );
          this.currentSession = sessions.currentSession;
          this.storagePath = sessions.storagePath;
          this.jsonPath = sessions.jsonPath;
        } else {
          // files does not exist, but folder does
          await fs.writeFile(
            this.jsonPath,
            JSON.stringify({
              sessions: [],
              currentSession: null,
              storagePath: this.storagePath,
              jsonPath: this.jsonPath,
            }),
            "utf8"
          );
        }
      } else {
        // folder itself does not exist
        await fs.mkdir(this.storagePath);
        await fs.writeFile(
          this.jsonPath,
          JSON.stringify({
            sessions: [],
            currentSession: null,
            storagePath: this.storagePath,
            jsonPath: this.jsonPath,
          }),
          "utf8"
        );
      }
    });
  }

  getSessionIds(): string[] {
    return Object.keys(this.sessions);
  }

  numSessions(): number {
    return this.getSessionIds().length;
  }

  getCurrentSession(): Session {
    if (this.currentSession) {
      return this.sessions[this.currentSession];
    } else {
      let ids = this.getSessionIds();
      if (ids.length > 0) {
        this.currentSession = ids[ids.length - 1];
        return this.sessions[this.currentSession];
      } else {
        let sessionId = this.newSession();
        this.currentSession = sessionId;
        return this.sessions[sessionId];
      }
    }
  }

  openSession(sessionId: string = "") {
    if (sessionId.length == 0) {
      sessionId = this.newSession();
    } else if (!this.isSession(sessionId)) {
      this.newSession(sessionId);
    }
    this.currentSession = sessionId;
  }

  newSession(sessionId: string = ""): string {
    // let sessionId: string;
    if (sessionId.length == 0) {
      while ((sessionId = uuid4()) in this.sessions) {}
    }
    this.sessions[sessionId] = new Session(sessionId);
    return sessionId;
  }

  isSession(sessionId: string): boolean {
    return sessionId in this.sessions;
  }

  getSession(sessionId: string): Message[] {
    if (this.isSession(sessionId)) {
      return this.sessions[sessionId].messages;
    } else {
      throw new SessionNotFoundError(sessionId);
    }
  }
}
