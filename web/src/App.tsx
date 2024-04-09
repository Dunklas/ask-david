import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  responsiveFontSizes,
} from "@mui/material";

import AskDavid from "./pages/AskDavid";
import { useMemo } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import WhoIsDavid from "./pages/WhoIsDavid";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const userTheme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme({
          palette: {
            mode: prefersDarkMode ? "dark" : "light",
          },
        })
      ),
    [prefersDarkMode]
  );

  const router = createBrowserRouter([
    {
      path: "/",
      element: <AskDavid />,
    },
    {
      path: "/who",
      element: <WhoIsDavid />,
    },
  ]);

  return (
    <ThemeProvider theme={userTheme}>
      <CssBaseline />
      <Container sx={{ padding: 2 }}>
        <RouterProvider router={router} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
