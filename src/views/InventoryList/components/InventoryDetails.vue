<template>
    <div class="inventory-details">
        <!-- 面包屑导航 -->
        <div class="detail-card">
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
                        <div class="info-section">
                            <div class="section-header">
                                <div class="title">养殖场基础信息</div>
                            </div>
                            <div class="basic-info">
                                <div class="info-row">
                                    <div class="info-item">
                                        <span class="label">行政区划:</span>
                                        <span class="value">{{ farmInfo.district }}</span>
                                    </div>
                                </div>
                                <div class="info-row">
                                    <div class="info-item">
                                        <span class="label">养殖场名称:</span>
                                        <span class="value">{{ farmInfo.farmName }}</span>
                                    </div>
                                </div>
                                <div class="info-row">
                                    <div class="info-item">
                                        <span class="label">养殖场地址:</span>
                                        <span class="value">{{ farmInfo.address }}</span>
                                    </div>
                                </div>
                                <div class="info-row">
                                    <div class="info-item">
                                        <span class="label">养殖场主要联系人:</span>
                                        <span class="value">{{ farmInfo.contactPerson }} {{ farmInfo.contactPhone
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 异常预警 -->
                        <div class="info-section" style="margin-top: 20px;">
                            <div class="section-header">
                                <div class="title">异常预警</div>
                                <div class="more-link">
                                    <a @click="viewMoreWarnings">查看更多 <right-outlined /></a>
                                </div>
                            </div>
                            <div class="warning-table">
                                <a-table :columns="warningColumns" :data-source="warningData" :pagination="false"
                                    size="small" :bordered="true">
                                </a-table>
                            </div>
                        </div>
                    </a-col>

                    <!-- 右侧：养殖场存栏情况 -->
                    <a-col :span="7">
                        <div class="info-section">
                            <div class="section-header">
                                <div class="title">养殖场存栏情况</div>
                                <div class="sub-title">存栏总数：220</div>
                            </div>
                            <div class="chart-container">
                                <div id="inventory-pie-chart" class="chart"></div>
                            </div>
                        </div>
                    </a-col>

                    <!-- 最右侧：上报情况 -->
                    <a-col :span="7">
                        <div class="info-section">
                            <div class="section-header">
                                <div class="title">存栏上报情况</div>
                                <div class="date-selector">
                                    <a-range-picker v-model:value="dateRange" :disabledDate="disableFutureDates" />
                                </div>
                            </div>
                            <div class="chart-container">
                                <div id="report-bar-chart" class="chart"></div>
                            </div>
                        </div>
                    </a-col>
                </a-row>
            </div>

            <!-- 养殖区存栏量变化趋势图 -->
            <div class="detail-card">
                <div class="card-header">
                    <div class="title">养殖区存栏量变化趋势</div>
                    <div class="date-selector">
                        <a-range-picker v-model:value="trendDateRange" :disabledDate="disableFutureDates" />
                    </div>
                </div>
                <div class="chart-container">
                    <div id="monthly-line-chart" class="chart" style="height: 300px"></div>
                </div>
            </div>

            <!-- 养殖场存栏量月度变化趋势(柱状图+折线图混合) -->
            <div class="detail-card">
                <div class="card-header">
                    <div class="title">养殖场存栏量月度变化趋势</div>
                    <div class="date-selector">
                        <a-range-picker v-model:value="mixedChartDateRange" picker="month" />
                    </div>
                </div>
                <div class="chart-container">
                    <div id="mixed-chart" class="chart" style="height: 300px"></div>
                </div>
            </div>
        </div>

        <!-- 当前存栏信息 -->
        <div class="current-inventory-section">
            <div class="detail-card">
                <div class="card-header">
                    <div class="title">当前存栏信息</div>
                </div>
                <a-tabs v-model:activeKey="activeTabKey">
                    <a-tab-pane key="1" tab="存栏记录">
                        <a-table :columns="stockColumns" :data-source="stockData" :pagination="pagination" bordered>
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.key === 'action'">
                                    <a href="javascript:;" @click="handleViewDetail(record)">详情</a>
                                </template>
                                <template v-if="column.key === 'reviewResult'">
                                    <a-tag :color="record.reviewResult === '审核通过' ? 'success' : 'error'">
                                        {{ record.reviewResult }}
                                    </a-tag>
                                </template>
                            </template>
                        </a-table>
                    </a-tab-pane>
                    <a-tab-pane key="2" tab="出栏记录">
                        <a-table :columns="outboundColumns" :data-source="outboundData" :pagination="pagination"
                            bordered>
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.key === 'action'">
                                    <a href="javascript:;" @click="handleViewDetail(record)">详情</a>
                                </template>
                            </template>
                        </a-table>
                    </a-tab-pane>
                    <a-tab-pane key="3" tab="入栏记录">
                        <a-table :columns="inboundColumns" :data-source="inboundData" :pagination="pagination" bordered>
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.key === 'action'">
                                    <a href="javascript:;" @click="handleViewDetail(record)">详情</a>
                                </template>
                            </template>
                        </a-table>
                    </a-tab-pane>
                    <a-tab-pane key="4" tab="死亡记录">
                        <a-table :columns="deathColumns" :data-source="deathData" :pagination="pagination" bordered>
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.key === 'action'">
                                    <a href="javascript:;" @click="handleViewDetail(record)">详情</a>
                                </template>
                            </template>
                        </a-table>
                    </a-tab-pane>
                </a-tabs>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import * as echarts from 'echarts';
import { message } from 'ant-design-vue';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';

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
const disableFutureDates = (current) => {
    return current && current.isAfter(dayjs(), 'day');
};

// 活动标签页
const activeTabKey = ref('1');

// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 50,
    showTotal: (total) => `共 ${total} 条`,
    onChange: (page) => {
        pagination.current = page;
    }
});

// 异常预警表格列定义
const warningColumns = [
    { title: '任务号', dataIndex: 'taskId', key: 'taskId', align: 'center' },
    { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime', align: 'center' },
    { title: '上报总数', dataIndex: 'totalReported', key: 'totalReported', align: 'center' },
    { title: '人工审核数量', dataIndex: 'manualReviewCount', key: 'manualReviewCount', align: 'center' },
    { title: '偏差率', dataIndex: 'deviationRate', key: 'deviationRate', align: 'center' },
];

// 异常预警表格数据
const warningData = [
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
    },
    {
        key: '3',
        taskId: 'xxxxxxxxxxxx',
        reportTime: '',
        totalReported: '',
        manualReviewCount: '',
        deviationRate: '',
    }
];

// 查看更多异常预警
const viewMoreWarnings = () => {
    message.info('查看更多异常预警功能待实现');
};

// 模拟养殖场基础信息
const farmInfo = reactive({
    district: '四川省成都市武侯区',
    farmName: 'XXXXX养殖场',
    address: 'XXXXXXXXXXXXXXXXXXXXXXX',
    contactPerson: '张三',
    contactPhone: '15508280883'
});

// 存栏记录表格列定义
const stockColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '时间', dataIndex: 'time', key: 'time', align: 'center' },
    { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'fatteningPigs', key: 'fatteningPigs', align: 'center' },
    { title: '仔猪数量', dataIndex: 'piglets', key: 'piglets', align: 'center' },
    { title: '母猪数量', dataIndex: 'sows', key: 'sows', align: 'center' },
    { title: '审核结果', dataIndex: 'reviewResult', key: 'reviewResult', align: 'center' },
    { title: '操作', key: 'action', align: 'center' },
];

// 出栏记录表格列
const outboundColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '出栏日期', dataIndex: 'date', key: 'date', align: 'center' },
    { title: '出栏类型', dataIndex: 'type', key: 'type', align: 'center' },
    { title: '出栏数量', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    { title: '出栏原因', dataIndex: 'reason', key: 'reason', align: 'center' },
    { title: '操作', key: 'action', align: 'center' },
];

// 入栏记录表格列
const inboundColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '入栏日期', dataIndex: 'date', key: 'date', align: 'center' },
    { title: '入栏类型', dataIndex: 'type', key: 'type', align: 'center' },
    { title: '入栏数量', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    { title: '入栏来源', dataIndex: 'source', key: 'source', align: 'center' },
    { title: '操作', key: 'action', align: 'center' },
];

// 死亡记录表格列
const deathColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '死亡日期', dataIndex: 'date', key: 'date', align: 'center' },
    { title: '死亡类型', dataIndex: 'type', key: 'type', align: 'center' },
    { title: '死亡数量', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    { title: '死亡原因', dataIndex: 'reason', key: 'reason', align: 'center' },
    { title: '操作', key: 'action', align: 'center' },
];

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

// 定义图表实例
let pieChart: echarts.ECharts | null = null;
let barChart: echarts.ECharts | null = null;
let lineChart: echarts.ECharts | null = null;
let mixedChart: echarts.ECharts | null = null;

// 查看详情
const handleViewDetail = (record) => {
    message.info(`查看记录详情: ${record.index}`);
};

// 初始化饼图
const initPieChart = () => {
    if (!pieChart) {
        pieChart = echarts.init(document.getElementById('inventory-pie-chart'));
    }

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: 0,
            data: ['仔猪', '育肥猪', '能繁母猪']
        },
        series: [
            {
                name: '存栏情况',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside', // 外部
                    formatter: '{c}\n{d}%',
                    fontSize: 14,
                },
                // 标签引导线配置
                labelLine: {
                    show: true,
                    length: 15,
                    length2: 20,
                    smooth: false
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: 'bold'
                    }
                },
                data: [
                    { value: 20, name: '仔猪', itemStyle: { color: '#36CFC9' } },
                    { value: 40, name: '育肥猪', itemStyle: { color: '#73D13D' } },
                    { value: 100, name: '能繁母猪', itemStyle: { color: '#40A9FF' } }
                ]
            }
        ]
    };

    pieChart.setOption(option);
};

// 初始化柱状图
const initBarChart = () => {
    if (!barChart) {
        barChart = echarts.init(document.getElementById('report-bar-chart'));
    }

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['提醒上报', '延期未上报', '实际上报']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '次数',
                type: 'bar',
                barWidth: '60%',
                data: [
                    { value: 20, itemStyle: { color: '#40A9FF' } },
                    { value: 15, itemStyle: { color: '#73D13D' } },
                    { value: 25, itemStyle: { color: '#36CFC9' } }
                ],
                label: {
                    show: true,
                    position: 'top'
                }
            }
        ]
    };

    barChart.setOption(option);
};

// 初始化折线图
const initLineChart = () => {
    if (!lineChart) {
        lineChart = echarts.init(document.getElementById('monthly-line-chart'));
    }

    const option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['养殖场1', '养殖场2', '养殖场3']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '养殖场1',
                type: 'line',
                data: [10, 20, 30, 40, 50, 60, 55, 50, 40, 42, 45, 40],
                smooth: true,
                lineStyle: {
                    width: 2
                }
            },
            {
                name: '养殖场2',
                type: 'line',
                data: [15, 25, 35, 45, 35, 90, 100, 105, 100, 105, 100, 95],
                smooth: true,
                lineStyle: {
                    width: 2
                }
            },
            {
                name: '养殖场3',
                type: 'line',
                data: [5, 15, 25, 35, 30, 80, 70, 75, 75, 70, 60, 70],
                smooth: true,
                lineStyle: {
                    width: 2
                }
            }
        ]
    };

    lineChart.setOption(option);
};

// 初始化混合图表（柱状图+折线图）
const initMixedChart = () => {
    if (!mixedChart) {
        mixedChart = echarts.init(document.getElementById('mixed-chart'));
    }

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                crossStyle: {
                    color: '#999'
                }
            }
        },
        legend: {
            data: ['育肥猪', '仔猪', '母猪', '存栏总量']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: ['上报起始月', '二月', '三月', '四月', '五月', '至今月/止期月'],
                axisPointer: {
                    type: 'shadow'
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: '数量',
                min: 0,
                max: 120,
                interval: 20
            },
            {
                type: 'value',
                name: '总量',
                min: 0,
                max: 700,
                interval: 100
            }
        ],
        series: [
            {
                name: '育肥猪',
                type: 'bar',
                barWidth: 20,
                data: [10, 20, 30, 40, 50, 60]
            },
            {
                name: '仔猪',
                type: 'bar',
                barWidth: 20,
                data: [20, 25, 30, 45, 30, 100]
            },
            {
                name: '母猪',
                type: 'bar',
                barWidth: 20,
                data: [25, 30, 61, 63, 63, 115]
            },
            {
                name: '存栏总量',
                type: 'line',
                yAxisIndex: 1,
                data: [500, 200, 260, 330, 650, 333],
                label: {
                    show: true,
                    position: 'top'
                }
            }
        ]
    };

    mixedChart.setOption(option);
};

// 窗口大小变化时重绘图表
const handleResize = () => {
    pieChart?.resize();
    barChart?.resize();
    lineChart?.resize();
    mixedChart?.resize();
};

// 组件挂载时初始化图表
onMounted(() => {
    // 初始化各图表
    setTimeout(() => {
        initPieChart();
        initBarChart();
        initLineChart();
        initMixedChart();
    }, 0);

    // 添加窗口调整事件监听
    window.addEventListener('resize', handleResize);
});

// 组件卸载时销毁图表实例
onUnmounted(() => {
    pieChart?.dispose();
    barChart?.dispose();
    lineChart?.dispose();
    mixedChart?.dispose();
    window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.inventory-details {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: #f0f2f5;
    height: 100%;

    .breadcrumb {
        padding: 8px 0;
    }

    .content-section,
    .current-inventory-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .detail-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        padding: 16px;

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 16px;
            border-bottom: 1px solid #f0f0f0;
            margin-bottom: 16px;

            .title {
                font-size: 16px;
                font-weight: 500;
                color: #333;
            }

            .sub-title {
                color: #666;
                font-size: 14px;
            }
        }

        .info-section {
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
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

                .more-link {
                    a {
                        color: #5276E5;
                        font-size: 14px;
                    }
                }
            }

            .warning-table {
                :deep(.ant-table-small) {
                    font-size: 12px;
                }

                :deep(.ant-table-thead > tr > th) {
                    background-color: #f6f7fa;
                    font-weight: normal;
                    color: #666;
                }
            }
        }

        .basic-info {
            .info-row {
                display: flex;
                margin-bottom: 16px;

                .info-item {
                    flex: 1;
                    display: flex;

                    .label {
                        color: #666;
                        width: 120px;
                        text-align: right;
                        padding-right: 16px;
                    }

                    .value {
                        flex: 1;
                        color: #333;
                    }
                }
            }
        }

        .warning-info {
            .warning-item {
                margin-bottom: 16px;
            }
        }

        .chart-container {
            width: 100%;
            height: 300px;

            .chart {
                width: 100%;
                height: 100%;
            }
        }
    }

    .charts-row {
        .detail-card {
            height: 100%;
        }
    }
}
</style>