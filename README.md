# AI Assistant Demo

This is a demonstration of an AI-powered note-taking and chat application, inspired by the functionality of tools like Obsidian and powered by the Google Gemini API. The application can be run as a standalone web app or bundled as a plugin for Obsidian.

## Features

*   **Note Management**: Create, edit, and delete markdown notes.
*   **AI-Powered Chat with Multiple Agents**:
    *   **Smart Chat**: Engage in context-aware conversations, with the AI remembering previous parts of the chat.
    *   **Answer from Notes (RAG)**: Ask questions and get answers sourced directly from the content of your notes using Retrieval-Augmented Generation.
    *   **Web Search**: Leverage Google Search for up-to-date information on recent events and topics.
*   **Semantic Search**: Utilizes a simple vector-based search to find the most relevant notes or chat history related to your query.
*   **Dual Mode**: The codebase is structured to work both as a standalone web application and as an Obsidian plugin.

## Tech Stack

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **AI**: Google Gemini API (`@google/genai`)
*   **Plugin Environment**: Obsidian API

## How to Use

### Running the Standalone Web App

This application is designed to be run in a web-based development environment where environment variables can be configured.

1.  **API Key**: You need a Google Gemini API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  **Environment Variable**: Set up an environment variable named `API_KEY` with your Gemini API key. The application reads the key from `process.env.API_KEY`.
3.  Once the environment is set up, the application should run automatically.

### Installing as an Obsidian Plugin

1.  **Build the Plugin**: You will need to build the project first. This typically involves running `npm install` to install dependencies and `npm run build` to compile the TypeScript code into JavaScript.
2.  **Create Plugin Folder**: In your Obsidian vault, go to the `.obsidian/plugins/` directory and create a new folder named `ai-obsidian-demo`.
3.  **Copy Files**: Copy the built files (`main.js`, `manifest.json`, `styles.css`) into the `ai-obsidian-demo` folder you just created.
4.  **Enable Plugin**: Open Obsidian, go to `Settings` > `Community plugins`, and enable the "AI Assistant Demo" plugin.
5.  **Configure API Key**: Go to the plugin's settings tab (`Settings` > `AI Assistant Demo`) and enter your Google Gemini API key.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
