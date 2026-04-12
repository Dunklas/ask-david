import type { MLCEngine } from "@mlc-ai/web-llm";
import type { AnswerProducer } from "./AnswerProducer";
import { selectRandomAnswer } from "./selectRandomAnswer";

const loadingDelayMs = 3000;

const buildPrompt = (
  questionContext: QuestionContext,
  selectedOption: string,
) => {
  const options = questionContext.options
    .map((option, index) => `${index + 1}. ${option}`)
    .join("\n");

  return [
    `Question: ${questionContext.question}`,
    `Options:\n${options}`,
    `Selected answer: ${selectedOption}`,
    questionContext.authenticMode
      ? "Authentic mode is enabled."
      : "Authentic mode is disabled.",
  ].join("\n\n");
};

const buildDissPrompt = (questionContext: QuestionContext) => {
  const options = questionContext.options
    .map((option, index) => `${index + 1}. ${option}`)
    .join("\n");

  return [
    `Question: ${questionContext.question}`,
    `Options:\n${options}`,
    "There is no answer this time.",
    "Write a short diss in the same language as the question. It may or may not relate to the question.",
  ].join("\n\n");
};

const getResponseText = async (
  engine: MLCEngine,
  questionContext: QuestionContext,
  selectedOption: string,
) => {
  const completion = await engine.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are David, a playful decision helper. Reply with exactly one short sentence in the same language as the user's question. The selected answer is already decided, so do not change it. Mention or clearly imply the selected answer.",
      },
      {
        role: "user",
        content: buildPrompt(questionContext, selectedOption),
      },
    ],
    max_tokens: 48,
    temperature: 0.8,
  });

  return completion.choices[0]?.message.content?.trim() || selectedOption;
};

const getDissText = async (
  engine: MLCEngine,
  questionContext: QuestionContext,
) => {
  const completion = await engine.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are David, a rude and dismissive decision helper. Reply with exactly one short diss in the same language as the user's question. Do not answer the question and do not list the options.",
      },
      {
        role: "user",
        content: buildDissPrompt(questionContext),
      },
    ],
    max_tokens: 48,
    temperature: 1,
  });

  return completion.choices[0]?.message.content?.trim() || null;
};

export class RandomAnswerWithWebLLMProducer implements AnswerProducer {
  constructor(private readonly engine: MLCEngine) {}

  async produce(input: QuestionContext) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, loadingDelayMs);
    });

    const selectedOption = selectRandomAnswer(input);

    try {
      if (selectedOption === null) {
        return await getDissText(this.engine, input);
      }

      return await getResponseText(this.engine, input, selectedOption);
    } catch {
      return selectedOption;
    }
  }
}
