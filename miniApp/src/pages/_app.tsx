import './globals.css'; // ou './globals.css' dependendo de onde está

import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
