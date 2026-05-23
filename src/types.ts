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
  { id: 'qwen/qwen3-coder:free', name: 'Qwen 3 Coder (Gratuit)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Gratuit)' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B (Gratuit)' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Gratuit)' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Gratuit)' }
];
