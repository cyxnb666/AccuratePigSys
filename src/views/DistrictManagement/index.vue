<template>
    <div class="district-management">
        <!-- 搜索表单 -->
        <div class="search-form">
            <a-form layout="inline">
                <a-row :gutter="16" style="width: 100%">
                    <a-col>
                        <a-form-item label="行政区划名称:">
                            <a-input placeholder="请输入行政区划名称" v-model:value="searchForm.areaname" />
                        </a-form-item>
                    </a-col>
                    <a-col>
                        <a-form-item label="行政区划代码:">
                            <a-input placeholder="请输入行政区划代码" v-model:value="searchForm.areacode" />
                        </a-form-item>
                    </a-col>
                    <a-col>
                        <a-form-item>
                            <a-button type="primary" @click="handleSearch">查询</a-button>
                            <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </div>

        <!-- 数据表格 -->
        <div class="data-table">
            <a-table :columns="columns" :data-source="dataSource" :loading="loading" :pagination="false" bordered
                row-key="areacode" :scroll="{ y: tableHeight }" :indentSize="20" @expand="handleExpand">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'status'">
                        <a-switch :checked="record.enabled === '1'" @change="() => handleStatusChange(record)" />
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-button type="link" @click="handleEdit(record)"
                            :loading="editingId === record.areacode && editLoading">编辑</a-button>
                    </template>
                </template>
            </a-table>
        </div>

        <district-dialog v-model="dialogVisible" :is-edit="isEdit" :record="currentRecord"
            :district-tree-data="areaTreeData" @success="handleDialogSuccess" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import DistrictDialog from './components/DistrictDialog.vue';
import { getDistrictList, getDistrictDetail, enableDistrict, getAreaTrees } from './api';
import { message } from 'ant-design-vue';

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref({});
const loading = ref(false);
const editLoading = ref(false);
const editingId = ref(null);
const areaTreeData = ref([]);

// 搜索表单
const searchForm = reactive({
    areaname: '',
    areacode: '',
});

// 表格高度
const tableHeight = ref('calc(80vh - 150px)');

// 表格列
const columns = [
    {
        title: '行政区划',
        dataIndex: 'areaname',
        key: 'name',
        align: 'center'
    },
    {
        title: '区划代码',
        dataIndex: 'areacode',
        key: 'code',
        align: 'center'
    },
    {
        title: '状态',
        dataIndex: 'enabled',
        key: 'status',
        align: 'center'
    },
    {
        title: '编辑日期',
        dataIndex: 'updateTime',
        key: 'updateTime',
        align: 'center'
    },
    {
        title: '操作',
        key: 'action',
        align: 'center'
    }
];

// 表格数据
const dataSource = ref([]);

// 转换行政区划数据为树形结构
const transformAreaData = (areaList) => {
    return areaList.map(area => {
        const node = {
            title: area.areaname,
            value: area.areacode,
            key: area.areacode,
            children: area.children ? transformAreaData(area.children) : []
        };
        return node;
    });
};

// 获取行政区划树形数据
const fetchAreaTrees = async () => {
    try {
        const res = await getAreaTrees();
        if (res) {
            // 添加"中国"作为顶级节点
            const transformedData = transformAreaData(res);

            // 检查是否已存在value为"0"的节点
            const hasRootNode = transformedData.some(node => node.value === "0");

            if (!hasRootNode) {
                // 如果不存在，添加"中国"作为顶级节点
                transformedData.unshift({
                    title: "中国",
                    value: "0",
                    key: "0"
                });
            } else {
                // 如果存在，将title修改为"中国"
                const rootNode = transformedData.find(node => node.value === "0");
                if (rootNode) {
                    rootNode.title = "中国";
                }
            }

            areaTreeData.value = transformedData;
        }
    } catch (error) {
        console.error('获取行政区划树形数据失败:', error);
    }
};

// 加载行政区划数据
const fetchDistrictList = async (params) => {
    loading.value = true;
    try {
        const res = await getDistrictList(params);
        if (res) {
            dataSource.value = res || [];
        }
    } catch (error) {
        console.error('获取行政区划数据失败:', error);
    } finally {
        loading.value = false;
    }
};

// 初始化加载
onMounted(() => {
    // 获取行政区划树形数据
    fetchAreaTrees();

    // 加载表格数据
    const params = {
        condition: {
            areacode: '',
            areaname: '',
            parentAreacode: '0'
        }
    };
    fetchDistrictList(params);
});

const handleSearch = () => {
    const params = {
        condition: {
            areacode: searchForm.areacode,
            areaname: searchForm.areaname,
            // 查询时不传parentAreacode
        }
    };
    fetchDistrictList(params);
};

const handleReset = () => {
    searchForm.areaname = '';
    searchForm.areacode = '';

    // 重置后重新加载顶级区划
    const params = {
        condition: {
            areacode: '',
            areaname: '',
            parentAreacode: '0'
        }
    };
    fetchDistrictList(params);
};

// 切换状态
const handleStatusChange = async (record) => {
    try {
        await enableDistrict(record.areacode);

        message.success(`${record.enabled === '1' ? '禁用' : '启用'}行政区划成功`);

        // 更新本地数据状态
        const updateState = (data) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].areacode === record.areacode) {
                    data[i].enabled = data[i].enabled === '1' ? '0' : '1';
                    return true;
                }
                if (data[i].children && data[i].children.length > 0) {
                    if (updateState(data[i].children)) {
                        return true;
                    }
                }
            }
            return false;
        };

        const newDataSource = [...dataSource.value];
        updateState(newDataSource);
        dataSource.value = newDataSource;

    } catch (error) {
        console.error('更新状态失败:', error);
    }
};

// 展开事件处理
const handleExpand = async (expanded, record) => {
    if (expanded) {
        // 如果是展开操作，加载子节点数据
        await loadChildrenData(record);
    }
};

// 加载子区域数据
const loadChildrenData = async (record) => {
    // 如果该记录已经有children属性且有数据，则不再请求
    if (record.children && record.children.length > 0) {
        return;
    }

    try {
        loading.value = true;
        const params = {
            condition: {
                parentAreacode: record.areacode
            }
        };

        const res = await getDistrictList(params);

        // 查找当前记录在dataSource中的位置，并更新其children
        const updateChildrenData = (data) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].areacode === record.areacode) {
                    // Vue不能直接修改数组索引值，所以使用整个新对象替换
                    data[i] = { ...data[i], children: res || [] };
                    return true;
                }
                if (data[i].children && data[i].children.length > 0) {
                    if (updateChildrenData(data[i].children)) {
                        return true;
                    }
                }
            }
            return false;
        };

        // 创建新的数组引用以触发Vue的响应式更新
        const newDataSource = [...dataSource.value];
        updateChildrenData(newDataSource);
        dataSource.value = newDataSource;

    } catch (error) {
        console.error('加载子区域数据失败:', error);
    } finally {
        loading.value = false;
    }
};

// 点击"编辑"按钮
const handleEdit = async (record) => {
    try {
        // 设置当前正在编辑的记录ID和loading状态
        editingId.value = record.areacode;
        editLoading.value = true;

        // 获取行政区划详情
        const res = await getDistrictDetail(record.areacode);

        if (res) {
            isEdit.value = true;
            currentRecord.value = {
                parentDistrict: res.parentAreacode,
                districtName: res.areaname,
                districtCode: res.areacode,
                status: res.enabled === '1' ? '启用' : '禁用',
                longitude: res.longitude || '',
                latitude: res.latitude || ''
            };
            dialogVisible.value = true;
        }
    } catch (error) {
        console.error('获取行政区划详情失败:', error);
    } finally {
        editLoading.value = false;
        editingId.value = null;
    }
};

// 对话框提交成功回调
const handleDialogSuccess = (data) => {
    handleSearch();
};
</script>

<style lang="scss" scoped>
.district-management {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;

    .search-form {
        padding: 16px;
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .data-table {
        background-color: white;
        border-radius: 4px;
        padding: 16px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        flex: 1;

        /* 确保表格能够撑满容器 */
        :deep(.ant-table-wrapper) {
            flex: 1;

            .ant-table-container {
                display: flex;
                flex-direction: column;
            }

            .ant-table-body {
                flex: 1;
                overflow-y: auto;
            }
        }
    }
}

:deep(.ant-table-wrapper) {
    .ant-table-thead>tr>th {
        background-color: #F3F5F9;
        font-weight: 500;
    }

    .ant-table-tbody>tr:nth-child(odd) {
        background-color: #F6F7FA;
    }

    .ant-table-tbody>tr:nth-child(even) {
        background-color: #FFFFFF;
    }
}
</style>