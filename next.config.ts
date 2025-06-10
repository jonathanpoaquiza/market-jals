import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    domains: ["localhost", "example.com"], // Ajusta los dominios según tu app
  },

  webpack: (config, { isServer }) => {
    // Solo aplica el alias en el cliente
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "node:process": "process/browser",
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
        })
      );
    }

    return config;
  },
};

export default nextConfig;
