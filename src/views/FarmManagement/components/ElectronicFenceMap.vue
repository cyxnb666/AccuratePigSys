<template>
    <div class="electronic-fence-map" ref="mapContainer">
        <div id="container" class="map-container"></div>
        <div id="myPageTop" class="search-panel">
            <table>
                <tbody>
                    <tr>
                        <td>
                            <label>请输入地址搜索：</label>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input id="tipinput" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 图层切换按钮 -->
        <div class="layer-switcher">
            <div class="layer-options">
                <a-button :type="!useWmsLayer ? 'primary' : 'default'" @click="switchLayer">高德标准图层</a-button>
                <a-button :type="useWmsLayer ? 'primary' : 'default'" @click="switchLayer"
                    style="margin-top: 8px">天地图图层</a-button>
            </div>
        </div>

        <!-- 操作栏 -->
        <div class="map-options" v-if="props.showToolbar">
            <a-button type="primary" @click="createPolygon">勾 画</a-button>
            <a-button type="primary" danger @click="deleteSelectedPolygon" :disabled="!selectedPolygon"
                style="margin-left: 8px">删除地块</a-button>
            <a-button type="primary" @click="finishEditing"
                :disabled="!isEditing || !selectedPolygon || (selectedPolygon && selectedPolygon.isDisabled)"
                style="margin-left: 8px">编辑</a-button>
            <!-- 地块失效/恢复按钮 -->
            <a-button type="primary" :disabled="!selectedPolygon" @click="toggleDisablePolygon"
                style="margin-left: 8px">
                {{ selectedPolygon && selectedPolygon.isDisabled ? '地块恢复' : '地块失效' }}
            </a-button>
            <a-button type="primary" @click="toggleFullscreen" style="margin-left: 8px">{{ isFullscreen ? '退出全屏' : '全屏'
            }}</a-button>
            <a-popover placement="top" title="操作指南" trigger="hover" :getPopupContainer="getContainer">
                <template #content>
                    <p><b>1.</b> 点击"勾画"按钮开始地块勾画</p>
                    <p><b>2.</b> 双击完成地块勾画</p>
                    <p><b>3.</b> 单击选中地块后可点击"地块失效"使其不可编辑</p>
                    <p><b>4.</b> 单击选中失效地块后可点击"地块恢复"恢复编辑功能</p>
                    <p><b>5.</b> 单击选中地块后可点击"删除地块"功能</p>
                    <p><b>6.</b> 双击选中地块后可修改地块区域和点击"编辑"功能修改名称及备注</p>
                </template>
                <a-button type="link" style="margin-left: 8px">操作指南</a-button>
            </a-popover>
        </div>

        <!-- 电子围栏对话框 -->
        <a-modal v-model:visible="fenceDialogVisible" :title="isEditMode ? '编辑电子围栏' : '新增电子围栏'" @ok="handleFenceConfirm"
            @cancel="handleFenceCancel" :getContainer="modalContainer">
            <a-form :model="fenceForm" :rules="fenceRules" ref="fenceFormRef" layout="vertical">
                <a-form-item name="name" label="围栏名称" :rules="[{ required: true, message: '请输入围栏名称!' }]">
                    <a-input v-model:value="fenceForm.name" placeholder="请输入围栏名称" show-count :maxlength="200" />
                </a-form-item>
                <a-form-item name="remark" label="备注">
                    <a-textarea v-model:value="fenceForm.remark" placeholder="请输入备注信息" show-count :maxlength="500" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive, computed } from 'vue';
import mapConfig from '@/utils/map-config';
import { message, Modal } from 'ant-design-vue';
import { checkCanRemoveFence } from '../api';

let map = null;
let polyEditor = null;
const useWmsLayer = ref(false);
const wmsLayer = ref(null);
const isFullscreen = ref(false);
const isEditing = ref(false);
const selectedPolygon = ref(null);
const polygons = ref([]);
const labels = ref([]);  // 存储围栏标签
const isEditMode = ref(false); // 是否为编辑模式

const props = defineProps({
    showToolbar: {
        type: Boolean,
        default: false
    }
});
// 电子围栏对话框相关
const fenceDialogVisible = ref(false);
const fenceFormRef = ref(null);
const fenceForm = reactive({
    name: '',
    remark: '',
});
const fenceRules = {
    name: [{ required: true, message: '请输入围栏名称!', trigger: 'blur' }]
};
const tempPolygon = ref(null); // 临时存储当前编辑的多边形

const modalContainer = computed(() => {
    return isFullscreen.value
        ? () => document.querySelector('.electronic-fence-map')
        : undefined; // 默认为document.body
});
const mapContainer = ref(null);

const getContainer = () => {
    return mapContainer.value || document.body;
};
onMounted(() => {
    // 设置安全密钥
    window._AMapSecurityConfig = {
        securityJsCode: mapConfig.SecurityJsCode,
    };

    // 动态加载高德地图API脚本
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapConfig.AMAPKEY}&plugin=AMap.PlaceSearch,AMap.AutoComplete,AMap.PolygonEditor`;
    document.head.appendChild(script);

    // 地图加载完成后初始化
    script.onload = () => {
        initMap();
    };

    // 监听全屏变化事件
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
});

// 地图初始化
const initMap = () => {
    // 地图加载
    map = new AMap.Map("container", {
        resizeEnable: true,
        center: [116.471354, 39.994257], // 默认中心点
        zoom: 14
    });

    // 初始化图层
    initMapLayers();

    // 初始化多边形编辑器
    polyEditor = new AMap.PolygonEditor(map);

    // 监听多边形添加事件
    polyEditor.on('add', function (data) {
        const polygon = data.target;

        // 初始化为非禁用状态
        polygon.isDisabled = false;

        polygons.value.push(polygon);

        // 添加可吸附的多边形
        polyEditor.addAdsorbPolygons(polygon);

        // 获取并打印多边形的所有点
        const path = polygon.getPath();
        console.log('多边形点的经纬度:');
        path.forEach((point, index) => {
            console.log(`点${index + 1}: 经度=${point.lng}, 纬度=${point.lat}`);
        });

        // 双击多边形进入编辑状态
        polygon.on('dblclick', (e) => {
            // 阻止事件冒泡，避免地图也响应双击事件
            if (e && e.originalEvent) {
                e.originalEvent.stopPropagation();
            }

            selectPolygon(polygon);

            // 明确检查isDisabled属性
            if (polygon.isDisabled === true) {
                console.log('地块处于失效状态，无法编辑');
                message.warning('此地块已失效，不可编辑');
                return;
            }

            startEditing();
        });

        // 点击多边形选中
        polygon.on('click', () => {
            selectPolygon(polygon);

            // 重新打印选中多边形的经纬度点
            const currentPath = polygon.getPath();
            console.log('选中多边形的点:');
            currentPath.forEach((point, index) => {
                console.log(`点${index + 1}: 经度=${point.lng}, 纬度=${point.lat}`);
            });
        });

        // 在多边形添加后立即打开对话框
        selectPolygon(polygon);
        tempPolygon.value = polygon;

        // 确保多边形有唯一标识
        if (!polygon.__uid) {
            polygon.__uid = Date.now().toString();
        }

        // 完成创建后，重置标志 - 放在这里，在打开对话框前
        isCreatingNewPolygon.value = false;

        // 设置为新增模式
        isEditMode.value = false;

        // 显示新增电子围栏对话框
        fenceForm.name = '';
        fenceForm.remark = '';
        fenceDialogVisible.value = true;
    });

    // 监听编辑结束事件，确保获取最新的编辑后的多边形点
    polyEditor.on('end', function (event) {
        if (selectedPolygon.value) {
            const editedPath = selectedPolygon.value.getPath();
            console.log('编辑后的多边形点 (end事件):');
            editedPath.forEach((point, index) => {
                console.log(`点${index + 1}: 经度=${point.lng}, 纬度=${point.lat}`);
            });
        }
    });

    // 加载搜索插件
    AMap.plugin(['AMap.PlaceSearch', 'AMap.AutoComplete'], function () {
        // 输入提示
        const autoOptions = {
            input: "tipinput"
        };

        const auto = new AMap.AutoComplete(autoOptions);
        const placeSearch = new AMap.PlaceSearch({
            map: map
        });

        auto.on("select", select);

        function select(e) {
            placeSearch.setCity(e.poi.adcode);
            placeSearch.search(e.poi.name);
        }
    });
};

// 初始化地图图层
// const initMapLayers = () => {
//     wmsLayer.value = new AMap.TileLayer.Satellite();

//     // 默认隐藏卫星图层
//     wmsLayer.value.setMap(map);
//     wmsLayer.value.hide();
// };
const initMapLayers = () => {
    wmsLayer.value = new AMap.TileLayer.Flexible({
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

    // 默认隐藏天地图图层
    wmsLayer.value.setMap(map);
    wmsLayer.value.hide();
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

// 是否正在创建新多边形
const isCreatingNewPolygon = ref(false);
// 创建新多边形（勾画）
const createPolygon = () => {
    // 关闭之前的编辑
    polyEditor.close();

    // 清除当前编辑目标
    polyEditor.setTarget();

    // 设置标志为正在创建
    isCreatingNewPolygon.value = true;

    // 开始新建多边形
    polyEditor.open();

    isEditing.value = true;
};

const POLYGON_COLORS = {
    // 选中状态 - 蓝色
    SELECTED: {
        fillColor: '#3B82F6',  // 蓝色填充
        fillOpacity: 0.6,
        strokeColor: '#1D4ED8', // 深蓝色边框
        strokeOpacity: 1,
        strokeWeight: 3
    },
    // 普通状态（未选中）- 红色
    NORMAL: {
        fillColor: '#F87171',  // 红色填充
        fillOpacity: 0.5,
        strokeColor: '#00D3FC', // 青色边框
        strokeOpacity: 0.8,
        strokeWeight: 2
    },
    // 失效状态 - 灰色
    DISABLED: {
        fillColor: '#9CA3AF',  // 灰色填充
        fillOpacity: 0.5,
        strokeColor: '#6B7280', // 深灰色边框
        strokeOpacity: 0.8,
        strokeWeight: 2
    },
    // 选中且失效 - 深灰色
    SELECTED_DISABLED: {
        fillColor: '#6B7280',  // 深灰色填充
        fillOpacity: 0.6,
        strokeColor: '#4B5563', // 更深的灰色边框
        strokeOpacity: 1,
        strokeWeight: 3
    }
};
// 选择多边形
const selectPolygon = (polygon) => {
    // 如果正在创建新多边形，不要关闭编辑状态
    if (isEditing.value && !isCreatingNewPolygon.value && selectedPolygon.value !== polygon) {
        // 关闭编辑器
        polyEditor.close();
        isEditing.value = false;
    }

    // 清除之前选中多边形的样式
    if (selectedPolygon.value && selectedPolygon.value !== polygon) {
        // 根据之前选中多边形的状态设置其样式
        if (selectedPolygon.value.isDisabled) {
            selectedPolygon.value.setOptions(POLYGON_COLORS.DISABLED);
        } else {
            selectedPolygon.value.setOptions(POLYGON_COLORS.NORMAL);
        }
    }

    // 设置新选中的多边形
    selectedPolygon.value = polygon;

    // 根据多边形状态设置高亮样式
    if (polygon.isDisabled) {
        polygon.setOptions(POLYGON_COLORS.SELECTED_DISABLED);
    } else {
        polygon.setOptions(POLYGON_COLORS.SELECTED);
    }
};

// 开始编辑选中的多边形
const startEditing = () => {
    if (!selectedPolygon.value) return;

    // 如果工具栏未显示（编辑模式未开启），则不允许编辑
    if (!props.showToolbar) {
        message.warning('请先开启电子围栏编辑功能');
        return;
    }

    // 首先检查多边形是否处于失效状态
    if (selectedPolygon.value.isDisabled === true) {
        console.log('地块处于失效状态，无法编辑');
        message.warning('此地块已失效，不可编辑');
        return;
    }

    polyEditor.setTarget(selectedPolygon.value);
    polyEditor.open();
    isEditing.value = true;
};

// 切换地块失效/恢复状态
const toggleDisablePolygon = () => {
    if (!selectedPolygon.value) return;

    // 确定弹窗挂载位置
    const container = isFullscreen.value
        ? document.querySelector('.electronic-fence-map')
        : document.body;

    // 确定弹窗标题和内容
    const isCurrentlyDisabled = selectedPolygon.value.isDisabled;
    const modalTitle = isCurrentlyDisabled ? '确认恢复' : '确认失效';
    const modalContent = isCurrentlyDisabled
        ? '确定要将选中地块恢复为正常状态吗？'
        : '确定要将选中地块设置为失效状态吗？';

    // 添加确认弹窗
    Modal.confirm({
        title: modalTitle,
        content: modalContent,
        okText: '确认',
        cancelText: '取消',
        getContainer: () => container, // 指定弹窗挂载的位置
        onOk: () => {
            // 如果当前在编辑模式，先结束编辑
            if (isEditing.value) {
                polyEditor.close();
                isEditing.value = false;
            }

            // 切换失效状态
            selectedPolygon.value.isDisabled = !selectedPolygon.value.isDisabled;

            // 根据新状态更新视觉样式
            if (selectedPolygon.value.isDisabled) {
                selectedPolygon.value.setOptions(POLYGON_COLORS.SELECTED_DISABLED);
                message.success('地块已设置为失效状态，无法编辑');
            } else {
                selectedPolygon.value.setOptions(POLYGON_COLORS.SELECTED);
                message.success('地块已恢复正常状态，可以编辑');
            }
        }
    });
};

// 删除选中的多边形
const deleteSelectedPolygon = () => {
    if (!selectedPolygon.value) return;

    // 确定弹窗挂载位置 - 全屏时挂载到全屏元素
    const container = isFullscreen.value
        ? document.querySelector('.electronic-fence-map')
        : document.body;

    // 添加确认弹窗
    Modal.confirm({
        title: '确认删除',
        content: '确定要删除选中的地块吗？',
        okText: '确认',
        cancelText: '取消',
        getContainer: () => container,
        onOk: async () => {
            // 检查是否是编辑模式的围栏（以FENCE开头的id表示已存在的围栏）
            const isExistingFence = selectedPolygon.value.__uid && selectedPolygon.value.__uid.toString().startsWith('FENCE');

            // 如果是已存在的围栏，需要先调用接口检查是否可以删除
            if (isExistingFence) {
                try {
                    const canDelete = await checkCanRemoveFence(selectedPolygon.value.__uid);

                    if (!canDelete) {
                        message.error('该围栏不能删除');
                        return;
                    }
                } catch (error) {
                    console.error('检查围栏删除权限失败:', error);
                    message.error('检查删除权限失败，请稍后重试');
                    return;
                }
            }

            // 如果检查通过或者是新增的围栏，执行删除操作
            performDeletePolygon();
        }
    });
};

const performDeletePolygon = () => {
    // 关闭编辑器
    polyEditor.close();
    polyEditor.setTarget(null);

    // 查找关联的标签并删除
    const associatedLabel = labels.value.find(label => label.polygonId === selectedPolygon.value.__uid);
    if (associatedLabel && associatedLabel.labelMarker) {
        map.remove(associatedLabel.labelMarker);
        labels.value = labels.value.filter(label => label.polygonId !== selectedPolygon.value.__uid);
    }

    // 所有删除方法
    try {
        selectedPolygon.value.remove();
    } catch (e) {
        console.error('删除多边形时出错:', e);
        try {
            selectedPolygon.value.destroy();
        } catch (e) {
            console.error('销毁多边形时出错:', e);
            try {
                map.remove([selectedPolygon.value]);
            } catch (e) {
                console.error('从地图移除多边形时出错:', e);
            }
        }
    }

    // 从数组中移除引用
    polygons.value = polygons.value.filter(p => p !== selectedPolygon.value);

    // 最后手动刷新地图
    if (polygons.value.length > 0) {
        map.setFitView(polygons.value);
    }

    console.log('多边形已删除');
    console.log('剩余多边形数量:', polygons.value.length);

    // 重置选中状态
    selectedPolygon.value = null;
    isEditing.value = false;
};

// 专门用于直接删除多边形，不显示确认对话框
const directlyDeletePolygon = () => {
    if (!selectedPolygon.value) return;

    // 关闭编辑器
    polyEditor.close();
    polyEditor.setTarget(null);

    // 查找关联的标签并删除
    const associatedLabel = labels.value.find(label => label.polygonId === selectedPolygon.value.__uid);
    if (associatedLabel && associatedLabel.labelMarker) {
        map.remove(associatedLabel.labelMarker);
        labels.value = labels.value.filter(label => label.polygonId !== selectedPolygon.value.__uid);
    }

    // 所有删除方法
    try {
        selectedPolygon.value.remove();
    } catch (e) {
        console.error('删除多边形时出错:', e);
        try {
            selectedPolygon.value.destroy();
        } catch (e) {
            console.error('销毁多边形时出错:', e);
            try {
                map.remove([selectedPolygon.value]);
            } catch (e) {
                console.error('从地图移除多边形时出错:', e);
            }
        }
    }

    // 从数组中移除引用
    polygons.value = polygons.value.filter(p => p !== selectedPolygon.value);

    // 最后手动刷新地图
    if (polygons.value.length > 0) {
        map.setFitView(polygons.value);
    }

    console.log('多边形已删除');
    console.log('剩余多边形数量:', polygons.value.length);

    // 重置选中状态
    selectedPolygon.value = null;
    isEditing.value = false;
};

// 编辑
const finishEditing = () => {
    if (!isEditing.value || !selectedPolygon.value) {
        polyEditor.close();
        isEditing.value = false;
        return;
    }

    // 检查是否处于失效状态
    if (selectedPolygon.value.isDisabled) {
        console.log('地块处于失效状态，无法编辑');
        message.warning('此地块已失效，不可编辑');
        polyEditor.close();
        isEditing.value = false;
        return;
    }

    // 获取编辑后的路径点
    const editedPath = selectedPolygon.value.getPath();
    console.log('编辑后的多边形点 (编辑按钮):');
    editedPath.forEach((point, index) => {
        console.log(`点${index + 1}: 经度=${point.lng}, 纬度=${point.lat}`);
    });

    // 存储当前编辑的多边形
    tempPolygon.value = selectedPolygon.value;

    // 查找现有标签信息
    const existingLabel = labels.value.find(label => label.polygonId === selectedPolygon.value.__uid);

    if (existingLabel) {
        // 设置为编辑模式
        isEditMode.value = true;

        // 回显现有信息
        fenceForm.name = existingLabel.name || '';
        fenceForm.remark = existingLabel.remark || '';
    } else {
        // 设置为新增模式
        isEditMode.value = false;

        // 清空表单
        fenceForm.name = '';
        fenceForm.remark = '';
    }

    // 显示对话框
    fenceDialogVisible.value = true;
};

// 处理电子围栏确认
const handleFenceConfirm = () => {
    fenceFormRef.value.validate().then(() => {
        polyEditor.close();
        isEditing.value = false;

        // 确保多边形有唯一标识
        if (!tempPolygon.value.__uid) {
            tempPolygon.value.__uid = Date.now().toString();
        }

        // 计算多边形中心点位置用于放置标签
        const path = tempPolygon.value.getPath();
        let centerX = 0, centerY = 0;
        path.forEach(point => {
            centerX += point.lng;
            centerY += point.lat;
        });
        centerX /= path.length;
        centerY /= path.length;

        // 查找现有标签
        const existingLabelIndex = labels.value.findIndex(label => label.polygonId === tempPolygon.value.__uid);

        if (existingLabelIndex >= 0) {
            // 编辑模式：更新现有标签
            const existingLabel = labels.value[existingLabelIndex];

            // 如果有标记，则更新文本内容
            if (existingLabel.labelMarker) {
                existingLabel.labelMarker.setText(fenceForm.name);
            } else {
                // 如果没有标记，则创建一个新的
                const textMarker = new AMap.Text({
                    position: new AMap.LngLat(centerX, centerY),
                    text: fenceForm.name,
                    anchor: 'center',
                    style: {
                        'background-color': '#ffffff',
                        'border-width': '1px',
                        'border-color': '#cccccc',
                        'padding': '5px',
                        'font-size': '12px',
                        'border-radius': '3px'
                    },
                    zIndex: 110
                });

                // 将标签添加到地图
                map.add(textMarker);
                existingLabel.labelMarker = textMarker;
            }

            // 更新标签信息
            existingLabel.name = fenceForm.name;
            existingLabel.remark = fenceForm.remark;
        } else {
            // 新增模式：创建新标签
            const textMarker = new AMap.Text({
                position: new AMap.LngLat(centerX, centerY),
                text: fenceForm.name,
                anchor: 'center',
                style: {
                    'background-color': '#ffffff',
                    'border-width': '1px',
                    'border-color': '#cccccc',
                    'padding': '5px',
                    'font-size': '12px',
                    'border-radius': '3px'
                },
                zIndex: 110
            });

            // 将标签添加到地图
            map.add(textMarker);

            // 存储标签与多边形的关联
            labels.value.push({
                polygonId: tempPolygon.value.__uid,
                name: fenceForm.name,
                remark: fenceForm.remark,
                labelMarker: textMarker
            });
        }

        fenceDialogVisible.value = false;
        tempPolygon.value = null;
    }).catch(error => {
        console.error('表单验证失败:', error);
    });
};

// 处理电子围栏取消
const handleFenceCancel = () => {
    fenceDialogVisible.value = false;

    // 只有在新增模式下，如果用户取消，才需要删除多边形
    if (!isEditMode.value && tempPolygon.value) {
        // 如果是新建的多边形，则直接删除它，不显示确认对话框
        selectedPolygon.value = tempPolygon.value;
        directlyDeletePolygon();
    } else {
        // 编辑模式下只需关闭编辑状态
        polyEditor.close();
        isEditing.value = false;
    }

    tempPolygon.value = null;
};

// 切换全屏
const toggleFullscreen = () => {
    const element = document.querySelector('.electronic-fence-map');

    if (!isFullscreen.value) {
        // 进入全屏
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    } else {
        // 退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
};

// 全屏变化事件处理
const onFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;

    setTimeout(() => {
        const sugResults = document.querySelector('.amap-sug-result');
        const mapContainer = document.querySelector('.electronic-fence-map');

        if (sugResults && mapContainer) {
            if (isFullscreen.value) {
                // 全屏模式：将搜索结果移动到全屏容器内的最前面
                mapContainer.appendChild(sugResults);
                // 调整样式确保可见
                sugResults.style.zIndex = '10000';
                sugResults.style.position = 'absolute';
            } else {
                // 退出全屏模式：恢复原始位置
                document.body.appendChild(sugResults);
            }
        }
    }, 300); // 延迟执行，确保DOM已更新
};

onUnmounted(() => {
    // 移除全屏变化事件监听
    document.removeEventListener('fullscreenchange', onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    document.removeEventListener('mozfullscreenchange', onFullscreenChange);
    document.removeEventListener('MSFullscreenChange', onFullscreenChange);

    // 销毁地图实例
    if (map) {
        map.destroy();
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && isFullscreen.value) {
                const sugResults = document.querySelector('.amap-sug-result');
                const mapContainer = document.querySelector('.electronic-fence-map');

                if (sugResults && mapContainer && !mapContainer.contains(sugResults)) {
                    mapContainer.appendChild(sugResults);
                    sugResults.style.zIndex = '10000';
                    sugResults.style.position = 'absolute';
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 在组件卸载时取消观察
    onUnmounted(() => {
        observer.disconnect();
    });
});

// 设置电子围栏数据
const setFenceList = (fenceData) => {
    // 确保地图已初始化
    if (!map) {
        console.error('地图尚未初始化');
        setTimeout(() => {
            if (map) setFenceList(fenceData);
        }, 1000);
        return;
    }

    // 确保polygons和labels已初始化
    if (!polygons.value) polygons.value = [];
    if (!labels.value) labels.value = [];

    // 清除已有的多边形
    for (let i = 0; i < polygons.value.length; i++) {
        try {
            map.remove(polygons.value[i]);
        } catch (e) {
            console.error('移除多边形出错:', e);
        }
    }
    polygons.value = [];

    // 清除已有的标签
    for (let i = 0; i < labels.value.length; i++) {
        try {
            if (labels.value[i] && labels.value[i].labelMarker) {
                map.remove(labels.value[i].labelMarker);
            }
        } catch (e) {
            console.error('移除标签出错:', e);
        }
    }
    labels.value = [];

    if (!fenceData || fenceData.length === 0) return;

    // 创建并添加多边形
    fenceData.forEach(fence => {
        try {
            // 将普通坐标对象转换为AMap.LngLat对象
            const path = fence.path.map(point => {
                return new AMap.LngLat(point.lng, point.lat);
            });

            // 创建多边形
            const polygon = new AMap.Polygon({
                path: path,
                ...fence.isDisabled ? POLYGON_COLORS.DISABLED : POLYGON_COLORS.NORMAL
            });

            // 设置多边形属性
            polygon.__uid = fence.id;
            polygon.isDisabled = !!fence.isDisabled;

            // 添加多边形到地图
            map.add(polygon);
            polygons.value.push(polygon);

            // 计算多边形中心点用于放置标签
            let centerX = 0, centerY = 0;
            path.forEach(point => {
                centerX += point.getLng();
                centerY += point.getLat();
            });
            centerX /= path.length;
            centerY /= path.length;

            // 创建标签
            const textMarker = new AMap.Text({
                position: new AMap.LngLat(centerX, centerY),
                text: fence.name || `围栏${polygons.value.length}`,
                anchor: 'center',
                style: {
                    'background-color': '#ffffff',
                    'border-width': '1px',
                    'border-color': '#cccccc',
                    'padding': '5px',
                    'font-size': '12px',
                    'border-radius': '3px'
                },
                zIndex: 110
            });

            // 添加标签到地图
            map.add(textMarker);

            // 存储标签信息
            labels.value.push({
                polygonId: fence.id,
                name: fence.name,
                remark: fence.remark,
                labelMarker: textMarker
            });

            // 添加多边形事件
            polygon.on('click', () => {
                selectPolygon(polygon);
            });

            polygon.on('dblclick', (e) => {
                if (polygon.isDisabled) {
                    console.log('地块处于失效状态，无法编辑');
                    return;
                }
                selectPolygon(polygon);
                startEditing();
            });

        } catch (error) {
            console.error('创建围栏失败:', error, fence);
        }
    });

    // 调整地图视野以包含所有多边形
    if (polygons.value.length > 0) {
        try {
            map.setFitView(polygons.value);
        } catch (e) {
            console.error('设置地图视野出错:', e);
        }
    }

    console.log(`成功加载${polygons.value.length}个电子围栏`);
};

// 导出方法给父组件使用
defineExpose({
    getFenceList: () => {
        return polygons.value.map((polygon, index) => {
            // 查找关联的标签信息
            const labelInfo = labels.value.find(label => label.polygonId === polygon.__uid) || {};

            return {
                id: polygon.__uid || `fence_${index}`,
                name: labelInfo.name || `围栏${index + 1}`,
                remark: labelInfo.remark || '',
                path: polygon.getPath(),
                isDisabled: polygon.isDisabled || false // 添加失效状态到返回数据中
            };
        });
    },
    setFenceList
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

    :deep(#myPageTop) {
        position: absolute;
        top: 10px;
        left: 10px;
        padding: 10px;
        border-radius: 4px;
    }

    .layer-switcher {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10;

        .layer-options {
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            padding: 8px;
            display: flex;
            flex-direction: column;
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
}
</style>