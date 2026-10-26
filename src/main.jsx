import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Sparkles, GraduationCap, Users, Link2, LogOut, CreditCard, ShieldCheck, RefreshCw, Menu, X, Play, ExternalLink } from 'lucide-react';
import { supabase, supabaseConfigured } from './lib/supabase.js';
import { PATHWAYS } from './data/pathways.js';
import { calculateMonthlyPrice, formatNaira, normalizeSelection } from './lib/pricing.js';
import './styles.css';

const VIDEO_PICKS = [
  { id: '8yqcDL4TmzM', title: 'ChatGPT prompting: get better answers', creator: 'Anson Alexander', category: 'prompting', tag: 'Prompting', duration: 'About 7 minutes', views: '176K+ views when researched', description: 'Learn how to structure prompts, improve instructions and personalize ChatGPT for everyday work.', pathway: 'prompting' },
  { id: '1m-u2DIBI2s', title: 'Make AI videos with text-to-video and image-to-video', creator: 'AI Discovery', category: 'video', tag: 'AI video', duration: 'About 11 minutes', views: '109K+ views when researched', description: 'Compare two beginner workflows for generating video from prompts and animating an image, with practical examples.', pathway: 'video' },
  { id: 'bmlzzFLE6Yk', title: 'Create AI animated story videos', creator: 'Peris Musyoki', category: 'video', tag: 'AI video', duration: 'About 12 minutes', views: '803K+ views when researched', description: 'See a practical workflow for turning an idea into a narrated, illustrated story video.', pathway: 'video' },
  { id: 'PatUBwIwnXQ', title: 'Make videos with Canva AI', creator: 'App Tutor', category: 'video', tag: 'AI video', duration: 'Beginner walkthrough', views: '41K+ views when researched', description: 'Watch a beginner-friendly demonstration of turning a text idea into a video with Canva AI.', pathway: 'video' },
  { id: 'EQr2LJr7CCU', title: 'Create an AI video in Canva step by step', creator: 'Knowledge Elevator', category: 'video', tag: 'AI video', duration: 'Tutorial', views: 'Published Dec 2025', description: 'Explore prompting, editing, adding text and music, and exporting a finished AI video.', pathway: 'video' },
  { id: 'xxqGu6CtG6A', title: 'Canva design from scratch with AI tools', creator: 'Intellipaat', category: 'graphics', tag: 'Graphics & design', duration: 'About 17 minutes', views: 'Published Sep 2026', description: 'Follow a beginner workflow for a social post, typography, layout, colour, and Canva AI features.', pathway: 'graphics' },
  { id: 'zIvdDWmZSgA', title: 'Use Canva AI for graphic design', creator: 'Watch & Learn Tutorials', category: 'graphics', tag: 'Graphics & design', duration: 'Full guide', views: 'Published Apr 2026', description: 'Explore AI-assisted design ideas for social posts, presentations, logos and visual assets.', pathway: 'graphics' },
  { id: 'RUKcp3IzG1Y', title: 'Build a website with AI in 2026', creator: 'Griffin Wooldridge', category: 'websites', tag: 'AI websites', duration: 'Step-by-step tutorial', views: 'Published Jun 2026', description: 'Watch the workflow from choosing a builder and writing a prompt to refining pages and preparing to publish.', pathway: 'websites' },
  { id: 'PVLev8hCTtE', title: 'Make digital products for free with Canva', creator: 'Tatyana Savage', category: 'digital-products', tag: 'Digital products', duration: 'About 18 minutes', views: '79K+ views when researched', description: 'Follow a practical worksheet-design workflow, then see how to save the product and prepare it for sale.', pathway: 'digital-products' },
];

function App() {
  const [selected, setSelected] = useState([]);
  const [mentor, setMentor] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authMode, setAuthMode] = useState('signup');
  const [session, setSession] = useState(null);
  const [access, setAccess] = useState(null);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoFilter, setVideoFilter] = useState('all');
  const [activeVideo, setActiveVideo] = useState(null);
  const total = calculateMonthlyPrice(selected, mentor);

  useEffect(() => {
    if (!supabase) return undefined;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      if (data.session) loadAccount(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setTimeout(() => loadAccount(nextSession), 0);
      else { setAccess(null); setOrders([]); }
    });
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'return') setMessage('You returned from checkout. Membership is activated only after the payment provider verifies the transaction. Sign in and refresh membership status to check.');
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  async function loadAccount(currentSession) {
    if (!supabase || !currentSession?.user) return;
    const userId = currentSession.user.id;
    const [selectionResult, accessResult, ordersResult] = await Promise.all([
      supabase.from('member_selections').select('pathway_ids, mentorship').eq('user_id', userId).maybeSingle(),
      supabase.from('member_access').select('pathway_ids, mentorship, expires_at').eq('user_id', userId).maybeSingle(),
      supabase.from('orders').select('id, amount_naira, status, created_at, paid_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    ]);
    if (selectionResult.data) { setSelected(selectionResult.data.pathway_ids ?? []); setMentor(Boolean(selectionResult.data.mentorship)); }
    setAccess(accessResult.data ?? null);
    setOrders(ordersResult.data ?? []);
  }

  function togglePathway(id) { setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]); }

  async function handleAuth(event) {
    event.preventDefault();
    if (!supabase) { setMessage('Sign-in is not configured. Add the Supabase URL and publishable/anon key to Vercel, then redeploy.'); return; }
    setBusy(true); setMessage('');
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } });
        if (error) throw error;
        setMessage(data.session ? 'Account created. You can save your selection and continue to checkout.' : 'Account created. Check your email for the confirmation link, then sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setMessage('You are signed in.');
      }
    } catch (error) { setMessage(error.message || 'Authentication failed. Please try again.'); }
    finally { setBusy(false); }
  }

  async function saveSelection() {
    if (!session?.user || !supabase) { setMessage('Create an account or sign in first, then save your selection.'); document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' }); return; }
    setSaving(true); setMessage('');
    try {
      const pathwayIds = normalizeSelection(selected);
      const { error } = await supabase.from('member_selections').upsert({ user_id: session.user.id, pathway_ids: pathwayIds, mentorship: mentor, quoted_monthly_naira: total, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) throw error;
      setMessage('Selection saved. The secure checkout service will calculate the final charge independently.');
    } catch (error) { setMessage(error.message || 'Could not save selection.'); }
    finally { setSaving(false); }
  }

  async function startCheckout() {
    if (!supabase || !session) { setMessage('Please create an account or sign in before checkout. Your selection will remain on this page.'); document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' }); return; }
    setBusy(true); setMessage('');
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', { body: { pathwayIds: normalizeSelection(selected), mentorship: mentor } });
      if (error) throw error;
      if (!data?.checkoutUrl) throw new Error(data?.error || 'Checkout could not be started.');
      window.location.assign(data.checkoutUrl);
    } catch (error) { setMessage(error.message || 'Checkout could not be started. Confirm the payment function and provider secrets are configured.'); setBusy(false); }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut(); setAccess(null); setOrders([]); setMessage('You have signed out.');
  }

  const activeAccess = access && new Date(access.expires_at).getTime() > Date.now();
  const expiryLabel = access?.expires_at ? new Date(access.expires_at).toLocaleDateString() : '';

  return <div className="shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header>
      <a className="brand" href="#home" aria-label="AI Skills Academy home"><span className="mark"><Sparkles /></span><span>AI SKILLS <b>ACADEMY</b><small>Learn · Build · Grow</small></span></a>
      <button type="button" className="mobile-menu-toggle" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileMenuOpen} aria-controls="primary-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X size={21}/> : <Menu size={21}/>}</button>
      <nav id="primary-navigation" className={mobileMenuOpen ? "nav-open" : ""} aria-label="Main navigation"><a onClick={() => setMobileMenuOpen(false)} href="#paths">Learning paths</a><a onClick={() => setMobileMenuOpen(false)} href="#video-library">Video previews</a><a onClick={() => setMobileMenuOpen(false)} href="#partners">Creators & partners</a><a onClick={() => setMobileMenuOpen(false)} href={session ? "#membership" : "#join"}>{session ? 'My membership' : 'Join academy'}</a></nav>
      {session && <button className="button ghost header-signout" onClick={signOut}><LogOut size={15}/> Sign out</button>}
    </header>
    <main id="main-content">
      <section className="hero" id="home"><div><span className="eyebrow">PRACTICAL AI LEARNING</span><h1>Learn AI skills.<br/><em>Build what’s next.</em></h1><p>Explore practical learning pathways for AI video, design, prompting, websites and digital products. Start with the foundations, then build skills through projects.</p><div className="actions"><a className="button primary" href="#paths">Explore learning paths <ArrowRight size={17}/></a><a className="button ghost" href="#join">{session ? 'View membership' : 'Create an account'}</a></div><div className="trust"><span><GraduationCap/> Beginner-friendly pathways</span><span><Users/> Learning community</span></div></div><aside className="hero-card"><span className="orb"><Sparkles size={28}/></span><span className="eyebrow">YOUR NEXT SKILL</span><h2>From curiosity<br/>to capability.</h2><p>Choose a focus, practise with projects and keep growing as AI tools evolve.</p><div className="mini-stats"><div><b>5</b><small>specialist paths</small></div><div><b>₦5k</b><small>per pathway / 365 days</small></div></div></aside></section>
      <section className="section proof-section" id="preview"><div className="heading"><span className="eyebrow">WATCH BEFORE YOU CHOOSE</span><h2>See what practical AI learning <em>looks like.</em></h2><p>You do not have to take our word for it. Start with this free introduction to AI from Grow with Google, then explore the hands-on pathways available in the Academy.</p></div><div className="video-trust-grid"><div className="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/bknUn7yMwNI?rel=0" title="Introduction to Artificial Intelligence — Google AI Essentials preview by Grow with Google" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe></div><div className="video-copy"><span className="video-label"><ShieldCheck size={16}/> FREE VIDEO PREVIEW</span><h3>Start with the basics. Then practise.</h3><p>This introductory video explains foundational AI ideas and how generative AI can help with everyday tasks. It is an external learning preview by Grow with Google, not a paid Academy lesson.</p><ul><li>Understand what AI can and cannot do</li><li>See why clear instructions matter</li><li>Learn responsibly and check important outputs</li></ul><a className="button ghost" href="https://www.youtube.com/watch?v=bknUn7yMwNI" target="_blank" rel="noreferrer">Watch on YouTube <ArrowRight size={16}/></a><small>Video by Grow with Google. Opens on YouTube if you prefer.</small></div></div><div className="trust-promise-grid"><article><ShieldCheck/><b>Transparent pricing</b><p>₦5,000 per selected pathway for 365 days. Mentorship is optional.</p></article><article><CreditCard/><b>Payment verified first</b><p>Membership is unlocked only after the payment provider verifies payment.</p></article><article><RefreshCw/><b>No auto-renewal</b><p>Your access is for the stated period; this offer does not automatically renew.</p></article><article><GraduationCap/><b>Learn by doing</b><p>Choose a focus and practise with guided lessons and projects as course materials are made available.</p></article></div></section>
      <section className="section video-library" id="video-library"><div className="heading"><span className="eyebrow">WATCH · DISCOVER · CREATE</span><h2>See what you could <em>make with AI.</em></h2><p>Short, practical videos from creators and educators. Tap a thumbnail to watch, pick up an idea, then explore the matching learning pathway when you are ready.</p></div><div className="video-toolbar"><div className="video-filters" role="group" aria-label="Filter video tutorials">{[{id:'all',label:'All videos'},{id:'prompting',label:'Prompting'},{id:'video',label:'AI video'},{id:'graphics',label:'Graphics & design'},{id:'websites',label:'AI websites'},{id:'digital-products',label:'Digital products'}].map((filter) => <button type="button" key={filter.id} className={'filter-chip '+(videoFilter===filter.id?'selected':'')} aria-pressed={videoFilter===filter.id} onClick={() => setVideoFilter(filter.id)}>{filter.label}</button>)}</div><span className="video-note">Free to watch on YouTube</span></div><div className="video-card-grid">{VIDEO_PICKS.filter((video) => videoFilter==='all' || video.category===videoFilter).map((video) => <article className="video-card" key={video.id}><button type="button" className="video-thumb" onClick={() => setActiveVideo(video)} aria-label={'Watch '+video.title}><img src={'https://i.ytimg.com/vi/'+video.id+'/hqdefault.jpg'} alt={'Thumbnail for '+video.title} loading="lazy"/><span className="thumb-play"><Play size={23} fill="currentColor"/></span><span className="thumb-tag">{video.tag}</span></button><div className="video-card-body"><div className="video-meta"><span>{video.creator}</span><span>{video.duration}</span></div><h3>{video.title}</h3><p>{video.description}</p><small className="video-signal">{video.views}</small><div className="video-card-actions"><button type="button" className="text-button watch-button" onClick={() => setActiveVideo(video)}>Watch video <Play size={14}/></button><button type="button" className="text-button path-button" onClick={() => { setSelected((current) => current.includes(video.pathway) ? current : [...current, video.pathway]); document.getElementById('paths')?.scrollIntoView({behavior:'smooth'}); }}>Explore related path <ArrowRight size={14}/></button></div></div></article>)}</div><p className="video-disclosure">Videos are embedded from their creators’ YouTube channels. AI Skills Academy does not claim ownership of these videos or imply that the creators endorse this academy. Video popularity is a discovery signal, not proof of course sales or learning outcomes.</p>{activeVideo && <div className="video-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveVideo(null); }}><section className="video-modal" role="dialog" aria-modal="true" aria-labelledby="active-video-title"><div className="video-modal-header"><div><span className="eyebrow">NOW PLAYING · {activeVideo.creator}</span><h2 id="active-video-title">{activeVideo.title}</h2></div><button type="button" className="modal-close" onClick={() => setActiveVideo(null)} aria-label="Close video">×</button></div><div className="modal-player"><iframe src={'https://www.youtube-nocookie.com/embed/'+activeVideo.id+'?autoplay=1&rel=0'} title={activeVideo.title+' by '+activeVideo.creator} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div><div className="video-modal-footer"><p>{activeVideo.description}</p><a href={'https://www.youtube.com/watch?v='+activeVideo.id} target="_blank" rel="noreferrer" className="button ghost">Open on YouTube <ExternalLink size={15}/></a><button type="button" className="button primary" onClick={() => { setSelected((current) => current.includes(activeVideo.pathway) ? current : [...current, activeVideo.pathway]); setActiveVideo(null); document.getElementById('paths')?.scrollIntoView({behavior:'smooth'}); }}>Explore this skill <ArrowRight size={15}/></button></div></section></div>}</section>
      {session && <section className="account-panel" id="membership"><div><span className="eyebrow">YOUR ACCOUNT</span><h2>Welcome back</h2><p>{session.user.email}</p><a className="button primary dashboard-action" href="#paths">Choose or continue a pathway <ArrowRight size={16}/></a></div><div className="account-status"><span className={activeAccess ? 'status-dot good' : 'status-dot'}></span><div><b>{activeAccess ? 'Membership active' : 'No active paid membership'}</b><small>{activeAccess ? `Access until ${expiryLabel}` : 'Complete checkout to unlock your selected pathways.'}</small></div></div>
        {activeAccess && <p className="access-list"><ShieldCheck size={16}/> Unlocked pathways: {access.pathway_ids?.length ? PATHWAYS.filter((path) => access.pathway_ids.includes(path.id)).map((path) => path.title).join(', ') : 'Foundation'}{access.mentorship ? ' · Mentorship Plus' : ''}</p>}
        {orders.length > 0 && <div className="orders"><b>Recent orders</b>{orders.map((order) => <div className="order-row" key={order.id}><span>{formatNaira(order.amount_naira)} · {new Date(order.created_at).toLocaleDateString()}</span><span className={'order-status '+order.status}>{order.status}</span></div>)}</div>}
        <button className="button ghost" onClick={() => loadAccount(session)}><RefreshCw size={15}/> Refresh membership status</button></section>}
      <section className="section" id="paths"><div className="heading"><span className="eyebrow">CHOOSE YOUR FOCUS</span><h2>Build skills you can <em>put to work.</em></h2><p>Select one or more specialist pathways. The server recalculates your price before opening secure checkout.</p></div>
        <div className="learning-steps" aria-label="How to get started"><div className="learning-step"><span>1</span><div><b>Choose your skills</b><small>Select the pathways you want to learn</small></div></div><div className="step-connector" aria-hidden="true"></div><div className="learning-step"><span>2</span><div><b>Unlock your learning</b><small>Pay securely for 365-day access</small></div></div><div className="step-connector" aria-hidden="true"></div><div className="learning-step"><span>3</span><div><b>Build as you learn</b><small>Follow practical lessons and projects</small></div></div></div><div className="path-grid">{PATHWAYS.map((path) => { const Icon = path.icon; const active = selected.includes(path.id); return <button type="button" className={'path '+(active?'active':'')} key={path.id} aria-pressed={active} onClick={() => togglePathway(path.id)}><Icon size={23}/><span className="path-check">{active?'✓':'+'}</span><h3>{path.title}</h3><p>{path.desc}</p><b>+{formatNaira(5000)} / 365 days</b></button>; })}</div>
        <div className="pricing"><div><span className="eyebrow">YOUR MEMBERSHIP</span><h3>365-day pathway access</h3><p>Each selected specialist pathway includes 365 days of access from verified payment. Select one or more pathways below.</p><label className="mentor"><input type="checkbox" checked={mentor} onChange={(event) => setMentor(event.target.checked)}/> Add Mentorship Plus <b>+{formatNaira(10000)} / 365 days</b></label><small>Each specialist pathway costs {formatNaira(5000)} for 365 days. Mentorship Plus adds {formatNaira(10000)} for 365 days. No automatic renewal.</small><div className="checkout-assurance"><ShieldCheck size={17}/><span><b>Clear pricing. Secure checkout.</b><small>Your final charge is checked by the server before payment. Access is granted only after payment verification.</small></span></div></div><div className="total"><small>Total for 365-day access</small><strong>{formatNaira(total)}</strong><small>{selected.length} specialist pathway{selected.length === 1 ? '' : 's'} selected{mentor ? ' · Mentorship Plus' : ''}</small>{selected.length === 0 && !mentor && <p className="selection-hint">Choose at least one pathway or add Mentorship Plus to continue.</p>}<button className="button primary" onClick={saveSelection} disabled={saving || selected.length === 0 && !mentor}>{saving?'Saving…':'Save selection'} <ArrowRight size={16}/></button><button className="button ghost" onClick={startCheckout} disabled={busy || selected.length === 0 && !mentor}>{busy?'Preparing secure checkout…':'Continue to secure payment'} <CreditCard size={16}/></button></div></div>
        {message && <p className="message" role="status">{message}</p>}</section>
      <section className="section partners" id="partners"><div className="heading"><span className="eyebrow">GROW WITH US</span><h2>Creators teach. <em>Communities grow.</em></h2><p>We want to work with educators and community promoters who help more people learn practical AI skills.</p></div><div className="partner-grid"><article><GraduationCap/><h3>Course creators</h3><p>Share your expertise, propose courses and build a public teaching identity. Creator publishing and payouts require a future approved marketplace workflow.</p></article><article><Link2/><h3>Community partners</h3><p>Help people discover useful learning paths. Referral attribution and commissions are not available yet.</p></article><article><Users/><h3>Learners</h3><p>Start with the foundations, pick a focus and keep building your skills through practical projects.</p></article></div></section>
      <section className="section faq-section" id="faq"><div className="heading"><span className="eyebrow">BEFORE YOU JOIN</span><h2>Good questions deserve <em>clear answers.</em></h2><p>Know what you are paying for before you create an account or continue to checkout.</p></div><div className="faq-list"><details><summary>How much does it cost?</summary><p>Each specialist pathway is ₦5,000 for 365 days of access. You can choose more than one pathway. Mentorship Plus is optional and adds ₦10,000 for 365 days. The total is shown before checkout.</p></details><details><summary>Will I be charged automatically again?</summary><p>No. This offer does not automatically renew. You choose whether to make another purchase when your access period ends.</p></details><details><summary>Do I need experience with AI or coding?</summary><p>The Academy is designed to help beginners get started. Choose a pathway that matches your interest and follow the learning materials and practice activities available in that pathway.</p></details><details><summary>Will I definitely get a job or make money?</summary><p>No course can honestly guarantee a job, clients, income or business results. The goal is to help you build practical skills; your results depend on your practice, opportunities and how you apply what you learn.</p></details><details><summary>How do I get access after paying?</summary><p>Payment is verified by the payment provider before membership access is activated. Sign in to your account and use “Refresh membership status” if your access does not appear after a successful payment.</p></details><details><summary>Are testimonials and student results available?</summary><p>We will publish learner stories only when we have permission and can verify them. We do not use invented testimonials, fake student counts or guaranteed-result claims to persuade you to buy.</p></details></div><div className="faq-cta"><div><b>Ready to choose your first skill?</b><p>Review the pathways and see your exact total before paying.</p></div><a className="button primary" href="#paths">Explore pathways <ArrowRight size={16}/></a></div></section>
      <section className="section join" id="join"><div><span className="eyebrow">{session ? 'YOUR ACCOUNT' : 'START YOUR JOURNEY'}</span><h2>{session ? 'You’re ready to ' : 'Make your next step '}<em>{session ? 'keep learning.' : 'count.'}</em></h2><p>{session ? 'Your account is connected. Choose your pathways above, save your selection and continue to secure checkout.' : 'Create a member account or sign in to save your pathways and pay securely.'}<br/>{!supabaseConfigured && 'Supabase is not configured in this deployment yet.'}</p>{session && <div className="signed-in"><ShieldCheck size={18}/> Signed in as {session.user.email}</div>}</div>
        {!session && <form onSubmit={handleAuth}>{authMode === 'signup' && <label>Your name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name"/></label>}<label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email"/></label><label>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}/></label><button className="button primary" disabled={busy || !supabaseConfigured}>{busy ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Sign in'} <ArrowRight size={16}/></button><button type="button" className="text-button" onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setMessage(''); }}>{authMode === 'signup' ? 'Already have an account? Sign in' : 'New to the academy? Create an account'}</button></form>}</section>
    </main>
    <footer><a className="brand" href="#home"><span className="mark"><Sparkles/></span><span>AI SKILLS <b>ACADEMY</b><small>Learn · Build · Grow</small></span></a><div className="footer-trust"><a href="#faq">Pricing & FAQs</a><a href="#video-library">Video previews</a><span>Clear prices · No auto-renewal</span></div><p>© {new Date().getFullYear()} AI Skills Academy. Learn by building.</p></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
