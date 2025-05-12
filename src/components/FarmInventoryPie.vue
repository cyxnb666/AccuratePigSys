<template>
    <div class="info-section">
        <div class="section-header">
            <div class="title">养殖场存栏情况</div>
            <div class="sub-title">存栏总数：{{ leaveData.totalCount || 0 }}</div>
        </div>
        <div class="chart-container">
            <div ref="chartRef" class="chart"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
    leaveData: {
        type: Object,
        required: true,
        default: () => ({
            pigletCount: 0,
            porkerCount: 0,
            sowCount: 0,
            totalCount: 0
        })
    }
});

const chartData = computed(() => {
    const total = props.leaveData.totalCount ||
        (props.leaveData.pigletCount + props.leaveData.porkerCount + props.leaveData.sowCount);

    return [
        {
            name: '仔猪',
            value: props.leaveData.pigletCount || 0,
            percentage: total > 0 ? ((props.leaveData.pigletCount || 0) / total * 100).toFixed(2) : 0
        },
        {
            name: '育肥猪',
            value: props.leaveData.porkerCount || 0,
            percentage: total > 0 ? ((props.leaveData.porkerCount || 0) / total * 100).toFixed(2) : 0
        },
        {
            name: '能繁母猪',
            value: props.leaveData.sowCount || 0,
            percentage: total > 0 ? ((props.leaveData.sowCount || 0) / total * 100).toFixed(2) : 0
        }
    ];
});

const chartRef = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

const initChart = () => {
    if (!chartRef.value) return;

    if (!chart) {
        chart = echarts.init(chartRef.value);
    }

    const colors = ['#36CFC9', '#73D13D', '#40A9FF'];
    const data = chartData.value.map((item, index) => ({
        ...item,
        itemStyle: { color: colors[index % colors.length] }
    }));

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: 0,
            data: data.map(item => item.name)
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
                    position: 'outside',
                    formatter: '{c}\n{d}%',
                    fontSize: 14,
                },
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
                data: data
            }
        ]
    };

    chart.setOption(option);
};

const handleResize = () => {
    chart?.resize();
};

watch(() => props.leaveData, () => {
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

        .sub-title {
            color: #666;
            font-size: 14px;
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