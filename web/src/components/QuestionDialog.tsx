import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  onClose: () => void;
  onSubmit: (questionContext: QuestionContext) => void;
};

const QuestionDialog = ({ onClose, onSubmit }: Props) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [force, setForce] = useState(false);

  const isValid = useMemo(
    () =>
      question.length > 0 &&
      options.length > 0 &&
      options.every((option) => option.length > 0),
    [question, options],
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="grid max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden"
        data-testid="question-dialog"
      >
        <DialogHeader>
          <DialogTitle>Ask something</DialogTitle>
          <DialogDescription>
            Give David a question and the possible outcomes to choose from.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 overflow-y-auto px-1 py-2">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              autoFocus
              required
              id="question"
              type="text"
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
              }}
            />
          </div>
          <div className="h-px bg-border" />
          <div className="space-y-3">
            {options.map((option, i) => (
              <div className="flex items-end gap-2" key={`option-${i}`}>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`option-${i}`}>{`Option ${i + 1}`}</Label>
                  <Input
                    required
                    id={`option-${i}`}
                    type="text"
                    value={option}
                    onChange={(event) => {
                      setOptions((prev) =>
                        prev.map((value, index) => {
                          if (index === i) {
                            return event.target.value;
                          }

                          return value;
                        }),
                      );
                    }}
                  />
                </div>
                <Button
                  aria-label="remove option"
                  disabled={i === 0}
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setOptions((prev) => prev.filter((_, j) => j !== i));
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            aria-label="add option"
            className="w-full"
            variant="outline"
            onClick={() => {
              setOptions((prev) => [...prev, ""]);
            }}
          >
            <Plus className="h-4 w-4" />
            Add option
          </Button>
          <div className="h-px bg-border" />
          <label className="flex items-center justify-end gap-3 text-sm text-muted-foreground">
            <Checkbox
              checked={force}
              onCheckedChange={(checked) => {
                setForce(checked === true);
              }}
            />
            Use force
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!isValid}
            onClick={() => {
              onSubmit({
                question,
                options,
                force,
              });
            }}
          >
            Ask
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionDialog;
