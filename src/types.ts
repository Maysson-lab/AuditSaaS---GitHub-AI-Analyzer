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
  { id: 'openai/gpt-4o', name: 'GPT-4o (OpenAI)' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (OpenAI)' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Anthropic)' },
  { id: 'meta-llama/llama-3.1-70b', name: 'Llama 3.1 70B (Meta)' },
  { id: 'mistralai/mixtral-8x7b', name: 'Mixtral 8x7B (Mistral AI)' },
];
