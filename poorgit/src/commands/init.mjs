import fs from 'node:fs';
import path from 'node:path';

import { POORGIT_DIR } from "../main.mjs";

export default function init() {
  const fileExists = fs.existsSync(POORGIT_DIR);
  if (fileExists) {
    console.log('poorgit already initialized');
    return;
  }

  fs.mkdirSync(POORGIT_DIR);
  fs.mkdirSync(path.join(POORGIT_DIR, 'staged'));
  fs.mkdirSync(path.join(POORGIT_DIR, 'commits'));
  console.log('poorgit initialized');
}