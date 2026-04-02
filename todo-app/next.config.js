/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    allowedOrigins: [
      'aitest1.20010126.xyz',
      'localhost:3000',
      '*.edgeone.app',
    ],
    // 关键：允许 EdgeOne 的代理转发主机
    allowedForwardedHosts: [
      '*.pages-scf-gz-pro.qcloudteo.com',
      'pages-pro-*.pages-scf-gz-pro.qcloudteo.com',
    ],
  },
};

module.exports = nextConfig;