import { Box, Stack, Typography } from "@mui/material";
import David from "../components/David";
import Controls from "../components/Controls";

const AskDavid = () => {
  return (
    <Stack direction="column" spacing={2} alignItems="center">
      <Typography variant="h1" gutterBottom sx={{ textAlign: "center" }}>
        Ask David
      </Typography>
      <David />
      <Box maxWidth="50%">
        <Controls />
      </Box>
    </Stack>
  );
};

export default AskDavid;
