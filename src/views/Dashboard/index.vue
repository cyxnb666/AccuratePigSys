<template>
  <div class="dashboard-container">
    <dashboard-stats-panel class="stats-panel" />

    <div id="map-container" class="map-container"></div>

    <a-drawer title="养殖场详情" placement="right" :width="1000" :open="drawerVisible" @close="closeDrawer">
      <farm-details-drawer v-if="drawerVisible" :farmData="currentFarmData" />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import mapConfig from '@/utils/map-config';
import FarmDetailsDrawer from './components/FarmDetailsDrawer.vue';
import DashboardStatsPanel from './components/DashboardStatsPanel.vue';

let map = null;
let markers = [];
let districtLayer = null;

// 默认地图中心点和缩放级别 - 设置为四川省中心
const defaultCenter = [104.07, 30.67]; // 成都
const defaultZoom = 7; // 缩小级别以显示整个四川省

// 模拟的养殖场点位
const farmLocations = [
  { id: 1, position: [104.101698, 30.677180], name: "XXXXX养殖场1" },
  { id: 2, position: [104.066507, 30.669798], name: "XXXXX养殖场2" }
];

// 当前选中的养殖场数据
const currentFarmData = ref(null);

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

// 模拟API调用获取养殖场详情
const fetchFarmData = async (farmId) => {
  // 这里是模拟的API调用，实际项目中会替换为真实的API请求
  console.log(`Fetching data for farm ID: ${farmId}`);

  // 模拟异步请求
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: farmId,
        name: `XXXXX养殖场${farmId}`,
        district: "四川省成都市武侯区",
        address: "XXXXXXXXXXXXXXXXXXXXXXX",
        contactPerson: "张三",
        contactPhone: "15508280883"
      });
    }, 500);
  });
};

// 点击标记时的处理函数
const handleMarkerClick = async (farmId) => {
  // 调用API获取数据
  const farmData = await fetchFarmData(farmId);

  // 更新当前养殖场数据
  currentFarmData.value = farmData;

  // 打开抽屉
  showDrawer();
};

// 添加标记到地图
const addMarkers = () => {
  if (!map) return;

  // 清除现有标记
  markers.forEach(marker => {
    map.remove(marker);
  });
  markers = [];

  // 添加新标记
  farmLocations.forEach(farm => {
    // 创建标记点
    const marker = new AMap.Marker({
      position: farm.position,
      title: farm.name,
      icon: new AMap.Icon({
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        size: new AMap.Size(32, 32),
        imageSize: new AMap.Size(32, 32)
      }),
      offset: new AMap.Pixel(-16, -32),
      zoom: 13
    });

    // 添加点击事件
    marker.on('click', () => {
      handleMarkerClick(farm.id);
    });

    // 将标记添加到地图
    map.add(marker);

    // 存储标记引用
    markers.push(marker);
  });
};

// 添加四川省行政区划
const addSichuanDistrict = () => {
  // 四川省的adcode为510000
  districtLayer = new AMap.DistrictLayer({
    zIndex: 10,
    adcode: '510000', // 四川省的行政区编码
    depth: 1,         // 显示省级下面一级行政区划
    styles: {
      'fill': '#2C5597',         // 填充色
      'province-stroke': '#2C5597', // 省界颜色
      'city-stroke': '#2C5597',  // 市级边界
      'county-stroke': '#2C5597', // 区县边界
      'fill-opacity': 0.6       // 填充透明度
    }
  });

  // 将行政区划图层添加到地图
  map.add(districtLayer);

  // 调整视图以聚焦四川省
  map.setZoomAndCenter(7, [104.07, 30.67]);
};

onMounted(() => {
  // 设置安全密钥
  window._AMapSecurityConfig = {
    securityJsCode: mapConfig.SecurityJsCode,
  };

  // 动态加载高德地图API脚本
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.AMAPKEY}&plugin=AMap.ToolBar,AMap.Scale,AMap.DistrictLayer`;
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
    mapStyle: "amap://styles/blue", // 使用暗色样式更好展示自定义图层
    showBuildingBlock: false, // 不显示楼块
    resizeEnable: true, // 是否监控地图容器尺寸变化
    pitch: 0, // 将俯仰角设为0，以便从正上方看地图
  });

  // 添加比例尺控件
  map.addControl(new AMap.Scale({
    position: 'LB'
  }));

  // 添加工具条控件
  map.addControl(new AMap.ToolBar({
    position: 'RB' // 右下角
  }));

  // 添加四川省行政区划
  addSichuanDistrict();

  // 添加标记点
  addMarkers();
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
  position: relative;
}

.stats-panel {
  z-index: 10;
  margin: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  height: auto;
}

.map-container {
  flex: 1;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.farm-detail-button {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
}
</style>