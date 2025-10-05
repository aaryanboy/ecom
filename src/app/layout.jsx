import "./globals.css";
import { ThemeProvider } from "./(theme)/ThemeContext";
import SideBar from "@/components/SideBar";
import ThemeWrapper from "./(theme)/ThemeWrapper"; // 👈 new client component

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ThemeWrapper>
            <div className="flex">
              <SideBar />
              <main className="ml-56 flex-1">{children}</main>
            </div>
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
