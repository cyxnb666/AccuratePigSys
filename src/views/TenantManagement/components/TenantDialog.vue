<template>
    <a-modal :title="isEdit ? '编辑租户' : '新增租户'" v-model:open="dialogVisible" :destroyOnClose="true" :maskClosable="false"
        width="800px" class="tenant-dialog" :footer="null">
        <a-form :model="formData" ref="formRef" :rules="rules" layout="vertical">
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="租户名称" name="tencentName">
                        <a-input v-model:value="formData.tencentName" placeholder="请输入租户名称" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="租户编码" name="tencentCode">
                        <a-input v-model:value="formData.tencentCode" placeholder="请输入租户编码" :disabled="isEdit" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="租户账号" name="tencentAccount">
                        <a-input v-model:value="formData.tencentAccount" placeholder="请输入租户登录账号" :disabled="isEdit" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="租户密码" name="tencentCipher">
                        <a-input-password v-model:value="formData.tencentCipher" placeholder="请输入租户登录密码" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="行政区划" name="areacode">
                        <a-tree-select v-model:value="formData.areacode" placeholder="请选择行政区划" :tree-data="areaTreeData"
                            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" tree-default-expand-all
                            :show-search="true" tree-node-filter-prop="title" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="状态" name="enabled">
                        <a-select v-model:value="formData.enabled" placeholder="请选择状态">
                            <a-select-option value="1">启用</a-select-option>
                            <a-select-option value="0">禁用</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row>
                <a-col :span="24">
                    <a-form-item label="备注" name="remark">
                        <a-textarea v-model:value="formData.remark" placeholder="请输入备注信息" :rows="4" />
                    </a-form-item>
                </a-col>
            </a-row>

            <div class="form-footer">
                <a-button @click="handleCancel">取 消</a-button>
                <a-button type="primary" @click="handleSubmit" :loading="submitting" style="margin-left: 8px;">确
                    定</a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, defineProps, defineEmits, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import { saveTenant, updateTenant } from '../api';
import { MD5 } from 'crypto-js';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    isEdit: {
        type: Boolean,
        default: false
    },
    record: {
        type: Object,
        default: () => ({})
    },
    areaTreeData: {
        type: Array,
        default: () => []
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
    tencentName: '',
    tencentCode: '',
    tencentAccount: '',
    tencentCipher: '',
    areacode: '',
    enabled: '0',
    remark: ''
});

const rules = computed(() => ({
    tencentName: [
        { required: true, message: '请输入租户名称', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5]{1,50}$/, message: '租户名称只能输入1-50个中文字符', trigger: 'blur' }
    ],
    tencentCode: [{ required: true, message: '请输入租户编码', trigger: 'blur' }],
    tencentAccount: [
        { required: true, message: '请输入租户账号', trigger: 'blur' },
        { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,8}$/, message: '租户账号必须为6-8位字母+数字组合', trigger: 'blur' }
    ],
    tencentCipher: props.isEdit
        ? [{ pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,8}$/, message: '租户密码必须为6-8位字母+数字组合', trigger: 'blur' }]
        : [
            { required: true, message: '请输入租户密码', trigger: 'blur' },
            { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,8}$/, message: '租户密码必须为6-8位字母+数字组合', trigger: 'blur' }
        ],
    areacode: [{ required: true, message: '请选择行政区划', trigger: 'change' }],
    enabled: [{ required: true, message: '请选择状态', trigger: 'change' }],
    remark: [{ pattern: /^[\u4e00-\u9fa5]{0,250}$/, message: '备注只能输入0-250个中文字符', trigger: 'blur' }]
}));

// 当编辑模式且有记录时，填充表单数据
watch(
    () => [props.modelValue, props.isEdit, props.record],
    ([visible, isEdit, record]) => {
        if (visible && isEdit && record) {
            formData.tencentName = record.tencentName || '';
            formData.tencentCode = record.tencentCode || '';
            formData.tencentAccount = record.tencentAccount || '';
            formData.tencentCipher = '';
            formData.areacode = record.areacode || '';
            formData.enabled = record.enabled || '0';
            formData.remark = record.remark || '';

            if (formRef.value) {
                formRef.value.clearValidate();
            }
        } else if (visible && !isEdit) {
            resetForm();
        }
    },
    { immediate: true }
);

const resetForm = () => {
    Object.keys(formData).forEach(key => {
        if (key === 'enabled') {
            formData[key] = '1';
        } else {
            formData[key] = '';
        }
    });

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
        .then(async () => {
            submitting.value = true;
            try {
                const submitData = { ...formData };

                if (submitData.tencentCipher) {
                    submitData.tencentCipher = MD5(submitData.tencentCipher).toString();
                }

                if (props.isEdit) {
                    await updateTenant(submitData);
                } else {
                    await saveTenant(submitData);
                }
                message.success(`${props.isEdit ? '编辑' : '新增'}租户成功`);
                emit('success', { ...formData });
                dialogVisible.value = false;
                resetForm();
            } catch (error) {
                console.error(`${props.isEdit ? '编辑' : '新增'}租户失败:`, error);
            } finally {
                submitting.value = false;
            }
        })
        .catch(errorInfo => {
            console.log('验证失败:', errorInfo);
        });
};
</script>

<style lang="scss" scoped>
.tenant-dialog {
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

    :deep(.ant-form-item-label > label) {
        height: 32px;
    }

    :deep(.ant-select),
    :deep(.ant-input),
    :deep(.ant-input-password),
    :deep(.ant-tree-select) {
        width: 100%;
    }
}
</style>