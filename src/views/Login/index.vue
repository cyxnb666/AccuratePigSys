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
                <div class="verification-code"
                  style="width: 100px; height: 40px; background-color: #eee; display: flex; align-items: center; justify-content: center;">
                  验证码图片
                </div>
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
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  ApartmentOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();

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

// 从URL获取租户编码并填充
onMounted(() => {
  // 检查URL中是否有code参数
  const codeParam = route.query.code;
  if (codeParam) {
    loginForm.tenantCode = codeParam as string;
  }
});

const onFinish = async () => {
  loading.value = true;

  // 打印登录信息到控制台
  console.log('登录信息:', {
    租户编码: loginForm.tenantCode,
    账号: loginForm.username,
    密码: loginForm.password,
    验证码: loginForm.verificationCode
  });

  // 模拟登录延迟
  setTimeout(() => {
    message.success('登录成功');

    // 直接跳转到主页
    router.push('/dashboard');

    loading.value = false;
  }, 500);
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
      width: 420px; // 减小表单宽度
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      .formBox {
        width: 410px; // 减小内部宽度
        background-color: #FFFFFF;
        border-radius: 8px;
        padding: 30px 40px 40px; // 减小内边距

        &-header {
          display: flex;
          align-items: center;
          justify-content: center; // 居中标题

          .title {
            font-weight: 700;
            font-size: 24px;
            color: #333333;
          }
        }

        .tips {
          font-weight: 400;
          font-size: 16px; // 减小提示文字
          color: rgba(51, 51, 51, 0.6);
          margin-top: 20px; // 减小上边距
          margin-bottom: 20px; // 减小下边距
          text-align: center; // 居中提示文字
        }
      }
    }
  }
}

.submit {
  width: 100%;
  height: 40px; // 减小按钮高度
  margin-top: 20px; // 减小上边距
  border-radius: 2px;
}
</style>