<template>
    <div class="electronic-fence-map">
        <div id="mapContainer" class="map-container">
            <!-- 搜索框 -->
            <div class="search-box">
                <img style="width: 25px; height: 25px; padding: 5px" src="@/assets/images/dashboard.svg" alt="" />
                <div class="input-box">
                    <input id="searchInput" placeholder="请输入关键字搜索" />
                </div>
            </div>

            <!-- 图层切换 -->
            <div class="layer-switcher">
                <div class="layer-options" style="flex-direction: column; top: 18px">
                    <a-button :type="!useWmsLayer ? 'primary' : 'default'" @click="switchLayer">高德标准图层</a-button>
                    <a-button :type="useWmsLayer ? 'primary' : 'default'" @click="switchLayer">天地图图层</a-button>
                </div>
                <div class="road-network" :style="{ left: useSatellite ? '0' : '100px' }">
                    <a-checkbox v-model:checked="showRoadNet" @change="toggleRoadNet">路 网</a-checkbox>
                </div>
                <div class="satellite-toggle" @click="toggleSatellite"
                    :style="{ color: useSatellite ? '#5276E5' : '#565656' }">
                    <div class="icon-wrapper">
                        <dashboard-outlined />
                    </div>
                    <div>卫 星</div>
                </div>
            </div>

            <!-- 操作栏 -->
            <div class="map-options">
                <a-popover placement="top" title="提示" content="新增勾画地块前,请先保存之前所勾画的地块!" trigger="hover">
                    <a-button type="primary" @click="startDrawing">勾 画</a-button>
                </a-popover>
                <a-button type="primary" @click="editSelectedPolygon" :disabled="!selectedFence"
                    style="margin-left: 8px">编辑区域</a-button>
                <a-button type="primary" @click="deleteSelectedPolygon" :disabled="!selectedFence" danger
                    style="margin-left: 8px">删除地块</a-button>
                <a-button type="primary" @click="toggleFenceStatus" :disabled="!selectedFence"
                    style="margin-left: 8px">{{ selectedFence && !selectedFence.disabled ? '地块失效' : '地块恢复' }}</a-button>
                <a-button type="primary" @click="toggleFullscreen" style="margin-left: 8px">{{ isFullscreen ? '退出全屏' :
                    '全屏' }}</a-button>
                <a-popover placement="top" title="操作指南" trigger="hover">
                    <template #content>
                        <p><b>1.</b> 点击"勾画"按钮开始地块勾画</p>
                        <p><b>2.</b> 双击完成地块勾画并输入名称</p>
                        <p><b>3.</b> 点击"编辑区域"可修改已选中地块的形状</p>
                        <p><b>4.</b> 点击"删除地块"可删除已选中地块</p>
                        <p><b>5.</b> 点击"地块失效/恢复"可禁用或启用地块</p>
                        <p><b>6.</b> 双击地块名称可编辑地块信息</p>
                    </template>
                    <a-button type="link" style="margin-left: 8px">操作指南</a-button>
                </a-popover>
            </div>

            <!-- 地块信息展示 -->
            <div class="plot-info" v-if="selectedFence">
                <div class="statistic">
                    <div class="title">面积</div>
                    <div class="value">{{ calculateArea(selectedFence.path) }}㎡</div>
                </div>
                <a-divider type="vertical"></a-divider>
                <div class="statistic">
                    <div class="title">周长</div>
                    <div class="value">{{ calculatePerimeter(selectedFence.path) }}米</div>
                </div>
                <a-divider type="vertical"></a-divider>
                <div class="statistic">
                    <div class="title">面积</div>
                    <div class="value">{{ squareMetersToMu(calculateArea(selectedFence.path)) }}亩</div>
                </div>
            </div>

            <!-- 地块列表 -->
            <div class="fence-list">
                <div v-for="(fence, index) in fenceList" :key="index" class="fence-item"
                    :class="{ 'selected': selectedFence && selectedFence.id === fence.id, 'disabled': fence.disabled }"
                    @click="selectFence(fence)" @dblclick="editFenceInfo(fence)">
                    {{ fence.name }}
                </div>
            </div>
        </div>

        <!-- 新增/编辑围栏对话框 -->
        <a-modal :title="isEditingFence ? '编辑电子围栏' : '新增电子围栏'" v-model:open="fenceDialogVisible" :destroyOnClose="true"
            @ok="saveFence" @cancel="cancelFence">
            <a-form :model="currentFence" layout="vertical">
                <a-form-item label="围栏名称" required>
                    <a-input v-model:value="currentFence.name" placeholder="请输入围栏名称" />
                </a-form-item>
                <a-form-item label="备注">
                    <a-textarea v-model:value="currentFence.remark" placeholder="请输入备注信息" :rows="4" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { DashboardOutlined } from '@ant-design/icons-vue';
import mapConfig from '@/utils/map-config';

// 定义接口
interface Fence {
    id: string;
    name: string;
    remark?: string;
    path: any[];
    polygon?: any;
    disabled?: boolean;
}

// 状态变量
const mapInstance = ref<any>(null);
const mouseTool = ref<any>(null);
const polyEditor = ref<any>(null);
const isDrawing = ref(false);
const isEditing = ref(false);
const isFullscreen = ref(false);
const useWmsLayer = ref(false);
const useSatellite = ref(true);
const showRoadNet = ref(true);
const fenceDialogVisible = ref(false);
const isEditingFence = ref(false);
const tempPolygon = ref<any>(null);
const wmsLayer = ref<any>(null);
const satelliteLayer = ref<any>(null);
const roadNetLayer = ref<any>(null);
const fenceList = ref<Fence[]>([]);
const selectedFence = ref<Fence | null>(null);
const currentFence = reactive<Partial<Fence>>({
    id: '',
    name: '',
    remark: '',
    path: []
});

// 多边形样式
const polygonStyle = {
    normal: {
        strokeColor: '#7F702C',
        fillColor: '#B35656',
        fillOpacity: 0.5,
        strokeOpacity: 1,
        strokeWeight: 2
    },
    selected: {
        strokeColor: '#7F702C',
        fillColor: '#7bccc4',
        fillOpacity: 0.7,
        strokeOpacity: 1,
        strokeWeight: 2
    },
    disabled: {
        strokeColor: '#999999',
        fillColor: '#cccccc',
        fillOpacity: 0.5,
        strokeOpacity: 0.8,
        strokeWeight: 2
    }
};

// 地图初始化
const initMap = async () => {
    // 动态加载高德地图API
    if (typeof AMap === 'undefined') {
        await loadAMap();
    }

    mapInstance.value = new AMap.Map('mapContainer', {
        zoom: 13,
        resizeEnable: true,
        rotateEnable: true,
        viewMode: '2D',
        center: [104.06, 30.67], // 默认中心点，可根据需要调整
    });

    // 添加比例尺控件
    mapInstance.value.addControl(new AMap.Scale());

    // 添加工具条控件
    mapInstance.value.addControl(new AMap.ToolBar({
        position: { right: '30px', bottom: '40px' }
    }));

    // 初始化地图图层
    initMapLayers();

    // 初始化绘制工具
    mouseTool.value = new AMap.MouseTool(mapInstance.value);
    mouseTool.value.on('draw', onDrawComplete);

    // 初始化搜索功能
    initSearchBox();

    // 初始化位置定位
    initGeolocation();
};

// 动态加载高德地图
const loadAMap = () => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.AMAPKEY}&plugin=AMap.MouseTool,AMap.PolyEditor,AMap.Scale,AMap.ToolBar,AMap.Autocomplete,AMap.PlaceSearch,AMap.Geolocation`;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// 初始化地图图层
const initMapLayers = () => {
    // 卫星图层
    satelliteLayer.value = new AMap.TileLayer.Satellite();
    satelliteLayer.value.setMap(mapInstance.value);

    // 路网图层
    roadNetLayer.value = new AMap.TileLayer.RoadNet();
    roadNetLayer.value.setMap(mapInstance.value);

    // 天地图图层
    wmsLayer.value = new AMap.TileLayer.WMTS({
        url: 'https://t0.tianditu.gov.cn/img_w/wmts',
        blend: false,
        tileSize: 256,
        params: {
            SERVICE: 'WMTS',
            VERSION: '1.0.0',
            REQUEST: 'GetTile',
            LAYER: 'vec',
            STYLE: 'default',
            TILEMATRIXSET: 'w',
            FORMAT: 'tiles',
            tk: '923b4e88535bce69174acdbc23bcc0bc', // 天地图token
        }
    });

    // 默认隐藏天地图图层
    wmsLayer.value.hide();
};

// 初始化搜索功能
const initSearchBox = () => {
    // 城市查询
    const citySearch = new AMap.CitySearch();
    citySearch.getLocalCity((status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
            // 设置自动完成控件参数
            const autoOptions = {
                input: 'searchInput',
                city: result.city
            };

            // 创建自动完成控件
            const autoComplete = new AMap.Autocomplete(autoOptions);

            // 创建地点查询控件
            const placeSearch = new AMap.PlaceSearch({
                map: mapInstance.value,
                pageSize: 1
            });

            // 注册选择事件
            AMap.event.addListener(autoComplete, 'select', (e: any) => {
                placeSearch.setCity(e.poi.adcode);
                placeSearch.search(e.poi.name);
            });
        } else {
            message.error('定位失败');
        }
    });
};

// 初始化位置定位
const initGeolocation = () => {
    const geolocation = new AMap.Geolocation({
        position: { right: '30px', bottom: '80px' },
        showButton: true,
        buttonPosition: 'RB',
        enableHighAccuracy: true,
        timeout: 10000,
        zoomToAccuracy: true,
        GeoLocationFirst: true
    });

    mapInstance.value.addControl(geolocation);

    // 获取当前位置
    geolocation.getCurrentPosition((status: string, result: any) => {
        if (status === 'complete') {
            mapInstance.value.setZoomAndCenter(15, result.position);
        }
    });
};

// 开始绘制多边形
const startDrawing = () => {
    if (isEditing.value) {
        message.warning('请先完成当前编辑');
        return;
    }

    isDrawing.value = true;

    // 关闭之前的编辑器
    if (polyEditor.value) {
        polyEditor.value.close();
    }

    // 启动多边形绘制
    mouseTool.value.polygon({
        strokeColor: polygonStyle.normal.strokeColor,
        strokeOpacity: polygonStyle.normal.strokeOpacity,
        strokeWeight: polygonStyle.normal.strokeWeight,
        fillColor: polygonStyle.normal.fillColor,
        fillOpacity: polygonStyle.normal.fillOpacity
    });
};

// 绘制完成回调
const onDrawComplete = (e: any) => {
    // 只处理多边形绘制
    if (e.obj && e.obj.CLASS_NAME === 'AMap.Polygon') {
        isDrawing.value = false;

        // 关闭绘制工具
        mouseTool.value.close(false);

        // 保存临时多边形
        tempPolygon.value = e.obj;

        // 获取多边形路径
        const path = e.obj.getPath();

        // 显示添加围栏对话框
        currentFence.id = '';
        currentFence.name = `围栏${fenceList.value.length + 1}`;
        currentFence.remark = '';
        currentFence.path = path;

        isEditingFence.value = false;
        fenceDialogVisible.value = true;
    }
};

// 保存围栏
const saveFence = () => {
    if (!currentFence.name) {
        message.error('请输入围栏名称');
        return;
    }

    if (isEditingFence.value && selectedFence.value) {
        // 更新已有围栏
        const index = fenceList.value.findIndex(f => f.id === selectedFence.value?.id);
        if (index !== -1) {
            // 更新名称和备注
            fenceList.value[index].name = currentFence.name || '';
            fenceList.value[index].remark = currentFence.remark || '';

            message.success('围栏信息已更新');
        }
    } else {
        // 添加新围栏
        const newFence: Fence = {
            id: `fence_${Date.now()}`,
            name: currentFence.name || `围栏${fenceList.value.length + 1}`,
            remark: currentFence.remark || '',
            path: tempPolygon.value.getPath(),
            polygon: tempPolygon.value,
            disabled: false
        };

        // 设置多边形的extData，关联到围栏对象
        tempPolygon.value.setExtData({ fenceId: newFence.id });

        // 添加点击事件
        tempPolygon.value.on('click', () => selectFenceByPolygon(newFence.id));

        // 添加到围栏列表
        fenceList.value.push(newFence);

        // 选中新添加的围栏
        selectFence(newFence);

        message.success('围栏已添加');
    }

    // 关闭对话框
    fenceDialogVisible.value = false;
    tempPolygon.value = null;
};

// 取消围栏操作
const cancelFence = () => {
    if (!isEditingFence.value && tempPolygon.value) {
        // 如果是新添加的围栏，取消时移除临时多边形
        mapInstance.value.remove(tempPolygon.value);
    }

    fenceDialogVisible.value = false;
    tempPolygon.value = null;
};

// 选择围栏
const selectFence = (fence: Fence) => {
    // 取消之前选中的围栏样式
    if (selectedFence.value && selectedFence.value.id !== fence.id) {
        const prevPolygon = fenceList.value.find(f => f.id === selectedFence.value?.id)?.polygon;
        if (prevPolygon) {
            const style = prevPolygon.disabled ? polygonStyle.disabled : polygonStyle.normal;
            prevPolygon.setOptions({
                strokeColor: style.strokeColor,
                fillColor: style.fillColor,
                fillOpacity: style.fillOpacity
            });
        }
    }

    // 更新选中的围栏
    selectedFence.value = fence;

    // 设置选中样式
    if (fence.polygon) {
        fence.polygon.setOptions({
            strokeColor: polygonStyle.selected.strokeColor,
            fillColor: polygonStyle.selected.fillColor,
            fillOpacity: polygonStyle.selected.fillOpacity
        });

        // 地图居中到选中的围栏
        mapInstance.value.setFitView([fence.polygon]);
    }
};

// 通过多边形找到并选中围栏
const selectFenceByPolygon = (fenceId: string) => {
    const fence = fenceList.value.find(f => f.id === fenceId);
    if (fence) {
        selectFence(fence);
    }
};

// 编辑围栏信息
const editFenceInfo = (fence: Fence) => {
    if (fence.disabled) {
        message.warning('已失效的围栏不能编辑');
        return;
    }

    // 设置当前编辑的围栏
    currentFence.id = fence.id;
    currentFence.name = fence.name;
    currentFence.remark = fence.remark || '';

    isEditingFence.value = true;
    fenceDialogVisible.value = true;
};

// 编辑选中的多边形
const editSelectedPolygon = () => {
    if (!selectedFence.value) {
        message.warning('请先选择一个围栏');
        return;
    }

    if (selectedFence.value.disabled) {
        message.warning('已失效的围栏不能编辑');
        return;
    }

    if (isDrawing.value) {
        message.warning('请先完成当前绘制');
        return;
    }

    isEditing.value = true;

    // 创建多边形编辑器
    polyEditor.value = new AMap.PolyEditor(mapInstance.value, selectedFence.value.polygon);

    // 开始编辑
    polyEditor.value.open();

    // 监听编辑结束事件
    polyEditor.value.on('end', (event: any) => {
        isEditing.value = false;

        // 更新围栏路径
        const path = selectedFence.value?.polygon.getPath();
        if (selectedFence.value && path) {
            selectedFence.value.path = path;
        }
    });

    message.info('正在编辑围栏形状，点击地图空白处完成编辑');
};

// 删除选中的多边形
const deleteSelectedPolygon = () => {
    if (!selectedFence.value) {
        message.warning('请先选择一个围栏');
        return;
    }

    // 移除多边形
    if (selectedFence.value.polygon) {
        mapInstance.value.remove(selectedFence.value.polygon);
    }

    // 从列表中移除
    fenceList.value = fenceList.value.filter(f => f.id !== selectedFence.value?.id);

    message.success('围栏已删除');
    selectedFence.value = null;
};

// 切换围栏状态（启用/禁用）
const toggleFenceStatus = () => {
    if (!selectedFence.value) {
        message.warning('请先选择一个围栏');
        return;
    }

    // 切换状态
    selectedFence.value.disabled = !selectedFence.value.disabled;

    // 更新样式
    if (selectedFence.value.polygon) {
        const style = selectedFence.value.disabled ? polygonStyle.disabled : polygonStyle.selected;
        selectedFence.value.polygon.setOptions({
            strokeColor: style.strokeColor,
            fillColor: style.fillColor,
            fillOpacity: style.fillOpacity
        });
    }

    message.success(selectedFence.value.disabled ? '围栏已失效' : '围栏已恢复');
};

// 切换全屏
const toggleFullscreen = () => {
    const mapElement = document.querySelector('.electronic-fence-map') as HTMLElement;

    if (!isFullscreen.value) {
        // 进入全屏
        if (mapElement.requestFullscreen) {
            mapElement.requestFullscreen();
        } else if ((mapElement as any).webkitRequestFullscreen) {
            (mapElement as any).webkitRequestFullscreen();
        } else if ((mapElement as any).msRequestFullscreen) {
            (mapElement as any).msRequestFullscreen();
        }
    } else {
        // 退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
        }
    }

    isFullscreen.value = !isFullscreen.value;
};

// 切换图层
const switchLayer = () => {
    useWmsLayer.value = !useWmsLayer.value;

    if (useWmsLayer.value) {
        wmsLayer.value.show();
    } else {
        wmsLayer.value.hide();
    }
};

// 切换卫星图层
const toggleSatellite = () => {
    useSatellite.value = !useSatellite.value;

    if (useSatellite.value) {
        satelliteLayer.value.show();
    } else {
        satelliteLayer.value.hide();
    }
};

// 切换路网图层
const toggleRoadNet = (checked: boolean) => {
    if (checked) {
        roadNetLayer.value.show();
    } else {
        roadNetLayer.value.hide();
    }
};

// 计算面积（平方米）
const calculateArea = (path: any[]): number => {
    if (!path || path.length < 3) return 0;

    return AMap.GeometryUtil.ringArea(path);
};

// 计算周长（米）
const calculatePerimeter = (path: any[]): number => {
    if (!path || path.length < 2) return 0;

    let perimeter = 0;
    for (let i = 0; i < path.length; i++) {
        const nextIndex = (i + 1) % path.length;
        perimeter += AMap.GeometryUtil.distance(path[i], path[nextIndex]);
    }

    return perimeter;
};

// 平方米转亩
const squareMetersToMu = (squareMeters: number): number => {
    return squareMeters / 666.7;
};

// 生命周期钩子
onMounted(() => {
    initMap();

    // 监听全屏变化事件
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
});

onUnmounted(() => {
    // 移除全屏变化事件监听
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    document.removeEventListener('mozfullscreenchange', onFullscreenChange);
    document.removeEventListener('MSFullscreenChange', onFullscreenChange);

    // 销毁地图实例
    if (mapInstance.value) {
        mapInstance.value.destroy();
    }
});

// 全屏变化事件处理
const onFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
};

// 导出方法给父组件使用
defineExpose({
    getFenceList: () => fenceList.value
});
</script>

<style lang="scss" scoped>
.electronic-fence-map {
    position: relative;
    width: 100%;
    height: 400px;
    border: 1px solid #e8e8e8;

    &:fullscreen {
        width: 100vw;
        height: 100vh;
    }

    .map-container {
        width: 100%;
        height: 100%;
    }

    .search-box {
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        align-items: center;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        z-index: 10;

        .input-box {
            input {
                width: 200px;
                height: 35px;
                border: none;
                outline: none;
                padding: 0 10px;
            }
        }
    }

    .layer-switcher {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10;
        display: flex;

        .layer-options {
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            padding: 5px;
            margin-right: 10px;

            .ant-btn {
                margin: 3px 0;
            }
        }

        .road-network {
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            padding: 8px 10px;
            margin-right: 10px;
            transition: left 0.3s;
        }

        .satellite-toggle {
            display: flex;
            align-items: center;
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            padding: 8px 10px;
            cursor: pointer;

            .icon-wrapper {
                margin-right: 5px;
            }
        }
    }

    .map-options {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        padding: 10px;
        z-index: 10;
    }

    .plot-info {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        background: #fff;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        padding: 10px;
        z-index: 9;

        .statistic {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0 15px;

            .title {
                font-size: 14px;
                color: rgba(0, 0, 0, 0.85);
            }

            .value {
                font-size: 16px;
                font-weight: 600;
                color: #5276E5;
            }
        }
    }

    .fence-list {
        position: absolute;
        top: 80px;
        left: 10px;
        max-width: 200px;
        max-height: calc(100% - 180px);
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        padding: 10px;
        z-index: 9;

        .fence-item {
            padding: 8px 12px;
            margin-bottom: 5px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
                background: #f0f2f5;
            }

            &.selected {
                background: #e6f7ff;
                border-left: 3px solid #5276E5;
            }

            &.disabled {
                color: #999;
                background: #f5f5f5;
                text-decoration: line-through;
            }
        }
    }
}
</style>