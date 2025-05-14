<template>
  <div class="dashboard-container">
    <dashboard-stats-panel class="stats-panel" @region-change="handleRegionChange" @farms-loaded="updateMapMarkers" />

    <div id="map-container" class="map-container"></div>

    <!-- <a-drawer title="养殖场详情" placement="right" :width="1000" :open="drawerVisible" @close="closeDrawer"
      @afterOpenChange="handleDrawerVisibleChange">
      <farm-details-drawer v-if="drawerVisible" :farmData="currentFarmData" ref="farmDetailsRef" />
    </a-drawer> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import mapConfig from '@/utils/map-config';
import FarmDetailsDrawer from './components/FarmDetailsDrawer.vue';
import DashboardStatsPanel from './components/DashboardStatsPanel.vue';
import { message } from 'ant-design-vue';

let map = null;
let markers = [];
let districtLayer = null;
let district = null; // 行政区查询实例
const farmDetailsRef = ref(null);

// 养殖场点位
const farmLocations = ref([]);

// 当前区域编码
const currentRegionCode = ref('');

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

// 处理区域变更
const handleRegionChange = async (regionCode) => {
  currentRegionCode.value = regionCode;

  // 更新区域边界显示和地图聚焦
  updateDistrictLayer(regionCode);
};

// 更新区域边界图层和聚焦到相应区域
const updateDistrictLayer = (adcode) => {
  if (!map) return;

  // 清除现有区域图层
  if (districtLayer) {
    map.remove(districtLayer);
    districtLayer = null;
  }

  // 使用行政区查询获取区域边界并聚焦
  if (!district) {
    district = new AMap.DistrictSearch({
      extensions: 'all',
      subdistrict: 1
    });
  }

  district.search(adcode, (status, result) => {
    if (status === 'complete') {
      // 获取区域边界信息
      const data = result.districtList[0];

      // 边界坐标数组
      const bounds = data.boundaries;

      if (bounds) {
        // 新的区域边界覆盖物
        const polygons = [];
        for (let i = 0; i < bounds.length; i++) {
          // 创建区域覆盖物
          const polygon = new AMap.Polygon({
            path: bounds[i],
            strokeWeight: 1,
            strokeColor: '#0091ea',
            fillColor: '#1791fc',
            fillOpacity: 0.3,
            zIndex: 10
          });
          polygons.push(polygon);
        }

        // 覆盖物到地图
        map.add(polygons);

        // 保存引用，以便后续清除
        districtLayer = polygons;

        // 获取区域中心点和适合的缩放级别，并聚焦地图
        map.setFitView(polygons, false, [60, 60, 60, 60]);

        // 确保缩放级别不会太小
        const currentZoom = map.getZoom();
        if (currentZoom < 7) {
          map.setZoom(7);
        }
      }
    } else {
      console.error('获取区域边界失败');
    }
  });
};

// 更新地图标记点
const updateMapMarkers = (farms) => {
  infoWindows.forEach(infoWindow => {
    infoWindow.close();
  });
  infoWindows = [];
  // 转换API返回的养殖场数据为地图标记点格式
  if (farms && Array.isArray(farms)) {
    farmLocations.value = farms.map(farm => ({
      id: farm.farmId,
      position: [parseFloat(farm.longitude) || 0, parseFloat(farm.latitude) || 0],
      name: farm.farmName,
      situation: farm.leaveCount > 0 ? "0" : "1", // 有存栏使用蓝色，无存栏使用红色，之后要改！！！！
      leaveCount: farm.leaveCount,
      farmData: farm // 保存原始数据，用于抽屉展示
    }));

    // 如果地图已初始化，添加标记点
    if (map) {
      addMarkers();
    }
  }
};

// 点击标记时的处理
const handleMarkerClick = (farmId) => {
  // 从已加载的养殖场数据中查找
  const farm = farmLocations.value.find(f => f.id === farmId);

  if (farm) {
    currentFarmData.value = farm.farmData;
    showDrawer();
  } else {
    message.error('养殖场数据不存在');
  }
};

const handleDrawerVisibleChange = (visible) => {
  if (visible && farmDetailsRef.value) {
    setTimeout(() => {
      farmDetailsRef.value.resizeCharts();
    }, 300);
  }
};

let infoWindows = [];

const addMarkers = () => {
  if (!map) return;

  // 清除现有标记
  markers.forEach(marker => {
    map.remove(marker);
  });
  markers = [];

  // 清除现有信息窗体
  infoWindows.forEach(infoWindow => {
    infoWindow.close();
  });
  infoWindows = [];

  // 添加新标记
  farmLocations.value.forEach(farm => {
    // 确保有有效的经纬度
    if (!farm.position[0] || !farm.position[1]) {
      console.warn(`养殖场 ${farm.name} 缺少有效的经纬度信息`);
      return;
    }

    // 根据situation参数选择标记颜色
    const markerColor = farm.situation === "1" ? 'r' : 'b';

    // 创建标记点
    const marker = new AMap.Marker({
      position: farm.position,
      title: farm.name,
      icon: new AMap.Icon({
        image: `https://webapi.amap.com/theme/v1.3/markers/n/mark_${markerColor}.png`,
        size: new AMap.Size(32, 32),
        imageSize: new AMap.Size(32, 32)
      }),
      offset: new AMap.Pixel(-16, -32),
      zoom: 13
    });

    // 信息窗体
    const info = new AMap.InfoWindow({
      isCustom: true,
      content: createInfoContent(farm),
      anchor: 'bottom-center',
      offset: new AMap.Pixel(0, -35),
      autoMove: false,
      closeWhenClickMap: false
    });

    // 默认打开信息窗体
    info.open(map, farm.position);

    // 存储信息窗体引用
    infoWindows.push(info);
    marker.on('click', () => {
      handleMarkerClick(farm.id);
    });

    // 将标记添加到地图
    map.add(marker);

    // 存储标记引用
    markers.push(marker);
  });
};

// 创建信息窗体内容的
const createInfoContent = (farm) => {
  // 设置存栏量显示文本
  const countText = farm.leaveCount ? `${farm.leaveCount}头` : '0头';

  // 创建自定义信息窗体HTML
  const html = `
    <div class="map-info-window">
      ${farm.name}: ${countText}
    </div>
  `;

  return html;
};

onMounted(() => {
  // 设置安全密钥
  window._AMapSecurityConfig = {
    securityJsCode: mapConfig.SecurityJsCode,
  };

  // 动态加载高德地图API脚本
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.AMAPKEY}&plugin=AMap.ToolBar,AMap.Scale,AMap.DistrictSearch`;
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
    center: [104.07, 30.67], // 成都
    zoom: 7, // 缩小级别以显示整个四川省
    mapStyle: "amap://styles/blue", // 使用靛青蓝展示自定义图层
    showBuildingBlock: false, // 不显示楼块
    resizeEnable: true, // 是否监控地图容器尺寸变化
    pitch: 0, // 将俯仰角设为0，以便从正上方看地图
  });

  // 比例尺控件
  map.addControl(new AMap.Scale({
    position: 'LB'
  }));

  // 工具条控件
  map.addControl(new AMap.ToolBar({
    position: 'RB' // 右下角
  }));

  // 默认显示四川省
  updateDistrictLayer('510000');
};

onUnmounted(() => {
  // 销毁信息窗体
  infoWindows.forEach(infoWindow => {
    infoWindow.close();
  });
  infoWindows = [];

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

:deep(.map-info-window) {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 110;
  /* 确保显示在标记点上层 */
}

:deep(.amap-info) {
  z-index: 110;
  /* 提高信息窗体的层叠顺序 */
}

/* 移除信息窗体的默认样式 */
:deep(.amap-info-content) {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

:deep(.amap-info-close) {
  display: none;
  /* 隐藏关闭按钮 */
}

:deep(.amap-info-sharp) {
  display: none;
  /* 隐藏尖角 */
}
</style>