import fs from "node:fs/promises";
import path from "node:path";
import { exists } from "./util";
// import cp from "child_process";

export class Codebase {
  uri: string;
  type: "local" | "github" | "gitlab" | "bitbucket" | "sourceforge" | "gitee";

  constructor(
    uri: string,
    type:
      | "local"
      | "github"
      | "gitlab"
      | "bitbucket"
      | "sourceforge"
      | "gitee"
      | null = null
  ) {
    if (type === null) {
      if (uri.includes("github.com")) {
        type = "github";
      } else if (uri.includes("gitlab.com")) {
        type = "gitlab";
      } else if (uri.includes("bitbucket.io")) {
        type = "bitbucket";
      } else if (uri.includes("sourceforge.net")) {
        type = "sourceforge";
      } else if (uri.includes("gitee.com")) {
        type = "gitee";
      } else type = "local";
    }
    this.uri = uri;
    this.type = type;
  }
}

export class LocalCodebase extends Codebase {
  type = "local" as "local";

  constructor(uri: string | LocalCodebase) {
    super(typeof uri === "string" ? uri : uri.uri, "local");
  }

  // async hasGit(): Promise<boolean> {
  //   return await exists(path.join(this.uri, ".git"));
  // }

  // async initGit() {
  //   if (!(await this.hasGit())) {
  //     cp.exec(
  //       `git init`,
  //       {
  //         cwd: this.uri,
  //       },
  //       (err, stdout, stderr) => {
  //         if (err) {
  //           console.log(err);
  //           return false;
  //         }
  //         console.log(stdout);
  //         console.log(stderr);
  //         return true;
  //       }
  //     );
  //   }
  // }
}

export type CodebaseManagerData = {
  codebases: string[];
  storagePath: string;
  jsonPath: string;
};

export class CodebaseManager {
  codebases: LocalCodebase[] = [];
  storagePath: string;
  jsonPath: string;

  constructor(storagePath: string) {
    this.codebases = [];

    this.storagePath = path.join(storagePath, ".raider");
    this.jsonPath = path.join(this.storagePath, "codebases.json");

    exists(this.storagePath).then(async (flag) => {
      if (!flag) {
        await fs.mkdir(this.storagePath);
      }

      let flag2 = await exists(this.jsonPath);

      if (flag2) {
        // file exists
        let data = await fs.readFile(this.jsonPath, "utf8");
        let codebases = JSON.parse(data) as CodebaseManagerData;
        this.codebases = codebases.codebases.map(
          (uri: string) => new LocalCodebase(uri)
        );
        this.storagePath = codebases.storagePath;
        this.jsonPath = codebases.jsonPath;
      } else {
        await fs.writeFile(
          this.jsonPath,
          JSON.stringify({
            codebases: [] as string[],
            storagePath: this.storagePath,
            jsonPath: this.jsonPath,
          } as CodebaseManagerData),
          "utf8"
        );
      }
    });
  }

  add(uri: string) {
    let codebase = new LocalCodebase(uri);
    this.codebases.push(codebase);
    // codebase.initGit();
  }

  export(): CodebaseManagerData {
    return {
      codebases: this.codebases.map((it) => it.uri),
      storagePath: this.storagePath,
      jsonPath: this.jsonPath,
    };
  }

  async save(): Promise<boolean> {
    try {
      await fs.writeFile(this.jsonPath, JSON.stringify(this.export()), "utf8");
      return true;
    } catch {
      return false;
    }
  }
}
