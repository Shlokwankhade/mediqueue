import { useEffect } from 'react';
export default function Toast({ msg, type='success', onDone }) {
  const ic={success:'check-circle',info:'info-circle',warning:'exclamation-triangle',error:'times-circle'};
  const bg={success:'#D1FAE5',info:'#DBEAFE',warning:'#FEF3C7',error:'#FFE4E6'};
  const tc={success:'#065F46',info:'#1E40AF',warning:'#92400E',error:'#9F1239'};
  useEffect(()=>{const t=setTimeout(onDone,3500);return()=>clearTimeout(t)},[]);
  return (
    <div className='si' style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:14,padding:'12px 16px',boxShadow:'0 12px 40px rgba(0,0,0,.12)',display:'flex',alignItems:'center',gap:11,minWidth:270,maxWidth:340}}>
      <div style={{width:30,height:30,borderRadius:8,background:bg[type],color:tc[type],display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:13}}><i className={'fas fa-'+ic[type]}/></div>
      <span style={{fontSize:13}}>{msg}</span>
    </div>
  );
}