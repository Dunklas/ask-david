import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  responsiveFontSizes
} from "@mui/material";

import AskDavid from "./pages/AskDavid";
import { useMemo } from "react";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const userTheme = useMemo(() => responsiveFontSizes(createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light'
    }
  })), [prefersDarkMode]);

  return (
    <ThemeProvider theme={userTheme}>
      <CssBaseline/>
      <Container sx={{ padding: 2 }}>
        <AskDavid />
      </Container>
    </ThemeProvider>
  );
}

export default App;
