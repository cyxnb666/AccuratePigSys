import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const pathResolve = (dir: string): any => {
    return resolve(__dirname, ".", dir)
}

const alias: Record<string, string> = {
    '@': pathResolve("src")
}

export default defineConfig({
    plugins: [
        vue()
    ],
    resolve: {
        alias
    },
    base: '/accurate_pig_web/',
    build: {
        outDir: 'accurate_pig_web'
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler"
            }
        }
    },
    server: {
        host: true,
        port: 8080,
        cors: true,
        proxy: {
            '/baseURL': {
                // target: 'https://uat.zhixunchelian.com/accurate_pig_backend/',
                target: 'http://192.168.8.174:8099/accurate_pig_backend/',
                changeOrigin: true,
                rewrite: (path) => path.replace('/baseURL', '')
            }
        }
    }
})