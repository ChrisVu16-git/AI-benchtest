# AI Testbench

AI Testbench is a web application for testing and comparing large language models (LLMs). It provides a dashboard for submitting prompts, running model benchmarks, and viewing responses and performance results.

## Features

- **LLM Testing:** Submit prompts to an AI model and inspect its responses.
- **Model Comparison:** Compare responses from multiple configured models.
- **Benchmark Dashboard:** View benchmark results in a centralized interface.
- **API Integration:** Communicate with AI models through a backend API.
- **Error Handling:** Display API errors and request failures in the dashboard.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Lucide React

### Backend
- Node.js
- Express.js
- AI model API integration

### AI Provider
- Google Gemini API

## Project Structure

```text
AI-benchtest/
├── backend/
│   └── Backend source code
├── frontend/
│   └── React application
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- A Google Gemini API key
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/ChrisVu16-git/AI-benchtest.git
cd AI-benchtest
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Configure the Gemini API key in the backend environment file, using the environment variable name expected by your backend code.

For example, if your backend reads `GEMINI_API_KEY`, create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

Replace the example values with your actual configuration. Never commit API keys or other secrets to GitHub.

Start the backend using the development script defined in `backend/package.json`. For example:

```bash
npm run dev
```

### 3. Set Up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

> Note: The commands above assume the corresponding scripts exist in each `package.json`. Check the project's scripts and backend configuration if your setup differs.

## Usage

1. Start the backend server.
2. Start the frontend development server.
3. Open the application in your browser.
4. Enter a prompt to test a model.
5. Select or configure models for comparison.
6. Run a benchmark and review the returned results.

## Configuration and Troubleshooting

- **API errors:** Verify your API key, model name, provider availability, and usage limits.
- **Model unavailable:** Check the models supported by your Gemini API account.
- **Request timeout:** Check backend logs and network connectivity.
- **Frontend cannot reach backend:** Verify the API URL, backend port, and Vite proxy configuration.
- **Missing environment variables:** Confirm the variable names match those used by the backend.

## Security

- Keep API keys in environment variables.
- Add `.env` files to `.gitignore`.
- Do not commit credentials, access tokens, or private configuration files.
- Use environment variables for deployment-specific settings.

## Future Improvements

- Add more AI model providers.
- Expand benchmark metrics, such as latency and token usage.
- Save and export benchmark results.
- Add historical comparisons and performance charts.
- Improve retry handling for temporary API failures.

## License

No license has been specified yet. All rights are reserved unless a license is added to this repository.
