import path from 'node:path';
import fs from 'node:fs';

import { POORGIT_DIR } from '../main.mjs';
import { hashFileLines } from '../utils/hash.mjs';
import { decompressFile } from '../utils/compress.mjs';

/**
 * Get diff from files in staged vs last commit
 * 
 * @param {string} args - The commit hash
 */
export function diff([commitHash]) {
  if (!commitHash) {
    console.log('No commit hash provided');
    return;
  }

  const stagedFiles = fs.readdirSync(path.join(POORGIT_DIR, 'staged'));
  const commitDir = path.join(POORGIT_DIR, 'commits', commitHash);

  if (!fs.existsSync(commitDir)) {
    console.log('Commit not found');
    return;
  }

  const commitFilesHashes = [];
  const commitFiles = fs.readdirSync(commitDir);

  for (const commitFile of commitFiles) {
    if (commitFile === 'message') continue;

    const fileContent = decompressFile(path.join(commitDir, commitFile)).toString();
    commitFilesHashes.push({ file: commitFile, hashedLines: hashFileLines(fileContent), originalLines: fileContent.split('\n') });
  }

  const diffLinesFromFiles = [];

  for (const stagedFile of stagedFiles) {
    const fileContent = decompressFile(path.join(POORGIT_DIR, 'staged', stagedFile)).toString();
    const stagedFileLines = fileContent.split('\n');
    const stagedFileHashes = hashFileLines(fileContent);

    const commitFile = commitFilesHashes.find(({ file }) => file === stagedFile);

    if (!commitFile) {
      const newLines = stagedFileLines.map((line, i) => ({ type: '+', line: i + 1, content: line }));
      diffLinesFromFiles.push({ file: stagedFile, lines: newLines });
      continue;
    }

    const commitFileLines = commitFile.originalLines;
    const commitFileHashes = commitFile.hashedLines;

    const diffLines = [];

    for (let i = 0; i < Math.max(stagedFileLines.length, commitFileLines.length); i++) {
      if (commitFileHashes[i] !== stagedFileHashes[i]) {
        if (i >= commitFileLines.length) {
          diffLines.push({ type: '+', line: i + 1, content: stagedFileLines[i] });
        } else if (i >= stagedFileLines.length) {
          diffLines.push({ type: '-', line: i + 1, content: commitFileLines[i] });
        } else {
          diffLines.push({ type: '-', line: i + 1, content: commitFileLines[i] });
          diffLines.push({ type: '+', line: i + 1, content: stagedFileLines[i] });
        }
      }
    }

    diffLinesFromFiles.push({ file: stagedFile, lines: diffLines });

    commitFilesHashes.splice(commitFilesHashes.indexOf(commitFile), 1);
  }

  for (const commitFile of commitFilesHashes) {
    const commitFileLines = commitFile.originalLines.map((content, i) => ({ type: '-', line: i + 1, content }));
    diffLinesFromFiles.push({ file: commitFile.file, lines: commitFileLines });
  }

  for (const file of diffLinesFromFiles) {
    console.log(`File: ${file.file}`);
    for (const line of file.lines) {
      console.log(`${line.type} Line ${line.line}: ${line.content}`);
    }
  }
}