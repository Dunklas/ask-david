import { Stack, Typography } from "@mui/material";
import David from "../components/David";

const WhoIsDavid = () => (
  <Stack direction="column" spacing={2} alignItems="center">
    <Typography variant="h1" gutterBottom sx={{ textAlign: "center" }}>
      Ask David
    </Typography>
    <David />
    <Typography>
      David is an extraordinary individual with a zest for life! He's a
      connoisseur of craft beer, a tech enthusiast who loves investing in the
      latest computer parts, a guitar aficionado, and an ardent animal lover
      with a special place in his heart for dogs.
    </Typography>
    <Typography>
      However, David faces a challenge that many of us encounter: decision
      making. It's not that he's incapable of making decisions; rather, he tends
      to avoid making them altogether. This website is dedicated to helping
      David (and anyone else who finds themselves in a similar predicament)
      conquer this hurdle.
    </Typography>
  </Stack>
);

export default WhoIsDavid;
