<template>
    <a-modal :title="'编辑行政区划'" v-model:open="dialogVisible" :destroyOnClose="true" :maskClosable="false" width="700px"
        class="district-dialog" :footer="null">
        <a-form :model="formData" ref="formRef" :rules="rules" layout="vertical">
            <!-- 上级行政区划 (使用树结构) -->
            <a-form-item label="上级行政区划" name="parentDistrict">
                <a-tree-select v-model:value="formData.parentDistrict" :tree-data="districtTreeData"
                    placeholder="请选择上级行政区划" allow-clear tree-default-expand-all
                    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-node-filter-prop="'title'"
                    :show-search="true" />
            </a-form-item>

            <!-- 行政区划名称和代码 (Side by side) -->
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="行政区划名称" name="districtName">
                        <a-input v-model:value="formData.districtName" placeholder="请输入行政区划名称" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="行政区划代码" name="districtCode">
                        <a-input v-model:value="formData.districtCode" placeholder="请输入行政区划代码" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- 状态 (Full width) -->
            <a-form-item label="状态" name="status">
                <a-select v-model:value="formData.status" placeholder="请选择状态">
                    <a-select-option value="启用">启用</a-select-option>
                    <a-select-option value="禁用">禁用</a-select-option>
                </a-select>
            </a-form-item>

            <!-- 经度和纬度 (Side by side) -->
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="经度" name="longitude">
                        <a-input v-model:value="formData.longitude" placeholder="请输入经度" @change="handleLngLatChange" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="纬度" name="latitude">
                        <a-input v-model:value="formData.latitude" placeholder="请输入纬度" @change="handleLngLatChange" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- 地图区域 -->
            <div class="map-container">
                <map-component ref="mapRef" @updatePosition="handlePositionUpdate" />
            </div>

            <!-- 底部按钮 -->
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
import MapComponent from './MapComponent.vue';

const mapRef = ref();

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

// 模拟行政区划树形数据 - 参考TenantDialog
const districtTreeData = [
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
    }
];

const formData = reactive({
    parentDistrict: undefined,
    districtName: '',
    districtCode: '',
    status: '启用',
    longitude: '',
    latitude: ''
});

const rules = {
    parentDistrict: [{ required: true, message: '请选择上级行政区划', trigger: 'change' }],
    districtName: [{ required: true, message: '请输入行政区划名称', trigger: 'blur' }],
    districtCode: [{ required: true, message: '请输入行政区划代码', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    longitude: [{ required: true, message: '请输入经度', trigger: 'blur' }],
    latitude: [{ required: true, message: '请输入纬度', trigger: 'blur' }]
};

const handlePositionUpdate = (position: { longitude: number; latitude: number; address: string }) => {
    formData.longitude = position.longitude.toFixed(6);
    formData.latitude = position.latitude.toFixed(6);
    // 可以根据需要更新地址信息
};

// 处理经纬度输入变化
const handleLngLatChange = () => {
    const lng = parseFloat(formData.longitude);
    const lat = parseFloat(formData.latitude);

    if (!isNaN(lng) && !isNaN(lat)) {
        mapRef.value?.updateMapPosition(lng, lat);
    }
};

watch(
    () => [props.modelValue, props.record],
    ([visible, record]) => {
        if (visible && props.isEdit && record) {
            Object.keys(formData).forEach(key => {
                if (record[key] !== undefined) {
                    formData[key] = record[key];
                }
            });

            // 如果存在经纬度，更新地图显示
            const lng = parseFloat(record.longitude);
            const lat = parseFloat(record.latitude);
            if (!isNaN(lng) && !isNaN(lat)) {
                setTimeout(() => {
                    mapRef.value?.updateMapPosition(lng, lat);
                }, 100);
            }
        } else if (visible && !props.isEdit) {
            resetForm();
        }
    }
);

const resetForm = () => {
    Object.keys(formData).forEach(key => {
        if (key === 'status') {
            formData[key] = '启用';
        } else if (key === 'parentDistrict') {
            formData[key] = undefined;
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
        .then(() => {
            submitting.value = true;

            // 模拟API调用
            setTimeout(() => {
                message.success('编辑行政区划成功');
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
.district-dialog {
    :deep(.ant-modal-content) {
        padding: 0;

        .ant-modal-header {
            margin: 0;
            padding: 16px 24px;
            border-bottom: 1px solid #f0f0f0;
        }

        .ant-modal-body {
            padding: 24px;
        }
    }

    .map-container {
        width: 100%;
        margin-bottom: 20px;
    }

    .form-footer {
        text-align: right;
        margin-top: 20px;
    }
}
</style>