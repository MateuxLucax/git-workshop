import path from 'node:path';

import init from './commands/init.mjs'
import add from './commands/add.mjs';
import commit from './commands/commit.mjs';
import { diff } from './commands/diff.mjs';

export const POORGIT_DIR = path.join(process.cwd(), '.poorgit');

const commands = {
  init,
  add,
  commit,
  diff,
}

function handleCommands() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('No command provided');
    return;
  }

  const command = args[0];
  const commandArgs = args.slice(1);

  if (commands[command]) {
    commands[command](commandArgs);
  } else {
    console.log('Command not found');
  }
}

handleCommands();