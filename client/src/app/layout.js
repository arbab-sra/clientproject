import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: "GameZone - Play & Win Real Cash",
  description: "India's #1 online gaming platform. Play Win Go, K3, Mines, Aviator and more. Win real money!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-bg min-h-screen`}>
        <AuthProvider>
          <div className="max-w-[480px] mx-auto bg-gray-bg min-h-screen relative pb-16">
            {children}
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
