export type AnswerProducerState = "loading" | "success" | "error";

export type AnswerProduction =
  | {
      state: "loading";
      answer: null;
    }
  | {
      state: "success";
      answer: string | null;
    }
  | {
      state: "error";
      answer: null;
    };
