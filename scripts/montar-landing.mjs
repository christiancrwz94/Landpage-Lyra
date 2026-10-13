// Monta o site: copia a pasta landing/ (HTML/CSS/JS puros) para dist/, que é o que a Vercel publica.
import { cpSync, rmSync, mkdirSync } from 'node:fs';
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('landing', 'dist', { recursive: true });
console.log('Site montado em dist/');
