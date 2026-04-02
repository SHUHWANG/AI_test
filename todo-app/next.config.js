/** @type {import('next').NextConfig} */
const nextConfig = {
  // 将 serverActions 配置移到 experimental 下
  experimental: {
    serverActions: {
      allowedOrigins: [
        'aitest1.20010126.xyz',
        'localhost:3000',
        '*.edgeone.app',
      ],
      // 关键：信任 EdgeOne 的代理转发主机（使用通配符）
      allowedForwardedHosts: [
        '*.pages-scf-gz-pro.qcloudteo.com',
      ],
    },
  },
};

module.exports = nextConfig;