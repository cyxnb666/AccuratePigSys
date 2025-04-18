<template>
    <div class="detail-card">
        <div class="card-header">
            <div class="title">养殖区存栏量变化趋势</div>
            <div class="date-selector">
                <a-range-picker v-model:value="localDateRange" :disabledDate="disableFutureDates"
                    @change="handleDateChange" />
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
import dayjs from 'dayjs';

const props = defineProps({
    trendData: {
        type: Object,
        required: true,
        default: () => ({
            xAxis: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            series: [
                { name: '养殖场1', data: [10, 20, 30, 40, 50, 60, 55, 50, 40, 42, 45, 40] },
                { name: '养殖场2', data: [15, 25, 35, 45, 35, 90, 100, 105, 100, 105, 100, 95] },
                { name: '养殖场3', data: [5, 15, 25, 35, 30, 80, 70, 75, 75, 70, 60, 70] }
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

const disableFutureDates = (current) => {
    return current && current.isAfter(dayjs(), 'day');
};

const initChart = () => {
    if (!chartRef.value) return;

    if (!chart) {
        chart = echarts.init(chartRef.value);
    }

    const option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: props.trendData.series.map(item => item.name)
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
            data: props.trendData.xAxis
        },
        yAxis: {
            type: 'value'
        },
        series: props.trendData.series.map(item => ({
            name: item.name,
            type: 'line',
            data: item.data,
            smooth: true,
            lineStyle: {
                width: 2
            }
        }))
    };

    chart.setOption(option);
};

const handleResize = () => {
    chart?.resize();
};

watch(() => props.trendData, () => {
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