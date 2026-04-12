import type { MLCEngine } from "@mlc-ai/web-llm";
import { RandomAnswerWithWebLLMProducer } from "../RandomAnswerWithWebLLMProducer";

test("returns a short llm-written answer when WebLLM succeeds", async () => {
  vi.useFakeTimers();
  const create = vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "This gloomy morning calls for Stout!",
        },
      },
    ],
  });
  const engine = {
    chat: {
      completions: {
        create,
      },
    },
  } as unknown as MLCEngine;
  const producer = new RandomAnswerWithWebLLMProducer(engine);

  const answerPromise = producer.produce({
    question: "What should we have for breakfast?",
    options: ["IPA", "Stout"],
    force: true,
  });

  await vi.advanceTimersByTimeAsync(3000);

  await expect(answerPromise).resolves.toBe(
    "This gloomy morning calls for Stout!",
  );
  expect(create).toHaveBeenCalledOnce();
});

test("falls back to the selected option when WebLLM phrasing fails", async () => {
  vi.useFakeTimers();
  const engine = {
    chat: {
      completions: {
        create: vi.fn().mockRejectedValue(new Error("boom")),
      },
    },
  } as unknown as MLCEngine;
  const producer = new RandomAnswerWithWebLLMProducer(engine);

  const answerPromise = producer.produce({
    question: "What should we have for breakfast?",
    options: ["IPA", "Stout"],
    force: true,
  });

  await vi.advanceTimersByTimeAsync(3000);

  await expect(answerPromise).resolves.toMatch(/^IPA|Stout$/);
});
