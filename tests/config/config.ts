export const config = {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  timeouts: {
    pageLoad: 5000,
    networkIdle: 10000,
    selectorWait: 10000,
  },
};
