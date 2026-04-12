export const selectRandomAnswer = ({
  options,
  authenticMode,
}: QuestionContext): string | null => {
  const possibleAnswers = authenticMode
    ? options.concat(new Array(options.length).fill(null))
    : options;

  return possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
};
