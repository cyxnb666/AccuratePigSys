<template>
    <div class="info-section">
        <div class="section-header">
            <div class="title">存栏上报情况</div>
            <div class="date-selector">
                <a-range-picker v-model:value="localDateRange" :disabledDate="disableFutureDates"
                    @change="handleDateChange" />
            </div>
        </div>
        <div class="chart-container">
            <div ref="chartRef" class="chart"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

const props = defineProps({
    reportData: {
        type: Array,
        required: true,
        default: () => [
            { name: '提醒上报', value: 20, color: '#40A9FF' },
            { name: '延期未上报', value: 15, color: '#73D13D' },
            { name: '实际上报', value: 25, color: '#36CFC9' }
        ]
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
            data: props.reportData.map(item => item.name)
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '次数',
                type: 'bar',
                barWidth: '60%',
                data: props.reportData.map(item => ({
                    value: item.value,
                    itemStyle: { color: item.color }
                })),
                label: {
                    show: true,
                    position: 'top'
                }
            }
        ]
    };

    chart.setOption(option);
};

const handleResize = () => {
    chart?.resize();
};

watch(() => props.reportData, () => {
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