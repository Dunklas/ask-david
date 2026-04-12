import type { AnswerProducer } from "./AnswerProducer";
import { selectRandomAnswer } from "./selectRandomAnswer";

const loadingDelayMs = 3000;

export class RandomAnswerProducer implements AnswerProducer {
  async produce(input: QuestionContext) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, loadingDelayMs);
    });

    return selectRandomAnswer(input);
  }
}
