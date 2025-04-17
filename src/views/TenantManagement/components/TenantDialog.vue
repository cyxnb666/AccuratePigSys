<template>
    <a-modal :title="isEdit ? '编辑租户' : '新增租户'" v-model:open="dialogVisible" :destroyOnClose="true" :maskClosable="false"
        width="800px" class="tenant-dialog" :footer="null">
        <a-form :model="formData" ref="formRef" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="租户名称" name="tenantName">
                        <a-input v-model:value="formData.tenantName" placeholder="请输入租户名称" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="租户编码" name="tenantCode">
                        <a-input v-model:value="formData.tenantCode" placeholder="请输入租户编码" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="租户账号" name="tenantAccount">
                        <a-input v-model:value="formData.tenantAccount" placeholder="请输入租户登录账号" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="租户密码" name="tenantPassword">
                        <a-input-password v-model:value="formData.tenantPassword" placeholder="请输入租户登录密码" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="行政区划" name="administrativeArea">
                        <a-tree-select v-model:value="formData.administrativeArea" placeholder="请选择行政区划"
                            :tree-data="areaTreeData" :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                            tree-default-expand-all :show-search="true" :tree-node-filter-prop="'title'" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="状态" name="status">
                        <a-select v-model:value="formData.status" placeholder="请选择状态">
                            <a-select-option :value="true">启用</a-select-option>
                            <a-select-option :value="false">禁用</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row>
                <a-col :span="24">
                    <a-form-item label="备注" name="remark" :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
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

// 行政区划树形数据
const areaTreeData = [
    {
        title: '四川省',
        value: 'sichuan',
        key: 'sichuan',
        children: [
            {
                title: '成都市',
                value: 'chengdu',
                key: 'sichuan-chengdu',
                children: [
                    {
                        title: '武侯区',
                        value: 'wuhou',
                        key: 'sichuan-chengdu-wuhou',
                    },
                    {
                        title: '锦江区',
                        value: 'jinjiang',
                        key: 'sichuan-chengdu-jinjiang',
                    }
                ]
            },
            {
                title: '绵阳市',
                value: 'mianyang',
                key: 'sichuan-mianyang',
            }
        ]
    },
    {
        title: '重庆市',
        value: 'chongqing',
        key: 'chongqing',
        children: [
            {
                title: '渝中区',
                value: 'yuzhong',
                key: 'chongqing-yuzhong',
            },
            {
                title: '江北区',
                value: 'jiangbei',
                key: 'chongqing-jiangbei',
            }
        ]
    },
    {
        title: '云南省',
        value: 'yunnan',
        key: 'yunnan',
        children: [
            {
                title: '昆明市',
                value: 'kunming',
                key: 'yunnan-kunming',
            }
        ]
    },
    {
        title: '贵州省',
        value: 'guizhou',
        key: 'guizhou',
        children: [
            {
                title: '贵阳市',
                value: 'guiyang',
                key: 'guizhou-guiyang',
            }
        ]
    }
];

const formData = reactive({
    tenantName: '',
    tenantCode: '',
    tenantAccount: '',
    tenantPassword: '',
    administrativeArea: undefined, // 不设置默认值
    status: true,
    remark: ''
});

const rules = {
    tenantName: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
    tenantCode: [{ required: true, message: '请输入租户编码', trigger: 'blur' }],
    tenantAccount: [{ required: true, message: '请输入租户账号', trigger: 'blur' }],
    tenantPassword: [{ required: true, message: '请输入租户密码', trigger: 'blur' }],
    administrativeArea: [{ required: true, message: '请选择行政区划', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
};

// 当编辑模式且有记录时，填充表单数据
watch(
    () => [props.modelValue, props.record],
    ([visible, record]) => {
        if (visible && props.isEdit && record) {
            // 编辑时填充表单数据
            Object.keys(formData).forEach(key => {
                if (record[key] !== undefined) {
                    formData[key] = record[key];
                }
            });

            // 编辑时不需要重新输入密码，使用占位符
            if (props.isEdit) {
                formData.tenantPassword = '********';
            }
        } else if (visible && !props.isEdit) {
            // 新增时重置表单
            resetForm();
        }
    }
);

const resetForm = () => {
    Object.keys(formData).forEach(key => {
        if (key === 'status') {
            formData[key] = true;
        } else {
            formData[key] = key === 'administrativeArea' ? undefined : '';
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
        .then(() => {
            submitting.value = true;

            // 模拟API调用
            setTimeout(() => {
                message.success(`${props.isEdit ? '编辑' : '新增'}租户成功`);
                submitting.value = false;
                emit('success', { ...formData });
                dialogVisible.value = false;
                resetForm();
            }, 500);
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