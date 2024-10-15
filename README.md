# Raider Chat

This repository contains the preliminary codebase for the [Raider Chat VS Code Extension](https://marketplace.visualstudio.com/items?itemName=thepyprogrammer.raider-chat).

This system is built on the tremendous boilerplate assembled in [`sfc-gh-tkojima/vscode-react-webviews`](https://github.com/sfc-gh-tkojima/vscode-react-webviews) to run React on VS Code Web Views.

It interfaces directly with the [`sikfeng/raider-backend`](https://github.com/sikfeng/raider-backend) backend and [`ThePyProgrammer/web-raider`](https://github.com/ThePyProgrammer/web-raider) package.

## Overview of Extension

Raider Chat currently houses a single view on the sidebar. The plane "🛦" on the sidebar represents the extension.

The extension contains the following pages:

- **Chat**: A proper chatbox to ask questions to the backend, and get outputs. Takes ~2-3 minutes for the entire output to show up (no streaming supported)
- **Codebases**: Add and delete existing local codebases for the system to refer to. The floating action button can lead you to the Search page.
  - **Search**: Search for existing codebases. Takes ~10 minutes to generate all the search outputs.
- **History**: Maintains session history (note it resets everytime you restart because File I/O).
- **Settings**: Non-functional page. Please ignore.
