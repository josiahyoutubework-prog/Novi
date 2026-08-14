import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from '../components/ui';
import './landing.css';

const NAV_LINKS = [
  { label: 'How it works', id: 'how' },
  { label: 'Use cases', id: 'missions' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'FAQ', id: 'faq' },
];

export default function Landing() {
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="mkt">
      <header className="mkt-header">
        <div className="mkt-header-inner">
          <div className="mkt-brand" onClick={toTop}>Novi</div>
          <nav className="mkt-nav">
            {NAV_LINKS.map((l) => (
              <button key={l.id} className="mkt-nav-link" onClick={() => scrollTo(l.id)}>{l.label}</button>
            ))}
          </nav>
          <div className="mkt-header-cta">
            <span className="mkt-nav-link mkt-desktop-only" onClick={() => nav('/login')}>Log in</span>
            <button className="btn btn-dark inline" onClick={() => nav('/signup')}>Get started</button>
            <button className="mkt-burger" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="mkt-mobile-menu">
            {NAV_LINKS.map((l) => (
              <button key={l.id} className="mkt-nav-link" onClick={() => scrollTo(l.id)}>{l.label}</button>
            ))}
            <button className="mkt-nav-link" onClick={() => { setMenuOpen(false); nav('/login'); }}>Log in</button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mkt-wrap" style={{ paddingTop: 72, paddingBottom: 40 }}>
        <div style={{ maxWidth: 900 }}>
          <div className="mkt-eyebrow">AI outcome management</div>
          <h1 className="mkt-hero-h">Turn goals into outcomes.</h1>
          <p style={{ marginTop: 22, fontSize: 21, lineHeight: 1.5, color: 'var(--ink-3)', maxWidth: 640 }}>
            Tell Novi what you want to accomplish. It turns your intention into a living mission, works in the background, and comes back only when your judgement is required.
          </p>
          <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <button className="btn btn-primary inline" style={{ padding: '14px 26px', fontSize: 16 }} onClick={() => nav('/signup')}>Start your first mission</button>
            <span className="mkt-eyebrow">Free while in beta</span>
          </div>
        </div>
      </section>

      {/* Product panel */}
      <section className="mkt-wrap" style={{ paddingBottom: 40 }}>
        <div className="mkt-panel">
          <div className="mkt-panel-grid">
            <div style={{ padding: 36, borderRight: '1px solid var(--line)' }}>
              <div className="mkt-eyebrow" style={{ color: 'var(--accent)' }}>A REAL MISSION</div>
              <div style={{ marginTop: 14, fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>Move to Vancouver</div>
              <div style={{ marginTop: 6, fontSize: 15, color: 'var(--muted)' }}>Target June 15, 2027 · 62% on track</div>
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[['Research', 'var(--success)'], ['Employment', 'var(--accent)'], ['Housing', 'var(--accent)'], ['Finances', 'var(--warning)'], ['Moving', 'transparent']].map(([n, c]) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={c === 'transparent' ? 'dot ring' : 'dot'} style={c !== 'transparent' ? { background: c } : undefined} />
                    <span style={{ fontSize: 16 }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: 36, display: 'flex', flexDirection: 'column', gap: 26 }}>
              <div>
                <div className="mkt-eyebrow">NOVI IS WORKING</div>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 9, fontSize: 15, color: 'var(--ink-2)' }}>
                  <div style={{ display: 'flex', gap: 10 }}><Check />Reviewed 47 job listings</div>
                  <div style={{ display: 'flex', gap: 10 }}><Check />Filtered 12 opportunities</div>
                  <div style={{ display: 'flex', gap: 10 }}><Check tone="active" />Monitoring 8 listings</div>
                </div>
              </div>
              <div style={{ borderLeft: '2px solid var(--warning)', paddingLeft: 16 }}>
                <div className="mkt-eyebrow" style={{ color: 'var(--warning-ink)' }}>NOVI NOTICED</div>
                <div style={{ marginTop: 10, fontSize: 16, lineHeight: 1.45 }}>Your savings pace puts you about $800 behind the moving target.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Novi works */}
      <section id="how" className="mkt-wrap mkt-section">
        <h2 className="mkt-h2">How Novi works</h2>
        <div className="mkt-cols four" style={{ marginTop: 44 }}>
          {[
            ['01', 'You state an intention', 'Say what you want in plain language. No forms, no project setup.'],
            ['02', 'Novi builds the mission', 'It asks up to three questions, then maps phases, dependencies and risks.'],
            ['03', 'It works in the background', 'Agents monitor, research and draft. You set how much they can do alone.'],
            ['04', 'It returns for judgement', 'Novi only interrupts for a decision, an approval or an emergent risk.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ borderTop: '1px solid var(--line-strong)', paddingTop: 18 }}>
              <div className="mkt-eyebrow" style={{ color: 'var(--muted-2)' }}>{n}</div>
              <div style={{ marginTop: 14, fontSize: 20, fontWeight: 600 }}>{t}</div>
              <div style={{ marginTop: 8, fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.55 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Missions grid */}
      <section id="missions" style={{ background: 'var(--bg-alt)' }}>
        <div className="mkt-wrap mkt-section">
          <h2 className="mkt-h2">One surface for every outcome</h2>
          <div className="mkt-missions" style={{ marginTop: 44 }}>
            {[
              'Move to a new city', 'Land a new job', 'Save a deposit', 'Finish a thesis',
              'Start a business', 'Plan a wedding',
            ].map((m) => (
              <div key={m} className="mkt-mission-cell">
                <div style={{ fontSize: 19, fontWeight: 600 }}>{m}</div>
                <div style={{ marginTop: 6, fontSize: 14, color: 'var(--muted)' }}>Phases · dependencies · risks, handled.</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Autonomy */}
      <section className="mkt-wrap mkt-section">
        <div className="mkt-two">
          <div>
            <div className="mkt-eyebrow">TRUST, BY DESIGN</div>
            <h2 className="mkt-h2" style={{ marginTop: 14 }}>You decide how much Novi does.</h2>
            <p style={{ marginTop: 18, fontSize: 17, lineHeight: 1.6, color: 'var(--ink-3)' }}>
              Every outbound or consequential action routes through your approval unless you explicitly allow it. Novi never spends money, sends a message or shares your details without asking — and it keeps a log of everything it does.
            </p>
          </div>
          <div>
            {[
              ['Assist', 'Novi recommends. You do everything.'],
              ['Co-pilot', 'Novi prepares the work. You approve it.'],
              ['Autopilot', 'Novi acts inside the categories you allow.'],
            ].map(([n, d], i) => (
              <div key={n} style={{ padding: '20px 0', borderTop: i === 0 ? '1px solid var(--line-strong)' : '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                <div style={{ fontSize: 19, fontWeight: 600 }}>{n}</div>
                <div style={{ fontSize: 15, color: 'var(--ink-3)', maxWidth: 260, textAlign: 'right' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mkt-wrap mkt-section">
        <h2 className="mkt-h2">Pricing</h2>
        <div className="mkt-pricing" style={{ marginTop: 44 }}>
          <div className="mkt-price-card">
            <div style={{ fontSize: 22, fontWeight: 600 }}>Free</div>
            <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted)' }}>One mission, the core agents.</div>
            <div style={{ marginTop: 20, fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em' }}>$0</div>
            <button className="btn btn-secondary" style={{ marginTop: 24 }} onClick={() => nav('/signup')}>Start free</button>
          </div>
          <div className="mkt-price-card dark">
            <div style={{ fontSize: 22, fontWeight: 600 }}>Novi Pro</div>
            <div style={{ marginTop: 8, fontSize: 15, color: 'var(--muted-2)' }}>Unlimited missions, every agent, autopilot.</div>
            <div style={{ marginTop: 20, fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em' }}>$20<span style={{ fontSize: 16, fontWeight: 400, color: 'var(--muted-2)' }}> / month</span></div>
            <button className="btn" style={{ marginTop: 24, background: 'var(--bg)', color: 'var(--ink)' }} onClick={() => nav('/signup')}>Get Novi Pro</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mkt-wrap mkt-section">
        <div className="mkt-two">
          <h2 className="mkt-h2">Questions</h2>
          <Faq />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mkt-wrap" style={{ paddingBottom: 40 }}>
        <div className="mkt-cta">
          <h2 className="mkt-h2" style={{ color: 'var(--ink-fill-text)' }}>State an intention. Novi handles the rest.</h2>
          <button className="btn btn-primary inline" style={{ marginTop: 28, padding: '15px 28px', fontSize: 16 }} onClick={() => nav('/signup')}>Start your first mission</button>
        </div>
      </section>

      <footer className="mkt-wrap" style={{ padding: '40px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div className="mkt-eyebrow">NOVI · AI CHIEF OF STAFF</div>
        <div className="mkt-eyebrow" style={{ color: 'var(--muted-2)' }}>© {new Date().getFullYear()} OJ STUDIOS</div>
      </footer>
    </div>
  );
}

const FAQ_ITEMS: [string, string][] = [
  ['Does Novi act on its own?', 'Only inside the categories you allow. Everything consequential routes through your approval, and there is always a log.'],
  ['What can it work on?', 'Any outcome with a date — a move, a job, savings, a project. Novi maps the phases and works the plan.'],
  ['Does it show its reasoning?', 'Novi shows what it did, never how it thinks — only completed, safe summaries you can act on.'],
  ['Is my data private?', 'Novi remembers only what helps your missions, and you can edit or delete any of it at any time.'],
  ['How much does it cost?', 'Free while in beta. Novi Pro is $20 a month for unlimited missions and every agent.'],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div>
      {FAQ_ITEMS.map(([q, a], i) => (
        <div key={q} className={`mkt-faq-row${open === i ? ' open' : ''}`}>
          <button className="mkt-faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            <span style={{ fontSize: 19, fontWeight: 600 }}>{q}</span>
            <span className="mkt-faq-sign">+</span>
          </button>
          <div className="mkt-faq-a">
            <div style={{ fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.6 }}>{a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
