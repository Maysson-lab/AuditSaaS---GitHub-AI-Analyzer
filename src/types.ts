export interface AuditReport {
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
  // Free / Highly Performant Models
  { id: 'google/gemini-2.0-flash-lite-preview-02-05:free', name: 'Gemini 2.0 Flash Lite (Free)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)' },
  { id: 'microsoft/phi-3-mini-128k-instruct:free', name: 'Phi-3 Mini (Free)' },
  
  // Premium Models
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Pro)' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Pro)' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Pro)' },
  { id: 'meta-llama/llama-3.1-70b', name: 'Llama 3.1 70B (Pro)' },
  { id: 'mistralai/mixtral-8x7b', name: 'Mixtral 8x7B (Pro)' },
];
