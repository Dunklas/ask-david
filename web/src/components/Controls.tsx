import { Button, Stack } from "@mui/material";

type Props = {
  onAsk: () => void;
  onWhoIs: () => void;
};

const Controls = ({ onAsk, onWhoIs }: Props) => (
  <Stack direction="column" spacing={2}>
    <Button variant="contained" onClick={onAsk}>
      Ask something
    </Button>
    <Button variant="contained" onClick={onWhoIs}>
      Who is David?
    </Button>
  </Stack>
);

export default Controls;
