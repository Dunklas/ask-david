import { Box, Stack, Typography } from "@mui/material";
import David from "../components/David";
import Controls from "../components/Controls";
import { useState } from "react";
import QuestionDialog from "../components/QuestionDialog";

const AskDavid = () => {
  const [questionContext, setQuestionContext] = useState<QuestionContext>();
  const [showDialog, setShowDialog] = useState(false);

  return (
    <Stack direction="column" spacing={2} alignItems="center">
      <Typography variant="h1" gutterBottom sx={{ textAlign: "center" }}>
        Ask David
      </Typography>
      <David />
      <Box maxWidth="50%">
        <Controls
          onAsk={() => {
            setShowDialog(true);
          }}
          onWhoIs={() => {}}
        />
      </Box>
      {showDialog && (
        <QuestionDialog
          onClose={() => {
            setShowDialog(false);
          }}
          onSubmit={(questioContext) => {
            console.log(questioContext);
          }}
        />
      )}
    </Stack>
  );
};

export default AskDavid;
