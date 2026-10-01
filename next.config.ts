import type { NextConfig } from "next";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://yen-portfolio-git-master-inn162s-projects.vercel.app",
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${ALLOWED_ORIGINS.join(" ")}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
