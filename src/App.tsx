import { useState } from 'react';
import { AppLayout, Stack, Field, Pill, type Meta } from './ui';
import { ask, hasKey } from './lib/ai';

const M: Meta = {
  id: 5, icon: '🚀', title: 'AI 창업 아이템 코치', tagline: '아이디어→린캔버스→정부지원사업 매칭', members: ['이시민', '조윤서'], color: '#f59e0b', ai: true,
  problem: '좋은 아이디어가 있어도 사업화로 옮기는 첫 단계가 막막합니다. 아이디어 한 줄을 넣으면 AI가 린 캔버스로 구조화하고, 단계에 맞는 정부지원사업까지 연결해 실행을 돕습니다.',
  features: [
    { icon: '🧠', title: 'AI 린 캔버스', desc: 'OpenAI가 문제·고객·가치제안·수익모델을 구조화' },
    { icon: '🏦', title: '지원사업 매칭', desc: '창업 단계별 정부지원사업 자동 추천' },
    { icon: '📊', title: '핵심 지표 제안', desc: '검증해야 할 KPI와 초기 채널 가이드' },
    { icon: '⚡', title: '즉시 산출물', desc: '피칭·사업계획서 초안에 바로 활용' },
  ],
  howto: ['아이디어와 핵심 고객을 입력해요', '창업 단계를 선택해요', 'AI 린 캔버스 + 매칭 지원사업을 받아요'],
  facts: [{ value: 'GPT', label: '캔버스 생성' }, { value: '5+', label: '지원사업' }, { value: '6', label: '캔버스 항목' }, { value: '3', label: '단계 매칭' }],
  info: [
    { title: '린 캔버스란?', body: '한 장으로 비즈니스 모델을 정리하는 도구입니다. 문제·고객·가치제안·수익모델·핵심지표·채널을 빠르게 가설화하고 검증합니다.' },
    { title: '정부지원사업 캘린더', body: 'K-Startup에서 예비창업패키지·초기창업패키지·청년창업사관학교 등 공고를 확인하세요. 대부분 연 1~2회 모집합니다.' },
    { title: '검증이 먼저', body: '아이디어보다 ‘고객이 진짜 돈을 낼 문제인가’가 핵심입니다. 소액 광고·인터뷰로 빠르게 검증하세요.' },
  ],
  stack: ['React', 'TypeScript', 'OpenAI API', 'Vite'],
  links: [{ label: 'K-Startup', url: 'https://www.k-startup.go.kr' }],
};

interface Fund { name: string; org: string; tag: string; summary: string; link: string; }
const FUNDS: Fund[] = [
  { name: '예비창업패키지', org: '중소벤처기업부', tag: '예비', summary: '예비창업자 사업화 자금 최대 1억원 + 멘토링.', link: 'https://www.k-startup.go.kr' },
  { name: '초기창업패키지', org: '중소벤처기업부', tag: '3년이내', summary: '창업 3년 이내 사업화·시제품 자금.', link: 'https://www.k-startup.go.kr' },
  { name: '청년창업사관학교', org: '중소벤처기업진흥공단', tag: '청년', summary: '만 39세 이하 보육공간+자금+코칭.', link: 'https://start.kosmes.or.kr' },
  { name: 'TIPS', org: '민간투자주도형', tag: '기술', summary: '기술 스타트업 R&D + 투자 연계.', link: 'https://www.jointips.or.kr' },
  { name: '창업도약패키지', org: '중소벤처기업부', tag: '도약', summary: '창업 3~7년 스케일업 지원.', link: 'https://www.k-startup.go.kr' },
];
const pickFunds = (s: string): Fund[] => s === 'idea' ? FUNDS.filter((f) => ['예비', '청년'].includes(f.tag)) : s === 'early' ? FUNDS.filter((f) => ['3년이내', '청년', '기술'].includes(f.tag)) : FUNDS.filter((f) => ['도약', '기술'].includes(f.tag));

const KEYS = ['문제', '고객 세그먼트', '가치 제안', '수익 모델', '핵심 지표', '초기 채널'];
const fallbackCanvas = (i: string, c: string) => [
  { k: '문제', v: `${c}이(가) 겪는 불편을 ${i}(으)로 해결합니다.` }, { k: '고객 세그먼트', v: c },
  { k: '가치 제안', v: `${i} — 더 빠르고 쉽게, 비용은 더 적게.` }, { k: '수익 모델', v: '구독 / 건별 과금 / 제휴 중 가설 검증' },
  { k: '핵심 지표', v: '주간 활성 사용자, 재방문율, 전환율' }, { k: '초기 채널', v: 'SNS·커뮤니티 + 소액 타깃 광고' },
];

function Feature() {
  const [idea, setIdea] = useState('');
  const [customer, setCustomer] = useState('');
  const [stage, setStage] = useState('idea');
  const [canvas, setCanvas] = useState<{ k: string; v: string }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    const i = idea.trim() || '나의 아이템'; const c = customer.trim() || '핵심 고객';
    setLoading(true);
    try {
      const out = await ask('너는 린스타트업 코치야. 입력 아이디어로 린 캔버스를 채운다. 반드시 {"items":[{"k":"문제","v":"…"}, ...]} JSON만, k는 정확히 [문제,고객 세그먼트,가치 제안,수익 모델,핵심 지표,초기 채널] 순서, v는 한 문장.', `아이디어: ${i}\n핵심 고객: ${c}\n단계: ${stage}`, { json: true, temperature: 0.7, max_tokens: 500 });
      const parsed = JSON.parse(out); const items = (parsed.items ?? parsed) as { k: string; v: string }[];
      setCanvas(Array.isArray(items) && items.length ? items.filter((x) => KEYS.includes(x.k)) : fallbackCanvas(i, c));
    } catch { setCanvas(fallbackCanvas(i, c)); }
    setLoading(false);
  };

  return (
    <Stack>
      <Field label="창업 아이디어 한 줄"><input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="예: 자취생을 위한 냉장고 재료 레시피 앱" /></Field>
      <Field label="핵심 고객"><input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="예: 1인 가구 2030 자취생" /></Field>
      <Field label="창업 단계"><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{[['idea', '아이디어'], ['early', '초기(3년 내)'], ['growth', '도약기']].map(([k, l]) => <button key={k} className="btn" onClick={() => setStage(k)} style={{ background: stage === k ? M.color : 'transparent', color: stage === k ? '#fff' : 'var(--primary)', border: stage === k ? 'none' : '1px solid var(--border)' }}>{l}</button>)}</div></Field>
      <button className="btn" style={{ background: M.color }} disabled={loading} onClick={run}>{loading ? '🚀 분석 중…' : '🚀 AI 린캔버스 + 지원사업'}</button>
      {canvas && (
        <Stack gap={14}>
          <h2 style={{ margin: 0, fontSize: 18 }}>📋 린 캔버스</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>{canvas.map((c) => <div key={c.k} className="box"><div style={{ fontSize: 12, fontWeight: 800, color: M.color }}>{c.k}</div><p style={{ margin: '4px 0 0', fontSize: 13.5, lineHeight: 1.6 }}>{c.v}</p></div>)}</div>
          <h2 style={{ margin: '6px 0 0', fontSize: 18 }}>🏦 매칭 정부지원사업</h2>
          {pickFunds(stage).map((f) => (
            <div key={f.name} className="box">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><Pill color={M.color}>{f.tag}</Pill><strong>{f.name}</strong><span style={{ fontSize: 12, color: 'var(--faint)' }}>{f.org}</span></div>
              <p style={{ margin: '8px 0 6px', fontSize: 14 }}>{f.summary}</p>
              <a href={f.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: M.color, textDecoration: 'none' }}>지원 정보 →</a>
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default function App() { return <AppLayout m={M} feature={<Feature />} />; }
