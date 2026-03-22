import { createSSRApp } from 'vue'
import App from './App.vue'
import uView from 'uview-plus'
import * as Pinia from 'pinia'

// 引入状态管理
import { createPinia } from 'pinia'
import { install as installPinia } from 'pinia'

// 引入API接口
import './src/api/user.js'
import './src/api/activity.js'
import './src/api/match.js'
import './src/api/message.js'
import './src/api/payment.js'

// 引入工具函数
import './src/utils/index.js'

export function createApp() {
  const app = createSSRApp(App)
  
  // 安装uView-plus
  app.use(uView)
  
  // 安装Pinia
  const pinia = createPinia()
  app.use(pinia)
  
  return {
    app,
    pinia
  }
}