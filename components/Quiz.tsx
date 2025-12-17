
import React, { useState, useEffect, useCallback } from 'react';
import { getQuizQuestions } from '../services/geminiService';
import type { QuizQuestion, Language } from '../types';
import Spinner from './shared/Spinner';
import Card from './shared/Card';
import Button from './shared/Button';

interface QuizProps {
  language: Language;
}

const Quiz: React.FC<QuizProps> = ({ language }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setShowResult(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    try {
      const fetchedQuestions = await getQuizQuestions(language);
      setQuestions(fetchedQuestions);
    } catch (err) {
      setError('Failed to load quiz questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-center text-red-400">{error}</p>;

  return (
    <Card className="max-w-2xl mx-auto p-6 md:p-8">
      {!showResult ? (
        questions.length > 0 && (
          <div>
            <div className="mb-6">
              <p className="text-sm text-brand-accent font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</p>
              <h2 className="text-xl md:text-2xl font-bold mt-1">{questions[currentQuestionIndex].question}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions[currentQuestionIndex].options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = questions[currentQuestionIndex].correctAnswer === option;
                const getButtonClass = () => {
                  if (!selectedAnswer) return 'bg-slate-700 hover:bg-slate-600';
                  if (isSelected && isCorrect) return 'bg-green-500';
                  if (isSelected && !isCorrect) return 'bg-red-500';
                  if (isCorrect) return 'bg-green-500';
                  return 'bg-slate-700 opacity-60';
                };
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={!!selectedAnswer}
                    className={`p-4 rounded-lg text-left transition-all duration-200 ${getButtonClass()}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {selectedAnswer && (
              <div className="mt-6 text-right">
                <Button onClick={handleNextQuestion}>
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Show Results'}
                </Button>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-brand-secondary mb-4">Quiz Complete!</h2>
          <p className="text-xl mb-6">Your score: <span className="font-bold text-white">{score}</span> out of {questions.length}</p>
          <Button onClick={loadQuestions}>Play Again</Button>
        </div>
      )}
    </Card>
  );
};

export default Quiz;
