import { Box, Button, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import David from "../components/David";
import { useState } from "react";
import QuestionDialog from "../components/QuestionDialog";
import Answer from "../components/Answer";

const AskDavid = () => {
  const [questionContext, setQuestionContext] = useState<QuestionContext>();
  const [showDialog, setShowDialog] = useState(false);

  return (
    <Box>
      <Link
        to="/who"
        component={RouterLink}
        sx={{ position: "absolute", bottom: 0, right: 0, padding: 2 }}
      >
        Who is this guy?
      </Link>
      <Typography></Typography>
      <Stack direction="column" spacing={2} alignItems="center">
        <Typography variant="h1" gutterBottom sx={{ textAlign: "center" }}>
          Ask David
        </Typography>
        <David />
        {!questionContext && (
          <Box maxWidth="50%">
            <Button
              size="large"
              variant="text"
              onClick={() => {
                setShowDialog(true);
              }}
            >
              Ask something
            </Button>
          </Box>
        )}
        {showDialog && (
          <QuestionDialog
            onClose={() => {
              setShowDialog(false);
            }}
            onSubmit={(questionContext) => {
              setQuestionContext(questionContext);
              setShowDialog(false);
            }}
          />
        )}
        {questionContext && (
          <Answer
            questionContext={questionContext}
            onBack={() => {
              setQuestionContext(undefined);
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

export default AskDavid;
