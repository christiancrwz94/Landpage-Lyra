// Função da Vercel: salva os textos do painel (/editar). Toda a lógica está em scripts/painel-api.mjs.
import campos from '../landing/campos.json' with { type: 'json' };
import { criarHandler } from '../scripts/painel-api.mjs';

export default criarHandler({ campos });
