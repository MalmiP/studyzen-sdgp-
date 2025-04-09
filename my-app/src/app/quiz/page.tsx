"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { quizService } from '@/lib/services/quizService';
import { Clock, Rocket } from 'lucide-react';
import { Toast, ToastType } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Quiz } from '@/lib/types/quiz';

export default function QuizZone() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as ToastType,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    quizId: '',
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      console.log('Page: Fetching quizzes...');
      const data = await quizService.getAllQuizzes();
      console.log('Page: Quizzes fetched successfully:', data);
      setQuizzes(data);
      setError(null);
    } catch (err) {
      console.error('Page: Error fetching quizzes:', err);
      if (err instanceof Error) {
        setError(`Failed to fetch quizzes: ${err.message}`);
      } else {
        setError('Failed to fetch quizzes: Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToCreateQuiz = () => {
    console.log("Navigating to create quiz page");
    router.push("/quiz/create");
  };

  const handleStartQuiz = (id: string) => {
    router.push(`/quiz/${id}`);
  };

  const handleDeleteQuiz = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this quiz?',
      quizId: id,
    });
  };

  const confirmDeleteQuiz = async () => {
    try {
      await quizService.deleteQuiz(confirmDialog.quizId);
      
      // Update quizzes list
      setQuizzes(quizzes.filter(quiz => quiz._id !== confirmDialog.quizId));
      
      setToast({
        show: true,
        message: 'Quiz deleted successfully',
        type: 'success'
      });
    } catch (err) {
      setToast({
        show: true,
        message: 'Failed to delete quiz',
        type: 'error'
      });
    } finally {
      setConfirmDialog({ isOpen: false, message: '', quizId: '' });
    }
  };

  const cancelDeleteQuiz = () => {
    setConfirmDialog({ isOpen: false, message: '', quizId: '' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-blue-50 font-mono">
        <div className="text-lg text-blue-800">Loading quizzes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-blue-50 font-mono">
        <div className="bg-white border border-blue-200 rounded-lg p-6 max-w-3xl w-full">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Error Loading Quizzes</h2>
          <p className="text-blue-800 mb-4">{error}</p>
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-800 mb-2"><strong>Troubleshooting:</strong></p>
            <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
              <li>Check that your MongoDB connection string in .env.local is correct</li>
              <li>Verify that your MongoDB Atlas IP whitelist includes your current IP address</li>
              <li>Make sure your database user has the correct permissions</li>
              <li>Ensure your MongoDB cluster is running</li>
            </ul>
          </div>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchQuizzes();
            }}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-blue-50 min-h-screen font-mono">
      <div className="max-w-4xl mx-auto p-8 relative z-10">
        <div className="bg-white rounded-md p-6 mb-8 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2 text-blue-900">Quiz Zone</h1>
            <p className="text-blue-600">Challenge yourself and create your own quizzes!</p>
          </div>
          
          {/* Create Quiz button */}
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20">
            <button 
              onClick={navigateToCreateQuiz}
              className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
              type="button"
            >
              <span className="text-lg">+</span> Create Quiz
            </button>
          </div>
          
          {/* Background decorative elements */}
          <div className="absolute right-0 top-0 w-full h-full opacity-10">
            <div className="absolute right-10 top-5 text-9xl font-bold text-blue-400">?</div>
            <div className="absolute right-40 top-10 text-9xl font-bold text-blue-400">?</div>
            <div className="absolute right-20 top-20 text-9xl font-bold text-blue-400">?</div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-blue-900">Explore Quiz</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center col-span-full">
              <h2 className="text-xl mb-4 text-blue-900">No quizzes available</h2>
              <p className="mb-6 text-blue-600">
                Create your first quiz to get started!
              </p>
              <button
                onClick={navigateToCreateQuiz}
                className="bg-blue-800 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Quiz
              </button>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div 
                key={quiz._id}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-blue-900">{quiz.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      quiz.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' : 
                      quiz.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-blue-600 mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-blue-400 mb-4">
                    <div className="flex items-center">
                      <Rocket className="w-4 h-4 mr-2" />
                      <span>{quiz.questions.length} questions</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{quiz.timeLimit} minutes</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStartQuiz(quiz._id!)}
                      className="flex-1 bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      Start Quiz
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz._id!)}
                      className="text-red-500 border border-red-200 bg-white hover:bg-red-50 py-2 px-4 rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDeleteQuiz}
        onCancel={cancelDeleteQuiz}
      />
    </div>
  );
}