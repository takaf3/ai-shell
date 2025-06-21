#!/usr/bin/env node

import readline from 'readline';
import { spawn } from 'child_process';
import OpenAI from 'openai';
import chalk from 'chalk';
import dotenv from 'dotenv';
import which from 'which';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
});

const MODEL_NAME = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.green('ai-shell> ')
});

async function isValidCommand(command) {
  const parts = command.trim().split(/\s+/);
  if (parts.length === 0) return false;
  
  const cmd = parts[0];
  
  try {
    await which(cmd);
    return true;
  } catch (error) {
    return false;
  }
}

let isCommandRunning = false;

async function executeCommand(command) {
  return new Promise((resolve) => {
    isCommandRunning = true;
    
    const child = spawn(command, {
      shell: true,
      stdio: 'inherit',
      detached: false
    });

    child.on('exit', (code) => {
      isCommandRunning = false;
      resolve();
    });

    child.on('error', (error) => {
      console.error(chalk.red(`Error executing command: ${error.message}`));
      isCommandRunning = false;
      resolve();
    });
  });
}

async function askLLM(input, context = '') {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: `You are a helpful shell assistant. The user is trying to use the command line.
          If they enter natural language, respond helpfully.
          If they enter an incorrect command or wrong options, suggest the correct command.
          Be concise and practical. Format commands with backticks.
          Context: ${context}`
        },
        {
          role: 'user',
          content: input
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(chalk.red(`LLM Error: ${error.message}`));
    return null;
  }
}

async function classifyInput(input) {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: `You are a command classifier. Analyze the user input and determine if it's:
          1. A shell command (something to execute in the terminal)
          2. Natural language (a question, request, or conversation)
          
          Respond with ONLY one word: "COMMAND" or "NATURAL"
          
          Examples:
          - "ls -la" -> COMMAND
          - "git status" -> COMMAND
          - "how do I list files?" -> NATURAL
          - "what time is it?" -> NATURAL
          - "cd /home" -> COMMAND
          - "show me the current directory" -> NATURAL`
        },
        {
          role: 'user',
          content: input
        }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    const classification = response.choices[0].message.content.trim().toUpperCase();
    return classification === 'NATURAL';
  } catch (error) {
    console.error(chalk.red(`Classification Error: ${error.message}`));
    return true;
  }
}

console.log(chalk.blue('Welcome to AI Shell! 🚀'));
console.log(chalk.gray('Type commands or ask questions in natural language.'));
console.log(chalk.gray('Type "exit" or Ctrl+C to quit.\n'));

rl.prompt();

rl.on('line', async (line) => {
  const input = line.trim();
  
  if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
    console.log(chalk.yellow('Goodbye!'));
    process.exit(0);
  }
  
  if (!input) {
    rl.prompt();
    return;
  }
  
  const isNaturalLanguage = await classifyInput(input);
  
  if (isNaturalLanguage) {
    console.log(chalk.cyan('🤖 AI: ') + chalk.gray('Thinking...'));
    const response = await askLLM(input);
    if (response) {
      console.log(chalk.cyan('🤖 AI:'), response);
    }
  } else {
    const isValid = await isValidCommand(input);
    
    if (isValid) {
      await executeCommand(input);
    } else {
      console.log(chalk.yellow('⚠️  Command not found or invalid syntax'));
      const suggestion = await askLLM(input, 'The user entered an invalid command.');
      if (suggestion) {
        console.log(chalk.cyan('🤖 AI:'), suggestion);
      }
    }
  }
  
  rl.prompt();
});

process.on('SIGINT', () => {
  if (!isCommandRunning) {
    console.log(chalk.yellow('\nGoodbye!'));
    process.exit(0);
  }
  // If a command is running, do nothing and let the child process handle it
});

if (!process.env.OPENAI_API_KEY) {
  console.error(chalk.red('Error: OPENAI_API_KEY not found in environment variables.'));
  console.error(chalk.yellow('Please create a .env file with your OpenAI API key.'));
  console.error(chalk.gray('Example: OPENAI_API_KEY=your_api_key_here'));
  process.exit(1);
}