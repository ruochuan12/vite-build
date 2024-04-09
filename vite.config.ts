import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import bundleAnalyzer from 'rollup-plugin-bundle-analyzer';
import { visualizer } from 'rollup-plugin-visualizer';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import minimist from 'minimist';

function _resolve(dir: string) {
  return resolve(__dirname, dir);
}

const params = process.argv.slice(2);
const paramsDefault = {
  default: {
    report: false,
  },
  boolean: ['report'],
};

const args = minimist(params);
let report = false;
try {
  report = params.includes('report');
} catch (e) {
  console.log('parse custom params error', e);
}

console.log(params, args, report, paramsDefault);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '');
  const plugins = !report
    ? []
    : [
        bundleAnalyzer({
          port: 9800,
          openBrowser: true,
        }),
        visualizer({
          gzipSize: true,
          brotliSize: true,
          emitFile: false,
          filename: 'report.html', //分析图生成的文件名
          open: true, //如果存在本地服务端口，将在打包后自动展示
        }),
      ];
  // console.log('env', env);
  return {
    // 起个别名，在引用资源时，可以用‘@/资源路径’直接访问
    resolve: {
      alias: {
        '@': _resolve('src'),
      },
    },
    // vite 配置
    define: {
      // __APP_ENV__: JSON.stringify(env.APP_ENV),
      BASE_URL: JSON.stringify(env.VITE_BASE_URL),
      __DEV__: JSON.stringify(env.NODE_ENV === 'development'),
    },
    plugins: [react(), ...plugins],
    // https://cn.vitejs.dev/config/server-options.html#server-proxy
    // server.cors
    server: {
      cors: true,
      proxy: {
        '/api': {
          target: 'https://lxchuan12.gitee.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
