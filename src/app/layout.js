import { Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  weight: ["700", "900"],
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
  display: "swap",
});

export const metadata = {
  title: "THE SYSTEM",
  description: "The System welcomes you.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${shareTechMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
