import { useState, useRef, useEffect } from 'react';
const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';
const REPLIES = {
  'queue status': 'You are currently at position #3. Estimated wait: ~12 minutes. Dr. Sarah Smith is seeing patient #32.',
  'book': 'Go to Find Doctors, select a specialist and available slot. I can guide you!',
  'prescription': 'Your Amoxicillin (500mg) expires in 5 days. Want me to send a refill request?',
  'symptom': 'Describe your symptoms and I will help assess severity. Note: not a medical diagnosis.',
  'hello': 'Hello! I am your MEDIQUEUE AI assistant. How can I help you today?',
  'hi': 'Hi there! How can I assist you today?',
  'wait': 'Average wait time today is 12 minutes. The queue has 5 patients ahead.',
  'cancel': 'To cancel an appointment, go to Appointments panel and click Cancel on the appointment.',
};
const getReply = (msg) => {
  const lower = msg.toLowerCase();
  for (const [key, val] of Object.entries(REPLIES)) {
    if (lower.includes(key)) return val;
  }
  return 'I understand your concern. Let me help — could you provide more details so I can assist you better?';
};
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ who:'bot', text:'👋 Hello! I am your AI health assistant. I can help you book appointments, check queue status, or answer health questions.' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const ref = useRef();
  useEffect(() => { if(ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs]);
  const send = (txt) => {
    const m = txt || input.trim();
    if (!m) return;
    setMsgs(p => [...p, { who:'user', text:m }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(p => [...p, { who:'bot', text:getReply(m) }]);
    }, 800);
  };
  return (
    <>
      <div onClick={()=>setOpen(v=>!v)} style={{position:'fixed',bottom:24,right:24,width:54,height:54,background:tg,borderRadius:15,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 8px 24px rgba(13,155,130,.4)',zIndex:998,transition:'all .2s'}}>
        <i className={'fas fa-'+(open?'times':'comment-medical')} style={{color:'#fff',fontSize:20}}/>
      </div>
      {open && (
        <div className='si' style={{position:'fixed',bottom:90,right:24,width:340,height:500,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:20,display:'flex',flexDirection:'column',zIndex:999,boxShadow:'0 24px 64px rgba(0,0,0,.18)',overflow:'hidden'}}>
          <div style={{padding:'14px 16px',background:tg,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:'#fff'}}>MEDIQUEUE AI</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.8)',display:'flex',alignItems:'center',gap:5}}><span style={{width:5,height:5,background:'#4ADE80',borderRadius:'50%',animation:'pulse 1.5s infinite'}}/>Online 24/7</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:'rgba(255,255,255,.15)',border:'none',borderRadius:8,width:28,height:28,cursor:'pointer',color:'#fff',fontSize:12}}>✕</button>
          </div>
          <div ref={ref} style={{flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:8}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:'flex',justifyContent:m.who==='user'?'flex-end':'flex-start'}}>
                <div style={{maxWidth:'80%',padding:'8px 12px',borderRadius:m.who==='user'?'12px 12px 3px 12px':'12px 12px 12px 3px',background:m.who==='user'?tg:'var(--surface-2)',color:m.who==='user'?'#fff':'var(--text)',fontSize:12,lineHeight:1.55}}>{m.text}</div>
              </div>
            ))}
            {typing && <div style={{display:'flex',justifyContent:'flex-start'}}><div style={{padding:'8px 14px',borderRadius:'12px 12px 12px 3px',background:'var(--surface-2)',fontSize:12,color:'var(--text-3)'}}>Typing...</div></div>}
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',padding:'0 10px 8px'}}>
            {['Queue status','Book appointment','Refill prescription','Symptom check'].map(q=>(
              <span key={q} onClick={()=>send(q)} style={{background:'#E6F7F4',color:'#0A7A67',border:'1px solid rgba(13,155,130,.2)',borderRadius:99,padding:'3px 10px',fontSize:11,cursor:'pointer'}}>{q}</span>
            ))}
          </div>
          <div style={{display:'flex',gap:6,padding:'10px',borderTop:'1px solid var(--border)',flexShrink:0}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder='Type a message...' style={{flex:1,background:'var(--surface-2)',border:'1.5px solid var(--border)',borderRadius:8,padding:'8px 11px',fontFamily:'DM Sans,sans-serif',fontSize:12,color:'var(--text)',outline:'none'}}/>
            <button onClick={()=>send()} style={{padding:'8px 13px',background:tg,color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontSize:12}}><i className='fas fa-paper-plane'/></button>
          </div>
        </div>
      )}
    </>
  );
}