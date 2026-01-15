
import React, { useState, useCallback, useEffect } from 'react';
import { FileDown, RotateCcw, Save, Upload, Edit3, Eye, CheckCircle2, FileSpreadsheet, FileText, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportData, INITIAL_DATA } from './types';
import ReportForm from './components/ReportForm';
import ReportPreview, { ADLogo } from './components/ReportPreview';

const App: React.FC = () => {
  const [view, setView] = useState<'edition' | 'preview'>('edition');
  const [data, setData] = useState<ReportData>(() => {
    const saved = localStorage.getItem('beraca_report_v3_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('beraca_report_v3_data', JSON.stringify(data));
  }, [data]);

  const updateData = useCallback((updates: Partial<ReportData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const handlePrint = () => {
    // S'assurer que les données sont à jour avant l'impression
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExportPDF = async () => {
    const pages = document.querySelectorAll('.a4-container');
    if (pages.length === 0) {
      alert('Erreur : Aucune page trouvée');
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 10; // 1cm de marge
      const targetWidth = 210 - (2 * margin); // 190mm
      const targetHeight = 297 - (2 * margin); // 277mm

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        // Capture de la page individuelle
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        
        if (i > 0) {
          pdf.addPage();
        }

        // Ajout de l'image avec marges de 10mm
        pdf.addImage(imgData, 'JPEG', margin, margin, targetWidth, targetHeight);
      }

      pdf.save(`Rapport_${data.nomDepartement || 'AD'}_${data.annee}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rapport_${data.nomDepartement || 'AD'}_${data.annee}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    let csv = "\uFEFF"; // BOM pour UTF-8
    csv += "N°;Objectifs / Activites prevues;Realisations;Resultats obtenus;Indicateurs de performance;Observations / Difficultes\n";
    
    data.activites.forEach((act, i) => {
      const row = [
        i + 1,
        `"${act.objectifs.replace(/"/g, '""')}"`,
        `"${act.realisations.replace(/"/g, '""')}"`,
        `"${act.resultats.replace(/"/g, '""')}"`,
        `"${act.indicateurs.replace(/"/g, '""')}"`,
        `"${act.observations.replace(/"/g, '""')}"`
      ];
      csv += row.join(";") + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Suivi_PTA_${data.nomDepartement || 'AD'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWord = () => {
    const content = document.getElementById('report-container')?.innerHTML;
    if (!content) return;

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Rapport Trimestriel</title>
      <style>
        body { font-family: 'Cambria', serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid black; padding: 5px; }
      </style>
      </head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rapport_${data.nomDepartement || 'AD'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re: ProgressEvent<FileReader>) => {
        try {
          if (re.target?.result) {
            const content = JSON.parse(re.target.result as string);
            // Basic validation to ensure it's likely a report file
            if (content && typeof content === 'object') {
               setData(prev => ({ ...INITIAL_DATA, ...content })); // Merge with initial data to ensure all fields exist
               setView('edition');
               alert("Données importées avec succès !");
            } else {
               throw new Error("Format invalide");
            }
          }
        } catch (err) {
          console.error("Erreur import:", err);
          alert("Erreur : Le fichier n'est pas un format de sauvegarde valide.");
        } finally {
           // Reset input value to allow re-importing the same file
           e.target.value = '';
        }
      };
      reader.readAsText(file);
    }
  };

  const resetData = () => {
    if (confirm("Attention : Cela effacera toutes les données actuelles. Voulez-vous continuer ?")) {
      setData(INITIAL_DATA);
      setView('edition');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-200">
      <nav className="no-print bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shadow-md rounded-xl overflow-hidden border border-slate-100 p-1 bg-white">
              <ADLogo />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-slate-900 text-lg tracking-tighter leading-none uppercase">Beraca Report</h1>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1 italic">Gestion Administrative</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button onClick={() => setView('edition')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${view === 'edition' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <Edit3 className="w-4 h-4" /> Édition
            </button>
            <button onClick={() => setView('preview')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${view === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <Eye className="w-4 h-4" /> Aperçu Final
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleExportJSON} title="Sauvegarder JSON" className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
               <Save className="w-5 h-5" />
            </button>
            <button onClick={handleExportExcel} title="Export Excel" className="p-2.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100">
               <FileSpreadsheet className="w-5 h-5" />
            </button>
            <button onClick={handleExportWord} title="Export Word" className="p-2.5 text-slate-500 hover:text-blue-800 hover:bg-blue-100 rounded-xl transition-all border border-transparent hover:border-blue-200">
               <FileText className="w-5 h-5" />
            </button>
            <button onClick={resetData} title="Réinitialiser" className="p-2.5 text-slate-400 hover:text-red-600 transition-all hover:bg-red-50 rounded-xl">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={handleExportPDF} title="Télécharger PDF directement" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase transition-all shadow-xl shadow-green-200 active:scale-95">
              <Download className="w-4 h-4" /> Télécharger PDF
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase transition-all shadow-xl shadow-blue-200 active:scale-95 ml-2">
              <FileDown className="w-4 h-4" /> Imprimer
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-10 px-6">
          {view === 'edition' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
               <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-8 py-8 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Formulaire de Saisie</h2>
                      <p className="text-sm text-slate-500 mt-1">Remplissez les champs ci-dessous pour générer votre rapport.</p>
                    </div>
                    <label className="cursor-pointer flex items-center gap-2 bg-white border border-slate-200 text-blue-600 font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95">
                       <Upload className="w-4 h-4" /> Importer Sauvegarde
                       <input type="file" onChange={handleImport} className="hidden" accept=".json" />
                    </label>
                  </div>
                  <div className="p-10"><ReportForm data={data} updateData={updateData} /></div>
               </div>
            </div>
          ) : (
            <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center gap-10">
               <div className="bg-white text-slate-600 px-8 py-4 rounded-2xl text-xs font-bold border border-slate-200 flex items-center gap-4 no-print shadow-sm">
                  <div className="bg-green-100 text-green-600 p-2 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
                  <p><strong>Mode Aperçu Interactif :</strong> Toutes les modifications effectuées ici sont enregistrées. Cliquez sur <strong>PDF</strong> pour exporter.</p>
               </div>
               <div id="report-container">
                  <ReportPreview data={data} updateData={updateData} />
               </div>
               <div className="no-print pb-20 pt-10 flex gap-4">
                  <button onClick={() => setView('edition')} className="px-8 py-4 bg-slate-200 text-slate-700 rounded-2xl font-black uppercase text-xs hover:bg-slate-300 transition-all">Retourner à l'édition</button>
                  <button onClick={handlePrint} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-2xl shadow-blue-300 hover:bg-blue-700 transition-all">Télécharger en PDF</button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
