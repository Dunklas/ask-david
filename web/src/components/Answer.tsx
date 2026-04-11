import { useEffect, useMemo, useState } from "react";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import { Button } from "./ui/button";

type Props = {
  questionContext: QuestionContext;
  onBack: () => void;
};

const Answer = ({ questionContext, onBack }: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeoutId = setInterval(() => {
      setProgress((progress) => (progress >= 100 ? 100 : progress + 10));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  const answer = useMemo(() => {
    const possibleAnswers = [...questionContext.options].concat(
      questionContext.force
        ? []
        : new Array(questionContext.options.length).fill("..."),
    );
    const shuffled = [...possibleAnswers].sort(() => 0.5 - Math.random());
    return shuffled[0];
  }, [questionContext]);

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
          <p
            className="animate-fade-in text-center font-display text-4xl tracking-wide text-accent sm:text-5xl"
            data-testid="answer"
          >
            {answer}
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
