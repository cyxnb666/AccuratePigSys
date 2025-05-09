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
                <a-spin tip="加载中..."/>
            </div>
            <div class="scrollable-content" v-if="dataLoaded">
                <!-- 基础信息部分 -->
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
                                <span class="label">上报点数总数:</span>
                                <span class="value">{{ basicInfo.totalReportCount }}</span>
                            </div>
                        </a-col>
                    </a-row>

                    <a-row :gutter="24" class="info-row">
                        <a-col :span="8">
                            <div class="info-item">
                                <span class="label">AI点数总数:</span>
                                <span class="value">{{ basicInfo.aiTotalCount }}</span>
                                <span v-if="aiPersionDiffRate > 0.2" class="deviation-warning">
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
                                        <div v-for="(area, index) in farmAreas" :key="index"
                                            :class="['navigation-item', currentAreaIndex === index ? 'active' : '']"
                                            @click="currentAreaIndex = index">
                                            {{ area.name }}
                                        </div>
                                    </div>
                                </div>

                                <!-- 右侧内容区域 -->
                                <div class="point-content">
                                    <div class="price-point-header">{{ currentArea.name }}</div>

                                    <div class="price-point-details">
                                        <!-- 育肥区/仔猪区/母猪区子标签 -->
                                        <a-tabs v-model:activeKey="activeSubTab">
                                            <a-tab-pane v-if="hasFenceType('PORKER')" key="fattening" tab="育肥区">
                                                <div class="count-row">
                                                    <div class="count-items-container">
                                                        <div class="count-item">
                                                            <span class="label">上报数量：</span>
                                                            <span class="value">{{ currentArea.fatteningData.reportCount
                                                            }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">AI点数：</span>
                                                            <span class="value">{{ currentArea.fatteningData.aiCount
                                                            }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">审核员点数：</span>
                                                            <a-input-number v-if="!isViewMode"
                                                                v-model:value="currentArea.fatteningData.reviewerCount"
                                                                :min="0" style="width: 120px" />
                                                            <span v-else class="value">{{
                                                                currentArea.fatteningData.reviewerCount }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">上次上报数量：</span>
                                                            <span class="value">{{
                                                                currentArea.fatteningData.lastReportCount
                                                            }}</span>
                                                        </div>
                                                    </div>
                                                    <div class="detail-button-container">
                                                        <a-button type="primary" size="small"
                                                            @click="goToDetailedComparison('fattening')">详细对比</a-button>
                                                    </div>
                                                </div>

                                                <!-- 视频展示区域 -->
                                                <div class="video-container">
                                                    <div class="video-placeholder">
                                                        <!-- 实际项目中替换为真实视频 -->
                                                        <div class="placeholder-text">上报拍摄视频</div>
                                                    </div>
                                                </div>

                                                <!-- 轨迹图展示 -->
                                                <div class="track-section">
                                                    <div class="track-title">视频拍摄轨迹图</div>
                                                    <div class="track-container">
                                                        <div class="track-item">
                                                            <div class="track-header">传感器轨迹</div>
                                                            <div class="track-content sensor-track">
                                                                <!-- 传感器轨迹图占位符 -->
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
                                            </a-tab-pane>

                                            <a-tab-pane v-if="hasFenceType('PIGLET')" key="piglets" tab="仔猪区">
                                                <div class="count-row">
                                                    <div class="count-items-container">
                                                        <div class="count-item">
                                                            <span class="label">上报数量：</span>
                                                            <span class="value">{{ currentArea.pigletsData.reportCount
                                                            }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">AI点数：</span>
                                                            <span class="value">{{ currentArea.pigletsData.aiCount
                                                            }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">审核员点数：</span>
                                                            <a-input-number v-if="!isViewMode"
                                                                v-model:value="currentArea.pigletsData.reviewerCount"
                                                                :min="0" style="width: 120px" />
                                                            <span v-else class="value">{{
                                                                currentArea.pigletsData.reviewerCount
                                                            }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">上次上报数量：</span>
                                                            <span class="value">{{
                                                                currentArea.pigletsData.lastReportCount
                                                            }}</span>
                                                        </div>
                                                    </div>
                                                    <div class="detail-button-container">
                                                        <a-button type="primary" size="small"
                                                            @click="goToDetailedComparison('piglets')">详细对比</a-button>
                                                    </div>
                                                </div>

                                                <!-- 视频展示区域 -->
                                                <div class="video-container">
                                                    <div class="video-placeholder">
                                                        <!-- 实际项目中替换为真实视频 -->
                                                        <div class="placeholder-text">上报拍摄视频</div>
                                                    </div>
                                                </div>

                                                <!-- 轨迹图展示 -->
                                                <div class="track-section">
                                                    <div class="track-title">视频拍摄轨迹图</div>
                                                    <div class="track-container">
                                                        <div class="track-item">
                                                            <div class="track-header">传感器轨迹</div>
                                                            <div class="track-content sensor-track">
                                                                <!-- 传感器轨迹图占位符 -->
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
                                            </a-tab-pane>

                                            <a-tab-pane v-if="hasFenceType('BROOD_SOW')" key="sows" tab="母猪区">
                                                <div class="count-row">
                                                    <div class="count-items-container">
                                                        <div class="count-item">
                                                            <span class="label">上报数量：</span>
                                                            <span class="value">{{ currentArea.sowsData.reportCount
                                                                }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">AI点数：</span>
                                                            <span class="value">{{ currentArea.sowsData.aiCount
                                                                }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">审核员点数：</span>
                                                            <a-input-number v-if="!isViewMode"
                                                                v-model:value="currentArea.sowsData.reviewerCount"
                                                                :min="0" style="width: 120px" />
                                                            <span v-else class="value">{{
                                                                currentArea.sowsData.reviewerCount
                                                                }}</span>
                                                        </div>
                                                        <div class="count-item">
                                                            <span class="label">上次上报数量：</span>
                                                            <span class="value">{{ currentArea.sowsData.lastReportCount
                                                                }}</span>
                                                        </div>
                                                    </div>
                                                    <div class="detail-button-container">
                                                        <a-button type="primary" size="small"
                                                            @click="goToDetailedComparison('sows')">详细对比</a-button>
                                                    </div>
                                                </div>

                                                <!-- 视频展示区域 -->
                                                <div class="video-container">
                                                    <div class="video-placeholder">
                                                        <!-- 实际项目中替换为真实视频 -->
                                                        <div class="placeholder-text">上报拍摄视频</div>
                                                    </div>
                                                </div>

                                                <!-- 轨迹图展示 -->
                                                <div class="track-section">
                                                    <div class="track-title">视频拍摄轨迹图</div>
                                                    <div class="track-container">
                                                        <div class="track-item">
                                                            <div class="track-header">传感器轨迹</div>
                                                            <div class="track-content sensor-track">
                                                                <!-- 传感器轨迹图占位符 -->
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
                                            <a-button type="link" @click="viewDeathDetail(record)">详情</a-button>
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
                            <span class="review-value">{{ reviewData.expectedInventory }}</span>
                        </div>
                        <div class="review-option-item">
                            <span class="review-label">上报点数总数:</span>
                            <span class="review-value">{{ basicInfo.totalReportCount }}</span>
                        </div>
                    </div>
                </div>

                <div class="review-bottom-row">
                    <div class="comment-section">
                        <span class="review-label">审核备注:</span>
                        <a-textarea v-model:value="reviewData.comment" :disabled="isViewMode" placeholder="请输入审核备注信息"
                            :rows="1" :maxlength="200" show-count />
                    </div>
                    <div class="action-buttons">
                        <a-button @click="goBack">返回</a-button>
                        <a-button v-if="!isViewMode" type="primary" @click="submitReview"
                            style="margin-left: 16px;">完成审核</a-button>
                    </div>
                </div>
            </div>
        </div>
        <death-detail-dialog v-model="deathDetailVisible" :record="currentDeathRecord" :is-view-mode="isViewMode"
            @confirm="handleDeathDetailConfirm" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { LeftOutlined } from '@ant-design/icons-vue';
import DeathDetailDialog from './DeathDetailDialog.vue';
import PlotGPS from '../plotGPS/PlotGPS.vue';
import { getAuditDetail } from '../api';

const deathDetailVisible = ref(false);
const currentDeathRecord = ref(null);
const loading = ref(false);
const dataLoaded = ref(false);
const aiPersionDiffRate = ref(0);

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

// 基础信息
const basicInfo = reactive({
    district: '',
    farmName: '',
    address: '',
    reportUser: '',
    reportTime: '',
    totalReportCount: '',
    aiTotalCount: ''
});

// 养殖区域数据
const farmAreas = ref([]);

// 当前选中的养殖区域
const currentArea = computed(() => {
    return farmAreas.value[currentAreaIndex.value] || {
        name: '',
        coordinate: [],
        fences: [],
        fatteningData: { reportCount: 0, aiCount: 0, reviewerCount: 0, lastReportCount: 0 },
        pigletsData: { reportCount: 0, aiCount: 0, reviewerCount: 0, lastReportCount: 0 },
        sowsData: { reportCount: 0, aiCount: 0, reviewerCount: 0, lastReportCount: 0 }
    };
});

// 审核数据
const reviewData = reactive({
    result: props.isViewMode ? 1 : null,  // 1通过, 0不通过
    comment: '',
    expectedInventory: 0
});

// 获取当前区域的围栏数据
const fenceData = computed(() => {
    if (!currentArea.value || !currentArea.value.coordinate) {
        return { path: [] };
    }
    
    try {
        let pathData;
        if (typeof currentArea.value.coordinate === 'string') {
            pathData = JSON.parse(currentArea.value.coordinate);
            return { path: pathData };
        } else {
            return { path: currentArea.value.coordinate || [] };
        }
    } catch (e) {
        console.error('解析围栏坐标失败:', e);
        return { path: [] };
    }
});

// 获取当前区域的GPS轨迹数据
const getTrackingData = (breedCode) => {
    if (!currentArea.value || !currentArea.value.fences) {
        return [];
    }

    // 在当前区域的fences中找到对应类型的栏舍数据
    const fence = currentArea.value.fences.find(f => f.breedCode === breedCode);
    
    if (fence && fence.gpss && fence.gpss.length > 0) {
        return fence.gpss.map(gps => ({
            lng: parseFloat(gps.longitude),
            lat: parseFloat(gps.latitude),
            timestamp: `${gps.timestamp}s`
        }));
    }
    
    return [];
};

// Computed property for current tracking data based on active tab
const trackingData = computed(() => {
    const breedMap = {
        'fattening': 'PORKER',
        'piglets': 'PIGLET',
        'sows': 'BROOD_SOW'
    };
    
    return getTrackingData(breedMap[activeSubTab.value]);
});

// Helper to check if a fence type exists in the current area
const hasFenceType = (breedCode) => {
    if (!currentArea.value || !currentArea.value.fences) {
        return false;
    }
    
    // Ensure fences is an array
    const fences = Array.isArray(currentArea.value.fences) ? 
        currentArea.value.fences : [];
    
    console.log(`Checking for ${breedCode} in fences:`, fences);
    return fences.some(f => f.breedCode === breedCode);
};

// Watch for changes in currentAreaIndex to update active subtab
watch(currentAreaIndex, () => {
    setDefaultActiveSubTab();
});

// 设置默认选中的子标签
const setDefaultActiveSubTab = () => {
    if (currentArea.value && Array.isArray(currentArea.value.fences)) {
        console.log('Setting default active subtab based on:', currentArea.value.fences);
        
        if (hasFenceType('PORKER')) {
            activeSubTab.value = 'fattening';
        } else if (hasFenceType('PIGLET')) {
            activeSubTab.value = 'piglets';
        } else if (hasFenceType('BROOD_SOW')) {
            activeSubTab.value = 'sows';
        } else {
            console.log('No valid breed types found, defaulting to first tab');
            // Default to first tab if no valid breed types found
            activeSubTab.value = 'fattening';
        }
        
        console.log('Selected active subtab:', activeSubTab.value);
    }
};

const outboundColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', align: 'center' },
    { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'fatteningPigs', key: 'fatteningPigs', align: 'center' },
    { title: '仔猪数量', dataIndex: 'piglets', key: 'piglets', align: 'center' },
    { title: '母猪数量', dataIndex: 'sows', key: 'sows', align: 'center' }
];

const inboundColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', align: 'center' },
    { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'fatteningPigs', key: 'fatteningPigs', align: 'center' },
    { title: '仔猪数量', dataIndex: 'piglets', key: 'piglets', align: 'center' },
    { title: '母猪数量', dataIndex: 'sows', key: 'sows', align: 'center' }
];

const deathColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', align: 'center' },
    { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'fatteningPigs', key: 'fatteningPigs', align: 'center' },
    { title: '仔猪数量', dataIndex: 'piglets', key: 'piglets', align: 'center' },
    { title: '母猪数量', dataIndex: 'sows', key: 'sows', align: 'center' },
    { title: '操作', key: 'action', align: 'center' }
];

const outboundRecords = ref([
    {
        key: '1',
        time: '2025-04-15',
        reportTime: '2025-04-15 14:30:00',
        fatteningPigs: 52,
        piglets: 1,
        sows: 1
    }
]);

const inboundRecords = ref([
    {
        key: '1',
        time: '2025-04-14',
        reportTime: '2025-04-14 10:15:00',
        fatteningPigs: 1,
        piglets: 1,
        sows: 1
    }
]);

const deathRecords = ref([
    {
        key: '1',
        time: '2025-04-13',
        reportTime: '2025-04-13 09:20:00',
        fatteningPigs: 2,
        piglets: 0,
        sows: 0
    },
    {
        key: '2',
        time: '2025-04-12',
        reportTime: '2025-04-12 16:45:00',
        fatteningPigs: 2,
        piglets: 0,
        sows: 2
    },
    {
        key: '3',
        time: '2025-04-11',
        reportTime: '2025-04-11 11:30:00',
        fatteningPigs: 2,
        piglets: 0,
        sows: 0
    }
]);

// 计算审核员点数总和
const calculateTotalReviewerCount = () => {
    let total = 0;
    if (farmAreas.value && Array.isArray(farmAreas.value)) {
        farmAreas.value.forEach(area => {
            total += (area.fatteningData.reviewerCount || 0);
            total += (area.pigletsData.reviewerCount || 0);
            total += (area.sowsData.reviewerCount || 0);
        });
    }
    return total;
};

const viewDeathDetail = (record) => {
    currentDeathRecord.value = record;
    deathDetailVisible.value = true;
};

const handleDeathDetailConfirm = (reviewData) => {
    console.log('Review data for death record:', reviewData);
    message.success('死亡登记审核已保存');
};

const goToDetailedComparison = (tabType: string) => {
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
    router.go(-1);
};

// 提交审核
const submitReview = () => {
    if (reviewData.result === null) {
        message.error('请选择审核意见');
        return;
    }

    // 检查是否所有区域都已填写审核员点数
    let hasEmptyCount = false;
    farmAreas.value.forEach(area => {
        if (
            (hasFenceType('PORKER') && area.fatteningData.reviewerCount === 0) ||
            (hasFenceType('PIGLET') && area.pigletsData.reviewerCount === 0) ||
            (hasFenceType('BROOD_SOW') && area.sowsData.reviewerCount === 0)
        ) {
            hasEmptyCount = true;
        }
    });

    if (hasEmptyCount) {
        message.warning('请确保所有区域的审核员点数已填写');
        return;
    }

    // 提交审核数据
    message.success('审核完成');
    router.push('/AUDITD');
};

// 在组件挂载时加载数据
const loadData = async () => {
    // 从路由参数中直接获取 ID
    const auditId = route.params.id;
    
    if (auditId) {
        loading.value = true;
        dataLoaded.value = false;
        try {
            console.log('正在获取审核详情, ID:', auditId);
            // 调用API获取审核任务的详细数据
            const res = await getAuditDetail(auditId.toString());
            console.log('审核详情数据:', res);
            
            if (res) {
                // 填充基础信息
                basicInfo.district = res.farmAddress || '';
                basicInfo.farmName = res.farmName || '';
                basicInfo.address = res.farmAddress || '';
                basicInfo.reportUser = res.applyUserName || '';
                basicInfo.reportTime = res.applyTime || '';
                basicInfo.totalReportCount = res.persionalCheckCount?.toString() || '0';
                basicInfo.aiTotalCount = res.aiCheckCount?.toString() || '0';
                
                // 保存偏差率到变量，用于条件显示偏差警告
                aiPersionDiffRate.value = res.aiPersionDiffRate || 0;
                reviewData.expectedInventory = res.leaveCount || 0;
                
                // 处理养殖区域数据
                if (res.auditFences && res.auditFences.length > 0) {
                    farmAreas.value = res.auditFences.map(fence => {
                        console.log('Fence data:', fence.fenceId, 'coordinate:', fence.coordinate);
                        
                        // 确保坐标数据有效
                        let validCoordinate = fence.coordinate;
                        if (!validCoordinate || (typeof validCoordinate === 'string' && validCoordinate.trim() === '')) {
                            validCoordinate = '[]';
                        }
                        
                        // 创建区域对象
                        const areaData = {
                            name: fence.fenceName || '未命名区域',
                            id: fence.fenceId,
                            coordinate: validCoordinate,
                            fences: fence.fences || [],
                            fatteningData: { reportCount: 0, aiCount: 0, reviewerCount: 0, lastReportCount: 0 },
                            pigletsData: { reportCount: 0, aiCount: 0, reviewerCount: 0, lastReportCount: 0 },
                            sowsData: { reportCount: 0, aiCount: 0, reviewerCount: 0, lastReportCount: 0 }
                        };
                        
                        // Log the available breeds in each fence for debugging
                        if (fence.fences && fence.fences.length > 0) {
                            fence.fences.forEach(subFence => {
                                console.log(`Area ${fence.fenceName} has breed: ${subFence.breedCode}`);
                            });
                        }
                        
                        // 处理各类型猪的数据
                        if (fence.fences && fence.fences.length > 0) {
                            fence.fences.forEach(subFence => {
                                if (subFence.breedCode === 'PORKER') {
                                    areaData.fatteningData = {
                                        reportCount: subFence.persionalCheckCount || 0,
                                        aiCount: subFence.aiCheckCount || 0,
                                        reviewerCount: props.isViewMode ? 
                                            (subFence.auditPersionalCheckCount || 0) : 
                                            (subFence.auditPersionalCheckCount || 0),
                                        lastReportCount: subFence.lastPersionalCheckCount || 0
                                    };
                                } else if (subFence.breedCode === 'PIGLET') {
                                    areaData.pigletsData = {
                                        reportCount: subFence.persionalCheckCount || 0,
                                        aiCount: subFence.aiCheckCount || 0,
                                        reviewerCount: props.isViewMode ? 
                                            (subFence.auditPersionalCheckCount || 0) : 
                                            (subFence.auditPersionalCheckCount || 0),
                                        lastReportCount: subFence.lastPersionalCheckCount || 0
                                    };
                                } else if (subFence.breedCode === 'BROOD_SOW') {
                                    areaData.sowsData = {
                                        reportCount: subFence.persionalCheckCount || 0,
                                        aiCount: subFence.aiCheckCount || 0,
                                        reviewerCount: props.isViewMode ? 
                                            (subFence.auditPersionalCheckCount || 0) : 
                                            (subFence.auditPersionalCheckCount || 0),
                                        lastReportCount: subFence.lastPersionalCheckCount || 0
                                    };
                                }
                            });
                        }
                        
                        return areaData;
                    });
                    
                    // 默认选择第一个区域
                    currentAreaIndex.value = 0;
                    
                    // 根据数据设置默认选中的子标签
                    setDefaultActiveSubTab();
                }
                
                // 设置数据已加载标志
                dataLoaded.value = true;
            }
        } catch (error) {
            console.error('获取审核详情失败:', error);
            message.error('获取审核详情失败');
        } finally {
            loading.value = false;
        }
    } else {
        console.error('未找到审核ID');
        message.error('未找到审核ID');
    }
};

onMounted(() => {
    loadData();
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
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

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
        margin-bottom: 24px;
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
        width: 100%;
        height: 300px;
        background-color: #000;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
    }

    .placeholder-text {
        font-size: 16px;
        opacity: 0.7;
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
        padding: 16px;
        background-color: #f8f8f8;
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