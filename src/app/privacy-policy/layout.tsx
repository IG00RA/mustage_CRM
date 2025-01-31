export const metadata = {
  title: 'Mustage Course | Privacy-Policy',
  description: 'Mustage Course | Privacy-Policy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
