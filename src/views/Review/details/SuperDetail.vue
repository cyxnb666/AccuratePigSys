<template>
    <div class="super-detail">
        <!-- 面包屑导航 -->
        <div class="bread-detail-card">
            <div class="breadcrumb">
                <a-breadcrumb>
                    <a-breadcrumb-item>
                        <a @click="goBack">
                            <left-outlined /> 返回
                        </a>
                    </a-breadcrumb-item>
                    <a-breadcrumb-item>详细对比</a-breadcrumb-item>
                </a-breadcrumb>
            </div>
        </div>

        <div class="content-container">
            <!-- Two-column layout -->
            <a-row :gutter="16" class="full-height-row">
                <!-- Left column: Video player -->
                <a-col :span="14" class="full-height-col">
                    <div class="video-wrapper">
                        <video controls width="100%" class="main-video">
                            <source src="" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </a-col>

                <!-- Right column: Track visualizations -->
                <a-col :span="10" class="full-height-col">
                    <div class="tracks-wrapper">
                        <!-- Sensor track -->
                        <div class="track-container">
                            <div class="track-header">传感器轨迹</div>
                            <div class="track-content sensor-track">
                                <!-- This would be implemented with a chart library in production -->
                            </div>
                        </div>

                        <!-- GPS track -->
                        <div class="track-container">
                            <div class="track-header">GPS轨迹</div>
                            <div class="track-content gps-track">
                                <!-- This would be implemented with a map library in production -->
                            </div>
                        </div>
                    </div>
                </a-col>
            </a-row>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LeftOutlined } from '@ant-design/icons-vue';

const props = defineProps({
    recordId: {
        type: [String, Number],
        required: true
    },
    areaIndex: {
        type: Number,
        default: 0
    },
    tabKey: {
        type: String,
        default: 'fattening'
    }
});

const router = useRouter();

// Go back to the previous page
const goBack = () => {
    router.go(-1);
};

// Mock data for sensor track and GPS coordinates
const sensorTrackData = ref([
    { time: '0s', value: 10 },
    { time: '4s', value: 25 },
    { time: '8s', value: 15 },
    { time: '12s', value: 30 },
    { time: '16s', value: 20 }
]);

// Load data based on props
onMounted(() => {
    console.log(`Loading detailed comparison for record ${props.recordId}, area ${props.areaIndex}, tab ${props.tabKey}`);
    // In a real implementation, you would fetch the video and track data from your API

    // Note: The following would be implemented with actual chart libraries 
    // like ECharts for the sensor track and a map library for the GPS track
});
</script>

<style lang="scss" scoped>
.super-detail {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .bread-detail-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        padding: 16px;
        margin-bottom: 16px;
    }

    .content-container {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        padding: 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .full-height-row {
        flex: 1;
        height: 100%;

        :deep(.ant-row) {
            height: 100%;
        }
    }

    .full-height-col {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .video-wrapper {
        width: 100%;
        height: 100%;
        background-color: #000;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
        align-items: center;

        .main-video {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
    }

    .tracks-wrapper {
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100%;
    }

    .track-container {
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        overflow: hidden;
        flex: 1;
        display: flex;
        flex-direction: column;

        .track-header {
            padding: 10px 16px;
            font-weight: 500;
            background-color: #f5f5f5;
            border-bottom: 1px solid #e8e8e8;
        }

        .track-content {
            flex: 1;
            background-color: #f9f9f9;
            min-height: 150px;
        }

        .sensor-track {
            /* Purple line graph with timestamps */
            background-color: #eee;
            position: relative;
        }

        .gps-track {
            /* Satellite/map view with path overlay */
            background-color: #eee;
        }
    }
}
</style>