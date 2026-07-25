import React, { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Award, HelpCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation?: string;
}

export interface QuizData {
  title?: string;
  passPercentage?: number; // default 70
  questions: QuizQuestion[];
}

interface QuizPlayerProps {
  quiz: QuizData;
  onPass?: () => void;
  lessonTitle?: string;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onPass, lessonTitle }) => {
  const questions = quiz.questions || [];
  const passPercentage = quiz.passPercentage || 70;

  // Selected option index for each question: { [questionId]: optionIndex }
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (questions.length === 0) {
    return null;
  }

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitted) return; // Locked once submitted
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Calculate score
  const correctCount = questions.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercent >= passPercentage;

  const handleSubmit = () => {
    setSubmitted(true);
    if (passed && onPass) {
      onPass();
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  const allAnswered = questions.every((q) => userAnswers[q.id] !== undefined);

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-lg space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-lg">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Quiz de Compréhension
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {questions.length} Question{questions.length > 1 ? "s" : ""}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground mt-0.5">
              {quiz.title || `Testez vos connaissances : ${lessonTitle || "Leçon"}`}
            </h3>
          </div>
        </div>

        {submitted && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="rounded-xl text-xs font-bold gap-1.5 border-border hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Recommencer</span>
            </Button>
          </div>
        )}
      </div>

      {/* Submitted Score Banner */}
      {submitted && (
        <div
          className={`p-5 rounded-2xl border transition-all ${
            passed
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
              : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 ${
                  passed ? "bg-emerald-500 text-white shadow-md" : "bg-amber-500 text-white shadow-md"
                }`}
              >
                {passed ? <Award className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
              </div>
              <div>
                <h4 className="text-base font-extrabold">
                  {passed ? "Bravo ! Quiz Réussi 🎉" : "Score insuffisant — Entraînez-vous à nouveau"}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">
                  Vous avez obtenu <strong>{scorePercent}%</strong> de bonnes réponses ({correctCount} sur {questions.length}).
                  {passed ? " Leçon validée avec succès !" : ` Seuil de réussite : ${passPercentage}%.`}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-36 space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>Score</span>
                <span>{scorePercent}%</span>
              </div>
              <Progress value={scorePercent} className="h-2" />
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const selectedOption = userAnswers[q.id];
          const isCorrect = selectedOption === q.correctAnswer;

          return (
            <div
              key={q.id || qIdx}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                submitted
                  ? isCorrect
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-red-500/5 border-red-500/30"
                  : "bg-muted/30 border-border"
              }`}
            >
              {/* Question Label */}
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm sm:text-base font-bold text-foreground flex items-start gap-2">
                  <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <span>{q.question}</span>
                </h4>

                {submitted && (
                  <div className="shrink-0">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                        <XCircle className="h-4 w-4" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {q.options.map((optionText, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isAnswerCorrect = q.correctAnswer === optIdx;

                  let optionStyle = "bg-card border-border hover:border-primary/50 text-foreground";
                  const letterBadge = String.fromCharCode(65 + optIdx); // A, B, C, D

                  if (submitted) {
                    if (isAnswerCorrect) {
                      optionStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-bold";
                    } else if (isSelected && !isAnswerCorrect) {
                      optionStyle = "bg-red-500/15 border-red-500 text-red-950 dark:text-red-200 font-medium";
                    } else {
                      optionStyle = "bg-card/40 border-border/50 opacity-60 text-muted-foreground";
                    }
                  } else if (isSelected) {
                    optionStyle = "bg-primary/10 border-primary text-primary font-bold shadow-sm";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 transition-all ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-7 w-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-primary text-white border-primary"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {letterBadge}
                        </span>
                        <span>{optionText}</span>
                      </div>

                      {submitted && isAnswerCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      {submitted && isSelected && !isAnswerCorrect && (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation display when submitted */}
              {submitted && q.explanation && (
                <div className="p-3.5 rounded-xl bg-card/90 border border-border text-xs text-muted-foreground leading-relaxed space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Explication de l'instructeur :</span>
                  </div>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Submit Button */}
      {!submitted && (
        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="rounded-xl text-xs font-bold gap-2 px-6 shadow-md"
          >
            <span>Valider mes réponses</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizPlayer;
