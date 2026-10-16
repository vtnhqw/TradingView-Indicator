import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const stages = [
  {
    id: "box",
    title: "1. The range",
    description:
      "Price pauses between a $45 floor and a $50 ceiling. The boundaries must be confirmed before they can guide a decision.",
  },
  {
    id: "breakout",
    title: "2. The breakout",
    description:
      "Price moves above $50. The worked example assumes a $50.20 fill and a $44.80 stop; the breakout can still fail.",
  },
  {
    id: "higher-box",
    title: "3. A higher box",
    description:
      "A later range forms between $52 and $57. Only after confirmation does this example raise its stop reference beneath the new floor.",
  },
];
export function DarvasDiagram() {
  const [stage, setStage] = useState("box");
  const index = stages.findIndex((item) => item.id === stage);
  return (
    <figure className="my-6 overflow-hidden rounded-xl border bg-muted/20">
      <Tabs value={stage} onValueChange={setStage} className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <TabsList
            aria-label="Darvas diagram stages"
            className="max-w-full [&_button]:text-xs sm:[&_button]:text-sm"
          >
            <TabsTrigger value="box">1. Range</TabsTrigger>
            <TabsTrigger value="breakout">2. Breakout</TabsTrigger>
            <TabsTrigger value="higher-box">3. Higher box</TabsTrigger>
          </TabsList>
          <Badge variant="outline">Illustration</Badge>
        </div>
        {stages.map((item, step) => (
          <TabsContent key={item.id} value={item.id} className="m-0">
            <div
              className="overflow-x-auto"
              tabIndex={0}
              role="region"
              aria-label="Darvas box illustration"
            >
              <svg
                viewBox="0 0 650 320"
                className="h-auto w-full min-w-[480px]"
                role="img"
                aria-label={item.description}
              >
                <path
                  d="M30 60H620 M30 120H620 M30 180H620 M30 240H620 M30 300H620"
                  stroke="currentColor"
                  strokeOpacity=".07"
                />
                <rect
                  x="70"
                  y="180"
                  width="230"
                  height="60"
                  rx="3"
                  fill="rgb(59 130 246 / .08)"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                />
                <text x="78" y="169" fill="currentColor" fontSize="12">
                  Ceiling $50
                </text>
                <text x="78" y="260" fill="currentColor" fontSize="12">
                  Floor $45
                </text>
                <path
                  d="M25 288 L45 266 70 211 95 220 120 190 150 230 180 200 210 218 240 182 270 216 300 193"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {step > 0 && (
                  <>
                    <path
                      d="M300 193 L320 177.6 350 155 390 138"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                    />
                    <circle cx="320" cy="177.6" r="5" fill="#3b82f6" />
                    <text x="307" y="205" fill="currentColor" fontSize="12">
                      Entry $50.20
                    </text>
                    <path
                      d="M70 242.4H375"
                      stroke="#f43f5e"
                      strokeDasharray="5 5"
                    />
                    <text x="310" y="260" fill="currentColor" fontSize="12">
                      Initial stop $44.80
                    </text>
                  </>
                )}
                {step > 1 && (
                  <>
                    <rect
                      x="390"
                      y="96"
                      width="180"
                      height="60"
                      rx="3"
                      fill="rgb(16 185 129 / .08)"
                      stroke="#10b981"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M390 138 L410 115 430 97 450 130 470 151 490 112 515 134 540 104 570 120"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <text x="397" y="85" fill="currentColor" fontSize="12">
                      New ceiling $57
                    </text>
                    <text x="397" y="178" fill="currentColor" fontSize="12">
                      New floor $52
                    </text>
                    <path
                      d="M390 158.4H610"
                      stroke="#f43f5e"
                      strokeDasharray="5 5"
                    />
                    <text x="397" y="200" fill="currentColor" fontSize="12">
                      Raise stop after confirmation
                    </text>
                  </>
                )}
                <text
                  x="30"
                  y="28"
                  fill="currentColor"
                  opacity=".55"
                  fontSize="11"
                >
                  FICTIONAL PRICE PATH · NOT MARKET DATA
                </text>
                <text
                  x="550"
                  y="300"
                  fill="currentColor"
                  opacity=".55"
                  fontSize="11"
                >
                  Time →
                </text>
              </svg>
            </div>
            <div className="border-t bg-card px-5 py-4">
              <p className="mb-1 text-sm font-semibold">{item.title}</p>
              <p className="text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <figcaption className="px-5 py-3 text-xs leading-5 text-muted-foreground">
        A simplified sequence to explain the method. Only the first {index + 1}{" "}
        {index === 0 ? "stage is" : "stages are"} shown. Future boxes are never
        known in advance.
      </figcaption>
    </figure>
  );
}
