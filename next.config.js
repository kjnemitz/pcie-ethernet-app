const withAntdLess = require('next-plugin-antd-less');

module.exports = withAntdLess ({
  modifyVars: { '@primary-color': '#04f' },
  lessVarsFilePath: "./styles/antd-variables.less",
  reactStrictMode: true,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            icon: true,
          },
        },
      ],
    });
    return config;
  },
  async headers() {
    return [
      {
        source: '/api/:slug*',
        headers: [
          {
            key: 'Accept',
            value: 'application/json',
          },
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Authorization',
            value: 'Basic '+Buffer.from('admin:10-9#One').toString('base64'),
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/eem/:slug*',
        destination: 'http://192.168.1.71:30500/eem/:slug*',
      },
      {
        source: '/api/pcielookup/:slug*',
        destination: 'https://pcilookup.com/:slug*',
      },
      {
        source: '/api/processes',
        destination: 'http://192.168.1.36:30100/cgi-bin/nvidia-gpu.py',
      },
    ]
  },
});