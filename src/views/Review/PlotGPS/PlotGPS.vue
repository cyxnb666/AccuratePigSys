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

// Function to initialize the map
const initMap = () => {
    console.log('Initializing map with ID:', containerId);
    
    if (!document.getElementById(containerId)) {
        console.error('Map container element not found');
        return;
    }
    
    try {
        // Setup AMap security configuration
        window._AMapSecurityConfig = {
            securityJsCode: mapConfig.SecurityJsCode,
        };
        
        map = new AMap.Map(containerId, {
            resizeEnable: true,
            center: [116.462, 39.996], // Default center
            zoom: 15
        });
        
        mapInitialized.value = true;
        console.log('Map initialized successfully');
        
        // After map is initialized, draw the fence and tracking data
        updateMapData();
    } catch (error) {
        console.error('Failed to initialize map:', error);
    }
};

// Function to clear all map elements
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

// Function to draw the fence
const drawFence = () => {
    if (!map) return;
    
    console.log('Drawing fence with path:', props.fenceData.path);
    
    // Validate fence data
    if (!props.fenceData || !props.fenceData.path || !Array.isArray(props.fenceData.path) || props.fenceData.path.length < 3) {
        console.log('Invalid fence data or not enough points for a polygon');
        return;
    }
    
    try {
        const path = props.fenceData.path.map(point => {
            if (!point || typeof point.lng !== 'number' || typeof point.lat !== 'number') {
                console.error('Invalid coordinate point:', point);
                return null;
            }
            return new AMap.LngLat(point.lng, point.lat);
        }).filter(Boolean); // Filter out any null values
        
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

// Function to draw the tracking data
const drawTrackingData = () => {
    if (!map) return;
    
    console.log('Drawing tracking data:', props.trackingData);
    
    // Validate tracking data
    if (!props.trackingData || !Array.isArray(props.trackingData) || props.trackingData.length === 0) {
        console.log('No tracking data available');
        return;
    }
    
    try {
        const validPoints = props.trackingData.filter(point => 
            point && typeof point.lng === 'number' && typeof point.lat === 'number'
        );
        
        if (validPoints.length === 0) {
            console.log('No valid tracking points');
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
        
        // Add markers for each point
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

// Function to adjust the map view to include all elements
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
        // If no elements added but we have fence data, set center to first point
        const firstPoint = props.fenceData.path[0];
        if (firstPoint && firstPoint.lng && firstPoint.lat) {
            map.setCenter([firstPoint.lng, firstPoint.lat]);
        }
    }
};

// Function to update the map with new data
const updateMapData = () => {
    if (!map || !mapInitialized.value) return;
    
    clearMapElements();
    drawFence();
    drawTrackingData();
    fitMapView();
};

// Watch for changes in props and update the map
watch(() => props.fenceData, () => {
    updateMapData();
}, { deep: true });

watch(() => props.trackingData, () => {
    updateMapData();
}, { deep: true });

// Handle window resize
const handleResize = () => {
    if (map) {
        map.resize();
    }
};

onMounted(() => {
    console.log('PlotGPS component mounted');
    
    // Load AMap script
    if (window.AMap) {
        console.log('AMap already loaded, initializing map');
        initMap();
    } else {
        console.log('Loading AMap script');
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.AMAPKEY}`;
        document.head.appendChild(script);
        
        script.onload = () => {
            console.log('AMap script loaded');
            initMap();
        };
        
        script.onerror = (error) => {
            console.error('Failed to load AMap script:', error);
        };
    }
    
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    console.log('PlotGPS component unmounted');
    
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