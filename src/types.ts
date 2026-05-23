export interface AuditReport {
  id: string;
  repoUrl: string;
  date: string;
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  security: {
    score: number;
    notes: string;
  };
  architecture: {
    score: number;
    notes: string;
  };
  recommendations: string[];
}

export interface AnalysisData {
  repoUrl: string;
  model: string;
}

export const SUPPORTED_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' }
];
