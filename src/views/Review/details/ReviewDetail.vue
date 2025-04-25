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
            <div class="scrollable-content">

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
                                <span class="deviation-warning">
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
                                            <a-tab-pane key="fattening" tab="育肥区">
                                                <div class="count-row">
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
                                                        <span class="value">{{ currentArea.fatteningData.lastReportCount
                                                            }}</span>
                                                    </div>
                                                    <div class="count-item">
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
                                                                <!-- GPS轨迹图占位符 -->
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a-tab-pane>

                                            <a-tab-pane key="piglets" tab="仔猪区">
                                                <div class="count-row">
                                                    <div class="count-item">
                                                        <span class="label">上报数量：</span>
                                                        <span class="value">{{ currentArea.pigletsData.reportCount
                                                            }}</span>
                                                    </div>
                                                    <div class="count-item">
                                                        <span class="label">AI点数：</span>
                                                        <span class="value">{{ currentArea.pigletsData.aiCount }}</span>
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
                                                        <span class="value">{{ currentArea.pigletsData.lastReportCount
                                                        }}</span>
                                                    </div>
                                                    <div class="count-item">
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
                                                                <!-- GPS轨迹图占位符 -->
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a-tab-pane>

                                            <a-tab-pane key="sows" tab="母猪区">
                                                <div class="count-row">
                                                    <div class="count-item">
                                                        <span class="label">上报数量：</span>
                                                        <span class="value">{{ currentArea.sowsData.reportCount
                                                            }}</span>
                                                    </div>
                                                    <div class="count-item">
                                                        <span class="label">AI点数：</span>
                                                        <span class="value">{{ currentArea.sowsData.aiCount }}</span>
                                                    </div>
                                                    <div class="count-item">
                                                        <span class="label">审核员点数：</span>
                                                        <a-input-number v-if="!isViewMode"
                                                            v-model:value="currentArea.sowsData.reviewerCount" :min="0"
                                                            style="width: 120px" />
                                                        <span v-else class="value">{{ currentArea.sowsData.reviewerCount
                                                        }}</span>
                                                    </div>
                                                    <div class="count-item">
                                                        <span class="label">上次上报数量：</span>
                                                        <span class="value">{{ currentArea.sowsData.lastReportCount
                                                        }}</span>
                                                    </div>
                                                    <div class="count-item">
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
                                                                <!-- GPS轨迹图占位符 -->
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

            <!-- 底部操作栏 -->
            <div class="form-actions">
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
        <death-detail-dialog v-model="deathDetailVisible" :record="currentDeathRecord" :is-view-mode="props.isViewMode"
            @confirm="handleDeathDetailConfirm" />
    </div>
</template>


<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { LeftOutlined } from '@ant-design/icons-vue';
import DeathDetailDialog from './DeathDetailDialog.vue';

const deathDetailVisible = ref(false);
const currentDeathRecord = ref(null);

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
    district: '四川省成都市武侯区',
    farmName: 'XXXXX养殖场',
    address: 'XXXXXXXXXXXXXXXXXXXXXXX',
    reportUser: '张三',
    reportTime: '2025-04-15 14:30:00',
    totalReportCount: '6',
    aiTotalCount: '5'
});

// 计算是否显示偏差预警
const showDeviation = computed(() => {
    const reportCount = parseInt(basicInfo.totalReportCount) || 0;
    const aiCount = parseInt(basicInfo.aiTotalCount) || 0;

    if (reportCount === 0) return false;

    const deviation = Math.abs(reportCount - aiCount) / reportCount * 100;
    return deviation > 20;
});

// 模拟养殖区域数据
const farmAreas = reactive([
    {
        name: '养殖区域1',
        fatteningData: {
            reportCount: 6,
            aiCount: 5,
            reviewerCount: props.isViewMode ? 6 : 0,
            lastReportCount: 6
        },
        pigletsData: {
            reportCount: 4,
            aiCount: 3,
            reviewerCount: props.isViewMode ? 4 : 0,
            lastReportCount: 4
        },
        sowsData: {
            reportCount: 2,
            aiCount: 2,
            reviewerCount: props.isViewMode ? 2 : 0,
            lastReportCount: 2
        }
    },
    {
        name: '养殖区域2',
        fatteningData: {
            reportCount: 8,
            aiCount: 7,
            reviewerCount: props.isViewMode ? 7 : 0,
            lastReportCount: 7
        },
        pigletsData: {
            reportCount: 5,
            aiCount: 4,
            reviewerCount: props.isViewMode ? 5 : 0,
            lastReportCount: 4
        },
        sowsData: {
            reportCount: 3,
            aiCount: 3,
            reviewerCount: props.isViewMode ? 3 : 0,
            lastReportCount: 2
        }
    },
    {
        name: '养殖区域3',
        fatteningData: {
            reportCount: 4,
            aiCount: 3,
            reviewerCount: props.isViewMode ? 4 : 0,
            lastReportCount: 5
        },
        pigletsData: {
            reportCount: 3,
            aiCount: 2,
            reviewerCount: props.isViewMode ? 3 : 0,
            lastReportCount: 3
        },
        sowsData: {
            reportCount: 1,
            aiCount: 1,
            reviewerCount: props.isViewMode ? 1 : 0,
            lastReportCount: 1
        }
    }
]);

// 当前选中的养殖区域
const currentArea = computed(() => farmAreas[currentAreaIndex.value]);

// 审核数据
const reviewData = reactive({
    result: props.isViewMode ? 1 : null,  // 1通过, 0不通过
    comment: '',
    expectedInventory: 12
});

// 计算审核员点数总和
const calculateTotalReviewerCount = () => {
    let total = 0;
    farmAreas.forEach(area => {
        total += (area.fatteningData.reviewerCount || 0);
        total += (area.pigletsData.reviewerCount || 0);
        total += (area.sowsData.reviewerCount || 0);
    });
    return total;
};

// 计算应计存栏数（此处简单实现为审核员点数总和，实际业务逻辑可能更复杂）
const calculateTotalInventory = () => {
    // 示例：简单使用审核员总点数作为应计存栏数
    // 实际逻辑可能需要基于其他因素计算
    return calculateTotalReviewerCount();
};

// In the script setup section

// Column definitions for outbound records
const outboundColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', align: 'center' },
    { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'fatteningPigs', key: 'fatteningPigs', align: 'center' },
    { title: '仔猪数量', dataIndex: 'piglets', key: 'piglets', align: 'center' },
    { title: '母猪数量', dataIndex: 'sows', key: 'sows', align: 'center' }
];

// Column definitions for inbound records
const inboundColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', align: 'center' },
    { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'fatteningPigs', key: 'fatteningPigs', align: 'center' },
    { title: '仔猪数量', dataIndex: 'piglets', key: 'piglets', align: 'center' },
    { title: '母猪数量', dataIndex: 'sows', key: 'sows', align: 'center' }
];

// Column definitions for death records
const deathColumns = [
    { title: '时间', dataIndex: 'time', key: 'time', align: 'center' },
    { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'fatteningPigs', key: 'fatteningPigs', align: 'center' },
    { title: '仔猪数量', dataIndex: 'piglets', key: 'piglets', align: 'center' },
    { title: '母猪数量', dataIndex: 'sows', key: 'sows', align: 'center' },
    { title: '操作', key: 'action', align: 'center' }
];

// Sample data for outbound records
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

// Sample data for inbound records
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

// Sample data for death records
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
        path: `/review/super-detail/${props.recordId}`,
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
    farmAreas.forEach(area => {
        if (
            area.fatteningData.reviewerCount === 0 ||
            area.pigletsData.reviewerCount === 0 ||
            area.sowsData.reviewerCount === 0
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
    router.push('/review');
};

// 在组件挂载时加载数据
const loadData = async () => {
    if (props.recordId) {
        // 实际项目中，这里会调用API获取审核任务的详细数据
        console.log('加载审核任务数据: ', props.recordId);
    }
};

// 调用加载数据函数
loadData();
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
        flex-wrap: wrap;
        margin-bottom: 20px;
        gap: 20px;
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