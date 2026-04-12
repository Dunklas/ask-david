import { RandomAnswerProducer } from "../RandomAnswerProducer";

test("returns an answer after loading", async () => {
  vi.useFakeTimers();
  const producer = new RandomAnswerProducer();

  const answerPromise = producer.produce({
    question: "What to do?",
    options: ["Eat", "Drink"],
    force: false,
  });

  vi.advanceTimersByTime(3000);

  await expect(answerPromise).resolves.toMatch(/^Eat|Drink|\.\.\.$/);
});
