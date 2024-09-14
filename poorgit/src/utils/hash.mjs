import fs from 'node:fs';
import crypto from 'node:crypto';

/**
 * Hashes a string using node's crypto module.
 * 
 * @param {string} content - Content of the file to compress
 * 
 * @returns {string[]} The hashes of each line in the file.
 */
export function hashFileLines(content) {
  console.log(typeof content);
  const lines = content.split('\n');

  const hashes = [];
  for (const line of lines) {
    const hash = crypto.createHash('sha256');
    hash.update(line);
    hashes.push(hash.digest('hex'));
  }

  return hashes;
}
