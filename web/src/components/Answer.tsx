import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { RandomAnswerProducer } from "../lib/answer-producers/RandomAnswerProducer";
import { useAnswerProduction } from "../lib/answer-producers/useAnswerProduction";
import { Button } from "./ui/button";

type Props = {
  questionContext: QuestionContext;
  onBack: () => void;
};

const Answer = ({ questionContext, onBack }: Props) => {
  const [producer] = useState(() => new RandomAnswerProducer());
  const production = useAnswerProduction(questionContext, producer);

  return (
    <div className="flex flex-col gap-6">
      <p className="text-center text-lg text-muted-foreground sm:text-xl">
        {questionContext.question}
      </p>
      {production.state === "loading" && (
        <div className="flex justify-center">
          <LoaderCircle
            aria-label="Generating answer"
            className="h-10 w-10 animate-spin text-accent"
            data-testid="spinner"
          />
        </div>
      )}
      {production.state === "error" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-destructive sm:text-base">
            Something went wrong while generating an answer.
          </p>
          <Button className="self-center" onClick={onBack}>
            Back
          </Button>
        </div>
      )}
      {production.state === "success" && (
        <>
          <p
            className="animate-fade-in text-center font-display text-4xl tracking-wide text-accent sm:text-5xl"
            data-testid="answer"
          >
            {production.answer}
          </p>
          <Button className="self-center" onClick={onBack}>
            Back
          </Button>
        </>
      )}
    </div>
  );
};

export default Answer;
