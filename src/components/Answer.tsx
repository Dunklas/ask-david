import { Box, Button, Stack, Typography } from "@mui/material";
import { useMemo } from "react";

type Props = {
  questionContext: QuestionContext;
  onAskAgain: () => void;
};

const Answer = ({ questionContext, onAskAgain }: Props) => {
  const answer = useMemo(() => {
    const shuffled = [...questionContext.options].sort(
      () => 0.5 - Math.random()
    );
    return shuffled[0];
  }, [questionContext]);

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        {questionContext.question}
      </Typography>
      <Typography variant="h3" sx={{ textAlign: "center" }}>
        {answer}
      </Typography>
      <Button variant="contained" onClick={onAskAgain}>
        Ask again
      </Button>
    </Stack>
  );
};

export default Answer;
