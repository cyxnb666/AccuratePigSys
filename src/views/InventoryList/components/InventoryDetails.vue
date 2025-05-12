<template>
    <div class="inventory-details">
        <!-- 面包屑导航 -->
        <div class="bread-detail-card">
            <div class="breadcrumb">
                <a-breadcrumb>
                    <a-breadcrumb-item>
                        <a @click="goBack">
                            <left-outlined /> 返回
                        </a>
                    </a-breadcrumb-item>
                    <a-breadcrumb-item>存栏详情</a-breadcrumb-item>
                </a-breadcrumb>
            </div>
        </div>

        <div class="content-section">
            <div class="detail-card">
                <a-row :gutter="24">
                    <a-col :span="10">
                        <!-- 养殖场基础信息 -->
                        <div class="info-card">
                            <farm-basic-info :farm-info="farmInfo" />

                            <!-- 异常预警 -->
                            <div style="margin-top: 20px;">
                                <abnormal-warning :warning-data="warningData" @view-more="viewMoreWarnings" />
                            </div>
                        </div>
                    </a-col>

                    <!-- 右侧：养殖场存栏情况 -->
                    <a-col :span="7">
                        <farm-inventory-pie :leave-data="leaveData" />
                    </a-col>

                    <!-- 最右侧：上报情况 -->
                    <a-col :span="7" style="padding-left: 24px;">
                        <report-status-bar :farm-warn-data="farmWarnData" :farm-id="farmId"
                            v-model:date-range="dateRange" @reload-report-data="handleReportDataReload" />
                    </a-col>
                </a-row>
            </div>

            <!-- 养殖区存栏量变化趋势图 -->
            <inventory-trend-line :trend-data="trendData" v-model:date-range="trendDateRange" />

            <!-- 养殖场存栏量月度变化趋势(柱状图+折线图混合) -->
            <monthly-change-mixed :mixed-data="mixedData" v-model:date-range="mixedChartDateRange" />
        </div>

        <!-- 当前存栏信息 -->
        <div class="current-inventory-section">
            <current-inventory-tabs :stock-data="stockData" :outbound-data="outboundData" :inbound-data="inboundData"
                :death-data="deathData" :pagination="pagination" @view-detail="handleViewDetail" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { LeftOutlined } from '@ant-design/icons-vue';
import { getLivestockFarm, queryErrorFarmWarns, getLeave, getFarmWarnStaticis } from '../api';

// 引入抽取的组件
import FarmBasicInfo from '@/components/FarmBasicInfo.vue';
import AbnormalWarning from '@/components/AbnormalWarning.vue';
import FarmInventoryPie from '@/components/FarmInventoryPie.vue';
import ReportStatusBar from '@/components/ReportStatusBar.vue';
import InventoryTrendLine from '@/components/InventoryTrendLine.vue';
import MonthlyChangeMixed from '@/components/MonthlyChangeMixed.vue';
import CurrentInventoryTabs from '@/components/CurrentInventoryTabs.vue';

const router = useRouter();
const route = useRoute();

// 获取路由参数
const farmId = route.params.id;

// 返回上一页
const goBack = () => {
    router.go(-1);
};

// 初始化日期范围
const dateRange = ref<any>([]);
const trendDateRange = ref<any>([]);
const mixedChartDateRange = ref<any>([]);

// 分页配置
const pagination = reactive({
    stock: { current: 1, pageSize: 10 },
    outbound: { current: 1, pageSize: 10 },
    inbound: { current: 1, pageSize: 10 },
    death: { current: 1, pageSize: 10 },
    total: 50,
    showTotal: (total) => `共 ${total} 条`
});

// 异常预警表格数据
const warningData = ref([]);
const fetchWarningData = async () => {
    try {
        const params = {
            "condition": {
                "areacode": "",
                "farmName": "",
                "startDate": "",
                "endDate": ""
            },
            "pageNo": 1,
            "pageSize": 3
        };

        const res = await queryErrorFarmWarns(params);
        if (res && res.records) {
            warningData.value = res.records;
        } else {
            warningData.value = [];
        }
    } catch (error) {
        console.error('获取异常预警数据失败:', error);
        warningData.value = [];
    }
};

// 查看更多异常预警
const viewMoreWarnings = () => {
    message.info('查看更多异常预警功能待实现');
};

// 养殖场基础信息
const farmInfo = ref({});
const fetchFarmData = async () => {
    try {
        const params = {
            condition: {
                primaryKey: farmId
            }
        };
        const res = await getLivestockFarm(params);
        if (res) {
            farmInfo.value = res;
        }
    } catch (error) {
        console.error('获取养殖场数据失败:', error);
    }
};

// 存栏饼图数据
const leaveData = ref({
    pigletCount: 0,
    porkerCount: 0,
    sowCount: 0,
    totalCount: 0
});
const fetchInventoryData = async () => {
    try {
        const res = await getLeave(farmId);
        if (res) {
            leaveData.value = res;
        }
    } catch (error) {
        console.error('获取存栏情况数据失败:', error);
    }
};

// 上报情况柱状图数据
const farmWarnData = ref({
    nregistCount: 0,
    oregistCount: 0,
    sregistCount: 0
});
const fetchReportStatusData = async (startDate = "", endDate = "") => {
    try {
        const params = {
            condition: {
                endDate: endDate,
                farmId: farmId,
                startDate: startDate
            }
        };

        const res = await getFarmWarnStaticis(params);
        if (res) {
            farmWarnData.value = res;
        }
    } catch (error) {
        console.error('获取存栏上报情况数据失败:', error);
    }
};
const handleReportDataReload = (dateInfo) => {
    fetchReportStatusData(dateInfo.startDate, dateInfo.endDate);
};

// 趋势折线图数据
const trendData = reactive({
    xAxis: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    series: [
        { name: '养殖场1', data: [10, 20, 30, 40, 50, 60, 55, 50, 40, 42, 45, 40] },
        { name: '养殖场2', data: [15, 25, 35, 45, 35, 90, 100, 105, 100, 105, 100, 95] },
        { name: '养殖场3', data: [5, 15, 25, 35, 30, 80, 70, 75, 75, 70, 60, 70] }
    ]
});

// 月度变化混合图表数据
const mixedData = reactive({
    xAxis: ['上报起始月', '二月', '三月', '四月', '五月', '至今月/止期月'],
    series: [
        { name: '育肥猪', type: 'bar', data: [10, 20, 30, 40, 50, 60] },
        { name: '仔猪', type: 'bar', data: [20, 25, 30, 45, 30, 100] },
        { name: '母猪', type: 'bar', data: [25, 30, 61, 63, 63, 115] },
        { name: '存栏总量', type: 'line', yAxisIndex: 1, data: [500, 200, 260, 330, 650, 333] }
    ]
});

// 生成模拟数据
const generateStockData = () => {
    return Array.from({ length: 10 }, (_, i) => ({
        key: i + 1,
        index: i + 1,
        time: `2025-04-${10 + i}`,
        reportTime: `2025-04-${10 + i} 10:30:00`,
        fatteningPigs: 52,
        piglets: 60,
        sows: 20,
        reviewResult: i % 3 === 0 ? '审核不通过' : '审核通过',
    }));
};

const generateOutboundData = () => {
    return Array.from({ length: 10 }, (_, i) => ({
        key: i + 1,
        index: i + 1,
        date: `2025-04-${10 + i}`,
        type: i % 2 === 0 ? '育肥猪' : '仔猪',
        quantity: 10 + i,
        reason: '出售',
    }));
};

const generateInboundData = () => {
    return Array.from({ length: 10 }, (_, i) => ({
        key: i + 1,
        index: i + 1,
        date: `2025-04-${10 + i}`,
        type: i % 3 === 0 ? '育肥猪' : i % 3 === 1 ? '仔猪' : '母猪',
        quantity: 8 + i,
        source: '购入',
    }));
};

const generateDeathData = () => {
    return Array.from({ length: 10 }, (_, i) => ({
        key: i + 1,
        index: i + 1,
        date: `2025-04-${10 + i}`,
        type: i % 3 === 0 ? '育肥猪' : i % 3 === 1 ? '仔猪' : '母猪',
        quantity: 2 + i % 5,
        reason: i % 2 === 0 ? '疾病' : '意外',
    }));
};

// 初始化表格数据
const stockData = ref(generateStockData());
const outboundData = ref(generateOutboundData());
const inboundData = ref(generateInboundData());
const deathData = ref(generateDeathData());

// 查看详情
const handleViewDetail = (record) => {
    message.info(`查看记录详情: ${record.index}`);
};

// 模拟API加载数据
const loadData = async () => {
    await fetchFarmData();
    await fetchWarningData();
    await fetchInventoryData();
    await fetchReportStatusData();
    // 实际项目中，这里会调用其他API获取数据
    // 目前使用模拟数据，未来可以替换为实际API调用
};

onMounted(() => {
    loadData();
});
</script>

<style lang="scss" scoped>
.inventory-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: #f0f2f5;
    height: 100%;

    .info-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
        padding: 16px;
    }

    .breadcrumb {
        // padding: 8px 0;
    }

    .content-section,
    .current-inventory-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .bread-detail-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        padding: 6px;
    }

    .detail-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        padding: 12px;
    }

    .charts-row {
        .detail-card {
            height: 100%;
        }
    }
}
</style>