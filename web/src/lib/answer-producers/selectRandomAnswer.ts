export const selectRandomAnswer = ({ options, force }: QuestionContext) => {
  const possibleAnswers = options.concat(
    force ? [] : new Array(options.length).fill("..."),
  );

  return possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
};
