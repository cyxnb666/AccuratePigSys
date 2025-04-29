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
                            <a-button type="primary" @click="handleSearch">查 询</a-button>
                            <a-button style="margin-left: 8px" @click="handleReset">重 置</a-button>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </div>

        <!-- 数据表格 -->
        <div class="data-table">
            <a-table :columns="columns" :data-source="dataSource" :loading="loading" :pagination="false" bordered
                row-key="areacode" :scroll="{ y: tableHeight }" :indentSize="20"
                :expandable="{ onExpand: onExpandRow }">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'status'">
                        <a-switch :checked="record.enabled === '1'" @change="() => handleStatusChange(record)" />
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-button type="link" @click="handleEdit(record)"
                            :loading="editingId === record.areacode && editLoading">编 辑</a-button>
                    </template>
                </template>
            </a-table>
        </div>

        <district-dialog v-model="dialogVisible" :is-edit="isEdit" :record="currentRecord"
            @success="handleDialogSuccess" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import DistrictDialog from './components/DistrictDialog.vue';
import { getDistrictList, getDistrictDetail } from './api';

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<any>({});
const loading = ref(false);
const editLoading = ref(false);
const editingId = ref<string | null>(null);

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
        key: 'areaname',
        align: 'center'
    },
    {
        title: '区划代码',
        dataIndex: 'areacode',
        key: 'areacode',
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
        align: 'center',
        width: 100
    }
];

// 表格数据
const dataSource = ref<any[]>([]);

// 获取表格数据
const fetchTableData = async (isInitial = false) => {
    loading.value = true;
    try {
        const params = {
            condition: {
                areacode: searchForm.areacode,
                areaname: searchForm.areaname,
                parentAreacode: isInitial ? "0" : "" // 初始加载时传"0"，查询时不传
            }
        };

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

// 展开行时加载子数据
const onExpandRow = async (expanded: boolean, record: any) => {
    if (expanded) {
        // 如果已经加载过子节点，就不再重复加载
        if (record.children && record.children.length > 0) {
            return;
        }

        try {
            // 调用API获取子节点数据
            const params = {
                condition: {
                    parentAreacode: record.areacode
                }
            };

            const res = await getDistrictList(params);

            if (res && res.length > 0) {
                // 设置子节点数据
                record.children = res;
            } else {
                // 如果没有子节点，设置空数组
                record.children = [];
            }
        } catch (error) {
            console.error('获取子区划数据失败:', error);
            message.error('获取子区划数据失败');
        }
    }
};

// 方法
const handleSearch = () => {
    fetchTableData(false);
};

const handleReset = () => {
    searchForm.areaname = '';
    searchForm.areacode = '';
    fetchTableData(true);
};

// 点击"编辑"按钮
const handleEdit = async (record) => {
    try {
        // 设置当前正在编辑的记录ID和loading状态
        editingId.value = record.areacode;
        editLoading.value = true;

        const res = await getDistrictDetail(record.areacode);
        if (res) {
            isEdit.value = true;
            currentRecord.value = res;
            dialogVisible.value = true;
        }
    } catch (error) {
        console.error('获取行政区划详情失败:', error);
    } finally {
        // 无论成功还是失败，都重置loading状态
        editLoading.value = false;
        editingId.value = null;
    }
};

// 对话框提交成功回调
const handleDialogSuccess = () => {
    fetchTableData(true);
};

// 状态变更
const handleStatusChange = async (record) => {
    // 这里假设你有启用/禁用区划的API，如果没有，可以先注释掉
    message.info('状态变更功能暂未实现');

    // 刷新数据
    fetchTableData(true);
};

onMounted(() => {
    fetchTableData(true);
});
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

// 表格样式优化
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