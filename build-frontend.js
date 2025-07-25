#!/usr/bin/env node

/**
 * Builds and watches UI frontend files for the BeepChecker Tauri app.
 *
 * This Node.js script minifies HTML and JavaScript files and copies static
 * assets. The Tailwind CSS is compiled separately using the Tailwind CLI.
 *
 * @copyright Copyright (c) The Hello World Writer
 * @license MIT
 * @website https://www.thehelloworldwriter.com
 */

// @ts-check

import { existsSync, mkdirSync, readdirSync } from 'fs';
import { cp, readFile, writeFile } from 'fs/promises';
import path from 'path';

import chokidar from 'chokidar';
import { minify as minifyHtml } from 'html-minifier-next';
import { minify as minifyJs } from 'terser';
import { cyan } from 'yoctocolors';

const SRC_DIR = path.resolve('src');
const DIST_DIR = path.resolve('dist');
const ASSETS_SRC = path.join(SRC_DIR, 'assets');
const ASSETS_DIST = path.join(DIST_DIR, 'assets');

/** 
 * Logs a file path relative to the current working directory and colors it cyan.
 *
 * @param {string} p - The file path to log.
 */
function logFilePath(p) {
  return cyan(path.relative(process.cwd(), p));
}

/** Minifies HTML files in the src directory and writes them to the dist directory */
async function minifyHtmlFiles() {
  const files = readdirSync(SRC_DIR).filter(f => f.endsWith('.html'));
  if (!existsSync(DIST_DIR)) mkdirSync(DIST_DIR, { recursive: true });
  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file);
    const distPath = path.join(DIST_DIR, file);
    const html = await readFile(srcPath, { encoding: 'utf8' });

    // Minify HTML with options
    const minified = await minifyHtml(html, {
      collapseWhitespace: true,
      //   conservativeCollapse: true,
      //   minifyCSS: true,
      //   minifyJS: true,
      removeComments: true,
    });

    await writeFile(distPath, minified, 'utf8');
    console.log(`Minified HTML: ${logFilePath(srcPath)} -> ${logFilePath(distPath)}`);
  }
}

/** Minifies JavaScript files in the src directory and writes them to the dist directory */
async function minifyJsFiles() {
  const files = readdirSync(SRC_DIR).filter(f => f.endsWith('.js'));
  if (!existsSync(DIST_DIR)) mkdirSync(DIST_DIR, { recursive: true });
  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file);
    const distPath = path.join(DIST_DIR, file);
    const js = await readFile(srcPath, { encoding: 'utf8' });

    // Minify JavaScript with options
    const minified = await minifyJs(js, {
      sourceMap: false
    });

    // Check if minified code is empty
    if (!minified || !minified.code) {
      console.warn(`Warning: Minified JS is empty for ${logFilePath(srcPath)}`);
      continue;
    }

    await writeFile(distPath, minified.code, 'utf8');
    console.log(`Minified JS: ${logFilePath(srcPath)} -> ${logFilePath(distPath)}`);
  }
}

/** Copies assets from src/assets to dist/assets recursively and async */
async function copyAssets() {
  if (!existsSync(ASSETS_SRC)) return;
  if (!existsSync(ASSETS_DIST)) mkdirSync(ASSETS_DIST, { recursive: true });
  await cp(ASSETS_SRC, ASSETS_DIST, { recursive: true });
  console.log(`Copied assets recursively from ${logFilePath(ASSETS_SRC)} to ${logFilePath(ASSETS_DIST)}`);
}

/** Builds all assets: minifies HTML and JS, and copies assets */
async function buildAll() {
  await minifyHtmlFiles();
  await minifyJsFiles();
  await copyAssets();
}

/** Watches the src directory for changes and rebuilds assets */
function watchAll() {
  console.log(`Watching for changes in ${logFilePath(SRC_DIR)} ...`);
  const watcher = chokidar.watch(SRC_DIR, { ignoreInitial: true, persistent: true });
  watcher.on('all', async (event, filePath) => {
    if (!filePath) return;
    const ext = path.extname(filePath);
    console.log(`File ${event}: ${logFilePath(filePath)}`);

    // TODO: Minify or copy only changed files to improve performance
    if (ext === '.html') await minifyHtmlFiles();
    else if (ext === '.js') await minifyJsFiles();
    else if (filePath.startsWith(ASSETS_SRC)) await copyAssets();
  });
}

// Run the build or watch process based on command line argument
const mode = process.argv[2];
if (mode === 'watch') {
  buildAll().then(() => watchAll());
} else {
  buildAll();
}
