import { useEffect, useState } from "react";
import type { AnswerProducer } from "./AnswerProducer";
import type { AnswerProduction } from "./types";

export const useAnswerProduction = (
  questionContext: QuestionContext,
  producer: AnswerProducer,
) => {
  const [production, setProduction] = useState<AnswerProduction>({
    state: "loading",
    answer: null,
  });

  useEffect(() => {
    let cancelled = false;

    setProduction({ state: "loading", answer: null });

    producer
      .produce(questionContext)
      .then((answer) => {
        if (cancelled) {
          return;
        }

        setProduction({ state: "success", answer });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setProduction({ state: "error", answer: null });
      });

    return () => {
      cancelled = true;
    };
  }, [producer, questionContext]);

  return production;
};
