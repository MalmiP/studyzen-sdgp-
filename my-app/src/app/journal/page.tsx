'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  Plus,
  Star,
  CheckCircle2,
  HelpCircle,
  Cloud,
  PenTool,
  GraduationCap,
  Clipboard,
  FileText,
  Bookmark,
  Search,
  Calendar,
  Lightbulb,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StudyMethod {
  id: string;
  name: string;
  icon: string;
}

interface JournalEntry {
  id: string;
  date: string;
  lectureTitle: string;
  keyPoints: string[];
  additionalNotes: string;
  questions: {
    id: string;
    description: string;
    isResolved: boolean;
    resources: string[];
  }[];
  studyMethods: {
    method: string;
    effectiveness: number;
    notes: string;
  }[];
  mood: string;
  learningSummary?: string;
  challenges?: string;
  futureActions?: string;
  recommendations?: string;
}

const STUDY_METHODS: StudyMethod[] = [
  { id: '1', name: 'Flashcards', icon: '📇' },
  { id: '2', name: 'Practice Problems', icon: '✏️' },
  { id: '3', name: 'Group Study', icon: '👥' },
  { id: '4', name: 'Video Tutorials', icon: '🎥' },
  { id: '5', name: 'Mind Mapping', icon: '🗺️' },
  { id: '6', name: 'Teaching Others', icon: '👨‍🏫' },
  { id: '7', name: 'Note Taking', icon: '📝' },
  { id: '8', name: 'Active Recall', icon: '🧠' },
];

const REFLECTION_QUESTIONS = [
  {
    label: 'What intriguing or surprising insights did you discover today?',
    key: 'learningSummary',
    placeholder: 'E.g., Learned about advanced OOP patterns...',
  },
  {
    label: 'What obstacles or challenges made learning difficult?',
    key: 'challenges',
    placeholder: 'E.g., Struggled with concurrency and race conditions...',
  },
  {
    label: 'What are your next steps to solidify your understanding?',
    key: 'futureActions',
    placeholder: 'E.g., Review concurrency docs, watch a tutorial on thread safety...',
  },
];

function parseAISections(markdown: string) {
  const cleaned = markdown.replace(/```/g, '');
  const sections = { steps: '', resources: '', youtube: '' };

  const stepsRegex = /##\s*Steps to Improve([\s\S]*?)(?=##\s*Resource Papers\/Articles|##\s*YouTube Tutorials|$)/i;
  const resourcesRegex = /##\s*Resource Papers\/Articles([\s\S]*?)(?=##\s*Steps to Improve|##\s*YouTube Tutorials|$)/i;
  const youtubeRegex = /##\s*YouTube Tutorials([\s\S]*?)(?=##\s*Steps to Improve|##\s*Resource Papers\/Articles|$)/i;

  const stepsMatch = stepsRegex.exec(cleaned);
  if (stepsMatch) sections.steps = stepsMatch[1].trim();

  const resourcesMatch = resourcesRegex.exec(cleaned);
  if (resourcesMatch) sections.resources = resourcesMatch[1].trim();

  const youtubeMatch = youtubeRegex.exec(cleaned);
  if (youtubeMatch) sections.youtube = youtubeMatch[1].trim();

  return sections;
}

function AIRecommendations({ recommendations }: { recommendations: string }) {
  const { steps, resources, youtube } = parseAISections(recommendations);

  const markdownComponents = {
    a: ({ node, ...props }: any) => (
      <a className="text-blue-700 underline" target="_blank" rel="noopener noreferrer" {...props} />
    ),
  };

  return (
    <>
      {steps && (
        <div className="bg-green-100 border border-green-300 p-4 rounded-lg my-4 shadow-sm">
          <h2 className="text-xl font-bold mb-2 text-green-800">Steps to Improve</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {steps}
          </ReactMarkdown>
        </div>
      )}
      {resources && (
        <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg my-4 shadow-sm">
          <h2 className="text-xl font-bold mb-2 text-yellow-800">Resource Papers/Articles</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {resources}
          </ReactMarkdown>
        </div>
      )}
      {youtube && (
        <div className="bg-blue-100 border border-blue-300 p-4 rounded-lg my-4 shadow-sm">
          <h2 className="text-xl font-bold mb-2 text-blue-800">YouTube Tutorials</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {youtube}
          </ReactMarkdown>
        </div>
      )}
    </>
  );
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    lectureTitle: '',
    keyPoints: [''],
    additionalNotes: '',
    questions: [],
    studyMethods: [],
    mood: 'good',
    learningSummary: '',
    challenges: '',
    futureActions: '',
  });

  const [newQuestion, setNewQuestion] = useState({ description: '', resources: [''] });
  const [customMethod, setCustomMethod] = useState('');

  const [searchTitle, setSearchTitle] = useState('');
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Fetch journal entries when component mounts
  useEffect(() => {
    async function fetchEntries() {
      try {
        const response = await axios.get('/api/journal-entries');
        setEntries(response.data);
      } catch (error) {
        console.error('Failed to fetch journal entries:', error);
      }
    }
    fetchEntries();
  }, []);

  const handleAddKeyPoint = () => {
    setCurrentEntry(prev => ({
      ...prev,
      keyPoints: [...(prev.keyPoints || []), ''],
    }));
  };

  const handleKeyPointChange = (index: number, value: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      keyPoints: prev.keyPoints?.map((point, i) => (i === index ? value : point)),
    }));
  };

  const handleRemoveKeyPoint = (index: number) => {
    setCurrentEntry(prev => ({
      ...prev,
      keyPoints: prev.keyPoints?.filter((_, i) => i !== index),
    }));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.description) return;
    setCurrentEntry(prev => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        {
          id: Date.now().toString(),
          description: newQuestion.description,
          isResolved: false,
          resources: newQuestion.resources.filter(r => r),
        },
      ],
    }));
    setNewQuestion({ description: '', resources: [''] });
  };

  const handleAddStudyMethod = (methodId: string) => {
    const method = STUDY_METHODS.find(m => m.id === methodId);
    if (!method) return;
    setCurrentEntry(prev => ({
      ...prev,
      studyMethods: [
        ...(prev.studyMethods || []),
        { method: method.name, effectiveness: 0, notes: '' },
      ],
    }));
  };

  const handleAddCustomMethod = () => {
    if (!customMethod) return;
    setCurrentEntry(prev => ({
      ...prev,
      studyMethods: [
        ...(prev.studyMethods || []),
        { method: customMethod, effectiveness: 0, notes: '' },
      ],
    }));
    setCustomMethod('');
  };

  const handleSave = async () => {
    if (!currentEntry.lectureTitle) return;
    try {
      const response = await axios.post('/api/journal-entries', currentEntry);
      const savedEntry = response.data;
      setEntries([savedEntry, ...entries]);
      setShowForm(false);
      setCurrentEntry({
        lectureTitle: '',
        keyPoints: [''],
        additionalNotes: '',
        questions: [],
        studyMethods: [],
        mood: 'good',
        learningSummary: '',
        challenges: '',
        futureActions: '',
      });
      await handleGenerateAIRecommendations(savedEntry.id);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }
  };

  const handleGenerateAIRecommendations = async (entryId: string) => {
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const response = await axios.post(`/api/journal-entries/${entryId}/recommendations`);
      setEntries(prev => prev.map(entry => (entry.id === response.data.id ? response.data : entry)));
    } catch (error: any) {
      console.error('Failed to generate AI recommendations:', error);
      setAiError(error?.message || 'Unknown error generating recommendations');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Delete functionality: delete an entry by id
  const handleDelete = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      await axios.delete(`/api/journal-entries/${entryId}`);
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      setAiError('Failed to delete journal entry.');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const titleMatch = entry.lectureTitle.toLowerCase().includes(searchTitle.toLowerCase());
    const entryDate = new Date(entry.date);
    let fromMatch = true, toMatch = true;
    if (searchFrom) fromMatch = entryDate >= new Date(searchFrom);
    if (searchTo) toMatch = entryDate <= new Date(searchTo);
    return titleMatch && fromMatch && toMatch;
  });

  return (
    <div
      className="p-6 min-h-screen relative overflow-hidden font-mono"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
        backgroundPosition: 'top left',
      }}
    >
      {/* Floating Decorative Icons */}
      <div className="absolute top-10 left-10 text-blue-300 opacity-20 animate-float">
        <Cloud size={64} />
      </div>
      <div className="absolute bottom-10 right-10 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
        <Cloud size={48} />
      </div>
      <div className="absolute top-1/2 left-1/4 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>
        <Cloud size={56} />
      </div>
      <div className="absolute top-5 left-10 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '0.3s' }}>
        <BookOpen size={40} />
      </div>
      <div className="absolute top-20 right-5 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>
        <Lightbulb size={40} />
      </div>
      <div className="absolute bottom-10 left-5 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '0.7s' }}>
        <PenTool size={40} />
      </div>
      <div className="absolute bottom-20 right-10 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
        <BookOpen size={30} />
      </div>
      <div className="absolute top-1/2 right-0 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '1.2s' }}>
        <Lightbulb size={30} />
      </div>
      <div className="absolute top-10 right-0 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>
        <PenTool size={30} />
      </div>
      <div className="absolute top-0 left-0 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '0.4s' }}>
        <GraduationCap size={35} />
      </div>
      <div className="absolute bottom-0 left-0 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '0.6s' }}>
        <Clipboard size={35} />
      </div>
      <div className="absolute top-0 right-20 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '0.8s' }}>
        <FileText size={35} />
      </div>
      <div className="absolute bottom-0 right-0 text-blue-300 opacity-20 animate-float" style={{ animationDelay: '1.0s' }}>
        <Bookmark size={35} />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1
            className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-500"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
          >
            Reflection Journal
          </h1>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white transition-transform duration-300 ease-in-out transform hover:scale-105 rounded-md shadow-md"
            >
              <Plus size={20} className="mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        {showForm ? (
          <>
            {/* Form Back Button */}
            <div className="mb-4">
              <Button onClick={() => setShowForm(false)} variant="outline" className="rounded-md">
                Back
              </Button>
            </div>

            {/* New Entry Form */}
            <Card className="shadow-lg animate-fade-in mb-6" style={{ backgroundColor: '#ECFDF5' }}>
              <CardHeader className="border-b" style={{ borderColor: '#ECFDF5' }}>
                <CardTitle className="text-2xl text-blue-900">New Journal Entry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Lecture Title */}
                <div className="animate-fade-in">
                  <h2 className="text-xl font-medium text-blue-800 mb-4">Lecture / Tutorial Title</h2>
                  <Input
                    type="text"
                    value={currentEntry.lectureTitle}
                    onChange={e => setCurrentEntry({ ...currentEntry, lectureTitle: e.target.value })}
                    placeholder="Enter lecture/tutorial title..."
                    className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition duration-300 bg-white text-blue-900 rounded-md"
                  />
                </div>

                {/* Reflection Questions */}
                {REFLECTION_QUESTIONS.map((q, idx) => (
                  <div
                    key={q.key}
                    className="animate-fade-in"
                    style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
                  >
                    <h2 className="text-xl font-medium text-blue-800 mb-4">{q.label}</h2>
                    <Textarea
                      value={(currentEntry as any)[q.key] || ''}
                      onChange={e => setCurrentEntry({ ...currentEntry, [q.key]: e.target.value })}
                      placeholder={q.placeholder}
                      rows={3}
                      className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition duration-300 bg-white text-blue-900 rounded-md"
                    />
                  </div>
                ))}

                {/* Key Points Section */}
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium text-blue-800">Key Points Learned</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddKeyPoint}
                      className="border-blue-300 text-blue-800 hover:bg-blue-200 transition duration-300 rounded-md"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {currentEntry.keyPoints?.map((point, index) => (
                      <div key={`new-keypoint-${index}`} className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={point}
                          onChange={e => handleKeyPointChange(index, e.target.value)}
                          placeholder="Enter a key point..."
                          className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition duration-300 bg-white text-blue-900 rounded-md"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveKeyPoint(index)}
                          className="border-blue-300 text-blue-800 hover:bg-blue-200 transition duration-300 rounded-md"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions & Doubts Section */}
                <div className="animate-fade-in">
                  <h2 className="text-xl font-medium text-blue-800 mb-4">Questions & Doubts</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        value={newQuestion.description}
                        onChange={e => setNewQuestion({ ...newQuestion, description: e.target.value })}
                        placeholder="Any doubts or challenges to clarify?"
                        rows={3}
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition duration-300 bg-white text-blue-900 rounded-md"
                      />
                      <Input
                        type="text"
                        value={newQuestion.resources[0] || ''}
                        onChange={e => setNewQuestion({ ...newQuestion, resources: [e.target.value] })}
                        placeholder="Link to a resource (optional)"
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition duration-300 bg-white text-blue-900 rounded-md"
                      />
                      <Button
                        onClick={handleAddQuestion}
                        variant="outline"
                        className="w-full border-blue-300 text-blue-800 hover:bg-blue-200 transition duration-300 rounded-md"
                      >
                        Add Question
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {currentEntry.questions?.map(question => (
                        <Card
                          key={question.id}
                          className="animate-fade-in bg-green-50 rounded-md shadow-sm"
                          style={{ animationDelay: `0.1s` }}
                        >
                          <CardContent className="flex items-start justify-between py-4">
                            <div>
                              <p className="text-blue-900">{question.description}</p>
                              {question.resources.map((resource, idx2) => (
                                <a
                                  key={`${question.id}-resource-${idx2}`}
                                  href={resource}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-700 underline hover:text-blue-900 transition duration-300"
                                >
                                  Resource {idx2 + 1}
                                </a>
                              ))}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setCurrentEntry(prev => ({
                                  ...prev,
                                  questions: prev.questions?.map(q =>
                                    q.id === question.id ? { ...q, isResolved: !q.isResolved } : q
                                  ),
                                }))
                              }
                              className={`transition duration-300 ${question.isResolved ? 'text-blue-700' : 'text-blue-500'} rounded-md`}
                            >
                              {question.isResolved ? <CheckCircle2 size={20} /> : <HelpCircle size={20} />}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Study Methods Section */}
                <div className="animate-fade-in">
                  <h2 className="text-xl font-medium text-blue-800 mb-4">Effective Study Methods Used</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {STUDY_METHODS.map(method => (
                        <Button
                          key={method.id}
                          variant="outline"
                          onClick={() => handleAddStudyMethod(method.id)}
                          className="justify-start border-blue-300 text-blue-800 hover:bg-blue-200 transition duration-300 rounded-md"
                        >
                          <span className="mr-2">{method.icon}</span>
                          <span>{method.name}</span>
                        </Button>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        value={customMethod}
                        onChange={e => setCustomMethod(e.target.value)}
                        placeholder="Add your own study method..."
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition duration-300 bg-white text-blue-900 rounded-md"
                      />
                      <Button
                        onClick={handleAddCustomMethod}
                        variant="outline"
                        className="border-blue-300 text-blue-800 hover:bg-blue-200 transition duration-300 rounded-md"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {currentEntry.studyMethods?.map((method, i) => (
                        <Card
                          key={`studymethod-${i}`}
                          className="animate-fade-in bg-blue-50 rounded-md shadow-sm"
                          style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                        >
                          <CardContent className="py-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-900">{method.method}</span>
                              <div className="flex">
                                {[...Array(method.effectiveness)].map((_, starIdx) => (
                                  <Star key={`star-${starIdx}`} size={16} className="text-blue-600" fill="currentColor" />
                                ))}
                              </div>
                            </div>
                            {method.notes && (
                              <p className="text-sm text-blue-700">{method.notes}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center mt-8 animate-fade-in">
              <Button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white transition-transform duration-300 ease-in-out transform hover:scale-105 px-12 py-4 text-xl font-bold rounded-full shadow-lg"
              >
                Save Journal Entry
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Search Filters */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center border border-blue-300 rounded-md p-2">
                <Search size={20} className="mr-2 text-blue-400" />
                <Input
                  type="text"
                  value={searchTitle}
                  onChange={e => setSearchTitle(e.target.value)}
                  placeholder="Search by Title"
                  className="w-full border-0 focus:ring-0"
                />
              </div>
              <div className="flex items-center border border-blue-300 rounded-md p-2">
                <span className="mr-2 text-blue-600">From:</span>
                <Calendar size={20} className="mr-2 text-blue-400" />
                <Input
                  type="date"
                  value={searchFrom}
                  onChange={e => setSearchFrom(e.target.value)}
                  className="w-full border-0 focus:ring-0"
                />
              </div>
              <div className="flex items-center border border-blue-300 rounded-md p-2">
                <span className="mr-2 text-blue-600">To:</span>
                <Calendar size={20} className="mr-2 text-blue-400" />
                <Input
                  type="date"
                  value={searchTo}
                  onChange={e => setSearchTo(e.target.value)}
                  className="w-full border-0 focus:ring-0"
                />
              </div>
            </div>

            {/* Display Journal Entries */}
            <div className="space-y-6">
              {filteredEntries.map(entry => (
                <Card key={entry.id} className="bg-white shadow-md border-blue-200 animate-fade-in rounded-lg">
                  <CardHeader className="border-b border-blue-200 p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-blue-900">{entry.lectureTitle}</CardTitle>
                      <span className="text-sm text-blue-600">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {entry.learningSummary && (
                      <div>
                        <h3 className="font-medium text-xl text-blue-700 mb-2">Surprising Insights</h3>
                        <p className="text-blue-900 whitespace-pre-wrap">{entry.learningSummary}</p>
                      </div>
                    )}
                    {entry.challenges && (
                      <div>
                        <h3 className="font-medium text-xl text-blue-700 mb-2">Challenges</h3>
                        <p className="text-blue-900 whitespace-pre-wrap">{entry.challenges}</p>
                      </div>
                    )}
                    {entry.futureActions && (
                      <div>
                        <h3 className="font-medium text-xl text-blue-700 mb-2">Next Steps</h3>
                        <p className="text-blue-900 whitespace-pre-wrap">{entry.futureActions}</p>
                      </div>
                    )}

                    {/* AI Recommendations Section */}
                    <div>
                      <h3 className="font-medium text-xl text-blue-700 mb-2">AI Recommendations</h3>
                      {entry.recommendations ? (
                        <AIRecommendations recommendations={entry.recommendations} />
                      ) : (
                        <Button
                          onClick={() => handleGenerateAIRecommendations(entry.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white transition duration-300 rounded-md"
                        >
                          Generate AI Recommendations
                        </Button>
                      )}
                      {isGeneratingAI && (
                        <p className="text-blue-800 text-sm mt-2">
                          Generating AI recommendations...
                        </p>
                      )}
                      {aiError && (
                        <p className="text-red-600 text-sm mt-2">
                          Error: {aiError}
                        </p>
                      )}
                    </div>

                    {/* Key Points */}
                    {entry.keyPoints.length > 0 && (
                      <div>
                        <h3 className="font-medium text-xl text-blue-700 mb-2">Key Points</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {entry.keyPoints.map((point, i) => (
                            <li key={`${entry.id}-kp-${i}`} className="text-blue-900">
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Questions & Doubts */}
                    {entry.questions.length > 0 && (
                      <div>
                        <h3 className="font-medium text-xl text-blue-700 mb-2">Questions & Doubts</h3>
                        <div className="space-y-2">
                          {entry.questions.map(question => (
                            <div key={question.id} className="flex items-start space-x-2 p-2 bg-blue-50 rounded-md">
                              {question.isResolved ? (
                                <CheckCircle2 className="text-blue-600" size={20} />
                              ) : (
                                <HelpCircle className="text-blue-400" size={20} />
                              )}
                              <span className="text-blue-900">{question.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Study Methods */}
                    {entry.studyMethods.length > 0 && (
                      <div>
                        <h3 className="font-medium text-xl text-blue-700 mb-2">Effective Study Methods</h3>
                        <div className="space-y-2">
                          {entry.studyMethods.map((method, i) => (
                            <div key={`${entry.id}-sm-${i}`} className="p-2 bg-blue-50 rounded-md">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-blue-900">{method.method}</span>
                                <div className="flex">
                                  {[...Array(method.effectiveness)].map((_, starIdx) => (
                                    <Star key={`star-${starIdx}`} size={16} className="text-blue-600" fill="currentColor" />
                                  ))}
                                </div>
                              </div>
                              {method.notes && (
                                <p className="text-sm text-blue-700 mt-1">{method.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delete Entry Button */}
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleDelete(entry.id)}
                        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded mt-4"
                      >
                        Delete Entry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {entries.length === 0 && (
                <Card className="text-center py-12 bg-white shadow-md border-blue-200 rounded-md animate-fade-in">
                  <CardContent>
                    <BookOpen className="mx-auto h-12 w-12 text-blue-600 animate-bounce-soft" />
                    <h3 className="mt-2 text-xl font-medium text-blue-900">
                      No journal entries yet
                    </h3>
                    <p className="mt-1 text-blue-700">
                      Start reflecting on your learning journey!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}