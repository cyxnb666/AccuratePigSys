<template>
    <div class="gps-plot">
        <div :id="containerId" class="map-container"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, defineProps, ref } from 'vue';
import mapConfig from '@/utils/map-config';

const props = defineProps({
    fenceData: {
        type: Object,
        required: true,
        default: () => ({
            path: [
                { lng: 116.458694, lat: 40.000431 },
                { lng: 116.4629, lat: 40.000628 },
                { lng: 116.466505, lat: 39.991949 }
            ]
        })
    },
    trackingData: {
        type: Array,
        required: true,
        default: () => [
            { lng: 116.462, lat: 39.997, timestamp: '0s' },
            { lng: 116.463, lat: 39.996, timestamp: '4s' },
            { lng: 116.464, lat: 39.995, timestamp: '8s' },
            { lng: 116.465, lat: 39.994, timestamp: '12s' },
            { lng: 116.4655, lat: 39.9935, timestamp: '15s' }
        ]
    },
    areaType: {
        type: String,
        default: 'default'
    }
});

const containerId = `gps-container-${props.areaType}-${Date.now()}`;

let map = null;
let polygon = null;
let trackLine = null;
let trackMarkers = [];

onMounted(() => {
    window._AMapSecurityConfig = {
        securityJsCode: mapConfig.SecurityJsCode,
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.AMAPKEY}`;
    document.head.appendChild(script);

    script.onload = () => {
        initMap();
    };
});

const initMap = () => {
    map = new AMap.Map(containerId, {
        resizeEnable: true,
        center: [116.462, 39.996],
        zoom: 15
    });

    drawFence();

    drawTrackingData();

    fitMapView();
};

const drawFence = () => {
    if (!map) return;

    const path = props.fenceData.path.map(point => {
        return new AMap.LngLat(point.lng, point.lat);
    });

    polygon = new AMap.Polygon({
        path: path,
        strokeColor: '#5276E5',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#5276E5',
        fillOpacity: 0.2,
        zIndex: 50
    });

    map.add(polygon);
};

const drawTrackingData = () => {
    if (!map) return;

    const path = props.trackingData.map(point => {
        return new AMap.LngLat(point.lng, point.lat);
    });

    trackLine = new AMap.Polyline({
        path: path,
        strokeColor: '#FF33FF',
        strokeOpacity: 0.9,
        strokeWeight: 3,
        strokeStyle: 'solid',
        zIndex: 100
    });

    map.add(trackLine);

    props.trackingData.forEach((point, index) => {
        const marker = new AMap.Marker({
            position: new AMap.LngLat(point.lng, point.lat),
            content: `<div class="track-marker">${point.timestamp}</div>`,
            offset: new AMap.Pixel(-15, -15),
            zIndex: 110
        });

        map.add(marker);
        trackMarkers.push(marker);
    });
};

const fitMapView = () => {
    if (!map) return;

    const elements = [];
    if (polygon) elements.push(polygon);
    if (trackLine) elements.push(trackLine);

    if (elements.length > 0) {
        map.setFitView(elements);
    }
};

onUnmounted(() => {
    if (map) {
        map.destroy();
    }
});
</script>

<style lang="scss" scoped>
.gps-plot {
    width: 100%;
    height: 100%;

    .map-container {
        width: 100%;
        height: 100%;
    }
}

:deep(.track-marker) {
    background-color: #FF33FF;
    color: white;
    font-size: 12px;
    padding: 2px 5px;
    border-radius: 10px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}
</style>