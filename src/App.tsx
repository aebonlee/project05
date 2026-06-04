import { useState } from 'react';
import { Hero, Stack, Field, Pill, type Meta } from './ui';

const M: Meta = { id: 5, icon: '🚀', title: 'AI 창업 아이템 코치', tagline: '아이디어→린캔버스→정부지원사업 매칭', members: ['이시민', '조윤서'], color: '#f59e0b' };

interface Fund { name: string; org: string; tag: string; summary: string; link: string; }
const FUNDS: Fund[] = [
  { name: '예비창업패키지', org: '중소벤처기업부', tag: '예비', summary: '예비창업자 사업화 자금 최대 1억원 + 멘토링.', link: 'https://www.k-startup.go.kr' },
  { name: '초기창업패키지', org: '중소벤처기업부', tag: '3년이내', summary: '창업 3년 이내 기업 사업화·시제품 자금 지원.', link: 'https://www.k-startup.go.kr' },
  { name: '청년창업사관학교', org: '중소벤처기업진흥공단', tag: '청년', summary: '만 39세 이하 창업자 보육공간+자금+코칭.', link: 'https://start.kosmes.or.kr' },
  { name: 'TIPS', org: '민간투자주도형', tag: '기술', summary: '기술 스타트업 R&D + 투자 연계 프로그램.', link: 'https://www.jointips.or.kr' },
  { name: '창업도약패키지', org: '중소벤처기업부', tag: '도약', summary: '창업 3~7년 도약기 기업 스케일업 지원.', link: 'https://www.k-startup.go.kr' },
];

const pickFunds = (stage: string): Fund[] => {
  if (stage === 'idea') return FUNDS.filter((f) => ['예비', '청년'].includes(f.tag));
  if (stage === 'early') return FUNDS.filter((f) => ['3년이내', '청년', '기술'].includes(f.tag));
  return FUNDS.filter((f) => ['도약', '기술'].includes(f.tag));
};

export default function App() {
  const [idea, setIdea] = useState('');
  const [customer, setCustomer] = useState('');
  const [stage, setStage] = useState('idea');
  const [out, setOut] = useState<null | { canvas: { k: string; v: string }[]; funds: Fund[] }>(null);

  const run = () => {
    const i = idea.trim() || '나의 아이템';
    const c = customer.trim() || '핵심 고객';
    setOut({
      canvas: [
        { k: '문제', v: `${c}이(가) 겪는 불편을 ${i}(으)로 해결합니다.` },
        { k: '고객 세그먼트', v: c },
        { k: '가치 제안', v: `${i} — 더 빠르고 쉽게, 비용은 더 적게.` },
        { k: '수익 모델', v: '구독 / 건별 과금 / 광고·제휴 중 가설 검증 후 선택' },
        { k: '핵심 지표', v: '주간 활성 사용자(WAU), 재방문율, 전환율' },
        { k: '초기 채널', v: 'SNS·커뮤니티 바이럴 + 타깃 광고 소액 테스트' },
      ],
      funds: pickFunds(stage),
    });
  };

  return (
    <div className="wrap">
      <Hero m={M} />
      <main style={{ marginTop: 22 }}>
        <Stack>
          <Field label="창업 아이디어 한 줄"><input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="예: 자취생을 위한 냉장고 재료 레시피 앱" /></Field>
          <Field label="핵심 고객"><input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="예: 1인 가구 2030 자취생" /></Field>
          <Field label="창업 단계">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[['idea', '아이디어'], ['early', '초기(3년 내)'], ['growth', '도약기']].map(([k, l]) => (
                <button key={k} className="btn" onClick={() => setStage(k)} style={{ background: stage === k ? M.color : 'transparent', color: stage === k ? '#fff' : 'var(--primary)', border: stage === k ? 'none' : '1px solid var(--border)' }}>{l}</button>
              ))}
            </div>
          </Field>
          <button className="btn" onClick={run}>🚀 린캔버스 + 지원사업 받기</button>

          {out && (
            <Stack gap={14}>
              <h2 style={{ margin: 0, fontSize: 18 }}>📋 린 캔버스</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {out.canvas.map((c) => (
                  <div key={c.k} className="box"><div style={{ fontSize: 12, fontWeight: 800, color: M.color }}>{c.k}</div><p style={{ margin: '4px 0 0', fontSize: 13.5, lineHeight: 1.6 }}>{c.v}</p></div>
                ))}
              </div>
              <h2 style={{ margin: '6px 0 0', fontSize: 18 }}>🏦 매칭 정부지원사업 {out.funds.length}건</h2>
              {out.funds.map((f) => (
                <div key={f.name} className="box">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><Pill color={M.color}>{f.tag}</Pill><strong>{f.name}</strong><span style={{ fontSize: 12, color: 'var(--faint)' }}>{f.org}</span></div>
                  <p style={{ margin: '8px 0 6px', fontSize: 14, lineHeight: 1.7 }}>{f.summary}</p>
                  <a href={f.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: M.color, textDecoration: 'none' }}>지원 정보 →</a>
                </div>
              ))}
            </Stack>
          )}
        </Stack>
      </main>
    </div>
  );
}
