import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control de válvula",
  description: "Panel remoto para electroválvula ESP32",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
