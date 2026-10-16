import { ArrowLeft, BookOpen, FlaskConical, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lessons, lessonHref } from "@/content/lessons";

export function LessonLayout({ lesson, children }) {
  return (
    <div className="grid items-start gap-8 py-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
      <aside className="lg:sticky lg:top-24">
        <nav aria-label="Lessons" className="space-y-4">
          <Button variant="ghost" className="justify-start px-2" asChild>
            <a href="#learn">
              <ArrowLeft />
              All lessons
            </a>
          </Button>
          <div className="flex flex-wrap gap-1 lg:flex-col">
            {lessons.map((item) => {
              const Icon = item.kind === "lab" ? FlaskConical : BookOpen;
              return (
                <Button
                  key={item.slug}
                  variant={item.slug === lesson.slug ? "secondary" : "ghost"}
                  className="h-auto justify-start px-3 py-2.5 text-left whitespace-normal"
                  asChild
                >
                  <a
                    href={lessonHref(item.slug)}
                    aria-current={
                      item.slug === lesson.slug ? "page" : undefined
                    }
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.title}
                  </a>
                </Button>
              );
            })}
          </div>
        </nav>
      </aside>
      <div className="min-w-0">
        <nav
          aria-label="Breadcrumb"
          className="mb-7 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
        >
          <a href="#learn" className="hover:text-foreground hover:underline">
            Learn
          </a>
          <ChevronRight className="size-3" />
          <span>{lesson.category}</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{lesson.title}</span>
        </nav>
        {children}
      </div>
    </div>
  );
}
