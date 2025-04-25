<template>
    <div style="width: 100%">
        <!-- 地图容器 --> 
        <div ref="mapContainer" class="map-container"></div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import mapConfig from '@/utils/map-config';

const emit = defineEmits(['updatePosition']);

// 设置安全密钥
window._AMapSecurityConfig = {
    securityJsCode: mapConfig.SecurityJsCode,
};

const mapContainer = ref<HTMLDivElement>();

let map: any = null;
let marker: any = null;
let geocoder: any = null;

onMounted(() => {
    initMap();
});

onUnmounted(() => {
    map?.destroy();
});

// 初始化地图
const initMap = async () => {
    try {
        const AMap = await AMapLoader.load({
            key: mapConfig.AMAPKEY,
            version: '2.0',
            plugins: ['AMap.Geocoder', 'AMap.AutoComplete']
        });

        map = new AMap.Map(mapContainer.value, {
            viewMode: '2D',
            zoom: 13,
            center: [104.065735, 30.659462] // 成都市中心
        });

        // 初始化插件
        geocoder = new AMap.Geocoder({
            city: '全国'
        });

        // 点击地图事件
        map.on('click', handleMapClick);

    } catch (error) {
        console.error('地图初始化失败:', error);
    }
};

// 地图点击事件
const handleMapClick = async (e: any) => {
    const lnglat = e.lnglat;
    setMarker(lnglat);

    // 逆地理编码获取地址信息
    geocoder.getAddress(lnglat, (status: string, result: any) => {
        if (status === 'complete' && result.regeocode) {
            emit('updatePosition', {
                longitude: lnglat.getLng(),
                latitude: lnglat.getLat(),
                address: result.regeocode.formattedAddress
            });
        }
    });
};

// 设置标记点
const setMarker = (lnglat: any) => {
    if (marker) {
        map.remove(marker);
    }

    marker = new AMap.Marker({
        position: lnglat,
        map: map
    });
};

// 根据经纬度更新地图中心和标记
const updateMapPosition = (lng: number, lat: number) => {
    if (!map) return;

    const lnglat = new AMap.LngLat(lng, lat);
    map.setCenter(lnglat);
    setMarker(lnglat);
};

// 暴露给父组件使用的方法
defineExpose({
    updateMapPosition
});
</script>

<style lang="scss" scoped>
.map-container {
    width: 100%;
    height: 300px;
    border: 1px solid #e8e8e8;
}
</style>