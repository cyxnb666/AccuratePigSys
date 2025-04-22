<template>
    <div style="width: 100%">
        <!-- 搜索框 -->
        <div class="search-box">
            <a-select-input v-model:value="keyword" :loading="loading" placeholder="请输入关键词搜索" allow-input allow-clear
                @search="remoteMethod" @select="handleSelect">
                <template #optionRender="{ data }">
                    <a-select-option v-for="item in options" :key="item.id" :value="item">
                        {{ item.name }}
                    </a-select-option>
                </template>
            </a-select-input>
        </div>

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
const keyword = ref('');
const loading = ref(false);
const options = ref<any[]>([]);

let map: any = null;
let marker: any = null;
let geocoder: any = null;
let placeSearch: any = null;

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
            plugins: ['AMap.PlaceSearch', 'AMap.Geocoder', 'AMap.AutoComplete']
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

        placeSearch = new AMap.PlaceSearch({
            city: '全国',
            citylimit: false
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

// 搜索地址
const remoteMethod = (query: string) => {
    if (!query) {
        options.value = [];
        return;
    }

    loading.value = true;
    placeSearch.search(query, (status: string, result: any) => {
        loading.value = false;
        if (status === 'complete' && result.poiList) {
            options.value = result.poiList.pois;
        } else {
            options.value = [];
        }
    });
};

// 选择搜索结果
const handleSelect = (val: any) => {
    if (!val || !val.location) return;

    const lnglat = new AMap.LngLat(val.location.lng, val.location.lat);
    map.setCenter(lnglat);
    setMarker(lnglat);

    emit('updatePosition', {
        longitude: val.location.lng,
        latitude: val.location.lat,
        address: val.name
    });
};

// 暴露给父组件使用的方法
defineExpose({
    updateMapPosition
});
</script>

<style lang="scss" scoped>
.search-box {
    margin-bottom: 10px;
}

.map-container {
    width: 100%;
    height: 300px;
    border: 1px solid #e8e8e8;
}
</style>