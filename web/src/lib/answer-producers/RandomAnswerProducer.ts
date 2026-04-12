import type { AnswerProducer } from "./AnswerProducer";

const loadingDelayMs = 3000;

const selectRandomAnswer = ({ options, force }: QuestionContext) => {
  const possibleAnswers = options.concat(
    force ? [] : new Array(options.length).fill("..."),
  );

  return possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
};

export class RandomAnswerProducer implements AnswerProducer {
  async produce(input: QuestionContext) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, loadingDelayMs);
    });

    return selectRandomAnswer(input);
  }
}
