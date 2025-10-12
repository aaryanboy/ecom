import "./globals.css";
import { ThemeProvider } from "./(theme)/ThemeContext";
import  Header  from "@/components/Header";
import ThemeWrapper from "./(theme)/ThemeWrapper";
import { AuthProvider } from "./(auth)/AuthContext"; // ✅ import

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ThemeWrapper>
            <AuthProvider> {/* ✅ wrap your app here */}
              <div className="flex">
                <Header />
                <main className="pt-20 flex-1">{children}</main>
              </div>
            </AuthProvider>
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
