import { Box } from "@mui/material";
import david from "../assets/david2.png";

const David = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      maxHeight: { xs: 600, sm: 650, md: 700, lg: 750, xl: 800 },
    }}
  >
    <img
      src={david}
      alt="David"
      style={{ objectFit: "fill", maxWidth: "100%" }}
    />
  </Box>
);

export default David;
