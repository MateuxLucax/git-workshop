import fs from 'node:fs';
import zlib from 'node:zlib';

/**
 * Compress a file using zlib
 * 
 * @param {string} filePath - The file
 * 
 * @returns {Buffer} The compressed file
 */
export function compressFile(filePath) {
  const file = fs.readFileSync(filePath, 'utf8');

  return zlib.gzipSync(file);
}

/**
 * Decompress a file using zlib
 * 
 * @param {string} filePath - The file
 * 
 * @returns {Buffer} The decompressed file
 */
export function decompressFile(filePath) {
  const file = fs.readFileSync(filePath);

  return zlib.gunzipSync(file);
}
