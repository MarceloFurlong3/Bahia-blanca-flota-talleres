/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Cuando llames a /api/vehiculos, Next.js irá a buscarlo a Google tras bambalinas
        source: '/api/google-script',
        destination: 'https://script.google.com/macros/s/AKfycbxnXdc4_LhjMuNa8FyE5hsy7FC1_hZ4B7qN2LIw2duq1vq95ZynhcPotd3xVF5vUavHfA/exec',
      },
    ];
  },
};

export default nextConfig;