import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const url = (name) => new URL(`../public/${name}`, import.meta.url);
const html = await readFile(url('index.html'), 'utf8');
const css = await readFile(url('styles.css'), 'utf8');
const pet = await readFile(url('pet.js'), 'utf8');

test('v0.4 offers six voluntary pet actions and three expression modes', () => {
  for (const action of ['pet', 'hug', 'feed', 'wave', 'rest', 'blink']) {
    assert.match(html, new RegExp(`data-pet-action="${action}"`));
  }
  for (const mood of ['calm', 'happy', 'sleepy']) {
    assert.match(html, new RegExp(`data-pet-mood="${mood}"`));
  }
  assert.match(html, /冇飢餓值、親密度扣分/);
});

test('v0.4 renders layered art without requiring AI, GPS or local storage', async () => {
  for (const f of ['miraclepaw-cat-body.webp', 'miraclepaw-cat-tail.webp', 'miraclepaw-cat-eyesclosed.webp']) {
    assert.match(html, new RegExp(f.replace('.', '\\.')));
    const info = await stat(url(f));
    assert.ok(info.size > 1000);
  }
  assert.match(pet, /scheduleBlink/);
  assert.doesNotMatch(pet, /fetch\(|localStorage|navigator\.geolocation/);
});

test('v0.4 uses CSS-independent tail and reduced-motion safety rules', () => {
  assert.match(css, /\.cat-tail-layer/);
  assert.match(css, /keyframes tail-swish/);
  assert.match(css, /cat-closed-eyes-layer/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(pet, /visibilitychange/);
});
