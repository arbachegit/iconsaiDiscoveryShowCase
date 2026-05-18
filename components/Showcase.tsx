'use client'

/**
 * Discovery Showcase — v2 (2026-05-17).
 *
 * Refatorado para usar o shell canônico <ShowcaseShell> de
 * iconsaiShowcaseShell. Conteúdo das 11 cenas mantido idêntico ao v1;
 * toda a infra de viewport / progress / chevrons / chips vem do shell.
 *
 * Timeline (120s loop):
 *   - Cena 00 (0-20s): Abertura tipográfica (3 quotes typing)
 *   - Cenas 01-10 (20-120s, 10s cada): Telas reais com sidebar persistente
 */

import { useState } from 'react'
import { ShowcaseShell, type ShowcaseScene } from './showcase-shell'
import './Showcase.css'

const DSC_CYCLE_MS = 120_000

interface DscNavScene {
  startMs: number
  step: string
  label: string
}

const DSC_NAV: DscNavScene[] = [
  { startMs:      0, step: '00', label: 'Abertura' },
  { startMs:  20_000, step: '01', label: 'Hero · ai.discovery' },
  { startMs:  30_000, step: '02', label: 'CNPJ · identificação' },
  { startMs:  40_000, step: '03', label: 'Busca cruzada' },
  { startMs:  50_000, step: '04', label: 'Ficha + sócios' },
  { startMs:  60_000, step: '05', label: 'Identificação' },
  { startMs:  70_000, step: '06', label: 'Áudio livre' },
  { startMs:  80_000, step: '07', label: 'Chat · 22 perguntas' },
  { startMs:  90_000, step: '08', label: 'Análise stepper' },
  { startMs: 100_000, step: '09', label: 'Laudo executivo' },
  { startMs: 110_000, step: '10', label: 'Handoff Xray' },
]

/* ═════════════════════════════════════════════════════════════════════
   HELPERS
   ═════════════════════════════════════════════════════════════════════ */

function DscTw({
  text,
  startMs,
  endMs,
  entryDelayMs,
  perWordMs,
  uid,
  className,
}: {
  text: string
  startMs: number
  endMs: number
  entryDelayMs: number
  perWordMs: number
  uid: string
  className: string
}) {
  const words = text.split(/(\s+)/)
  const css: string[] = []
  const spans: React.ReactNode[] = []
  let visibleIdx = 0
  words.forEach((w, i) => {
    if (!w.trim()) {
      spans.push(<span key={i}>{w}</span>)
      return
    }
    const wordOnMs = startMs + entryDelayMs + visibleIdx * perWordMs
    const wordOffMs = endMs
    const onPct = (wordOnMs / DSC_CYCLE_MS) * 100
    const onFullPct = Math.min(100, onPct + 0.05)
    const offPct = (wordOffMs / DSC_CYCLE_MS) * 100
    const offFullPct = Math.min(100, offPct + 0.3)
    const prePct = Math.max(0, onPct - 0.001)
    const kfName = `dsc-tw-${uid}-${visibleIdx}`
    css.push(`@keyframes ${kfName} {
      0% { opacity: 0; }
      ${prePct.toFixed(4)}% { opacity: 0; }
      ${onPct.toFixed(4)}% { opacity: 0; }
      ${onFullPct.toFixed(4)}% { opacity: 1; }
      ${offPct.toFixed(4)}% { opacity: 1; }
      ${offFullPct.toFixed(4)}% { opacity: 0; }
      100% { opacity: 0; }
    }`)
    spans.push(
      <span
        key={i}
        className="dsc-tw-word"
        style={{
          animationName: kfName,
          animationDuration: `${DSC_CYCLE_MS}ms`,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'linear',
          animationFillMode: 'both',
        }}
      >
        {w}
      </span>
    )
    visibleIdx++
  })
  const caretOnMs = startMs + entryDelayMs
  const caretOffMs = endMs
  const caretOnPct = (caretOnMs / DSC_CYCLE_MS) * 100
  const caretOffPct = (caretOffMs / DSC_CYCLE_MS) * 100
  const caretKf = `dsc-tw-caret-${uid}`
  css.push(`@keyframes ${caretKf} {
    0%, ${Math.max(0, caretOnPct - 0.001).toFixed(4)}% { opacity: 0; }
    ${caretOnPct.toFixed(4)}% { opacity: 1; }
    ${caretOffPct.toFixed(4)}% { opacity: 1; }
    ${Math.min(100, caretOffPct + 0.05).toFixed(4)}%, 100% { opacity: 0; }
  }`)
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css.join('\n') }} />
      <span className={className}>
        {spans}
        <span
          className="dsc-tw-caret"
          aria-hidden="true"
          style={{
            animationName: caretKf,
            animationDuration: `${DSC_CYCLE_MS}ms`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            animationFillMode: 'both',
          }}
        >
          ▌
        </span>
      </span>
    </>
  )
}

function Radar({ label, pct, cls }: { label: string; pct: number; cls: string }) {
  const r = 26
  const c = 2 * Math.PI * r
  const offset = c - (c * pct) / 100
  return (
    <div className={`dsc-radar-card ${cls}`}>
      <svg viewBox="0 0 68 68" className="dsc-radar-svg">
        <circle cx="34" cy="34" r={r} className="dsc-radar-track" />
        <circle
          cx="34"
          cy="34"
          r={r}
          className="dsc-radar-fill"
          style={{ strokeDasharray: c, strokeDashoffset: offset }}
        />
        <text x="34" y="38" textAnchor="middle" className="dsc-radar-pct">
          {pct}
        </text>
      </svg>
      <span className="dsc-radar-label">{label}</span>
    </div>
  )
}

/* Sidebar persistente das cenas 01-10. Recebe activeStep + caption pra
 * destacar o passo certo e renderizar o caption typewriter daquela cena. */
function DiscoverySidebar({
  activeStep,
  scene,
}: {
  activeStep: number
  scene: { step: string; title: string; desc: string; startMs: number; endMs: number; uid: string }
}) {
  const TITLE_ENTRY = 500
  const TITLE_TW = 1400
  const DESC_ENTRY = TITLE_ENTRY + TITLE_TW + 200
  const titlePerWord = Math.min(140, TITLE_TW / Math.max(1, scene.title.split(/\s+/).length))
  const descPerWord = Math.min(110, 2400 / Math.max(1, scene.desc.split(/\s+/).length))
  const steps = [
    '01 Abertura', '02 CNPJ', '03 Busca cruzada', '04 Ficha + sócios',
    '05 Identificação', '06 Áudio livre', '07 Chat 22 perguntas',
    '08 Análise', '09 Laudo', '10 Handoff Xray',
  ]
  return (
    <aside className="dsc-sidebar">
      <div className="dsc-side-head">
        <div className="dsc-side-logo">
          <span className="dsc-logo-mark">i.ai</span>
          <span className="dsc-logo-sep">·</span>
          <span className="dsc-logo-word">discovery</span>
        </div>
        <div className="dsc-side-meta">v1 · diagnóstico · 5 min · com fontes</div>
      </div>

      <ol className="dsc-side-steps">
        {steps.map((label, i) => {
          const [num, ...rest] = label.split(' ')
          const isActive = i + 1 === activeStep
          return (
            <li key={i} className={`dsc-side-step${isActive ? ' is-active' : ''}`}>
              <span>{num}</span> {rest.join(' ')}
            </li>
          )
        })}
      </ol>

      <div className="dsc-side-foot">
        <div className="dsc-foot-row"><span>83M</span> pessoas</div>
        <div className="dsc-foot-row"><span>67M</span> empresas</div>
        <div className="dsc-foot-row"><span>QSA</span> sócios RF</div>
      </div>

      <div className="dsc-caption-stage" aria-hidden="true">
        <div className="dsc-caption is-active">
          <div className="dsc-caption-step">{scene.step}</div>
          <DscTw
            text={scene.title}
            startMs={scene.startMs}
            endMs={scene.endMs}
            entryDelayMs={TITLE_ENTRY}
            perWordMs={titlePerWord}
            uid={`t-${scene.uid}`}
            className="dsc-caption-title"
          />
          <DscTw
            text={scene.desc}
            startMs={scene.startMs}
            endMs={scene.endMs}
            entryDelayMs={DESC_ENTRY}
            perWordMs={descPerWord}
            uid={`d-${scene.uid}`}
            className="dsc-caption-desc"
          />
        </div>
      </div>
    </aside>
  )
}

/* Wrapper de cena PART 2 — grid sidebar + stage com 1 artigo só. */
function Act2Scene({
  activeStep,
  caption,
  children,
}: {
  activeStep: number
  caption: { step: string; title: string; desc: string; startMs: number; endMs: number; uid: string }
  children: React.ReactNode
}) {
  return (
    <section className="dsc-act2">
      <DiscoverySidebar activeStep={activeStep} scene={caption} />
      <main className="dsc-stage">{children}</main>
    </section>
  )
}

const CAPTIONS = [
  { step: '01 / 10', title: 'Abertura · ai.discovery', desc: 'A IA explica em 5 minutos o que sua empresa precisa para crescer. Diagnóstico com fontes reais — não opinião.' },
  { step: '02 / 10', title: 'CNPJ · identificação', desc: 'Você digita o CNPJ. A IA preenche tudo automaticamente: razão social, sócios, endereço — direto da Receita Federal.' },
  { step: '03 / 10', title: 'Busca cruzada', desc: '83M de pessoas e 67M de empresas consultadas em paralelo. dim_pessoas, dim_empresas e QSA respondem em milissegundos.' },
  { step: '04 / 10', title: 'Ficha + sócios', desc: 'A ficha completa aparece com sócios canônicos da RF, vínculos societários e dados cadastrais consolidados.' },
  { step: '05 / 10', title: 'Identificação', desc: 'Confirmação cruzada para evitar fraude. Nome mascarado primeiro, depois cleartext só após validação.' },
  { step: '06 / 10', title: 'Áudio livre', desc: 'Você fala 60 segundos sobre os desafios da empresa. Sem perguntas guiadas — só sua voz e seu contexto.' },
  { step: '07 / 10', title: 'Chat · 22 perguntas', desc: 'A IA conduz 22 perguntas estruturadas baseadas no que você falou. Cada resposta vira evidência para o laudo.' },
  { step: '08 / 10', title: 'Análise stepper', desc: 'Pipeline executivo de IA processa tudo: grafo, problemas, soluções, ROI. Você acompanha cada etapa em tempo real.' },
  { step: '09 / 10', title: 'Laudo executivo', desc: 'Relatório final com diagnóstico, fontes ABNT e plano de ação. Score de saúde, prioridades, próximos passos.' },
  { step: '10 / 10', title: 'Handoff Xray', desc: 'Discovery vira insumo do Xray. Empresa cadastrada, grafo populado, taxonomias prontas — tudo no Hub.' },
]

type DiscoveryFounder = {
  id: string
  name: string
  role: string
  detail: string
  badge?: string
  accent: string
  nextStep: string
  nextStepHint: string
  identityPath: string
  readiness: string
  evidence: Array<{ label: string; value: string }>
  checklist: string[]
}

const DSC_FOUNDERS: DiscoveryFounder[] = [
  {
    id: 'fernando-arbache',
    name: 'FERNANDO ARBACHE',
    role: 'Sócio-Administrador',
    detail: '49 · representante legal principal',
    accent: '#22d3ee',
    nextStep: 'Abrir identificação assistida do representante legal',
    nextStepHint: 'Pré-preencher CPF, e-mail e WhatsApp para entrar direto na validação cruzada.',
    identityPath: 'step 05 · formulário executivo pronto',
    readiness: '98.4% match · QSA + CNPJ + contato corporativo',
    evidence: [
      { label: 'canal', value: 'fernando@magisa.tech' },
      { label: 'whatsapp', value: '(21) 99876-4521' },
      { label: 'ação', value: 'seguir para identificação' },
    ],
    checklist: [
      'Liberar CPF em cleartext',
      'Confirmar WhatsApp e e-mail corporativo',
      'Criar sessão guiada para o questionário',
    ],
  },
  {
    id: 'holding-arbache',
    name: 'HOLDING ARBACHE PARTICIPAÇÕES LTDA',
    role: 'Sócia Quotista',
    detail: 'Pessoa jurídica controladora',
    badge: 'PJ',
    accent: '#a78bfa',
    nextStep: 'Solicitar representante humano vinculado à holding',
    nextStepHint: 'Como a titularidade é PJ, o fluxo precisa localizar o procurador ou administrador autorizado.',
    identityPath: 'step 05 · pedir procurador da quota',
    readiness: '81.2% match · quadro societário batido',
    evidence: [
      { label: 'origem', value: 'QSA Receita Federal' },
      { label: 'pendência', value: 'procurador não identificado' },
      { label: 'ação', value: 'pedir contato humano' },
    ],
    checklist: [
      'Escolher representante da holding',
      'Anexar documento de vínculo societário',
      'Só então abrir a identificação pessoal',
    ],
  },
  {
    id: 'maria-clara-campos',
    name: 'MARIA CLARA CAMPOS',
    role: 'Diretora de Operações',
    detail: '32 · contato operacional elegível',
    accent: '#f97316',
    nextStep: 'Validar se a diretora pode responder pelo diagnóstico',
    nextStepHint: 'Ela acelera o questionário, mas precisa de autorização se não for a representante legal oficial.',
    identityPath: 'step 05 · checar alçada operacional',
    readiness: '88.7% match · vínculo ativo no domínio da empresa',
    evidence: [
      { label: 'canal', value: 'maria.campos@magisa.tech' },
      { label: 'perfil', value: 'liderança com acesso à operação' },
      { label: 'ação', value: 'validar alçada antes de seguir' },
    ],
    checklist: [
      'Confirmar alçada para responder',
      'Registrar autorização do sócio-administrador',
      'Entrar no formulário com foco operacional',
    ],
  },
]

function captionForScene(idx0Based: number) {
  // idx0Based = 1..10 corresponde a cenas product (CAPTIONS[0]..CAPTIONS[9])
  const c = CAPTIONS[idx0Based - 1]
  const startMs = 20_000 + (idx0Based - 1) * 10_000
  const endMs = startMs + 10_000 - 100
  return { ...c, startMs, endMs, uid: `s${idx0Based}` }
}

/* ═════════════════════════════════════════════════════════════════════
   SCENE RENDERERS
   ═════════════════════════════════════════════════════════════════════ */

function RenderOpening() {
  return (
    <section className="dsc-opening">
      <div className="dsc-kicker">
        <span className="dsc-dot" />
        DISCOVERY · DIAGNÓSTICO EMPRESARIAL
      </div>

      <h1 className="dsc-wordmark">ai.discovery</h1>

      <div className="dsc-quotes">
        <p className="dsc-quote dsc-q1">
          <span className="dsc-tw">Cansado de consultores que passam meses buscando seus problemas?</span>
        </p>
        <p className="dsc-quote dsc-q2">
          <span className="dsc-tw">Exausto de métodos que não têm a cara da sua empresa?</span>
        </p>
        <p className="dsc-quote dsc-q3">
          <span className="dsc-tw">
            Um executivo IA descobre tudo em <em>1 minuto</em> — e trabalha conectado ao Xray.
          </span>
        </p>
      </div>

      <p className="dsc-closer">
        Capacidade de aprendizado <em>inimaginável</em>. Em 5 a 10 minutos faz perguntas que
        fazem todo sentido. Entrega soluções pra tornar sua empresa <b>eficiente</b>,
        <b> otimizada</b>, <b>criativa</b> e <b>lucrativa</b>.
      </p>
    </section>
  )
}

function RenderHero() {
  return (
    <Act2Scene activeStep={1} caption={captionForScene(1)}>
      <article className="dsc-scene dsc-sc1" aria-label="Hero">
        <div className="dsc-hero">
          <div className="dsc-hero-logo">
            <span className="dsc-hero-glyph" aria-hidden />
          </div>
          <h2 className="dsc-hero-wordmark">ai.discovery</h2>
          <div className="dsc-hero-meta">
            <span className="dsc-hero-line" />
            <span>diagnóstico · 5 min · com fontes</span>
          </div>
          <div className="dsc-hero-cta">
            <span className="dsc-hero-cta-label">CNPJ</span>
            <span className="dsc-hero-cta-input">00.000.000/0000-00</span>
          </div>
        </div>
      </article>
    </Act2Scene>
  )
}

function RenderCNPJ() {
  return (
    <Act2Scene activeStep={2} caption={captionForScene(2)}>
      <article className="dsc-scene dsc-sc2" aria-label="CNPJ">
        <div className="dsc-screen">
          <div className="dsc-step-row">
            <span className="dsc-step-num">step 02</span>
            <span className="dsc-step-pipe" />
            <span className="dsc-step-name">cnpj · identificação</span>
          </div>
          <div className="dsc-cnpj-label-row">
            <h3 className="dsc-cnpj-label">CNPJ</h3>
            <span className="dsc-cnpj-counter">14 / 14</span>
          </div>
          <div className="dsc-cnpj-field">
            <span className="dsc-cnpj-tw">11.555.231/0001-08</span>
            <span className="dsc-cnpj-caret" />
          </div>
          <button className="dsc-cnpj-btn" disabled aria-hidden>
            <span>Buscar empresa</span>
            <span className="dsc-arrow">→</span>
          </button>
        </div>
      </article>
    </Act2Scene>
  )
}

function RenderLookup() {
  return (
    <Act2Scene activeStep={3} caption={captionForScene(3)}>
      <article className="dsc-scene dsc-sc3" aria-label="Busca cruzada">
        <div className="dsc-lookup">
          <div className="dsc-donut" role="progressbar" aria-label="Cruzando bases">
            <svg className="dsc-donut-svg" viewBox="0 0 120 120" aria-hidden>
              <defs>
                <linearGradient id="dscDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="55%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <circle className="dsc-donut-track" cx="60" cy="60" r="52" />
              <circle className="dsc-donut-arc" cx="60" cy="60" r="52" />
            </svg>
            <div className="dsc-donut-center">
              <span className="dsc-donut-time">
                <span className="dsc-donut-time-running">1.4s</span>
                <span className="dsc-donut-time-done">3.2s</span>
                <span className="dsc-donut-check" aria-hidden>✓</span>
              </span>
            </div>
          </div>
          <p className="dsc-lookup-status">
            <span className="dsc-lookup-status-running">Cruzando dados…</span>
            <span className="dsc-lookup-status-done">Encontrado em 3.2s</span>
          </p>
          <p className="dsc-lookup-indicator">
            Cruzando <b>83M pessoas</b> · <b>67M empresas</b> · <b>QSA</b>
          </p>
          <div className="dsc-lookup-stats">
            <div className="dsc-ls-row">
              <span className="dsc-ls-label">dim_pessoas</span>
              <span className="dsc-ls-value">83.412.907</span>
              <span className="dsc-ls-tick" />
            </div>
            <div className="dsc-ls-row">
              <span className="dsc-ls-label">dim_empresas</span>
              <span className="dsc-ls-value">67.219.044</span>
              <span className="dsc-ls-tick" />
            </div>
            <div className="dsc-ls-row">
              <span className="dsc-ls-label">fato_qsa</span>
              <span className="dsc-ls-value">cruzando sócios RF</span>
              <span className="dsc-ls-tick" />
            </div>
          </div>
        </div>
      </article>
    </Act2Scene>
  )
}

function RenderConfirm() {
  const [selectedFounderId, setSelectedFounderId] = useState(DSC_FOUNDERS[0]?.id ?? '')
  const selectedFounder =
    DSC_FOUNDERS.find((founder) => founder.id === selectedFounderId) ?? DSC_FOUNDERS[0]

  return (
    <Act2Scene activeStep={4} caption={captionForScene(4)}>
      <article className="dsc-scene dsc-sc4" aria-label="Ficha empresa">
        <div className="dsc-screen dsc-confirm">
          <div className="dsc-step-row">
            <span className="dsc-step-num">dossiê · step 02</span>
            <span className="dsc-step-pipe" />
            <span className="dsc-step-name">confirmar identidade</span>
          </div>
          <h3 className="dsc-confirm-h1">Achamos sua empresa.</h3>

          <div className="dsc-confirm-grid">
            <div className="dsc-confirm-col">
              <span className="dsc-mono">razão social</span>
              <div className="dsc-confirm-razao">MAGISA TECH AI LTDA</div>
              <span className="dsc-mono dsc-mono-mt">nome fantasia</span>
              <div className="dsc-confirm-fantasia">MagisaTech</div>
            </div>
            <div className="dsc-confirm-col dsc-confirm-col-r">
              <span className="dsc-mono">CNPJ</span>
              <div className="dsc-confirm-cnpj">11.555.231/0001-08</div>
              <div className="dsc-confirm-meta">
                <span><b>setor ·</b> Desenvolvimento de software sob encomenda</span>
                <span><b>porte ·</b> Demais (sociedade limitada)</span>
              </div>
            </div>
          </div>

          <div className="dsc-socio-head">
            <span>Sócios / Fundadores</span>
            <span className="dsc-socio-source">via QSA · RF</span>
          </div>

          <div className="dsc-confirm-bottom">
            <ul className="dsc-socio-list" aria-label="Selecione quem vai seguir no fluxo">
              {DSC_FOUNDERS.map((founder) => {
                const isSelected = founder.id === selectedFounder.id
                return (
                  <li key={founder.id}>
                    <button
                      type="button"
                      className={`dsc-socio${isSelected ? ' is-selected' : ''}`}
                      style={{ ['--dsc-founder-accent' as string]: founder.accent } as React.CSSProperties}
                      onClick={() => setSelectedFounderId(founder.id)}
                      aria-pressed={isSelected}
                    >
                      <span className="dsc-radio" aria-hidden />
                      <span className="dsc-socio-info">
                        <b>{founder.name}</b>
                        <span>
                          {founder.badge && <span className="dsc-pj-badge">{founder.badge}</span>}
                          {founder.role}
                        </span>
                        <span>{founder.detail}</span>
                      </span>
                      <span className="dsc-socio-pick">
                        {isSelected ? 'Selecionado' : 'Abrir fluxo'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <aside
              key={selectedFounder.id}
              className="dsc-confirm-panel"
              style={{ ['--dsc-founder-accent' as string]: selectedFounder.accent } as React.CSSProperties}
              aria-live="polite"
            >
              <div className="dsc-confirm-panel-top">
                <span className="dsc-confirm-panel-kicker">Próximo passo</span>
                <span className="dsc-confirm-panel-status">{selectedFounder.readiness}</span>
              </div>

              <div className="dsc-confirm-panel-body">
                <div className="dsc-confirm-panel-title">
                  <span className="dsc-confirm-panel-path">{selectedFounder.identityPath}</span>
                  <h4>{selectedFounder.nextStep}</h4>
                  <p>{selectedFounder.nextStepHint}</p>
                </div>

                <div className="dsc-confirm-evidence">
                  {selectedFounder.evidence.map((item) => (
                    <div key={item.label} className="dsc-confirm-evidence-card">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="dsc-confirm-preview">
                  <div className="dsc-confirm-preview-head">
                    <span className="dsc-confirm-preview-dot" />
                    <span>Prévia do formulário liberado</span>
                  </div>
                  <ol className="dsc-confirm-checklist">
                    {selectedFounder.checklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </Act2Scene>
  )
}

function RenderIdent() {
  return (
    <Act2Scene activeStep={5} caption={captionForScene(5)}>
      <article className="dsc-scene dsc-sc5" aria-label="Identificação">
        <div className="dsc-screen dsc-ident">
          <div className="dsc-step-row">
            <span className="dsc-step-num">identificação · MagisaTech</span>
          </div>
          <h3 className="dsc-ident-h1">
            Quem está respondendo por <span className="dsc-accent">MagisaTech</span>?
          </h3>

          <div className="dsc-ident-grid">
            <div className="dsc-field dsc-f1">
              <label>Nome completo</label>
              <div className="dsc-input">Fernando Arbache</div>
            </div>
            <div className="dsc-field dsc-f2">
              <label>E-mail</label>
              <div className="dsc-input">fernando@magisa.tech</div>
            </div>
            <div className="dsc-field dsc-f3">
              <label>WhatsApp</label>
              <div className="dsc-input">(21) 99876-4521</div>
            </div>
            <div className="dsc-field dsc-f4 dsc-field-cpf">
              <label>CPF</label>
              <div className="dsc-input dsc-input-cpf">
                <span className="dsc-cpf-digits">071.412.886-45</span>
                <span className="dsc-cpf-status">
                  <span className="dsc-cpf-spin" />
                  <span>validando · Idwall</span>
                </span>
                <span className="dsc-cpf-ok">
                  <span className="dsc-cpf-check">✓</span>
                  <span>CPF válido · nome bate</span>
                </span>
              </div>
            </div>
            <div className="dsc-field dsc-f5">
              <label>Cargo</label>
              <div className="dsc-input">Sócio-Administrador</div>
            </div>
          </div>
        </div>
      </article>
    </Act2Scene>
  )
}

function RenderAudio() {
  return (
    <Act2Scene activeStep={6} caption={captionForScene(6)}>
      <article className="dsc-scene dsc-sc6" aria-label="Áudio livre">
        <div className="dsc-screen dsc-audio">
          <div className="dsc-step-row">
            <span className="dsc-step-num">step 04 · áudio livre</span>
          </div>
          <h3 className="dsc-audio-h1">Queremos te escutar.</h3>
          <p className="dsc-audio-sub">
            Olá Fernando, tudo bem? Aqui você pode falar o que quiser. Abra a sua cabeça e
            diga tudo que enxerga de bom e o que precisa melhorar.
          </p>

          <div className="dsc-spectrum">
            {Array.from({ length: 24 }).map((_, k) => <span key={k} className="dsc-bar" />)}
          </div>

          <div className="dsc-mic-row">
            <button className="dsc-mic" aria-hidden>
              <span className="dsc-mic-pulse" />
              <span className="dsc-mic-glyph" />
            </button>
            <div className="dsc-mic-meta">
              <span className="dsc-mic-state">gravando · 00:18</span>
              <span className="dsc-mic-hint">transcrevendo em tempo real</span>
            </div>
          </div>

          <div className="dsc-transcript">
            <span className="dsc-transcript-label">Transcrição em tempo real</span>
            <p className="dsc-transcript-body">
              {[
                'A', 'operação', 'cresceu', 'rápido', 'demais.', 'A', 'gente', 'perdeu', 'o',
                'controle', 'de', 'margem', 'em', 'quatro', 'contratos.', 'O', 'time',
                'comercial', 'vende', 'sem', 'consultar', 'delivery,', 'e', 'o', 'CTO',
                'concentra', 'know-how', 'crítico.', 'Precisamos', 'de', 'um', 'diagnóstico',
                'honesto.',
              ].map((w, i) => (
                <span key={i}>
                  <span className={`dsc-tw-w dsc-tw-w-${i + 1}`}>{w}</span>{' '}
                </span>
              ))}
              <span className="dsc-tw-caret" />
            </p>
          </div>
        </div>
      </article>
    </Act2Scene>
  )
}

function RenderChat() {
  return (
    <Act2Scene activeStep={7} caption={captionForScene(7)}>
      <article className="dsc-scene dsc-sc7" aria-label="Chat 22 perguntas">
        <div className="dsc-screen dsc-chat">
          <div className="dsc-chat-head">
            <span className="dsc-step-num">chat · 22 perguntas</span>
            <span className="dsc-chat-progress">
              <span className="dsc-chat-bar"><span className="dsc-chat-bar-fill" /></span>
              <span className="dsc-chat-pct">07 / 22</span>
            </span>
          </div>

          <div className="dsc-msgs">
            <div className="dsc-msg dsc-msg-1" data-dim="operacao">
              <span className="dsc-msg-tag">OPERAÇÃO</span>
              Qual o gargalo de capacidade que mais te tira o sono hoje?
            </div>
            <div className="dsc-msg dsc-msg-2" data-dim="pessoas">
              <span className="dsc-msg-tag">PESSOAS</span>
              Em que time você perderia mais valor se alguém sênior saísse amanhã?
            </div>
            <div className="dsc-msg dsc-msg-3" data-dim="financeiro">
              <span className="dsc-msg-tag">FINANCEIRO</span>
              O que aconteceria com sua margem se cair 15% de receita por 3 meses?
            </div>
            <div className="dsc-msg dsc-msg-4" data-dim="tecnologia">
              <span className="dsc-msg-tag">TECNOLOGIA</span>
              Quais sistemas viraram débito técnico — você sabe mas finge que não viu?
            </div>
            <div className="dsc-msg dsc-msg-5" data-dim="mercado">
              <span className="dsc-msg-tag">MERCADO</span>
              Quem é o concorrente que te faz mudar preço sem você admitir?
            </div>
            <div className="dsc-msg dsc-msg-6" data-dim="reputacao">
              <span className="dsc-msg-tag">REPUTAÇÃO</span>
              Qual cliente, se reclamasse publicamente, doeria mais?
            </div>
          </div>
        </div>
      </article>
    </Act2Scene>
  )
}

function RenderAnalyze() {
  return (
    <Act2Scene activeStep={8} caption={captionForScene(8)}>
      <article className="dsc-scene dsc-sc8" aria-label="Análise">
        <div className="dsc-screen dsc-analyze">
          <div className="dsc-step-row">
            <span className="dsc-step-num">step 06 · análise · executivo IA</span>
          </div>
          <h3 className="dsc-analyze-h1">Cruzando as respostas com o universo.</h3>

          <ul className="dsc-stepper">
            {[
              'Coletando respostas e áudio',
              'Analisando 6 dimensões',
              'Cruzando com benchmark setorial',
              'Gerando insights priorizados',
              'Pronto · laudo + handoff',
            ].map((name, i) => (
              <li key={i} className={`dsc-st dsc-st-${i + 1}`}>
                <span className="dsc-st-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="dsc-st-name">{name}</span>
                <span className="dsc-st-bar"><span className="dsc-st-fill" /></span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </Act2Scene>
  )
}

function RenderLaudo() {
  return (
    <Act2Scene activeStep={9} caption={captionForScene(9)}>
      <article className="dsc-scene dsc-sc9" aria-label="Laudo">
        <div className="dsc-screen dsc-laudo">
          <div className="dsc-step-row">
            <span className="dsc-step-num">laudo · MagisaTech</span>
          </div>

          <div className="dsc-laudo-top">
            <div className="dsc-idx">
              <span className="dsc-idx-num">49</span>
              <span className="dsc-idx-label">Índice Discovery</span>
              <span className="dsc-idx-tag">emergente</span>
            </div>

            <div className="dsc-radars">
              <Radar label="Operação" pct={56} cls="dsc-r-op" />
              <Radar label="Pessoas" pct={62} cls="dsc-r-pe" />
              <Radar label="Financeiro" pct={41} cls="dsc-r-fi" />
              <Radar label="Tecnologia" pct={37} cls="dsc-r-te" />
              <Radar label="Mercado" pct={58} cls="dsc-r-me" />
              <Radar label="Reputação" pct={71} cls="dsc-r-re" />
            </div>
          </div>

          <div className="dsc-insights">
            <div className="dsc-ins dsc-ins-1">
              <span className="dsc-ins-tag" data-dim="financeiro">FINANCEIRO</span>
              Margem por contrato sem rastreabilidade — 4 contratos em risco silencioso.
            </div>
            <div className="dsc-ins dsc-ins-2">
              <span className="dsc-ins-tag" data-dim="tecnologia">TECNOLOGIA</span>
              Stack legada concentra know-how em 1 pessoa sênior — single point of failure.
            </div>
            <div className="dsc-ins dsc-ins-3">
              <span className="dsc-ins-tag" data-dim="operacao">OPERAÇÃO</span>
              Gargalo de capacidade em delivery — pipeline cresce 2× a entrega.
            </div>
          </div>
        </div>
      </article>
    </Act2Scene>
  )
}

function RenderHandoff() {
  return (
    <Act2Scene activeStep={10} caption={captionForScene(10)}>
      <article className="dsc-scene dsc-sc10" aria-label="Handoff Xray">
        <div className="dsc-handoff">
          <div className="dsc-hand-from">
            <div className="dsc-hand-logo">ai.discovery</div>
            <div className="dsc-hand-payload">
              <span className="dsc-mono">payload · diag_session#a7e3</span>
              <div className="dsc-payload-row"><span>cnpj</span><span>11.555.231/0001-08</span></div>
              <div className="dsc-payload-row"><span>respondente</span><span>Fernando Arbache</span></div>
              <div className="dsc-payload-row"><span>índice</span><span>49 · emergente</span></div>
              <div className="dsc-payload-row"><span>insights</span><span>3 priorizados</span></div>
              <div className="dsc-payload-row"><span>turnos</span><span>22 · 6 dim</span></div>
            </div>
          </div>

          <div className="dsc-hand-arrow" aria-hidden>
            <span className="dsc-arrow-line" />
            <span className="dsc-arrow-head">→</span>
            <span className="dsc-arrow-label">handoff</span>
          </div>

          <div className="dsc-hand-to">
            <div className="dsc-hand-logo dsc-hand-logo-x">ai.xray</div>
            <div className="dsc-xray-url">xray.iconsai.ai/empresa/11555231000108</div>
            <div className="dsc-xray-ready">
              <span className="dsc-xray-dot" /> empresa pronta · executivo IA online
            </div>
          </div>
        </div>
      </article>
    </Act2Scene>
  )
}

/* ═════════════════════════════════════════════════════════════════════
   SCENES — composição pro shell
   ═════════════════════════════════════════════════════════════════════ */

const RENDERERS: Array<() => React.ReactNode> = [
  RenderOpening, RenderHero, RenderCNPJ, RenderLookup, RenderConfirm,
  RenderIdent, RenderAudio, RenderChat, RenderAnalyze, RenderLaudo, RenderHandoff,
]

const DSC_SCENES: ShowcaseScene[] = DSC_NAV.map((sc, i) => {
  const next = i + 1 < DSC_NAV.length ? DSC_NAV[i + 1].startMs : DSC_CYCLE_MS
  const Renderer = RENDERERS[i]
  return {
    id: sc.step,
    startMs: sc.startMs,
    durationMs: next - sc.startMs,
    label: sc.label,
    render: () => <Renderer />,
  }
})

export default function Showcase() {
  return (
    <ShowcaseShell
      scenes={DSC_SCENES}
      accentColor="#22d3ee"
      productEyebrow="DISCOVERY · DIAGNÓSTICO EMPRESARIAL"
      productName="ai.discovery"
    />
  )
}
