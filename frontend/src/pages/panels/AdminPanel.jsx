
import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

function MetricCard({ label, val, icon, color, bg, change }) {
  return (
    <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:'20px 22px',position:'relative',overflow:'hidden',transition:'all .2s'}}
      onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
      onMouseLeave={e=>e.currentTarget.style.transform='none'}>
      <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:.6,marginBottom:7}}>{label}</div>
      <div style={{fontFamily:'Syne,sans-serif',fontSize:26,fontWeight:700,marginBottom:4}}>{val}</div>
      {change && <div style={{fontSize:12,fontWeight:600,color:'#10B981',display:'flex',alignItems:'center',gap:4}}><i className='fas fa-arrow-up' style={{fontSize:10}}/>{change}</div>}
      <div style={{position:'absolute',top:14,right:14,width:38,height:38,borderRadius:10,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color}}><i className={'fas fa-'+icon}/></div>
    </div>
  );
}

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get('/admin/stats');
        setStats(r.data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const xAxis = { grid:{display:false}, ticks:{color:'var(--text-3)',font:{size:11}} };
  const yAxis = { grid:{color:'rgba(148,163,184,.1)'}, ticks:{color:'var(--text-3)',font:{size:11}} };
  const baseOpts = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:xAxis,y:yAxis} };

  // Volume chart  live from DB
  const volumeLabels = stats?.volumeData?.length 
    ? stats.volumeData.map(d=>d.day)
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const volumeValues = stats?.volumeData?.length
    ? stats.volumeData.map(d=>parseInt(d.count))
    : [0,0,0,0,0,0,0];

  const patientVolumeData = {
    labels: volumeLabels,
    datasets: [{
      data: volumeValues,
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx:c, chartArea } = chart;
        if (!chartArea) return '#0D9B82';
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0,'rgba(13,155,130,.85)');
        g.addColorStop(1,'rgba(13,155,130,.1)');
        return g;
      },
      borderRadius:8, borderSkipped:false
    }]
  };

  // Speciality chart  live from DB
  const specLabels = stats?.specialityData?.length
    ? stats.specialityData.map(d=>d.speciality)
    : ['No Data'];
  const specValues = stats?.specialityData?.length
    ? stats.specialityData.map(d=>parseInt(d.count))
    : [1];

  const specialityData = {
    labels: specLabels,
    datasets: [{
      data: specValues,
      backgroundColor: ['#0D9B82','#7C3AED','#F43F5E','#F59E0B','#0EA5E9','#10B981'],
      borderWidth:0, hoverOffset:8
    }]
  };

  // Revenue chart  live from DB
  const revLabels = stats?.revenueData?.length
    ? stats.revenueData.map(d=>d.month)
    : ['Jan','Feb','Mar','Apr','May','Jun'];
  const revValues = stats?.revenueData?.length
    ? stats.revenueData.map(d=>parseFloat(d.total))
    : [0,0,0,0,0,0];

  const revenueData = {
    labels: revLabels,
    datasets: [{
      label:'Revenue',
      data: revValues,
      borderColor:'#0D9B82',
      backgroundColor:(ctx)=>{
        const chart=ctx.chart;
        const{ctx:c,chartArea}=chart;
        if(!chartArea)return 'rgba(13,155,130,.1)';
        const g=c.createLinearGradient(0,chartArea.top,0,chartArea.bottom);
        g.addColorStop(0,'rgba(13,155,130,.3)');
        g.addColorStop(1,'rgba(13,155,130,0)');
        return g;
      },
      fill:true, tension:0.4,
      pointBackgroundColor:'#0D9B82', pointRadius:4, pointHoverRadius:6
    }]
  };

  if (loading) return (
    <div style={{padding:40,textAlign:'center',color:'var(--text-3)'}}>
      <i className='fas fa-spinner fa-spin' style={{fontSize:32,display:'block',marginBottom:12}}/>
      Loading live analytics...
    </div>
  );

  return (
    <div className='fu'>
      {/* LIVE BADGE */}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:18}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:'#10B981',animation:'pulse 2s infinite'}}/>
        <span style={{fontSize:12,fontWeight:600,color:'#10B981'}}>Live Data  Updates every 30s</span>
      </div>

      {/* METRICS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        <MetricCard label='Total Patients' val={stats?.totalPatients?.toLocaleString()||'0'} icon='users' color='#0D9B82' bg='#E6F7F4' change='Live count'/>
        <MetricCard label='Active Doctors' val={stats?.activeDoctors||'0'} icon='user-md' color='#7C3AED' bg='#EDE9FE' change='Available now'/>
        <MetricCard label='Total Revenue' val={'Rs.'+(stats?.totalRevenue?Math.round(stats.totalRevenue).toLocaleString():'0')} icon='indian-rupee-sign' color='#D97706' bg='#FEF3C7' change='From payments'/>
        <MetricCard label="Today's Appointments" val={stats?.todayAppointments||'0'} icon='calendar-check' color='#F43F5E' bg='#FFE4E6' change='Booked today'/>
      </div>

      {/* CHARTS ROW 1 */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginBottom:20}}>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:22}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700}}>Patient Volume  Last 7 Days</div>
            <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:'#E6F7F4',color:'#0D9B82',fontWeight:700}}>Live</span>
          </div>
          <div style={{height:220}}>
            {volumeValues.every(v=>v===0) 
              ? <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)',flexDirection:'column',gap:8}}><i className='fas fa-chart-bar' style={{fontSize:32}}/><span>No appointments in last 7 days</span></div>
              : <Bar data={patientVolumeData} options={baseOpts}/>
            }
          </div>
        </div>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:22}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700}}>Speciality Distribution</div>
            <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:'#E6F7F4',color:'#0D9B82',fontWeight:700}}>Live</span>
          </div>
          <div style={{height:220}}>
            {specValues.length === 0 || (specValues.length===1 && specValues[0]===1)
              ? <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)',flexDirection:'column',gap:8}}><i className='fas fa-chart-pie' style={{fontSize:32}}/><span>No appointment data yet</span></div>
              : <Doughnut data={specialityData} options={{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'right',labels:{color:'var(--text-3)',font:{size:11},boxWidth:12}}}}}/>
            }
          </div>
        </div>
      </div>

      {/* REVENUE CHART */}
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:22,marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700}}>Revenue Trend  Live from Payments</div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'#0D9B82'}}>
            Rs.{stats?.totalRevenue?Math.round(stats.totalRevenue).toLocaleString():'0'}
          </div>
        </div>
        <div style={{height:200}}>
          {revValues.every(v=>v===0)
            ? <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)',flexDirection:'column',gap:8}}><i className='fas fa-chart-line' style={{fontSize:32}}/><span>No payment data yet  make some payments!</span></div>
            : <Line data={revenueData} options={{...baseOpts,plugins:{legend:{display:false}},scales:{x:{...xAxis},y:{...yAxis,ticks:{...yAxis.ticks,callback:v=>'Rs.'+Math.round(v/1000)+'k'}}}}}/>
          }
        </div>
      </div>

      {/* SYSTEM STATUS + ACTIVITY */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:22}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:16}}>System Status</div>
          {[
            {name:'Core API',up:'99.98%'},{name:'Queue Engine',up:'100%'},
            {name:'AI Predictor',up:'99.9%'},{name:'Payment Service',up:'99.7%'},
            {name:'Email Service',up:'99.5%'},{name:'Telehealth CDN',up:'99.95%'},
          ].map(s=>(
            <div key={s.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{s.name}</div>
                <div style={{fontSize:11,color:'var(--text-3)'}}>Uptime: {s.up}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:'#10B981'}}/>
                <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,fontWeight:700,background:'#D1FAE5',color:'#065F46'}}>Operational</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:16,padding:22}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginBottom:16}}>Live Queue Status</div>
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:64,fontWeight:800,color:'#0D9B82',lineHeight:1}}>{stats?.currentQueueSize||0}</div>
            <div style={{fontSize:14,color:'var(--text-3)',marginTop:8,marginBottom:20}}>Patients waiting now</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{background:'var(--surface-2)',borderRadius:12,padding:16}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:'#0D9B82'}}>{stats?.todayAppointments||0}</div>
                <div style={{fontSize:12,color:'var(--text-3)'}}>Today Appointments</div>
              </div>
              <div style={{background:'var(--surface-2)',borderRadius:12,padding:16}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:'#7C3AED'}}>{stats?.totalPatients||0}</div>
                <div style={{fontSize:12,color:'var(--text-3)'}}>Total Patients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
