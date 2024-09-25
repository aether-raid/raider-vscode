import { spawn } from "child_process";

export function startPythonServer(
  pythonPath: string = "python",
  cwd: string = "./dummy-server"
) {
  const pythonProcess = spawn(pythonPath, ["app.py"], {
    cwd: cwd,
  });

  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python server output: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python server error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`Python server exited with code ${code}`);
  });

  return pythonProcess;
}
