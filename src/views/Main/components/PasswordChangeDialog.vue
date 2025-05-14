<template>
    <a-modal title="修改密码" v-model:open="dialogVisible" :destroyOnClose="true" :maskClosable="false" width="500px"
        class="password-dialog" :footer="null">
        <a-form :model="formData" ref="formRef" :rules="rules" layout="vertical">
            <a-form-item label="原密码" name="oldPassword" required>
                <a-input-password v-model:value="formData.oldPassword" placeholder="请输入原密码" />
            </a-form-item>

            <a-form-item label="新密码" name="newPassword" required>
                <a-input-password v-model:value="formData.newPassword" placeholder="请输入新密码" />
            </a-form-item>

            <a-form-item label="确认密码" name="confirmPassword" required>
                <a-input-password v-model:value="formData.confirmPassword" placeholder="请再次输入新密码" />
            </a-form-item>

            <div class="form-footer">
                <a-button @click="handleCancel">取 消</a-button>
                <a-button type="primary" @click="handleSubmit" :loading="submitting" style="margin-left: 8px;">确
                    定</a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, defineProps, defineEmits } from 'vue';
import { message } from 'ant-design-vue';
import { resetPassword } from '../api';
import { MD5 } from 'crypto-js';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'success']);

// 计算属性实现双向绑定
const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const formRef = ref();
const submitting = ref(false);

const formData = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// 密码格式正则：6-12位字母+数字+特殊字符组合
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,12}$/;
const validateConfirmPassword = async (rule, value) => {
    if (value && value !== formData.newPassword) {
        return Promise.reject('两次输入的密码不一致');
    }
    return Promise.resolve();
};

const rules = {
    oldPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' },
        { pattern: passwordPattern, message: '密码必须为6-12位字母和数字组合', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { pattern: passwordPattern, message: '密码必须为6-12位字母和数字组合', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入新密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
};

const resetForm = () => {
    formData.oldPassword = '';
    formData.newPassword = '';
    formData.confirmPassword = '';

    if (formRef.value) {
        formRef.value.resetFields();
    }
};

const handleCancel = () => {
    dialogVisible.value = false;
    resetForm();
};

const handleSubmit = () => {
    formRef.value.validate()
        .then(() => {
            submitting.value = true;
            const encryptedOldPassword = MD5(formData.oldPassword).toString();
            const encryptedNewPassword = MD5(formData.newPassword).toString();
            const encryptedConfirmPassword = MD5(formData.confirmPassword).toString();

            const params = {
                condition: {
                    oldUserCipher: encryptedOldPassword,
                    newUserCipher: encryptedNewPassword,
                    confirmUserCipher: encryptedConfirmPassword
                }
            };

            resetPassword(params)
                .then(() => {
                    message.success('修改成功，请重新登录');
                    emit('success', { ...formData, shouldLogout: true });
                    dialogVisible.value = false;
                    resetForm();
                })
                .catch((error) => {
                    console.error('修改密码失败:', error);
                })
                .finally(() => {
                    submitting.value = false;
                });
        })
        .catch(errorInfo => {
            console.log('验证失败:', errorInfo);
        });
};
</script>

<style lang="scss" scoped>
.password-dialog {
    :deep(.ant-modal-content) {
        padding: 0;

        .ant-modal-close {
            top: 10px;
            color: #FFFFFF;
        }

        .ant-modal-header {
            margin: 0;
            padding: 16px 24px;
            background-color: #5276E5;

            .ant-modal-title {
                color: #FFFFFF;
                font-size: 16px;
                font-weight: 500;
            }
        }

        .ant-modal-body {
            padding: 24px;
        }
    }

    .form-footer {
        text-align: center;
        margin-top: 24px;
    }

    :deep(.ant-form-item-required::before) {
        display: inline-block;
        margin-right: 4px;
        color: #ff4d4f;
        font-size: 14px;
        font-family: SimSun, sans-serif;
        line-height: 1;
        content: '*';
    }

    :deep(.ant-input-password) {
        width: 100%;
    }
}
</style>