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

const disableFutureDates = (current) => {
    return current && current.isAfter(dayjs(), 'day');
};

const initChart = () => {
    if (!chartRef.value) return;

    if (!chart) {
        chart = echarts.init(chartRef.value);
    }

    // 处理数据
    const seriesData = [];
    const xAxisData = [];
    
    // 如果存在数据则处理
    if (props.trendData && props.trendData.length > 0) {
        // 收集所有唯一的日期
        const allDates = new Set();
        props.trendData.forEach(fence => {
            if (fence.staticiss && fence.staticiss.length) {
                fence.staticiss.forEach(item => {
                    if (item.registDate) {
                        allDates.add(item.registDate);
                    }
                });
            }
        });
        
        // 按日期排序
        xAxisData.push(...Array.from(allDates).sort());
        
        // 处理每个围栏的数据
        props.trendData.forEach(fence => {
            if (!fence.fenceName) return;
            
            // 创建一个包含所有日期的映射，初始值为0
            const dataMap = {};
            xAxisData.forEach(date => {
                dataMap[date] = 0;
            });
            
            // 填充实际数据
            if (fence.staticiss && fence.staticiss.length) {
                fence.staticiss.forEach(item => {
                    if (item.registDate && dataMap.hasOwnProperty(item.registDate)) {
                        dataMap[item.registDate] = item.persionalCheckCount || 0;
                    }
                });
            }
            
            // 收集围栏的数据
            const seriesItem = {
                name: fence.fenceName,
                type: 'line',
                data: xAxisData.map(date => dataMap[date]),
                smooth: true,
                lineStyle: {
                    width: 2
                }
            };
            
            seriesData.push(seriesItem);
        });
    }

    const option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: seriesData.map(item => item.name),
            top: 'bottom',
        },
        grid: {
            left: '3%',
            right: '4%',
            top: '5%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: xAxisData
        },
        yAxis: {
            type: 'value'
        },
        series: seriesData
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