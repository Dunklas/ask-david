import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  responsiveFontSizes,
} from "@mui/material";
import MetalMania from "./assets/MetalMania-Regular.ttf";

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
          typography: {
            fontFamily: "Metal Mania,Roboto,Arial",
          },
          components: {
            MuiCssBaseline: {
              styleOverrides: `
                @font-face {
                  font-family: 'Metal Mania';
                  font-style: normal;
                  font-weight: 400;
                  src: url(${MetalMania}) format('truetype');
                }
              `,
            },
          },
        }),
      ),
    [prefersDarkMode],
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
