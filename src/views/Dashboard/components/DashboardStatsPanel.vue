<template>
    <div class="dashboard-stats-panel">
        <div class="region-selector">
            <a-tree-select v-model:value="selectedRegion" style="width: 100%"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-data="regionTreeData"
                placeholder="请选择地区" :fieldNames="{ label: 'title', value: 'value', children: 'children' }"
                :loading="treeLoading" :tree-node-filter-prop="'title'" :show-search="true" allow-clear
                :filter-tree-node="filterTreeNode">
            </a-tree-select>
        </div>

        <div class="stats-section">
            <div class="section-label">养殖场总数</div>
            <div class="stat-boxes">
                <div class="stat-box">
                    <div class="stat-value">{{ totalFarmCount }}个</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">{{ totalLeaveCount }}头</div>
                </div>
            </div>
        </div>

        <div class="stats-section">
            <div class="section-label">养殖场情况 ({{ selectedRegionName }})</div>
            <div class="table-container">
                <a-table :columns="situationColumns" :data-source="situationData" :pagination="false" size="small"
                    :bordered="true" :loading="tableLoading">
                </a-table>
            </div>
        </div>

        <div class="stats-section">
            <div class="section-label">存栏品种</div>
            <div ref="pieChartRef" class="pie-chart" :class="{ 'loading': chartLoading }"></div>
            <div v-if="chartLoading" class="chart-loading">
                <a-spin />
            </div>
        </div>

        <div class="stats-section">
            <div class="section-header-with-link">
                <div class="title">异常预警</div>
                <div class="view-more">
                    <a @click="viewMoreWarnings">查看更多 >></a>
                </div>
            </div>
            <div class="table-container">
                <a-table :columns="warningColumns" :data-source="warningData" :pagination="false" size="small"
                    :bordered="true" :loading="warningDataLoading">
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'deviationRate'">
                            <span :style="{ color: getDeviationColor(record.deviationRate) }">
                                {{ record.deviationRate }}%
                            </span>
                        </template>
                    </template>
                </a-table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import { message } from 'ant-design-vue';
import { selectUserTree, selectAreaFarms, selectHomeFarms, getWarningList, selectBreedFarms } from '../api';
import { useRouter } from 'vue-router';

const router = useRouter();
const warningDataLoading = ref(false);
const warningData = ref([]);
const fetchWarningData = async (areacode) => {
    warningDataLoading.value = true;

    try {
        const params = {
            condition: {
                areacode: areacode || '',
                farmName: '',
                startDate: '',
                endDate: ''
            },
            pageNo: 1,
            pageSize: 5
        };

        const res = await getWarningList(params);

        if (res && res.records) {
            warningData.value = res.records.map((item, index) => ({
                ...item,
                key: index.toString()
            })).slice(0, 5); // 确保最多只有5条数据
        } else {
            warningData.value = [];
        }
    } catch (error) {
        console.error('获取异常预警数据失败:', error);
        warningData.value = [];
    } finally {
        warningDataLoading.value = false;
    }
};

const treeLoading = ref(false);
const tableLoading = ref(false);
const chartLoading = ref(false);

const totalFarmCount = ref(0);
const totalLeaveCount = ref(0);
const selectedRegionName = ref('全部');

const emit = defineEmits(['region-change', 'farms-loaded']);
const regionTreeData = ref([]);
const selectedRegion = ref('');

const breedData = ref([]);

// 树节点过滤
const filterTreeNode = (inputValue, treeNode) => {
    return treeNode.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1;
};

// 转换行政区划数据为树形结构
const transformAreaData = (areaList: any[]): any[] => {
    return areaList.map(area => {
        const node = {
            title: area.areaname,
            value: area.areacode,
            key: area.areacode,
            children: area.children ? transformAreaData(area.children) : []
        };
        return node;
    });
};

// 获取行政区划数据
const fetchAreaTrees = async () => {
    treeLoading.value = true;
    try {
        const res = await selectUserTree();
        if (res) {
            regionTreeData.value = transformAreaData(res);

            // 默认选中第一个节点
            if (regionTreeData.value.length > 0) {
                const firstNode = regionTreeData.value[0];
                selectedRegion.value = firstNode.value;
                selectedRegionName.value = firstNode.title;
            }
        }
    } catch (error) {
        console.error('获取行政区划数据失败:', error);
    } finally {
        treeLoading.value = false;
    }
};

// 获取品种数据
const fetchBreedData = async (areacode) => {
    chartLoading.value = true;
    try {
        const res = await selectBreedFarms(areacode);
        if (res && Array.isArray(res)) {
            breedData.value = res;
            // 更新饼图
            updatePieChart();
        } else {
            breedData.value = [];
        }
    } catch (error) {
        console.error('获取品种数据失败:', error);
        breedData.value = [];
    } finally {
        chartLoading.value = false;
    }
};

// 加载区域相关数据
const loadRegionData = async (areacode) => {
    try {
        if (areacode) {
            await Promise.all([
                fetchAreaFarmsData(areacode),
                fetchHomeFarmsData(areacode),
                fetchWarningData(areacode),
                // fetchBreedData(areacode)
            ]);
        }
    } catch (error) {
        console.error('加载区域数据失败:', error);
    }
};

// 获取偏差率颜色
const getDeviationColor = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate > 15) return '#FF4D4F';
    if (numRate > 8) return '#FAAD14';
    return '#52C41A';
};

// 养殖场情况表格数据
const situationColumns = [
    { title: '行政区划', dataIndex: 'areaname', key: 'areaname', align: 'center', width: 80 },
    { title: '养殖场数量', dataIndex: 'farmCount', key: 'farmCount', align: 'center', width: 80 },
    { title: '存栏数量', dataIndex: 'leaveCount', key: 'leaveCount', align: 'center', width: 80 }
];

const situationData = ref([]);

// 获取养殖场情况数据
const fetchAreaFarmsData = async (areacode) => {
    tableLoading.value = true;
    try {
        const res = await selectAreaFarms(areacode);
        if (res && Array.isArray(res)) {
            // 更新表格数据
            situationData.value = res.map((item, index) => ({
                ...item,
                key: index.toString()
            }));

            // 计算总数
            totalFarmCount.value = res.reduce((sum, item) => sum + (item.farmCount || 0), 0);
            totalLeaveCount.value = res.reduce((sum, item) => sum + (item.leaveCount || 0), 0);
        } else {
            situationData.value = [];
            totalFarmCount.value = 0;
            totalLeaveCount.value = 0;
        }
    } catch (error) {
        console.error('获取养殖场情况数据失败:', error);
        situationData.value = [];
        totalFarmCount.value = 0;
        totalLeaveCount.value = 0;
    } finally {
        tableLoading.value = false;
    }
};

// 养殖场数据 - 地图和饼图
const farmData = ref([]);

// 获取养殖场数据
const fetchHomeFarmsData = async (areacode) => {
    chartLoading.value = true;
    try {
        const res = await selectHomeFarms(areacode);
        if (res && Array.isArray(res)) {
            farmData.value = res;

            // 更新饼图
            updatePieChart();

            emit('farms-loaded', farmData.value);
        } else {
            farmData.value = [];
        }
    } catch (error) {
        console.error('获取存栏品种数据失败:', error);
        farmData.value = [];
    } finally {
        chartLoading.value = false;
    }
};

const warningColumns = [
    { title: '养殖场名称', dataIndex: 'farmName', key: 'farmName', width: 80 },
    { title: '上报时间', dataIndex: 'registTime', key: 'registTime', width: 80 },
    {
        title: '偏差率', dataIndex: 'deviationRate', key: 'deviationRate', width: 60,
        customRender: ({ text }) => `${text}%`
    }
];

const pieChartRef = ref<HTMLElement | null>(null);
let pieChart: echarts.ECharts | null = null;

// 从养殖场数据中分析存栏品种数据
const processInventoryData = () => {
    // 使用API返回的品种数据
    if (!breedData.value || breedData.value.length === 0) {
        // 如果没有数据，返回默认空数据
        return [
            { value: 0, name: '母猪', itemStyle: { color: '#4096ff' } },
            { value: 0, name: '仔猪', itemStyle: { color: '#52c41a' } },
            { value: 0, name: '育肥猪', itemStyle: { color: '#87d068' } }
        ];
    }

    // 映射品种代码到中文名称和颜色
    const breedMap = {
        'BROOD_SOW': { name: '母猪', color: '#4096ff' },
        'PIGLET': { name: '仔猪', color: '#52c41a' },
        'PORKER': { name: '育肥猪', color: '#87d068' }
    };

    // 转换API数据为饼图所需格式
    return breedData.value.map(item => {
        const breedInfo = breedMap[item.breedCode] || { name: item.breedName, color: '#1890ff' };
        return {
            value: item.persionalCheckCount || 0,
            name: breedInfo.name,
            itemStyle: { color: breedInfo.color }
        };
    });
};

const initPieChart = () => {
    if (!pieChartRef.value) return;

    pieChart = echarts.init(pieChartRef.value);
    updatePieChart();
};

const updatePieChart = () => {
    if (!pieChart) return;

    const inventoryData = processInventoryData();

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
                data: inventoryData
            }
        ]
    };

    pieChart.setOption(option);
};

const viewMoreWarnings = () => {
    router.push('/E-WARN');
};

const handleResize = () => {
    pieChart?.resize();
};

// 监听区域选择变化
watch(() => selectedRegion.value, async (newValue, oldValue) => {
    if (newValue) {
        // 查找选中节点的名称
        const findNodeName = (nodes, value) => {
            for (const node of nodes) {
                if (node.value === value) {
                    return node.title;
                }
                if (node.children && node.children.length) {
                    const foundName = findNodeName(node.children, value);
                    if (foundName) return foundName;
                }
            }
            return null;
        };

        const regionName = findNodeName(regionTreeData.value, newValue);
        if (regionName) {
            selectedRegionName.value = regionName;
        }

        // 加载新区域数据
        await loadRegionData(newValue);
        emit('region-change', newValue);
    }
});

onMounted(() => {
    fetchAreaTrees();
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
        position: relative;

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
        position: relative;

        &.loading {
            opacity: 0.6;
        }
    }

    .chart-loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
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