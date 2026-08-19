// Import único do catálogo do FazMais legado (Faz+) pro FazMais novo.
// Lê o JSON extraído (ver .claude scratchpad da sessão que gerou o dataset)
// e cria Catalogo → Eixo → Colecao → Conteudo via API, como MASTER.
//
// Uso:
//   node scripts/import-legado.mjs <caminho-do-dataset.json>
//   DRY_RUN=1 node scripts/import-legado.mjs <caminho-do-dataset.json>   (só resume, não grava nada)
//
// Idempotente: reexecutar depois de uma falha parcial pula o que já foi
// criado (progresso salvo em scripts/import-legado.progress.json, ao lado
// deste arquivo — apagar esse arquivo força recriar tudo do zero).

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const API_BASE = process.env.FAZMAIS_API_URL ?? 'http://localhost:3000';
const MASTER_LOGIN = process.env.FAZMAIS_MASTER_LOGIN ?? 'master';
const MASTER_PASSWORD = process.env.FAZMAIS_MASTER_PASSWORD ?? 'fazmais123';
const DRY_RUN = process.env.DRY_RUN === '1';

const CATALOGO_NAME = 'Faz+ Legado';
const CATALOGO_ICON = '📦';

const PROGRESS_PATH = fileURLToPath(new URL('./import-legado.progress.json', import.meta.url));

function placeholderImage(eixoName) {
  return `https://placehold.co/600x400?text=${encodeURIComponent(eixoName)}`;
}

// "Total horas" do legado vem em formato livre "HH:MM" (ex: "00:01"). Sem
// garantia de precisão — é o melhor dado que a fonte oferece.
function parseDurationSeconds(totalHoras) {
  if (!totalHoras) return undefined;
  const match = /^(\d+):(\d+)$/.exec(totalHoras.trim());
  if (!match) return undefined;
  const seconds = Number(match[1]) * 3600 + Number(match[2]) * 60;
  return seconds > 0 ? seconds : undefined;
}

function parsePageCount(totalPaginas) {
  const n = Number(totalPaginas);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : undefined;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function truncate(str, max) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + '…';
}

// Artigo original (autor nomeado, sem link externo real): corpo completo.
// Artigo de terceiro (autor "Canguru News", com externalUrl): só o excerpt
// curto + link pra fonte, nunca o corpo inteiro reproduzido — decisão
// tomada com o usuário por causa de direitos autorais sobre o texto alheio.
function buildArtigoPayload(item, modulo) {
  const isOriginal = Boolean(item.htmlContentBody);
  let htmlContent;
  let description;

  if (isOriginal) {
    htmlContent = `<p>${escapeHtml(item.htmlContentBody)}</p><p><em>Autor: ${escapeHtml(item.autor)}</em></p>`;
    description = truncate(item.htmlContentBody, 600);
  } else {
    const excerpt = item.excerpt || item.titulo;
    htmlContent = `<p>${escapeHtml(excerpt)}</p><p>Fonte: <a href="${item.externalUrl}" target="_blank" rel="noopener">${escapeHtml(item.externalUrl)}</a> — ${escapeHtml(item.autor)}</p>`;
    description = truncate(excerpt, 600);
  }

  return {
    title: item.titulo,
    description,
    mediaType: 'ARTIGO',
    htmlContent,
    imageUrl: placeholderImage(modulo),
    tags: item.autor ? [item.autor] : [],
  };
}

function buildPayload(item, modulo) {
  if (item.tipoArquivo === 'ARTIGO') {
    return buildArtigoPayload(item, modulo);
  }
  return {
    title: item.titulo,
    description: item.sumario?.trim() || item.titulo,
    mediaType: item.tipoArquivo,
    mediaUrl: item.linkUrlVisualizacao || undefined,
    imageUrl: placeholderImage(modulo),
    tags: item.funcionalidade ? [item.funcionalidade] : [],
    durationSeconds: item.tipoArquivo === 'VIDEO' ? parseDurationSeconds(item.totalHoras) : undefined,
    pageCount: item.tipoArquivo === 'PDF' ? parsePageCount(item.totalPaginas) : undefined,
  };
}

async function login() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: MASTER_LOGIN, password: MASTER_PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(`login falhou: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.accessToken;
}

async function api(token, method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${await res.text().catch(() => '')}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function loadProgress() {
  try {
    return JSON.parse(await readFile(PROGRESS_PATH, 'utf8'));
  } catch {
    return { catalogoId: null, eixos: {}, colecoes: {}, itens: {} };
  }
}

async function saveProgress(progress) {
  await writeFile(PROGRESS_PATH, JSON.stringify(progress, null, 2));
}

function runDryRun(dataset) {
  const porEixo = new Map();
  for (const item of dataset.itens) {
    const eixo = porEixo.get(item.modulo) ?? new Map();
    const colecao = eixo.get(item.categoria) ?? 0;
    eixo.set(item.categoria, colecao + 1);
    porEixo.set(item.modulo, eixo);
  }

  console.log(`Catálogo: "${CATALOGO_NAME}" ${CATALOGO_ICON}`);
  console.log(`Total de itens no dataset: ${dataset.itens.length}`);
  console.log(`Eixos com descrição capturada: ${dataset.eixos.filter((e) => e.description).length}/${dataset.eixos.length}\n`);

  for (const [eixoName, colecoes] of porEixo) {
    const desc = dataset.eixos.find((e) => e.modulo === eixoName)?.description;
    console.log(`Eixo: ${eixoName}${desc ? '' : '  [SEM description]'}`);
    for (const [colecaoName, count] of colecoes) {
      console.log(`  Coleção: ${colecaoName} — ${count} conteúdo(s)`);
    }
  }

  const naoArtigo = dataset.itens.filter((i) => i.tipoArquivo !== 'ARTIGO');
  const semMediaUrl = naoArtigo.filter((i) => !i.linkUrlVisualizacao).length;
  const semSumario = naoArtigo.filter((i) => !i.sumario?.trim()).length;
  if (semMediaUrl) console.log(`\n⚠ ${semMediaUrl} item(ns) sem linkUrlVisualizacao — vão falhar na criação (mediaUrl é obrigatório).`);
  if (semSumario) console.log(`⚠ ${semSumario} item(ns) sem sumário — vão usar o título como description.`);

  const artigos = dataset.itens.filter((i) => i.tipoArquivo === 'ARTIGO');
  const originais = artigos.filter((i) => i.htmlContentBody).length;
  const terceiros = artigos.length - originais;
  if (artigos.length) {
    console.log(`\nArtigos: ${originais} original(is) com corpo completo, ${terceiros} de terceiro (só excerpt + link pra fonte).`);
  }
}

async function runImport(dataset) {
  const token = await login();
  const progress = await loadProgress();

  if (!progress.catalogoId) {
    const existentes = await api(token, 'GET', '/catalogos');
    const achado = existentes.find((c) => c.name === CATALOGO_NAME);
    progress.catalogoId = achado
      ? achado.id
      : (await api(token, 'POST', '/catalogos', { name: CATALOGO_NAME, icon: CATALOGO_ICON })).id;
    await saveProgress(progress);
  }
  const catalogoId = progress.catalogoId;
  const descricaoPorModulo = new Map(dataset.eixos.map((e) => [e.modulo, e.description]));

  let created = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];

  async function getOrCreateEixo(nomeEixo) {
    if (progress.eixos[nomeEixo]) return progress.eixos[nomeEixo];
    const tree = await api(token, 'GET', `/catalogos/${catalogoId}`);
    const achado = tree.eixos.find((e) => e.name === nomeEixo);
    const id = achado
      ? achado.id
      : (await api(token, 'POST', `/catalogos/${catalogoId}/eixos`, {
          name: nomeEixo,
          description: descricaoPorModulo.get(nomeEixo) || undefined,
        })).id;
    progress.eixos[nomeEixo] = id;
    await saveProgress(progress);
    return id;
  }

  async function getOrCreateColecao(eixoId, nomeEixo, nomeColecao) {
    const chave = `${nomeEixo}::${nomeColecao}`;
    if (progress.colecoes[chave]) return progress.colecoes[chave];
    const tree = await api(token, 'GET', `/catalogos/${catalogoId}`);
    const eixoNode = tree.eixos.find((e) => e.id === eixoId);
    const achado = eixoNode?.colecoes.find((c) => c.name === nomeColecao);
    const id = achado ? achado.id : (await api(token, 'POST', `/eixos/${eixoId}/colecoes`, { name: nomeColecao })).id;
    progress.colecoes[chave] = id;
    await saveProgress(progress);
    return id;
  }

  for (const item of dataset.itens) {
    if (progress.itens[item.id]) {
      skipped++;
      continue;
    }
    try {
      const eixoId = await getOrCreateEixo(item.modulo);
      const colecaoId = await getOrCreateColecao(eixoId, item.modulo, item.categoria);

      const payload = buildPayload(item, item.modulo);
      const conteudo = await api(token, 'POST', `/colecoes/${colecaoId}/conteudos`, payload);
      progress.itens[item.id] = conteudo.id;
      created++;
      if (created % 10 === 0) await saveProgress(progress);
    } catch (err) {
      failed++;
      errors.push({ id: item.id, titulo: item.titulo, error: String(err) });
    }
  }

  await saveProgress(progress);
  console.log(JSON.stringify({ created, skipped, failed, errors }, null, 2));
}

async function main() {
  const datasetPath = process.argv[2];
  if (!datasetPath) {
    console.error('Uso: node scripts/import-legado.mjs <caminho-do-dataset.json>');
    process.exitCode = 1;
    return;
  }
  const dataset = JSON.parse(await readFile(datasetPath, 'utf8'));

  if (DRY_RUN) {
    runDryRun(dataset);
  } else {
    await runImport(dataset);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
