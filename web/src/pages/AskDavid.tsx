import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Answer from "../components/Answer";
import David from "../components/David";
import QuestionDialog from "../components/QuestionDialog";
import { Button } from "../components/ui/button";

const AskDavid = () => {
  const [questionContext, setQuestionContext] = useState<QuestionContext>();
  const [showDialog, setShowDialog] = useState(false);
  const [showWhoIsDavidDetails, setShowWhoIsDavidDetails] = useState(false);
  const whoIsDavidSectionRef = useRef<HTMLDivElement | null>(null);
  const isAnswering = Boolean(questionContext);

  useEffect(() => {
    if (!showWhoIsDavidDetails) {
      return;
    }

    const scrollToBottom = () => {
      const height = document.documentElement.scrollHeight;

      window.scrollTo({
        top: height,
        behavior: "smooth",
      });
    };

    scrollToBottom();
    const timeoutId = window.setTimeout(scrollToBottom, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showWhoIsDavidDetails]);

  return (
    <div className="flex flex-1 flex-col">
      <div
        className={`flex flex-1 flex-col items-center ${
          isAnswering ? "justify-center gap-3" : "gap-6"
        }`}
      >
        {!isAnswering && (
          <h1 className="text-center font-display text-5xl tracking-wide sm:text-6xl md:text-7xl">
            Ask David
          </h1>
        )}
        {!isAnswering && <David />}
        {isAnswering && (
          <David
            className="w-full max-h-[34dvh] px-4 sm:max-h-[42dvh]"
            imageClassName="w-full"
          />
        )}
        {!isAnswering && (
          <div className="w-full max-w-xs sm:max-w-sm">
            <Button
              className="w-full"
              size="lg"
              variant="secondary"
              onClick={() => {
                setShowDialog(true);
              }}
            >
              Ask something
            </Button>
          </div>
        )}
        {showDialog && (
          <QuestionDialog
            onClose={() => {
              setShowDialog(false);
            }}
            onSubmit={(questionContext) => {
              setQuestionContext(questionContext);
              setShowDialog(false);
            }}
          />
        )}
        {questionContext && (
          <Answer
            questionContext={questionContext}
            onBack={() => {
              setQuestionContext(undefined);
            }}
          />
        )}
      </div>
      {!isAnswering && (
        <div
          className="flex flex-col items-end gap-3 pt-6"
          ref={whoIsDavidSectionRef}
        >
          {showWhoIsDavidDetails && (
            <section
              className="w-full max-w-xl rounded-[1.75rem] border border-border bg-card/95 p-5 text-left shadow-lg backdrop-blur"
              data-testid="who-is-david-panel"
            >
              <div className="space-y-3">
                <p className="font-display text-2xl tracking-wide text-foreground">
                  Meet David
                </p>
                <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                  David is an awesome guy with a love for craft beer, guitars,
                  dogs, and computer parts. His only real weakness is making
                  decisions, so this whole site exists to help him and anyone
                  else who gets stuck pick a path and move on.
                </p>
              </div>
            </section>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => {
              setShowWhoIsDavidDetails((visible) => !visible);
            }}
          >
            Who is this guy?
            {showWhoIsDavidDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AskDavid;
