import React, { useState } from 'react';
import { Search, Loader2, GitBranch, Shield, Activity, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { AuditReport, SUPPORTED_MODELS } from '../types';

export default function Dashboard() {
  const [repoUrl, setRepoUrl] = useState('');
  const [model, setModel] = useState(SUPPORTED_MODELS[0].id);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, model })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze repository');
      }

      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ScoreRing = ({ score, label }: { score: number, label: string }) => {
    const colorClass = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-slate-900';
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1">{label}</div>
          <div className="text-3xl font-bold text-slate-900">{score}<span className="text-lg text-slate-400">/100</span></div>
        </div>
        <div className="relative flex items-center justify-center">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={20 * 2 * Math.PI} strokeDashoffset={20 * 2 * Math.PI * (1 - score / 100)} className={`${colorClass} transition-all duration-1000 ease-out`} />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 border-8 border-slate-900 flex flex-col pt-0 box-border w-full relative">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 w-full">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
          <h1 className="text-lg tracking-tight font-bold text-slate-900">AuditSaaS</h1>
        </div>
        <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-slate-500 tracking-widest hidden sm:flex">
          <span>Enterprise Edition</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>v2.4.0</span>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden min-w-0 max-w-6xl mx-auto w-full">
        {/* Form Controls Area */}
        <form onSubmit={handleAnalyze} className="mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap lg:flex-nowrap items-end gap-4 w-full">
          <div className="flex-1 min-w-[240px]">
            <label htmlFor="repoUrl" className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter block mb-1">Target Repository</label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <span className="text-slate-400 mr-2 text-sm shrink-0">https://github.com/</span>
              <input
                type="text"
                id="repoUrl"
                className="bg-transparent border-none text-sm font-medium focus:ring-0 flex-1 p-0 outline-none w-full min-w-[100px]"
                placeholder="facebook/react"
                value={repoUrl.replace('https://github.com/', '')}
                onChange={(e) => {
                  const val = e.target.value;
                  setRepoUrl(val.startsWith('http') ? val : `https://github.com/${val}`);
                }}
                required
              />
            </div>
          </div>

          <div className="flex flex-col items-start min-w-[200px] flex-shrink-0">
            <label htmlFor="model" className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter block mb-1">Analysis Model</label>
            <div className="relative w-full">
              <select
                id="model"
                className="bg-white border border-slate-200 text-xs font-semibold py-2 px-3 pr-8 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full outline-none appearance-none"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <optgroup label="Free Models">
                  {SUPPORTED_MODELS.filter(m => m.name.includes('(Free)')).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Pro Models">
                  {SUPPORTED_MODELS.filter(m => m.name.includes('(Pro)')).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 h-[36px] min-w-[150px] disabled:opacity-70 transition-colors flex-shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Auditing...
              </>
            ) : 'Run Full Audit'}
          </button>
        </form>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-700 items-start shadow-sm">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <span className="text-xs font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* Empty State / Loading */}
        {!report && !error && !loading && (
          <div className="h-[40vh] flex flex-col items-center justify-center text-slate-400">
            <GitBranch className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-sm font-medium">Enter a GitHub repository URL to initiate an audit.</p>
          </div>
        )}
        
        {loading && (
           <div className="h-[40vh] flex flex-col items-center justify-center text-indigo-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Running Deep Analysis...</p>
           </div>
        )}

        {/* Results */}
        {report && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <ScoreRing score={report.score} label="Health Score" />
              <ScoreRing score={report.architecture.score} label="Architecture Quality" />
              <ScoreRing score={report.security.score} label="Security Index" />
            </div>

            {/* Main Analysis Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Detailed Report */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Executive Summary */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                    <h2 className="font-bold text-xs uppercase tracking-widest text-slate-700 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-indigo-600" /> Executive Summary
                    </h2>
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                    </div>
                  </div>
                  <div className="p-5 text-xs text-slate-700 leading-loose">
                    {report.summary}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 
                      <h4 className="font-bold text-[10px] uppercase tracking-widest text-emerald-800">Strengths</h4>
                    </div>
                    <div className="p-4 bg-emerald-50/30 flex-1">
                      <ul className="space-y-3">
                        {report.strengths.map((s, i) => (
                          <li key={i} className="text-emerald-800 text-[11px] flex items-start gap-2 leading-relaxed font-medium">
                            <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5 text-amber-600" /> 
                      <h4 className="font-bold text-[10px] uppercase tracking-widest text-amber-800">Weaknesses</h4>
                    </div>
                    <div className="p-4 bg-amber-50/30 flex-1">
                      <ul className="space-y-3">
                        {report.weaknesses.map((w, i) => (
                          <li key={i} className="text-amber-800 text-[11px] flex items-start gap-2 leading-relaxed font-medium">
                            <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Audit Logs Style */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                    <h2 className="font-bold text-xs uppercase tracking-widest text-slate-700 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" /> Technical Details Log
                    </h2>
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    </div>
                  </div>
                  <div className="flex-1 p-5 font-mono text-[11px] leading-relaxed text-slate-600">
                    <div className="mb-4">
                      <span className="text-slate-400 mr-2">[ARCH_ANALYSIS]</span> 
                      <span className="text-indigo-600 font-bold">INFO:</span> {report.architecture.notes}
                    </div>
                    <div className="mb-2">
                      <span className="text-slate-400 mr-2">[SEC_AUDIT]</span> 
                      <span className="text-emerald-600 font-bold">INFO:</span> {report.security.notes}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right: AI Recommendations */}
              <div className="bg-indigo-900 rounded-xl shadow-lg flex flex-col text-indigo-100 self-start sticky top-6">
                <div className="p-4 border-b border-indigo-800">
                  <h2 className="font-bold text-xs uppercase tracking-widest text-white">Top Recommendations</h2>
                </div>
                <div className="flex-1 p-5 space-y-5">
                  {report.recommendations.map((r, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded bg-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 text-white">
                        {i + 1 < 10 ? `0${i+1}` : i+1}
                      </div>
                      <div>
                        <p className="text-[11px] opacity-90 leading-relaxed text-indigo-50 mt-0.5">{r}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 mt-auto bg-white/5 border-t border-indigo-800 text-[10px] text-center text-indigo-300">
                  Analysis model: {SUPPORTED_MODELS.find(m => m.id === model)?.name || model}
                </div>
              </div>
              
            </div>
          </div>
        )}
      </main>
      
      {/* Footer System Meta */}
      <footer className="h-10 border-t border-slate-200 px-6 flex items-center justify-between bg-white text-[10px] text-slate-500 font-medium shrink-0 w-full mt-auto">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> OpenRouter Connected</span>
          <span className="hidden sm:inline">Active Model Count: {SUPPORTED_MODELS.length}</span>
        </div>
        <div className="flex gap-4">
          <span className="hidden sm:inline">Status: Ready</span>
          <span className="text-indigo-600 cursor-pointer hover:underline">Documentation →</span>
        </div>
      </footer>
    </div>
  );
}
