<template>
    <a-modal v-model:visible="visible" title="修改密码" :maskClosable="false" @cancel="handleCancel" :footer="null"
        width="400px">
        <a-form :model="formState" name="changePasswordForm" :rules="rules" @finish="onFinish" autocomplete="off"
            layout="vertical">
            <a-form-item label="原密码" name="oldPassword">
                <a-input-password v-model:value="formState.oldPassword" placeholder="请输入原密码" />
            </a-form-item>

            <a-form-item label="新密码" name="newPassword">
                <a-input-password v-model:value="formState.newPassword" placeholder="请输入新密码"
                    @input="checkPasswordStrength" />
                <div class="password-strength">
                    <div class="strength-bar">
                        <div class="strength-progress"
                            :style="{ width: strengthPercentage + '%', backgroundColor: strengthColor }"></div>
                    </div>
                    <span class="strength-text" :style="{ color: strengthColor }">{{ strengthText }}</span>
                </div>
                <div class="password-hint">密码必须为6-12位字母和数字的组合</div>
            </a-form-item>

            <a-form-item label="确认新密码" name="confirmPassword">
                <a-input-password v-model:value="formState.confirmPassword" placeholder="请再次输入新密码" />
            </a-form-item>

            <a-form-item>
                <a-button type="primary" html-type="submit" :loading="loading" block>确认修改</a-button>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
// 如果需要调用API，导入API函数
// import { changePassword } from '@/api/user';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:visible', 'success']);
const router = useRouter();
const loading = ref(false);

// 表单状态
const formState = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// 密码强度相关状态
const strengthPercentage = ref(0);
const strengthColor = ref('#ff4d4f');
const strengthText = ref('弱');

// 密码验证正则表达式（6-12位字母+数字组合）
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;

// 表单验证规则
const rules = {
    oldPassword: [
        { required: true, message: '请输入原密码' },
        { pattern: passwordPattern, message: '密码必须为6-12位字母和数字的组合' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码' },
        { pattern: passwordPattern, message: '密码必须为6-12位字母和数字的组合' }
    ],
    confirmPassword: [
        { required: true, message: '请确认新密码' },
        ({ getFieldValue }) => ({
            validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
            }
        })
    ]
};

// 监听新密码输入，更新密码强度指示器
const checkPasswordStrength = (value) => {
    if (!value) {
        strengthPercentage.value = 0;
        strengthColor.value = '#ff4d4f';
        strengthText.value = '弱';
        return;
    }

    // 判断密码长度
    const lengthScore = Math.min(value.length / 12, 1) * 0.3;

    // 判断是否包含字母和数字
    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const compositionScore = (hasLetter && hasNumber) ? 0.7 : (hasLetter || hasNumber ? 0.3 : 0);

    // 计算总分
    const totalScore = lengthScore + compositionScore;

    // 更新强度百分比
    strengthPercentage.value = totalScore * 100;

    // 根据分数决定颜色和文本
    if (totalScore < 0.3) {
        strengthColor.value = '#ff4d4f'; // 红色
        strengthText.value = '弱';
    } else if (totalScore < 0.7) {
        strengthColor.value = '#faad14'; // 黄色
        strengthText.value = '中';
    } else {
        strengthColor.value = '#52c41a'; // 绿色
        strengthText.value = '强';
    }
};

// 取消处理
const handleCancel = () => {
    // 重置表单
    formState.oldPassword = '';
    formState.newPassword = '';
    formState.confirmPassword = '';
    strengthPercentage.value = 0;
    strengthColor.value = '#ff4d4f';
    strengthText.value = '弱';

    emit('update:visible', false);
};

// 提交表单
const onFinish = async () => {
    loading.value = true;

    try {
        // 调用API修改密码
        // await changePassword({
        //   oldPassword: formState.oldPassword,
        //   newPassword: formState.newPassword
        // });

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));

        message.success('修改成功，请重新登录');
        emit('success');

        // 清除会话存储并重定向到登录页
        sessionStorage.clear();
        router.push('/login');
    } catch (error) {
        message.error('修改密码失败，请重试');
    } finally {
        loading.value = false;
    }
};
</script>

<style lang="scss" scoped>
.password-strength {
    margin-top: 8px;
    display: flex;
    align-items: center;

    .strength-bar {
        flex: 1;
        height: 4px;
        background-color: #f0f0f0;
        border-radius: 2px;
        overflow: hidden;
        margin-right: 8px;

        .strength-progress {
            height: 100%;
            transition: all 0.3s;
        }
    }

    .strength-text {
        font-size: 12px;
    }
}

.password-hint {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    margin-top: 4px;
}
</style>