import type { MLCEngine } from "@mlc-ai/web-llm";
import type { AnswerProducer } from "./AnswerProducer";
import { selectRandomAnswer } from "./selectRandomAnswer";

const loadingDelayMs = 3000;

const davidPersona =
  "You are David. You are dry, bitter, dismissive, and very funny. You hate life, you hate people, you think everything is pointless, and you assume most people are idiots. Your humor is sharp, cynical, mean, and playful rather than long-winded. Vary the intensity a little, but every reply must clearly feel like David.";

const davidAnswerFallbacks = [
  "%s, obviously. Try to keep up.",
  "%s. Even a committee of idiots could land there.",
  "%s, för helvete. This was not difficult.",
  "%s. Grim, but less grim than your alternatives.",
];

const createLogger = (message: string, details?: unknown) => {
  if (details === undefined) {
    console.info(`[answer] ${message}`);
    return;
  }

  console.info(`[answer] ${message}`, details);
};

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

const buildRetryPrompt = (
  questionContext: QuestionContext,
  selectedOption: string,
  previousReply: string,
) => {
  return [
    buildPrompt(questionContext, selectedOption),
    `Previous reply: ${previousReply}`,
    "That reply was too bland. Rewrite it as one short sentence with sharper David-style sarcasm. You must include the selected answer text verbatim, and it must be more than just the answer plus punctuation.",
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
        content: `${davidPersona} Reply with exactly one short sentence in the same language as the user's question. The selected answer is already decided, so do not change it. You must include the selected answer text verbatim in the reply. Do not be polite, helpful, or enthusiastic. No lists, no emojis, no explanations.`,
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
        content: `${davidPersona} Reply with exactly one short diss in the same language as the user's question. Do not answer the question and do not list the options. Be rude, funny, and dismissive. No lists, no emojis, no explanations.`,
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

const escapeRegExp = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const isBlandAnswer = (answer: string, selectedOption: string) => {
  const trimmedAnswer = answer.trim();
  const blandPattern = new RegExp(
    `^${escapeRegExp(selectedOption)}[.!?]*$`,
    "i",
  );

  if (blandPattern.test(trimmedAnswer)) {
    return true;
  }

  const words = trimmedAnswer.split(/\s+/).filter(Boolean);

  return words.length < 3;
};

const buildDavidFallbackAnswer = (selectedOption: string) => {
  const template =
    davidAnswerFallbacks[
      Math.floor(Math.random() * davidAnswerFallbacks.length)
    ];

  return template.replace("%s", selectedOption);
};

const getStyledResponseText = async (
  engine: MLCEngine,
  questionContext: QuestionContext,
  selectedOption: string,
) => {
  const response = await getResponseText(
    engine,
    questionContext,
    selectedOption,
  );

  if (!isBlandAnswer(response, selectedOption)) {
    return response;
  }

  createLogger("WebLLM answer was too bland, retrying once", {
    question: questionContext.question,
    selectedOption,
    response,
  });

  const retryCompletion = await engine.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `${davidPersona} Reply with exactly one short sentence in the same language as the user's question. The selected answer is already decided, so do not change it. You must include the selected answer text verbatim in the reply. Do not be polite, helpful, or enthusiastic. No lists, no emojis, no explanations.`,
      },
      {
        role: "user",
        content: buildRetryPrompt(questionContext, selectedOption, response),
      },
    ],
    max_tokens: 48,
    temperature: 0.9,
  });

  const retryResponse =
    retryCompletion.choices[0]?.message.content?.trim() || selectedOption;

  if (!isBlandAnswer(retryResponse, selectedOption)) {
    return retryResponse;
  }

  createLogger("WebLLM retry was still too bland, using local fallback", {
    question: questionContext.question,
    selectedOption,
    retryResponse,
  });

  return buildDavidFallbackAnswer(selectedOption);
};

export class RandomAnswerWithWebLLMProducer implements AnswerProducer {
  constructor(private readonly engine: MLCEngine) {}

  async produce(input: QuestionContext) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, loadingDelayMs);
    });

    const selectedOption = selectRandomAnswer(input);
    createLogger("Selected answer before WebLLM phrasing", {
      question: input.question,
      selectedOption,
    });

    try {
      if (selectedOption === null) {
        return await getDissText(this.engine, input);
      }

      return await getStyledResponseText(this.engine, input, selectedOption);
    } catch (error) {
      createLogger(
        selectedOption === null
          ? "WebLLM diss generation failed, falling back to null"
          : "WebLLM phrasing failed, falling back to selected option",
        {
          error,
          question: input.question,
          selectedOption,
        },
      );

      return selectedOption;
    }
  }
}
