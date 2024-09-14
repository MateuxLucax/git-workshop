import path from 'node:path';
import fs from 'node:fs';

import { POORGIT_DIR } from "../main.mjs";
import { compressFile } from '../utils/compress.mjs';

/**
 * Add files to the index
 * 
 * @param {string[]} filesPath - The files to add
 * 
 * @returns {void}
 */
export default function add(filesPath) {
  if (!filesPath.length) {
    console.log('No files provided');
    return;
  }

  const stagedDir = path.join(POORGIT_DIR, 'staged');
  for (const file of filesPath) {
    const stagedFilePath = path.join(process.cwd(), file);
    const compressedFile = compressFile(stagedFilePath);
    fs.writeFileSync(path.join(stagedDir, file), compressedFile);
  }

  console.log('Files staged');
}
