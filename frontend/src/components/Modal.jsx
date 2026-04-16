export default function Modal({ open, onClose, title, children, width=480 }) {
  if (!open) return null;
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose()}} style={{position:'fixed',inset:0,background:'rgba(6,14,26,.8)',backdropFilter:'blur(12px)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className='si' style={{background:'var(--surf)',border:'1px solid var(--bdr)',borderRadius:20,padding:32,width:'100%',maxWidth:width,boxShadow:'0 24px 64px rgba(0,0,0,.2)',maxHeight:'90vh',overflowY:'auto',position:'relative'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700}}>{title}</div>
          <button onClick={onClose} style={{background:'var(--surf2)',border:'none',borderRadius:8,width:32,height:32,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--txt2)',fontSize:14}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}