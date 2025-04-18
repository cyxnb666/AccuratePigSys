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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
    mixedData: {
        type: Object,
        required: true,
        default: () => ({
            xAxis: ['上报起始月', '二月', '三月', '四月', '五月', '至今月/止期月'],
            series: [
                { name: '育肥猪', type: 'bar', data: [10, 20, 30, 40, 50, 60] },
                { name: '仔猪', type: 'bar', data: [20, 25, 30, 45, 30, 100] },
                { name: '母猪', type: 'bar', data: [25, 30, 61, 63, 63, 115] },
                { name: '存栏总量', type: 'line', yAxisIndex: 1, data: [500, 200, 260, 330, 650, 333] }
            ]
        })
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

const initChart = () => {
    if (!chartRef.value) return;

    if (!chart) {
        chart = echarts.init(chartRef.value);
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
            data: props.mixedData.series.map(item => item.name)
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
                data: props.mixedData.xAxis,
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
        series: props.mixedData.series.map(item => {
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