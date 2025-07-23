import './globals.css'; // ou './globals.css' dependendo de onde está

import type { AppProps } from 'next/app';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import Header from '../components/header';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TonConnectUIProvider manifestUrl="https://hack-a-thon-g2.vercel.app/tonconnect-manifest.json">
      <Header />
      <Component {...pageProps} />
    </TonConnectUIProvider>
  );
}