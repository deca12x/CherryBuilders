/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
	  serverComponentsExternalPackages: ['pdfkit', 'canvas'],
	},
	webpack: (config, { isServer }) => {
	  if (!isServer) {
		config.resolve.fallback = {
		  ...config.resolve.fallback,
		  fs: false,
		  stream: false,
		  canvas: false,
		};
	  }
	  config.externals.push('pino-pretty', 'lokijs', 'encoding');
	  return config;
	},
  };
  
module.exports = nextConfig;