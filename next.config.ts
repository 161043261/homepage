import type { NextConfig } from "next";
import nextra from "nextra";

// Set up Nextra with its configuration
const withNextra = nextra({
  // ... Add Nextra-specific options here
});

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/homepage",
  output: "export",
  images: {
    unoptimized: true,
  },
};

// Export the final Next.js config with Nextra included
export default withNextra(nextConfig);
