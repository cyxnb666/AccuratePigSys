<template>
    <div class="detail-card">
        <div class="card-header">
            <div class="title">养殖场存栏量月度变化趋势</div>
            <div class="date-selector">
                <a-range-picker v-model:value="localDateRange" picker="month" @change="handleDateChange" />
            </div>
        </div>
        <div class="chart-container">
            <div ref="chartRef" class="chart" style="height: 300px"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
    mixedData: {
        type: Array,
        required: true,
        default: () => []
    },
    dateRange: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:dateRange']);

const localDateRange = ref(props.dateRange);

watch(() => props.dateRange, (newVal) => {
    localDateRange.value = newVal;
});

const handleDateChange = (dates) => {
    emit('update:dateRange', dates);
};

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

// 转换数据格式用于图表展示
const processedData = computed(() => {
    if (!props.mixedData || !Array.isArray(props.mixedData)) {
        return {
            xAxis: [],
            series: []
        };
    }

    // 收集所有唯一的月份
    const allMonths = new Set();
    props.mixedData.forEach(breed => {
        if (breed.staticiss && Array.isArray(breed.staticiss)) {
            breed.staticiss.forEach(item => {
                if (item.reportMonth) {
                    allMonths.add(item.reportMonth);
                }
            });
        }
    });

    // 将月份数组排序
    const months = Array.from(allMonths).sort();

    // 处理各个品种的数据
    const breedSeries = [];
    let totalData = Array(months.length).fill(0); // 存储每个月的总数

    props.mixedData.forEach(breed => {
        if (!breed.breedName) return;

        // 准备该品种的数据数组，对应每个月
        const breedData = Array(months.length).fill(0);

        // 填充实际数据
        if (breed.staticiss && Array.isArray(breed.staticiss)) {
            breed.staticiss.forEach(item => {
                if (item.reportMonth) {
                    const monthIndex = months.indexOf(item.reportMonth);
                    if (monthIndex !== -1) {
                        const count = item.persionalCheckCount || 0;
                        breedData[monthIndex] = count;
                        totalData[monthIndex] += count; // 累加到总数
                    }
                }
            });
        }

        // 添加到系列中
        breedSeries.push({
            name: breed.breedName,
            type: 'bar',
            data: breedData
        });
    });

    // 添加总量折线图
    breedSeries.push({
        name: '存栏总量',
        type: 'line',
        yAxisIndex: 1,
        data: totalData
    });

    // 格式化X轴显示，如果只有一个月份，则添加一个前后月份
    let xAxis = [...months];
    if (xAxis.length === 1) {
        const month = xAxis[0];
        const [year, monthNum] = month.split('-').map(part => parseInt(part));

        // 添加前一个月
        const prevMonth = monthNum === 1
            ? `${year - 1}-12`
            : `${year}-${(monthNum - 1).toString().padStart(2, '0')}`;

        // 添加后一个月
        const nextMonth = monthNum === 12
            ? `${year + 1}-01`
            : `${year}-${(monthNum + 1).toString().padStart(2, '0')}`;

        xAxis = [prevMonth, month, nextMonth];

        // 调整数据数组，在前后添加0
        breedSeries.forEach(series => {
            series.data = [0, ...series.data, 0];
        });
    }

    return {
        xAxis,
        series: breedSeries
    };
});

const initChart = () => {
    if (!chartRef.value) return;

    if (!chart) {
        chart = echarts.init(chartRef.value);
    }

    const data = processedData.value;

    // 找出最大值用于设置Y轴范围
    let barMax = 0;
    let lineMax = 0;

    data.series.forEach(series => {
        if (series.type === 'bar') {
            const max = Math.max(...series.data.filter(v => typeof v === 'number'));
            barMax = Math.max(barMax, max);
        } else if (series.type === 'line') {
            const max = Math.max(...series.data.filter(v => typeof v === 'number'));
            lineMax = Math.max(lineMax, max);
        }
    });

    // 适当放大范围，确保有足够的显示空间
    barMax = Math.ceil(barMax * 1.2) || 100;
    lineMax = Math.ceil(lineMax * 1.2) || 200;

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
            data: data.series.map(item => item.name),
            top: 'bottom',
        },
        grid: {
            left: '3%',
            right: '4%',
            top: '5%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: data.xAxis,
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
                max: barMax,
                interval: Math.ceil(barMax / 6)
            },
            {
                type: 'value',
                name: '总量',
                min: 0,
                max: lineMax,
                interval: Math.ceil(lineMax / 7)
            }
        ],
        series: data.series.map(item => {
            const baseConfig = {
                name: item.name,
                type: item.type,
                data: item.data
            };

            if (item.type === 'bar') {
                return {
                    ...baseConfig,
                    barWidth: 20
                };
            } else if (item.type === 'line') {
                return {
                    ...baseConfig,
                    yAxisIndex: 1,
                    label: {
                        show: true,
                        position: 'top'
                    }
                };
            }

            return baseConfig;
        })
    };

    chart.setOption(option);
};

const handleResize = () => {
    chart?.resize();
};

watch(() => props.mixedData, () => {
    initChart();
}, { deep: true });

onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    chart?.dispose();
    window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
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
</style>