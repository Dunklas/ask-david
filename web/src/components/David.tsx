import { Box } from "@mui/material";
import david from "../assets/david3.webp";

const David = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      maxHeight: { xs: 600, sm: 650, md: 700, lg: 750, xl: 800 },
    }}
  >
    <img
      data-testid="david"
      src={david}
      alt="David"
      style={{
        objectFit: "scale-down",
        maxWidth: "100%",
        filter: "drop-shadow(0 0 28px rgba(0, 0, 0, 0.16))",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 72%, transparent 100%)",
        maskImage:
          "radial-gradient(ellipse at center, black 72%, transparent 100%)",
      }}
    />
  </Box>
);

export default David;
