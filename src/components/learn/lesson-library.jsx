import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  Clock3,
  Check,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { lessons, lessonHref } from "@/content/lessons";

export function LessonLibrary() {
  return (
    <div className="space-y-9 py-10 sm:py-12">
      <header className="max-w-3xl">
        <Badge variant="outline" className="mb-5 gap-2">
          <GraduationCap className="size-3.5" />
          Terminal Learn
        </Badge>
        <h1 className="page-title max-w-xl leading-tight">
          Learn the market, one lesson at a time.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Build your understanding with focused guides and hands-on labs. Choose
          a topic, follow the explanation, and explore at your own pace.
        </p>
      </header>
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="font-semibold">All lessons</h2>
        <span className="text-xs text-muted-foreground">
          {lessons.length} lessons · Guides & interactive labs
        </span>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {lessons.map((lesson, index) => {
          const Icon = lesson.kind === "lab" ? FlaskConical : BookOpen;
          return (
            <Card key={lesson.slug} className="gap-5 overflow-hidden shadow-xs">
              <CardHeader>
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl border bg-muted/50">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    LESSON {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="eyebrow">{lesson.category}</p>
                <CardTitle>
                  <h2 className="text-xl tracking-tight">{lesson.title}</h2>
                </CardTitle>
                <CardDescription className="max-w-lg leading-6">
                  {lesson.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{lesson.format}</Badge>
                  <Badge variant="outline">{lesson.level}</Badge>
                </div>
                <ul className="space-y-2">
                  {lesson.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="size-3.5 shrink-0" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto flex-wrap justify-between gap-4 border-t pt-5">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  {lesson.duration}
                </span>
                <Button asChild>
                  <a href={lessonHref(lesson.slug)}>
                    {lesson.kind === "lab" ? "Open" : "Read"} {lesson.title}
                    <ArrowRight />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-4 rounded-xl border bg-muted/25 p-6 sm:grid-cols-[auto_1fr]">
        <BookOpen className="mt-1 size-5 text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold">Choose your starting point</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            New to market mechanics? Start with the Order Book Lab. Already
            comfortable with price charts? Read the Darvas guide to connect a
            chart pattern with a defined trading plan. Each lesson stands on its
            own.
          </p>
        </div>
      </div>
    </div>
  );
}
