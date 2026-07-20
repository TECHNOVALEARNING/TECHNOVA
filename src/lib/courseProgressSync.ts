import { supabase } from "@/integrations/supabase/client";

/**
 * Service de synchronisation Cloud de la progression des leçons (Supabase + LocalStorage Cache)
 */

export const getCompletedLessons = async (
  courseId: string,
  userIdOrEmail?: string
): Promise<string[]> => {
  const localKey = `technova_completed_lessons_${courseId}`;
  let localCompleted: string[] = [];

  // 1. Read local storage cache
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localCompleted = JSON.parse(raw);
  } catch {}

  // 2. Fetch from Supabase if logged in or customer ID provided
  if (!userIdOrEmail) return localCompleted;

  try {
    const { data, error } = await supabase
      .from("user_course_progress" as any)
      .select("completed_lesson_ids")
      .eq("course_id", courseId)
      .eq("user_identifier", userIdOrEmail)
      .maybeSingle();

    if (data && data.completed_lesson_ids && Array.isArray(data.completed_lesson_ids)) {
      // Merge cloud and local unique IDs
      const merged = Array.from(new Set([...localCompleted, ...data.completed_lesson_ids]));
      localStorage.setItem(localKey, JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    console.warn("Supabase progress fetch fallback to local:", e);
  }

  return localCompleted;
};

export const saveCompletedLessons = async (
  courseId: string,
  completedLessonIds: string[],
  userIdOrEmail?: string
): Promise<void> => {
  const localKey = `technova_completed_lessons_${courseId}`;

  // 1. Save to localStorage immediately
  try {
    localStorage.setItem(localKey, JSON.stringify(completedLessonIds));
  } catch {}

  // 2. Sync to Supabase in background if user identifier available
  if (!userIdOrEmail) return;

  try {
    await supabase.from("user_course_progress" as any).upsert(
      {
        course_id: courseId,
        user_identifier: userIdOrEmail,
        completed_lesson_ids: completedLessonIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "course_id,user_identifier" }
    );
  } catch (e) {
    console.warn("Background cloud progress sync warning:", e);
  }
};
