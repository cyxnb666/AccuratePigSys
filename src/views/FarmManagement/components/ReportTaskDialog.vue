<template>
    <a-modal title="存栏上报任务配置" v-model:open="dialogVisible" :destroyOnClose="true" :maskClosable="false" width="650px"
        class="report-task-dialog" :footer="null">
        <a-form :model="formData" ref="formRef" :rules="rules" layout="vertical">
            <!-- 上报起止期 -->
            <a-form-item label="上报起止期" name="reportPeriod">
                <a-range-picker v-model:value="formData.reportPeriod" :format="'YYYY-MM-DD'" style="width: 100%;" />
            </a-form-item>

            <!-- 存栏变化数累计达到数量 -->
            <a-form-item class="marked-form-item" label="存栏变化数累计达到数量（出栏/补栏/死亡）" name="stockChangeCount">
                <div class="marker"></div>
                <a-input placeholder="请输入数量" v-model:value="formData.stockChangeCount" />
            </a-form-item>

            <!-- 存栏变化数累计达到比例 -->
            <a-form-item class="marked-form-item" label="存栏变化数累计达到比例（出栏/补栏/死亡）" name="stockChangeRatio">
                <div class="marker"></div>
                <a-input placeholder="请输入百分比" v-model:value="formData.stockChangeRatio" />
            </a-form-item>

            <!-- 上次存栏上报至今累计达到天数 -->
            <a-form-item class="marked-form-item" label="上次存栏上报至今累计达到天数" name="daysSinceLastReport">
                <div class="marker"></div>
                <a-input placeholder="请输入天数" v-model:value="formData.daysSinceLastReport" />
            </a-form-item>

            <div class="form-footer">
                <a-button @click="handleCancel">取 消</a-button>
                <a-button type="primary" @click="handleSubmit" :loading="submitting" style="margin-left: 8px;">确
                    定</a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch, computed } from 'vue';

const props = defineProps({
    modelValue: {
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

const formData = reactive({
    reportPeriod: [],
    stockChangeCount: '',
    stockChangeRatio: '',
    daysSinceLastReport: ''
});

const rules = {
    reportPeriod: [
        { required: true, message: '请选择上报起止期', trigger: 'change' }
    ],
    stockChangeCount: [
        { required: true, message: '请输入存栏变化数', trigger: 'blur' },
        { pattern: /^\d+$/, message: '请输入数字', trigger: 'blur' }
    ],
    stockChangeRatio: [
        { required: true, message: '请输入存栏变化比例', trigger: 'blur' },
        { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的百分比数字', trigger: 'blur' }
    ],
    daysSinceLastReport: [
        { required: true, message: '请输入天数', trigger: 'blur' },
        { pattern: /^\d+$/, message: '请输入数字', trigger: 'blur' }
    ]
};

// 当对话框打开时，尝试填充现有数据
watch(
    () => [props.modelValue, props.record],
    ([visible, record]) => {
        if (visible && record.reportConfig) {
            // 填充已有的上报配置数据
            Object.keys(formData).forEach(key => {
                if (record.reportConfig[key] !== undefined) {
                    formData[key] = record.reportConfig[key];
                }
            });
        } else if (visible) {
            // 默认值
            resetForm();
        }
    }
);

const resetForm = () => {
    formData.reportPeriod = [];
    formData.stockChangeCount = '';
    formData.stockChangeRatio = '';
    formData.daysSinceLastReport = '';

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

            emit('success', { ...formData });
        
            submitting.value = false;
            dialogVisible.value = false;
        })
        .catch(errorInfo => {
            console.log('验证失败:', errorInfo);
        });
};
</script>

<style lang="scss" scoped>
.report-task-dialog {
    :deep(.ant-modal-content) {
        padding: 0;

        .ant-modal-close {
            top: 10px;
        }

        .ant-modal-header {
            margin: 0;
            padding: 16px 24px;
        }

        .ant-modal-body {
            padding: 24px;
        }
    }

    .marked-form-item {
        position: relative;
        padding-left: 12px;

        .marker {
            position: absolute;
            left: -10px;
            top: -25px;
            /* 调整这个值使标记与标签文本对齐 */
            height: 16px;
            /* 标记的高度，与标签文本高度相近 */
            width: 4px;
            background-color: #5276E5;
            border-radius: 2px;
        }
    }

    .form-footer {
        text-align: right;
        margin-top: 24px;
    }

    :deep(.ant-form-item-label) {
        font-weight: 500;
    }
}
</style>