
export interface PTAActivity {
  id: string;
  objectifs: string;
  realisations: string;
  resultats: string;
  indicateurs: string;
  observations: string;
}

export type CoverTheme = 
  | 'official' 
  | 'modern' 
  | 'minimalist' 
  | 'celestial' 
  | 'stainedglass' 
  | 'ethereal' 
  | 'royal' 
  | 'eco' 
  | 'prestige' 
  | 'architect' 
  | 'vintage' 
  | 'spirit';

export interface ReportData {
  trimestreDebut: string;
  trimestreFin: string;
  annee: string;
  titreRapport: string;
  nomDepartement: string;
  periodeCouverte: string;
  responsableNom: string;
  responsableContact: string;
  introductionAnalyse: string;
  activites: PTAActivity[];
  progres: string[];
  impacts: string[];
  defis: string[];
  recommandations: string[];
  dateFait: string;
  bureauDe: string;
  nomSecretaire: string;
  nomDirecteur: string;
  coverTheme: CoverTheme;
}

export const INITIAL_DATA: ReportData = {
  trimestreDebut: '',
  trimestreFin: '',
  annee: '2026',
  titreRapport: 'RAPPORT TRIMESTRIEL',
  nomDepartement: '',
  periodeCouverte: '',
  responsableNom: '',
  responsableContact: '',
  introductionAnalyse: '',
  activites: [{ id: '1', objectifs: '', realisations: '', resultats: '', indicateurs: '', observations: '' }],
  progres: [''],
  impacts: [''],
  defis: [''],
  recommandations: [''],
  dateFait: new Date().toLocaleDateString('fr-FR'),
  bureauDe: '',
  nomSecretaire: '',
  nomDirecteur: '',
  coverTheme: 'official',
};
