import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@huggingface/transformers", "sharp", "@stellar/stellar-sdk"],
};

export default nextConfig;
