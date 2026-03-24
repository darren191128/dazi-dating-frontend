// API配置
const API_CONFIG = {
  // 开发环境
  development: {
    baseURL: 'http://localhost:8080/api',
    wsURL: 'ws://localhost:8080/ws'
  },
  // 生产环境
  production: {
    baseURL: 'https://api.dazi.com/api',
    wsURL: 'wss://api.dazi.com/ws'
  }
};

// 当前环境
const ENV = process.env.NODE_ENV || 'development';

// 导出配置
export const config = API_CONFIG[ENV];

// 请求超时时间
export const TIMEOUT = 10000;

// 分页配置
export const PAGE_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50]
};
