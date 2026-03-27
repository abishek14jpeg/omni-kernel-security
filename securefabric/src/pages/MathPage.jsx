import React from 'react';
import { Calculator, Target, Shield, Swords, TrendingDown, Minimize2 } from 'lucide-react';
import TopNavigation from '../components/dashboard/TopNavigation';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export default function MathPage({ onNavigate }) {
  return (
    <div className="bg-[#f9f9ff] text-[#25324b] min-h-screen relative font-sans">
      <TopNavigation onNavigate={onNavigate} currentPage="math" />
      
      <main className="pt-32 pb-32">
        <header className="px-12 mb-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end gap-12">
            <div className="w-full">
              <span className="text-sm font-bold tracking-widest uppercase text-violet-800/60 mb-6 block">Theoretical Logic</span>
              <h1 className="text-7xl md:text-8xl font-extrabold tracking-tighter leading-none mb-8 font-serif">
                Mathematical <br/>
                <span className="text-violet-900 italic font-light">Foundation</span>
              </h1>
              <p className="text-2xl text-slate-500 max-w-3xl leading-relaxed border-l-4 border-violet-300 pl-6">
                Omni-Kernel optimizes security resource allocation by treating it as a constrained minimization problem. The system also models the adversarial interaction between Defender and Attacker using game-theoretic frameworks.
              </p>
            </div>
          </div>
        </header>

        {/* KKT Optimization */}
        <section className="px-12 mb-24 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-xl shadow-slate-200 border border-slate-100 mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600">
                <Minimize2 size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold font-serif text-slate-800">Constrained Optimization (KKT Conditions)</h2>
                <p className="text-slate-500 font-medium">Karush-Kuhn-Tucker optimality constraints for dynamic resource utilization.</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Objective function */}
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 relative">
                <span className="absolute top-4 left-6 text-xs font-bold tracking-widest uppercase text-slate-400">Objective Function</span>
                <div className="my-6">
                  <BlockMath math="\min f(x, \theta) = L(x) + \gamma E(x) + \lambda \|\theta\|^2" />
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Where <InlineMath math="L(x)" /> represents latency, <InlineMath math="E(x)" /> represents energy consumption, <InlineMath math="\lambda \|\theta\|^2" /> regularizes neural model complexity, and <InlineMath math="\gamma" /> is the energy-latency trade-off coefficient. The goal is to maximize detection accuracy while minimizing operational cost under strict kernel-level constraints.
                </p>
              </div>

              {/* Constraints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 relative">
                  <span className="absolute top-4 left-6 text-xs font-bold tracking-widest uppercase text-slate-400">Stationarity</span>
                  <div className="my-6">
                    <BlockMath math="\nabla_x \mathcal{L}(x, \lambda, \mu) = 0" />
                  </div>
                  <p className="text-slate-600 text-sm">
                    The Lagrangian gradient vanishes at optimum, guaranteeing no feasible descent direction remains for the attacker.
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 relative">
                  <span className="absolute top-4 left-6 text-xs font-bold tracking-widest uppercase text-slate-400">Primal Feasibility</span>
                  <div className="my-6">
                    <BlockMath math="g_i(x) \le 0, \quad h_j(x) = 0, \quad \lambda_i g_i(x) = 0" />
                  </div>
                  <p className="text-slate-600 text-sm">
                    Feasible allocations satisfy hard throughput bounds, while complementary slackness decides which constraints are active.
                  </p>
                </div>
              </div>

              {/* Anomaly Objective */}
              <div className="p-8 rounded-2xl bg-violet-50/50 border border-violet-100 relative">
                <span className="absolute top-4 left-6 text-xs font-bold tracking-widest uppercase text-violet-500">PyTorch Anomaly Objective</span>
                <div className="my-6">
                  <BlockMath math="\mathcal{L}_{\text{total}} = \alpha \|X - \hat{X}\|^2 + \beta \text{CE}(\hat{y}, y) + \delta \text{KL}(q(z|X)\|p(z))" />
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  A hybrid objective combining reconstruction error (Autoencoder), supervised classification loss (CE), and latent distribution regularization (KL divergence). Maps safely to a local training pipeline.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nash Equilibrium */}
        <section className="px-12 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-xl shadow-slate-200 border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                <Swords size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold font-serif text-slate-800">Nash Equilibrium Framework</h2>
                <p className="text-slate-500 font-medium">Game-theoretic Defender versus Attacker interaction modeling.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Defender utility */}
              <div className="p-8 rounded-2xl border border-blue-100 bg-blue-50/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Shield size={16} className="text-blue-600" /></div>
                  <span className="font-bold text-blue-900 tracking-wide">Defender Utility <InlineMath math="(U_D)" /></span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm mb-6">
                  <BlockMath math="U_D = -L(x_i) - \gamma E(x_i) + \rho \text{Det}(x_i)" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Defender utility penalizes latency and energy costs while heavily rewarding detection throughput <InlineMath math="\text{Det}(x_i)" />, balancing model sensitivity under dynamic network workloads.
                </p>
              </div>

              {/* Attacker utility */}
              <div className="p-8 rounded-2xl border border-red-100 bg-red-50/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><Target size={16} className="text-red-600" /></div>
                  <span className="font-bold text-red-900 tracking-wide">Attacker Utility <InlineMath math="(U_A)" /></span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm mb-6">
                  <BlockMath math="U_A = P_{\text{success}}(x_i) - \eta C(x_i) - \kappa \text{Trace}(x_i)" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The attacker maximizes success probability <InlineMath math="P_{\text{success}}" /> while minimizing operational cost <InlineMath math="C(x_i)" />. Higher defense variables directly amplify forensic traceability <InlineMath math="\text{Trace}(x_i)" />.
                </p>
              </div>
            </div>

            {/* Equilibrium state */}
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <TrendingDown size={24} />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 mb-2">Optimal Equilibrium State <InlineMath math="(x^*)" /></h4>
                <p className="text-emerald-800/80 leading-relaxed">
                  The system dynamically adjusts its defensive posture to reach an optimal state <InlineMath math="x^*" /> where neither the defender nor the attacker can improve their utility by unilaterally changing strategy. This Nash Equilibrium ensures that the defender's resource allocation is robust.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
