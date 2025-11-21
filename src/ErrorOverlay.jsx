import React, { useEffect, useState } from 'react';
import './Components/importEvents.css';

export default function ErrorOverlay() {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    function onError(event) {
      const err = {
        type: 'error',
        message: event.message || String(event.error || 'Unknown error'),
        stack: event.error && event.error.stack ? event.error.stack : null,
      };
      setErrors((s) => [err, ...s]);
      // still allow default handling so Vite overlay may show in dev
      return false;
    }

    function onRejection(event) {
      const reason = event.reason;
      const err = {
        type: 'unhandledrejection',
        message: (reason && reason.message) || String(reason) || 'Unhandled rejection',
        stack: reason && reason.stack ? reason.stack : null,
      };
      setErrors((s) => [err, ...s]);
    }

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (!errors.length) return null;

  return (
    <div style={{position:'fixed',left:12,top:12,right:12,zIndex:99999,maxHeight:'60vh',overflow:'auto'}}>
      {errors.map((e, i) => (
        <div key={i} style={{background:'rgba(0,0,0,0.85)',color:'#fff',padding:12,marginBottom:12,borderRadius:6,fontFamily:'monospace'}}>
          <div style={{fontWeight:700}}>[{e.type}] {e.message}</div>
          {e.stack && <pre style={{whiteSpace:'pre-wrap',marginTop:8,color:'#ddd'}}>{e.stack}</pre>}
        </div>
      ))}
    </div>
  );
}

