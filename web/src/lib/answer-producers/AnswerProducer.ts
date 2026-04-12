export interface AnswerProducer {
  produce(input: QuestionContext): Promise<string | null>;
}
