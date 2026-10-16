import { Button } from "@/components/ui/button";
import { getLesson } from "@/content/lessons";
import { OrderBookLab } from "@/components/order-book-lab";
import { LessonLibrary } from "./lesson-library";
import { LessonLayout } from "./lesson-layout";
import { LessonArticle } from "./lesson-article";

const interactiveLessons = { "order-book": OrderBookLab };
export function LearnPage({ slug, section }) {
  if (!slug) return <LessonLibrary />;
  const lesson = getLesson(slug);
  if (!lesson)
    return (
      <div className="space-y-4 py-16">
        <p className="eyebrow">Terminal Learn</p>
        <h1 className="page-title">Lesson not found</h1>
        <p className="text-sm text-muted-foreground">
          This lesson may have moved. Choose a topic from the library.
        </p>
        <Button asChild>
          <a href="#learn">Browse all lessons</a>
        </Button>
      </div>
    );
  const InteractiveLesson = interactiveLessons[lesson.slug];
  return (
    <LessonLayout lesson={lesson}>
      {lesson.kind === "guide" ? (
        <LessonArticle lesson={lesson} activeSection={section} />
      ) : (
        <InteractiveLesson inLibrary />
      )}
    </LessonLayout>
  );
}
