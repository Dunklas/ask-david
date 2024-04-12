import { Box, Button, Fade, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import CircularProgressWithLabel from "./CircularProgressWithLabel";

type Props = {
  questionContext: QuestionContext;
  onBack: () => void;
};

const Answer = ({ questionContext, onBack }: Props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeoutId = setInterval(() => {
      setProgress((progress) => (progress >= 100 ? 100 : progress + 10));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  const answer = useMemo(() => {
    const possibleAnswers = [...questionContext.options].concat(
      questionContext.force
        ? []
        : new Array(questionContext.options.length).fill("..."),
    );
    const shuffled = [...possibleAnswers].sort(() => 0.5 - Math.random());
    return shuffled[0];
  }, [questionContext]);

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        {questionContext.question}
      </Typography>
      {progress < 100 && (
        <Box display="flex" justifyContent="center">
          <CircularProgressWithLabel value={progress}/>
        </Box>
      )}
      {progress >= 100 && (
        <>
          <Fade in timeout={2000}>
            <Typography variant="h3" sx={{ textAlign: "center" }} data-testid="answer">
              {answer}
            </Typography>
          </Fade>
          <Button variant="contained" onClick={onBack}>
            Back
          </Button>
        </>
      )}
    </Stack>
  );
};

export default Answer;
