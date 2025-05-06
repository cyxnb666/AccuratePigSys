<template>
  <div class="mainView">
    <div class="app-header">
      <div class="header-left">
        <div class="logo">保行生猪精准核验系统</div>
      </div>

      <div class="app-menu">
        <a-menu mode="horizontal" v-model:selectedKeys="state.selectedKeys" @click="clickMenu">
          <a-menu-item v-for="item in accessibleMenuItems" :key="item.name">
            <template #icon>
              <component :is="item.meta?.icon" v-if="item.meta?.icon" />
            </template>
            {{ item.meta?.title }}
          </a-menu-item>
        </a-menu>
      </div>

      <div class="header-right">
        <a-dropdown>
          <a class="ant-dropdown-link" @click.prevent>
            {{ userInfo.username }} <down-outlined />
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <a href="javascript:;" @click="changePassword">修改密码</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="outLogin">退出登录</a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="app-content" :class="{ 'no-padding': route.name === 'HOME' }">
      <router-view></router-view>
    </div>

    <!-- 修改密码对话框 -->
    <password-change-dialog v-model="passwordDialogVisible" @success="handlePasswordChangeSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, computed, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { DownOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import PasswordChangeDialog from './components/PasswordChangeDialog.vue';
import { logout } from './api';

const passwordDialogVisible = ref(false);
const router = useRouter();
const route = useRoute();

const state = reactive({
  selectedKeys: ['HOME']
});

// 获取用户信息
const userInfo = computed(() => {
  const userInfoStr = sessionStorage.getItem('userInfo');
  return userInfoStr ? JSON.parse(userInfoStr) : {};
});

// 获取用户权限菜单
const userMenuCodes = computed(() => {
  const menusStr = sessionStorage.getItem('menus');
  if (!menusStr) return [];

  const menus = JSON.parse(menusStr);
  return menus.map(menu => menu.menuCode);
});

// 获取所有路由项
const allMenuItems = computed(() => {
  // 查找主路由
  const mainRoute = router.getRoutes().find(route => route.name === 'Main');
  if (!mainRoute) return [];

  // 获取所有子路由
  return router.getRoutes()
    .filter(route =>
      route.path.startsWith('/') &&
      route.name &&
      route.name !== 'Main' &&
      route.name !== 'Login' &&
      route.name !== '404'
    );
});

// 用户有权限访问的菜单项
const accessibleMenuItems = computed(() => {
  return allMenuItems.value.filter(route =>
    route.meta?.permission &&
    userMenuCodes.value.includes(route.meta.permission as string) &&
    !route.meta.hideInMenu
  );
});

// 监听路由变化，更新选中的菜单项
watch(
  () => route.path,
  (path) => {
    const currentRoute = router.getRoutes().find(r => r.path === path);
    if (currentRoute && currentRoute.name) {
      state.selectedKeys = [currentRoute.name.toString()];
    }
  },
  { immediate: true }
);

// 在组件挂载时初始化选中的菜单
onMounted(() => {
  const path = route.path;
  const currentRoute = router.getRoutes().find(r => r.path === path);
  if (currentRoute && currentRoute.name) {
    state.selectedKeys = [currentRoute.name.toString()];
  }
});

// 菜单点击处理
const clickMenu = (menuInfo) => {
  const route = router.getRoutes().find(r => r.name && r.name.toString() === menuInfo.key);
  if (route) {
    router.push(route.path);
  }
};

// 实际执行退出登录的函数
const performLogout = async () => {
  try {
    await logout();
    message.success('退出登录成功');
  } catch (error) {
    console.error('退出登录失败:', error);
  } finally {
    // 无论API是否成功，都清除会话并跳转
    sessionStorage.clear();
    router.push('/login');
  }
};

// 修改密码
const changePassword = () => {
  passwordDialogVisible.value = true;
};

const handlePasswordChangeSuccess = (data) => {
  console.log('密码修改成功，新数据:', data);

  // 如果需要退出登录
  if (data.shouldLogout) {
    setTimeout(() => {
      // 修改密码后直接退出，不需要二次确认
      performLogout();
    }, 1500);
  }
};

// 退出登录
const outLogin = () => {
  Modal.confirm({
    title: '确认退出',
    content: '您确定要退出登录吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      performLogout();
    }
  });
};
</script>

<style lang="scss" scoped>
.mainView {
  height: 100%;
  display: flex;
  flex-direction: column;

  .app-header {
    display: flex;
    align-items: center;
    height: 64px;
    padding: 0 24px;
    background-color: #5276E5;
    color: white;

    .header-left {
      flex-shrink: 0;

      .logo {
        font-size: 18px;
        font-weight: bold;
        margin-right: 20px;
        white-space: nowrap;
      }
    }

    .app-menu {
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;

      &::-webkit-scrollbar {
        display: none;
      }

      -ms-overflow-style: none;
      scrollbar-width: none;

      :deep(.ant-menu) {
        background-color: transparent;
        border-bottom: none;
        white-space: nowrap;

        &.ant-menu-horizontal {
          .ant-menu-item {
            color: rgba(255, 255, 255, 0.8);
            // margin: 0 4px;

            &:hover {
              color: white;
              background-color: rgba(255, 255, 255, 0.1);
            }

            &.ant-menu-item-selected {
              color: white;
              background-color: rgba(255, 255, 255, 0.15);

              &::after {
                border-bottom: 2px solid white;
              }
            }
          }
        }
      }
    }

    .header-right {
      margin-left: 20px;
      flex-shrink: 0;

      .ant-dropdown-link {
        font-size: medium;
        color: white;
        cursor: pointer;
      }
    }
  }

  .app-content {
    flex: 1;
    padding: 16px;
    background-color: #f0f2f5;
    overflow: auto;

    &.no-padding {
      padding: 0;
    }
  }
}
</style>