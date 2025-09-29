export interface CandidateAnswer {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  finalScore: number;
  aiSummary: string;
  interviewDate: string;
  answers: CandidateAnswer[];
}

export interface CandidatesResponse {
  candidates: Candidate[];
  total: number;
}