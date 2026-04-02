/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
     allowedOrigins: [
        'aitest1.20010126.xyz',
        'localhost:3000',        // 本地开发
        '*.edgeone.app',         // 允许 EdgeOne 默认域名
    ],
  },
};

module.exports = nextConfig;
