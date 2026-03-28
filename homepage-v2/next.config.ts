import type { NextConfig } from "next";
import nextra from "nextra";

// Set up Nextra with its configuration
const withNextra = nextra({
  // ... Add Nextra-specific options here
});

const nextConfig: NextConfig = {
  /* config options here */
};

// Export the final Next.js config with Nextra included
export default withNextra(nextConfig);
