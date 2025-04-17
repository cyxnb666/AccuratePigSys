<template>
    <div class="district-management">
        <!-- 搜索表单 -->
        <div class="search-form">
            <a-form layout="inline">
                <a-row :gutter="16" style="width: 100%">
                    <a-col>
                        <a-form-item label="行政区划名称:">
                            <a-input placeholder="请输入行政区划名称" v-model:value="searchForm.districtName" />
                        </a-form-item>
                    </a-col>
                    <a-col>
                        <a-form-item label="行政区划代码:">
                            <a-input placeholder="请输入行政区划代码" v-model:value="searchForm.districtCode" />
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
            <a-table :columns="columns" :data-source="dataSource" :pagination="false" bordered row-key="id"
                :scroll="{ y: tableHeight }" :indentSize="20">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'status'">
                        <a-switch v-model:checked="record.status" :disabled="false" />
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-button type="link" @click="handleEdit(record)">编 辑</a-button>
                        <a-button type="link" danger @click="handleDelete(record)">删 除</a-button>
                    </template>
                </template>
            </a-table>

            <!-- 分页 -->
            <div class="pagination">
                <a-pagination v-model:current="pagination.current" :total="pagination.total"
                    :page-size="pagination.pageSize" @change="handleTableChange" show-size-changer show-quick-jumper />
            </div>
        </div>

        <district-dialog v-model="dialogVisible" :is-edit="isEdit" :record="currentRecord"
            @success="handleDialogSuccess" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import DistrictDialog from './components/DistrictDialog.vue';

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref({});

// 搜索表单
const searchForm = reactive({
    districtName: '',
    districtCode: ''
});

// 表格高度
const tableHeight = ref('calc(80vh - 150px)');

// 表格列
const columns = [
    {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        width: 80,
        align: 'center'
    },
    {
        title: '行政区划',
        dataIndex: 'name',
        key: 'name',
        align: 'center'
    },
    {
        title: '区划代码',
        dataIndex: 'code',
        key: 'code',
        align: 'center'
    },
    {
        title: '状态',
        dataIndex: 'status',
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

// 模拟树形数据
const generateTreeData = () => {
    return [
        {
            id: 1,
            index: 1,
            name: '四川省',
            code: '510000',
            status: true,
            updateTime: '2025-03-31',
            children: [
                {
                    id: 2,
                    index: 2,
                    name: '成都市',
                    code: '510100',
                    status: false,
                    updateTime: '2025-03-31',
                    children: [
                        {
                            id: 3,
                            index: 3,
                            name: '武侯区',
                            code: '510107',
                            status: true,
                            updateTime: '2025-03-31'
                        },
                        {
                            id: 4,
                            index: 4,
                            name: '锦江区',
                            code: '510104',
                            status: true,
                            updateTime: '2025-03-31'
                        }
                    ]
                },
                {
                    id: 5,
                    index: 5,
                    name: '绵阳市',
                    code: '510700',
                    status: true,
                    updateTime: '2025-03-31'
                }
            ]
        },
        {
            id: 6,
            index: 6,
            name: '重庆市',
            code: '500000',
            status: true,
            updateTime: '2025-03-31',
            children: [
                {
                    id: 7,
                    index: 7,
                    name: '渝中区',
                    code: '500103',
                    status: true,
                    updateTime: '2025-03-31'
                }
            ]
        }
    ];
};

// 表格数据
const dataSource = ref(generateTreeData());

// 分页
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 50
});

// 方法
const handleSearch = () => {
    console.log('搜索条件:', searchForm);
    pagination.current = 1;
    // 实际项目中这里应该调用API进行搜索
};

const handleReset = () => {
    searchForm.districtName = '';
    searchForm.districtCode = '';
};

const handleDelete = (record) => {
    console.log('删除区划:', record);
};

const handleTableChange = (page) => {
    pagination.current = page;
    // 加载当前页数据
};

// 点击"编辑"按钮
const handleEdit = (record) => {
    isEdit.value = true;
    currentRecord.value = {
        parentDistrict: record.parentId || null,
        districtName: record.name,
        districtCode: record.code,
        status: record.status ? '启用' : '禁用',
        longitude: record.longitude || '',
        latitude: record.latitude || ''
    };
    dialogVisible.value = true;
};

// 对话框提交成功回调
const handleDialogSuccess = (data) => {
    console.log('编辑区划成功:', data);
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

        .pagination {
            margin-top: 16px;
            text-align: right;
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