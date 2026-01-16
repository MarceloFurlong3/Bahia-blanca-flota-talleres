/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para permitir imágenes de Google Drive
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
    ],
  },
  
  // Tu configuración actual de API
  async rewrites() {
    return [
      {
        source: '/api/google-script',
        destination: 'https://script.google.com/macros/s/AKfycbxnXdc4_LhjMuNa8FyE5hsy7FC1_hZ4B7qN2LIw2duq1vq95ZynhcPotd3xVF5vUavHfA/exec',
      },
    ];
  },
};

export default nextConfig;