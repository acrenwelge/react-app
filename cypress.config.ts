import axios from 'axios';
import { defineConfig } from 'cypress';

axios.defaults.baseURL = 'http://localhost:3002/';

export default defineConfig({
  projectId: "z2b61u",
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        // Clears all data in the NeDB collections
        async 'db:reset'() {
          return new Promise(async (resolve, reject) => {
            try {
              const response = await axios.post('/test-data/reset', { method: 'POST' });
              if (response.status > 399) {
                reject(new Error('Failed to reset database'));
              } else {
                resolve('Database reset successfully');
              }
            } catch (error) {
              reject(error);
            }
          });
        },
        // Seeds essential baseline data in the database
        async 'db:seed'() {  
          return new Promise(async (resolve, reject) => {
            try {
              const response = await axios.post('/test-data/seed', { method: 'POST' });
              if (response.status > 399) {
                throw new Error('Failed to seed database');
              } else {
                resolve('Database seeded successfully');
              }
            } catch (error) {
              reject(error);
            }
          });
        },
        // Seeds test-specific data
        'db:seedForTest'({ testName }) {
          // TBD: Seed data for specific tests
        },
    
        // Cleans up test-specific data
        'db:cleanupForTest'({ testName }) {
          // TBD: Clean up data for specific tests
        }
      });
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