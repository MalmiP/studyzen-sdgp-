import { z } from 'zod';

export const QuestionSchema = z.object({
  questionText: z.string()
    .min(1, "Question text is required")
    .max(1000, "Question text is too long"),
  questionType: z.enum(['multiple-choice', 'true-false']),
  options: z.array(z.string())
    .min(2, "At least two options are required")
    .max(6, "Maximum 6 options allowed"),
  correctAnswer: z.string()
    .min(1, "Correct answer is required"),
  marks: z.number()
    .min(1, "Marks must be at least 1")
    .max(100, "Marks cannot exceed 100")
  
}).refine((data) => {
  return data.options.includes(data.correctAnswer);
}, {
  message: "Correct answer must be one of the options",
  path: ["correctAnswer"]
});

export const QuizSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title is too long"),
  description: z.string()
    .min(1, "Description is required")
    .max(2000, "Description is too long"),
  category: z.string()
    .min(1, "Category is required")
    .max(50, "Category name is too long"),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  timeLimit: z.number()
    .min(1, "Time limit must be at least 1 minute")
    .max(180, "Time limit cannot exceed 180 minutes"),
  questions: z.array(QuestionSchema)
    .min(1, "At least one question is required")
    .max(50, "Maximum 50 questions allowed")
});