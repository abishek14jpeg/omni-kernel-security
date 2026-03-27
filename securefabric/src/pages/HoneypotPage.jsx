import React from 'react';
import FadeInScroll from '../components/animations/FadeInScroll';
import { BsBugFill, BsStopwatch, BsGlobe, BsBarChartLineFill } from 'react-icons/bs';
import TopNavigation from '../components/dashboard/TopNavigation';

export default function HoneypotPage({ onNavigate }) {
  return (
      <div className="bg-[#020617] relative min-h-[85vh] w-full rounded-[3rem] px-6 lg:px-20 pb-20 overflow-hidden -mt-8 pt-12">
      <TopNavigation onNavigate={onNavigate} currentPage="honeypot" />
      {/* Hero Section: The Gilded Cage */}
      <FadeInScroll>
        <header className="mb-16 flex flex-col md:flex-row items-end justify-between gap-12 mt-12 relative z-10">
          <div className="max-w-2xl mt-16">
            <h1 className="text-[5xl] lg:text-[7rem] font-serif font-black tracking-tighter text-slate-100 leading-[0.85]">
              The Gilded <span className="text-pink-500 italic font-light opacity-90">Cage</span>
            </h1>
            <p className="mt-8 text-xl text-slate-400 max-w-lg leading-relaxed font-serif">
              Omni-Kernel's premier honeypot architecture. A masterpiece of digital misdirection where every syscall is a choreographed lie.
            </p>
          </div>
          
          <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
            {/* Retraining Pulse Circular Meter */}
            <div className="absolute inset-0 rounded-full border-[10px] border-surface-container-high/50"></div>
            <div className="absolute inset-0 rounded-full border-[10px] border-primary border-t-transparent animate-[spin_4s_ease-in-out_infinite]"></div>
            <div className="text-center font-serif">
              <span className="text-4xl font-bold text-primary block tracking-tighter">94%</span>
              <span className="text-[10px] uppercase font-sans tracking-widest text-secondary mt-1 block">Neural Pulse</span>
            </div>
          </div>
        </header>
      </FadeInScroll>

      {/* Split-Screen Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 relative z-10">
        
        {/* Left: The Bait (Faked System Calls) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <FadeInScroll delay={0.2}>
            <div className="p-10 bg-surface-container-low/60 backdrop-blur-xl rounded-[2.5rem] relative overflow-hidden group shadow-[0_20px_50px_rgba(37,50,75,0.04)] border border-white/20">
              <div className="absolute -top-4 -right-4 p-8 text-primary/5 group-hover:scale-110 group-hover:text-primary/10 transition-all duration-700">
                <BsBugFill size={180} />
              </div>
              <h3 className="text-4xl font-serif font-bold mb-8 italic">The Bait</h3>
              <div className="space-y-4 font-mono text-sm tracking-tight text-on-surface-variant relative z-10">
                <div className="flex gap-4 p-4 bg-white/40 backdrop-blur-md rounded-2xl hover:bg-white/80 transition-colors shadow-sm">
                  <span className="text-primary/50">0x842</span>
                  <span>sys_read(fd: 3, buf: ..., 4096)</span>
                  <span className="ml-auto text-error font-bold">REDIRECTED</span>
                </div>
                <div className="flex gap-4 p-4 bg-white/40 backdrop-blur-md rounded-2xl hover:bg-white/80 transition-colors shadow-sm">
                  <span className="text-primary/50">0x845</span>
                  <span>sys_open("/etc/shadow", O_RDONLY)</span>
                  <span className="ml-auto text-tertiary-dim italic font-bold">VIRTUALIZED</span>
                </div>
                <div className="flex gap-4 p-4 bg-white/40 backdrop-blur-md rounded-2xl hover:bg-white/80 transition-colors shadow-sm">
                  <span className="text-primary/50">0x849</span>
                  <span>sys_ptrace(PTRACE_ATTACH, 102...)</span>
                  <span className="ml-auto text-primary font-bold">TRAPPED</span>
                </div>
              </div>
              <p className="mt-8 text-secondary/70 text-sm italic font-serif leading-relaxed pr-8">
                Simulating critical vulnerability responses in real-time to maintain attacker engagement without exposing core logic.
              </p>
            </div>
          </FadeInScroll>

          {/* Deception Matrix (Blurred Glass Tiles) */}
          <div className="grid grid-cols-2 gap-6">
            <FadeInScroll delay={0.3}>
              <div className="h-36 rounded-[2rem] backdrop-blur-[20px] bg-primary-container/40 flex flex-col items-center justify-center text-center p-4 border border-white/40 shadow-sm hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-serif font-black text-primary-dim">4.2ms</span>
                <span className="text-[10px] text-primary-dim/70 uppercase tracking-widest mt-1 font-sans font-bold">Latency Masking</span>
              </div>
            </FadeInScroll>
            <FadeInScroll delay={0.4}>
              <div className="h-36 rounded-[2rem] backdrop-blur-[20px] bg-surface-container-highest/60 flex flex-col items-center justify-center text-center p-4 border border-white/40 shadow-sm hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-serif font-black text-on-surface">12k</span>
                <span className="text-[10px] text-on-surface/50 uppercase tracking-widest mt-1 font-sans font-bold">Faked Assets</span>
              </div>
            </FadeInScroll>
          </div>
        </div>

        {/* Overlapping Center Metric (Hidden on small screens) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] z-20 w-72 h-72 backdrop-blur-[30px] bg-white/50 rounded-full border border-white shadow-[0_30px_60px_rgba(0,0,0,0.08)] items-center justify-center p-8 text-center rotate-12 group hover:rotate-0 transition-transform duration-700 ease-out cursor-default">
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <BsBarChartLineFill className="text-3xl text-primary" />
            </div>
            <h4 className="text-5xl font-serif font-black tracking-tighter text-text-on-background">99.8%</h4>
            <p className="text-[10px] uppercase font-bold text-secondary-dim tracking-[0.2em] mt-2">Deception Yield</p>
          </div>
        </div>

        {/* Right: The Catch (Attacker Signatures) */}
        <div className="lg:col-span-7 lg:pl-20 flex flex-col gap-8">
          <FadeInScroll delay={0.5}>
            <div className="p-10 bg-surface-lowest/70 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_rgba(37,50,75,0.06)]">
              <h3 className="text-4xl font-serif font-bold mb-10 italic">The Catch</h3>
              <div className="space-y-8">
                
                {/* Signature 1 */}
                <div className="flex items-start gap-6 group cursor-pointer hover:-translate-x-2 transition-transform duration-300">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 border border-black/5 shadow-inner grayscale group-hover:grayscale-0 transition-all duration-500">
                    <img alt="Signature 1" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1614064641936-732406af2638?auto=format&fit=crop&q=80&w=200" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-bold text-xl font-serif">Entity-774 (Lazarus Variant)</h5>
                      <span className="px-4 py-1.5 bg-error/10 text-error text-[10px] font-bold rounded-full uppercase tracking-wider font-sans">Critical</span>
                    </div>
                    <p className="text-sm font-sans text-secondary leading-relaxed max-w-md">Attempted memory heap overflow using a novel polymorphic shellcode. Tracking origin: AS9921.</p>
                  </div>
                </div>
                
                <div className="h-[1px] bg-outline-variant/15 w-full"></div>
                
                {/* Signature 2 */}
                <div className="flex items-start gap-6 group cursor-pointer hover:-translate-x-2 transition-transform duration-300">
                  <div className="w-20 h-20 rounded-2xl bg-tertiary-container/50 flex items-center justify-center text-tertiary shrink-0 border border-white shadow-sm transition-all duration-500 group-hover:bg-tertiary-container">
                    <BsGlobe size={32} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-bold text-xl font-serif">Cross-Geo Probe</h5>
                      <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-wider font-sans">Monitoring</span>
                    </div>
                    <p className="text-sm font-sans text-secondary leading-relaxed max-w-md">Coordinated scanning from 14 nodes across Asia-Pacific. Mapping the Gilded Cage perimeter passively.</p>
                  </div>
                </div>

                <div className="h-[1px] bg-outline-variant/15 w-full"></div>
                
                {/* Signature 3 */}
                <div className="flex items-start gap-6 group cursor-pointer hover:-translate-x-2 transition-transform duration-300">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 border border-black/5 shadow-inner grayscale group-hover:grayscale-0 transition-all duration-500">
                    <img alt="Signature 3" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=200" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-bold text-xl font-serif">Kernel-Level Rootkit Hook</h5>
                      <span className="px-4 py-1.5 bg-primary-container text-primary-dim text-[10px] font-bold rounded-full uppercase tracking-wider font-sans">Captured</span>
                    </div>
                    <p className="text-sm font-sans text-secondary leading-relaxed max-w-md">Intercepted 'vfs_read' hook attempt. Intentionally mirroring dummy file content to the deception vault.</p>
                  </div>
                </div>

              </div>
            </div>
          </FadeInScroll>
        </div>
      </section>

      {/* Bottom Bento Stats */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        <FadeInScroll delay={0.6}>
          <div className="md:col-span-2 p-10 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(37,50,75,0.06)] rounded-[2.5rem] flex flex-col justify-between border border-white h-full hover:scale-[1.02] transition-transform duration-500">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] font-sans text-secondary/60 mb-6">Threat Evolution</h4>
              <div className="flex items-end gap-3 h-32 pt-4">
                <div className="flex-1 bg-surface-container-low rounded-t-xl h-[40%] hover:h-[45%] transition-all duration-300 cursor-pointer"></div>
                <div className="flex-1 bg-surface-container-low rounded-t-xl h-[65%] hover:h-[70%] transition-all duration-300 cursor-pointer"></div>
                <div className="flex-1 bg-primary/80 rounded-t-xl h-[85%] relative group hover:h-[90%] transition-all duration-300 cursor-pointer">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity font-serif font-bold text-sm text-primary">Peak</div>
                </div>
                <div className="flex-1 bg-surface-container-low rounded-t-xl h-[55%] hover:h-[60%] transition-all duration-300 cursor-pointer"></div>
                <div className="flex-1 bg-surface-container-low rounded-t-xl h-[95%] hover:h-[100%] transition-all duration-300 cursor-pointer"></div>
                <div className="flex-1 bg-tertiary-dim/70 rounded-t-xl h-[75%] hover:h-[80%] transition-all duration-300 cursor-pointer"></div>
                <div className="flex-1 bg-surface-container-low rounded-t-xl h-[45%] hover:h-[50%] transition-all duration-300 cursor-pointer"></div>
              </div>
            </div>
            <p className="mt-10 text-[15px] italic text-secondary/80 font-serif">Attacker sophistication has increased by <span className="font-bold text-primary">14%</span> over the last 24 hours.</p>
          </div>
        </FadeInScroll>

        <FadeInScroll delay={0.7}>
          <div className="p-10 bg-secondary text-white rounded-[2.5rem] flex flex-col justify-center text-center h-full shadow-2xl shadow-secondary/20 hover:scale-[1.02] transition-transform duration-500">
            <span className="text-[4rem] font-serif font-black mb-2 tracking-tighter leading-none">0.0%</span>
            <span className="text-[10px] uppercase font-sans font-bold tracking-[0.3em] opacity-70">Detection Rate</span>
            <p className="mt-8 text-sm font-serif italic text-white/60 leading-relaxed px-4">Attackers still implicitly believe they are within the production core.</p>
          </div>
        </FadeInScroll>

        <FadeInScroll delay={0.8}>
          <div className="p-10 bg-tertiary-container/60 backdrop-blur-xl rounded-[2.5rem] flex flex-col justify-center text-center relative overflow-hidden h-full border border-white/50 hover:scale-[1.02] shadow-[0_20px_50px_rgba(245,209,255,0.3)] transition-transform duration-500">
            <div className="absolute -right-6 -bottom-6 text-tertiary-dim/5 rotate-12">
              <BsStopwatch size={180} />
            </div>
            <span className="text-[4rem] font-serif font-black mb-2 tracking-tighter text-tertiary-dim relative z-10 leading-none">218s</span>
            <span className="text-[10px] uppercase font-sans font-bold tracking-[0.3em] text-tertiary/70 relative z-10">Mean Engagement</span>
          </div>
        </FadeInScroll>
      </section>
    </div>
  );
}
