/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 환경변수를 webpack DefinePlugin으로 강제 주입
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NEXT_PUBLIC_FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
        'process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
        'process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID),
        'process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
        'process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
        'process.env.NEXT_PUBLIC_FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID),
      })
    );
    
    return config;
  },
}

module.exports = nextConfig 