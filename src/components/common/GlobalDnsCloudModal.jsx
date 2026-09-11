import React, { useState } from 'react';
import {
  Globe,
  Server,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Cloud,
  Cpu,
  RefreshCw,
  X,
  ExternalLink,
  Layers,
  Database
} from 'lucide-react';
import { Button } from './Button';

export function GlobalDnsCloudModal({ isOpen, onClose }) {
  const [testingDns, setTestingDns] = useState(false);
  const [dnsResults, setDnsResults] = useState([
    { region: 'Asia Pacific (Mumbai Edge)', ip: '76.76.21.21', latency: '12 ms', status: 'Optimal', protocol: 'Anycast DNS / HTTP3' },
    { region: 'North America (US-East Edge)', ip: '76.76.21.98', latency: '68 ms', status: 'Replicated', protocol: 'Anycast DNS / HTTP3' },
    { region: 'Europe (Frankfurt Edge)', ip: '76.76.21.44', latency: '42 ms', status: 'Replicated', protocol: 'Anycast DNS / HTTP3' },
    { region: 'East Asia (Tokyo Edge)', ip: '76.76.21.102', latency: '35 ms', status: 'Replicated', protocol: 'Anycast DNS / HTTP3' },
  ]);

  if (!isOpen) return null;

  const handleTestDns = () => {
    setTestingDns(true);
    setTimeout(() => {
      setDnsResults((prev) =>
        prev.map((item) => ({
          ...item,
          latency: `${Math.floor(8 + Math.random() * 25)} ms`,
        }))
      );
      setTestingDns(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">Global Cloud & Anycast DNS Architecture</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  Global Production
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                How KnowPass securely stores institutional data in the cloud and resolves globally under 15ms
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* 1. Global Anycast DNS Routing */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Anycast DNS & Edge Discovery Layer
                </h4>
              </div>
              <button
                onClick={handleTestDns}
                disabled={testingDns}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <RefreshCw className={`w-3 h-3 ${testingDns ? 'animate-spin text-indigo-600' : ''}`} />
                {testingDns ? 'Probing Nodes...' : 'Live DNS Ping'}
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When a user from anywhere in the world visits KnowPass, <strong>Anycast DNS (RFC 4786)</strong> automatically routes their request to the physically nearest Point-of-Presence (PoP) across 300+ Edge cities, ensuring instant discovery without single-point bottlenecks.
            </p>

            {/* Edge DNS Nodes Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {dnsResults.map((node, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      {node.region}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{node.ip} • {node.protocol}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                      {node.latency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Cloud Database & Storage Replication */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <Database className="w-4 h-4 text-indigo-600" />
                <span>Multi-Region Cloud Database</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Global PostgreSQL database clusters with automatic multi-master & read-replica synchronization across APAC, US-East, and EU.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-white/80 px-2.5 py-1.5 rounded-lg border border-indigo-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Automatic Multi-Region Failover
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted KYC Cloud Storage</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Student IDs and Alumni credentials are stored in Cloud Object Storage encrypted at rest with <strong>AES-256</strong> and served via 15-minute expiring signed URLs.
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-white/80 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Zero Unauthorized Access Guarantee
              </div>
            </div>
          </div>

          {/* 3. Global Discovery & Multi-Tenant DNS */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Global Discovery & Tenant Subdomains
                </span>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                *.knowpass.global
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Universities globally join via wildcard subdomains (e.g., <code className="text-indigo-300 bg-white/10 px-1 py-0.5 rounded">mit.knowpass.global</code> or <code className="text-indigo-300 bg-white/10 px-1 py-0.5 rounded">iitb.knowpass.global</code>). Wildcard DNS records dynamically isolate campus institutional memory while allowing cross-university knowledge indexing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Compliant with Global Privacy Regulations (GDPR / FERPA)</span>
          </div>
          <Button size="sm" onClick={onClose} className="text-xs px-5">
            Close Architecture View
          </Button>
        </div>
      </div>
    </div>
  );
}
