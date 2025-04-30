import {createApp} from 'vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import App from './App.vue'
import router, { addDynamicRoutes } from '@/routes/index'
import "lib-flexible/flexible.js"

// 如果已登录，初始化动态路由
const token = sessionStorage.getItem('token');
if (token) {
  const userMenus = JSON.parse(sessionStorage.getItem('menus') || '[]');
  addDynamicRoutes(userMenus);
}

const app = createApp(App);
app.use(Antd)
app.use(router)
app.mount('#app')