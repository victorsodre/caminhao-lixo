import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { project } from './project.ts';
import { video } from './video.ts';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

test('o texto indexável do index.html acompanha as etapas do app', () => {
  for (const stage of project.stages) assert.ok(html.includes(`<strong>${stage.name}.</strong> ${stage.description}`), `etapa fora de sincronia: ${stage.name}`);
  assert.match(html, /<title>[^<]*caminhão de lixo compactador[^<]*<\/title>/i);
});

test('o VideoObject descreve o vídeo incorporado no lab', () => {
  const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(raw, 'falta o JSON-LD');
  const data = JSON.parse(raw);
  assert.equal(data['@type'], 'VideoObject');
  assert.equal(data.name, video.title);
  assert.ok(data.contentUrl.endsWith(video.id) && data.embedUrl.endsWith(video.id));
  assert.equal(data.duration, `PT${video.duration.split(':').reduce((m, s) => m * 60 + Number(s), 0)}S`);
  assert.ok(!Number.isNaN(Date.parse(data.uploadDate)));
});
