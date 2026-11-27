import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=await readFile(resolve(root,'netlify/lib/crisis-triage.mjs'),'utf8');
const browser=`// Generated from netlify/lib/crisis-triage.mjs. Do not edit by hand.\n(()=>{\n'use strict';\n${source.replaceAll('export const ','const ').replaceAll('export function ','function ')}\nwindow.MiraclePawTriage=Object.freeze({triageInput,triageOutput,supportForModerationCrisis});\n})();\n`;
const target=resolve(root,'public/crisis-triage-browser.js');
if(process.argv.includes('--check')) {
  const existing=await readFile(target,'utf8');
  if(existing!==browser) throw new Error('BROWSER_TRIAGE_OUT_OF_SYNC');
} else await writeFile(target,browser);
