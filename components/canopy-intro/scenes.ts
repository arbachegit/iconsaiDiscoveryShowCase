import type { CanopyScene } from './CanopyIntro'

export const PRODUCT_NAME = 'Icons.ai · Discovery'
export const PRODUCT_TAGLINE = 'Busca semântica governamental — cidadão pergunta, IA responde a rota.'
export const PRODUCT_ACCENT = '#3b82f6'
export const CONTINUE_HREF = 'https://icon.iconsai.ai/icon'

const HOLD = 14000

export const SCENES: CanopyScene[] = [
  { bg: '#c8d6e8', hero: 'Cada serviço público, em uma pergunta', mockup: 'prompt', promptText: 'Como tiro segunda via da minha identidade?', hold: HOLD },
  { bg: '#f3ecdc', hero: 'Cidadão pergunta. Governo executa.',  mockup: 'prompt', promptText: 'Quero matricular meu filho na rede pública', hold: HOLD },
  { bg: '#0e1218', caption: 'RAG · 1.331 SERVIÇOS PÚBLICOS · 12 ESTADOS', mockup: 'dialog', browserUrl: 'discovery.iconsai.ai/cidadao', promptText: 'Onde voto neste turno?', hold: HOLD },
  { bg: '#dde4ec', mockup: 'gallery', browserUrl: 'discovery.iconsai.ai/servicos', hold: HOLD },
  { bg: '#dad6e3', mockup: 'deck-export', browserUrl: 'discovery.iconsai.ai/relatorio', hold: HOLD },
]
