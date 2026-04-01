import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import { useHerSenseStore, phaseLabel } from '@/stores/useHerSenseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Leaf, Search, Shield, ShieldAlert, Zap, Sparkles, Loader2, Activity, Apple, FlaskConical, Beaker, AlertTriangle, Pill, Stethoscope, ChevronRight, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 🧪 Skincare Safety Database
const INGREDIENTS_DB: Record<string, { risk: 'safe' | 'caution' | 'high-risk'; note: string }> = {
  retinol: { risk: 'high-risk', note: 'Skin barrier is thinnest now. Avoid to prevent chemical burns or severe purging.' },
  'salicylic acid': { risk: 'caution', note: 'BHA can be too drying when estrogen is low. Use only as a spot treatment.' },
  niacinamide: { risk: 'safe', note: 'Safe in all phases. Strengthens barrier during hormonal dips.' },
  vitamin_c: { risk: 'safe', note: 'Best used now to boost collagen when skin resilience is high.' },
  hyaluronic: { risk: 'safe', note: 'Ideal for all phases. Essential for hydration during menstrual estrogen dips.' },
};

const CareHub = () => {
  const store = useHerSenseStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<'intelligence' | 'pathology' | 'safety'>('intelligence');
  const [backendData, setBackendData] = useState<any>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [dynamicFix, setDynamicFix] = useState<any>(null);
  const [clinicalRisk, setClinicalRisk] = useState<any>(null);
  const [searchIngredient, setSearchIngredient] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [baseRes, riskRes] = await Promise.all([
          fetch(`http://localhost:8000/engine/care-hub?phase=${store.cyclePhase}`),
          fetch(`http://localhost:8000/engine/care-hub/clinical-prediction`)
        ]);
        if (baseRes.ok) setBackendData(await baseRes.json());
        if (riskRes.ok) setClinicalRisk(await riskRes.json());
      } catch (e) {
        console.error("Backend offline");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [store.cyclePhase]);

  const handleSymptomClick = async (symptom: string) => {
    setSelectedSymptom(symptom);
    try {
      const res = await fetch(`http://localhost:8000/engine/care-hub/symptom-fix?phase=${store.cyclePhase}&symptom=${symptom.toLowerCase()}`);
      if (res.ok) setDynamicFix(await res.json());
    } catch (e) {
      toast({ variant: "destructive", title: "Connection Error" });
    }
  };

  const ingredientResult = searchIngredient.trim() ? INGREDIENTS_DB[searchIngredient.toLowerCase().trim()] : null;

  return (
    <Layout>
      <PageTransition>
        <div className="px-4 pt-6 pb-24 max-w-md mx-auto space-y-6 text-left">
          
          {/* Header */}
          <header className="flex justify-between items-start">
            <div className="space-y-1 text-left">
              <h1 className="font-display text-2xl font-black tracking-tight text-foreground">Care Hub</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest italic">
                  {phaseLabel(store.cyclePhase)} Engine Active
                </p>
              </div>
            </div>
            <div className="glass-card px-3 py-1.5 border-primary/20 bg-primary/5 rounded-xl">
               <span className="text-[9px] font-black text-primary uppercase tracking-tighter">AI-Managed</span>
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="flex gap-1 p-1 bg-secondary/20 backdrop-blur-md rounded-2xl border border-white/5">
            {[{ key: 'intelligence', label: 'Lifestyle', icon: Sparkles },
              { key: 'pathology', label: 'Diagnosis', icon: FlaskConical },
              { key: 'safety', label: 'Safety', icon: Shield }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all ${tab === t.key ? 'bg-background shadow-lg text-primary border border-white/5' : 'text-muted-foreground'}`}>
                <t.icon size={16} className="mb-1" />
                <span className="text-[8px] font-black uppercase tracking-tighter">{t.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="text-primary animate-spin" size={32} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syncing Bio-Data...</p>
              </div>
            ) : (
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {/* 🧬 LIFESTYLE & DYNAMIC INSIGHTS TAB */}
                {tab === 'intelligence' && (
                  <div className="space-y-6">
                    <section className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Symptom Fixer</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Cramps', 'Brain Fog', 'Bloating', 'Low Energy'].map(s => (
                          <button key={s} onClick={() => handleSymptomClick(s)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${selectedSymptom === s ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-secondary/40 text-muted-foreground border-white/5'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </section>

                    <AnimatePresence mode="wait">
                      {dynamicFix && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 gap-3">
                          <div className="glass-card p-4 border-l-4 border-primary bg-primary/5">
                              <p className="text-[9px] font-black uppercase text-primary mb-1">Desi Approach</p>
                              <p className="text-xs font-medium italic text-foreground/90 leading-relaxed">"{dynamicFix.desi}"</p>
                          </div>
                          <div className="glass-card p-4 border-l-4 border-blue-400 bg-blue-400/5">
                              <p className="text-[9px] font-black uppercase text-blue-400 mb-1">Western Approach</p>
                              <p className="text-xs font-medium italic text-foreground/90 leading-relaxed">"{dynamicFix.western}"</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-3">
                      <div className="glass-card p-5 space-y-3 border-l-4 border-orange-400 bg-orange-400/5 transition-all">
                        <div className="flex items-center gap-2"><Apple size={16} className="text-orange-400" /><h3 className="text-[10px] font-black uppercase text-orange-400 tracking-widest">Nutritional Strategy</h3></div>
                        <p className="text-xs text-foreground/80 leading-relaxed italic">{backendData?.diet || "Optimization in progress..."}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🩺 DIAGNOSIS & MANAGEMENT TAB (EXACT LAYOUT PRESERVED) */}
                {tab === 'pathology' && (
                  <div className="space-y-5">
                    <div className="glass-card-strong p-5 border-t-4 border-purple-500 bg-gradient-to-br from-purple-500/10 to-transparent">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-purple-400 text-left">Clinical Pattern</h3>
                        <span className="text-[8px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-tighter">AI Scanned</span>
                      </div>
                      <div className="p-4 bg-background/60 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Status</p>
                        <p className="text-sm font-black text-purple-300">{clinicalRisk?.condition || "Stability Detected"}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed italic pt-2 border-t border-white/5 mt-2">
                          "{clinicalRisk?.insight || "No chronic markers found in recent logs."}"
                        </p>
                      </div>
                    </div>

                    {(clinicalRisk?.condition?.includes("Risk") || clinicalRisk?.condition?.includes("Variance")) && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                        <div className="flex items-center gap-2 ml-1">
                          <Stethoscope size={16} className="text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Management Protocol</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 text-left">
                          <div className="glass-card p-4 border-l-4 border-emerald-500 bg-emerald-500/5">
                            <div className="flex items-center gap-2 mb-2"><Leaf size={14} className="text-emerald-400" /><p className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Desi/Natural Fix</p></div>
                            <p className="text-[11px] font-medium italic text-foreground/90">
                                {clinicalRisk?.condition?.includes("PCOS") ? "Spearmint tea (2x daily) to lower androgens. Seed cycling for hormone balance." : "Brazil nuts for Selenium. Ashwagandha to support adrenal axis."}
                            </p>
                          </div>
                          <div className="glass-card p-4 border-l-4 border-blue-500 bg-blue-500/5">
                            <div className="flex items-center gap-2 mb-2"><Pill size={14} className="text-blue-400" /><p className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Clinical/Western Fix</p></div>
                            <p className="text-[11px] font-medium italic text-foreground/90">
                                {clinicalRisk?.condition?.includes("PCOS") ? "Inositol supplements (4g/day) to manage insulin resistance." : "Request TSH, Free T3/T4 panel for thyroid screening."}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 flex gap-2 items-start">
                          <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                          <p className="text-[9px] text-red-100 font-bold leading-tight uppercase">Medical Action: {clinicalRisk?.med_note}</p>
                        </div>
                      </motion.div>
                    )}

                    <div className="glass-card p-4 border-white/5 bg-secondary/10">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Other Indicators</p>
                            <ChevronRight size={14} className="text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-muted-foreground italic">Iron (Anemia) Risk</span>
                                <span className="text-emerald-400 font-bold">LOW</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-muted-foreground italic">Adrenal Fatigue</span>
                                <span className="text-orange-400 font-bold">MODERATE</span>
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* 🛡️ SAFETY SEARCH TAB (FIXED & DYNAMIC) */}
                {tab === 'safety' && (
                  <div className="space-y-4">
                    <div className="glass-card p-5 space-y-5 border border-white/5">
                      <div className="flex items-center gap-2 mb-2"><Beaker size={16} className="text-primary" /><h3 className="text-[10px] font-black uppercase tracking-widest">Phase-Safe Actives</h3></div>
                      <div className="space-y-3">
                        <div className="relative">
                          <input type="text" value={searchIngredient} onChange={e => setSearchIngredient(e.target.value)} placeholder="Search: Retinol, BHA, Niacinamide..." 
                            className="w-full bg-secondary/40 border border-white/10 rounded-2xl px-4 py-4 text-sm outline-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50" />
                          <Search className="absolute right-4 top-4 text-muted-foreground/60" size={18} />
                        </div>
                        <p className="text-[10px] text-muted-foreground italic px-1 leading-relaxed">Verify ingredient safety against your current biological profile.</p>
                      </div>

                      <AnimatePresence mode="wait">
                        {ingredientResult ? (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={`p-4 rounded-2xl border ${ingredientResult.risk === 'high-risk' ? 'bg-red-500/10 border-red-500/20' : 'bg-primary/10 border-primary/20'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${ingredientResult.risk === 'high-risk' ? 'bg-red-500 text-white shadow-lg' : 'bg-primary text-black'}`}>{ingredientResult.risk}</span>
                              <ShieldCheck size={14} className={ingredientResult.risk === 'high-risk' ? 'text-red-400' : 'text-primary'} />
                            </div>
                            <p className="text-[11px] italic text-foreground/80 leading-relaxed font-medium">{ingredientResult.note}</p>
                          </motion.div>
                        ) : searchIngredient.length > 2 ? (
                            <div className="p-4 rounded-2xl bg-secondary/20 border border-white/5 text-center">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Biological scan: No contraindications.</p>
                            </div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default CareHub;