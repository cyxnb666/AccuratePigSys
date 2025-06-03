<template>
    <div class="review-detail">
        <!-- 面包屑导航 -->
        <div class="bread-detail-card">
            <div class="breadcrumb">
                <a-breadcrumb>
                    <a-breadcrumb-item>
                        <a @click="goBack">
                            <left-outlined /> 返回
                        </a>
                    </a-breadcrumb-item>
                    <a-breadcrumb-item>{{ isViewMode ? '审核详情' : '审核任务' }}</a-breadcrumb-item>
                </a-breadcrumb>
            </div>
        </div>

        <!-- 内容区域 -->
        <div class="content-container">
            <div class="loading-overlay" v-if="loading">
                <a-spin tip="加载中..." />
            </div>
            <div class="scrollable-content" v-if="dataLoaded">
                <!-- 基础信息部分 -->
                <div class="info-section">
                    <div class="section-header" style="margin-bottom: 12px;">
                        <div class="title">基础信息</div>
                    </div>

                    <a-row :gutter="24" class="info-row">
                        <a-col :span="8">
                            <div class="info-item">
                                <span class="label">行政区划:</span>
                                <span class="value">{{ auditData.farmAddress }}</span>
                            </div>
                        </a-col>
                        <a-col :span="8">
                            <div class="info-item">
                                <span class="label">养殖场名称:</span>
                                <span class="value">{{ auditData.farmName }}</span>
                            </div>
                        </a-col>
                        <a-col :span="8">
                            <div class="info-item">
                                <span class="label">养殖场地址:</span>
                                <span class="value">{{ auditData.farmAddress }}</span>
                            </div>
                        </a-col>
                    </a-row>

                    <a-row :gutter="24" class="info-row">
                        <a-col :span="8">
                            <div class="info-item">
                                <span class="label">上报用户:</span>
                                <span class="value">{{ auditData.applyUserName }}</span>
                            </div>
                        </a-col>
                        <a-col :span="8">
                            <div class="info-item">
                                <span class="label">上报时间:</span>
                                <span class="value">{{ auditData.applyTime }}</span>
                            </div>
                        </a-col>
                        <a-col :span="8">
                            <div class="info-item">
                                <span class="label">上报点数总数:</span>
                                <span class="value">{{ auditData.persionalCheckCount }}</span>
                            </div>
                        </a-col>
                    </a-row>

                    <a-row :gutter="24" class="info-row">
                        <a-col :span="8">
                            <div class="info-item">
                                <span class="label">AI点数总数:</span>
                                <span class="value">{{ auditData.aiCheckCount }}</span>
                                <span v-if="auditData.aiPersionDiffRate > 20" class="deviation-warning">
                                    (预警提示: 上报点数与AI点数差异已超过预警阈值20%, 请仔细审核)
                                </span>
                            </div>
                        </a-col>
                    </a-row>
                </div>

                <!-- 存栏信息部分 -->
                <div class="inventory-section">
                    <div class="section-header">
                        <div class="title">存栏信息</div>
                    </div>

                    <a-tabs v-model:activeKey="activeMainTab">
                        <a-tab-pane key="inventory" tab="存栏上报">
                            <!-- 养殖区域选择和展示 -->
                            <div class="price-points-section">
                                <!-- 左侧导航栏 -->
                                <div class="sidebar-navigation">
                                    <div class="navigation-header">养殖区域列表</div>
                                    <div class="navigation-list">
                                        <div v-for="(area, index) in auditData.auditFences" :key="index"
                                            :class="['navigation-item', currentAreaIndex === index ? 'active' : '']"
                                            @click="currentAreaIndex = index">
                                            {{ area.fenceName }}
                                        </div>
                                    </div>
                                </div>

                                <!-- 右侧内容区域 -->
                                <div class="point-content">
                                    <div class="price-point-header">{{ getCurrentArea().fenceName }}</div>

                                    <div class="price-point-details">
                                        <div class="loading-overlay" v-if="currentFenceLoading">
                                            <a-spin tip="加载中..." />
                                        </div>

                                        <a-tabs v-model:activeKey="activeSubTab">
                                            <a-tab-pane v-if="hasFenceType('PORKER')" key="fattening" tab="育肥区">
                                                <div class="count-row">
                                                    <div class="count-items-container">
                                                        <div class="count-item">
                                                            <span class="label">上报数量：</span>
                                                            <span class="value">{{
                                                                getCurrentFence('PORKER')?.persionalCheckCount }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">AI点数：</span>
                                                            <span class="value">{{
                                                                getCurrentFence('PORKER')?.aiCheckCount }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">审核员点数：</span>
                                                            <a-input-number v-if="!isViewMode"
                                                                v-model:value="getCurrentFence('PORKER').auditPersionalCheckCount"
                                                                :min="0" style="width: 120px" />
                                                            <span v-else class="value">{{
                                                                getCurrentFence('PORKER')?.auditPersionalCheckCount
                                                                }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">上次上报数量：</span>
                                                            <span class="value">{{
                                                                getCurrentFence('PORKER')?.lastPersionalCheckCount
                                                                }}</span>
                                                        </div>
                                                    </div>
                                                    <div class="detail-button-container">
                                                        <a-button type="primary" size="small"
                                                            @click="goToDetailedComparison('fattening')">详细对比</a-button>
                                                    </div>
                                                </div>

                                                <div v-if="filePreviewsLoaded">
                                                    <!-- 视频展示区域 -->
                                                    <div class="video-container">
                                                        <div v-if="currentVideoURL" class="video-content">
                                                            <video controls width="100%" height="100%">
                                                                <source :src="currentVideoURL" type="video/mp4">
                                                                您的浏览器不支持 video 标签。
                                                            </video>
                                                        </div>
                                                        <div v-else class="video-placeholder">
                                                            <div class="placeholder-text">暂无视频数据</div>
                                                        </div>
                                                    </div>

                                                    <!-- 轨迹图展示 -->
                                                    <div class="track-section">
                                                        <div class="track-title">视频拍摄轨迹图</div>
                                                        <div class="track-container">
                                                            <div class="track-item">
                                                                <div class="track-header">传感器轨迹</div>
                                                                <div class="track-content sensor-track">
                                                                    <img v-if="currentSensorImageURL"
                                                                        :src="currentSensorImageURL" alt="传感器轨迹"
                                                                        style="width: 100%; height: 100%; object-fit: contain;" />
                                                                    <div v-else class="placeholder-text"
                                                                        style="height: 100%; display: flex; align-items: center; justify-content: center;">
                                                                        暂无传感器轨迹数据</div>
                                                                </div>
                                                            </div>
                                                            <div class="track-item">
                                                                <div class="track-header">GPS轨迹</div>
                                                                <div class="track-content gps-track">
                                                                    <plot-g-p-s :fence-data="fenceData"
                                                                        :tracking-data="trackingData"
                                                                        :area-type="activeSubTab" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a-tab-pane>

                                            <a-tab-pane v-if="hasFenceType('PIGLET')" key="piglets" tab="仔猪区">
                                                <div class="count-row">
                                                    <div class="count-items-container">
                                                        <div class="count-item">
                                                            <span class="label">上报数量：</span>
                                                            <span class="value">{{
                                                                getCurrentFence('PIGLET')?.persionalCheckCount }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">AI点数：</span>
                                                            <span class="value">{{
                                                                getCurrentFence('PIGLET')?.aiCheckCount }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">审核员点数：</span>
                                                            <a-input-number v-if="!isViewMode"
                                                                v-model:value="getCurrentFence('PIGLET').auditPersionalCheckCount"
                                                                :min="0" style="width: 120px" />
                                                            <span v-else class="value">{{
                                                                getCurrentFence('PIGLET')?.auditPersionalCheckCount
                                                                }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">上次上报数量：</span>
                                                            <span class="value">{{
                                                                getCurrentFence('PIGLET')?.lastPersionalCheckCount
                                                                }}</span>
                                                        </div>
                                                    </div>
                                                    <div class="detail-button-container">
                                                        <a-button type="primary" size="small"
                                                            @click="goToDetailedComparison('piglets')">详细对比</a-button>
                                                    </div>
                                                </div>

                                                <div v-if="filePreviewsLoaded">
                                                    <!-- 视频展示区域 -->
                                                    <div class="video-container">
                                                        <div v-if="currentVideoURL" class="video-content">
                                                            <video controls width="100%" height="100%">
                                                                <source :src="currentVideoURL" type="video/mp4">
                                                                您的浏览器不支持 video 标签。
                                                            </video>
                                                        </div>
                                                        <div v-else class="video-placeholder">
                                                            <div class="placeholder-text">暂无视频数据</div>
                                                        </div>
                                                    </div>

                                                    <!-- 轨迹图展示 -->
                                                    <div class="track-section">
                                                        <div class="track-title">视频拍摄轨迹图</div>
                                                        <div class="track-container">
                                                            <div class="track-item">
                                                                <div class="track-header">传感器轨迹</div>
                                                                <div class="track-content sensor-track">
                                                                    <img v-if="currentSensorImageURL"
                                                                        :src="currentSensorImageURL" alt="传感器轨迹"
                                                                        style="width: 100%; height: 100%; object-fit: contain;" />
                                                                    <div v-else class="placeholder-text"
                                                                        style="height: 100%; display: flex; align-items: center; justify-content: center;">
                                                                        暂无传感器轨迹数据</div>
                                                                </div>
                                                            </div>
                                                            <div class="track-item">
                                                                <div class="track-header">GPS轨迹</div>
                                                                <div class="track-content gps-track">
                                                                    <plot-g-p-s :fence-data="fenceData"
                                                                        :tracking-data="trackingData"
                                                                        :area-type="activeSubTab" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a-tab-pane>

                                            <a-tab-pane v-if="hasFenceType('BROOD_SOW')" key="sows" tab="母猪区">
                                                <div class="count-row">
                                                    <div class="count-items-container">
                                                        <div class="count-item">
                                                            <span class="label">上报数量：</span>
                                                            <span class="value">{{
                                                                getCurrentFence('BROOD_SOW')?.persionalCheckCount
                                                                }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">AI点数：</span>
                                                            <span class="value">{{
                                                                getCurrentFence('BROOD_SOW')?.aiCheckCount }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">审核员点数：</span>
                                                            <a-input-number v-if="!isViewMode"
                                                                v-model:value="getCurrentFence('BROOD_SOW').auditPersionalCheckCount"
                                                                :min="0" style="width: 120px" />
                                                            <span v-else class="value">{{
                                                                getCurrentFence('BROOD_SOW')?.auditPersionalCheckCount
                                                                }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">上次上报数量：</span>
                                                            <span class="value">{{
                                                                getCurrentFence('BROOD_SOW')?.lastPersionalCheckCount
                                                                }}</span>
                                                        </div>
                                                    </div>
                                                    <div class="detail-button-container">
                                                        <a-button type="primary" size="small"
                                                            @click="goToDetailedComparison('sows')">详细对比</a-button>
                                                    </div>
                                                </div>

                                                <div v-if="filePreviewsLoaded">
                                                    <!-- 视频展示区域 -->
                                                    <div class="video-container">
                                                        <div v-if="currentVideoURL" class="video-content">
                                                            <video controls width="100%" height="100%">
                                                                <source :src="currentVideoURL" type="video/mp4">
                                                                您的浏览器不支持 video 标签。
                                                            </video>
                                                        </div>
                                                        <div v-else class="video-placeholder">
                                                            <div class="placeholder-text">暂无视频数据</div>
                                                        </div>
                                                    </div>

                                                    <!-- 轨迹图展示 -->
                                                    <div class="track-section">
                                                        <div class="track-title">视频拍摄轨迹图</div>
                                                        <div class="track-container">
                                                            <div class="track-item">
                                                                <div class="track-header">传感器轨迹</div>
                                                                <div class="track-content sensor-track">
                                                                    <img v-if="currentSensorImageURL"
                                                                        :src="currentSensorImageURL" alt="传感器轨迹"
                                                                        style="width: 100%; height: 100%; object-fit: contain;" />
                                                                    <div v-else class="placeholder-text"
                                                                        style="height: 100%; display: flex; align-items: center; justify-content: center;">
                                                                        暂无传感器轨迹数据</div>
                                                                </div>
                                                            </div>
                                                            <div class="track-item">
                                                                <div class="track-header">GPS轨迹</div>
                                                                <div class="track-content gps-track">
                                                                    <plot-g-p-s :fence-data="fenceData"
                                                                        :tracking-data="trackingData"
                                                                        :area-type="activeSubTab" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a-tab-pane>
                                        </a-tabs>

                                    </div>
                                </div>
                            </div>
                        </a-tab-pane>

                        <a-tab-pane key="movement" tab="出栏/补栏/死亡登记">
                            <!-- 出栏登记 -->
                            <div class="registration-section">
                                <div class="section-title">出栏登记</div>
                                <a-table :columns="outboundColumns" :data-source="outboundRecords" :pagination="false"
                                    bordered size="small">
                                </a-table>
                            </div>

                            <!-- 补栏登记 -->
                            <div class="registration-section">
                                <div class="section-title">补栏登记</div>
                                <a-table :columns="inboundColumns" :data-source="inboundRecords" :pagination="false"
                                    bordered size="small">
                                </a-table>
                            </div>

                            <!-- 死亡登记 -->
                            <div class="registration-section">
                                <div class="section-title">死亡登记</div>
                                <a-table :columns="deathColumns" :data-source="deathRecords" :pagination="false"
                                    bordered size="small">
                                    <template #bodyCell="{ column, record }">
                                        <template v-if="column.key === 'action'">
                                            <a-button type="link" @click="viewDeathDetail(record)"
                                                :loading="record.loading">详情</a-button>
                                        </template>
                                    </template>
                                </a-table>
                            </div>
                        </a-tab-pane>
                    </a-tabs>
                </div>

                <!-- 底部空白区域，确保内容不被底部按钮遮挡 -->
                <div class="bottom-spacer"></div>
            </div>
            <div v-else-if="!loading" class="empty-state">
                <a-empty description="无数据" />
            </div>

            <!-- 底部操作栏 -->
            <div class="form-actions" v-if="dataLoaded">
                <div class="review-row">
                    <div class="row-title">
                        <div class="title">审核信息</div>
                    </div>
                    <div class="review-top-options">
                        <div class="review-option-item">
                            <span class="review-label">审核意见:</span>
                            <a-radio-group v-model:value="reviewData.result" :disabled="isViewMode">
                                <a-radio :value="1">审核通过</a-radio>
                                <a-radio :value="0">审核不通过</a-radio>
                            </a-radio-group>
                        </div>
                        <div class="review-option-item">
                            <span class="review-label">审核员点数:</span>
                            <span class="review-value">{{ calculateTotalReviewerCount() }}</span>
                            <span class="review-note">(自动计算所有总和)</span>
                        </div>
                        <div class="review-option-item">
                            <span class="review-label">应计存栏数:</span>
                            <span class="review-value">{{ auditData.leaveCount }}</span>
                        </div>
                        <div class="review-option-item">
                            <span class="review-label">上报点数总数:</span>
                            <span class="review-value">{{ auditData.persionalCheckCount }}</span>
                        </div>
                    </div>
                </div>

                <div class="review-bottom-row">
                    <div class="comment-section">
                        <span class="review-label">审核备注:</span>
                        <a-textarea v-model:value="reviewData.comment" :disabled="isViewMode" placeholder="请输入审核备注信息"
                            :rows="1" :maxlength="250" show-count />
                    </div>
                    <div class="action-buttons">
                        <a-button @click="goBack">返回</a-button>
                        <a-button v-if="!isViewMode" type="primary" @click="submitReview"
                            style="margin-left: 16px;">完成审核</a-button>
                    </div>
                </div>
            </div>
        </div>
        <death-detail-dialog ref="deathDetailRef" v-model="deathDetailVisible" :record="currentDeathRecord"
            :is-view-mode="isViewMode" @confirm="handleDeathDetailConfirm" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { LeftOutlined } from '@ant-design/icons-vue';
import DeathDetailDialog from './DeathDetailDialog.vue';
import PlotGPS from '../PlotGPS/PlotGPS.vue';
import {
    getAuditDetail,
    queryRangeRegistDeads,
    queryRangeRegistRestocks,
    queryRangeRegistSlaughters,
    getWebDeadRegist,
    getLeaveFence,
    deadConfirm,
    submitAudit,
    calculateLeaveCount
} from '../api';

const deathDetailVisible = ref(false);
const currentDeathRecord = ref(null);
const loading = ref(false);
const dataLoaded = ref(false);

const props = defineProps({
    isViewMode: {
        type: Boolean,
        default: false
    },
    recordId: {
        type: [String, Number],
        default: ''
    }
});

const router = useRouter();
const route = useRoute();

// 活动标签页
const activeMainTab = ref('inventory');
const activeSubTab = ref('fattening');
const currentAreaIndex = ref(0);

const auditData = ref(null);

// 审核数据
const reviewData = reactive({
    result: null,
    comment: '',
});

// 获取当前区域
const getCurrentArea = () => {
    if (!auditData.value || !auditData.value.auditFences || auditData.value.auditFences.length === 0) {
        return {};
    }
    return auditData.value.auditFences[currentAreaIndex.value] || {};
};

// 获取当前围栏
const getCurrentFence = (breedCode) => {
    const area = getCurrentArea();
    if (!area || !area.fences) {
        return {};
    }
    return area.fences.find(f => f.breedCode === breedCode) || {};
};

// 检查当前区域是否有特定类型的围栏
const hasFenceType = (breedCode) => {
    const area = getCurrentArea();
    if (!area || !area.fences) {
        return false;
    }
    return area.fences.some(f => f.breedCode === breedCode);
};

const filePreviewsLoaded = ref(false);

// 获取当前区域的围栏数据
const fenceData = computed(() => {
    const area = getCurrentArea();
    if (!area || !area.coordinate) {
        return { path: [] };
    }

    try {
        if (typeof area.coordinate === 'string') {
            return { path: JSON.parse(area.coordinate) };
        } else {
            return { path: area.coordinate || [] };
        }
    } catch (e) {
        console.error('解析围栏坐标失败:', e);
        return { path: [] };
    }
});

const currentFenceDetail = ref(null);
const currentFenceLoading = ref(false);

const currentVideoURL = computed(() => {
    if (!currentFenceDetail.value || !currentFenceDetail.value.files) {
        return null;
    }

    const videoFile = currentFenceDetail.value.files.find(f => f.fileType === 'SENCE_AI');
    return videoFile ? videoFile.fileUrl : null;
});

const currentSensorImageURL = computed(() => {
    if (!currentFenceDetail.value || !currentFenceDetail.value.files) {
        return null;
    }

    const sensorFile = currentFenceDetail.value.files.find(f => f.fileType === 'SENSOR');
    return sensorFile ? sensorFile.fileUrl : null;
});

// 轨迹数据计算属性
const trackingData = computed(() => {
    if (!currentFenceDetail.value || !currentFenceDetail.value.gpss) {
        return [];
    }

    return currentFenceDetail.value.gpss.map(gps => ({
        lng: parseFloat(gps.longitude),
        lat: parseFloat(gps.latitude),
        timestamp: `${gps.timestamp}s`
    }));
});

// 根据活动标签获取当前breed code
const getCurrentBreedCode = () => {
    const breedMap = {
        'fattening': 'PORKER',
        'piglets': 'PIGLET',
        'sows': 'BROOD_SOW'
    };
    return breedMap[activeSubTab.value];
};

// const fenceDetailsCache = reactive({});
const loadCurrentFenceDetail = async () => {
    // 重置状态
    filePreviewsLoaded.value = false;

    const breedCode = getCurrentBreedCode();
    const currentFence = getCurrentFence(breedCode);

    if (!currentFence || !currentFence.fenceRegistId) {
        console.log('没有找到当前围栏信息或ID');
        filePreviewsLoaded.value = true;
        currentFenceDetail.value = null;
        return;
    }

    const fenceRegistId = currentFence.fenceRegistId;
    currentFenceLoading.value = true;

    try {
        console.log('从API加载围栏数据:', fenceRegistId);
        const response = await getLeaveFence(fenceRegistId);

        if (response) {
            currentFenceDetail.value = response;
            filePreviewsLoaded.value = true;
        } else {
            currentFenceDetail.value = null;
            filePreviewsLoaded.value = true;
        }
    } catch (error) {
        console.error('加载围栏详情失败:', error);
        currentFenceDetail.value = null;
        filePreviewsLoaded.value = true;
    } finally {
        currentFenceLoading.value = false;
    }
};

// 设置默认选中的子标签
const setDefaultActiveSubTab = () => {
    const area = getCurrentArea();
    if (area && Array.isArray(area.fences)) {
        if (hasFenceType('PORKER')) {
            activeSubTab.value = 'fattening';
        } else if (hasFenceType('PIGLET')) {
            activeSubTab.value = 'piglets';
        } else if (hasFenceType('BROOD_SOW')) {
            activeSubTab.value = 'sows';
        } else {
            activeSubTab.value = 'fattening';
        }
    }
};

const outboundColumns = [
    {
        title: '时间',
        dataIndex: 'startDate',
        key: 'startDate',
        align: 'center',
        customRender: ({ text, record }) => {
            return record.startDate && record.endDate
                ? `${record.startDate} - ${record.endDate}`
                : record.startDate || '';
        }
    },
    { title: '上报时间', dataIndex: 'registTime', key: 'registTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'porkerCount', key: 'porkerCount', align: 'center' },
    { title: '仔猪数量', dataIndex: 'pigletCount', key: 'pigletCount', align: 'center' },
    { title: '母猪数量', dataIndex: 'sowCount', key: 'sowCount', align: 'center' }
];

const inboundColumns = [
    {
        title: '时间',
        dataIndex: 'startDate',
        key: 'startDate',
        align: 'center',
        customRender: ({ text, record }) => {
            return record.startDate && record.endDate
                ? `${record.startDate} - ${record.endDate}`
                : record.startDate || '';
        }
    },
    { title: '上报时间', dataIndex: 'registTime', key: 'registTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'porkerCount', key: 'porkerCount', align: 'center' },
    { title: '仔猪数量', dataIndex: 'pigletCount', key: 'pigletCount', align: 'center' },
    { title: '母猪数量', dataIndex: 'sowCount', key: 'sowCount', align: 'center' }
];

const deathColumns = [
    {
        title: '时间',
        dataIndex: 'startDate',
        key: 'startDate',
        align: 'center',
        customRender: ({ text, record }) => {
            return record.startDate && record.endDate
                ? `${record.startDate} - ${record.endDate}`
                : record.startDate || '';
        }
    },
    { title: '上报时间', dataIndex: 'registTime', key: 'registTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'porkerCount', key: 'porkerCount', align: 'center' },
    { title: '仔猪数量', dataIndex: 'pigletCount', key: 'pigletCount', align: 'center' },
    { title: '母猪数量', dataIndex: 'sowCount', key: 'sowCount', align: 'center' },
    { title: '操作', key: 'action', align: 'center' }
];

const outboundRecords = ref([]);
const inboundRecords = ref([]);
const deathRecords = ref([]);

// 计算审核员点数总和
const calculateTotalReviewerCount = () => {
    let total = 0;
    if (auditData.value && auditData.value.auditFences) {
        auditData.value.auditFences.forEach(area => {
            if (area.fences && Array.isArray(area.fences)) {
                area.fences.forEach(fence => {
                    total += (fence.auditPersionalCheckCount || 0);
                });
            }
        });
    }
    return total;
};

const viewDeathDetail = async (record) => {
    try {
        // 设置当前记录的loading状态为true
        const index = deathRecords.value.findIndex(item => item.bizId === record.bizId);
        if (index !== -1) {
            deathRecords.value[index].loading = true;
        }

        const detailRes = await getWebDeadRegist(record.bizId);

        // 获取文件预览
        if (detailRes.files && detailRes.files.length > 0) {
            detailRes.filePreviewUrls = {
                images: [],
                videos: []
            };

            detailRes.files.forEach(file => {
                // 根据文件后缀区分图片和视频
                const isVideo = ['mp4', 'mov', 'avi', 'wmv'].includes(file.fileSuffix.toLowerCase());

                if (isVideo) {
                    detailRes.filePreviewUrls.videos.push({
                        id: file.fileId,
                        name: file.fileName,
                        url: file.fileUrl
                    });
                } else {
                    detailRes.filePreviewUrls.images.push({
                        id: file.fileId,
                        name: file.fileName,
                        url: file.fileUrl
                    });
                }
            });
        }

        currentDeathRecord.value = detailRes;
        deathDetailVisible.value = true;
    } catch (error) {
        console.error('获取死亡登记详情失败:', error);
    } finally {
        // 结束当前记录的loading状态
        const index = deathRecords.value.findIndex(item => item.bizId === record.bizId);
        if (index !== -1) {
            deathRecords.value[index].loading = false;
        }
    }
};

const deathDetailRef = ref(null);
const handleDeathDetailConfirm = async (reviewData) => {
    try {
        const breeds = currentDeathRecord.value.breeds.map(breed => {
            // 找到对应的审核数量
            const reviewItem = reviewData.reviewerCounts.find(item => {
                const typeMap = {
                    'PORKER': '育肥猪',
                    'PIGLET': '仔猪',
                    'BROOD_SOW': '能繁母猪'
                };
                const typeName = typeMap[breed.breedCode] || breed.breedName;
                return item.type === typeName;
            });

            return {
                auditPersionalCheckCount: reviewItem?.count || 0,
                deadBreedId: breed.breedDeadId
            };
        });

        const requestData = {
            condition: {
                breeds: breeds,
                registId: currentDeathRecord.value.registId
            }
        };

        // 死亡
        await deadConfirm(requestData);

        const farmId = auditData.value.farmId;
        if (farmId) {
            const leaveCountRes = await calculateLeaveCount(farmId);
            if (leaveCountRes && auditData.value) {
                auditData.value.leaveCount = leaveCountRes;
            }
        }
        deathDetailVisible.value = false;
        message.success('死亡登记审核已保存');

        // 重新加载页面数据
        // await loadData();
    } catch (error) {
        console.error('保存死亡登记审核失败:', error);
    } finally {
        // 重置对话框中的loading状态
        if (deathDetailRef.value) {
            deathDetailRef.value.resetSubmitting();
        }
    }
};

const goToDetailedComparison = (tabType: string) => {
    savePageState();
    // 获取当前选中的围栏信息
    const breedCode = getCurrentBreedCode();
    const currentFence = getCurrentFence(breedCode);

    // 保存当前围栏ID到sessionStorage，供SuperDetail页面使用
    if (currentFence && currentFence.fenceRegistId) {
        sessionStorage.setItem(`current_fence_id_${route.params.id}`, currentFence.fenceRegistId);
    }

    // 标记从ReviewDetail页面跳转
    sessionStorage.setItem(`from_review_detail_${route.params.id}`, 'true');

    router.push({
        path: `/AUDITD/super-detail/${route.params.id}`,
        query: {
            area: currentAreaIndex.value,
            tab: tabType
        }
    });
};

// 返回上一页
const goBack = () => {
    const source = route.query.source;
    if (source === 'pending' || source === 'completed') {
        router.push({
            path: '/AUDITD',
            query: { activeKey: source }
        });
    } else {
        router.go(-1);
    }
};

// 提交审核
const submitReview = async () => {
    if (reviewData.result === null) {
        message.error('请选择审核意见');
        return;
    }

    // 如果审核不通过，必须填写审核备注
    if (reviewData.result === 0 && (!reviewData.comment || reviewData.comment.trim() === '')) {
        message.error('审核不通过时必须填写审核备注');
        return;
    }

    // 检查是否所有区域都已填写审核员点数
    let hasEmptyCount = false;
    if (auditData.value && auditData.value.auditFences) {
        auditData.value.auditFences.forEach(area => {
            if (area.fences && Array.isArray(area.fences)) {
                area.fences.forEach(fence => {
                    if (
                        (fence.breedCode === 'PORKER' && (fence.auditPersionalCheckCount === undefined || fence.auditPersionalCheckCount === null)) ||
                        (fence.breedCode === 'PIGLET' && (fence.auditPersionalCheckCount === undefined || fence.auditPersionalCheckCount === null)) ||
                        (fence.breedCode === 'BROOD_SOW' && (fence.auditPersionalCheckCount === undefined || fence.auditPersionalCheckCount === null))
                    ) {
                        hasEmptyCount = true;
                    }
                });
            }
        });
    }

    if (hasEmptyCount) {
        message.warning('请确保所有区域的审核员点数已填写');
        return;
    }

    try {
        const auditFences = [];

        // 遍历所有养殖区域，收集每个围栏的审核员点数
        if (auditData.value && auditData.value.auditFences) {
            auditData.value.auditFences.forEach(area => {
                if (area.fences && Array.isArray(area.fences)) {
                    area.fences.forEach(fence => {
                        auditFences.push({
                            auditPersionalCheckCount: fence.auditPersionalCheckCount || 0,
                            fenceRegistId: fence.fenceRegistId
                        });
                    });
                }
            });
        }

        const auditSubmitData = {
            auditFences,
            auditId: route.params.id.toString(),
            auditRemark: reviewData.comment,
            auditStatus: reviewData.result === 1 ? 'AUDITSUCC' : 'AUDITFAIL',
            leaveCount: auditData.value.leaveCount,
            registId: auditData.value.registId
        };
        await submitAudit(auditSubmitData);

        message.success('审核完成');
        router.push('/AUDITD');
    } catch (error) {
        console.error('提交审核失败:', error);
    }
};

// 加载数据
const loadData = async () => {
    const auditId = route.params.id;

    if (auditId) {
        const fromSuperDetail = sessionStorage.getItem(`from_super_detail_${auditId}`);

        // 如果是从 SuperDetail 页面返回，并且数据已经加载过，跳过重新加载
        if (fromSuperDetail === 'true' && dataLoaded.value) {
            // 清除标记
            sessionStorage.removeItem(`from_super_detail_${auditId}`);
            return;
        }
        loading.value = true;
        dataLoaded.value = false;
        try {
            const res = await getAuditDetail(auditId.toString());

            if (res) {
                auditData.value = res;
                sessionStorage.setItem(`audit_data_${auditId}`, JSON.stringify(res));
                reviewData.comment = res.auditRemark || '';

                if (props.isViewMode && res.auditStatus) {
                    reviewData.result = res.auditStatus === 'AUDITSUCC' ? 1 : 0;
                    reviewData.comment = res.auditRemark || '';
                }

                // 设置默认选中的区域和子标签
                if (res.auditFences && res.auditFences.length > 0) {
                    currentAreaIndex.value = 0;
                    setDefaultActiveSubTab();
                }

                // 获取其他记录数据
                const [deathsRes, restocksRes, slaughtersRes] = await Promise.all([
                    queryRangeRegistDeads(auditId.toString()),
                    queryRangeRegistRestocks(auditId.toString()),
                    queryRangeRegistSlaughters(auditId.toString())
                ]);

                // 处理死亡记录数据
                if (deathsRes) {
                    deathRecords.value = deathsRes.map(item => ({
                        ...item,
                        loading: false
                    }));
                }

                // 处理补栏记录数据
                if (restocksRes) {
                    inboundRecords.value = restocksRes;
                }

                // 处理出栏记录数据
                if (slaughtersRes) {
                    outboundRecords.value = slaughtersRes;
                }

                dataLoaded.value = true;

                loadCurrentFenceDetail();
            }
        } catch (error) {
            console.error('获取审核详情失败:', error);
        } finally {
            loading.value = false;
        }
    } else {
        console.error('未找到审核ID');
    }
};

const savePageState = () => {
    // 保存当前页面的所有重要状态到 sessionStorage
    const pageState = {
        auditData: auditData.value,
        currentAreaIndex: currentAreaIndex.value,
        activeMainTab: activeMainTab.value,
        activeSubTab: activeSubTab.value,
        // fenceDetailsCache: { ...fenceDetailsCache },
        outboundRecords: outboundRecords.value,
        inboundRecords: inboundRecords.value,
        deathRecords: deathRecords.value,
        reviewData: { ...reviewData },
        dataLoaded: true
    };

    sessionStorage.setItem(`review_detail_state_${route.params.id}`, JSON.stringify(pageState));
};

watch(currentAreaIndex, () => {
    setDefaultActiveSubTab();
});

watch([currentAreaIndex, activeSubTab], () => {
    loadCurrentFenceDetail();
}, { immediate: false });

onMounted(() => {
    const auditId = route.params.id;
    const savedState = sessionStorage.getItem(`review_detail_state_${auditId}`);

    if (savedState) {
        // 存在保存的状态，恢复它
        try {
            const state = JSON.parse(savedState);

            // 恢复各种状态
            auditData.value = state.auditData;
            currentAreaIndex.value = state.currentAreaIndex;
            activeMainTab.value = state.activeMainTab;
            activeSubTab.value = state.activeSubTab;
            // Object.assign(fenceDetailsCache, state.fenceDetailsCache);
            outboundRecords.value = state.outboundRecords;
            inboundRecords.value = state.inboundRecords;
            deathRecords.value = state.deathRecords;
            Object.assign(reviewData, state.reviewData);
            dataLoaded.value = state.dataLoaded;

            // 重新加载当前围栏的详细数据
            loadCurrentFenceDetail();

            console.log('已从会话存储恢复页面状态');

            // 清除已使用的状态
            sessionStorage.removeItem(`review_detail_state_${auditId}`);
        } catch (error) {
            console.error('恢复状态失败，将重新加载数据:', error);
            loadData();
        }
    } else {
        // 没有保存的状态，正常加载数据
        loadData();
    }
});
</script>

<style lang="scss" scoped>
.review-detail {
    display: flex;
    flex-direction: column;
    height: 100%;

    .bread-detail-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        padding: 16px;
        margin-bottom: 16px;
    }

    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    .price-point-details.relative {
        position: relative;
        min-height: 200px;
    }

    .price-point-details .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
    }

    .content-container {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
    }

    .scrollable-content {
        flex: 1;
        padding: 20px 20px 0 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .section-header {
        display: flex;
        align-items: center;
        // margin-bottom: 12px;

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

    .info-section {
        margin-bottom: 24px;
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
    }

    .deviation-warning {
        color: #ff4d4f;
        margin-left: 8px;
        font-size: 12px;
    }

    .inventory-section {
        // margin-bottom: 24px;
    }

    .placeholder-message {
        padding: 40px;
        text-align: center;
        color: #999;
        font-style: italic;
    }

    .price-points-section {
        display: flex;
        border: 1px solid #e5e5e5;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 16px;
        min-height: 400px;
    }

    .sidebar-navigation {
        width: 200px;
        border-right: 1px solid #e5e5e5;
        background-color: #f9f9f9;
    }

    .navigation-header {
        background-color: #5276E5;
        color: white;
        padding: 10px 16px;
        font-weight: bold;
    }

    :deep(.ant-tabs-nav) {
        margin-bottom: 0 !important;
    }

    .navigation-list {
        height: 100%;
    }

    .navigation-item {
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid #e5e5e5;
    }

    .navigation-item:hover {
        background-color: #f5f5f5;
    }

    .navigation-item.active {
        background-color: #e6f7ff;
        border-right: 3px solid #1890ff;
        font-weight: bold;
    }

    .point-content {
        flex: 1;
    }

    .price-point-header {
        background-color: #5276E5;
        color: white;
        padding: 10px 16px;
        font-weight: bold;
    }

    .price-point-details {
        padding: 16px;
    }

    .count-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .count-items-container {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
    }

    .detail-button-container {
        margin-left: auto;
    }

    .count-item {
        display: flex;
        align-items: center;
        margin-right: 20px;

        .label {
            margin-right: 8px;
            white-space: nowrap;
            color: #666;
        }

        .value {
            font-weight: 500;
        }
    }

    .video-container {
        margin-bottom: 20px;
    }

    .video-placeholder {
        width: 50%;
        height: 300px;
        background-color: #000;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
    }

    .video-content {
        width: 50%;
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000;
        border-radius: 4px;
        overflow: hidden;
    }

    .video-content video {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .placeholder-text {
        color: #999;
        font-size: 14px;
        text-align: center;
    }

    .track-section {
        margin-bottom: 20px;
    }

    .track-title {
        font-weight: 500;
        margin-bottom: 10px;
    }

    .track-container {
        display: flex;
        gap: 20px;
    }

    .track-item {
        flex: 1;
    }

    .track-header {
        background-color: #f0f2f5;
        padding: 8px 12px;
        font-weight: 500;
        border: 1px solid #e8e8e8;
        border-bottom: none;
    }

    .track-content {
        height: 200px;
        border: 1px solid #e8e8e8;
    }

    .sensor-track {
        background-color: #f9f9f9;
    }

    .gps-track {
        background-color: #f9f9f9;
    }

    .bottom-spacer {
        height: 60px;
    }

    .form-actions {
        padding: 12px;
        box-shadow: 0 -3px 5px rgba(194, 193, 193, 0.3);
        border-top: 1px solid #e8e8e8;
        position: sticky;
        bottom: 0;
    }

    .review-row {
        margin-bottom: 16px;
    }

    .row-title {
        margin-bottom: 8px;

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

    .review-top-options {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 24px;
    }

    .review-option-item {
        display: flex;
        align-items: center;
    }

    .review-bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .comment-section {
        display: flex;
        align-items: center;
        flex: 0 1 800px;
        margin-right: 20px;

        .review-label {
            margin-right: 10px;
            white-space: nowrap;
        }

        :deep(.ant-input) {
            flex: 1;
        }

        :deep(.ant-input-textarea) {
            width: 100%;
            max-width: 800px;
        }

        :deep(.ant-input-textarea-show-count) {
            &::after {
                position: absolute;
                bottom: 5px;
                right: 10px;
            }
        }
    }

    .review-label {
        font-weight: 500;
        margin-right: 10px;
    }

    .review-value {
        font-weight: 500;
        color: #1890ff;
    }

    .review-note {
        color: #999;
        font-size: 12px;
        margin-left: 8px;
    }

    .action-buttons {
        display: flex;
        justify-content: flex-end;
        white-space: nowrap;
        align-self: flex-end;
    }

    .registration-section {
        margin-bottom: 24px;
    }

    .section-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 12px;
        color: #333;
        position: relative;
        padding-left: 10px;
    }

    .section-title:before {
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
</style>