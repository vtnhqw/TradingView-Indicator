import { ArrowRight, ArrowUpRight, Clock3, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { lessons, lessonHref } from "@/content/lessons";
import { DarvasDiagram } from "./darvas-diagram";

const figures = { darvas: DarvasDiagram };
function SourceLink({ source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 underline decoration-border underline-offset-4 hover:text-foreground"
    >
      {source.title}
      <ArrowUpRight className="size-3 shrink-0" />
    </a>
  );
}
export function LessonArticle({ lesson, activeSection }) {
  const next =
    lessons[
      (lessons.findIndex((item) => item.slug === lesson.slug) + 1) %
        lessons.length
    ];
  function revisitSection(event, id) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    if (window.location.hash !== lessonHref(lesson.slug, id)) return;
    event.preventDefault();
    const heading = document.getElementById(`section-${id}`);
    heading?.scrollIntoView({ behavior: "instant", block: "start" });
    heading?.focus({ preventScroll: true });
  }
  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_180px]">
      <aside className="order-first border-b pb-5 xl:sticky xl:top-24 xl:order-last xl:border-b-0 xl:border-l xl:pb-0 xl:pl-5">
        <p className="eyebrow mb-3">On this page</p>
        <nav
          aria-label="On this page"
          className="flex flex-wrap gap-x-5 gap-y-2 xl:flex-col"
        >
          {lesson.sections.map((section) => (
            <a
              key={section.id}
              href={lessonHref(lesson.slug, section.id)}
              onClick={(event) => revisitSection(event, section.id)}
              aria-current={
                activeSection === section.id ? "location" : undefined
              }
              className={`text-xs leading-5 hover:text-foreground hover:underline ${activeSection === section.id ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {section.title}
            </a>
          ))}
        </nav>
      </aside>
      <article className="min-w-0 max-w-3xl">
        <header className="mb-9 border-b pb-7">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{lesson.format}</Badge>
            <Badge variant="outline">{lesson.level}</Badge>
          </div>
          <h1 className="page-title leading-tight">{lesson.title}</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {lesson.description}
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            {lesson.duration}
            <span aria-hidden="true">·</span>Educational guide
          </div>
        </header>
        <div className="space-y-10">
          {lesson.sections.map((section, index) => {
            const Figure = figures[section.figure];
            return (
              <section
                key={section.id}
                aria-labelledby={`section-${section.id}`}
                className="space-y-4"
              >
                <h2
                  id={`section-${section.id}`}
                  tabIndex={-1}
                  className="scroll-mt-40 text-xl font-semibold tracking-tight outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring sm:scroll-mt-24"
                >
                  <span
                    aria-hidden="true"
                    className="mr-3 font-mono text-xs font-normal text-muted-foreground"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>
                {section.paragraphs?.map((text) => (
                  <p
                    key={text}
                    className="text-sm leading-7 text-muted-foreground"
                  >
                    {text}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="list-disc space-y-3 pl-5 text-sm leading-7 text-muted-foreground marker:text-foreground">
                    {section.bullets.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                )}
                {Figure && <Figure />}
                {section.table && (
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {section.table.headers.map((label) => (
                            <TableHead key={label} className="bg-muted/50 px-4">
                              {label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {section.table.rows.map(([label, value]) => (
                          <TableRow key={label}>
                            <TableCell className="px-4 py-3 text-muted-foreground whitespace-normal">
                              {label}
                            </TableCell>
                            <TableCell className="px-4 py-3 font-medium whitespace-normal">
                              {value}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {section.paragraphsAfter?.map((text) => (
                  <p
                    key={text}
                    className="text-sm leading-7 text-muted-foreground"
                  >
                    {text}
                  </p>
                ))}
                {section.callout && (
                  <Alert className="border-l-2 border-l-blue-500 bg-muted/30">
                    <Info />
                    <AlertDescription className="leading-6">
                      {section.callout}
                    </AlertDescription>
                  </Alert>
                )}
                {section.question && (
                  <div className="rounded-lg border px-5 py-4">
                    <p className="eyebrow mb-2">Check your understanding</p>
                    <p className="text-sm leading-6">
                      {section.question.prompt}
                    </p>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="answer">
                        <AccordionTrigger className="text-sm">
                          Reveal explanation
                        </AccordionTrigger>
                        <AccordionContent className="leading-6 text-muted-foreground">
                          {section.question.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
                {section.sources && (
                  <div className="flex flex-col gap-1 text-xs leading-5 text-muted-foreground">
                    {section.sources.map((id) => (
                      <span key={id}>
                        Reference: <SourceLink source={lesson.sources[id]} />
                      </span>
                    ))}
                  </div>
                )}
                {section.references && (
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {Object.values(lesson.sources).map((source) => (
                      <li key={source.url}>
                        <SourceLink source={source} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <Button variant="outline" asChild>
            <a href="#learn">All lessons</a>
          </Button>
          {next.slug !== lesson.slug && (
            <Button variant="ghost" asChild>
              <a href={lessonHref(next.slug)}>
                Explore {next.title}
                <ArrowRight />
              </a>
            </Button>
          )}
        </div>
      </article>
    </div>
  );
}
