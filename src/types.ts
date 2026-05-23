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
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)' },
  { id: 'deepseek/deepseek-v4-flash:free', name: 'DeepSeek V4 Flash (Free)' },
  { id: 'google/gemma-4-31b-it:free', name: 'Gemma 4 31B (Free)' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen 3 Coder (Free)' },
  
  // Premium Models
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Pro)' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Pro)' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Pro)' },
  { id: 'meta-llama/llama-3.1-70b', name: 'Llama 3.1 70B (Pro)' },
  { id: 'mistralai/mixtral-8x7b', name: 'Mixtral 8x7B (Pro)' },
];
