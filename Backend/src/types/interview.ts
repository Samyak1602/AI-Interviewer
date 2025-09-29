export interface InterviewQuestion {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionNumber: number;
  totalQuestions: number;
}

export interface QuestionEvaluation {
  score: number;
  feedback: string;
  question: string;
  answer: string;
}

export interface InterviewItem {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answer: string;
  score: number;
  feedback: string;
}

export interface InterviewHistory {
  questionCount: number;
  questions: InterviewItem[];
}

export interface InterviewSummary {
  finalScore: number;
  summary: string;
  totalQuestions: number;
  averageScore: number;
}

export interface ClaudeResponse {
  question?: string;
  difficulty?: string;
  score?: number;
  feedback?: string;
  finalScore?: number;
  summary?: string;
}