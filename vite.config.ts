import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiKey = env.GEMINI_API_KEY || 'AIzaSyDcQ5-1p4UZT_dmqj3od5RROjVaACQZZ8k';
    
    console.log('Environment variables loaded:', Object.keys(env));
    console.log('GEMINI_API_KEY present:', !!env.GEMINI_API_KEY);
    console.log('Using API key:', apiKey ? 'SET' : 'NOT SET');
    
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
