<template>
    <div class="dashboard-stats-panel">
        <!-- Region selector -->
        <div class="region-selector">
            <a-tree-select
                v-model:value="selectedRegion"
                style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :tree-data="regionTreeData"
                placeholder="请选择地区"
                tree-default-expand-all
                :replaceFields="{title: 'title', value: 'value', children: 'children'}"
            >
            </a-tree-select>
        </div>

        <!-- Farm count -->
        <div class="stats-section">
            <div class="section-label">养殖场总数</div>
            <div class="stat-boxes">
                <div class="stat-box">
                    <div class="stat-value">56个</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">7620头</div>
                </div>
            </div>
        </div>

        <!-- Farm situation table -->
        <div class="stats-section">
            <div class="section-label">养殖场情况 (四川省)</div>
            <div class="table-container">
                <a-table :columns="situationColumns" :data-source="situationData" :pagination="false" size="small"
                    :bordered="true">
                </a-table>
            </div>
        </div>

        <!-- Inventory type pie chart -->
        <div class="stats-section">
            <div class="section-label">存栏品种</div>
            <div ref="pieChartRef" class="pie-chart"></div>
        </div>

        <!-- Abnormal warning -->
        <div class="stats-section">
            <div class="section-header-with-link">
                <div class="title">异常预警</div>
                <div class="view-more">
                    <a @click="viewMoreWarnings">查看更多 >></a>
                </div>
            </div>
            <div class="table-container">
                <a-table :columns="warningColumns" :data-source="warningData" :pagination="false" size="small"
                    :bordered="true">
                </a-table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { message } from 'ant-design-vue';

// Region selector
const regionTreeData = ref([
    {
        title: '四川省',
        value: 'sichuan',
        key: 'sichuan',
        children: [
            {
                title: '成都市',
                value: 'chengdu',
                key: 'chengdu',
                children: [
                    {
                        title: '武侯区',
                        value: 'wuhou',
                        key: 'wuhou',
                    },
                    {
                        title: '锦江区',
                        value: 'jinjiang',
                        key: 'jinjiang',
                    },
                    {
                        title: '青羊区',
                        value: 'qingyang',
                        key: 'qingyang',
                    }
                ]
            },
            {
                title: '绵阳市',
                value: 'mianyang',
                key: 'mianyang',
                children: [
                    {
                        title: '涪城区',
                        value: 'fucheng',
                        key: 'fucheng',
                    },
                    {
                        title: '安州区',
                        value: 'anzhou',
                        key: 'anzhou',
                    }
                ]
            },
            {
                title: '南充市',
                value: 'nanchong',
                key: 'nanchong',
            }
        ]
    }
]);

// 默认选中四川省
const selectedRegion = ref('sichuan');

// Farm situation table
const situationColumns = [
    { title: '行政区划', dataIndex: 'district', key: 'district', align: 'center', width: 80 },
    { title: '养殖场数量', dataIndex: 'farmCount', key: 'farmCount', align: 'center', width: 80 },
    { title: '存栏数量', dataIndex: 'inventoryCount', key: 'inventoryCount', align: 'center', width: 80 }
];

const situationData = [
    { key: '1', district: '成都', farmCount: 23, inventoryCount: 2432 },
    { key: '2', district: '绵阳', farmCount: 17, inventoryCount: 2031 },
    { key: '3', district: '乐山', farmCount: 8, inventoryCount: 1587 },
    { key: '4', district: '简阳', farmCount: 6, inventoryCount: 1090 },
    { key: '5', district: '自贡', farmCount: 2, inventoryCount: 480 },
];

// Warning table
const warningColumns = [
    { title: '养殖场名称', dataIndex: 'farmName', key: 'farmName', width: 80 },
    { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime', width: 80 },
    { title: '偏差率', dataIndex: 'deviationRate', key: 'deviationRate', width: 60 }
];

const warningData = [
    { key: '1', farmName: 'xx养殖场', reportTime: '2025/3/29', deviationRate: '20%' },
    { key: '2', farmName: 'xx养殖场', reportTime: '2025/3/29', deviationRate: '21%' },
    { key: '3', farmName: 'xx养殖场', reportTime: '2025/3/27', deviationRate: '24%' },
    { key: '4', farmName: 'xx养殖场', reportTime: '2025/3/22', deviationRate: '32%' },
    { key: '5', farmName: 'xx养殖场', reportTime: '2025/3/22', deviationRate: '54%' },
];

// Pie chart reference
const pieChartRef = ref<HTMLElement | null>(null);
let pieChart: echarts.ECharts | null = null;

// Initialize pie chart
const initPieChart = () => {
    if (!pieChartRef.value) return;

    pieChart = echarts.init(pieChartRef.value);

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: 0,
            left: 'center',
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
                color: '#fff',
                fontSize: 10
            }
        },
        series: [
            {
                name: '存栏品种',
                type: 'pie',
                radius: ['30%', '60%'],
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    formatter: '{c}',
                    color: '#fff',
                    fontSize: 10
                },
                labelLine: {
                    show: true,
                    lineStyle: {
                        color: '#fff'
                    }
                },
                data: [
                    { value: 2398, name: '母猪', itemStyle: { color: '#4096ff' } },
                    { value: 4321, name: '仔猪', itemStyle: { color: '#52c41a' } },
                    { value: 635, name: '育肥猪', itemStyle: { color: '#87d068' } }
                ]
            }
        ]
    };

    pieChart.setOption(option);
};

// View more warnings handler
const viewMoreWarnings = () => {
    message.info('查看更多异常预警功能待实现');
};

// Handle window resize
const handleResize = () => {
    pieChart?.resize();
};

onMounted(() => {
    initPieChart();
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    pieChart?.dispose();
    window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.dashboard-stats-panel {
    background-color: rgba(0, 25, 50, 0.8);
    border-radius: 4px;
    padding: 12px;
    color: white;
    width: 300px;
    // max-height: calc(100vh - 32px);
    max-height: calc(80vh);
    overflow-y: auto;

    .region-selector {
        margin-bottom: 10px;

        :deep(.ant-select) {
            .ant-select-selector {
                background-color: rgba(0, 40, 80, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
            }

            .ant-select-arrow {
                color: white;
            }
        }
    }

    .section-label {
        margin-bottom: 6px;
        font-weight: 500;
        font-size: 13px;
    }

    .section-header-with-link {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;

        .title {
            font-weight: 500;
            font-size: 13px;
        }

        .view-more a {
            color: white;
            cursor: pointer;
            font-size: 12px;
        }
    }

    .stats-section {
        margin-bottom: 12px;

        .stat-boxes {
            display: flex;
            gap: 8px;

            .stat-box {
                flex: 1;
                background-color: rgba(0, 40, 80, 0.5);
                border-radius: 4px;
                padding: 8px;
                text-align: center;

                .stat-value {
                    font-size: 16px;
                    font-weight: bold;
                }
            }
        }
    }

    .pie-chart {
        height: 170px;
    }

    .table-container {
        :deep(.ant-table) {
            background-color: transparent;
            font-size: 12px;

            .ant-table-thead>tr>th {
                background-color: rgba(0, 60, 120, 0.5) !important;
                color: white !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
                padding: 4px;
                font-size: 12px;
            }

            .ant-table-tbody>tr>td {
                background-color: transparent !important;
                color: white !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                padding: 4px;
                font-size: 12px;
            }

            .ant-table-tbody>tr:hover>td {
                background-color: rgba(255, 255, 255, 0.1) !important;
            }
        }
    }
}
</style>