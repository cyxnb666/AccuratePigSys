<template>
  <div class="mainView">
    <div class="app-header">
      <div class="header-left">
        <div class="logo">保行生猪精准核验系统</div>
      </div>

      <div class="app-menu">
        <a-menu mode="horizontal" v-model:selectedKeys="state.selectedKeys" @click="clickMenu">
          <a-menu-item v-for="item in menuItems" :key="item.name">
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
            管理员 <down-outlined />
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
    <div class="app-content" :class="{ 'no-padding': route.name === 'dashboard' }">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { DownOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const router = useRouter();
const route = useRoute();

const state = reactive({
  selectedKeys: ['tenant']
});

// 直接从路由配置获取菜单项
const menuItems = computed(() => {
  // 查找主路由
  const mainRoute = router.options.routes.find(route => route.path === '/');
  if (!mainRoute || !mainRoute.children) return [];

  // 返回所有子路由作为菜单项，但过滤掉hideInMenu为true的项
  return mainRoute.children.filter(route => !route.meta?.hideInMenu);
});

// 监听路由变化，更新选中的菜单项
watch(
  () => route.path,
  (path) => {
    const pathParts = path.split('/');
    if (pathParts.length > 1) {
      state.selectedKeys = [pathParts[1]];
    }
  },
  { immediate: true }
);

// 菜单点击处理
const clickMenu = (menuInfo) => {
  router.push(`/${menuInfo.key}`);
};

// 修改密码
const changePassword = () => {
  message.info('修改密码功能待实现');
};

// 退出登录
const outLogin = () => {
  sessionStorage.clear();
  router.push('/login');
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
      .logo {
        font-size: 18px;
        font-weight: bold;
        margin-right: 20px;
        white-space: nowrap;
      }
    }

    .app-menu {
      flex: 1;

      :deep(.ant-menu) {
        background-color: transparent;
        border-bottom: none;

        &.ant-menu-horizontal {
          .ant-menu-item {
            color: rgba(255, 255, 255, 0.8);
            margin: 0 4px;

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

      .ant-dropdown-link {
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