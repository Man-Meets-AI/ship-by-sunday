import {
  getAvailableLayoutModesForLesson,
  getCompletionIssues,
  getDefaultLayoutModeForLesson,
  getLessonById,
  getObjectiveTasks,
  getStudentFacingLessons,
  lessonSupportsLayoutToggle,
  normalizeLayoutModeForLesson,
} from "@/features/course/lesson/model";

describe("split lesson baseline (former watch cohort)", () => {
  it("keeps Bunny-driven lessons in focus-only split layout with workbench video", () => {
    const splitVideoLessons = getStudentFacingLessons();

    expect(splitVideoLessons.length).toBeGreaterThan(20);

    for (const lesson of splitVideoLessons) {
      expect(lesson.shell).toBe("split");
      expect(lesson.coachVideoPlacement).toBe("workbench");
      expect(lesson.workbenchMediaLayout).toBe("split");
      expect(getAvailableLayoutModesForLesson(lesson)).toEqual(["focus"]);
      expect(getDefaultLayoutModeForLesson(lesson)).toBe("focus");
      expect(lessonSupportsLayoutToggle(lesson)).toBe(false);
      expect(normalizeLayoutModeForLesson(lesson, "split")).toBe("focus");
    }
  });

  it("treats fieldless video lessons as video-complete steps with no required in-product fields", () => {
    for (const lessonId of ["2.1", "3.0", "3.8", "4.0"]) {
      const lesson = getLessonById(lessonId);
      expect(lesson).toBeTruthy();
      if (!lesson) {
        throw new Error(`Expected lesson ${lessonId} to exist.`);
      }

      expect(lesson.workbenchFields ?? []).toEqual([]);
      expect(getObjectiveTasks(lesson, {})).toEqual([
        expect.objectContaining({
          id: "__coach_video_ready",
          label: "Lesson video is attached and ready",
          status: "complete",
        }),
      ]);
      expect(getCompletionIssues(lesson, {})).toEqual([]);
    }
  });

  it("keeps no student-facing watch shells", () => {
    expect(
      getStudentFacingLessons().filter((l) => l.shell === "watch"),
    ).toHaveLength(0);
  });
});
