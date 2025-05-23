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
            <a-row :gutter="16" class="full-height-row">
                <a-col :span="14" class="full-height-col">
                    <div class="video-wrapper">
                        <video v-if="videoUrl" controls width="100%" class="main-video">
                            <source :src="videoUrl" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <div v-else class="video-placeholder">
                            <div class="placeholder-text">暂无视频数据</div>
                        </div>
                    </div>
                </a-col>

                <a-col :span="10" class="full-height-col">
                    <div class="tracks-wrapper">
                        <!-- Sensor track -->
                        <div class="track-container">
                            <div class="track-header">传感器轨迹</div>
                            <div class="track-content sensor-track">
                                <img v-if="sensorImageUrl" :src="sensorImageUrl" alt="传感器轨迹" 
                                     style="width: 100%; height: 100%; object-fit: contain;" />
                                <div v-else class="placeholder-text"
                                     style="height: 100%; display: flex; align-items: center; justify-content: center;">
                                    暂无传感器轨迹数据
                                </div>
                            </div>
                        </div>

                        <!-- GPS track -->
                        <div class="track-container">
                            <div class="track-header">GPS轨迹</div>
                            <div class="track-content gps-track">
                                <plot-g-p-s :fence-data="fenceData" :tracking-data="trackingData" :area-type="tabKey" />
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
import { getLeaveFence } from '../api';
import PlotGPS from '../PlotGPS/PlotGPS.vue';

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
const videoUrl = ref('');
const sensorImageUrl = ref('');
const fenceData = ref({ path: [] });
const trackingData = ref([]);

const goBack = () => {
    router.go(-1);
};

onMounted(async () => {
    console.log(`Loading detailed comparison for record ${props.recordId}, area ${props.areaIndex}, tab ${props.tabKey}`);
    
    // 获取当前标签页对应的围栏类型
    const breedCodeMap = {
        'fattening': 'PORKER',
        'piglets': 'PIGLET',
        'sows': 'BROOD_SOW'
    };
    const breedCode = breedCodeMap[props.tabKey];
    
    let fenceRegistId = null;
    
    // 从sessionStorage中获取缓存数据
    try {
        // 获取审核数据
        const auditDataStr = sessionStorage.getItem(`audit_data_${props.recordId}`);
        if (auditDataStr) {
            const auditData = JSON.parse(auditDataStr);
            if (auditData && auditData.auditFences && auditData.auditFences[props.areaIndex]) {
                const fenceArea = auditData.auditFences[props.areaIndex];
                
                // 处理围栏坐标数据
                if (fenceArea.coordinate) {
                    try {
                        const coordinateData = JSON.parse(fenceArea.coordinate);
                        fenceData.value = { path: coordinateData };
                    } catch (e) {
                        console.error('解析围栏坐标失败:', e);
                    }
                }
                
                // 查找当前类型的围栏
                if (fenceArea.fences) {
                    const fence = fenceArea.fences.find(f => f.breedCode === breedCode);
                    if (fence && fence.fenceRegistId) {
                        fenceRegistId = fence.fenceRegistId;
                        
                        // 获取围栏详情缓存
                        const fenceDetailStr = sessionStorage.getItem(`fence_detail_${fence.fenceRegistId}`);
                        if (fenceDetailStr) {
                            console.log('Using cached fence detail data from sessionStorage');
                            const fenceDetail = JSON.parse(fenceDetailStr);
                            
                            // 处理GPS轨迹数据
                            if (fenceDetail.gpss && fenceDetail.gpss.length > 0) {
                                trackingData.value = fenceDetail.gpss.map(gps => ({
                                    lng: parseFloat(gps.longitude),
                                    lat: parseFloat(gps.latitude),
                                    timestamp: `${gps.timestamp}s`
                                }));
                            }
                            
                            if (fenceDetail.files && fenceDetail.files.length > 0) {
                                const videoFile = fenceDetail.files.find(f => f.fileType === 'SENCE_AI');
                                const sensorFile = fenceDetail.files.find(f => f.fileType === 'SENSOR');
                                
                                if (videoFile && videoFile.fileUrl) {
                                    videoUrl.value = videoFile.fileUrl;
                                }
                                
                                if (sensorFile && sensorFile.fileUrl) {
                                    sensorImageUrl.value = sensorFile.fileUrl;
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error retrieving cached data:', error);
    }
    
    // 如果没有从缓存中获取到围栏ID，则无法继续
    if (!fenceRegistId) {
        console.error('No fence registration ID found, cannot load detailed data');
        return;
    }
    
    // 如果没有加载完整的数据
    if (!videoUrl.value || !sensorImageUrl.value || trackingData.value.length === 0) {
        try {
            console.log('Loading data from API for fence:', fenceRegistId);
            const fenceDetail = await getLeaveFence(fenceRegistId);
            
            if (fenceDetail) {
                if (fenceDetail.files && fenceDetail.files.length > 0) {
                    // 处理视频
                    const videoFile = fenceDetail.files.find(f => f.fileType === 'SENCE_AI');
                    if (videoFile && videoFile.fileUrl) {
                        videoUrl.value = videoFile.fileUrl;
                    }
                    
                    // 处理传感器图片
                    const sensorFile = fenceDetail.files.find(f => f.fileType === 'SENSOR');
                    if (sensorFile && sensorFile.fileUrl) {
                        sensorImageUrl.value = sensorFile.fileUrl;
                    }
                }
                
                // 处理GPS轨迹
                if (fenceDetail.gpss && fenceDetail.gpss.length > 0 && trackingData.value.length === 0) {
                    trackingData.value = fenceDetail.gpss.map(gps => ({
                        lng: parseFloat(gps.longitude),
                        lat: parseFloat(gps.latitude),
                        timestamp: `${gps.timestamp}s`
                    }));
                }
                
                // 更新缓存
                sessionStorage.setItem(`fence_detail_${fenceRegistId}`, JSON.stringify(fenceDetail));
            }
        } catch (error) {
            console.error('Failed to load fence detail from API:', error);
        }
    }
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
            background-color: #eee;
            position: relative;
        }

        .gps-track {
            background-color: #eee;
        }
    }
}
</style>