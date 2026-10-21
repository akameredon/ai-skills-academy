import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { ArrowRight, Sparkles, GraduationCap, Video, Palette, WandSparkles, Globe, BookOpen, Users, Link2 } from 'lucide-react';
import './styles.css';

const env = import.meta.env;
const supabase = env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY) : null;
const paths = [
  {id:'video',title:'AI Video Creation',icon:Video,desc:'Turn ideas into short videos, explainers and stories.'},
  {id:'graphics',title:'AI Graphics & Design',icon:Palette,desc:'Create campaign visuals, thumbnails and social content.'},
  {id:'prompting',title:'Prompt Engineering',icon:WandSparkles,desc:'Write better prompts and build repeatable workflows.'},
  {id:'websites',title:'AI-Assisted Websites',icon:Globe,desc:'Plan, build and publish websites with AI-assisted tools.'},
  {id:'digital-products',title:'Digital Products & E-books',icon:BookOpen,desc:'Create guides, prompt packs and practical digital resources.'}
];
const money = n => new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);
function App(){
 const [selected,setSelected]=useState([]);
 const [mentor,setMentor]=useState(false);
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [name,setName]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const total=5000+selected.length*5000+(mentor?10000:0);
 const checkout=useMemo(()=>selected.length===0&&!mentor?env.VITE_SELAR_FOUNDATION_URL:selected.length===1&&!mentor?env['VITE_SELAR_'+selected[0].replace('-','_').toUpperCase()+'_URL']:selected.length===0&&mentor?env.VITE_SELAR_MENTORSHIP_URL:'',[selected,mentor]);
 const toggle=id=>setSelected(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 async function signup(e){e.preventDefault();setMessage('');if(!supabase){setMessage('Supabase is not configured yet. Copy .env.example to .env.local and add your project URL and publishable/anon key.');return;}setBusy(true);try{const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error)throw error;setMessage(data.session?'Account created successfully.':'Account created. Check your email to confirm, then sign in.');}catch(err){setMessage(err.message||'Could not create account.');}finally{setBusy(false);}}
 return <div className="shell">
  <header><a className="brand" href="#home"><span className="mark"><Sparkles/></span><span>AI SKILLS <b>ACADEMY</b><small>Learn · Build · Grow</small></span></a><nav><a href="#paths">Learning paths</a><a href="#partners">Creators & partners</a><a href="#join">Join academy</a></nav></header>
  <main id="home">
   <section className="hero"><div><span className="eyebrow">PRACTICAL AI LEARNING</span><h1>Learn AI skills.<br/><em>Build what’s next.</em></h1><p>Explore practical learning pathways for AI video, design, prompting, websites and digital products. Start with the foundations, then build skills through projects.</p><div className="actions"><a className="button primary" href="#paths">Explore learning paths <ArrowRight size={17}/></a><a className="button ghost" href="#join">Create an account</a></div><div className="trust"><span><GraduationCap/> Beginner-friendly pathways</span><span><Users/> Learning community</span></div></div><aside className="hero-card"><span className="orb"><Sparkles size={28}/></span><span className="eyebrow">YOUR NEXT SKILL</span><h2>From curiosity<br/>to capability.</h2><p>Choose a focus, practise with projects and keep growing as AI tools evolve.</p><div className="mini-stats"><div><b>5</b><small>specialist paths</small></div><div><b>₦5k</b><small>foundation / month</small></div></div></aside></section>
   <section className="section" id="paths"><div className="heading"><span className="eyebrow">CHOOSE YOUR FOCUS</span><h2>Build skills you can <em>put to work.</em></h2><p>Select one or more specialist pathways and see the estimated monthly membership price.</p></div><div className="path-grid">{paths.map(p=>{const Icon=p.icon,active=selected.includes(p.id);return <button className={'path '+(active?'active':'')} key={p.id} onClick={()=>toggle(p.id)}><Icon size={23}/><span className="path-check">{active?'✓':'+'}</span><h3>{p.title}</h3><p>{p.desc}</p><b>+{money(5000)} / month</b></button>})}</div>
    <div className="pricing"><div><span className="eyebrow">YOUR MEMBERSHIP</span><h3>Foundation membership</h3><p>Core AI foundations and learning resources are included.</p><label className="mentor"><input type="checkbox" checked={mentor} onChange={e=>setMentor(e.target.checked)}/> Add Mentorship Plus <b>+{money(10000)}/month</b></label><small>Foundation membership: {money(5000)}/month</small></div><div className="total"><small>Estimated recurring price</small><strong>{money(total)}<small>/month</small></strong><button className="button primary" onClick={()=>setMessage('Selection noted. Account saving and checkout require configured Supabase and real Selar product URLs.')}>Save selection <ArrowRight size={16}/></button><button className="button ghost" onClick={()=>checkout?window.location.assign(checkout):setMessage('Checkout is not live for this selection yet. Add and test the matching Selar product URL in your deployment settings.')}>Continue to payment</button></div></div>{message&&<p className="message" role="status">{message}</p>}
   </section>
   <section className="section partners" id="partners"><div className="heading"><span className="eyebrow">GROW WITH US</span><h2>Creators teach. <em>Communities grow.</em></h2><p>We want to work with educators and community promoters who help more people learn practical AI skills.</p></div><div className="partner-grid"><article><BookOpen/><h3>Course creators</h3><p>Share your expertise, propose courses and build a public teaching identity. Course submissions and creator payouts require an approved marketplace workflow.</p></article><article><Link2/><h3>Community partners</h3><p>Help people discover useful learning paths. Referral attribution is an MVP feature; commissions are not automatically verified or paid yet.</p></article><article><Users/><h3>Learners</h3><p>Start with the foundations, pick a focus and keep building your skills through practical projects.</p></article></div></section>
   <section className="section join" id="join"><div><span className="eyebrow">START YOUR JOURNEY</span><h2>Make your next step <em>count.</em></h2><p>Create a member account to begin. Authentication works after Supabase is configured.</p></div><form onSubmit={signup}><label>Your name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label><button className="button primary" disabled={busy}>{busy?'Please wait…':'Create account'} <ArrowRight size={16}/></button>{message&&<p className="message">{message}</p>}</form></section>
  </main><footer><a className="brand" href="#home"><span className="mark"><Sparkles/></span><span>AI SKILLS <b>ACADEMY</b><small>Learn · Build · Grow</small></span></a><p>© {new Date().getFullYear()} AI Skills Academy. Learn by building.</p></footer>
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);