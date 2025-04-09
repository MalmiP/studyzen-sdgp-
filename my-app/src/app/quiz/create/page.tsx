"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { quizService } from '@/lib/services/quizService';
import { Toast, ToastType } from '@/components/ui/Toast';
import type { Question, Quiz } from '@/lib/types/quiz';

export default function CreateQuiz() {
  const router = useRouter();
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as ToastType,
  });

  const [quizData, setQuizData] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    category: 'Programming',
    difficulty: 'Beginner',
    timeLimit: 15,
    questions: [
      {
        questionText: '',
        questionType: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 5
      }
    ],
    createdBy: 'user1', // Simple string placeholder until auth is implemented
  });

  const handleQuizDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuizData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index: number, field: string, value: string | number) => {
    const updatedQuestions = [...quizData.questions!];
    
    // Special handling for questionType
    if (field === 'questionType') {
      // When changing to true-false type
      if (value === 'true-false') {
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          [field]: value,
          options: ['True', 'False'],
          correctAnswer: '' // Reset correct answer when changing type
        };
      } 
      // When changing to multiple-choice type
      else if (value === 'multiple-choice') {
        const currentOptions = updatedQuestions[index].options;
        // Only reset options if they are currently True/False
        if (currentOptions.length === 2 && 
            currentOptions.includes('True') && 
            currentOptions.includes('False')) {
          updatedQuestions[index] = {
            ...updatedQuestions[index],
            [field]: value,
            options: ['', '', '', ''],
            correctAnswer: '' // Reset correct answer when changing type
          };
        } else {
          updatedQuestions[index] = {
            ...updatedQuestions[index],
            [field]: value,
            correctAnswer: '' // Reset correct answer when changing type
          };
        }
      }
    } else {
      // Standard field update for other fields
      (updatedQuestions[index] as any)[field] = value;
    }
    
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...quizData.questions!];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleCorrectAnswerChange = (questionIndex: number, value: string) => {
    const updatedQuestions = [...quizData.questions!];
    updatedQuestions[questionIndex].correctAnswer = value;
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      questionText: '',
      questionType: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 5
    };
    setQuizData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }));
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...quizData.questions!];
    updatedQuestions.splice(index, 1);
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleSubmit = async () => {
    try {
      // Validate quiz data
      if (!quizData.title || !quizData.description) {
        setToast({
          show: true,
          message: 'Please fill in all required fields',
          type: 'error'
        });
        return;
      }

      // Validate questions
      for (const question of quizData.questions!) {
        if (!question.questionText || 
            (question.questionType === 'multiple-choice' && question.options.some(opt => !opt))) {
          setToast({
            show: true,
            message: 'Please fill in all question fields',
            type: 'error'
          });
          return;
        }
        
        if (!question.correctAnswer) {
          setToast({
            show: true,
            message: 'Please select a correct answer for each question',
            type: 'error'
          });
          return;
        }
      }

      await quizService.createQuiz(quizData as Quiz);
      setToast({
        show: true,
        message: 'Quiz created successfully!',
        type: 'success'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/quiz');
      }, 1500);
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to create quiz',
        type: 'error'
      });
    }
  };

  const goBack = () => {
    router.push('/quiz');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-blue-50 font-mono">
      <div className="max-w-4xl mx-auto p-6 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={goBack}
            className="flex items-center text-blue-600 hover:text-blue-900"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Back
          </button>
        </div>

        <h1 className="text-2xl font-bold text-blue-900 text-center mb-8">Create New Quiz</h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-blue-800">Quiz Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-blue-600">Quiz Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter quiz title"
                value={quizData.title}
                onChange={handleQuizDetailsChange}
                className="w-full border border-blue-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-blue-600">Description</label>
              <input
                type="text"
                name="description"
                placeholder="Enter quiz description"
                value={quizData.description}
                onChange={handleQuizDetailsChange}
                className="w-full border border-blue-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-blue-600">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={quizData.category}
                    onChange={handleQuizDetailsChange}
                    className="w-full appearance-none bg-blue-700 text-white rounded-md px-3 py-2 pr-8 focus:outline-none"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Literature">Literature</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-blue-600">Difficulty</label>
                <div className="relative">
                  <select
                    name="difficulty"
                    value={quizData.difficulty}
                    onChange={handleQuizDetailsChange}
                    className="w-full appearance-none bg-blue-700 text-white rounded-md px-3 py-2 pr-8 focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-blue-600">Time limit(min)</label>
                <div className="relative">
                  <input
                    type="number"
                    name="timeLimit"
                    value={quizData.timeLimit}
                    onChange={handleQuizDetailsChange}
                    min={1}
                    max={120}
                    className="w-full appearance-none bg-blue-700 text-white rounded-md px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {quizData.questions!.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-white rounded-lg shadow-sm p-6 mb-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-blue-800">Question {questionIndex + 1}</h2>
              <button 
                onClick={() => removeQuestion(questionIndex)}
                className="text-blue-400 hover:text-red-500"
                disabled={quizData.questions!.length <= 1}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-blue-600">Question Type</label>
                <div className="relative">
                  <select
                    value={question.questionType}
                    onChange={(e) => handleQuestionChange(questionIndex, 'questionType', e.target.value)}
                    className="w-full appearance-none border border-blue-200 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="multiple-choice">Multiple choice(Single answer)</option>
                    <option value="true-false">True/False</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-blue-600">Question text</label>
                <input
                  type="text"
                  placeholder="Enter your question"
                  value={question.questionText}
                  onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-blue-600">Options</label>
                <div className="space-y-2">
                  {question.questionType === 'true-false' ? (
                    // True/False options
                    ['True', 'False'].map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name={`correctAnswer-${questionIndex}`}
                          checked={question.correctAnswer === option}
                          onChange={() => handleCorrectAnswerChange(questionIndex, option)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <label className="flex-1 text-blue-800">{option}</label>
                      </div>
                    ))
                  ) : (
                    // Multiple choice options
                    question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name={`correctAnswer-${questionIndex}`}
                          checked={question.correctAnswer === option}
                          onChange={() => handleCorrectAnswerChange(questionIndex, option)}
                          className="h-4 w-4 text-blue-600"
                          disabled={!option}
                        />
                        <input
                          type="text"
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                          className="w-full border border-blue-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-blue-600">Marks</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={question.marks}
                  onChange={(e) => handleQuestionChange(questionIndex, 'marks', parseInt(e.target.value))}
                  className="w-20 border border-blue-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-between mt-6">
          <button
            onClick={addQuestion}
            className="flex items-center gap-2 border border-blue-300 bg-white text-blue-700 px-4 py-2 rounded-md hover:bg-blue-50"
          >
            <span>+</span> Add Question
          </button>
          
          <button
            onClick={handleSubmit}
            className="bg-blue-800 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Save Quiz
          </button>
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
}