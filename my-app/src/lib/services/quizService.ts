import axios from 'axios';
import type { Quiz } from '@/lib/types/quiz';

class QuizServiceError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'QuizServiceError';
  }
}

export const quizService = {
  async getAllQuizzes(): Promise<Quiz[]> {
    try {
      console.log('Service: Making request to /api/quiz');
      const response = await axios.get<Quiz[]>('/api/quiz');
      console.log('Service: Response received', response.status);
      return response.data;
    } catch (error: any) {
      console.error('Service: Error in getAllQuizzes:', error);
      if (error.isAxiosError) {
        const errorDetails = error.response?.data?.details || '';
        throw new QuizServiceError(
          `Failed to fetch quizzes: ${error.response?.data?.error || error.message} ${errorDetails ? `(${errorDetails})` : ''}`,
          error.response?.status
        );
      }
      throw error;
    }
  },

  async getQuizById(id: string): Promise<Quiz> {
    try {
      const response = await axios.get<Quiz>(`/api/quiz/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.isAxiosError) {
        if (error.response?.status === 404) {
          throw new QuizServiceError('Quiz not found', 404);
        }
        throw new QuizServiceError(
          error.response?.data?.error || 'Failed to fetch quiz',
          error.response?.status
        );
      }
      throw error;
    }
  },

  async createQuiz(quizData: Omit<Quiz, '_id'>): Promise<Quiz> {
    try {
      // Validate questions to ensure correctAnswer is set
      quizData.questions.forEach((question, index) => {
        if (!question.options.includes(question.correctAnswer)) {
          throw new QuizServiceError(`Question ${index + 1} must have a valid correct answer selected from the options`);
        }
        
        if (question.marks <= 0) {
          throw new QuizServiceError(`Question ${index + 1} must have a positive mark value`);
        }
      });
      
      const response = await axios.post<Quiz>('/api/quiz', quizData);
      return response.data;
    } catch (error: any) {
      if (error instanceof QuizServiceError) {
        throw error;
      }
      
      if (error.isAxiosError) {
        throw new QuizServiceError(
          error.response?.data?.error || 'Failed to create quiz',
          error.response?.status
        );
      }
      throw error;
    }
  },

  async updateQuiz(id: string, quizData: Partial<Quiz>): Promise<Quiz> {
    try {
      const response = await axios.put<Quiz>(`/api/quiz/${id}`, quizData);
      return response.data;
    } catch (error: any) {
      if (error.isAxiosError) {
        if (error.response?.status === 404) {
          throw new QuizServiceError('Quiz not found', 404);
        }
        throw new QuizServiceError(
          error.response?.data?.error || 'Failed to update quiz',
          error.response?.status
        );
      }
      throw error;
    }
  },

  async deleteQuiz(id: string): Promise<void> {
    try {
      await axios.delete(`/api/quiz/${id}`);
    } catch (error: any) {
      if (error.isAxiosError) {
        if (error.response?.status === 404) {
          throw new QuizServiceError('Quiz not found', 404);
        }
        throw new QuizServiceError(
          error.response?.data?.error || 'Failed to delete quiz',
          error.response?.status
        );
      }
      throw error;
    }
  },

  async submitQuiz(
    quizId: string,
    answers: string[],
    userId: string
  ): Promise<{
    score: number;
    maxScore: number;
    submission: string;
  }> {
    try {
      const response = await axios.post('/api/quiz/submit', {
        quizId,
        answers,
        userId,
      });
      
      // Explicitly type and validate the response data
      const result = response.data as {
        score: number;
        maxScore: number;
        submission: string;
      };
      
      // Verify that the required properties exist
      if (
        typeof result.score !== 'number' ||
        typeof result.maxScore !== 'number' ||
        typeof result.submission !== 'string'
      ) {
        throw new Error('Invalid response format from quiz submission');
      }
      
      return result;
    } catch (error: any) {
      if (error.isAxiosError) {
        throw new QuizServiceError(
          error.response?.data?.error || 'Failed to submit quiz',
          error.response?.status
        );
      }
      throw error;
    }
  },
};