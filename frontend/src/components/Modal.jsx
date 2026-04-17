
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, title, children, width=480 }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      onClick={e => { if(e.target===e.currentTarget) onClose(); }}
      style={{
        position:'fixed', top:0, left:0, right:0, bottom:0,
        background:'rgba(6,14,26,.85)',
        backdropFilter:'blur(20px)',
        zIndex:99999,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        padding:'16px'
      }}
    >
      <div style={{
        background:'var(--surface, #fff)',
        border:'1px solid var(--border, #E2E8F0)',
        borderRadius:24,
        padding:'28px 32px',
        width:'100%',
        maxWidth:width,
        boxShadow:'0 24px 64px rgba(0,0,0,.3)',
        position:'relative',
        maxHeight:'90vh',
        overflowY:'auto'
      }}>
        <button
          onClick={onClose}
          style={{
            position:'absolute', top:14, right:14,
            background:'#F1F5F9',
            border:'none', borderRadius:10,
            width:32, height:32, cursor:'pointer',
            fontSize:18, color:'#64748B',
            display:'flex', alignItems:'center', justifyContent:'center',
            lineHeight:1
          }}
        >x</button>
        <div style={{
          fontFamily:'Syne,sans-serif',
          fontWeight:700, fontSize:18,
          marginBottom:20, paddingRight:36,
          color:'var(--text, #0A1628)'
        }}>{title}</div>
        {children}
      </div>
    </div>,
    document.body
  );
}
