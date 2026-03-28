import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import { PropsWithChildren } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Homepage",
    default: "Homepage",
  },
  description:
    "A modern, high-performance static site built with Next.js and Nextra.",
  metadataBase: new URL("https://github.com/161043261/homepage"),
  openGraph: {
    title: "Homepage",
    description: "Welcome to our Homepage site.",
    siteName: "Homepage",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

const banner = (
  <Banner
    storageKey="homepage-banner"
    className="bg-blue-50! text-blue-700! dark:bg-blue-900/40! dark:text-blue-200!"
  >
    Welcome to Homepage
  </Banner>
);

const navbar = (
  <Navbar
    logo={<span className="text-lg font-bold tracking-tight">Homepage</span>}
    projectLink="https://github.com/161043261/homepage"
  />
);

const footer = (
  <Footer>
    <div className="flex w-full items-center justify-between">
      <span>MIT {new Date().getFullYear()} © Homepage.</span>
      <span className="text-sm opacity-70">Built with Nextra & Next.js</span>
    </div>
  </Footer>
);

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body className="antialiased" suppressHydrationWarning>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/161043261/homepage/tree/main/docs"
          footer={footer}
          editLink="Edit this page on GitHub"
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
