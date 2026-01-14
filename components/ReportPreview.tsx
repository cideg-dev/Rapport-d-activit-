
import React, { useEffect, useRef } from 'react';
import { Flower2, Leaf, Award, Sun, Zap, Layers, Star, Frame, Grid3X3, BookOpen, Heart, ShieldCheck, Minimize2, CheckCircle2 } from 'lucide-react';
import { ReportData } from '../types';

// Styles pour l'impression
const PrintStyles = () => (
  <style>{`
    @media print {
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      html, body {
        font-size: 13pt !important;
        line-height: 1.5 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .report-typography {
        font-size: 13pt !important;
        line-height: 1.5 !important;
      }

      .a4-container {
        box-shadow: none !important;
        border: 1px solid #333 !important;
        page-break-after: always;
        page-break-inside: avoid;
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 16px !important;
        line-height: 1.5 !important;
      }

      .page-break {
        page-break-after: always;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13pt !important;
        line-height: 1.5 !important;
      }

      thead {
        display: table-header-group;
      }

      th, td {
        font-size: 13pt !important;
        padding: 6px 4px !important;
        line-height: 1.5 !important;
        vertical-align: top;
        border-collapse: collapse;
      }

      textarea, input, select {
        font-size: 13pt !important;
        line-height: 1.5 !important;
        font-family: inherit;
      }

      h1, h2, h3, h4, h5, h6 {
        line-height: 1.5 !important;
        margin: 4px 0 2px 0 !important;
        orphans: 2;
        widows: 2;
      }

      p, div, section {
        line-height: 1.5 !important;
        orphans: 2;
        widows: 2;
      }

      .break-inside-avoid {
        page-break-inside: avoid;
      }

      /* Pas de dégradés ni de couleurs légères en impression */
      input[type="text"], input[type="date"], textarea {
        background: transparent !important;
        border: none !important;
      }

      /* Masquer les éléments non-imprimables */
      .no-print {
        display: none !important;
      }

      body {
        background: white !important;
      }
    }

    /* Optimisation écran */
    @media screen {
      .report-typography {
        font-size: 13pt;
        line-height: 1.5;
      }
    }
  `}</style>
);

interface ReportPreviewProps {
  data: ReportData;
  updateData: (updates: Partial<ReportData>) => void;
}

const AD_LOGO_BASE64 = "data:image/png;base64,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"

export const ADLogo = ({ className = "w-full h-full" }: { className?: string }) => (
  <img
    src="/logo.jpeg"
    alt="Logo Assemblées de Dieu"
    className={`${className} object-contain`}
    onError={(e) => {
      // Fallback au base64 si le fichier n'est pas trouvé
      (e.currentTarget as HTMLImageElement).src = AD_LOGO_BASE64;
    }}
  />
);

const ReportPreview: React.FC<ReportPreviewProps> = ({ data, updateData }) => {
  const introTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fonctions pour vérifier si les sections ont du contenu
  const hasActivites = data.activites && data.activites.length > 0;
  const hasAnalyse = (data.progres && data.progres.length > 0) || 
                      (data.impacts && data.impacts.length > 0) || 
                      (data.defis && data.defis.length > 0);
  const hasRecommandations = data.recommandations && data.recommandations.length > 0;
  const hasIntro = data.introductionAnalyse && data.introductionAnalyse.trim().length > 0;

  // Fonction pour ajuster la hauteur du textarea
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(60, textarea.scrollHeight) + 'px';
    }
  };

  // Ajuster la hauteur au montage et quand le contenu change
  useEffect(() => {
    adjustTextareaHeight(introTextareaRef.current);
  }, [data.introductionAnalyse]);
  
  const handleListEdit = (field: 'progres' | 'impacts' | 'defis' | 'recommandations', index: number, value: string) => {
    const newList = [...data[field]];
    newList[index] = value;
    updateData({ [field]: newList });
  };

  const handleActivityEdit = (id: string, field: keyof PTAActivity, value: string) => {
    const newActivites = data.activites.map(act =>
      act.id === id ? { ...act, [field]: value } : act
    );
    updateData({ activites: newActivites });
  };

  const headerBlock = (
    <div className="flex flex-col items-center text-center">
       <div className="w-24 mb-6"><ADLogo /></div>
       <div className="font-serif">
          <h4 className="font-bold text-[11pt] uppercase text-blue-900 leading-tight">Église Évangélique Assemblée de Dieu du Bénin</h4>
          <h5 className="font-bold text-[10pt] text-sky-600 uppercase mt-1">Région de l'Atacora • Section de Natitingou</h5>
          <h5 className="font-bold text-[11pt] text-red-600 uppercase mt-1">Temple Local de Beraca</h5>
       </div>
    </div>
  );

  const titleBlock = (
     <div className="text-center mt-12 space-y-4 px-6">
        <h1 className="text-4xl sm:text-5xl font-black text-blue-950 tracking-tighter uppercase leading-[1.1] break-words">
          {data.titreRapport || "Rapport Trimestriel"}
        </h1>
        <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full" />
        <input 
          className="text-xl font-bold text-sky-700 bg-transparent text-center w-full outline-none border-none uppercase tracking-[0.2em] mt-2" 
          value={data.periodeCouverte} 
          onChange={e => updateData({ periodeCouverte: e.target.value })} 
          placeholder="PÉRIODE" 
        />
     </div>
  );

  const footerBlock = (
    <div className="absolute bottom-16 left-0 right-0 px-20">
       <div className="border-t-2 border-slate-200 pt-8 flex flex-col items-center">
          <p className="text-xs uppercase font-black text-slate-400 mb-2 tracking-[0.3em]">Département</p>
          <input 
            className="text-2xl sm:text-3xl font-black text-blue-900 uppercase text-center w-full bg-transparent outline-none border-none tracking-tight break-words leading-tight" 
            value={data.nomDepartement} 
            onChange={e => updateData({ nomDepartement: e.target.value })} 
            placeholder="NOM DU DÉPARTEMENT" 
          />
       </div>
    </div>
  );

  const renderCover = () => {
    switch (data.coverTheme) {
      case 'official':
        return (
          <div className="a4-container page-break relative bg-white border-8 border-slate-100 shadow-xl">
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-blue-900" />
            <div className="pt-20">{headerBlock}</div>
            <div className="mt-32">{titleBlock}</div>
            {footerBlock}
          </div>
        );
      case 'prestige':
        return (
          <div className="a4-container page-break relative bg-white border-[2px] border-blue-900 p-4 shadow-xl">
            <div className="border-[1px] border-red-500 h-full w-full flex flex-col pt-16">
              {headerBlock}
              <div className="mt-24">{titleBlock}</div>
              {footerBlock}
            </div>
          </div>
        );
      case 'architect':
        return (
          <div className="a4-container page-break relative bg-white dot-pattern border border-slate-200">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-900 opacity-5 rounded-bl-full" />
            <div className="pt-20">{headerBlock}</div>
            <div className="mt-20 bg-white/95 p-10 border-y-4 border-blue-900 shadow-sm">{titleBlock}</div>
            {footerBlock}
          </div>
        );
      case 'vintage':
        return (
          <div className="a4-container page-break relative bg-white border-y-[16px] border-blue-950 p-12 shadow-inner">
            <div className="border-x-2 border-slate-100 h-full w-full pt-10">
              {headerBlock}
              <div className="mt-32 scale-105">{titleBlock}</div>
              <div className="absolute bottom-32 left-0 right-0 text-center px-10">
                 <input className="text-3xl font-serif italic text-blue-900 text-center w-full bg-transparent outline-none border-none break-words" value={data.nomDepartement} onChange={e => updateData({ nomDepartement: e.target.value })} />
              </div>
            </div>
          </div>
        );
      case 'spirit':
        return (
          <div className="a4-container page-break relative bg-white flex flex-col items-center p-20">
            <div className="absolute top-10 right-10 opacity-10 text-red-500"><Heart className="w-56 h-56" /></div>
            <div className="pt-10">{headerBlock}</div>
            <div className="mt-40 border-l-8 border-red-600 pl-10 text-left w-full max-w-lg">
               <h1 className="text-6xl font-black text-blue-950 mb-2 uppercase tracking-tighter leading-none break-words">Rapport</h1>
               <h2 className="text-3xl font-light text-sky-500 uppercase tracking-[0.4em]">Trimestriel</h2>
               <div className="mt-12">
                  <input className="text-3xl font-black text-blue-900 bg-transparent outline-none w-full border-none p-0 break-words leading-tight" value={data.nomDepartement} onChange={e => updateData({ nomDepartement: e.target.value })} />
               </div>
            </div>
            <div className="absolute bottom-20 right-20 text-right">
               <input className="text-base font-black text-slate-400 uppercase tracking-widest bg-transparent outline-none border-none text-right" value={data.periodeCouverte} onChange={e => updateData({ periodeCouverte: e.target.value })} />
            </div>
          </div>
        );
      case 'minimalist':
        return (
          <div className="a4-container page-break relative bg-white border border-slate-50 flex flex-col items-center justify-center p-20">
            <div className="w-32 mb-12"><ADLogo /></div>
            <h1 className="text-4xl font-light text-slate-900 uppercase tracking-[0.5em] mb-4 text-center">RAPPORT</h1>
            <h2 className="text-2xl font-bold text-red-600 uppercase tracking-widest mb-12 text-center">Trimestriel</h2>
            <div className="w-20 h-1 bg-blue-900 mb-12" />
            <input className="text-3xl font-black text-blue-950 uppercase text-center w-full bg-transparent outline-none border-none break-words" value={data.nomDepartement} onChange={e => updateData({ nomDepartement: e.target.value })} placeholder="DÉPARTEMENT" />
            <input className="mt-4 text-sm text-sky-500 bg-transparent text-center w-full outline-none border-none italic font-bold" value={data.periodeCouverte} onChange={e => updateData({ periodeCouverte: e.target.value })} placeholder="Période" />
          </div>
        );
      case 'royal':
        return (
          <div className="a4-container page-break relative bg-white border-[10px] border-double border-blue-900 p-8 shadow-2xl">
            <div className="border-2 border-sky-100 h-full w-full flex flex-col items-center pt-20">
               <div className="w-24 mb-10"><ADLogo /></div>
               <h1 className="text-5xl font-black text-blue-950 mb-4 text-center">RAPPORT</h1>
               <h2 className="text-2xl font-serif italic text-red-600 mb-24 uppercase tracking-widest text-center">Trimestriel</h2>
               <div className="w-full px-12 text-center">
                  <input className="text-4xl font-black text-blue-900 uppercase tracking-tighter bg-transparent outline-none w-full border-none break-words leading-tight" value={data.nomDepartement} onChange={e => updateData({ nomDepartement: e.target.value })} />
               </div>
               <div className="flex-1" />
               <input className="mb-20 text-xl font-bold text-blue-950 bg-transparent text-center w-full outline-none border-none tracking-widest" value={data.periodeCouverte} onChange={e => updateData({ periodeCouverte: e.target.value })} />
            </div>
          </div>
        );
      case 'celestial':
        return (
          <div className="a4-container page-break relative bg-white border border-sky-100 overflow-hidden p-20 flex flex-col items-center">
             <div className="absolute -top-20 -right-20 opacity-20 text-sky-400 rotate-12"><Star className="w-96 h-96" /></div>
             <div className="w-24 mb-12 relative z-10"><ADLogo /></div>
             <h4 className="font-serif text-[13pt] uppercase tracking-[0.3em] text-blue-900 mb-24 text-center relative z-10">Beraca • Natitingou</h4>
             <h1 className="text-7xl font-black text-blue-950 tracking-tighter leading-none mb-4 text-center relative z-10 break-words">RAPPORT</h1>
             <h2 className="text-4xl font-light text-sky-500 uppercase tracking-widest italic mb-24 text-center relative z-10">Trimestriel</h2>
             <div className="border-y-4 border-blue-900 py-10 w-full relative z-10">
                <input className="text-4xl font-black text-blue-900 uppercase tracking-widest bg-transparent text-center w-full outline-none border-none break-words leading-tight" value={data.nomDepartement} onChange={e => updateData({ nomDepartement: e.target.value })} placeholder="DÉPARTEMENT" />
             </div>
             <input className="mt-12 text-2xl font-bold text-sky-600 bg-transparent text-center w-full outline-none border-none relative z-10" value={data.periodeCouverte} onChange={e => updateData({ periodeCouverte: e.target.value })} />
          </div>
        );
      case 'eco':
        return (
          <div className="a4-container page-break relative bg-white border-4 border-dashed border-slate-200 flex flex-col items-center p-20 line-pattern">
             <div className="mb-20 text-blue-700 opacity-60"><Leaf className="w-16 h-16" /></div>
             <div className="w-24 mb-12"><ADLogo /></div>
             <div className="text-center space-y-4 mb-24">
                <h1 className="text-6xl font-black text-blue-900 tracking-tight text-center uppercase">RAPPORT</h1>
                <p className="text-red-600 uppercase font-black tracking-[0.5em] text-xs text-center">Service & Intégrité</p>
             </div>
             <div className="w-full space-y-12 bg-white/95 p-10 rounded-3xl shadow-lg border border-slate-50">
                <div className="flex flex-col border-l-8 border-blue-900 pl-8">
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] mb-1">Secteur Administratif</p>
                   <input className="text-4xl font-black text-blue-900 uppercase bg-transparent outline-none w-full border-none break-words leading-tight" value={data.nomDepartement} onChange={e => updateData({ nomDepartement: e.target.value })} />
                </div>
                <div className="flex flex-col border-l-8 border-sky-400 pl-8">
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] mb-1">Période du Rapport</p>
                   <input className="text-2xl font-bold text-sky-700 bg-transparent outline-none w-full border-none break-words" value={data.periodeCouverte} onChange={e => updateData({ periodeCouverte: e.target.value })} />
                </div>
             </div>
          </div>
        );
      case 'ethereal':
        return (
          <div className="a4-container page-break relative bg-white text-center flex flex-col items-center pt-24 overflow-hidden">
            <div className="absolute top-0 left-0 text-sky-50 opacity-50"><Flower2 className="w-80 h-80 rotate-45" /></div>
            <div className="relative z-10 w-full px-12">
               <div className="w-32 mb-16 mx-auto"><ADLogo /></div>
               <h4 className="text-[12pt] font-black uppercase tracking-[0.6em] text-blue-900 mb-20 text-center">Beraca • Natitingou</h4>
               <h1 className="text-7xl font-serif italic text-blue-950 leading-none text-center break-words">Rapport Trimestriel</h1>
               <div className="w-24 h-1.5 bg-red-500 mx-auto mt-8 rounded-full" />
               <input className="mt-12 text-xl font-bold text-sky-600 tracking-widest bg-transparent text-center w-full outline-none border-none italic" value={data.periodeCouverte} onChange={e => updateData({ periodeCouverte: e.target.value })} />
               <div className="mt-40 border-l-8 border-blue-900 pl-10 text-left max-w-lg mx-auto bg-slate-50/50 py-6 rounded-r-2xl">
                  <input className="text-4xl font-black text-blue-950 uppercase tracking-tighter bg-transparent outline-none w-full border-none break-words leading-none" value={data.nomDepartement} onChange={e => updateData({ nomDepartement: e.target.value })} />
               </div>
            </div>
          </div>
        );
      case 'stainedglass':
        return (
          <div className="a4-container page-break relative bg-white border-4 border-blue-900 p-3 shadow-2xl">
             <div className="border border-red-500 h-full w-full flex flex-col p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 -mr-16 -mt-16 rotate-45" />
                <div className="flex justify-between items-start relative z-10">
                   <div className="w-24"><ADLogo /></div>
                   <div className="text-right">
                      <h1 className="text-6xl font-black text-blue-950 leading-none">RAPPORT</h1>
                      <h2 className="text-3xl font-bold text-red-600 italic mt-2 uppercase tracking-widest">Trimestriel</h2>
                   </div>
                </div>
                <div className="mt-40 border-y-4 border-blue-900 py-16 w-full flex items-center justify-center bg-blue-50/30 relative z-10">
                    <input className="text-5xl font-black text-blue-900 uppercase px-10 text-center bg-transparent outline-none w-full border-none break-words leading-tight" value={data.nomDepartement} onChange={e => updateData({ nomDepartement: e.target.value })} />
                </div>
                <div className="mt-16 text-center relative z-10">
                    <input className="text-2xl font-black text-sky-800 uppercase tracking-[0.3em] bg-transparent outline-none border-none text-center w-full" value={data.periodeCouverte} onChange={e => updateData({ periodeCouverte: e.target.value })} />
                </div>
             </div>
          </div>
        );
      case 'modern':
        return (
          <div className="a4-container page-break relative bg-white border-none p-0 shadow-2xl">
             <div className="h-6 bg-blue-900 w-full" />
             <div className="p-20 flex flex-col h-full">
                <div className="flex justify-between items-center mb-32">
                   <div className="w-24"><ADLogo /></div>
                   <div className="text-right flex flex-col">
                      <span className="text-[11pt] font-black text-red-600 uppercase tracking-[0.6em] mb-1">Beraca</span>
                      <span className="text-[11pt] font-bold text-blue-900 uppercase">Gestion & Administration</span>
                   </div>
                </div>
                <h1 className="text-8xl font-black text-blue-950 mb-2 uppercase tracking-tighter leading-none break-words">Rapport</h1>
                <h2 className="text-5xl font-light text-sky-400 uppercase tracking-[0.2em] mb-12">Trimestriel</h2>
                <div className="flex-1" />
                <div className="space-y-6">
                   <input className="text-6xl font-black text-blue-900 uppercase bg-transparent outline-none w-full border-none p-0 break-words leading-[1.1]" value={data.nomDepartement} onChange={e => updateData({ nomDepartement: e.target.value })} />
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-2 bg-red-600 rounded-full" />
                      <input className="text-2xl font-bold text-sky-600 uppercase tracking-widest bg-transparent outline-none border-none p-0" value={data.periodeCouverte} onChange={e => updateData({ periodeCouverte: e.target.value })} />
                   </div>
                </div>
             </div>
          </div>
        );
      default:
        // Si aucun thème correspondant n'est trouvé, utiliser le thème officiel par défaut
        return (
          <div className="a4-container page-break relative bg-white border-8 border-slate-100 shadow-xl">
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-blue-900" />
            <div className="pt-20">{headerBlock}</div>
            <div className="mt-32">{titleBlock}</div>
            {footerBlock}
          </div>
        );
    }
  };

  return (
    <>
      <PrintStyles />
      <div className="flex flex-col gap-0 print:gap-0 bg-white report-typography print:text-[11pt] print:leading-[1.5]" id="report-content">

      {/* PAGE 1: GARDE */}
      {renderCover()}

      {/* PAGE 2: CONTENU PRINCIPAL */}
      <div className="a4-container page-break relative bg-white p-6 text-slate-900 border-2 border-slate-100 shadow-xl flex flex-col print:p-4">
        <h2 className="font-black text-[18pt] print:text-[14pt] uppercase mb-3 print:mb-2 text-center text-blue-900 border-b-3 print:border-b-2 border-red-600 pb-2 print:pb-1 leading-tight break-words">
          RAPPORT TRIMESTRIEL DE : {data.nomDepartement || "...................."}
        </h2>

        <div className="space-y-2 mb-4 print:mb-3 bg-blue-50/30 p-4 print:p-2 rounded-lg border border-blue-100 print:bg-transparent print:border-none print:p-0 print:space-y-1 text-[10pt] print:text-[11pt]">
           <div className="flex items-baseline gap-2 print:gap-1">
             <span className="font-black text-blue-900 uppercase whitespace-nowrap min-w-fit print:text-[11pt]">Département :</span>
             <input
                className="flex-1 outline-none bg-transparent border-none font-black text-red-600 break-words leading-tight print:text-[11pt]"
                value={data.nomDepartement}
                onChange={e => updateData({ nomDepartement: e.target.value })}
                style={{lineHeight: '1.5'}}
             />
           </div>
           <div className="flex items-baseline gap-2 print:gap-1">
             <span className="font-black text-blue-900 uppercase whitespace-nowrap min-w-fit print:text-[11pt]">Période :</span>
             <input
                className="flex-1 outline-none bg-transparent border-none text-sky-700 font-bold print:text-[11pt]"
                value={data.periodeCouverte}
                onChange={e => updateData({ periodeCouverte: e.target.value })}
                style={{lineHeight: '1.5'}}
             />
           </div>
           <div className="flex items-baseline gap-2 print:gap-1">
             <span className="font-black text-blue-900 uppercase whitespace-nowrap min-w-fit print:text-[11pt]">Responsable :</span>
             <input
                className="flex-1 outline-none bg-transparent border-none text-slate-800 font-bold print:text-[11pt]"
                value={data.responsableNom}
                onChange={e => updateData({ responsableNom: e.target.value })}
                style={{lineHeight: '1.5'}}
             />
           </div>
           <div className="flex items-baseline gap-2 print:gap-1">
             <span className="font-black text-blue-900 uppercase whitespace-nowrap min-w-fit print:text-[11pt]">Contact :</span>
             <input
                className="flex-1 outline-none bg-transparent border-none text-slate-800 font-bold print:text-[11pt]"
                value={data.responsableContact || ''}
                onChange={e => updateData({ responsableContact: e.target.value })}
                style={{lineHeight: '1.5'}}
             />
           </div>
```        </div>

        <section className="mb-3 flex-1">
          <h3 className="font-black mb-2 uppercase text-blue-900 text-[12pt] border-b-2 border-sky-200 pb-1 flex items-center gap-2">
            <span className="bg-blue-900 text-white w-5 h-5 rounded flex items-center justify-center text-xs">1</span>
            <span>Introduction</span>
          </h3>
          <textarea
            ref={introTextareaRef}
            className="w-full text-justify bg-blue-50/20 border-none outline-none focus:ring-2 focus:ring-blue-100 rounded-lg p-4 resize-none overflow-hidden text-blue-950 font-medium text-[10.5pt] print:text-[13pt] print:leading-[1.5] print:bg-transparent print:p-0 print:rounded-none"
            value={data.introductionAnalyse}
            onChange={e => {
              updateData({ introductionAnalyse: e.target.value });
              adjustTextareaHeight(e.target);
            }}
            style={{
              fontFamily: 'inherit',
              minHeight: '110px',
              height: 'auto',
              lineHeight: '1.5'
            }}
            placeholder="Introduction détaillée ici..."
            onInput={e => {
              adjustTextareaHeight(e.currentTarget);
            }}
          />
        </section>

        {hasActivites && (
        <section className="flex-1 min-h-[0]">
          <h3 className="font-black mb-2 uppercase text-blue-900 text-[12pt] border-b-2 border-sky-200 pb-1 flex items-center gap-2">
            <span className="bg-blue-900 text-white w-5 h-5 rounded flex items-center justify-center text-xs">2</span>
            <span>Suivi des Activités</span>
          </h3>
          <div className="overflow-x-auto print:overflow-x-visible text-[9pt] print:text-[13pt]">
            <table className="w-full border-collapse border-1 border-blue-900 print:text-[13pt] print:leading-[1.5]">
              <thead className="bg-blue-900 text-white print:bg-blue-900">
                <tr className="font-black text-[8pt] text-center uppercase print:text-[13pt]">
                  <th className="p-2 print:p-2 w-[5%] border border-blue-800">N°</th>
                  <th className="p-2 print:p-2 w-[22%] border border-blue-800">Objectifs</th>
                  <th className="p-2 print:p-2 w-[13%] border border-blue-800">Réalisation</th>
                  <th className="p-2 print:p-2 w-[14%] border border-blue-800">Résultats</th>
                  <th className="p-2 print:p-2 w-[20%] border border-blue-800">Indicateurs</th>
                  <th className="p-2 print:p-2 w-[26%] border border-blue-800">Observations</th>
                </tr>
              </thead>
              <tbody>
                {data.activites.map((act, i) => (
                  <tr key={act.id} className="text-[8.5pt] print:text-[13pt] print:leading-[1.5] break-inside-avoid">
                    <td className="p-2 print:p-2 text-center font-black text-blue-900 border border-blue-200 bg-blue-50/30 print:bg-transparent align-top">{i+1}</td>
                    <td className="p-2 print:p-2 border border-blue-200 align-top"><textarea className="w-full bg-transparent border-none outline-none resize-none p-1 min-h-[95px] print:min-h-[115px] text-blue-950 text-[8.5pt] print:text-[13pt]" value={act.objectifs} onChange={e => handleActivityEdit(act.id, 'objectifs', e.target.value)} style={{lineHeight: '1.5'}} /></td>
                    <td className="p-2 print:p-2 text-center font-black text-red-600 border border-blue-200 bg-red-50/10 print:bg-transparent align-top"><input className="w-full bg-transparent border-none outline-none text-center text-[8.5pt] print:text-[13pt]" value={act.realisations} onChange={e => handleActivityEdit(act.id, 'realisations', e.target.value)} style={{lineHeight: '1.5'}} /></td>
                    <td className="p-2 print:p-2 text-center font-black text-sky-700 border border-blue-200 bg-sky-50/10 print:bg-transparent align-top"><input className="w-full bg-transparent border-none outline-none text-center text-[8.5pt] print:text-[13pt]" value={act.resultats} onChange={e => handleActivityEdit(act.id, 'resultats', e.target.value)} style={{lineHeight: '1.5'}} /></td>
                    <td className="p-2 print:p-2 border border-blue-200 align-top"><textarea className="w-full bg-transparent border-none outline-none resize-none p-1 min-h-[95px] print:min-h-[115px] text-slate-700 text-[8.5pt] print:text-[13pt]" value={act.indicateurs} onChange={e => handleActivityEdit(act.id, 'indicateurs', e.target.value)} style={{lineHeight: '1.5'}} /></td>
                    <td className="p-2 print:p-2 italic border border-blue-200 bg-slate-50/20 print:bg-transparent align-top"><textarea className="w-full bg-transparent border-none outline-none resize-none p-1 min-h-[95px] print:min-h-[115px] text-slate-500 text-[8.5pt] print:text-[13pt]" value={act.observations} onChange={e => handleActivityEdit(act.id, 'observations', e.target.value)} style={{lineHeight: '1.5'}} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}

        <div className="absolute bottom-2 right-4 font-black text-blue-900 opacity-20 text-xs">Page 1 • Beraca</div>
      </div>

      {/* PAGE 3: ANALYSE ET IMPACT + RECOMMANDATIONS + SIGNATURES */}
      <div className="a4-container page-break relative bg-white p-8 text-slate-900 border-2 border-slate-100 shadow-xl flex flex-col">
        
        {hasAnalyse && (
        <section className="space-y-5 break-inside-avoid mb-2">
          <h3 className="font-black uppercase text-blue-900 text-[14pt] border-b-3 border-sky-200 flex items-center gap-3 pb-2">
            <span className="bg-blue-900 text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm">3</span>
            Analyse et Impact
          </h3>
          <div className="space-y-4 pl-2">
             {data.progres && data.progres.length > 0 && (
             <div className="bg-blue-50/30 p-5 rounded-xl border-l-4 border-blue-900 break-inside-avoid print:bg-transparent print:p-3 print:border-l-2">
                <p className="font-black text-blue-900 underline mb-3 uppercase text-[9pt] print:text-[13pt] tracking-widest flex items-center gap-2">
                   <CheckCircle2 className="w-3 h-3 text-red-600" /> Progrès réalisés
                </p>
                {data.progres.map((item, i) => <div key={i} className="pl-6 flex items-start gap-2 mb-2 font-bold text-blue-950 text-[9pt] print:text-[13pt] print:leading-[1.5] break-inside-avoid"><span>•</span><textarea className="w-full bg-transparent border-none outline-none resize-none print:p-0 print:min-h-fit" value={item} onChange={e => handleListEdit('progres', i, e.target.value)} rows={3} style={{lineHeight: '1.5'}} /></div>)}
             </div>
             )}
             {data.impacts && data.impacts.length > 0 && (
             <div className="bg-sky-50/30 p-5 rounded-xl border-l-4 border-sky-400 break-inside-avoid print:bg-transparent print:p-3 print:border-l-2">
                <p className="font-black text-sky-900 underline mb-3 uppercase text-[9pt] print:text-[13pt] tracking-widest flex items-center gap-2">
                   <Sun className="w-3 h-3 text-red-600" /> Impacts observés
                </p>
                {data.impacts.map((item, i) => <div key={i} className="pl-6 flex items-start gap-2 mb-2 font-bold text-sky-950 text-[9pt] print:text-[13pt] print:leading-[1.5] break-inside-avoid"><span>•</span><textarea className="w-full bg-transparent border-none outline-none resize-none print:p-0 print:min-h-fit" value={item} onChange={e => handleListEdit('impacts', i, e.target.value)} rows={3} style={{lineHeight: '1.5'}} /></div>)}
             </div>
             )}
             {data.defis && data.defis.length > 0 && (
             <div className="bg-red-50/30 p-5 rounded-xl border-l-4 border-red-600 break-inside-avoid print:bg-transparent print:p-3 print:border-l-2">
                <p className="font-black text-red-900 underline mb-3 uppercase text-[9pt] print:text-[13pt] tracking-widest flex items-center gap-2">
                   <Zap className="w-3 h-3 text-blue-900" /> Défis rencontrés
                </p>
                {data.defis.map((item, i) => <div key={i} className="pl-6 flex items-start gap-2 mb-2 font-bold text-red-950 text-[9pt] print:text-[13pt] print:leading-[1.5] break-inside-avoid"><span>•</span><textarea className="w-full bg-transparent border-none outline-none resize-none print:p-0 print:min-h-fit" value={item} onChange={e => handleListEdit('defis', i, e.target.value)} rows={3} style={{lineHeight: '1.5'}} /></div>)}
             </div>
             )}
          </div>
        </section>
        )}

        {hasRecommandations && (
        <section className="mt-2 mb-2">
          <h3 className="font-black mb-3 uppercase text-blue-900 text-[12pt] border-b-2 border-red-600 pb-1 flex items-center gap-2">
            <span className="bg-blue-900 text-white w-5 h-5 rounded flex items-center justify-center text-xs">4</span>
            Recommandations
          </h3>
          <div className="space-y-2 pl-2">
             {data.recommandations.map((item, i) => (
                <div key={i} className="flex items-start gap-2 bg-slate-50 p-3 rounded border-l-2 border-red-500 print:bg-transparent print:p-1.5 print:border-l break-inside-avoid">
                   <span className="text-red-600 font-black print:text-[13pt] flex-shrink-0">⭐</span>
                   <textarea
                      className="w-full bg-transparent border-none outline-none resize-none font-bold italic text-blue-900 text-[8pt] print:text-[13pt] print:leading-[1.5]"
                      value={item}
                      onChange={e => handleListEdit('recommandations', i, e.target.value)}
                      rows={3}
                      style={{lineHeight: '1.5'}}
                   />
                </div>
             ))}
          </div>
        </section>
        )}

        <div className="flex-0" />

        <div className="text-right mb-2 px-3 text-[10pt] print:text-[13pt]">
           <span className="font-black text-blue-900">Fait à Natitingou le </span>
           <input
              className="outline-none bg-blue-50 rounded px-2 py-0.5 border-none font-black text-red-600 text-[10pt] print:text-[13pt] w-56 text-center print:bg-transparent print:border-b print:border-blue-900"
              value={data.dateFait}
              onChange={e => updateData({ dateFait: e.target.value })}
              style={{lineHeight: '1.5'}}
           />
        </div>

        <div className="text-center w-full mb-1 break-inside-avoid">
           <h2 className="font-black text-[13pt] print:text-[13pt] uppercase text-blue-950 print:leading-[1.5]">
             Pour le bureau de : <br/>
             <input
               className="outline-none bg-transparent border-b border-blue-900 font-black text-red-600 text-center uppercase min-w-[250px] mt-1 text-[13pt] print:text-[13pt] print:min-w-fit break-words print:leading-[1.5]"
               value={data.bureauDe}
               onChange={e => updateData({ bureauDe: e.target.value })}
               style={{lineHeight: '1.5'}}
             />
           </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 text-center print:gap-4 print:text-[13pt] text-[9pt]">
           <div className="flex flex-col items-center break-inside-avoid">
              <div className="mb-6 print:mb-4 flex flex-col items-center">
                 <p className="text-blue-900 font-black uppercase text-[9pt] print:text-[13pt] tracking-widest border-b-2 border-red-500 px-2 pb-0.5 mb-0.5">Le/La Secrétaire</p>
                 <div className="h-16 print:h-10" />
              </div>
              <input
                 className="w-full bg-transparent border-none outline-none text-center font-black uppercase text-blue-900 text-[9pt] print:text-[13pt] print:leading-[1.5] break-words"
                 value={data.nomSecretaire}
                 onChange={e => updateData({ nomSecretaire: e.target.value })}
                 style={{lineHeight: '1.5'}}
              />
           </div>
           <div className="flex flex-col items-center break-inside-avoid">
              <div className="mb-12 print:mb-8 flex flex-col items-center">
                 <p className="text-blue-900 font-black uppercase text-[9pt] print:text-[13pt] tracking-widest border-b-2 border-red-500 px-2 pb-0.5 mb-0.5">Le/La Directeur/trice</p>
                 <div className="h-16 print:h-10" />
              </div>
              <input
                 className="w-full bg-transparent border-none outline-none text-center font-black uppercase text-blue-900 text-[9pt] print:text-[13pt] print:leading-[1.5] break-words"
                 value={data.nomDirecteur}
                 onChange={e => updateData({ nomDirecteur: e.target.value })}
                 style={{lineHeight: '1.5'}}
              />
           </div>
        </div>

        <div className="absolute bottom-10 right-10 font-black text-blue-900 opacity-20 text-sm">Page 3 • Beraca</div>
      </div>

    </div>
    </>
  );
};

export default ReportPreview;
