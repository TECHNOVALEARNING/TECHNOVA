import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, HelpCircle, CheckCircle2, Sparkles } from "lucide-react";
import { QuizData, QuizQuestion } from "./QuizPlayer";
import { toast } from "sonner";

interface QuizBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuiz?: QuizData | null;
  onSave: (quiz: QuizData) => void;
  lessonTitle?: string;
}

export const QuizBuilderModal: React.FC<QuizBuilderModalProps> = ({
  isOpen,
  onClose,
  initialQuiz,
  onSave,
  lessonTitle,
}) => {
  const [title, setTitle] = useState("");
  const [passPercentage, setPassPercentage] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (initialQuiz && initialQuiz.questions && initialQuiz.questions.length > 0) {
      setTitle(initialQuiz.title || "");
      setPassPercentage(initialQuiz.passPercentage || 70);
      setQuestions(initialQuiz.questions);
    } else {
      setTitle(lessonTitle ? `Quiz : ${lessonTitle}` : "Quiz de compréhension");
      setPassPercentage(70);
      setQuestions([
        {
          id: `q_${Date.now()}_1`,
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        },
      ]);
    }
  }, [initialQuiz, isOpen, lessonTitle]);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${prev.length + 1}`,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      toast.error("Un quiz doit comporter au moins une question.");
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], question: text };
      return copy;
    });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const newOptions = [...copy[qIdx].options];
      newOptions[optIdx] = text;
      copy[qIdx] = { ...copy[qIdx], options: newOptions };
      return copy;
    });
  };

  const handleSetCorrectAnswer = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], correctAnswer: optIdx };
      return copy;
    });
  };

  const handleExplanationChange = (qIdx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], explanation: text };
      return copy;
    });
  };

  const handleSave = () => {
    // Validate fields
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Veuillez renseigner le texte de la Question ${i + 1}`);
        return;
      }
      const filledOptions = q.options.filter((o) => o.trim().length > 0);
      if (filledOptions.length < 2) {
        toast.error(`La Question ${i + 1} doit avoir au moins 2 options de réponse.`);
        return;
      }
    }

    onSave({
      title: title.trim() || "Quiz de compréhension",
      passPercentage,
      questions,
    });

    toast.success("Quiz enregistré avec succès !");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <span>Éditeur de Quiz de Compréhension</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 my-2">
          {/* General Quiz Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-2xl border border-border">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-bold">Titre du Quiz</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Quiz du Module 1 : Concepts fondamentaux"
                className="rounded-xl bg-card"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Seuil de réussite (%)</Label>
              <Input
                type="number"
                min={10}
                max={100}
                value={passPercentage}
                onChange={(e) => setPassPercentage(parseInt(e.target.value) || 70)}
                className="rounded-xl bg-card"
              />
            </div>
          </div>

          {/* Questions Builder Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-foreground">
                Questions ({questions.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="rounded-xl text-xs font-bold gap-1.5 border-primary/30 text-primary"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter une Question</span>
              </Button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4 relative"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    Question {qIdx + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl h-8 w-8 p-0"
                    title="Supprimer la question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Question Text */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Intitulé de la question</Label>
                  <Textarea
                    value={q.question}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    placeholder="ex: Quel hook React permet de gérer les effets secondaires ?"
                    rows={2}
                    className="rounded-xl bg-background text-sm"
                  />
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold">
                    Options de réponse (Sélectionnez la bonne réponse)
                  </Label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((optionText, optIdx) => {
                      const isCorrect = q.correctAnswer === optIdx;
                      const letter = String.fromCharCode(65 + optIdx);

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                            isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/50"
                              : "bg-background border-border"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetCorrectAnswer(qIdx, optIdx)}
                            className={`h-7 w-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border transition-all ${
                              isCorrect
                                ? "bg-emerald-500 text-white border-emerald-500"
                                : "bg-muted text-muted-foreground border-border hover:bg-primary/20"
                            }`}
                            title="Définir comme réponse correcte"
                          >
                            {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : letter}
                          </button>

                          <Input
                            value={optionText}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${letter}`}
                            className="rounded-lg h-9 text-xs bg-card"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-bold flex items-center gap-1.5 text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Explication pédagogique (affichée après correction)</span>
                  </Label>
                  <Input
                    value={q.explanation || ""}
                    onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                    placeholder="ex: useEffect permet d'exécuter du code après le rendu (fetch, événements, etc.)"
                    className="rounded-xl text-xs bg-background"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-bold">
            Annuler
          </Button>
          <Button onClick={handleSave} className="rounded-xl text-xs font-bold px-6 shadow-md">
            Enregistrer le Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuizBuilderModal;
