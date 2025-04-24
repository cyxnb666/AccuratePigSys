<template>
  <div class="dashboard-container">
    <div id="map-container" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import mapConfig from '@/utils/map-config';

let map = null;
let satelliteLayer = null;

// 默认地图中心点和缩放级别
const defaultCenter = [116.397428, 39.90923]; // 北京
const defaultZoom = 11;

onMounted(() => {
  // 设置安全密钥
  window._AMapSecurityConfig = {
    securityJsCode: mapConfig.SecurityJsCode,
  };

  // 动态加载高德地图API脚本
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.AMAPKEY}&plugin=AMap.ToolBar,AMap.Scale`;
  document.head.appendChild(script);

  // 地图加载完成后初始化
  script.onload = () => {
    initMap();
  };
});

// 地图初始化
const initMap = () => {
  // 创建地图实例
  map = new AMap.Map('map-container', {
    viewMode: '3D',
    center: defaultCenter,
    zoom: defaultZoom,
    layers: [], // 先不设置图层，后面添加卫星图层
    showBuildingBlock: false, // 不显示楼块
  });

  // 创建卫星图层
  satelliteLayer = new AMap.TileLayer.Satellite({
    zooms: [3, 20], // 支持的缩放级别范围
    opacity: 1, // 透明度
  });

  // 将图层添加到地图
  map.add([satelliteLayer]);

  // 添加比例尺控件
  map.addControl(new AMap.Scale());

  // 添加工具条控件
  map.addControl(new AMap.ToolBar({
    position: 'RB' // 右下角
  }));
};

onUnmounted(() => {
  // 销毁地图实例
  if (map) {
    map.destroy();
    map = null;
  }
});
</script>

<style scoped>
.dashboard-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.map-container {
  flex: 1;
  height: 100%;
  width: 100%;
}
</style>