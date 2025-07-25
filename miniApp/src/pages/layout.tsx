import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <script 
          src="https://telegram.org/js/telegram-web-app.js"
          async
        ></script>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}