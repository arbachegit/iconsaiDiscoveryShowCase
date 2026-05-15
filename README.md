# iconsaiDiscoveryShowCase

Página showcase do **Icons.ai · Discovery** — animação canônica (estilo Canopy intro) com 5 cenas que apresentam a busca semântica governamental.

- **Stack:** Next.js 15 + React 19 + TypeScript strict
- **basePath:** `/discovery` (rota final `icon.iconsai.ai/discovery`)
- **Porta dev:** `3102`
- **Accent:** `#3b82f6` (azul)

## Desenvolvimento

```bash
npm install
npm run dev
# http://localhost:3102/discovery
```

## Deploy

1. `npm run build`
2. `rsync .next/standalone/ .next/static/ public/ root@<droplet>:/opt/iconsai-discovery-showcase/app/ --delete`
3. systemd unit `iconsai-discovery-showcase.service`
4. Caddy: `icon.iconsai.ai/discovery/*` → `127.0.0.1:3102/discovery/*`

## Cenas (5)

1. Hero "Pergunte, sem formulário" + typewriter
2. Hero "A IA roteia. Sem fila." + prompt
3. Dialog overlay — "RAG · 1.331 SERVIÇOS · 12 ESTADOS"
4. Browser gallery — catálogo de serviços
5. Deck slide + Share & Export

Editar `components/canopy-intro/scenes.ts` para mudar o roteiro.

CanopyIntro é compartilhado entre 6 ShowCases. Sincronize ao editar.
