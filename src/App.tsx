import { useState } from 'react';
import { AppLayout, Stack, Field, Chip, useLocalStorage, type Meta } from './ui';
import { ask, hasKey } from './lib/ai';

const M: Meta = {
  id: 5, icon: '🚀', title: 'AI 창업 아이템 코치', tagline: '아이디어 한 줄을 넣으면 AI가 린 캔버스·경쟁·리스크·MVP·DFV 점수까지 진단해 줘요',
  members: ['이시민', '조윤서'], color: '#f59e0b', ai: true,
  problem:
    '창업 초기에는 아이디어를 구조화하고 시장성을 검증하는 일이 가장 어렵습니다. ' +
    '본 코치는 분야·고객·단계·키워드를 입력하면 AI가 한 줄 정의부터 린 캔버스, 수익모델, 경쟁사, 리스크와 대응, MVP 단계, ' +
    'DFV(바람직성·실현성·수익성) 점수까지 한 번에 진단하고, 아이디어를 저장해 비교할 수 있게 합니다.',
  features: [
    { icon: '🧩', title: '린 캔버스 자동 작성', desc: '문제·해결·가치·고객·채널·수익·비용을 한눈에' },
    { icon: '📊', title: 'DFV 점수 진단', desc: '바람직성·실현성·수익성을 점수와 막대로 시각화' },
    { icon: '⚔️', title: '경쟁·차별화', desc: '예상 경쟁자와 우리만의 차별점을 정리' },
    { icon: '🛡️', title: '리스크 & 대응', desc: '주요 리스크와 완화 전략을 짝지어 제시' },
    { icon: '🪜', title: 'MVP 로드맵', desc: '가장 작게 검증할 다음 단계들을 제안' },
    { icon: '💾', title: '아이디어 보관·비교', desc: '여러 아이디어를 저장해 점수로 비교' },
  ],
  howto: [
    '(선택) OpenAI API 키를 입력하면 실제 AI 진단이 켜집니다',
    '분야·목표 고객·단계를 고르고 아이디어 키워드를 적습니다',
    '“아이템 진단”을 누르면 캔버스·점수·리스크·MVP가 나옵니다',
    '마음에 드는 아이디어는 저장해 두고 점수로 비교합니다',
  ],
  facts: [
    { value: 'DFV', label: '3축 점수' }, { value: 'Lean', label: '캔버스' }, { value: 'MVP', label: '로드맵' },
    { value: '경쟁', label: '차별화' }, { value: '저장', label: '비교' }, { value: '무키', label: '폴백 동작' },
  ],
  info: [
    { title: '린 캔버스란?', body: 'Ash Maurya가 비즈니스 모델 캔버스를 스타트업용으로 변형한 1페이지 사업 모델 도구입니다. 문제·고객 세그먼트·고유가치제안을 가장 먼저 검증합니다.' },
    { title: 'DFV 프레임', body: 'IDEO·구글의 제품 검증 틀로 Desirability(고객이 원하는가)·Feasibility(만들 수 있는가)·Viability(돈이 되는가) 세 축의 균형을 봅니다.' },
    { title: 'MVP의 핵심', body: 'MVP는 “작게 만든 제품”이 아니라 “핵심 가설을 가장 빨리 검증하는 최소 실험”입니다. 랜딩페이지·수동 운영도 훌륭한 MVP가 됩니다.' },
    { title: '주의', body: 'AI의 시장·경쟁 추정은 참고용입니다. 실제 고객 인터뷰와 데이터로 반드시 교차 검증하세요.' },
  ],
  pipeline: [
    '아이디어 수집 — 분야·고객·단계·키워드를 구조화',
    '진단 합성 — 린 캔버스/DFV/MVP 프레임 + JSON 스키마 강제',
    'GPT 호출 — json_object 로 캔버스·수익모델·경쟁·리스크·MVP·점수 수신',
    '검증·폴백 — 누락 시 휴리스틱 템플릿으로 안전 진단',
    '시각화 — DFV 점수 막대 + 린 캔버스 그리드 + 리스크 매트릭스',
    '관리 — 아이디어 localStorage 저장 → 점수 비교',
  ],
  techNotes: [
    { title: '단일 구조화 진단', body: '캔버스·수익모델·경쟁·리스크·MVP·점수를 한 번의 json_object로 받아 일관된 진단 포맷을 보장합니다.' },
    { title: '점수 정규화', body: 'DFV 점수를 0~100으로 클램프해 막대 너비로 환산, 외부 차트 없이 비교 가능한 시각화를 제공합니다.' },
    { title: '아이디어 비교', body: '저장 아이디어를 종합 점수로 정렬해 의사결정을 돕습니다. 상태는 localStorage에 누적됩니다.' },
    { title: '정적 배포', body: 'Vite + React + TS, GitHub Pages 자동 배포. 백엔드·DB 없이 클라이언트에서 완결됩니다.' },
  ],
  stack: ['React 18', 'TypeScript', 'Vite', 'OpenAI GPT', 'localStorage'],
  links: [
    { label: 'Lean Canvas (Leanstack)', url: 'https://leanstack.com/lean-canvas' },
    { label: 'K-Startup', url: 'https://www.k-startup.go.kr' },
  ],
};

const FIELDS = ['교육', '헬스케어', '커머스', '핀테크', '콘텐츠·미디어', '여행·로컬', 'B2B SaaS', '환경·에너지'];
const TARGETS = ['1인 가구', '직장인', '학생', '시니어', '소상공인', '외국인', '부모·육아', '기업(B2B)'];
const STAGES = [{ key: 'idea', label: '아이디어' }, { key: 'proto', label: '프로토타입' }, { key: 'mvp', label: 'MVP 운영' }];

interface Canvas { problem: string; solution: string; unique_value: string; customer: string; channels: string; revenue: string; cost: string }
interface Risk { risk: string; mitigation: string }
interface Score { desirability: number; feasibility: number; viability: number }
interface Diag { one_liner: string; canvas: Canvas; revenue_model: string; competitors: string[]; risks: Risk[]; mvp_steps: string[]; score: Score }
interface Saved extends Diag { id: number; title: string }

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const total = (s: Score) => Math.round((s.desirability + s.feasibility + s.viability) / 3);

function fallbackDiag(field: string, target: string, kw: string): Diag {
  const idea = kw.trim() || `${target} 대상 ${field} 서비스`;
  return {
    one_liner: `${target}를 위한 ${field} 분야의 ${idea}`,
    canvas: {
      problem: `${target}가 ${field}에서 겪는 번거로움·정보 부족`,
      solution: `${idea}로 핵심 과업을 간단하게 해결`,
      unique_value: '맞춤·자동화로 시간을 절약하는 경험',
      customer: target,
      channels: '앱·웹, SNS, 커뮤니티, 제휴',
      revenue: '구독 또는 수수료',
      cost: '개발·운영, 마케팅, 인건비',
    },
    revenue_model: '월 구독(프리미엄) + 제휴 수수료 혼합',
    competitors: ['기존 대형 플랫폼', '수기·엑셀 등 비소프트웨어 대안'],
    risks: [
      { risk: '초기 사용자 확보의 어려움', mitigation: '좁은 니치부터 커뮤니티 기반으로 침투' },
      { risk: '차별점 모방', mitigation: '데이터·네트워크 효과로 진입장벽 구축' },
    ],
    mvp_steps: ['랜딩페이지로 수요 검증(대기자 모집)', '핵심 1기능만 수동 운영으로 테스트', '유료 전환 의사 인터뷰 10명'],
    score: { desirability: 70, feasibility: 65, viability: 55 },
  };
}

async function getDiag(field: string, target: string, stage: string, kw: string): Promise<Diag> {
  if (!hasKey()) return fallbackDiag(field, target, kw);
  try {
    const out = await ask(
      '너는 린스타트업·VC 관점의 창업 코치야. 현실적이고 검증 가능한 진단을 한다. 과장 금지, 점수는 0~100 정수. ' +
        '반드시 JSON만: {"one_liner":"","canvas":{"problem":"","solution":"","unique_value":"","customer":"","channels":"","revenue":"","cost":""},"revenue_model":"","competitors":["경쟁/대안"],"risks":[{"risk":"","mitigation":""}],"mvp_steps":["검증 단계"],"score":{"desirability":0,"feasibility":0,"viability":0}}',
      `분야: ${field} / 목표 고객: ${target} / 단계: ${stage} / 아이디어 키워드: ${kw || '(자유 제안)'}. 경쟁 2~3, 리스크 2~3, MVP 3단계, 한국어.`,
      { json: true, temperature: 0.6, max_tokens: 1500 },
    );
    const p = JSON.parse(out);
    if (!p.canvas) return fallbackDiag(field, target, kw);
    const sc = p.score || {};
    return {
      one_liner: String(p.one_liner || ''),
      canvas: { problem: String(p.canvas.problem || ''), solution: String(p.canvas.solution || ''), unique_value: String(p.canvas.unique_value || ''), customer: String(p.canvas.customer || ''), channels: String(p.canvas.channels || ''), revenue: String(p.canvas.revenue || ''), cost: String(p.canvas.cost || '') },
      revenue_model: String(p.revenue_model || ''),
      competitors: (p.competitors || []).map(String),
      risks: (p.risks || []).map((r: Risk) => ({ risk: String(r.risk || ''), mitigation: String(r.mitigation || '') })),
      mvp_steps: (p.mvp_steps || []).map(String),
      score: { desirability: clamp(Number(sc.desirability)), feasibility: clamp(Number(sc.feasibility)), viability: clamp(Number(sc.viability)) },
    };
  } catch {
    return fallbackDiag(field, target, kw);
  }
}

const CANVAS_CELLS: [keyof Canvas, string][] = [['problem', '문제'], ['solution', '해결책'], ['unique_value', '고유 가치'], ['customer', '고객'], ['channels', '채널'], ['revenue', '수익'], ['cost', '비용']];
const SCORE_ROWS: [keyof Score, string][] = [['desirability', '바람직성 (원하는가)'], ['feasibility', '실현성 (만들 수 있는가)'], ['viability', '수익성 (돈이 되는가)']];

function Feature() {
  const [field, setField] = useState(FIELDS[0]);
  const [target, setTarget] = useState(TARGETS[0]);
  const [stage, setStage] = useState(STAGES[0].label);
  const [kw, setKw] = useState('');
  const [diag, setDiag] = useState<Diag | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useLocalStorage<Saved[]>('startup.ideas', []);

  const run = async () => { setLoading(true); setDiag(await getDiag(field, target, stage, kw)); setLoading(false); requestAnimationFrame(() => document.getElementById('diag-top')?.scrollIntoView({ behavior: 'smooth' })); };
  const save = () => { if (diag) setSaved([{ ...diag, id: Date.now(), title: kw.trim() || diag.one_liner.slice(0, 24) }, ...saved].slice(0, 20)); };

  return (
    <Stack>
      <div className="studio">
        <div className="studio-row">
          <Field label="분야"><select value={field} onChange={(e) => setField(e.target.value)}>{FIELDS.map((f) => <option key={f}>{f}</option>)}</select></Field>
          <Field label="목표 고객"><select value={target} onChange={(e) => setTarget(e.target.value)}>{TARGETS.map((t) => <option key={t}>{t}</option>)}</select></Field>
        </div>
        <Field label="단계"><div className="chips">{STAGES.map((s) => <Chip key={s.key} active={stage === s.label} color={M.color} onClick={() => setStage(s.label)}>{s.label}</Chip>)}</div></Field>
        <Field label="아이디어 키워드" hint="선택"><input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="예: 시니어 대상 AI 약 복용 알림" onKeyDown={(e) => e.key === 'Enter' && run()} /></Field>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" style={{ background: M.color }} disabled={loading} onClick={run}>{loading ? '🚀 진단 중…' : '🚀 아이템 진단'}</button>
          {diag && !loading && <button className="btn btn-ghost" onClick={save}>💾 아이디어 저장</button>}
        </div>
      </div>

      <div id="diag-top" />
      {loading && <div className="spinner" />}
      {diag && !loading && (
        <Stack gap={18}>
          <div className="callout-soft" style={{ background: `${M.color}12`, border: `1px solid ${M.color}40`, alignItems: 'center' }}>
            <span style={{ fontSize: 22 }}>💡</span>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{diag.one_liner}</p>
            <span className="score-badge" style={{ background: M.color }}>{total(diag.score)}점</span>
          </div>

          <div className="learn">
            <h3 className="learn-h" style={{ color: M.color }}>📊 DFV 점수</h3>
            <Stack gap={10}>
              {SCORE_ROWS.map(([k, label]) => (
                <div key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 4 }}><span>{label}</span><b style={{ color: M.color }}>{diag.score[k]}</b></div>
                  <div className="mini-bar" style={{ height: 10 }}><span style={{ width: `${diag.score[k]}%`, background: M.color }} /></div>
                </div>
              ))}
            </Stack>
          </div>

          <div className="learn">
            <h3 className="learn-h" style={{ color: M.color }}>🧩 린 캔버스</h3>
            <div className="canvas-grid">
              {CANVAS_CELLS.map(([k, label]) => (
                <div key={k} className="canvas-cell"><div className="canvas-label" style={{ color: M.color }}>{label}</div><p>{diag.canvas[k]}</p></div>
              ))}
              <div className="canvas-cell" style={{ gridColumn: '1 / -1' }}><div className="canvas-label" style={{ color: M.color }}>수익 모델</div><p>{diag.revenue_model}</p></div>
            </div>
          </div>

          {diag.competitors.length > 0 && (
            <div className="learn">
              <h3 className="learn-h" style={{ color: M.color }}>⚔️ 경쟁 · 대안</h3>
              <div className="chips">{diag.competitors.map((c, i) => <span key={i} className="tag" style={{ background: '#64748b', fontSize: 12.5, padding: '4px 11px' }}>{c}</span>)}</div>
            </div>
          )}

          {diag.risks.length > 0 && (
            <div className="learn">
              <h3 className="learn-h" style={{ color: M.color }}>🛡️ 리스크 & 대응</h3>
              <div className="result-grid">
                {diag.risks.map((r, i) => <div key={i} className="rcard"><strong style={{ color: '#dc2626' }}>⚠ {r.risk}</strong><p style={{ marginTop: 6 }}><b style={{ color: 'var(--text)' }}>대응 ·</b> {r.mitigation}</p></div>)}
              </div>
            </div>
          )}

          {diag.mvp_steps.length > 0 && (
            <div className="learn">
              <h3 className="learn-h" style={{ color: M.color }}>🪜 MVP 검증 로드맵</h3>
              <Stack gap={8}>{diag.mvp_steps.map((s, i) => <div key={i} className="qrow"><span className="qno" style={{ background: M.color }}>{i + 1}</span><span>{s}</span></div>)}</Stack>
            </div>
          )}
        </Stack>
      )}

      {saved.length > 0 && (
        <div className="learn">
          <h3 className="learn-h" style={{ color: M.color }}>💾 저장한 아이디어 ({saved.length}) — 점수 비교</h3>
          <Stack gap={8}>
            {[...saved].sort((a, b) => total(b.score) - total(a.score)).map((s) => (
              <div key={s.id} className="rcard" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="score-badge" style={{ background: M.color, position: 'static' }}>{total(s.score)}</span>
                <div style={{ flex: 1 }}><strong>{s.title}</strong><p style={{ margin: 0, fontSize: 12.5 }}>{s.one_liner}</p></div>
                <button className="btn btn-ghost" style={{ padding: '5px 11px', fontSize: 12 }} onClick={() => { setDiag(s); requestAnimationFrame(() => document.getElementById('diag-top')?.scrollIntoView({ behavior: 'smooth' })); }}>열기</button>
                <button className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12 }} onClick={() => setSaved(saved.filter((x) => x.id !== s.id))}>✕</button>
              </div>
            ))}
          </Stack>
        </div>
      )}
    </Stack>
  );
}

export default function App() { return <AppLayout m={M} feature={<Feature />} />; }
