import React, { useEffect, useRef, useState } from 'react';
import { Flower2, Leaf, Award, Sun, Zap, Layers, Star, Frame, Grid3X3, BookOpen, Heart, CheckCircle2 } from 'lucide-react';
import { ReportData, PTAActivity } from '../types';
import logoUrl from '../logo.jpeg';

// Composant de texte éditable...
// Cela garantit un rendu parfait pour le PDF (pas de texte coupé, retours à la ligne naturels)
const EditableBlock = ({ 
  value, 
  onChange, 
  className = "", 
  placeholder = "", 
  tagName = "div",
  style = {}
}: { 
  value: string; 
  onChange: (val: string) => void; 
  className?: string; 
  placeholder?: string;
  tagName?: "div" | "h1" | "h2" | "span" | "p";
  style?: React.CSSProperties;
}) => {
  const contentRef = useRef<HTMLElement>(null);

  // Mise à jour du contenu seulement si la valeur externe change radicalement 
  // (pour éviter de perdre la position du curseur pendant la frappe)
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== value) {
      contentRef.current.innerText = value;
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const newValue = e.currentTarget.innerText;
    onChange(newValue);
  };

  const Tag = tagName as any;

  return (
    <Tag
      ref={contentRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      className={`outline-none focus:bg-blue-50/30 focus:ring-1 focus:ring-blue-200 rounded px-1 transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 cursor-text ${className}`}
      data-placeholder={placeholder}
      style={{
        whiteSpace: 'pre-wrap',       // Respecte les retours à la ligne
        wordBreak: 'normal',          // Coupe les mots proprement
        overflowWrap: 'anywhere',     // Coupe les mots très longs si nécessaire
        hyphens: 'auto',              // Ajoute des traits d'union
        minHeight: '1.2em',           // Hauteur minimale pour pouvoir cliquer
        display: 'block',             // Comportement de bloc par défaut
        ...style
      }}
    />
  );
};

interface ReportPreviewProps {
  data: ReportData;
  updateData: (updates: Partial<ReportData>) => void;
}

export const ADLogo = ({ className = "w-full h-full" }: { className?: string }) => (
  <img
    src={logoUrl}
    alt="Logo Assemblées de Dieu"
    className={`${className} object-contain`}
  />
);

const ReportPreview: React.FC<ReportPreviewProps> = ({ data, updateData }) => {
  const hasActivites = data.activites && data.activites.length > 0;
  const hasAnalyse = (data.progres && data.progres.length > 0) || 
                      (data.impacts && data.impacts.length > 0) || 
                      (data.defis && data.defis.length > 0);
  const hasRecommandations = data.recommandations && data.recommandations.length > 0;
  
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
    <div className="flex flex-col items-center text-center font-serif text-slate-900">
       <div className="w-24 mb-6"><ADLogo /></div>
       <div>
          <h4 className="font-bold text-[14pt] uppercase text-blue-900 leading-tight">Église Évangélique Assemblée de Dieu du Bénin</h4>
          <h5 className="font-bold text-[14pt] text-sky-600 uppercase mt-1">Région de l'Atacora • Section de Natitingou</h5>
          <h5 className="font-bold text-[14pt] text-red-600 uppercase mt-1">Temple Local de Beraca</h5>
       </div>
    </div>
  );

  const titleBlock = (
     <div className="text-center mt-12 space-y-4 px-6 font-serif w-full">
        <EditableBlock
          tagName="h1"
          className="text-4xl sm:text-5xl font-black text-blue-950 tracking-tighter uppercase leading-tight text-center"
          value={data.titreRapport || "Rapport Trimestriel"}
          onChange={val => updateData({ titreRapport: val })}
        />
        <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full" />
        <EditableBlock
          tagName="div"
          className="text-xl font-bold text-sky-700 bg-transparent text-center w-full uppercase tracking-[0.2em] mt-2" 
          value={data.periodeCouverte} 
          onChange={val => updateData({ periodeCouverte: val })} 
          placeholder="PÉRIODE" 
        />
     </div>
  );

  const footerBlock = (
    <div className="absolute bottom-16 left-0 right-0 px-20">
       <div className="border-t-2 border-slate-200 pt-8 flex flex-col items-center w-full">
          <p className="text-xs uppercase font-black text-slate-400 mb-2 tracking-[0.3em]">Département</p>
          <EditableBlock
            className="text-2xl sm:text-3xl font-black text-blue-900 uppercase text-center w-full bg-transparent tracking-tight leading-tight" 
            value={data.nomDepartement} 
            onChange={val => updateData({ nomDepartement: val })} 
            placeholder="NOM DU DÉPARTEMENT" 
          />
       </div>
    </div>
  );

  const renderCover = () => {
    switch (data.coverTheme) {
      case 'official':
        return (
          <div className="a4-container page-break relative bg-white border-8 border-slate-100 shadow-xl print:shadow-none print:border-none">
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-blue-900" />
            <div className="pt-20">{headerBlock}</div>
            <div className="mt-32">{titleBlock}</div>
            {footerBlock}
          </div>
        );
      case 'prestige':
        return (
          <div className="a4-container page-break relative bg-white border-[2px] border-blue-900 p-4 shadow-xl print:shadow-none print:border-none">
            <div className="border-[1px] border-red-500 h-full w-full flex flex-col pt-16">
              {headerBlock}
              <div className="mt-24">{titleBlock}</div>
              {footerBlock}
            </div>
          </div>
        );
      case 'architect':
        return (
          <div className="a4-container page-break relative bg-white dot-pattern border border-slate-200 print:shadow-none print:border-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-900 opacity-5 rounded-bl-full" />
            <div className="pt-20">{headerBlock}</div>
            <div className="mt-20 bg-white/95 p-10 border-y-4 border-blue-900 shadow-sm">{titleBlock}</div>
            {footerBlock}
          </div>
        );
      case 'vintage':
        return (
          <div className="a4-container page-break relative bg-white border-y-[16px] border-blue-950 p-12 shadow-inner print:shadow-none print:border-none">
            <div className="border-x-2 border-slate-100 h-full w-full pt-10">
              {headerBlock}
              <div className="mt-32 scale-105">{titleBlock}</div>
              <div className="absolute bottom-32 left-0 right-0 text-center px-10">
                 <EditableBlock className="text-3xl font-serif italic text-blue-900 text-center w-full bg-transparent" value={data.nomDepartement} onChange={val => updateData({ nomDepartement: val })} />
              </div>
            </div>
          </div>
        );
      case 'spirit':
        return (
          <div className="a4-container page-break relative bg-white flex flex-col items-center p-20 print:shadow-none print:border-none">
            <div className="absolute top-10 right-10 opacity-10 text-red-500"><Heart className="w-56 h-56" /></div>
            <div className="pt-10">{headerBlock}</div>
            <div className="mt-40 border-l-8 border-red-600 pl-10 text-left w-full max-w-lg">
               <h1 className="text-6xl font-black text-blue-950 mb-2 uppercase tracking-tighter leading-none">Rapport</h1>
               <h2 className="text-3xl font-light text-sky-500 uppercase tracking-[0.4em]">Trimestriel</h2>
               <div className="mt-12">
                  <EditableBlock className="text-3xl font-black text-blue-900 bg-transparent w-full leading-tight" value={data.nomDepartement} onChange={val => updateData({ nomDepartement: val })} />
               </div>
            </div>
            <div className="absolute bottom-20 right-20 text-right">
               <EditableBlock className="text-base font-black text-slate-400 uppercase tracking-widest bg-transparent text-right" value={data.periodeCouverte} onChange={val => updateData({ periodeCouverte: val })} />
            </div>
          </div>
        );
      case 'minimalist':
        return (
          <div className="a4-container page-break relative bg-white border border-slate-50 flex flex-col items-center justify-center p-20 print:shadow-none print:border-none">
            {headerBlock}
            <div className="mt-12 w-full text-center">
                <h1 className="text-4xl font-light text-slate-900 uppercase tracking-[0.5em] mb-4">RAPPORT</h1>
                <h2 className="text-2xl font-bold text-red-600 uppercase tracking-widest mb-12">Trimestriel</h2>
                <div className="w-20 h-1 bg-blue-900 mb-12 mx-auto" />
                <EditableBlock className="text-3xl font-black text-blue-950 uppercase text-center w-full bg-transparent" value={data.nomDepartement} onChange={val => updateData({ nomDepartement: val })} placeholder="DÉPARTEMENT" />
                <EditableBlock className="mt-4 text-sm text-sky-500 bg-transparent text-center w-full italic font-bold" value={data.periodeCouverte} onChange={val => updateData({ periodeCouverte: val })} placeholder="Période" />
            </div>
          </div>
        );
      case 'royal':
        return (
          <div className="a4-container page-break relative bg-white border-[10px] border-double border-blue-900 p-8 shadow-2xl print:shadow-none print:border-none">
            <div className="border-2 border-sky-100 h-full w-full flex flex-col items-center pt-16">
               {headerBlock}
               <div className="mt-12 text-center w-full">
                   <h1 className="text-5xl font-black text-blue-950 mb-4">RAPPORT</h1>
                   <h2 className="text-2xl font-serif italic text-red-600 mb-24 uppercase tracking-widest">Trimestriel</h2>
                   <div className="w-full px-12 text-center">
                      <EditableBlock className="text-4xl font-black text-blue-900 uppercase tracking-tighter bg-transparent w-full leading-tight" value={data.nomDepartement} onChange={val => updateData({ nomDepartement: val })} />
                   </div>
                   <div className="mt-20">
                      <EditableBlock className="text-xl font-bold text-blue-950 bg-transparent text-center w-full tracking-widest" value={data.periodeCouverte} onChange={val => updateData({ periodeCouverte: val })} />
                   </div>
               </div>
            </div>
          </div>
        );
      case 'celestial':
        return (
          <div className="a4-container page-break relative bg-white border border-sky-100 overflow-hidden p-20 flex flex-col items-center print:shadow-none print:border-none">
             <div className="absolute -top-20 -right-20 opacity-20 text-sky-400 rotate-12"><Star className="w-96 h-96" /></div>
             <div className="relative z-10">{headerBlock}</div>
             <div className="mt-16 text-center relative z-10 w-full">
                 <h1 className="text-7xl font-black text-blue-950 tracking-tighter leading-none mb-4">RAPPORT</h1>
                 <h2 className="text-4xl font-light text-sky-500 uppercase tracking-widest italic mb-24">Trimestriel</h2>
                 <div className="border-y-4 border-blue-900 py-10 w-full">
                    <EditableBlock className="text-4xl font-black text-blue-900 uppercase tracking-widest bg-transparent text-center w-full leading-tight" value={data.nomDepartement} onChange={val => updateData({ nomDepartement: val })} placeholder="DÉPARTEMENT" />
                 </div>
                 <EditableBlock className="mt-12 text-2xl font-bold text-sky-600 bg-transparent text-center w-full" value={data.periodeCouverte} onChange={val => updateData({ periodeCouverte: val })} />
             </div>
          </div>
        );
      case 'eco':
        return (
          <div className="a4-container page-break relative bg-white border-4 border-dashed border-slate-200 flex flex-col items-center p-20 line-pattern print:shadow-none print:border-none">
             <div className="mb-10 text-blue-700 opacity-60"><Leaf className="w-12 h-12" /></div>
             {headerBlock}
             <div className="text-center space-y-4 mb-16 mt-12 w-full">
                <h1 className="text-6xl font-black text-blue-900 tracking-tight uppercase">RAPPORT</h1>
                <p className="text-red-600 uppercase font-black tracking-[0.5em] text-xs">Service & Intégrité</p>
             </div>
             <div className="w-full space-y-12 bg-white/95 p-10 rounded-3xl shadow-lg border border-slate-50">
                <div className="flex flex-col border-l-8 border-blue-900 pl-8">
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] mb-1">Secteur Administratif</p>
                   <EditableBlock className="text-4xl font-black text-blue-900 uppercase bg-transparent w-full leading-tight" value={data.nomDepartement} onChange={val => updateData({ nomDepartement: val })} />
                </div>
                <div className="flex flex-col border-l-8 border-sky-400 pl-8">
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] mb-1">Période du Rapport</p>
                   <EditableBlock className="text-2xl font-bold text-sky-700 bg-transparent w-full" value={data.periodeCouverte} onChange={val => updateData({ periodeCouverte: val })} />
                </div>
             </div>
          </div>
        );
      case 'ethereal':
        return (
          <div className="a4-container page-break relative bg-white text-center flex flex-col items-center pt-24 overflow-hidden print:shadow-none print:border-none">
            <div className="absolute top-0 left-0 text-sky-50 opacity-50"><Flower2 className="w-80 h-80 rotate-45" /></div>
            <div className="relative z-10 w-full px-12">
               {headerBlock}
               <div className="mt-16 w-full">
                   <h1 className="text-7xl font-serif italic text-blue-950 leading-none">Rapport Trimestriel</h1>
                   <div className="w-24 h-1.5 bg-red-500 mx-auto mt-8 rounded-full" />
                   <EditableBlock className="mt-12 text-xl font-bold text-sky-600 tracking-widest bg-transparent text-center w-full italic" value={data.periodeCouverte} onChange={val => updateData({ periodeCouverte: val })} />
                   <div className="mt-32 border-l-8 border-blue-900 pl-10 text-left max-w-lg mx-auto bg-slate-50/50 py-6 rounded-r-2xl">
                      <EditableBlock className="text-4xl font-black text-blue-950 uppercase tracking-tighter bg-transparent w-full leading-none" value={data.nomDepartement} onChange={val => updateData({ nomDepartement: val })} />
                   </div>
               </div>
            </div>
          </div>
        );
      case 'stainedglass':
        return (
          <div className="a4-container page-break relative bg-white border-4 border-blue-900 p-3 shadow-2xl print:shadow-none print:border-none">
             <div className="border border-red-500 h-full w-full flex flex-col p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 -mr-16 -mt-16 rotate-45" />
                <div className="flex flex-col items-center text-center relative z-10 mb-12">
                   <div className="w-24 mb-4"><ADLogo /></div>
                   <h4 className="font-bold text-[14pt] uppercase text-blue-900 leading-tight">Église Évangélique Assemblée de Dieu du Bénin</h4>
                   <h5 className="font-bold text-[14pt] text-sky-600 uppercase mt-1">Région de l'Atacora • Section de Natitingou</h5>
                   <h5 className="font-bold text-[14pt] text-red-600 uppercase mt-1">Temple Local de Beraca</h5>
                </div>
                <div className="flex justify-center items-center relative z-10 w-full">
                   <div className="text-center">
                      <h1 className="text-6xl font-black text-blue-950 leading-none">RAPPORT</h1>
                      <h2 className="text-3xl font-bold text-red-600 italic mt-2 uppercase tracking-widest">Trimestriel</h2>
                   </div>
                </div>
                <div className="mt-24 border-y-4 border-blue-900 py-16 w-full flex items-center justify-center bg-blue-50/30 relative z-10">
                    <EditableBlock className="text-5xl font-black text-blue-900 uppercase px-10 text-center bg-transparent w-full leading-tight" value={data.nomDepartement} onChange={val => updateData({ nomDepartement: val })} />
                </div>
                <div className="mt-16 text-center relative z-10">
                    <EditableBlock className="text-2xl font-black text-sky-800 uppercase tracking-[0.3em] bg-transparent text-center w-full" value={data.periodeCouverte} onChange={val => updateData({ periodeCouverte: val })} />
                </div>
             </div>
          </div>
        );
      case 'modern':
        return (
          <div className="a4-container page-break relative bg-white border-none p-0 shadow-2xl print:shadow-none print:border-none">
             <div className="h-6 bg-blue-900 w-full" />
             <div className="p-20 flex flex-col h-full">
                <div className="flex justify-between items-start mb-24">
                   <div className="w-24"><ADLogo /></div>
                   <div className="text-right flex flex-col">
                      <h4 className="font-bold text-[14pt] uppercase text-blue-900 leading-tight">Église Évangélique Assemblée de Dieu du Bénin</h4>
                      <h5 className="font-bold text-[14pt] text-sky-600 uppercase mt-1">Région de l'Atacora • Section de Natitingou</h5>
                      <h5 className="font-bold text-[14pt] text-red-600 uppercase mt-1">Temple Local de Beraca</h5>
                   </div>
                </div>
                <h1 className="text-8xl font-black text-blue-950 mb-2 uppercase tracking-tighter leading-none">Rapport</h1>
                <h2 className="text-5xl font-light text-sky-400 uppercase tracking-[0.2em] mb-12">Trimestriel</h2>
                <div className="flex-1" />
                <div className="space-y-6">
                   <EditableBlock className="text-6xl font-black text-blue-900 uppercase bg-transparent w-full p-0 leading-[1.1]" value={data.nomDepartement} onChange={val => updateData({ nomDepartement: val })} />
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-2 bg-red-600 rounded-full" />
                      <EditableBlock className="text-2xl font-bold text-sky-600 uppercase tracking-widest bg-transparent p-0" value={data.periodeCouverte} onChange={val => updateData({ periodeCouverte: val })} />
                   </div>
                </div>
             </div>
          </div>
        );
      default:
        // Si aucun thème correspondant n'est trouvé, utiliser le thème officiel par défaut
        return (
          <div className="a4-container page-break relative bg-white border-8 border-slate-100 shadow-xl print:shadow-none print:border-none">
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-blue-900" />
            <div className="pt-20">{headerBlock}</div>
            <div className="mt-32">{titleBlock}</div>
            {footerBlock}
          </div>
        );
    }
  };

  return (
    <div id="report-content" className="flex flex-col gap-8 print:gap-0 bg-slate-50 report-typography pb-10 print:pb-0 break-words">

      {/* PAGE 1: GARDE */}
      {renderCover()}

      {/* PAGE 2: CONTENU PRINCIPAL */}
      <div className="a4-container page-break relative bg-white p-12 text-slate-900 shadow-xl print:shadow-none print:border-none print:p-8 flex flex-col">
        <h2 className="font-serif font-black text-2xl uppercase mb-6 text-center text-blue-900 border-b-2 border-red-600 pb-2 leading-tight">
          RAPPORT TRIMESTRIEL DE : {data.nomDepartement || "...................."}
        </h2>

        <div className="space-y-2 mb-6 bg-blue-50/30 p-6 rounded-lg border border-blue-100 print:bg-transparent print:border-none print:p-0 text-[14pt]">
           <div className="flex items-baseline gap-2">
             <span className="font-bold text-blue-900 uppercase whitespace-nowrap min-w-fit">Département :</span>
             <EditableBlock
                tagName="span"
                className="flex-1 font-black text-red-600 leading-tight text-[14pt]"
                value={data.nomDepartement}
                onChange={val => updateData({ nomDepartement: val })}
             />
           </div>
           <div className="flex items-baseline gap-2">
             <span className="font-bold text-blue-900 uppercase whitespace-nowrap min-w-fit">Période :</span>
             <EditableBlock
                tagName="span"
                className="flex-1 text-sky-700 font-bold text-[14pt]"
                value={data.periodeCouverte}
                onChange={val => updateData({ periodeCouverte: val })}
             />
           </div>
           <div className="flex items-baseline gap-2">
             <span className="font-bold text-blue-900 uppercase whitespace-nowrap min-w-fit">Responsable :</span>
             <EditableBlock
                tagName="span"
                className="flex-1 text-slate-800 font-bold text-[14pt]"
                value={data.responsableNom}
                onChange={val => updateData({ responsableNom: val })}
             />
           </div>
           <div className="flex items-baseline gap-2">
             <span className="font-bold text-blue-900 uppercase whitespace-nowrap min-w-fit">Contact :</span>
             <EditableBlock
                tagName="span"
                className="flex-1 text-slate-800 font-bold text-[14pt]"
                value={data.responsableContact || ''}
                onChange={val => updateData({ responsableContact: val })}
             />
           </div>
        </div>

        <section className="mb-6">
          <h3 className="font-black mb-3 uppercase text-blue-900 text-lg border-b border-sky-200 pb-1 flex items-center gap-2">
            <span className="bg-blue-900 text-white w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
            <span>Introduction</span>
          </h3>
          <EditableBlock
            className="w-full text-justify bg-blue-50/20 rounded-lg p-4 text-blue-950 font-serif text-[15pt] leading-[1.6] print:bg-transparent print:p-0 print:text-justify"
            value={data.introductionAnalyse}
            onChange={val => updateData({ introductionAnalyse: val })}
            placeholder="Introduction détaillée ici..."
          />
        </section>

        {hasActivites && (
        <section className="flex-1">
          <h3 className="font-black mb-3 uppercase text-blue-900 text-lg border-b border-sky-200 pb-1 flex items-center gap-2">
            <span className="bg-blue-900 text-white w-6 h-6 rounded flex items-center justify-center text-xs">2</span>
            <span>Suivi des Activités</span>
          </h3>
          <div className="overflow-hidden">
            <table className="w-full border-collapse border border-blue-900 text-[12pt] print:text-[12pt]">
              <thead className="bg-blue-900 text-white">
                <tr className="font-bold text-center uppercase text-[12pt]">
                  <th className="p-2 w-[4%] border border-blue-800">N°</th>
                  <th className="p-2 w-[30%] border border-blue-800">Objectifs</th>
                  <th className="p-2 w-[16%] border border-blue-800">Réalisé</th>
                  <th className="p-2 w-[16%] border border-blue-800">Résultats</th>
                  <th className="p-2 w-[11%] border border-blue-800">Indicateurs</th>
                  <th className="p-2 w-[23%] border border-blue-800">Observations</th>
                </tr>
              </thead>
              <tbody>
                {data.activites.map((act, i) => (
                  <tr key={act.id} className="text-[12pt]">
                    <td className="p-2 text-center font-bold text-blue-900 border border-blue-200 bg-blue-50/30 print:bg-transparent">{i+1}</td>
                    <td className="p-2 border border-blue-200"><EditableBlock className="text-blue-950" value={act.objectifs} onChange={val => handleActivityEdit(act.id, 'objectifs', val)} /></td>
                    <td className="p-2 text-center font-bold text-red-600 border border-blue-200 bg-red-50/10 print:bg-transparent"><EditableBlock className="text-center" value={act.realisations} onChange={val => handleActivityEdit(act.id, 'realisations', val)} /></td>
                    <td className="p-2 text-center font-bold text-sky-700 border border-blue-200 bg-sky-50/10 print:bg-transparent"><EditableBlock className="text-center" value={act.resultats} onChange={val => handleActivityEdit(act.id, 'resultats', val)} /></td>
                    <td className="p-2 border border-blue-200"><EditableBlock className="text-slate-700" value={act.indicateurs} onChange={val => handleActivityEdit(act.id, 'indicateurs', val)} /></td>
                    <td className="p-2 italic border border-blue-200 bg-slate-50/20 print:bg-transparent"><EditableBlock className="text-slate-500" value={act.observations} onChange={val => handleActivityEdit(act.id, 'observations', val)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}

        <div className="absolute bottom-4 right-8 font-bold text-blue-900 opacity-30 text-xs font-serif">Page 1 • Beraca</div>
      </div>

      {/* PAGE 3: ANALYSE ET IMPACT + RECOMMANDATIONS + SIGNATURES */}
      <div className="a4-container page-break relative bg-white p-12 text-slate-900 shadow-xl print:shadow-none print:border-none print:p-8 flex flex-col">
        
        {hasAnalyse && (
        <section className="space-y-6 mb-8">
          <h3 className="font-black uppercase text-blue-900 text-xl border-b-2 border-sky-200 flex items-center gap-3 pb-2">
            <span className="bg-blue-900 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">3</span>
            Analyse et Impact
          </h3>
          <div className="space-y-4 pl-2">
             {data.progres && data.progres.length > 0 && (
             <div className="bg-blue-50/30 p-5 rounded-xl border-l-4 border-blue-900 print:bg-transparent print:p-0 print:pl-4 print:border-l-2">
                <p className="font-black text-blue-900 underline mb-2 uppercase text-sm tracking-widest flex items-center gap-2">
                   <CheckCircle2 className="w-4 h-4 text-red-600" /> Progrès réalisés
                </p>
                {data.progres.map((item, i) => <div key={i} className="pl-6 flex items-start gap-2 mb-1 font-medium text-blue-950 text-[14pt]"><span>•</span><EditableBlock value={item} onChange={val => handleListEdit('progres', i, val)} /></div>)}
             </div>
             )}
             {data.impacts && data.impacts.length > 0 && (
             <div className="bg-sky-50/30 p-5 rounded-xl border-l-4 border-sky-400 print:bg-transparent print:p-0 print:pl-4 print:border-l-2">
                <p className="font-black text-sky-900 underline mb-2 uppercase text-sm tracking-widest flex items-center gap-2">
                   <Sun className="w-4 h-4 text-red-600" /> Impacts observés
                </p>
                {data.impacts.map((item, i) => <div key={i} className="pl-6 flex items-start gap-2 mb-1 font-medium text-sky-950 text-[14pt]"><span>•</span><EditableBlock value={item} onChange={val => handleListEdit('impacts', i, val)} /></div>)}
             </div>
             )}
             {data.defis && data.defis.length > 0 && (
             <div className="bg-red-50/30 p-5 rounded-xl border-l-4 border-red-600 print:bg-transparent print:p-0 print:pl-4 print:border-l-2">
                <p className="font-black text-red-900 underline mb-2 uppercase text-sm tracking-widest flex items-center gap-2">
                   <Zap className="w-4 h-4 text-blue-900" /> Défis rencontrés
                </p>
                {data.defis.map((item, i) => <div key={i} className="pl-6 flex items-start gap-2 mb-1 font-medium text-red-950 text-[14pt]"><span>•</span><EditableBlock value={item} onChange={val => handleListEdit('defis', i, val)} /></div>)}
             </div>
             )}
          </div>
        </section>
        )}

        {hasRecommandations && (
        <section className="mb-8">
          <h3 className="font-black mb-4 uppercase text-blue-900 text-xl border-b-2 border-red-600 pb-1 flex items-center gap-2">
            <span className="bg-blue-900 text-white w-6 h-6 rounded flex items-center justify-center text-xs">4</span>
            Recommandations
          </h3>
          <div className="space-y-3 pl-2">
             {data.recommandations.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded border-l-4 border-red-500 print:bg-transparent print:p-0 print:pl-4 print:border-l-2">
                   <span className="text-red-600 font-bold text-lg flex-shrink-0">⭐</span>
                   <EditableBlock
                      className="font-bold italic text-blue-900 text-[14pt]"
                      value={item}
                      onChange={val => handleListEdit('recommandations', i, val)}
                   />
                </div>
             ))}
          </div>
        </section>
        )}

        <div className="flex-1" />

        <div className="text-center mb-4 px-4 font-serif w-full flex justify-center items-center gap-2 text-[14pt]">
           <span className="font-black text-blue-900">Fait à Natitingou le </span>
           <EditableBlock
              tagName="span"
              className="bg-blue-50 rounded px-2 py-0.5 font-black text-red-600 w-48 text-center inline-block align-middle print:bg-transparent print:border-b print:border-blue-900"
              value={data.dateFait}
              onChange={val => updateData({ dateFait: val })}
           />
        </div>

        <div className="text-center w-full mb-8 font-serif">
           <h2 className="font-black text-lg uppercase text-blue-950">
             Pour le bureau de : <br/>
             <EditableBlock
               tagName="div"
               className="font-black text-red-600 text-center uppercase min-w-[250px] mt-2 border-b-2 border-dotted border-blue-900 mx-auto"
               value={data.bureauDe}
               onChange={val => updateData({ bureauDe: val })}
             />
           </h2>
        </div>

        <div className="grid grid-cols-2 gap-12 text-center font-serif text-[14pt]">
           <div className="flex flex-col items-center">
              <div className="mb-16 flex flex-col items-center w-full">
                 <p className="text-blue-900 font-black uppercase text-sm tracking-widest border-b-2 border-red-500 px-4 pb-1 mb-1">Le/La Secrétaire</p>
                 <div className="h-20 w-full" />
              </div>
              <EditableBlock
                 tagName="div"
                 className="text-center font-black uppercase text-blue-900 w-full"
                 value={data.nomSecretaire}
                 onChange={val => updateData({ nomSecretaire: val })}
                 placeholder="NOM PRÉNOMS"
              />
           </div>
           <div className="flex flex-col items-center">
              <div className="mb-16 flex flex-col items-center w-full">
                 <p className="text-blue-900 font-black uppercase text-sm tracking-widest border-b-2 border-red-500 px-4 pb-1 mb-1">Le/La Directeur/trice</p>
                 <div className="h-20 w-full" />
              </div>
              <EditableBlock
                 tagName="div"
                 className="text-center font-black uppercase text-blue-900 w-full"
                 value={data.nomDirecteur}
                 onChange={val => updateData({ nomDirecteur: val })}
                 placeholder="NOM PRÉNOMS"
              />
           </div>
        </div>

        <div className="absolute bottom-4 right-8 font-bold text-blue-900 opacity-30 text-xs font-serif">Page 2 • Beraca</div>
      </div>

    </div>
  );
};

export default ReportPreview;

