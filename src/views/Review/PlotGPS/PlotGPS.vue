<template>
    <div class="gps-plot">
        <div :id="containerId" class="map-container"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, defineProps, ref, watch } from 'vue';
import mapConfig from '@/utils/map-config';

const props = defineProps({
    fenceData: {
        type: Object,
        required: true,
        default: () => ({
            path: []
        })
    },
    trackingData: {
        type: Array,
        required: true,
        default: () => []
    },
    areaType: {
        type: String,
        default: 'default'
    }
});

const containerId = `gps-container-${props.areaType}-${Date.now()}`;
const mapInitialized = ref(false);
let map = null;
let polygon = null;
let trackLine = null;
let trackMarkers = [];

const initMap = () => {
    if (!document.getElementById(containerId)) {
        console.error('Map container element not found');
        return;
    }
    
    try {
        window._AMapSecurityConfig = {
            securityJsCode: mapConfig.SecurityJsCode,
        };
        
        map = new AMap.Map(containerId, {
            resizeEnable: true,
            center: [116.462, 39.996],
            zoom: 15
        });
        
        // 使用瓦片方式添加的天地图图层
        const tiandituLayer = new AMap.TileLayer.Flexible({
            createTile: function(x, y, z, success, fail) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                // 天地图影像瓦片URL
                const url = `https://t${(x + y) % 8}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}&tk=a1a21d2bd0571eb0160afff78a39319e`;
                
                img.onload = function() {
                    success(img);
                };
                
                img.onerror = function() {
                    console.error('天地图瓦片加载失败:', url);
                    fail();
                };
                
                img.src = url;
            },
            tileSize: 256
        });
        
        // 将天地图图层添加到地图并显示
        tiandituLayer.setMap(map);
        tiandituLayer.show();
        
        mapInitialized.value = true;
        updateMapData();
        
        console.log('PlotGPS地图初始化完成，天地图图层已加载');
    } catch (error) {
        console.error('Failed to initialize map:', error);
    }
};

const clearMapElements = () => {
    if (!map) return;
    
    if (polygon) {
        map.remove(polygon);
        polygon = null;
    }
    
    if (trackLine) {
        map.remove(trackLine);
        trackLine = null;
    }
    
    if (trackMarkers.length > 0) {
        map.remove(trackMarkers);
        trackMarkers = [];
    }
};

const drawFence = () => {
    if (!map) return;
    
    if (!props.fenceData || !props.fenceData.path || !Array.isArray(props.fenceData.path) || props.fenceData.path.length < 3) {
        return;
    }
    
    try {
        const path = props.fenceData.path.map(point => {
            if (!point || typeof point.lng !== 'number' || typeof point.lat !== 'number') {
                console.error('Invalid coordinate point:', point);
                return null;
            }
            return new AMap.LngLat(point.lng, point.lat);
        }).filter(Boolean);
        
        if (path.length < 3) {
            console.error('Not enough valid points to draw a polygon');
            return;
        }
        
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
    } catch (error) {
        console.error('Error drawing fence:', error);
    }
};

const drawTrackingData = () => {
    if (!map) return;
    
    if (!props.trackingData || !Array.isArray(props.trackingData) || props.trackingData.length === 0) {
        return;
    }
    
    try {
        const validPoints = props.trackingData.filter(point => 
            point && typeof point.lng === 'number' && typeof point.lat === 'number'
        );
        
        if (validPoints.length === 0) {
            return;
        }
        
        const path = validPoints.map(point => {
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
        
        validPoints.forEach((point, index) => {
            const marker = new AMap.Marker({
                position: new AMap.LngLat(point.lng, point.lat),
                content: `<div class="track-marker">${point.timestamp || index}</div>`,
                offset: new AMap.Pixel(-15, -15),
                zIndex: 110
            });
            
            map.add(marker);
            trackMarkers.push(marker);
        });
    } catch (error) {
        console.error('Error drawing tracking data:', error);
    }
};

const fitMapView = () => {
    if (!map) return;
    
    const elements = [];
    if (polygon) elements.push(polygon);
    if (trackLine) elements.push(trackLine);
    
    if (elements.length > 0) {
        try {
            map.setFitView(elements);
        } catch (error) {
            console.error('Error fitting map view:', error);
        }
    } else if (props.fenceData && props.fenceData.path && props.fenceData.path.length > 0) {
        const firstPoint = props.fenceData.path[0];
        if (firstPoint && firstPoint.lng && firstPoint.lat) {
            map.setCenter([firstPoint.lng, firstPoint.lat]);
        }
    }
};

const updateMapData = () => {
    if (!map || !mapInitialized.value) return;
    
    clearMapElements();
    drawFence();
    drawTrackingData();
    fitMapView();
};

watch(() => props.fenceData, () => {
    updateMapData();
}, { deep: true });

watch(() => props.trackingData, () => {
    updateMapData();
}, { deep: true });

const handleResize = () => {
    if (map) {
        map.resize();
    }
};

onMounted(() => {
    if (window.AMap) {
        initMap();
    } else {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.AMAPKEY}`;
        document.head.appendChild(script);
        
        script.onload = () => {
            initMap();
        };
        
        script.onerror = (error) => {
            console.error('Failed to load AMap script:', error);
        };
    }
    
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    
    if (map) {
        map.destroy();
        map = null;
    }
    
    window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.gps-plot {
    width: 100%;
    height: 100%;
    position: relative;

    .map-container {
        width: 100%;
        height: 100%;
        min-height: 200px;
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