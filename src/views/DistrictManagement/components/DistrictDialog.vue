<template>
    <a-modal :title="'编辑行政区划'" v-model:open="dialogVisible" :destroyOnClose="true" :maskClosable="false" width="700px"
        class="district-dialog" :footer="null" @open="handleModalOpen">
        <a-form :model="formData" ref="formRef" :rules="rules" layout="vertical">
            <!-- 上级行政区划 (使用树结构) -->
            <a-form-item label="上级行政区划" name="parentDistrict">
                <a-tree-select v-model:value="formData.parentDistrict" :tree-data="districtTreeData"
                    placeholder="请选择上级行政区划" allow-clear
                    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-node-filter-prop="'title'"
                    :show-search="true" :disabled="isEdit" />
            </a-form-item>

            <!-- 行政区划名称和代码 -->
            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="行政区划名称" name="districtName">
                        <a-input v-model:value="formData.districtName" placeholder="请输入行政区划名称" show-count :maxlength="150" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="行政区划代码" name="districtCode">
                        <a-input v-model:value="formData.districtCode" placeholder="请输入行政区划代码" :disabled="isEdit" />
                    </a-form-item>
                </a-col>
            </a-row>

            <!-- 状态 -->
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
import { updateDistrict } from '../api';

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
    },
    districtTreeData: {
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
    parentDistrict: undefined,
    districtName: '',
    districtCode: '',
    status: '启用',
    longitude: '',
    latitude: ''
});

const rules = {
    parentDistrict: [{ required: true, message: '请选择上级行政区划', trigger: 'change' }],
    districtName: [
        { required: true, message: '请输入行政区划名称', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5]{1,50}$/, message: '行政区划名称只能输入1-50个中文字符', trigger: 'blur' }
    ],
    districtCode: [{ required: true, message: '请输入行政区划代码', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    longitude: [{ required: true, message: '请输入经度', trigger: 'blur' }],
    latitude: [{ required: true, message: '请输入纬度', trigger: 'blur' }]
};

const handleModalOpen = () => {
    // 在对话框打开后再次尝试更新地图位置
    if (props.isEdit && formData.longitude && formData.latitude) {
        updateMapMarker();
    }
};

const updateMapMarker = () => {
    const lng = parseFloat(formData.longitude);
    const lat = parseFloat(formData.latitude);
    
    if (!isNaN(lng) && !isNaN(lat)) {
        // 增加延迟，确保地图组件已经渲染完成
        setTimeout(() => {
            console.log('更新地图位置:', lng, lat);
            mapRef.value?.updateMapPosition(lng, lat);
        }, 300); // 增加延迟时间
    }
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
            
            // 对话框打开后更新地图标记
            if (dialogVisible.value) {
                updateMapMarker();
            }
        } else if (visible && !props.isEdit) {
            resetForm();
        }
    }
);

watch(
    () => [formData.longitude, formData.latitude],
    () => {
        if (dialogVisible.value && formData.longitude && formData.latitude) {
            updateMapMarker();
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
        .then(async () => {
            submitting.value = true;
            
            try {
                const submitData = {
                    areacode: formData.districtCode,
                    areaname: formData.districtName,
                    parentAreacode: formData.parentDistrict,
                    enabled: formData.status === '启用' ? '1' : '0',
                    longitude: formData.longitude,
                    latitude: formData.latitude
                };
                
                await updateDistrict(submitData);
                
                message.success('编辑行政区划成功');
                emit('success', { ...formData });
                dialogVisible.value = false;
                resetForm();
            } catch (error) {
                console.error('编辑行政区划失败:', error);
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