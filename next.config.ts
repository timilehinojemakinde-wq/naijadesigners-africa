import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@tensorflow/tfjs",
    "@tensorflow/tfjs-core",
    "@tensorflow/tfjs-backend-webgl",
    "@tensorflow/tfjs-backend-webgpu",
    "@tensorflow/tfjs-converter",
    "@tensorflow-models/pose-detection",
    "@mediapipe/pose",
  ],
  turbopack: {},
};

export default nextConfig;