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
    authenticMode: false,
  });

  await vi.advanceTimersByTimeAsync(3000);

  await expect(answerPromise).resolves.toBe(
    "This gloomy morning calls for Stout!",
  );
  expect(create).toHaveBeenCalledOnce();
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({
      messages: expect.arrayContaining([
        expect.objectContaining({
          role: "system",
          content: expect.stringContaining("You are David."),
        }),
      ]),
    }),
  );
});

test("retries once when the first WebLLM answer is too bland", async () => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0.99);
  const create = vi
    .fn()
    .mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "Stout.",
          },
        },
      ],
    })
    .mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "Stout, obviously. The rest sounds like a cry for help.",
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
    authenticMode: false,
  });

  await vi.advanceTimersByTimeAsync(3000);

  await expect(answerPromise).resolves.toBe(
    "Stout, obviously. The rest sounds like a cry for help.",
  );
  expect(create).toHaveBeenCalledTimes(2);
});

test("uses a local fallback when retry is still too bland", async () => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValueOnce(0.99).mockReturnValueOnce(0);
  const create = vi
    .fn()
    .mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "Stout.",
          },
        },
      ],
    })
    .mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "Stout!",
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
    authenticMode: false,
  });

  await vi.advanceTimersByTimeAsync(3000);

  await expect(answerPromise).resolves.toBe(
    "Stout, obviously. Try to keep up.",
  );
  expect(create).toHaveBeenCalledTimes(2);
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
    authenticMode: false,
  });

  await vi.advanceTimersByTimeAsync(3000);

  await expect(answerPromise).resolves.toMatch(/^(IPA|Stout)$/);
});

test("returns a diss when authentic mode produces no answer", async () => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0.99);
  const create = vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "You don't deserve breakfast.",
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
    authenticMode: true,
  });

  await vi.advanceTimersByTimeAsync(3000);

  await expect(answerPromise).resolves.toBe("You don't deserve breakfast.");
  expect(create).toHaveBeenCalledOnce();
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({
      messages: expect.arrayContaining([
        expect.objectContaining({
          role: "system",
          content: expect.stringContaining("Reply with exactly one short diss"),
        }),
      ]),
    }),
  );
});
