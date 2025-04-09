// src/app/quiz/[id]/TakeQuizClient.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Timer, AlertCircle } from 'lucide-react';
import { quizService } from '@/lib/services/quizService';
import type { Quiz } from '@/lib/types/quiz';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toast, ToastType } from '@/components/ui/Toast';

const TakeQuizClient = ({ quizId }: { quizId: string }) => {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as ToastType });
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = await quizService.getQuizById(quizId);
        setQuiz(quizData);
        setTimeLeft(quizData.timeLimit * 60);
        setAnswers(new Array(quizData.questions.length).fill(''));
      } catch (err) {
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, result]);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;

    try {
      setSubmitting(true);
      const result = await quizService.submitQuiz(
        quiz._id!,
        answers,
        'currentUserId' // Replace with actual user ID from auth
      );
      
      setResult({
        score: result.score,
        maxScore: result.maxScore
      });
      
      setToast({
        show: true,
        message: 'Quiz submitted successfully!',
        type: 'success'
      });
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to submit quiz',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex justify-center items-center min-h-screen bg-blue-50 font-mono">
      <div className="text-lg text-blue-800">Loading...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex-1 flex justify-center items-center min-h-screen bg-blue-50 font-mono">
      <div className="text-lg text-blue-800">Error: {error}</div>
    </div>
  );
  
  if (!quiz) return (
    <div className="flex-1 flex justify-center items-center min-h-screen bg-blue-50 font-mono">
      <div className="text-lg text-blue-800">Quiz not found</div>
    </div>
  );

  if (result) {
    return (
      <div className="min-h-screen bg-blue-50 p-8 font-mono">
        <div className="max-w-4xl mx-auto relative z-10">
          <Card className="max-w-2xl mx-auto p-8 border-blue-100">
            <h2 className="text-2xl font-bold mb-6 text-blue-900">Quiz Results</h2>
            <div className="space-y-4">
              <p className="text-lg text-blue-800">
                Score: {result.score} out of {result.maxScore}
              </p>
              <p className="text-lg text-blue-800">
                Percentage: {((result.score / result.maxScore) * 100).toFixed(1)}%
              </p>
              <button
                onClick={() => router.push('/quiz')}
                className="w-full bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Return to Quiz List
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-8 font-mono">
      <div className="max-w-4xl mx-auto relative z-10">
        <Card className="p-6 mb-6 border-blue-100">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-900">{quiz.title}</h1>
            <div className="flex items-center space-x-2 text-lg font-semibold text-blue-800">
              <Timer className="w-5 h-5" />
              <span>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-1000"
                style={{ width: `${(timeLeft / (quiz.timeLimit * 60)) * 100}%` }}
              />
            </div>
          </div>

          {timeLeft < 60 && (
            <div className="mt-4 flex items-center space-x-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span>Less than 1 minute remaining!</span>
            </div>
          )}
        </Card>

        <Card className="p-6 border-blue-100">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm font-medium text-blue-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>
            <div className="text-sm font-medium text-blue-600">
              {quiz.questions[currentQuestion].marks} marks
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-medium text-blue-900">
              {quiz.questions[currentQuestion].questionText}
            </h2>

            <div className="space-y-3">
              {quiz.questions[currentQuestion].questionType === 'true-false' ? (
                // True/False questions should only show True and False options
                ['True', 'False'].map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors ${
                      answers[currentQuestion] === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-blue-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={answers[currentQuestion] === option}
                      onChange={() => handleAnswerSelect(option)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="flex-1 text-blue-800">{option}</span>
                  </label>
                ))
              ) : (
                // Multiple choice questions show all provided options
                quiz.questions[currentQuestion].options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors ${
                      answers[currentQuestion] === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-blue-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={answers[currentQuestion] === option}
                      onChange={() => handleAnswerSelect(option)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="flex-1 text-blue-800">{option}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="flex items-center px-4 py-2 border border-blue-300 rounded-md text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            {currentQuestion < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
                disabled={!answers[currentQuestion]}
                className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || answers.some((a) => !a)}
                className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </Card>

        <div className="mt-6 flex justify-between items-center">
          <div className="flex space-x-2">
            {quiz.questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  answers[index]
                    ? 'bg-blue-600'
                    : currentQuestion === index
                    ? 'bg-blue-400'
                    : 'bg-blue-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default TakeQuizClient;