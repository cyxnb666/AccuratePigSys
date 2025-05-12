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
                            <span class="value">{{ record.areaName }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">养殖场名称:</span>
                            <span class="value">{{ record.farmName }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">养殖场地址:</span>
                            <span class="value">{{ record.farmAddress }}</span>
                        </div>
                    </a-col>
                </a-row>

                <a-row :gutter="24" class="info-row">
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">上报用户:</span>
                            <span class="value">{{ record.registUserName }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">上报时间:</span>
                            <span class="value">{{ record.registTime }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">养殖员（主要联系人）:</span>
                            <span class="value">{{ record.primaryLinkerName }} {{ record.primaryLinkerMobile }}</span>
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
                            <span class="value">{{ record.startDate }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">上报总数:</span>
                            <span class="value">{{ record.registCount }}</span>
                        </div>
                    </a-col>
                    <a-col :span="8">
                        <div class="info-item">
                            <span class="label">AI点数总数:</span>
                            <span class="value">{{ record.aiCheckCount }}</span>
                            <a-popover v-if="showAiWarning" title="预警提示">
                                <template #content>
                                    上报点数与AI点数差异已超过预警阈值20%，请仔细审核
                                </template>
                                <exclamation-circle-filled class="warning-icon" />
                            </a-popover>
                        </div>
                    </a-col>
                </a-row>

                <a-table :columns="deathColumns" :data-source="deathTableData" :pagination="false" bordered size="small"
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

            <div class="info-section" v-if="hasMediaFiles">
                <div class="section-header">
                    <div class="title">照片/视频</div>
                </div>

                <div class="media-content">
                    <!-- 图片预览部分 -->
                    <div v-if="record.filePreviewUrls?.images?.length > 0" class="images-section">
                        <div class="media-title">照片</div>
                        <a-image-preview-group>
                            <div class="images-grid">
                                <div v-for="img in record.filePreviewUrls.images" :key="img.id" class="image-item">
                                    <a-image :src="img.url" :alt="img.name" />
                                    <div class="image-name">{{ img.name }}</div>
                                </div>
                            </div>
                        </a-image-preview-group>
                    </div>

                    <!-- 视频预览部分 -->
                    <div v-if="record.filePreviewUrls?.videos?.length > 0" class="videos-section">
                        <div class="media-title">视频</div>
                        <div class="videos-grid">
                            <div v-for="video in record.filePreviewUrls.videos" :key="video.id" class="video-item">
                                <div class="image-container" @click="viewFile(video.url)">
                                    <div class="video-placeholder">
                                        <cloud-download-outlined class="downVideo"
                                            @click.stop="downloadFile(video.id, video.name)" />
                                        <video :src="video.url" autoplay controls controlsList="nodownload"></video>
                                    </div>
                                </div>
                                <div class="video-name">{{ video.name }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="dialog-footer">
            <a-button @click="handleCancel">取 消</a-button>
            <a-button v-if="!isViewMode" type="primary" @click="handleConfirm" :loading="submitting">
                确 定
            </a-button>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted, watch } from 'vue';
import { ExclamationCircleFilled, CloudDownloadOutlined } from '@ant-design/icons-vue';
import { getFilePreview } from '../api';

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

const submitting = ref(false);
const emit = defineEmits(['update:modelValue', 'confirm', 'loading']);

const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

// 计算是否显示媒体文件部分
const hasMediaFiles = computed(() => {
    return (
        props.record?.filePreviewUrls?.images?.length > 0 ||
        props.record?.filePreviewUrls?.videos?.length > 0
    );
});

// 计算是否显示AI点数预警
const showAiWarning = computed(() => {
    if (!props.record.registCount || !props.record.aiCheckCount) return false;

    const reportCount = Number(props.record.registCount) || 0;
    const aiCount = Number(props.record.aiCheckCount) || 0;

    if (reportCount === 0 || aiCount === 0) return false;

    const diffRate = Math.abs(reportCount - aiCount) / reportCount;
    return diffRate > 0.2; // 超过20%显示预警
});

// 死亡表格列定义
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

const deathTableData = computed(() => {
    if (!props.record || !props.record.breeds) return [];

    return props.record.breeds.map(breed => {
        const typeMap = {
            'PORKER': '育肥猪',
            'PIGLET': '仔猪',
            'BROOD_SOW': '能繁母猪'
        };

        const key = breed.breedDeadId;

        // 确保键已初始化
        if (!(key in reviewerCounts.value)) {
            reviewerCounts.value[key] = breed.auditPersionalCheckCount || 0;
        }

        return {
            key: key,
            type: typeMap[breed.breedCode] || breed.breedName,
            deathCount: breed.registCount || 0,
            get reviewerCount() { return reviewerCounts.value[key]; },
            set reviewerCount(val) { reviewerCounts.value[key] = val; }
        };
    });
});

const reviewerCounts = ref({});
watch(() => props.modelValue, (visible) => {
    if (visible && props.record && props.record.breeds) {
        // 重置计数器对象，初始化为API返回的每个breed的auditPersionalCheckCount
        const counts = {};
        props.record.breeds.forEach(breed => {
            counts[breed.breedDeadId] = breed.auditPersionalCheckCount || 0;
        });
        reviewerCounts.value = counts;
    }
}, { immediate: true });

// 视频播放相关方法
const viewFile = (url) => {
    if (url) {
        window.open(url, '_blank');
    }
};

// 下载文件
const downloadFile = async (id, fileName) => {
    if (!id) return;

    try {
        const blob = await getFilePreview(id); // 直接接收返回的Blob
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('下载文件失败:', error);
    }
};

const handleCancel = () => {
    dialogVisible.value = false;
};

const handleConfirm = () => {
    // 设置loading状态
    submitting.value = true;
    emit('loading', true);

    const reviewData = {
        reviewerCounts: deathTableData.value.map(item => ({
            type: item.type,
            count: item.reviewerCount
        }))
    };

    // 发送确认事件，但不关闭对话框
    emit('confirm', reviewData);
};

onUnmounted(() => {
    if (props.record?.filePreviewUrls) {
        // 释放图片URLs
        if (props.record.filePreviewUrls.images) {
            props.record.filePreviewUrls.images.forEach(img => {
                if (img.url) URL.revokeObjectURL(img.url);
            });
        }

        // 释放视频URLs
        if (props.record.filePreviewUrls.videos) {
            props.record.filePreviewUrls.videos.forEach(video => {
                if (video.url) URL.revokeObjectURL(video.url);
            });
        }
    }
});

defineExpose({
    resetSubmitting: () => {
        submitting.value = false;
    }
});
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
        margin-bottom: 0;
        padding-bottom: 12px;
        &:last-child {
            border-bottom: none;
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
    }

    .death-table {
        margin-top: 16px;

        :deep(.ant-table-thead > tr > th) {
            background-color: #fafafa;
            font-weight: 500;
        }
    }

    .media-content {
        margin-top: 16px;
    }

    .media-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 12px;
        color: #333;
    }

    .images-section,
    .videos-section {
        margin-bottom: 24px;
    }

    .images-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
    }

    .image-item {
        width: calc(20% - 13px);
        margin-bottom: 12px;

        :deep(.ant-image) {
            width: 100%;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f5f5f5;
            border-radius: 4px;
            overflow: hidden;

            img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
        }

        .image-name {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .videos-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
    }

    .video-item {
        width: calc(33.33% - 11px);
        margin-bottom: 12px;

        .image-container {
            width: 100%;
            height: 180px;
            border: 1px solid #e5e5e5;
            overflow: hidden;
            cursor: pointer;
        }

        .video-placeholder {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #f5f5f5;

            .downVideo {
                height: 20px;
                position: absolute;
                right: 5px;
                top: 5px;
                color: red;
                font-size: 20px;
                z-index: 999;
            }

            video {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
        }

        .video-name {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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