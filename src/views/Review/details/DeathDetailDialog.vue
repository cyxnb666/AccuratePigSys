<template>
    <a-modal v-model:open="dialogVisible" title="死亡上报" :width="1200" :footer="null" :maskClosable="false"
        class="death-detail-dialog">
        <div class="dialog-content">
            <div class="info-section">
                <div class="section-header">
                    <div class="title">基础信息</div>
                </div>

                <a-row :gutter="24" class="info-row">
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">行政区划:</span>
                            <span class="value">{{ basicInfo.district }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">养殖场名称:</span>
                            <span class="value">{{ basicInfo.farmName }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">养殖场地址:</span>
                            <span class="value">{{ basicInfo.address }}</span>
                        </div>
                    </a-col>
                </a-row>

                <a-row :gutter="24" class="info-row">
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">上报用户:</span>
                            <span class="value">{{ basicInfo.reportUser }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">上报时间:</span>
                            <span class="value">{{ basicInfo.reportTime }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">养殖员（主要联系人）:</span>
                            <span class="value">{{ basicInfo.breeder }}</span>
                        </div>
                    </a-col>
                </a-row>
            </div>

            <div class="info-section">
                <div class="section-header">
                    <div class="title">死亡信息</div>
                </div>

                <a-row :gutter="24" class="info-row">
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">死亡时间:</span>
                            <span class="value">{{ deathInfo.deathTime }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">上报总数:</span>
                            <span class="value">{{ deathInfo.totalReportCount }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">AI点数总数:</span>
                            <span class="value">{{ deathInfo.aiTotalCount }}</span>
                            <a-popover title="预警提示">
                                <template #content>
                                    上报点数与AI点数差异已超过预警阈值20%，请仔细审核
                                </template>
                                <exclamation-circle-filled class="warning-icon" />
                            </a-popover>
                        </div>
                    </a-col>
                </a-row>

                <a-table :columns="deathColumns" :data-source="deathData" :pagination="false" bordered size="small"
                    class="death-table">
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'reviewerCount'">
                            <a-input-number v-if="!isViewMode" v-model:value="record.reviewerCount" :min="0"
                                size="small" style="width: 100%" />
                            <span v-else>{{ record.reviewerCount }}</span>
                        </template>
                    </template>
                </a-table>
            </div>

            <div class="info-section">
                <div class="section-header">
                    <div class="title">照片/视频</div>
                </div>

                <div class="media-grid">
                    <div v-for="i in 2" :key="`image-${i}`" class="media-item image-placeholder">
                        <img src="" alt="" />
                    </div>

                    <div class="media-item video-placeholder">
                        <video controls>
                            <source src="" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </div>
        </div>

        <div class="dialog-footer">
            <a-button @click="handleCancel">取 消</a-button>
            <a-button v-if="!isViewMode" type="primary" @click="handleConfirm">
                确 定
            </a-button>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    record: {
        type: Object,
        default: () => ({})
    },
    isViewMode: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const basicInfo = reactive({
    district: '四川省成都市',
    farmName: 'XXXXXX养殖场',
    address: '四川省成都市XXXXXXXXX',
    reportUser: '张三',
    reportTime: '2025-03-31',
    breeder: '张三 15561280883'
});

const deathInfo = reactive({
    deathTime: '2025-03-31',
    totalReportCount: '6',
    aiTotalCount: '1'
});

const deathColumns = [
    {
        title: '种类',
        dataIndex: 'type',
        key: 'type',
        align: 'center'
    },
    {
        title: '死亡数量',
        dataIndex: 'deathCount',
        key: 'deathCount',
        align: 'center'
    },
    {
        title: '审核员点数',
        dataIndex: 'reviewerCount',
        key: 'reviewerCount',
        align: 'center'
    }
];

const deathData = ref([
    {
        key: '1',
        type: '育肥猪',
        deathCount: 2,
        reviewerCount: props.isViewMode ? 2 : 0
    },
    {
        key: '2',
        type: '仔猪',
        deathCount: 4,
        reviewerCount: props.isViewMode ? 4 : 0
    },
    {
        key: '3',
        type: '能繁母猪',
        deathCount: 0,
        reviewerCount: props.isViewMode ? 0 : 0
    }
]);

const handleCancel = () => {
    dialogVisible.value = false;
};

const handleConfirm = () => {
    const reviewData = {
        reviewerCounts: deathData.value.map(item => ({
            type: item.type,
            count: item.reviewerCount
        }))
    };

    emit('confirm', reviewData);
    dialogVisible.value = false;
};
</script>

<style lang="scss" scoped>
.death-detail-dialog {
    :deep(.ant-modal-content) {
        padding: 0;
    }

    :deep(.ant-modal-header) {
        padding: 16px 24px;
        border-bottom: 1px solid #f0f0f0;
    }

    :deep(.ant-modal-title) {
        font-size: 16px;
        font-weight: 500;
    }

    :deep(.ant-modal-body) {
        padding: 0;
    }

    .dialog-content {
        width: 100%;
        max-height: calc(100vh - 200px);
        overflow-y: auto;
        overflow-x: hidden;
    }

    .info-section {
        margin-bottom: 24px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .section-header {
        margin-bottom: 16px;

        .title {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            position: relative;
            padding-left: 10px;

            &:before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 4px;
                height: 16px;
                background-color: #5276E5;
                border-radius: 2px;
            }
        }
    }

    .info-row {
        margin-bottom: 12px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .info-item {
        display: flex;
        align-items: center;

        .label {
            color: #666;
            margin-right: 8px;
            white-space: nowrap;
        }

        .value {
            color: #333;
        }

        .warning-icon {
            color: #ff4d4f;
            font-size: 16px;
            margin-left: 8px;
            cursor: pointer;
        }

        .warning-message {
            color: #ff4d4f;
            margin-left: 8px;
            font-size: 12px;
        }
    }

    .death-table {
        margin-top: 16px;

        :deep(.ant-table-thead > tr > th) {
            background-color: #fafafa;
            font-weight: 500;
        }
    }

    .media-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
    }

    .media-item {
        width: calc(20% - 13px);
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        overflow: hidden;

        &.image-placeholder {
            height: 120px;
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                max-width: 100%;
                max-height: 100%;
            }
        }

        &.video-placeholder {
            background-color: #000;

            video {
                width: 100%;
                height: 120px;
                display: block;
            }
        }
    }

    .dialog-footer {
        border-top: 1px solid #f0f0f0;
        padding: 16px 24px;
        text-align: right;

        .ant-btn {
            margin-left: 8px;
        }
    }
}
</style>