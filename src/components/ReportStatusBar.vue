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
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

const props = defineProps({
    farmWarnData: {
        type: Object,
        required: true,
        default: () => ({
            nregistCount: 0,
            oregistCount: 0,
            sregistCount: 0
        })
    },
    dateRange: {
        type: Array,
        default: () => []
    },
    farmId: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:dateRange', 'reload-report-data']);

const localDateRange = ref(props.dateRange);

watch(() => props.dateRange, (newVal) => {
    localDateRange.value = newVal;
});

const handleDateChange = (dates) => {
    emit('update:dateRange', dates);

    let startDate = '';
    let endDate = '';

    if (dates && dates.length === 2) {
        startDate = dates[0] ? dayjs(dates[0]).format('YYYY-MM-DD') : '';
        endDate = dates[1] ? dayjs(dates[1]).format('YYYY-MM-DD') : '';
    }

    emit('reload-report-data', {
        startDate,
        endDate
    });
};

const chartData = computed(() => {
    return [
        { name: '提醒未上报', value: props.farmWarnData.nregistCount || 0, color: '#40A9FF' },
        { name: '延期未上报', value: props.farmWarnData.oregistCount || 0, color: '#73D13D' },
        { name: '实际上报', value: props.farmWarnData.sregistCount || 0, color: '#36CFC9' }
    ];
});

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
            top: '8%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: chartData.value.map(item => item.name)
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '次数',
                type: 'bar',
                barWidth: '60%',
                data: chartData.value.map(item => ({
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

watch(() => props.farmWarnData, () => {
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