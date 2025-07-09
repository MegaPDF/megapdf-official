
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  //output: 'standalone',
  basePath: '',
  // assetPrefix: 'https://mega-pdf.com/',
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-icons',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip',
    ],
  },
  serverExternalPackages: ['canvas', 'sharp', 'tesseract.js'],
  turbopack: {
    resolveAlias: {
      // Canvas alias not needed for Turbopack; handled in Webpack if required
    },
  },
  // Fallback to Webpack for production builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias.canvas = false; // Maintain canvas alias for Webpack
    }
    return config;
  },
};

module.exports = nextConfig;