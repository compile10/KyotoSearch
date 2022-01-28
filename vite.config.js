export default {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:4999',
          changeOrigin: true,
        }
        }
      }
    }
  