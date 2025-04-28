<template>
  <div class="LoginView">
    <div class="LoginBox">
      <div class="loginForm">
        <div class="formBox">
          <div class="formBox-header">
            <div class="title">保行生猪精准核验系统</div>
          </div>
          <div class="tips">请输入以下信息</div>
          <a-form :model="loginForm" name="basic" autocomplete="off" @finish="onFinish" @finishFailed="onFinishFailed">
            <a-form-item name="tenantCode" :rules="[{ required: true, message: '请输入租户编码!' }]">
              <a-input placeholder="请输入租户编码" v-model:value="loginForm.tenantCode">
                <template #prefix><apartment-outlined /></template>
              </a-input>
            </a-form-item>

            <a-form-item name="username" :rules="[{ required: true, message: '请输入账号!' }]">
              <a-input placeholder="请输入账号" v-model:value="loginForm.username">
                <template #prefix><user-outlined /></template>
              </a-input>
            </a-form-item>

            <a-form-item name="password" :rules="[{ required: true, message: '请输入密码!' }]">
              <a-input-password placeholder="请输入密码" v-model:value="loginForm.password">
                <template #prefix><lock-outlined /></template>
              </a-input-password>
            </a-form-item>

            <a-form-item name="verificationCode" :rules="[{ required: true, message: '请输入验证码!' }]">
              <div style="display: flex;">
                <a-input placeholder="请输入验证码" v-model:value="loginForm.verificationCode"
                  style="flex: 1; margin-right: 10px;">
                  <template #prefix><safety-outlined /></template>
                </a-input>
                <img :src="verifyCodeUrl" style="width: 100px; height: 40px; cursor: pointer;" alt="验证码"
                  @click="refreshVerifyCode" />
              </div>
            </a-form-item>

            <a-form-item :wrapper-col="{ span: 24 }">
              <a-button class="submit" type="primary" html-type="submit" :loading="loading">登 录</a-button>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  ApartmentOutlined
} from '@ant-design/icons-vue';
import { getVerifyCode, login } from './api';

const router = useRouter();
const route = useRoute();
const verifyCodeUrl = ref('');

interface FormState {
  tenantCode: string;
  username: string;
  password: string;
  verificationCode: string;
}

const loading = ref<boolean>(false);
const loginForm = reactive<FormState>({
  tenantCode: '',
  username: '',
  password: '',
  verificationCode: ''
});

// 刷新验证码
const refreshVerifyCode = async () => {
  try {
    const blob = await getVerifyCode();

    // 如果存在旧URL，释放它
    if (verifyCodeUrl.value) {
      URL.revokeObjectURL(verifyCodeUrl.value);
    }

    // 创建新的Blob URL
    const newUrl = URL.createObjectURL(new Blob([blob], { type: 'image/png' }));
    verifyCodeUrl.value = newUrl;
  } catch (error) {
    console.error('验证码获取失败:', error);
  }
};

// 从URL获取租户编码并填充
onMounted(() => {
  // 检查URL中是否有code参数
  const codeParam = route.query.code;
  if (codeParam) {
    loginForm.tenantCode = codeParam as string;
  }

  // 加载验证码
  refreshVerifyCode();
});

// 释放验证码Blob URL
onBeforeUnmount(() => {
  if (verifyCodeUrl.value) {
    URL.revokeObjectURL(verifyCodeUrl.value);
  }
});

const onFinish = async () => {
  loading.value = true;

  try {
    const res = await login({
      tenantCode: loginForm.tenantCode,
      username: loginForm.username,
      password: loginForm.password,
      verificationCode: loginForm.verificationCode
    });

    if (res) {
      message.success('登录成功');

      // 存储返回的数据
      sessionStorage.setItem('token', res.token);
      sessionStorage.setItem('userInfo', JSON.stringify({
        username: res.username,
        usercode: res.usercode,
        tenantCode: res.tenantCode,
        tenantName: res.tenantName
      }));

      // 如果返回了菜单信息，保存它
      if (res.menus) {
        sessionStorage.setItem('menus', JSON.stringify(res.menus));
      }

      // 导航到首页或默认路由
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('登录失败:', error);
    message.error('登录失败，请检查输入信息');
    // 刷新验证码
    refreshVerifyCode();
  } finally {
    loading.value = false;
  }
};

const onFinishFailed = () => {
  message.error('请填写完整的登录信息');
};
</script>

<style lang="scss" scoped>
.LoginView {
  width: 100%;
  height: 100%;
  background: linear-gradient(to right top,
      rgba(213, 254, 255, 0.68) 0%,
      rgba(83, 115, 233, 0.2) 50%,
      rgba(125, 164, 255, 0.19) 100%);

  .LoginBox {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 200px;

    .loginForm {
      width: 420px;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      .formBox {
        width: 410px;
        background-color: #FFFFFF;
        border-radius: 8px;
        padding: 30px 40px 40px;

        &-header {
          display: flex;
          align-items: center;
          justify-content: center;

          .title {
            font-weight: 700;
            font-size: 24px;
            color: #333333;
          }
        }

        .tips {
          font-weight: 400;
          font-size: 16px;
          color: rgba(51, 51, 51, 0.6);
          margin-top: 20px;
          margin-bottom: 20px;
          text-align: center;
        }
      }
    }
  }
}

.submit {
  width: 100%;
  height: 40px;
  margin-top: 20px;
  border-radius: 2px;
}
</style>