# AI Shell 🚀

An intelligent shell wrapper that enhances your command-line experience using AI. It seamlessly handles both shell commands and natural language queries, providing helpful suggestions and corrections when needed.

## Features

- **Smart Input Classification**: Uses GPT-4.1-mini to intelligently classify whether your input is a shell command or natural language
- **Natural Language Support**: Ask questions or make requests in plain English
- **Command Validation**: Validates commands before execution
- **Error Suggestions**: Provides helpful suggestions when commands fail or are incorrect
- **Seamless Integration**: Works exactly like a normal shell for valid commands
- **Interactive REPL**: Clean, colorful interface with persistent session

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-shell.git
cd ai-shell
```

2. Install dependencies:
```bash
npm install
```

3. Set up your OpenAI API key:
```bash
cp .env.example .env
```
Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

## Usage

Run the AI shell:
```bash
node index.js
```
or
```bash
npm start
```

### Examples

```bash
ai-shell> ls -la
# Executes the command normally

ai-shell> how do I find large files?
🤖 AI: To find large files, you can use: `find . -type f -size +100M`

ai-shell> show me current directory
🤖 AI: To see the current directory, use: `pwd`

ai-shell> git stats
⚠️  Command not found or invalid syntax
🤖 AI: Did you mean `git status`? This shows the working tree status.
```

### Keyboard Shortcuts

- `Ctrl+C`: Exit running command (or exit shell if no command is running)
- `exit` or `quit`: Exit the AI shell

## Requirements

- Node.js 16+
- OpenAI API key with access to GPT-4.1-mini

## How It Works

1. **Input Classification**: Each input is sent to GPT-4.1-mini to classify as either a command or natural language
2. **Command Execution**: Valid commands are executed directly in your shell with full stdio inheritance
3. **Natural Language Processing**: Questions and requests are processed by the AI to provide helpful responses
4. **Error Handling**: Invalid commands trigger AI suggestions for corrections

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security

- Never commit your `.env` file
- Keep your OpenAI API key secure
- The tool validates commands before execution to prevent accidental misuse