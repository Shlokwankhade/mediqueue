
import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

const QUICK_REPLIES = [
  'Book appointment',
  'Check queue status',
  'My prescriptions',
  'Find doctors',
  'Payment help',
  'Health records',
];

const LOCAL_REPLIES = {
  'hello': 'Hello! I am MediBot, your AI healthcare assistant. How can I help you today?',
  'hi': 'Hi there! I am MediBot. Ask me anything about your appointments, queue, prescriptions or health!',
  'book': 'To book an appointment: Go to Find Doctors, select a doctor, pick a date and time slot. Need help choosing a specialist?',
  'appointment': 'You can view all your appointments in My Appointments section. Want to book a new one?',
  'queue': 'Check your real-time queue position in Queue Status. Your token number and estimated wait time are shown live!',
  'prescription': 'Your prescriptions are in the Prescriptions section. Doctors send them directly after consultation via email too!',
  'payment': 'Pay consultation fees in the Payments section using Razorpay - supports UPI, cards, net banking.',
  'doctor': 'Find all available doctors in Find Doctors. You can see their speciality, fees, ratings and availability!',
  'health': 'Your complete health records - blood group, BMI, allergies, medications are in Health Records section.',
  'review': 'You can rate and review doctors after completed appointments in the Reviews section.',
  'chat': 'Message your doctor directly in the Messages section after booking an appointment!',
  'cancel': 'You can cancel confirmed appointments from My Appointments section.',
  'report': 'Download your health records as PDF from the Health Records section.',
  'password': 'Reset your password using Forgot Password on the login page. A reset link will be sent to your email.',
  'help': 'I can help with: booking appointments, queue status, prescriptions, payments, health records, doctor reviews and more!',
  'thank': 'You are welcome! Is there anything else I can help you with?',
  'bye': 'Goodbye! Stay healthy! Come back anytime you need help.',
};

function TypingDots() {
  return (
    <div style={{display:'flex',gap:4,padding:'12px 16px',background:'var(--surface-2)',borderRadius:'18px 18px 18px 4px',width:'fit-content'}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{
          width:8,height:8,borderRadius:'50%',
          background:'#0D9B82',
          animation:'typing 1.2s infinite',
          animationDelay:i*0.2+'s'
        }}/>
      ))}
    </div>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role:'bot', text:'Hi! I am MediBot, your AI healthcare assistant. How can I help you today?', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setPulse(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Pulse animation every 30 seconds to attract attention
  useEffect(() => {
    if (!open) {
      const t = setInterval(() => setPulse(p => !p), 3000);
      return () => clearInterval(t);
    }
  }, [open]);

  const getLocalReply = (text) => {
    const lower = text.toLowerCase();
    for (const [key, reply] of Object.entries(LOCAL_REPLIES)) {
      if (lower.includes(key)) return reply;
    }
    return null;
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role:'user', text: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Try local reply first for speed
    const localReply = getLocalReply(text);
    if (localReply) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role:'bot', text: localReply, time: new Date() }]);
        setLoading(false);
        if (!open) setUnread(u => u+1);
      }, 600);
      return;
    }

    // Call Claude API for complex questions
    try {
      const r = await api.post('/ai/chat', { message: text });
      setMessages(prev => [...prev, { role:'bot', text: r.data.reply, time: new Date() }]);
    } catch(e) {
      // Fallback response
      setMessages(prev => [...prev, {
        role:'bot',
        text: 'I can help you with appointments, queue status, prescriptions, payments and health records. What would you like to know?',
        time: new Date()
      }]);
    } finally {
      setLoading(false);
      if (!open) setUnread(u => u+1);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
  };

  return (
    <>
      <style>{`
        @keyframes typing {
          0%,60%,100% { transform: translateY(0); opacity:0.4; }
          30% { transform: translateY(-6px); opacity:1; }
        }
        @keyframes chatPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(13,155,130,0.4), 0 8px 32px rgba(13,155,130,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(13,155,130,0), 0 8px 32px rgba(13,155,130,0.5); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(20px) scale(0.95); }
          to { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(8px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes float3d {
          0%,100% { transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px); }
          25% { transform: perspective(1000px) rotateX(2deg) rotateY(2deg) translateY(-4px); }
          75% { transform: perspective(1000px) rotateX(-2deg) rotateY(-2deg) translateY(-2px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .chat-btn {
          animation: chatPulse 2s infinite;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1) !important;
        }
        .chat-btn:hover {
          transform: scale(1.15) !important;
          animation: none !important;
          box-shadow: 0 12px 40px rgba(13,155,130,0.5) !important;
        }
        .chat-window {
          animation: slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .msg-bubble {
          animation: fadeIn 0.3s ease;
        }
        .medibot-avatar {
          animation: float3d 4s ease-in-out infinite;
        }
        .quick-reply-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(13,155,130,0.3) !important;
        }
      `}</style>

      {/* Chat Button */}
      <div style={{position:'fixed',bottom:24,right:24,zIndex:9999}}>
        {/* Unread badge */}
        {unread > 0 && !open && (
          <div style={{
            position:'absolute',top:-8,right:-8,
            width:22,height:22,borderRadius:'50%',
            background:'#F43F5E',color:'white',
            fontSize:11,fontWeight:700,
            display:'flex',alignItems:'center',justifyContent:'center',
            border:'2px solid white',zIndex:1,
            animation:'fadeIn 0.3s ease'
          }}>{unread}</div>
        )}

        <button
          className='chat-btn'
          onClick={() => setOpen(o => !o)}
          style={{
            width:58,height:58,borderRadius:18,
            background:tg,border:'none',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center',
            position:'relative',overflow:'hidden'
          }}
        >
          {/* 3D shine effect */}
          <div style={{
            position:'absolute',inset:0,
            background:'linear-gradient(135deg,rgba(255,255,255,0.3) 0%,transparent 50%)',
            borderRadius:18
          }}/>
          <div style={{position:'relative',zIndex:1,transition:'all 0.3s',transform:open?'rotate(45deg)':'rotate(0deg)'}}>
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div className='chat-window' style={{
          position:'fixed',bottom:96,right:24,
          width:380,height:560,
          background:'var(--surface, #0F1923)',
          borderRadius:24,
          border:'1px solid var(--border, #1A2C4A)',
          boxShadow:'0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(13,155,130,0.1)',
          display:'flex',flexDirection:'column',
          overflow:'hidden',zIndex:9998,
          backdropFilter:'blur(20px)'
        }}>

          {/* Header */}
          <div style={{
            background:'linear-gradient(135deg,#0D9B82,#0A7A67)',
            padding:'16px 18px',
            display:'flex',alignItems:'center',gap:12,
            position:'relative',overflow:'hidden'
          }}>
            {/* 3D background effect */}
            <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 60%)'}}/>
            <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.05)'}}/>

            {/* Avatar */}
            <div className='medibot-avatar' style={{
              width:44,height:44,borderRadius:14,
              background:'rgba(255,255,255,0.2)',
              display:'flex',alignItems:'center',justifyContent:'center',
              backdropFilter:'blur(10px)',
              border:'1px solid rgba(255,255,255,0.3)',
              flexShrink:0,position:'relative',zIndex:1
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
                <path d="M12 12c-5 0-9 2.5-9 5.5V20h18v-2.5c0-3-4-5.5-9-5.5z"/>
              </svg>
              <div style={{
                position:'absolute',bottom:2,right:2,
                width:10,height:10,borderRadius:'50%',
                background:'#10B981',border:'2px solid white'
              }}/>
            </div>

            <div style={{flex:1,position:'relative',zIndex:1}}>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:15,color:'white'}}>MediBot AI</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.8)',display:'flex',alignItems:'center',gap:4}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:'#10B981',display:'inline-block'}}/>
                Online - Powered by Claude AI
              </div>
            </div>

            <button onClick={()=>setOpen(false)} style={{
              width:32,height:32,borderRadius:9,
              background:'rgba(255,255,255,0.15)',border:'none',
              cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
              color:'white',fontSize:14,position:'relative',zIndex:1,
              transition:'background 0.2s'
            }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.25)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex:1,overflowY:'auto',padding:'16px',
            display:'flex',flexDirection:'column',gap:10,
            background:'var(--bg, #070D18)'
          }}>
            {messages.map((msg, i) => (
              <div key={i} className='msg-bubble' style={{
                display:'flex',
                flexDirection:msg.role==='user'?'row-reverse':'row',
                alignItems:'flex-end',gap:8
              }}>
                {msg.role === 'bot' && (
                  <div style={{
                    width:28,height:28,borderRadius:9,
                    background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    flexShrink:0
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
                      <path d="M12 12c-5 0-9 2.5-9 5.5V20h18v-2.5c0-3-4-5.5-9-5.5z"/>
                    </svg>
                  </div>
                )}
                <div style={{maxWidth:'75%'}}>
                  <div style={{
                    padding:'10px 14px',
                    borderRadius:msg.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',
                    background:msg.role==='user'
                      ?'linear-gradient(135deg,#0D9B82,#1DBEA0)'
                      :'var(--surface-2, #132038)',
                    color:msg.role==='user'?'white':'var(--text, #E8EEFF)',
                    fontSize:13,lineHeight:1.55,
                    boxShadow:msg.role==='user'
                      ?'0 4px 14px rgba(13,155,130,0.3)'
                      :'0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize:10,color:'var(--text-3, #3D5075)',
                    marginTop:3,
                    textAlign:msg.role==='user'?'right':'left',
                    paddingLeft:msg.role==='bot'?4:0,
                    paddingRight:msg.role==='user'?4:0
                  }}>
                    {formatTime(msg.time)}
                    {msg.role==='user' && <span style={{marginLeft:4}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0D9B82" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className='msg-bubble' style={{display:'flex',alignItems:'flex-end',gap:8}}>
                <div style={{width:28,height:28,borderRadius:9,background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/><path d="M12 12c-5 0-9 2.5-9 5.5V20h18v-2.5c0-3-4-5.5-9-5.5z"/></svg>
                </div>
                <TypingDots/>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div style={{padding:'8px 12px',background:'var(--surface, #0D1526)',borderTop:'1px solid var(--border, #1A2C4A)'}}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3, #3D5075)',textTransform:'uppercase',letterSpacing:1,marginBottom:6}}>Quick Questions</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {QUICK_REPLIES.map(q=>(
                  <button
                    key={q}
                    className='quick-reply-btn'
                    onClick={()=>sendMessage(q)}
                    style={{
                      padding:'5px 10px',
                      background:'var(--surface-2, #132038)',
                      border:'1px solid var(--border, #1A2C4A)',
                      borderRadius:99,
                      fontSize:11,fontWeight:600,
                      color:'var(--text-2, #7B8DB8)',
                      cursor:'pointer',
                      transition:'all 0.2s'
                    }}
                  >{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding:'12px 14px',
            background:'var(--surface, #0D1526)',
            borderTop:'1px solid var(--border, #1A2C4A)',
            display:'flex',gap:8,alignItems:'center'
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyPress={e=>e.key==='Enter'&&sendMessage(input)}
              placeholder='Ask me anything...'
              style={{
                flex:1,padding:'10px 14px',
                background:'var(--surface-2, #132038)',
                border:'1.5px solid var(--border, #1A2C4A)',
                borderRadius:12,fontSize:13,
                color:'var(--text, #E8EEFF)',
                outline:'none',
                fontFamily:'DM Sans,sans-serif',
                transition:'border-color 0.2s'
              }}
              onFocus={e=>e.target.style.borderColor='#0D9B82'}
              onBlur={e=>e.target.style.borderColor='var(--border, #1A2C4A)'}
            />
            <button
              onClick={()=>sendMessage(input)}
              disabled={!input.trim()||loading}
              style={{
                width:40,height:40,borderRadius:12,
                background:input.trim()?tg:'var(--surface-2, #132038)',
                border:'none',cursor:input.trim()?'pointer':'not-allowed',
                display:'flex',alignItems:'center',justifyContent:'center',
                transition:'all 0.2s',flexShrink:0,
                boxShadow:input.trim()?'0 4px 14px rgba(13,155,130,0.3)':'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim()?'white':'#3D5075'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
