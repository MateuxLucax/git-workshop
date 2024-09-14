import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

import { POORGIT_DIR } from "../main.mjs";

/**
 * Commit changes to the repository
 * 
 * @param {string} message - The commit message
 */
export default function commit([message]) {
  if (!message) {
    console.log('No commit message provided');
    return;
  }

  const stagedFiles = fs.readdirSync(path.join(POORGIT_DIR, 'staged'));

  const commitHash = crypto.randomUUID();
  const commitDir = path.join(POORGIT_DIR, 'commits', commitHash);
  fs.mkdirSync(commitDir, { recursive: true });

  fs.writeFileSync(path.join(commitDir, 'message'), message);
  
  for (const file of stagedFiles) {
    fs.renameSync(path.join(POORGIT_DIR, 'staged', file), path.join(commitDir, file));
  }

  console.log(`Commit ${commitHash} created`);
}