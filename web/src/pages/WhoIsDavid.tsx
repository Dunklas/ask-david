import { Stack, Typography } from "@mui/material";
import David from "../components/David";

const WhoIsDavid = () => (
  <Stack direction="column" spacing={2} alignItems="center">
    <Typography variant="h1" gutterBottom sx={{ textAlign: "center" }}>
      Ask David
    </Typography>
    <David />
    <Typography>
      David is truly an awesome guy with a diverse set of passions.
      He appreciates a good craft beer, is keen on keeping up with the latest in technology—especially when it comes to computer parts—and he has a deep appreciation for music, evident in his love for guitars.
      Above all, he's a devoted animal lover, with dogs holding a special place in his heart.
    </Typography>
    <Typography>
      However, David faces a challenge that many of us encounter: decision making.
      It's not that he's incapable of making decisions; rather, he tends to avoid making them altogether. 
    </Typography>
    <Typography>
      This website is dedicated to helping David (and anyone else who finds themselves in a similar predicament) conquer this hurdle.
    </Typography>
  </Stack>
);

export default WhoIsDavid;
