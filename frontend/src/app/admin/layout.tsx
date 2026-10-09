'use client'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>Later <div>{children}</div> </div>
  );
}
