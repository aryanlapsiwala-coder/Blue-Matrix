import React from 'react';

export function CompanyLogo({ company = '', className = "w-12 h-12", size = 26 }) {
  const norm = (company || '').toLowerCase().trim();

  // 1. Google (Official 4-color G)
  if (norm.includes('google')) {
    return (
      <div className={`${className} rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-2 flex-shrink-0`}>
        <svg viewBox="0 0 24 24" width={size} height={size}>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
      </div>
    );
  }

  // 2. NVIDIA (Official Claw in signature #76B900)
  if (norm.includes('nvidia')) {
    return (
      <div className={`${className} rounded-2xl bg-[#111113] border border-neutral-800 shadow-xs flex items-center justify-center p-2 flex-shrink-0`}>
        <svg viewBox="0 0 24 24" width={size} height={size} fill="#76B900">
          <path d="M8.71 14.28c-.24-.48-.37-1.02-.37-1.58 0-1.99 1.62-3.6 3.61-3.6.43 0 .84.08 1.23.22.42-.51.93-.93 1.52-1.22-.81-.46-1.75-.72-2.75-.72-3.15 0-5.71 2.56-5.71 5.71 0 1.25.4 2.41 1.08 3.36l1.39-2.17zm3.24-8.08c-4.46 0-8.09 3.62-8.09 8.08 0 2.24.91 4.27 2.39 5.73l1.45-2.27c-.89-1-1.44-2.31-1.44-3.75 0-3.08 2.51-5.59 5.6-5.59.88 0 1.71.21 2.45.57.51-.43 1.1-.76 1.74-.98-.99-.54-2.13-.85-3.35-.85-.75-.02-1.75.06-2.5.06zm0-3.2c-6.19 0-11.23 5.03-11.23 11.22 0 3.73 1.83 7.04 4.65 9.09l1.45-2.27C4.6 19.38 3.12 16.48 3.12 13.2c0-4.87 3.96-8.82 8.83-8.82 1.93 0 3.71.62 5.16 1.68.58-.33 1.22-.56 1.9-.68C16.99 3.98 14.58 3 11.95 3zm5.02 12.06c.02-.12.03-.23.03-.36 0-1.44-1.17-2.61-2.61-2.61-.41 0-.79.1-1.14.26l2.12 2.6c.72-.05 1.34.1 1.6.11zm1.74.87c-.6-.73-1.45-1.24-2.43-1.42l-2.91-3.57c.72-.32 1.52-.5 2.37-.5 3.09 0 5.6 2.51 5.6 5.6 0 .42-.05.83-.14 1.22-.64-.54-1.46-.94-2.49-1.33zm1.61 2.31c-.51.46-1.15.8-1.88 1.01 1.15.42 2.11 1.12 2.8 2.01.69-1.16 1.1-2.51 1.1-3.96 0-.84-.14-1.65-.39-2.41-.33 1.29-.93 2.38-1.63 3.35zm-5.75 3.13c-.93 0-1.81-.22-2.6-.61l-1.4 2.19c1.17.65 2.52 1.02 3.96 1.02 4.14 0 7.57-2.82 8.52-6.65-.63-.73-1.45-1.28-2.39-1.61-1.15 3.25-4.14 5.66-7.79 5.66l1.7 0z"/>
        </svg>
      </div>
    );
  }

  // 3. Microsoft (Official 4-Square Colors)
  if (norm.includes('microsoft')) {
    return (
      <div className={`${className} rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-2 flex-shrink-0`}>
        <svg viewBox="0 0 23 23" width={size} height={size}>
          <path fill="#f35325" d="M1 1h10v10H1z"/>
          <path fill="#81bc06" d="M12 1h10v10H12z"/>
          <path fill="#05a6f0" d="M1 12h10v10H1z"/>
          <path fill="#ffba08" d="M12 12h10v10H12z"/>
        </svg>
      </div>
    );
  }

  // 4. Texas Instruments
  if (norm.includes('texas') || norm.includes('ti')) {
    return (
      <div className={`${className} rounded-2xl bg-[#CC0000] shadow-xs flex flex-col items-center justify-center p-1.5 text-white flex-shrink-0`}>
        <span className="font-black text-xs tracking-wider leading-none">TEXAS</span>
        <span className="font-extrabold text-[8px] tracking-tight leading-tight opacity-95">INSTRUMENTS</span>
      </div>
    );
  }

  // 5. Goldman Sachs
  if (norm.includes('goldman')) {
    return (
      <div className={`${className} rounded-2xl bg-[#678eb8] shadow-xs flex items-center justify-center p-1 text-center text-white flex-shrink-0`}>
        <div className="font-serif font-bold text-[9px] leading-tight tracking-tight">
          <div>Goldman</div>
          <div>Sachs</div>
        </div>
      </div>
    );
  }

  // 6. Amazon
  if (norm.includes('amazon')) {
    return (
      <div className={`${className} rounded-2xl bg-[#131921] shadow-xs flex items-center justify-center p-2 flex-shrink-0`}>
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path fill="#FF9900" d="M18.5 16.5c-4.5 3.3-11 .8-13.8-.5-.3-.1-.5.2-.2.5 2.6 2.4 8.7 4.2 13.5.7.5-.4.1-1-.4-.7h-.1z"/>
          <path fill="#FF9900" d="M19.4 15.2c-.3-.4-1.9-.2-2.8 0-.3 0-.3.2-.1.4.8.7 2.2.7 2.7.3.5-.4.3-.6.2-.7z"/>
          <path fill="#FFFFFF" d="M13.8 8.8c0-1.7-.8-2.6-2.5-2.6-1.5 0-2.4.9-2.7 1.8-.1.2.1.4.3.4h.8c.2 0 .3-.1.4-.3.2-.5.6-.8 1.3-.8.9 0 1.3.4 1.3 1.2v.5c-.7 0-2.2.1-3.2.7-.9.5-1.3 1.4-1.3 2.3 0 1.6 1.1 2.5 2.5 2.5 1.3 0 2-.6 2.3-1.2v.9c0 .2.1.3.3.3h.8c.2 0 .3-.1.3-.3V8.8h-.3zm-1.1 3.5c-.2.7-.8 1.1-1.6 1.1-.7 0-1.3-.4-1.3-1.2 0-1.1 1-1.3 2.3-1.3v.8l.6.6z"/>
        </svg>
      </div>
    );
  }

  // 7. Apple
  if (norm.includes('apple')) {
    return (
      <div className={`${className} rounded-2xl bg-black shadow-xs flex items-center justify-center p-2 text-white flex-shrink-0`}>
        <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.77-.95 2.83 1.02.08 2.05-.5 2.68-1.27z"/>
        </svg>
      </div>
    );
  }

  // 8. Meta
  if (norm.includes('meta') || norm.includes('facebook')) {
    return (
      <div className={`${className} rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-2 flex-shrink-0`}>
        <svg viewBox="0 0 24 24" width={size} height={size} fill="#0081FB">
          <path d="M12 4.332c-3.953 0-7.031 2.417-8.91 5.378C1.512 12.228 1 14.545 1 16.505c0 2.29.845 4.16 2.378 5.258 1.463 1.047 3.398 1.437 5.38 1.06 2.062-.393 4.01-1.895 5.242-3.52 1.232 1.625 3.18 3.127 5.242 3.52 1.982.377 3.917-.013 5.38-1.06 1.533-1.098 2.378-2.968 2.378-5.258 0-1.96-.512-4.277-2.09-6.795C21.03 6.75 17.953 4.332 12 4.332z"/>
        </svg>
      </div>
    );
  }

  // 9. Qualcomm
  if (norm.includes('qualcomm')) {
    return (
      <div className={`${className} rounded-2xl bg-[#002B66] shadow-xs flex items-center justify-center p-1.5 flex-shrink-0 text-white`}>
        <span className="font-black text-[10px] tracking-wider">QUALCOMM</span>
      </div>
    );
  }

  // 10. Intel
  if (norm.includes('intel')) {
    return (
      <div className={`${className} rounded-2xl bg-[#0068B5] shadow-xs flex items-center justify-center p-1.5 flex-shrink-0 text-white`}>
        <span className="font-black text-sm tracking-tight font-sans">intel</span>
      </div>
    );
  }

  // 11. Generic fallback with clean branding
  return (
    <div className={`${className} rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs flex-shrink-0`}>
      {company ? company.slice(0, 2).toUpperCase() : 'CO'}
    </div>
  );
}

export default CompanyLogo;
