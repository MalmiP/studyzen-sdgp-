"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Question } from '@/lib/types/quiz';

interface QuestionFormProps {
  questionNumber: number;
  onDelete: () => void;
  onChange: (questionData: Question) => void;
  questionData: Question;
}

export const QuestionForm = ({
  questionNumber,
  onDelete,
  onChange,
  questionData,
}: QuestionFormProps) => {
  // Update options when question type changes
  useEffect(() => {
    if (questionData.questionType === 'true-false' && 
        (!questionData.options.includes('True') || !questionData.options.includes('False'))) {
      // Set options to True/False when switching to true-false type
      onChange({
        ...questionData,
        options: ['True', 'False'],
        correctAnswer: questionData.correctAnswer === 'True' || questionData.correctAnswer === 'False' 
          ? questionData.correctAnswer 
          : ''
      });
    } else if (questionData.questionType === 'multiple-choice' && 
               questionData.options.length < 3 && 
               questionData.options.length === 2 && 
               questionData.options.includes('True') && 
               questionData.options.includes('False')) {
      // Reset options when switching from true-false to multiple-choice
      onChange({
        ...questionData,
        options: ['', '', '', ''],
        correctAnswer: ''
      });
    }
  }, [questionData.questionType]);

  const handleOptionChange = (optionIndex: number, value: string) => {
    // Only allow changing options for multiple-choice
    if (questionData.questionType === 'true-false') return;
    
    const newOptions = [...questionData.options];
    newOptions[optionIndex] = value;
    onChange({ ...questionData, options: newOptions });
  };

  const handleCorrectAnswerChange = (answer: string) => {
    onChange({ ...questionData, correctAnswer: answer });
  };

  return (
    <Card className="p-6 border-blue-100">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-blue-800">Question {questionNumber}</h3>
        <Button variant="ghost" onClick={onDelete} size="icon" className="text-blue-400 hover:text-red-500">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-blue-600">Question Type</label>
          <select 
            className="w-full p-2 border border-blue-200 rounded-md font-mono text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={questionData.questionType}
            onChange={(e) => onChange({ ...questionData, questionType: e.target.value as 'multiple-choice' | 'true-false' })}
          >
            <option value="multiple-choice">Multiple choice (Single answer)</option>
            <option value="true-false">True/False</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-blue-600">Question Text</label>
          <Input
            placeholder="Enter your question"
            value={questionData.questionText}
            onChange={(e) => onChange({ ...questionData, questionText: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-blue-600">Options</label>
          <div className="space-y-2">
            {questionData.questionType === 'true-false' ? (
              // True/False options
              <>
                {['True', 'False'].map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`correctAnswer-${questionNumber}`}
                      checked={questionData.correctAnswer === option}
                      onChange={() => handleCorrectAnswerChange(option)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label className="flex-1 text-blue-800">{option}</label>
                  </div>
                ))}
              </>
            ) : (
              // Multiple choice options
              questionData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correctAnswer-${questionNumber}`}
                    checked={questionData.correctAnswer === option}
                    onChange={() => handleCorrectAnswerChange(option)}
                    className="h-4 w-4 text-blue-600"
                    disabled={!option}
                  />
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-blue-600">Marks</label>
          <Input
            type="number"
            min="1"
            max="100"
            className="w-24"
            value={questionData.marks}
            onChange={(e) => onChange({ ...questionData, marks: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>
    </Card>
  );
};