import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus, Trash2, GripVertical, Video, FileText, Upload,
  Clock, Link as LinkIcon, Download, Layers, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import RichTextEditor from "@/components/RichTextEditor";

export interface Lesson {
  id: string;
  module_id?: string;
  title: string;
  description: string;
  content: string;
  video_url: string;
  resource_url: string;
  duration_minutes: number | null;
  position: number;
  resourceFile?: File | null;
}

export interface Module {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface CourseLessonsManagerProps {
  modules: Module[];
  onModulesChange: (modules: Module[]) => void;
}

const createModule = (position: number): Module => ({
  id: crypto.randomUUID(),
  title: "",
  position,
  lessons: [],
});

const createLesson = (position: number, moduleId: string): Lesson => ({
  id: crypto.randomUUID(),
  module_id: moduleId,
  title: "",
  description: "",
  content: "",
  video_url: "",
  resource_url: "",
  duration_minutes: null,
  position,
});

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  try {
    if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      return `https://www.youtube.com/embed/${urlObj.searchParams.get("v")}`;
    }
    if (url.includes("youtu.be")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com")) {
      const id = url.split("vimeo.com/")[1]?.split("/")[0]?.split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return url;
  }
};

const CourseLessonsManager = ({ modules, onModulesChange }: CourseLessonsManagerProps) => {
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  const findLessonAndModule = (lessonId: string) => {
    for (const m of modules) {
      const l = m.lessons.find(x => x.id === lessonId);
      if (l) return { module: m, lesson: l };
    }
    return null;
  };

  const addModule = () => {
    onModulesChange([...modules, createModule(modules.length)]);
  };

  const updateModule = (id: string, changes: Partial<Module>) => {
    onModulesChange(modules.map(m => m.id === id ? { ...m, ...changes } : m));
  };

  const removeModule = (id: string) => {
    onModulesChange(modules.filter(m => m.id !== id).map((m, i) => ({ ...m, position: i })));
  };

  const handleReorderModules = (reordered: Module[]) => {
    onModulesChange(reordered.map((m, i) => ({ ...m, position: i })));
  };

  const addLesson = (moduleId: string) => {
    onModulesChange(modules.map(m => {
      if (m.id === moduleId) {
        const newLesson = createLesson(m.lessons.length, moduleId);
        setTimeout(() => setEditingLessonId(newLesson.id), 50);
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    }));
  };

  const updateLesson = (moduleId: string, lessonId: string, changes: Partial<Lesson>) => {
    onModulesChange(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...changes } : l)
        };
      }
      return m;
    }));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    onModulesChange(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.filter(l => l.id !== lessonId).map((l, i) => ({ ...l, position: i }))
        };
      }
      return m;
    }));
  };

  const handleReorderLessons = (moduleId: string, reordered: Lesson[]) => {
    onModulesChange(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: reordered.map((l, i) => ({ ...l, position: i })) };
      }
      return m;
    }));
  };

  const editingContext = editingLessonId ? findLessonAndModule(editingLessonId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Programme de la formation</h3>
          <p className="text-sm text-muted-foreground">
            Structurez votre cours en modules et leçons.
          </p>
        </div>
        <Button
          type="button"
          onClick={addModule}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un module
        </Button>
      </div>

      {modules.length === 0 ? (
        <div
          className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={addModule}
        >
          <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Aucun module pour le moment</p>
          <p className="text-xs text-muted-foreground mt-1">Commencez par créer votre premier module</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={modules}
          onReorder={handleReorderModules}
          className="space-y-4"
        >
          <AnimatePresence initial={false}>
            {modules.map((module, mIndex) => (
              <Reorder.Item
                key={module.id}
                value={module}
                className="list-none"
              >
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-3 p-4 bg-muted/30 border-b border-border">
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={module.title}
                        onChange={(e) => updateModule(module.id, { title: e.target.value })}
                        placeholder={`Titre du module ${mIndex + 1} (ex: Introduction)`}
                        className="font-medium bg-transparent border-transparent hover:border-border focus:border-primary px-2"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-3 space-y-2">
                    {module.lessons.length === 0 ? (
                      <div className="text-center p-4 border border-dashed rounded-lg text-sm text-muted-foreground">
                        Ce module est vide.
                      </div>
                    ) : (
                      <Reorder.Group
                        axis="y"
                        values={module.lessons}
                        onReorder={(reordered) => handleReorderLessons(module.id, reordered)}
                        className="space-y-2"
                      >
                        {module.lessons.map((lesson, lIndex) => (
                          <Reorder.Item
                            key={lesson.id}
                            value={lesson}
                            className="list-none"
                          >
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors group">
                              <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-colors">
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-primary">{lIndex + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditingLessonId(lesson.id)}>
                                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                  {lesson.title || "Nouvelle leçon sans titre"}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  {lesson.video_url && (
                                    <span className="flex items-center gap-1"><Video className="h-3 w-3"/> Vidéo configurée</span>
                                  )}
                                  {lesson.content && lesson.content !== "<p></p>" && (
                                    <span className="flex items-center gap-1"><FileText className="h-3 w-3"/> Texte riche</span>
                                  )}
                                  {(lesson.resourceFile || lesson.resource_url) && (
                                    <span className="flex items-center gap-1"><Download className="h-3 w-3"/> Ressource</span>
                                  )}
                                  {lesson.duration_minutes && (
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> {lesson.duration_minutes} min</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 hidden group-hover:flex"
                                  onClick={() => setEditingLessonId(lesson.id)}
                                >
                                  Éditer
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeLesson(module.id, lesson.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 mt-2 text-primary hover:text-primary hover:bg-primary/5 border border-dashed border-primary/30"
                      onClick={() => addLesson(module.id)}
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter une leçon au module
                    </Button>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      <Sheet open={!!editingLessonId} onOpenChange={(open) => !open && setEditingLessonId(null)}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          {editingContext && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle>Éditer la leçon</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-1 block">Titre de la leçon</label>
                  <Input 
                    value={editingContext.lesson.title}
                    onChange={(e) => updateLesson(editingContext.module.id, editingContext.lesson.id, { title: e.target.value })}
                    placeholder="Ex: 1. Introduction à la formation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Durée estimée (min)</label>
                    <Input 
                      type="number"
                      value={editingContext.lesson.duration_minutes || ""}
                      onChange={(e) => updateLesson(editingContext.module.id, editingContext.lesson.id, { duration_minutes: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Ex: 15"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Vidéo de la leçon (Lien externe)</label>
                  <div className="flex gap-2 mb-2">
                    <div className="bg-muted border border-border flex items-center px-3 rounded-md">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      value={editingContext.lesson.video_url}
                      onChange={(e) => updateLesson(editingContext.module.id, editingContext.lesson.id, { video_url: e.target.value })}
                      placeholder="https://drive.google.com/... ou YouTube"
                    />
                  </div>
                  {editingContext.lesson.video_url && editingContext.lesson.video_url.trim().startsWith("http") && (
                    <div className="aspect-[16/9] w-full rounded-lg overflow-hidden border border-border bg-black/5 mt-3">
                      <iframe 
                        src={getEmbedUrl(editingContext.lesson.video_url)} 
                        className="w-full h-full border-0" 
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen 
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Contenu écrit (Texte enrichi)</label>
                  <RichTextEditor 
                    content={editingContext.lesson.content}
                    onChange={(content) => updateLesson(editingContext.module.id, editingContext.lesson.id, { content })}
                    placeholder="Rédigez le cours ici, ajoutez des explications, des liens..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Ressource téléchargeable (Optionnel)</label>
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => document.getElementById(`resource-upload-${editingContext.lesson.id}`)?.click()}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      {editingContext.lesson.resourceFile 
                        ? `📎 ${editingContext.lesson.resourceFile.name}` 
                        : editingContext.lesson.resource_url 
                          ? `📎 Ressource existante enregistrée` 
                          : "Cliquez pour uploader un fichier (PDF, ZIP...)"}
                    </p>
                    <input 
                      id={`resource-upload-${editingContext.lesson.id}`}
                      type="file" 
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          updateLesson(editingContext.module.id, editingContext.lesson.id, { resourceFile: file });
                        }
                      }}
                    />
                  </div>
                </div>

              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CourseLessonsManager;
