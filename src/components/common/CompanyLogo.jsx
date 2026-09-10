import React from 'react';
import { cn } from '@/lib/utils';

export function CompanyLogo({ company = '', className = "w-10 h-10" }) {
  const norm = (company || '').toLowerCase().trim();

  // Helper to determine if this is a large card logo or small pill logo
  const isSmall = className.includes('w-4') || className.includes('w-5') || className.includes('w-6');

  // 1. Google (Official 4-Color G)
  if (norm.includes('google')) {
    return (
      <div
        className={cn(
          "flex items-center justify-center flex-shrink-0",
          isSmall ? "p-0" : "rounded-2xl bg-white border border-slate-200/80 p-2 shadow-xs",
          className
        )}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full block">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
      </div>
    );
  }

  // 2. NVIDIA (Official Green Claw on dark backing)
  if (norm.includes('nvidia')) {
    return (
      <div
        className={cn(
          "flex items-center justify-center flex-shrink-0 bg-[#111113]",
          isSmall ? "rounded-md p-0.5" : "rounded-2xl border border-neutral-800 p-2 shadow-xs",
          className
        )}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full block" fill="#76B900">
          <path d="M8.948 8.798v-1.43a6.7 6.7 0 0 1 .424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.774 3.851-5.75 3.851c-.398 0-.787-.062-1.158-.185v-4.346c1.528.185 1.837.857 2.747 2.385l2.04-1.714s-1.492-1.952-4-1.952a6.016 6.016 0 0 0-.796.035m0-4.735v2.138l.424-.027c5.45-.185 9.01 4.47 9.01 4.47s-4.08 4.964-8.33 4.964c-.37 0-.733-.035-1.095-.097v1.325c.3.035.61.062.91.062 3.957 0 6.82-2.023 9.593-4.408.459.371 2.34 1.263 2.73 1.652-2.633 2.208-8.772 3.984-12.253 3.984-.335 0-.653-.018-.971-.053v1.864H24V4.063zm0 10.326v1.131c-3.657-.654-4.673-4.46-4.673-4.46s1.758-1.944 4.673-2.262v1.237H8.94c-1.528-.186-2.73 1.245-2.73 1.245s.68 2.412 2.739 3.11M2.456 10.9s2.164-3.197 6.5-3.533V6.201C4.153 6.59 0 10.653 0 10.653s2.35 6.802 8.948 7.42v-1.237c-4.84-.6-6.492-5.936-6.492-5.936z"/>
        </svg>
      </div>
    );
  }

  // 3. Microsoft (Official 4-Color Square)
  if (norm.includes('microsoft')) {
    return (
      <div
        className={cn(
          "flex items-center justify-center flex-shrink-0",
          isSmall ? "p-0" : "rounded-2xl bg-white border border-slate-200/80 p-2 shadow-xs",
          className
        )}
      >
        <svg viewBox="0 0 23 23" className="w-full h-full block">
          <path fill="#f35325" d="M1 1h10v10H1z"/>
          <path fill="#81bc06" d="M12 1h10v10H12z"/>
          <path fill="#05a6f0" d="M1 12h10v10H1z"/>
          <path fill="#ffba08" d="M12 12h10v10H12z"/>
        </svg>
      </div>
    );
  }

  // 4. Texas Instruments (Official Red Badge with TI monogram)
  if (norm.includes('texas') || norm.includes('ti')) {
    return (
      <div
        className={cn(
          "flex items-center justify-center flex-shrink-0 bg-[#CC0000] text-white",
          isSmall ? "rounded-md p-0.5" : "rounded-2xl p-1.5 shadow-xs flex-col",
          className
        )}
      >
        {isSmall ? (
          <span className="font-serif italic font-black text-[11px] leading-none select-none">ti</span>
        ) : (
          <>
            <span className="font-serif italic font-black text-lg leading-none select-none">ti</span>
            <span className="font-sans font-bold text-[7px] tracking-wider uppercase mt-0.5 opacity-90">TEXAS INST.</span>
          </>
        )}
      </div>
    );
  }

  // 5. Goldman Sachs
  if (norm.includes('goldman')) {
    return (
      <div
        className={cn(
          "flex items-center justify-center flex-shrink-0 bg-[#678eb8] text-white",
          isSmall ? "rounded-md p-0.5" : "rounded-2xl p-1.5 shadow-xs",
          className
        )}
      >
        <span className="font-serif font-black text-[10px] leading-tight select-none text-center">
          {isSmall ? "GS" : <>Goldman<br/>Sachs</>}
        </span>
      </div>
    );
  }

  // 6. Amazon
  if (norm.includes('amazon')) {
    return (
      <div
        className={cn(
          "flex items-center justify-center flex-shrink-0 bg-[#131921]",
          isSmall ? "rounded-md p-0.5" : "rounded-2xl p-2 shadow-xs",
          className
        )}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full block" fill="none">
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
      <div
        className={cn(
          "flex items-center justify-center flex-shrink-0 text-slate-900",
          isSmall ? "p-0" : "rounded-2xl bg-black p-2 text-white shadow-xs",
          className
        )}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full block" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.77-.95 2.83 1.02.08 2.05-.5 2.68-1.27z"/>
        </svg>
      </div>
    );
  }

  // 8. Meta
  if (norm.includes('meta') || norm.includes('facebook')) {
    return (
      <div
        className={cn(
          "flex items-center justify-center flex-shrink-0",
          isSmall ? "p-0" : "rounded-2xl bg-white border border-slate-200/80 p-2 shadow-xs",
          className
        )}
      >
        <svg viewBox="0 0 24 24" className="w-full h-full block" fill="#0081FB">
          <path d="M12 4.332c-3.953 0-7.031 2.417-8.91 5.378C1.512 12.228 1 14.545 1 16.505c0 2.29.845 4.16 2.378 5.258 1.463 1.047 3.398 1.437 5.38 1.06 2.062-.393 4.01-1.895 5.242-3.52 1.232 1.625 3.18 3.127 5.242 3.52 1.982.377 3.917-.013 5.38-1.06 1.533-1.098 2.378-2.968 2.378-5.258 0-1.96-.512-4.277-2.09-6.795C21.03 6.75 17.953 4.332 12 4.332z"/>
        </svg>
      </div>
    );
  }

  // Generic fallback
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-slate-900 text-white font-black select-none flex-shrink-0",
        isSmall ? "rounded-md text-[10px]" : "rounded-2xl text-base shadow-xs",
        className
      )}
    >
      {company ? company.slice(0, 2).toUpperCase() : 'CO'}
    </div>
  );
}

export default CompanyLogo;
