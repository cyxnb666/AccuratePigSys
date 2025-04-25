<template>
  <div class="dashboard-container">
    <!-- Add button in top right -->
    <div class="farm-detail-button">
      <a-button type="primary" @click="showDrawer">养殖场详情</a-button>
    </div>

    <div id="map-container" class="map-container"></div>

    <!-- Add drawer component -->
    <a-drawer title="养殖场详情" placement="right" :width="1000" :visible="drawerVisible" @close="closeDrawer"
      @afterVisibleChange="afterDrawerOpen">
      <farm-details-drawer v-if="drawerVisible" ref="farmDetailsRef" />
    </a-drawer>

  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import mapConfig from '@/utils/map-config';
import FarmDetailsDrawer from './components/FarmDetailsDrawer.vue';

let map = null;
let satelliteLayer = null;

// 默认地图中心点和缩放级别
const defaultCenter = [116.397428, 39.90923]; // 北京
const defaultZoom = 11;

const farmDetailsRef = ref(null);
const afterDrawerOpen = (visible) => {
  if (visible && farmDetailsRef.value) {
    // 给一点延迟确保抽屉完全打开
    setTimeout(() => {
      // 手动触发窗口resize事件以刷新图表
      window.dispatchEvent(new Event('resize'));
    }, 1);
  }
};

// 控制抽屉显示状态
const drawerVisible = ref(false);

// 显示抽屉
const showDrawer = () => {
  drawerVisible.value = true;
};

// 关闭抽屉
const closeDrawer = () => {
  drawerVisible.value = false;
};

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

.farm-detail-button {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
}
</style>