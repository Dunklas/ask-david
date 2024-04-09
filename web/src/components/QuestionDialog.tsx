import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";

type Props = {
  onClose: () => void;
  onSubmit: (questionContext: QuestionContext) => void;
};

const QuestionDialog = ({ onClose, onSubmit }: Props) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Ask something</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ paddingY: 1 }}>
          <TextField
            autoFocus
            required
            label="Question"
            type="text"
            fullWidth
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
            }}
          />
          <Divider />
          {options.map((option, i) => (
            <Stack direction="row" key={`option-${i}`}>
              <TextField
                required
                label={`Option ${i + 1}`}
                type="text"
                fullWidth
                value={option}
                onChange={(event) => {
                  setOptions((prev) => [
                    ...prev.map((v, j) => {
                      if (j === i) {
                        return event.target.value;
                      }
                      return v;
                    }),
                  ]);
                }}
              />
              <IconButton
                aria-label="remove option"
                disabled={i === 0}
                onClick={() => {
                  setOptions((prev) => [...prev.filter((_, j) => j !== i)]);
                }}
              >
                <RemoveIcon />
              </IconButton>
            </Stack>
          ))}
          <Button
            aria-label="add option"
            variant="outlined"
            onClick={() => {
              setOptions((prev) => [...prev, ""]);
            }}
          >
            Add option
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            onSubmit({
              question,
              options,
            });
          }}
        >
          Ask
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionDialog;
