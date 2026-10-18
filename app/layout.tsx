import "./globals.css";
import { Noto_Sans_Thai } from "next/font/google";
const font = Noto_Sans_Thai({ subsets: ["thai", "latin"], weight: ["400", "500", "700"] });

export const metadata = { title: "Bean Vault · คลังเมล็ดกาแฟ" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="th"><body className={font.className}>{children}</body></html>;
}
