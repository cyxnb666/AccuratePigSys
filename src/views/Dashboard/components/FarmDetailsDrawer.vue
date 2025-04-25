<template>
    <div class="farm-details-drawer">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <a-spin size="large" />
        </div>
        
        <template v-else>
            <!-- 第一行：养殖场基础信息和异常预警 - 用一个div包裹并添加阴影效果 -->
            <div class="info-warning-card">
                <!-- 养殖场基础信息 -->
                <farm-basic-info :farm-info="farmInfo" />

                <!-- 异常预警 -->
                <div style="margin-top: 20px;">
                    <abnormal-warning :warning-data="warningData" @view-more="viewMoreWarnings" />
                </div>
            </div>

            <!-- 第二行：养殖场存栏情况和上报情况 -->
            <div class="detail-section">
                <a-row :gutter="16">
                    <a-col :span="12">
                        <farm-inventory-pie :inventory-data="inventoryData" />
                    </a-col>
                    <a-col :span="12">
                        <report-status-bar class="report-status-adjusted" :report-data="reportData" v-model:date-range="dateRange" />
                    </a-col>
                </a-row>
            </div>

            <!-- 养殖区存栏量变化趋势图 -->
            <div class="detail-section">
                <inventory-trend-line :trend-data="trendData" v-model:date-range="trendDateRange" />
            </div>

            <!-- 养殖场存栏量月度变化趋势 -->
            <div class="detail-section">
                <monthly-change-mixed :mixed-data="mixedData" v-model:date-range="mixedChartDateRange" />
            </div>

            <!-- 当前存栏信息 -->
            <div class="detail-section">
                <current-inventory-tabs :stock-data="stockData" :outbound-data="outboundData" :inbound-data="inboundData"
                    :death-data="deathData" :pagination="pagination" @view-detail="handleViewDetail" />
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';

// 引入组件
import FarmBasicInfo from '@/components/FarmBasicInfo.vue';
import AbnormalWarning from '@/components/AbnormalWarning.vue';
import FarmInventoryPie from '@/components/FarmInventoryPie.vue';
import ReportStatusBar from '@/components/ReportStatusBar.vue';
import InventoryTrendLine from '@/components/InventoryTrendLine.vue';
import MonthlyChangeMixed from '@/components/MonthlyChangeMixed.vue';
import CurrentInventoryTabs from '@/components/CurrentInventoryTabs.vue';

// 接收养殖场数据属性
const props = defineProps({
    farmData: {
        type: Object,
        default: () => null
    }
});

// 加载状态
const loading = ref(false);

// 初始化日期范围
const dateRange = ref<any>([]);
const trendDateRange = ref<any>([]);
const mixedChartDateRange = ref<any>([]);

// 分页配置 - 抽屉中显示少一些
const pagination = reactive({
    current: 1,
    pageSize: 5,
    total: 50,
    showTotal: (total) => `共 ${total} 条`,
    onChange: (page) => {
        pagination.current = page;
    }
});

// 模拟养殖场基础信息
const farmInfo = reactive({
    district: '四川省成都市武侯区',
    farmName: 'XXXXX养殖场',
    address: 'XXXXXXXXXXXXXXXXXXXXXXX',
    contactPerson: '张三',
    contactPhone: '15508280883'
});

// 异常预警表格数据
const warningData = ref([
    {
        key: '1',
        taskId: 'vvvvvvvvv',
        reportTime: '2025-03-31 23:23:22',
        totalReported: 11,
        manualReviewCount: 15,
        deviationRate: '',
    },
    {
        key: '2',
        taskId: 'bbbbbbbbbb',
        reportTime: '2025-03-31 13:23:11',
        totalReported: 20,
        manualReviewCount: 28,
        deviationRate: '',
    }
]);

// 存栏饼图数据
const inventoryData = ref([
    { value: 20, name: '仔猪' },
    { value: 40, name: '育肥猪' },
    { value: 100, name: '能繁母猪' }
]);

// 上报情况柱状图数据
const reportData = ref([
    { name: '提醒上报', value: 20, color: '#40A9FF' },
    { name: '延期未上报', value: 15, color: '#73D13D' },
    { name: '实际上报', value: 25, color: '#36CFC9' }
]);

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

// 查看更多异常预警
const viewMoreWarnings = () => {
    message.info('查看更多异常预警功能待实现');
};

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

// 监听farmData变化更新组件数据
watch(() => props.farmData, async (newData) => {
    if (newData) {
        loading.value = true;
        
        try {
            // 更新基础信息
            farmInfo.district = newData.district || farmInfo.district;
            farmInfo.farmName = newData.name || farmInfo.farmName;
            farmInfo.address = newData.address || farmInfo.address;
            farmInfo.contactPerson = newData.contactPerson || farmInfo.contactPerson;
            farmInfo.contactPhone = newData.contactPhone || farmInfo.contactPhone;
            
            // 模拟加载其他数据的延迟
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // 这里可以根据需要获取更多数据
            // 例如：更新预警数据、存栏数据、历史记录等
            
            // 可以根据farmId生成不同的随机数据
            if (newData.id) {
                // 为不同养殖场生成稍微不同的数据
                const modifier = newData.id % 3 + 1;
                
                // 更新饼图数据
                inventoryData.value = [
                    { value: 20 * modifier, name: '仔猪' },
                    { value: 40 * modifier, name: '育肥猪' },
                    { value: 100 * (modifier / 2), name: '能繁母猪' }
                ];
                
                // 更新报表数据
                reportData.value = [
                    { name: '提醒上报', value: 20 * modifier, color: '#40A9FF' },
                    { name: '延期未上报', value: 15 * modifier, color: '#73D13D' },
                    { name: '实际上报', value: 25 * modifier, color: '#36CFC9' }
                ];
            }
        } catch (error) {
            console.error('加载养殖场数据失败:', error);
            message.error('加载养殖场数据失败');
        } finally {
            loading.value = false;
        }
    }
}, { immediate: true });

// 可以在组件外暴露一些方法或数据
defineExpose({
    refreshData: () => {
        // 刷新数据的方法
        message.info('刷新数据...');
    }
});
</script>

<style lang="scss" scoped>
.farm-details-drawer {
    padding: 0 8px;
    height: 100%;
    overflow-y: auto;
    
    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .info-warning-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
        padding: 16px;
        margin-bottom: 20px;
    }
    .detail-section {
        margin-bottom: 20px;

        &:last-child {
            margin-bottom: 0;
        }

        :deep(.chart-container) {
            height: 280px !important;
        }
    }
}
</style>

<style lang="scss" scoped>
.farm-details-drawer {
    padding: 0 8px;
    height: 100%;
    overflow-y: auto;

    .info-warning-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
        padding: 16px;
        margin-bottom: 20px;
    }
    .detail-section {
        margin-bottom: 20px;

        &:last-child {
            margin-bottom: 0;
        }

        :deep(.chart-container) {
            height: 280px !important;
        }
    }
}
</style>