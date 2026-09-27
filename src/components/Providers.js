"use client";

import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { BookmarksProvider } from "@/context/BookmarksContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { StreakProvider } from "@/context/StreakContext";
import { ProfilesProvider } from "@/context/ProfilesContext";
import { DownloadsProvider } from "@/context/DownloadsContext";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProfilesProvider>
            <BookmarksProvider>
              <ProgressProvider>
                <StreakProvider>
                  <DownloadsProvider>{children}</DownloadsProvider>
                </StreakProvider>
              </ProgressProvider>
            </BookmarksProvider>
          </ProfilesProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
