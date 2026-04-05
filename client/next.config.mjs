/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.29.146", "192.168.*.*", "localhost"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
      // ← Yeh add karo
      {
        source: "/:path*", // /auth/signup bhi catch karega
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`, // /api/auth/signup pe bhejega
      },
    ];
  },
};

export default nextConfig;
