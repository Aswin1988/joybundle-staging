import './globals.css';

export const metadata = {
  title: 'JoyBundle | Birthday return gifts made easy',
  description: 'Customized kids’ birthday return-gift bundles in Bangalore.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
