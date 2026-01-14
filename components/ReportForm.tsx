
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, LayoutGrid, ClipboardList, Sparkles, Loader2, BarChart3, ShieldCheck, Sun, Zap, Flower2, Layers, Leaf, Award, Minimize2, Frame, Grid3X3, BookOpen, Heart } from 'lucide-react';
import { ReportData, PTAActivity, CoverTheme } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ReportFormProps {
  data: ReportData;
  updateData: (updates: Partial<ReportData>) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ data, updateData }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'pta' | 'analyse' | 'validation'>('info');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (data.trimestreDebut && data.trimestreFin && data.annee && !data.periodeCouverte) {
      updateData({ periodeCouverte: `${data.trimestreDebut} à ${data.trimestreFin} ${data.annee}` });
    }
  }, [data.trimestreDebut, data.trimestreFin, data.annee]);

  const callAI = async (prompt: string) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.error("Erreur : Clé API Gemini manquante. Vérifiez le fichier .env.local");
        return null;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Erreur IA:", error);
      return null;
    }
  };

  const generateAIContent = async (type: string) => {
    setIsGenerating(type);
    let prompt = "";
    
    if (type === 'intro') {
      prompt = `Rédige une introduction professionnelle et spirituelle pour un rapport trimestriel d'église. Département: ${data.nomDepartement}. Activités prévues: ${data.activites.map(a => a.objectifs).join(', ')}. Format court, maximum 3 phrases.`;
    } else if (type === 'full-analyse') {
      const ptaData = data.activites.map(a => `- Activité: ${a.objectifs}, Réalisation: ${a.realisations}, Résultat: ${a.resultats}, Obs: ${a.observations}`).join('\n');
      prompt = `Analyse ces données de suivi PTA d'un département d'église :\n${ptaData}\n\nGénère en format JSON (sans texte avant ou après) :\n{ "progres": ["un progrès"], "impacts": ["un impact"], "defis": ["un défi"], "recommandations": ["une reco"] }\nProduis 2-3 éléments par liste en te basant sur ce qui est réalisé ou non.`;
    }

    const result = await callAI(prompt);
    if (result) {
      if (type === 'intro') {
        updateData({ introductionAnalyse: result.trim() });
      } else if (type === 'full-analyse') {
        try {
          const cleanJson = result.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          updateData({
            progres: parsed.progres || data.progres,
            impacts: parsed.impacts || data.impacts,
            defis: parsed.defis || data.defis,
            recommandations: parsed.recommandations || data.recommandations
          });
        } catch (e) {
          console.error("Erreur parsing JSON IA", e);
        }
      }
    }
    setIsGenerating(null);
  };

  const handleActivityChange = (id: string, field: keyof PTAActivity, value: string) => {
    updateData({ activites: data.activites.map(act => act.id === id ? { ...act, [field]: value } : act) });
  };

  const updateList = (field: 'progres' | 'impacts' | 'defis' | 'recommandations', index: number, value: string) => {
    const newList = [...data[field]];
    newList[index] = value;
    updateData({ [field]: newList });
  };

  const themes: { id: CoverTheme; label: string; icon: any }[] = [
    { id: 'official', label: 'Officiel AD', icon: ShieldCheck },
    { id: 'minimalist', label: 'Minimal Pur', icon: Minimize2 },
    { id: 'royal', label: 'Cadre Royal', icon: Award },
    { id: 'prestige', label: 'Double Cadre', icon: Frame },
    { id: 'architect', label: 'Grille Fine', icon: Grid3X3 },
    { id: 'vintage', label: 'Classique', icon: BookOpen },
    { id: 'spirit', label: 'Spirituel', icon: Heart },
    { id: 'celestial', label: 'Rayonnement', icon: Sun },
    { id: 'eco', label: 'Éco-Dashed', icon: Leaf },
    { id: 'ethereal', label: 'Fleur Douce', icon: Flower2 },
    { id: 'stainedglass', label: 'Vitrail Léger', icon: Zap },
    { id: 'modern', label: 'Lignes Pro', icon: Layers },
  ];

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all bg-slate-50 focus:bg-white";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest";

  return (
    <div className="space-y-8">
      {/* Navigation Interne */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-print">
        {[
          { id: 'info', icon: LayoutGrid, label: 'Général' },
          { id: 'pta', icon: ClipboardList, label: 'Suivi PTA' },
          { id: 'analyse', icon: BarChart3, label: 'Analyse' },
          { id: 'validation', icon: ShieldCheck, label: 'Signature' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className={labelClass + " text-slate-800 mb-4"}>Style de Page de Garde (Économie d'encre)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => updateData({ coverTheme: t.id })}
                    className={`h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center p-2 gap-1.5 ${
                      data.coverTheme === t.id ? 'border-blue-600 bg-blue-50 shadow-md scale-105' : 'border-transparent bg-slate-50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <t.icon className={`w-5 h-5 ${data.coverTheme === t.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-[8px] font-black uppercase text-center leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Titre du Rapport</label>
                <input type="text" value={data.titreRapport} onChange={e => updateData({ titreRapport: e.target.value })} className={inputClass} />
              </div>
              <div><label className={labelClass}>Département</label><input type="text" value={data.nomDepartement} onChange={e => updateData({ nomDepartement: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Période</label><input type="text" value={data.periodeCouverte} onChange={e => updateData({ periodeCouverte: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Responsable Nom</label><input type="text" value={data.responsableNom} onChange={e => updateData({ responsableNom: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Responsable Contact</label><input type="text" value={data.responsableContact} onChange={e => updateData({ responsableContact: e.target.value })} className={inputClass} /></div>
            </div>

            <div className="relative group">
              <label className={labelClass}>1. Introduction</label>
              <textarea rows={8} value={data.introductionAnalyse} onChange={e => updateData({ introductionAnalyse: e.target.value })} className={inputClass} placeholder="Décrivez le contexte du trimestre..." />
              <button 
                onClick={() => generateAIContent('intro')} 
                disabled={!!isGenerating}
                className="absolute top-8 right-3 flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-lg hover:scale-105 transition-all text-[10px] font-black uppercase disabled:opacity-50"
              >
                {isGenerating === 'intro' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Assistance IA
              </button>
            </div>
          </div>
        )}

        {activeTab === 'pta' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ClipboardList className="w-5 h-5" /></div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Tableau des Activités</h3>
               </div>
               <button onClick={() => updateData({ activites: [...data.activites, { id: Date.now().toString(), objectifs: '', realisations: '', resultats: '', indicateurs: '', observations: '' }] })} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black transition-colors shadow-lg active:scale-95">
                 <Plus className="w-4 h-4"/> Ajouter une activité
               </button>
            </div>
            <div className="space-y-4">
              {data.activites.map((act, index) => (
                <div key={act.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative space-y-4 group hover:border-blue-200 transition-colors">
                   <div className="absolute -left-3 top-6 bg-slate-900 text-white w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg">{index + 1}</div>
                   <button onClick={() => updateData({ activites: data.activites.filter(a => a.id !== act.id) })} className="absolute top-4 right-4 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-2">
                     <Trash2 className="w-4 h-4" />
                   </button>
                   <div>
                      <label className={labelClass}>Objectifs / Activités prévues</label>
                      <textarea value={act.objectifs} onChange={e => handleActivityChange(act.id, 'objectifs', e.target.value)} className={inputClass} rows={2} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Réalisations</label>
                        <input value={act.realisations} onChange={e => handleActivityChange(act.id, 'realisations', e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Résultats obtenus</label>
                        <input value={act.resultats} onChange={e => handleActivityChange(act.id, 'resultats', e.target.value)} className={inputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>Indicateurs de Performance</label>
                        <input value={act.indicateurs} onChange={e => handleActivityChange(act.id, 'indicateurs', e.target.value)} className={inputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>Observations / Difficultés</label>
                        <textarea value={act.observations} onChange={e => handleActivityChange(act.id, 'observations', e.target.value)} className={inputClass} rows={2} />
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analyse' && (
          <div className="space-y-8">
            <div className="bg-blue-600 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
               <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Analyse Intelligente</h3>
                    <p className="text-sm text-white/80">Nous analysons votre PTA pour en tirer une synthèse complète.</p>
                  </div>
                  <button 
                    onClick={() => generateAIContent('full-analyse')} 
                    disabled={!!isGenerating}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase text-xs hover:bg-slate-100 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {isGenerating === 'full-analyse' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Lancer l'IA
                  </button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['progres', 'impacts', 'defis', 'recommandations'] as const).map(field => (
                <div key={field} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className={labelClass + " text-blue-600"}>{field.toUpperCase()}</label>
                    <button onClick={() => updateData({ [field]: [...data[field], ''] })} className="p-1.5 bg-slate-100 rounded-lg hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors"><Plus className="w-4 h-4"/></button>
                  </div>
                  {data[field].map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={item} onChange={e => updateList(field, i, e.target.value)} className={inputClass} placeholder="..." />
                      <button onClick={() => updateData({ [field]: data[field].filter((_, idx) => idx !== i) })} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Signataires & Date</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={labelClass}>Lieu et Date</label><input type="text" value={data.dateFait} onChange={e => updateData({ dateFait: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Bureau Destinataire</label><input type="text" value={data.bureauDe} onChange={e => updateData({ bureauDe: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Nom du Secrétaire</label><input type="text" value={data.nomSecretaire} onChange={e => updateData({ nomSecretaire: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Nom du Directeur/trice</label><input type="text" value={data.nomDirecteur} onChange={e => updateData({ nomDirecteur: e.target.value })} className={inputClass} /></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportForm;
