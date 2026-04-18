
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import DarkToggle from '../components/DarkToggle';

export default function Landing() {
  const nav = useNavigate();
  const { dark } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({x:0,y:0});
  const [counts, setCounts] = useState({patients:0,doctors:0,clinics:0,rating:0});
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const tg = 'linear-gradient(135deg,#0D9B82,#1DBEA0)';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Parallax mouse effect
  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({x, y});
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Intersection observer for stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.5 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Animated counters
  useEffect(() => {
    if (!statsVisible) return;
    const targets = {patients:12000,doctors:350,clinics:500,rating:49};
    const duration = 2000;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const p = Math.min(step/steps, 1);
      const ease = 1 - Math.pow(1-p, 3);
      setCounts({
        patients: Math.round(targets.patients * ease),
        doctors: Math.round(targets.doctors * ease),
        clinics: Math.round(targets.clinics * ease),
        rating: Math.round(targets.rating * ease)
      });
      if (step >= steps) clearInterval(timer);
    }, duration/steps);
    return () => clearInterval(timer);
  }, [statsVisible]);

  const Card3D = ({children, style}) => {
    const [tilt, setTilt] = useState({x:0,y:0});
    const ref = useRef(null);
    return (
      <div
        ref={ref}
        onMouseMove={e => {
          const rect = ref.current.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
          const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
          setTilt({x,y});
        }}
        onMouseLeave={() => setTilt({x:0,y:0})}
        style={{
          ...style,
          transform: 'perspective(1000px) rotateX('+tilt.y+'deg) rotateY('+tilt.x+'deg) translateZ(0)',
          transition: tilt.x===0&&tilt.y===0 ? 'transform 0.5s ease' : 'transform 0.1s ease',
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    );
  };

  const features = [
    {icon:'fa-brain',title:'AI Wait Prediction',desc:'ML model predicts wait times with 97.3% accuracy using 50+ variables. Updates every 30 seconds.',color:'#0D9B82',grad:'linear-gradient(135deg,#0D9B82,#1DBEA0)',img:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80'},
    {icon:'fa-calendar-check',title:'Smart Booking',desc:'Book appointments in under 60 seconds. Live calendar with instant confirmation.',color:'#7C3AED',grad:'linear-gradient(135deg,#7C3AED,#A78BFA)',img:'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80'},
    {icon:'fa-video',title:'Telemedicine',desc:'HD video consultations built into the platform. No Zoom needed.',color:'#0EA5E9',grad:'linear-gradient(135deg,#0EA5E9,#38BDF8)',img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80'},
    {icon:'fa-prescription-bottle-medical',title:'E-Prescriptions',desc:'Digital prescriptions sent to patients via email after every consultation.',color:'#F43F5E',grad:'linear-gradient(135deg,#F43F5E,#FB7185)',img:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80'},
    {icon:'fa-chart-line',title:'Live Analytics',desc:'Real-time dashboards for revenue, appointments and patient flow.',color:'#F59E0B',grad:'linear-gradient(135deg,#F59E0B,#FCD34D)',img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80'},
    {icon:'fa-shield-heart',title:'HIPAA Compliant',desc:'End-to-end encrypted. Your health data is completely secure and private.',color:'#10B981',grad:'linear-gradient(135deg,#10B981,#34D399)',img:'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&q=80'},
  ];

  const testimonials = [
    {text:'We reduced average wait time from 48 to 14 minutes in the first month. Our patient satisfaction scores went from 3.2 to 4.8 stars.',name:'Dr. Rajesh Mehta',role:'Cardiologist, City Hospital Mumbai',img:'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80',rating:5},
    {text:'The QR check-in eliminated our front desk bottleneck entirely. Staff now spend time on care, not paperwork.',name:'Dr. Sneha Patel',role:'Clinic Director, Apollo Clinic Delhi',img:'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80',rating:5},
    {text:'Revenue analytics showed us Tuesday afternoons were 40% underbooked. Fixed it in a week - INR 80K more per month.',name:'Amit Kumar',role:'Administrator, Fortis Bangalore',img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',rating:5},
  ];

  return (
    <div style={{minHeight:'100vh',background:dark?'#070D18':'#FFFFFF',color:dark?'#E8EEFF':'#0A1628',fontFamily:'DM Sans,sans-serif',overflowX:'hidden'}}>

      {/* -- NAVBAR -- */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:999,
        height:72,padding:'0 60px',
        display:'flex',alignItems:'center',justifyContent:'space-between',
        background:scrolled?(dark?'rgba(7,13,24,0.95)':'rgba(255,255,255,0.95)'):'transparent',
        backdropFilter:scrolled?'blur(20px)':'none',
        borderBottom:scrolled?('1px solid '+(dark?'#1A2C4A':'#E2E8F0')):'none',
        transition:'all 0.4s cubic-bezier(0.4,0,0.2,1)'
      }}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:42,height:42,background:tg,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(13,155,130,0.4)'}}>
            <i className='fas fa-heart-pulse' style={{color:'white',fontSize:18}}/>
          </div>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,background:tg,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>MEDIQUEUE</div>
            <div style={{fontSize:9,color:'#94A3B8',letterSpacing:2,textTransform:'uppercase',marginTop:-2}}>Digital Queue System</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:32}}>
          {['Features','How It Works','Pricing','About'].map(l=>(
            <a key={l} href={'#'+l.toLowerCase().replace(/ /g,'-')} style={{fontSize:14,fontWeight:500,color:dark?'#7B8DB8':'#64748B',textDecoration:'none',transition:'color 0.2s',position:'relative'}}
              onMouseEnter={e=>{e.target.style.color='#0D9B82'}}
              onMouseLeave={e=>{e.target.style.color=dark?'#7B8DB8':'#64748B'}}
            >{l}</a>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <DarkToggle/>
          <button onClick={()=>nav('/login')} style={{padding:'9px 20px',background:'transparent',border:'1.5px solid '+(dark?'#1A2C4A':'#E2E8F0'),borderRadius:12,fontFamily:'DM Sans,sans-serif',fontWeight:600,fontSize:13,cursor:'pointer',color:dark?'#E8EEFF':'#0A1628',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#0D9B82'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=dark?'#1A2C4A':'#E2E8F0'}}>
            Log In
          </button>
          <button onClick={()=>nav('/register')} style={{padding:'9px 20px',background:tg,border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontWeight:700,fontSize:13,cursor:'pointer',color:'white',boxShadow:'0 4px 16px rgba(13,155,130,0.4)',transition:'all 0.2s'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(13,155,130,0.5)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 16px rgba(13,155,130,0.4)'}}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* -- HERO -- */}
      <section ref={heroRef} style={{
        minHeight:'100vh',
        display:'flex',alignItems:'center',
        padding:'120px 60px 80px',
        position:'relative',overflow:'hidden',
        background:dark
          ?'radial-gradient(ellipse at 30% 50%, rgba(13,155,130,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.06) 0%, transparent 50%), #070D18'
          :'radial-gradient(ellipse at 30% 50%, rgba(13,155,130,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.04) 0%, transparent 50%), #FAFFFE'
      }}>
        {/* Animated grid background */}
        <div style={{
          position:'absolute',inset:0,
          backgroundImage:'linear-gradient('+(dark?'rgba(13,155,130,0.04)':'rgba(13,155,130,0.03)')+' 1px, transparent 1px), linear-gradient(90deg, '+(dark?'rgba(13,155,130,0.04)':'rgba(13,155,130,0.03)')+' 1px, transparent 1px)',
          backgroundSize:'60px 60px',
          transform:'perspective(1000px) rotateX(10deg)',
          transformOrigin:'top',
          opacity:0.6
        }}/>

        {/* Floating orbs */}
        <div style={{position:'absolute',top:'15%',right:'10%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle, rgba(13,155,130,0.12) 0%, transparent 70%)',transform:'translate('+mousePos.x*0.5+'px,'+mousePos.y*0.5+'px)',transition:'transform 0.3s ease',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:'20%',left:'5%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',transform:'translate('+mousePos.x*-0.3+'px,'+mousePos.y*-0.3+'px)',transition:'transform 0.3s ease',pointerEvents:'none'}}/>

        <div style={{maxWidth:1300,width:'100%',margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center',position:'relative',zIndex:1}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:dark?'rgba(13,155,130,0.12)':'rgba(13,155,130,0.08)',color:'#0D9B82',padding:'7px 16px',borderRadius:99,fontSize:12,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:28,border:'1px solid rgba(13,155,130,0.2)'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#0D9B82',display:'inline-block',animation:'pulse 2s infinite'}}/>
              AI-Powered Healthcare
            </div>

            <h1 style={{fontFamily:'Syne,sans-serif',fontSize:64,fontWeight:900,lineHeight:1.05,marginBottom:24,letterSpacing:-2,color:dark?'#F0F4FF':'#0A1628'}}>
              Mediqueue:<br/>
              <span style={{background:'linear-gradient(135deg,#0D9B82,#1DBEA0,#0EA5E9)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundSize:'200% auto',animation:'shimmer 3s linear infinite'}}>
                Digital Appointment
              </span><br/>
              <span style={{color:dark?'#F0F4FF':'#0A1628'}}>&amp; Queue System</span>
            </h1>

            <p style={{fontSize:18,lineHeight:1.75,color:dark?'#7B8DB8':'#64748B',marginBottom:40,maxWidth:520}}>
              Eliminate waiting room chaos forever. AI-powered queue management, instant booking, real-time tracking � the future of Indian healthcare is here.
            </p>

            <div style={{display:'flex',gap:14,marginBottom:48,flexWrap:'wrap'}}>
              <button onClick={()=>nav('/register')} style={{display:'inline-flex',alignItems:'center',gap:10,padding:'15px 32px',background:tg,border:'none',borderRadius:16,fontFamily:'DM Sans,sans-serif',fontWeight:700,fontSize:16,cursor:'pointer',color:'white',boxShadow:'0 8px 32px rgba(13,155,130,0.4)',transition:'all 0.3s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 16px 48px rgba(13,155,130,0.5)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 8px 32px rgba(13,155,130,0.4)'}}>
                <i className='fas fa-rocket'/> Start Free Today
              </button>
              <button onClick={()=>nav('/login')} style={{display:'inline-flex',alignItems:'center',gap:10,padding:'15px 32px',background:'transparent',border:'2px solid '+(dark?'#1A2C4A':'#E2E8F0'),borderRadius:16,fontFamily:'DM Sans,sans-serif',fontWeight:600,fontSize:16,cursor:'pointer',color:dark?'#E8EEFF':'#0A1628',transition:'all 0.3s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#0D9B82';e.currentTarget.style.color='#0D9B82'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=dark?'#1A2C4A':'#E2E8F0';e.currentTarget.style.color=dark?'#E8EEFF':'#0A1628'}}>
                <i className='fas fa-sign-in-alt' style={{color:'#0D9B82'}}/> Sign In
              </button>
            </div>

            <div style={{display:'flex',alignItems:'center',gap:24,flexWrap:'wrap'}}>
              {[
                {icon:'fa-shield-check',text:'HIPAA Compliant'},
                {icon:'fa-lock',text:'End-to-End Encrypted'},
                {icon:'fa-award',text:'4.9/5 Rated'},
              ].map(b=>(
                <div key={b.text} style={{display:'flex',alignItems:'center',gap:7,fontSize:13,color:dark?'#3D5075':'#94A3B8'}}>
                  <i className={'fas '+b.icon} style={{color:'#0D9B82',fontSize:14}}/>{b.text}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div style={{position:'relative',transform:'perspective(1200px) rotateY('+mousePos.x*-0.3+'deg) rotateX('+mousePos.y*0.2+'deg)',transition:'transform 0.3s ease'}}>
            {/* Main queue card */}
            <Card3D style={{background:dark?'rgba(13,21,38,0.9)':'white',borderRadius:24,padding:28,boxShadow:'0 32px 80px rgba(0,0,0,'+(dark?'0.5':'0.12')+')',border:'1px solid '+(dark?'#1A2C4A':'#E2E8F0'),backdropFilter:'blur(20px)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Live Queue</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:800,color:dark?'#F0F4FF':'#0A1628'}}>General OPD</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(16,185,129,0.12)',color:'#10B981',padding:'6px 12px',borderRadius:99,fontSize:12,fontWeight:700,border:'1px solid rgba(16,185,129,0.2)'}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#10B981',display:'inline-block',animation:'pulse 1.5s infinite'}}/>
                  LIVE
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                <div style={{background:dark?'rgba(13,155,130,0.1)':'rgba(13,155,130,0.06)',borderRadius:16,padding:16,border:'1px solid rgba(13,155,130,0.15)'}}>
                  <div style={{fontSize:11,color:'#94A3B8',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>Your Token</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:36,fontWeight:900,color:'#0D9B82',lineHeight:1}}>MQ-034</div>
                </div>
                <div style={{background:dark?'rgba(245,158,11,0.1)':'rgba(245,158,11,0.06)',borderRadius:16,padding:16,border:'1px solid rgba(245,158,11,0.15)'}}>
                  <div style={{fontSize:11,color:'#94A3B8',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:.5}}>Position</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:36,fontWeight:900,color:'#F59E0B',lineHeight:1}}>#3</div>
                </div>
              </div>

              <div style={{background:dark?'rgba(13,21,38,0.6)':'#F8FAFC',borderRadius:14,padding:14,marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between',border:'1px solid '+(dark?'#1A2C4A':'#E2E8F0')}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <i className='fas fa-clock' style={{color:'#F59E0B',fontSize:16}}/>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:'#94A3B8',fontWeight:600}}>ESTIMATED WAIT</div>
                    <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800,color:'#F59E0B'}}>~12 min</div>
                  </div>
                </div>
                <div style={{background:'rgba(13,155,130,0.12)',color:'#0D9B82',padding:'5px 12px',borderRadius:99,fontSize:12,fontWeight:700,border:'1px solid rgba(13,155,130,0.2)'}}>
                  70% less wait
                </div>
              </div>

              <div style={{height:6,background:dark?'#1A2C4A':'#E2E8F0',borderRadius:99,overflow:'hidden',marginBottom:12}}>
                <div style={{height:'100%',width:'68%',background:tg,borderRadius:99,transition:'width 1s ease',boxShadow:'0 0 8px rgba(13,155,130,0.4)'}}/>
              </div>

              <div style={{display:'flex',gap:6}}>
                {['31','32','33'].map(n=>(
                  <div key={n} style={{flex:1,height:38,borderRadius:10,background:dark?'#0A1320':'#F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#94A3B8',textDecoration:'line-through'}}>
                    {n}
                  </div>
                ))}
                <div style={{flex:1,height:38,borderRadius:10,background:tg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'white',boxShadow:'0 4px 14px rgba(13,155,130,0.4)'}}>34</div>
                <div style={{flex:1,height:38,borderRadius:10,background:'rgba(13,155,130,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#0D9B82',border:'2px solid rgba(13,155,130,0.3)'}}>35</div>
              </div>
            </Card3D>

            {/* Floating badge - AI */}
            <div style={{position:'absolute',top:-24,right:-24,background:dark?'#0D1526':'white',borderRadius:18,padding:'14px 18px',boxShadow:'0 12px 40px rgba(0,0,0,'+(dark?'0.4':'0.12')+')',border:'1px solid '+(dark?'#1A2C4A':'#E2E8F0'),animation:'float 4s ease-in-out infinite'}}>
              <div style={{fontSize:10,fontWeight:700,color:'#94A3B8',letterSpacing:.5,marginBottom:4}}>AI PREDICTION</div>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:900,color:'#0D9B82'}}>97.3% Accurate</div>
            </div>

            {/* Floating badge - doctor */}
            <div style={{position:'absolute',bottom:-20,left:-20,background:dark?'#0D1526':'white',borderRadius:18,padding:'14px 18px',boxShadow:'0 12px 40px rgba(0,0,0,'+(dark?'0.4':'0.12')+')',border:'1px solid '+(dark?'#1A2C4A':'#E2E8F0'),animation:'float 4s ease-in-out infinite 1s',display:'flex',alignItems:'center',gap:10}}>
              <img src='https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=60&q=80' alt='Doctor' style={{width:40,height:40,borderRadius:12,objectFit:'cover'}}/>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:dark?'#F0F4FF':'#0A1628'}}>Dr. Sarah Smith</div>
                <div style={{fontSize:11,color:'#10B981',fontWeight:600}}>Available Now</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- STATS -- */}
      <section ref={statsRef} style={{background:'linear-gradient(135deg,#0A1628,#0D1F35)',padding:'80px 60px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:40,textAlign:'center'}}>
          {[
            {val:counts.patients.toLocaleString()+'+',label:'Patients Served',icon:'fa-users'},
            {val:counts.doctors+'+',label:'Expert Doctors',icon:'fa-user-md'},
            {val:counts.clinics+'+',label:'Partner Clinics',icon:'fa-hospital'},
            {val:(counts.rating/10).toFixed(1)+'/5',label:'Average Rating',icon:'fa-star'},
          ].map(s=>(
            <div key={s.label}>
              <div style={{width:56,height:56,borderRadius:16,background:'rgba(13,155,130,0.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',border:'1px solid rgba(13,155,130,0.2)'}}>
                <i className={'fas '+s.icon} style={{color:'#0D9B82',fontSize:22}}/>
              </div>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:48,fontWeight:900,background:'linear-gradient(135deg,#0D9B82,#1DBEA0)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1,marginBottom:8}}>{s.val}</div>
              <div style={{fontSize:14,color:'#4A5978',fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* -- FEATURES -- */}
      <section id='features' style={{padding:'100px 60px',background:dark?'#070D18':'#FAFFFE'}}>
        <div style={{maxWidth:1300,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:72}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:dark?'rgba(13,155,130,0.12)':'rgba(13,155,130,0.08)',color:'#0D9B82',padding:'7px 16px',borderRadius:99,fontSize:12,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:20,border:'1px solid rgba(13,155,130,0.2)'}}>
              Everything You Need
            </div>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:48,fontWeight:900,letterSpacing:-1.5,marginBottom:16,color:dark?'#F0F4FF':'#0A1628'}}>Built for Modern Healthcare</h2>
            <p style={{fontSize:18,color:dark?'#7B8DB8':'#64748B',maxWidth:560,margin:'0 auto',lineHeight:1.7}}>A complete digital healthcare ecosystem from booking to billing.</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {features.map((f,i)=>(
              <Card3D key={i} style={{
                background:dark?'rgba(13,21,38,0.8)':'white',
                border:'1px solid '+(dark?'#1A2C4A':'#E2E8F0'),
                borderRadius:24,overflow:'hidden',
                transition:'box-shadow 0.3s',cursor:'default'
              }}>
                <div style={{height:180,overflow:'hidden',position:'relative'}}>
                  <img src={f.img} alt={f.title} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.5s'}}
                    onMouseEnter={e=>e.target.style.transform='scale(1.1)'}
                    onMouseLeave={e=>e.target.style.transform='scale(1)'}
                  />
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, '+(dark?'rgba(13,21,38,0.95)':'rgba(0,0,0,0.5)')+' 0%, transparent 60%)'}}/>
                  <div style={{position:'absolute',top:14,left:14,width:44,height:44,borderRadius:12,background:f.grad,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(0,0,0,0.3)'}}>
                    <i className={'fas '+f.icon} style={{color:'white',fontSize:19}}/>
                  </div>
                </div>
                <div style={{padding:'20px 24px 24px'}}>
                  <h3 style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,marginBottom:8,color:dark?'#F0F4FF':'#0A1628'}}>{f.title}</h3>
                  <p style={{fontSize:14,lineHeight:1.65,color:dark?'#7B8DB8':'#64748B'}}>{f.desc}</p>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* -- HOW IT WORKS -- */}
      <section id='how-it-works' style={{padding:'100px 60px',background:dark?'#0A1320':'#F8FAFC'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:72}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:48,fontWeight:900,letterSpacing:-1.5,marginBottom:16,color:dark?'#F0F4FF':'#0A1628'}}>Book in 60 Seconds</h2>
            <p style={{fontSize:18,color:dark?'#7B8DB8':'#64748B',lineHeight:1.7}}>Four simple steps to quality healthcare</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24,position:'relative'}}>
            <div style={{position:'absolute',top:44,left:'12%',right:'12%',height:2,background:'linear-gradient(90deg,#0D9B82,#7C3AED,#F59E0B,#F43F5E)',borderRadius:99,opacity:0.4}}/>
            {[
              {n:'01',icon:'fa-hospital',title:'Choose Clinic',desc:'Browse 500+ partner clinics and hospitals',color:'#0D9B82',bg:'rgba(13,155,130,0.12)',img:'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=200&q=80'},
              {n:'02',icon:'fa-user-md',title:'Pick Doctor',desc:'See ratings, expertise and availability',color:'#7C3AED',bg:'rgba(124,58,237,0.12)',img:'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80'},
              {n:'03',icon:'fa-calendar-check',title:'Book Slot',desc:'Instant confirmation with email receipt',color:'#F59E0B',bg:'rgba(245,158,11,0.12)',img:'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=200&q=80'},
              {n:'04',icon:'fa-ticket-alt',title:'Track Queue',desc:'Real-time updates on your token status',color:'#F43F5E',bg:'rgba(244,63,94,0.12)',img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&q=80'},
            ].map((s,i)=>(
              <Card3D key={i} style={{background:dark?'rgba(13,21,38,0.8)':'white',borderRadius:20,overflow:'hidden',border:'1px solid '+(dark?'#1A2C4A':'#E2E8F0'),position:'relative',zIndex:1}}>
                <img src={s.img} alt={s.title} style={{width:'100%',height:120,objectFit:'cover'}}/>
                <div style={{padding:20}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                    <div style={{width:40,height:40,borderRadius:12,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid '+s.color+'33'}}>
                      <i className={'fas '+s.icon} style={{color:s.color,fontSize:16}}/>
                    </div>
                    <div style={{fontFamily:'Syne,sans-serif',fontSize:11,fontWeight:800,color:'#94A3B8',letterSpacing:1}}>STEP {s.n}</div>
                  </div>
                  <h4 style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,marginBottom:6,color:dark?'#F0F4FF':'#0A1628'}}>{s.title}</h4>
                  <p style={{fontSize:13,color:dark?'#7B8DB8':'#64748B',lineHeight:1.6}}>{s.desc}</p>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* -- ROLES -- */}
      <section style={{padding:'100px 60px',background:dark?'#070D18':'white'}}>
        <div style={{maxWidth:1300,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:72}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:48,fontWeight:900,letterSpacing:-1.5,marginBottom:16,color:dark?'#F0F4FF':'#0A1628'}}>Built for Everyone</h2>
            <p style={{fontSize:18,color:dark?'#7B8DB8':'#64748B',lineHeight:1.7}}>Separate powerful portals for every role</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
            {[
              {role:'Patient',icon:'fa-user',grad:'linear-gradient(135deg,#0D9B82,#1DBEA0)',img:'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80',features:['Book appointments in 60 seconds','Real-time queue tracking with AI','Receive digital prescriptions','Secure payment via Razorpay','Complete health records & BMI'],desc:'Take control of your healthcare'},
              {role:'Doctor',icon:'fa-user-md',grad:'linear-gradient(135deg,#7C3AED,#A78BFA)',img:'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80',features:['Manage patient schedule efficiently','Control live queue with one click','Issue digital e-prescriptions','View patient health history','Real-time chat with patients'],desc:'Streamline your practice'},
              {role:'Admin',icon:'fa-crown',grad:'linear-gradient(135deg,#F59E0B,#FCD34D)',img:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',features:['Live analytics dashboard','Manage all doctors & patients','Revenue & payment tracking','System health monitoring','Complete queue oversight'],desc:'Full control over your clinic'},
            ].map(r=>(
              <Card3D key={r.role} style={{borderRadius:24,overflow:'hidden',border:'1px solid '+(dark?'#1A2C4A':'#E2E8F0'),transition:'box-shadow 0.3s'}}>
                <div style={{height:220,position:'relative',overflow:'hidden'}}>
                  <img src={r.img} alt={r.role} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'}}/>
                  <div style={{position:'absolute',bottom:20,left:20,right:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                      <div style={{width:40,height:40,borderRadius:12,background:'rgba(255,255,255,0.2)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,0.3)'}}>
                        <i className={'fas '+r.icon} style={{color:'white',fontSize:18}}/>
                      </div>
                      <div>
                        <div style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:800,color:'white'}}>{r.role} Portal</div>
                        <div style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>{r.desc}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{background:dark?'rgba(13,21,38,0.95)':'white',padding:'20px 24px 24px'}}>
                  {r.features.map((f,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,fontSize:13,color:dark?'#7B8DB8':'#475569'}}>
                      <div style={{width:20,height:20,borderRadius:6,background:r.grad,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <i className='fas fa-check' style={{color:'white',fontSize:9}}/>
                      </div>
                      {f}
                    </div>
                  ))}
                  <button onClick={()=>nav('/register')} style={{width:'100%',padding:'12px',background:r.grad,color:'white',border:'none',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',marginTop:12,transition:'opacity 0.2s'}}
                    onMouseEnter={e=>e.currentTarget.style.opacity='0.9'}
                    onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                    Get Started as {r.role}
                  </button>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* -- TESTIMONIALS -- */}
      <section id='about' style={{padding:'100px 60px',background:dark?'#0A1320':'#F8FAFC'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:72}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:48,fontWeight:900,letterSpacing:-1.5,marginBottom:16,color:dark?'#F0F4FF':'#0A1628'}}>Trusted by 500+ Clinics</h2>
            <p style={{fontSize:18,color:dark?'#7B8DB8':'#64748B',lineHeight:1.7}}>From solo practitioners to multi-specialty hospitals across India</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
            {testimonials.map((t,i)=>(
              <Card3D key={i} style={{background:dark?'rgba(13,21,38,0.8)':'white',border:'1px solid '+(dark?'#1A2C4A':'#E2E8F0'),borderRadius:24,padding:28,transition:'box-shadow 0.3s'}}>
                <div style={{display:'flex',gap:4,marginBottom:16}}>
                  {[1,2,3,4,5].map(s=>(
                    <i key={s} className='fas fa-star' style={{color:'#F59E0B',fontSize:14}}/>
                  ))}
                </div>
                <p style={{fontSize:15,lineHeight:1.75,color:dark?'#94A3B8':'#475569',marginBottom:24,fontStyle:'italic'}}>"{t.text}"</p>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <img src={t.img} alt={t.name} style={{width:48,height:48,borderRadius:14,objectFit:'cover',border:'2px solid '+(dark?'#1A2C4A':'#E2E8F0')}}/>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:dark?'#F0F4FF':'#0A1628'}}>{t.name}</div>
                    <div style={{fontSize:12,color:'#94A3B8'}}>{t.role}</div>
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* -- PRICING -- */}
      <section id='pricing' style={{padding:'100px 60px',background:dark?'#070D18':'white'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:72}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:48,fontWeight:900,letterSpacing:-1.5,marginBottom:16,color:dark?'#F0F4FF':'#0A1628'}}>Simple, Transparent Pricing</h2>
            <p style={{fontSize:18,color:dark?'#7B8DB8':'#64748B',lineHeight:1.7}}>No hidden fees. Start free, scale as you grow.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24,alignItems:'center'}}>
            {[
              {name:'Starter',price:'Free',period:'Forever - 1 doctor',features:['30 patients/day','Basic queue management','QR check-in','Email notifications'],featured:false},
              {name:'Pro',price:'INR 4,999',period:'/month per clinic',features:['Unlimited patients','AI wait prediction','Full analytics','HD Telehealth','E-prescriptions','Priority support'],featured:true},
              {name:'Enterprise',price:'Custom',period:'Multi-clinic networks',features:['Everything in Pro','ABDM integration','Custom integrations','Dedicated support','SLA guarantee'],featured:false},
            ].map((p,i)=>(
              <Card3D key={i} style={{
                background:p.featured?(dark?'#0D1526':'#0A1628'):((dark?'rgba(13,21,38,0.8)':'white')),
                border:'1px solid '+(p.featured?'rgba(13,155,130,0.4)':(dark?'#1A2C4A':'#E2E8F0')),
                borderRadius:24,padding:32,
                transform:p.featured?'scale(1.06)':'none',
                boxShadow:p.featured?'0 32px 80px rgba(13,155,130,0.2)':'none',
                position:'relative',overflow:'hidden'
              }}>
                {p.featured && (
                  <>
                    <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:tg}}/>
                    <div style={{display:'inline-block',background:tg,color:'white',fontSize:11,fontWeight:700,padding:'4px 14px',borderRadius:99,marginBottom:16,letterSpacing:.5}}>MOST POPULAR</div>
                  </>
                )}
                <div style={{fontSize:13,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:.8,marginBottom:10}}>{p.name}</div>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:40,fontWeight:900,color:p.featured?'white':(dark?'#F0F4FF':'#0A1628'),lineHeight:1,marginBottom:4}}>{p.price}</div>
                <div style={{fontSize:13,color:p.featured?'#64748B':'#94A3B8',marginBottom:24}}>{p.period}</div>
                {p.features.map((f,j)=>(
                  <div key={j} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,fontSize:13,color:p.featured?'#CBD5E1':(dark?'#7B8DB8':'#475569')}}>
                    <div style={{width:18,height:18,borderRadius:5,background:p.featured?'rgba(13,155,130,0.2)':'rgba(13,155,130,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <i className='fas fa-check' style={{color:'#0D9B82',fontSize:9}}/>
                    </div>
                    {f}
                  </div>
                ))}
                <button onClick={()=>nav('/register')} style={{width:'100%',padding:'13px',background:p.featured?tg:(dark?'rgba(13,155,130,0.1)':'#0A1628'),color:p.featured?'white':(dark?'#0D9B82':'white'),border:p.featured?'none':'1px solid '+(dark?'rgba(13,155,130,0.3)':'transparent'),borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer',marginTop:20,transition:'all 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.opacity='0.9'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                  {p.featured?'Start Free Trial':'Get Started'}
                </button>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* -- CTA -- */}
      <section style={{padding:'100px 60px',background:tg,position:'relative',overflow:'hidden',textAlign:'center'}}>
        <div style={{position:'absolute',top:-100,left:-100,width:400,height:400,borderRadius:'50%',background:'rgba(255,255,255,0.05)'}}/>
        <div style={{position:'absolute',bottom:-100,right:-100,width:500,height:500,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>
        <div style={{position:'relative',zIndex:1,maxWidth:700,margin:'0 auto'}}>
          <h2 style={{fontFamily:'Syne,sans-serif',fontSize:52,fontWeight:900,color:'white',marginBottom:20,letterSpacing:-1.5}}>Ready to Transform Your Clinic?</h2>
          <p style={{fontSize:18,color:'rgba(255,255,255,0.85)',marginBottom:40,lineHeight:1.7}}>Join 500+ clinics across India delivering better care with MEDIQUEUE.</p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>nav('/register')} style={{display:'inline-flex',alignItems:'center',gap:10,padding:'16px 36px',background:'white',color:'#0D9B82',border:'none',borderRadius:16,fontFamily:'DM Sans,sans-serif',fontWeight:700,fontSize:16,cursor:'pointer',boxShadow:'0 8px 32px rgba(0,0,0,0.2)',transition:'all 0.3s'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 16px 48px rgba(0,0,0,0.3)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.2)'}}>
              <i className='fas fa-rocket'/> Start Free Trial
            </button>
            <button onClick={()=>nav('/login')} style={{display:'inline-flex',alignItems:'center',gap:10,padding:'16px 36px',background:'rgba(255,255,255,0.15)',color:'white',border:'2px solid rgba(255,255,255,0.4)',borderRadius:16,fontFamily:'DM Sans,sans-serif',fontWeight:600,fontSize:16,cursor:'pointer',backdropFilter:'blur(10px)',transition:'all 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.25)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}>
              <i className='fas fa-sign-in-alt'/> Sign In
            </button>
          </div>
        </div>
      </section>

      {/* -- FOOTER -- */}
      <footer style={{background:dark?'#040810':'#0A1628',padding:'72px 60px 36px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:60,marginBottom:60}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
                <div style={{width:42,height:42,background:tg,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <i className='fas fa-heart-pulse' style={{color:'white',fontSize:18}}/>
                </div>
                <div>
                  <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,color:'white'}}>MEDIQUEUE</div>
                  <div style={{fontSize:9,color:'#475569',letterSpacing:2,textTransform:'uppercase'}}>Digital Queue System</div>
                </div>
              </div>
              <p style={{fontSize:14,color:'#475569',lineHeight:1.75,maxWidth:280,marginBottom:24}}>Next-generation AI-powered appointment and queue management for Indian healthcare.</p>
              <div style={{display:'flex',gap:10}}>
                {['fa-twitter','fa-linkedin','fa-instagram','fa-github'].map(icon=>(
                  <div key={icon} style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.2s',border:'1px solid rgba(255,255,255,0.08)'}}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(13,155,130,0.2)';e.currentTarget.style.borderColor='rgba(13,155,130,0.3)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}}>
                    <i className={'fab '+icon} style={{color:'#64748B',fontSize:14}}/>
                  </div>
                ))}
              </div>
            </div>
            {[
              ['Product',['Features','Pricing','Integrations','Changelog','API Docs']],
              ['Company',['About Us','Blog','Careers','Contact']],
              ['Legal',['Privacy Policy','Terms of Service','HIPAA Compliance']],
            ].map(([h,ls])=>(
              <div key={h}>
                <h5 style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',color:'#64748B',marginBottom:20}}>{h}</h5>
                <ul style={{listStyle:'none',padding:0}}>
                  {ls.map(l=>(
                    <li key={l} style={{marginBottom:12}}>
                      <a href='#' style={{fontSize:14,color:'#475569',textDecoration:'none',transition:'color 0.2s'}}
                        onMouseEnter={e=>e.target.style.color='#0D9B82'}
                        onMouseLeave={e=>e.target.style.color='#475569'}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:28,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:13,color:'#334155',flexWrap:'wrap',gap:12}}>
            <span>2026 MEDIQUEUE - Digital Appointment and Queue System. All rights reserved.</span>
            <span style={{color:'#0D9B82'}}>Made with love for better Indian healthcare</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.7; transform:scale(1.3); }
        }
        html { scroll-padding-top: 80px; }
      `}</style>
    </div>
  );
}
