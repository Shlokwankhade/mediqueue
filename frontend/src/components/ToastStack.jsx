import { useState, useCallback } from 'react';
import Toast from './Toast';
let _addToast = null;
export const toast = (msg, type='success') => _addToast && _addToast(msg, type);
export default function ToastStack() {
  const [toasts, setToasts] = useState([]);
  _addToast = useCallback((msg, type) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
  }, []);
  const remove = id => setToasts(p => p.filter(t => t.id !== id));
  return (
    <div style={{position:'fixed',top:18,right:18,zIndex:9999,display:'flex',flexDirection:'column',gap:9}}>
      {toasts.map(t => <Toast key={t.id} msg={t.msg} type={t.type} onDone={()=>remove(t.id)}/>)}
    </div>
  );
}