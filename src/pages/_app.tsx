import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { api } from "@/utils/api";
import { Layout } from "@/components/Layout";
import "@/styles/globals.css";
import "@/styles/ui-enhancements.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);