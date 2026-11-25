#!/usr/bin/env node
/**
 * Gera a narração em MP3 de cada passo do Tour Guiado (acessibilidade).
 *
 * Os MP3 ficam versionados no repositório e são servidos como arquivo estático: o jogador
 * nunca dispara síntese de voz. O texto falado e o hash dele vêm do próprio motor
 * (speechText/textHash em src/js/interactive-tour-ux-engine.js), a mesma função que o
 * navegador usa para conferir a versão. assets/audio/tutorial/manifest.json registra, por
 * tutorial e por passo: arquivo, hash do texto, versão do áudio, modelo, voz e data.
 * Passo cujo texto mudou sem áudio novo fica mudo no jogo e mostra um aviso.
 *
 *   OPENROUTER_API_KEY=... npm run gerar:voz        # gera só o que falta ou mudou
 *   npm run test:voz                                # sai 1 se algum passo está sem áudio em dia
 *
 * Opções: --limit N (só os N primeiros passos). OPENROUTER_BASE_URL troca o endpoint
 * (padrão https://openrouter.ai/api/v1), para usar um gateway compatível com a OpenRouter.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const MODEL = 'elevenlabs/eleven-v4';
const VOICE = 'alice';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'assets/audio/tutorial');
const manifestPath = join(outDir, 'manifest.json');

// Carrega o motor num contexto isolado: o construtor só monta os passos, não toca no DOM.
const ctx = vm.createContext({ window: {}, console });
vm.runInContext(readFileSync(join(root, 'src/js/interactive-tour-ux-engine.js'), 'utf8'), ctx);
const tour = ctx.window.spotlightTour;
const steps = tour.steps;

// Autoteste do texto falado: HTML, entidade e emoji não podem chegar à voz.
if (tour.speechText({ title: '1. 👆 <strong>A &amp; B</strong>&nbsp;→' }, 0) !== 'Passo 1: A e B.') {
  throw new Error('speechText quebrou');
}

const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const tutorial = (manifest[tour.voiceTutorialId] ||= { steps: {} });

const isFresh = (step, i) => {
  const e = tutorial.steps[step.id];
  return Boolean(e) && e.model === MODEL && e.voice === VOICE
    && e.hash === tour.textHash(tour.speechText(step, i)) && existsSync(join(outDir, e.file));
};

const args = process.argv.slice(2);

if (args.includes('--check')) {
  const stale = steps.filter((s, i) => !isFresh(s, i));
  stale.forEach((s) => console.error(`sem áudio em dia: ${tour.voiceTutorialId}/${s.id}`));
  console.log(`${steps.length - stale.length}/${steps.length} passos com narração em dia`);
  process.exit(stale.length ? 1 : 0);
}

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('Defina OPENROUTER_API_KEY.');
  process.exit(1);
}
const baseUrl = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : steps.length;

mkdirSync(outDir, { recursive: true });
for (const [i, step] of steps.slice(0, limit).entries()) {
  if (isFresh(step, i)) {
    console.log(`= ${step.id} (em dia)`);
    continue;
  }
  const text = tour.speechText(step, i);
  const res = await fetch(`${baseUrl}/audio/speech`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, voice: VOICE, input: text, response_format: 'mp3' }),
  });
  if (!res.ok) throw new Error(`${step.id}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  const audio = Buffer.from(await res.arrayBuffer());
  if (!audio.length) throw new Error(`${step.id}: áudio vazio`);

  const file = `${step.id}.mp3`;
  writeFileSync(join(outDir, file), audio);
  tutorial.steps[step.id] = {
    file,
    hash: tour.textHash(text),
    version: (tutorial.steps[step.id]?.version || 0) + 1,
    model: MODEL,
    voice: VOICE,
    chars: text.length,
    generatedAt: new Date().toISOString().slice(0, 10),
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✓ ${step.id} v${tutorial.steps[step.id].version} (${text.length} caracteres, ${(audio.length / 1024).toFixed(0)} KB)`);
}
