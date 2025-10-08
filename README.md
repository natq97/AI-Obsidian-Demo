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

*   **Frontend**: React, TypeScript, Vite, Tailwind CSS
*   **AI**: Google Gemini API (`@google/genai`)
*   **Plugin Environment**: Obsidian API

## How to Use

### Running the Standalone Web App

This project is configured to run with [Vite](https://vitejs.dev/). You will need [Node.js](https://nodejs.org/) installed.

1.  **Clone the Repository**: Download the code to your local machine.

2.  **Install Dependencies**: Open a terminal in the project's root directory and run:
    ```bash
    npm install
    ```

3.  **Set Up API Key**:
    *   Create a file named `.env` in the root of the project.
    *   Add your Google Gemini API key to this file. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   The file content should look like this:
        ```
        VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
        ```

4.  **Run the Development Server**: To run the app locally, use the command:
    ```bash
    npm run dev
    ```
    This will start a local server, and you can view the application in your browser at the address provided in the terminal.

5.  **Build for Production**: To create an optimized build for deployment, run:
    ```bash
    npm run build
    ```
    This will create a `dist` folder containing the final static files.

### Installing as an Obsidian Plugin

The files for the Obsidian plugin (`main.ts`, `manifest.json`, etc.) are included but are not part of the Vite build process. Building and installing the Obsidian plugin requires a separate build setup (e.g., using `esbuild`), which is not covered by the `npm run build` command in this configuration.

## License

This project is licensed under the MIT License.
