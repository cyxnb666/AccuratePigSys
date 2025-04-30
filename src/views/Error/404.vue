<template>
  <div class="not-found">
    <div class="content">
      <div class="not-found-img"></div>
      <h1>页面不存在或无权访问</h1>
      <p>您尝试访问的页面不存在或没有访问权限</p>
      <a-button type="primary" @click="goHome">返回首页</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  // 获取用户菜单权限
  const userMenus = JSON.parse(sessionStorage.getItem('menus') || '[]');
  
  // 如果有菜单权限，跳转到第一个有权限的菜单
  if (userMenus.length > 0) {
    router.push(`/${userMenus[0].menuCode}`);
  } else {
    // 如果没有找到有效菜单，回到登录页
    router.push('/login');
  }
};
</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #f0f2f5;

  .content {
    text-align: center;
    
    .not-found-img {
      width: 350px;
      height: 250px;
      margin: 0 auto 20px;
      background-image: url('@/assets/404.png');
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    }

    h1 {
      font-size: 24px;
      color: #333;
      margin-bottom: 15px;
    }

    p {
      font-size: 16px;
      color: #666;
      margin-bottom: 30px;
    }
  }
}
</style>