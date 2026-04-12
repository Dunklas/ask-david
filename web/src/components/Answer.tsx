import { useEffect, useMemo, useState } from "react";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import { Button } from "./ui/button";
import {
  getLocalAiStatus,
  generateLocalAiAnswer,
  subscribeToLocalAiStatus,
} from "../lib/local-ai";

type Props = {
  questionContext: QuestionContext;
  onBack: () => void;
};

const Answer = ({ questionContext, onBack }: Props) => {
  const [progress, setProgress] = useState(0);
  const [displayAnswer, setDisplayAnswer] = useState<string>();
  const [aiStatus, setAiStatus] = useState<string>();
  const [aiError, setAiError] = useState<string>();
  const [localAiStatus, setLocalAiStatus] = useState(() => getLocalAiStatus());

  useEffect(() => subscribeToLocalAiStatus(setLocalAiStatus), []);

  useEffect(() => {
    const timeoutId = setInterval(() => {
      setProgress((progress) => (progress >= 100 ? 100 : progress + 10));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  const selectedAnswer = useMemo(() => {
    const possibleAnswers = [...questionContext.options].concat(
      questionContext.force
        ? []
        : new Array(questionContext.options.length).fill("..."),
    );
    const shuffled = [...possibleAnswers].sort(() => 0.5 - Math.random());
    return shuffled[0];
  }, [questionContext]);

  useEffect(() => {
    setDisplayAnswer(undefined);
    setAiStatus(undefined);
    setAiError(undefined);

    if (progress < 100) {
      return;
    }

    if (localAiStatus !== "ready") {
      setDisplayAnswer(selectedAnswer);
      return;
    }

    let ignore = false;

    setAiStatus("David is thinking.");

    generateLocalAiAnswer(questionContext, selectedAnswer, (statusText) => {
      if (!ignore) {
        setAiStatus(statusText);
      }
    })
      .then((answer) => {
        if (ignore) {
          return;
        }

        setDisplayAnswer(answer);
        setAiStatus(undefined);
      })
      .catch((error: unknown) => {
        if (ignore) {
          return;
        }

        console.error("Local AI response failed", error);
        setDisplayAnswer(selectedAnswer);
        setAiStatus(undefined);
        setAiError(
          error instanceof Error
            ? `Local AI could not respond: ${error.message}`
            : "Local AI could not respond.",
        );
      });

    return () => {
      ignore = true;
    };
  }, [localAiStatus, progress, questionContext, selectedAnswer]);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-lg text-muted-foreground sm:text-xl">
        {questionContext.question}
      </p>
      {progress < 100 && (
        <div className="flex justify-center">
          <CircularProgressWithLabel value={progress} />
        </div>
      )}
      {progress >= 100 && (
        <>
          {aiError && (
            <p
              className="text-center text-sm leading-6 text-muted-foreground sm:text-base"
              data-testid="ai-error"
            >
              {aiError}
            </p>
          )}
          {displayAnswer ? (
            <p
              className="animate-fade-in text-center font-display text-4xl tracking-wide text-accent sm:text-5xl"
              data-testid="answer"
            >
              {displayAnswer}
            </p>
          ) : (
            <p
              className="animate-fade-in text-center text-sm leading-6 text-muted-foreground sm:text-base"
              data-testid="ai-status"
            >
              {aiStatus}
            </p>
          )}
          <Button className="self-center" onClick={onBack}>
            Back
          </Button>
        </>
      )}
    </div>
  );
};

export default Answer;
