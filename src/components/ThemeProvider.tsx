import React from "react";
import { ThemeProvider } from "next-themes";

interface Props {
  children: React.ReactNode;
}

export const ThemeProviderWrapper: React.FC<Props> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
};
