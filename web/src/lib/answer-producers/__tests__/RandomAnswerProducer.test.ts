import { RandomAnswerProducer } from "../RandomAnswerProducer";

test("returns an answer after loading", async () => {
  vi.useFakeTimers();
  const producer = new RandomAnswerProducer();

  const answerPromise = producer.produce({
    question: "What to do?",
    options: ["Eat", "Drink"],
    authenticMode: false,
  });

  vi.advanceTimersByTime(3000);

  await expect(answerPromise).resolves.toMatch(/^(Eat|Drink)$/);
});

test("can return null in authentic mode", async () => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0.99);
  const producer = new RandomAnswerProducer();

  const answerPromise = producer.produce({
    question: "What to do?",
    options: ["Eat", "Drink"],
    authenticMode: true,
  });

  vi.advanceTimersByTime(3000);

  await expect(answerPromise).resolves.toBeNull();
});
