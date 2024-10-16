const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: "z2b61u",
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
      // Forcefully set NODE_ENV before requiring webpack config
      // webpackConfig: (() => {
      //   process.env.NODE_ENV = 'development';  // Ensure NODE_ENV is set
      //   return require('react-scripts/config/webpack.config')('development'); // Call webpack config with environment
      // })(),
    },
  },
})