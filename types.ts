
export enum QuestionType {
  MULTIPLE_CHOICE = 'MCQ',
  PHRASE_CLOZE = 'PHRASE',
  ERROR_DETECTION = 'ERROR',
  TRUE_FALSE = 'TF',
  SPELLING = 'spelling_correction'
}

export interface Question {
  id: string;
  type: string; // Allow flexible strings like 'spelling_correction'
  question: string; // Matches user JSON
  options: string[] | null; // Matches user JSON
  answer: string; // Matches user JSON
  category: string; // Matches user JSON
  original_text?: string; // Matches user JSON
  explanation?: string;
  isAI?: boolean;
}

export interface UserRecord {
  timestamp: number;
  questionId: string;
  isCorrect: boolean;
  userAnswer: string;
  category: string;
}

export interface Statistics {
  totalAttempted: number;
  correctCount: number;
  categoryAccuracy: Record<string, { attempted: number; correct: number }>;
}

export enum AppMode {
  LEARNER = 'LEARNER',
  PARENT = 'PARENT'
}

export enum QuizMode {
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED'
}
