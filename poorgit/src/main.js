const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// The directory where snapshots will be stored
const GIT_DIR = path.join(process.cwd(), '.simple_git');

/**
 * Initialize a simple git-like repository.
 */
function init() {
  if (fs.existsSync(GIT_DIR)) {
    console.log('Repository already initialized.');
  } else {
    fs.mkdirSync(GIT_DIR);
    fs.mkdirSync(path.join(GIT_DIR, 'objects'));
    fs.writeFileSync(path.join(GIT_DIR, 'index'), JSON.stringify({}));
    console.log('Initialized empty simple git repository.');
  }
}

/**
 * Hashes a file's content to simulate Git's SHA-1 object hash.
 * @param {string} content - The content to hash.
 * @returns {string} - SHA-1 hash of the content.
 */
function hashFileContent(content) {
  return crypto.createHash('sha1').update(content).digest('hex');
}

/**
 * Stages a file by adding it to the index file.
 * @param {string} filePath - The file to stage.
 */
function add(filePath) {
  const indexPath = path.join(GIT_DIR, 'index');
  const index = JSON.parse(fs.readFileSync(indexPath));

  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} does not exist.`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const hash = hashFileContent(content);
  const objFilePath = path.join(GIT_DIR, 'objects', hash);

  if (!fs.existsSync(objFilePath)) {
    fs.writeFileSync(objFilePath, content);
  }

  index[filePath] = hash;
  fs.writeFileSync(indexPath, JSON.stringify(index));
  console.log(`Staged ${filePath}`);
}

/**
 * Creates a commit by snapshotting the current state.
 * @param {string} message - Commit message.
 */
function commit(message) {
  const indexPath = path.join(GIT_DIR, 'index');
  const index = JSON.parse(fs.readFileSync(indexPath));
  const commitData = {
    message,
    timestamp: new Date().toISOString(),
    files: index,
  };

  const commitHash = hashFileContent(JSON.stringify(commitData));
  const commitFilePath = path.join(GIT_DIR, 'objects', commitHash);

  fs.writeFileSync(commitFilePath, JSON.stringify(commitData));
  console.log(`Created commit: ${commitHash}`);

  // Clear the index (mimics staging area being reset)
  fs.writeFileSync(indexPath, JSON.stringify({}));
}

/**
 * Shows the difference between the working directory and the staged files (line by line).
 */
function diff() {
  const indexPath = path.join(GIT_DIR, 'index');
  const index = JSON.parse(fs.readFileSync(indexPath));
  let hasDiff = false;

  for (const filePath in index) {
    if (!fs.existsSync(filePath)) {
      console.log(`File ${filePath} has been deleted.`);
      hasDiff = true;
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const stagedContent = fs.readFileSync(path.join(GIT_DIR, 'objects', index[filePath]), 'utf-8');

    const currentLines = content.split('\n');
    const stagedLines = stagedContent.split('\n');

    const lineDiffs = diffLines(stagedLines, currentLines);

    if (lineDiffs.length > 0) {
      hasDiff = true;
      console.log(`\nDiff for file: ${filePath}`);
      lineDiffs.forEach(diff => {
        if (diff.type === 'added') {
          console.log(`+ ${diff.line}`);
        } else if (diff.type === 'removed') {
          console.log(`- ${diff.line}`);
        } else {
          console.log(`  ${diff.line}`);
        }
      });
    }
  }

  if (!hasDiff) {
    console.log('No changes detected.');
  }
}

/**
 * Compare two arrays of lines and return a list of differences.
 * @param {string[]} oldLines - The old version of the file (staged).
 * @param {string[]} newLines - The new version of the file (current).
 * @returns {Array} - Array of differences, each having a type ('added', 'removed', 'unchanged') and the line content.
 */
function diffLines(oldLines, newLines) {
  const diffs = [];
  const maxLength = Math.max(oldLines.length, newLines.length);

  let i = 0;
  let j = 0;

  while (i < maxLength || j < maxLength) {
    const oldLine = oldLines[i] || '';
    const newLine = newLines[j] || '';

    if (oldLine === newLine) {
      diffs.push({ type: 'unchanged', line: oldLine });
      i++;
      j++;
    } else if (oldLine && !newLine) {
      diffs.push({ type: 'removed', line: oldLine });
      i++;
    } else if (!oldLine && newLine) {
      diffs.push({ type: 'added', line: newLine });
      j++;
    } else {
      diffs.push({ type: 'removed', line: oldLine });
      diffs.push({ type: 'added', line: newLine });
      i++;
      j++;
    }
  }

  return diffs;
}

/**
 * Entry point for the CLI.
 * 
 * Available commands:
 * - init: Initialize a new repository.
 * - add <file>: Stage a file.
 * - commit <message>: Create a commit.
 * - diff: Show the difference between the working directory and the staged files
 */
function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'init':
      init();
      break;
    case 'add':
      if (!args.length) {
        console.error('Usage: add <file>');
      } else {
        add(args[0]);
      }
      break;
    case 'commit':
      if (!args.length) {
        console.error('Usage: commit <message>');
      } else {
        commit(args.join(' '));
      }
      break;
    case 'diff':
      diff();
      break;
    default:
      console.error('Unknown command.');
  }
}

main();