import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import Chatbot from '../components/Chatbot';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Component {...pageProps} />
        <Chatbot />
      </LanguageProvider>
    </ThemeProvider>
  );
}
