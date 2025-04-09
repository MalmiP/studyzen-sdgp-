export interface Quiz {
    _id?: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    timeLimit: number;
    questions: Question[];
    createdBy?: string;
    createdAt?: Date;
  }
  
  export interface Question {
    questionText: string;
    questionType: 'multiple-choice' | 'true-false';
    options: string[];
    correctAnswer: string;
    marks: number;
  }