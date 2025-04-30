<template>
    <div class="completed-review">
        <!-- 搜索表单 -->
        <div class="search-form">
            <a-form layout="inline">
                <a-row :gutter="16" style="width: 100%">
                    <a-col>
                        <a-form-item label="行政区划:">
                            <a-tree-select v-model:value="searchForm.district" :tree-data="areaTreeData"
                                placeholder="请选择行政区划" allow-clear
                                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                                :tree-node-filter-prop="'title'" :show-search="true" style="min-width: 200px" />
                        </a-form-item>
                    </a-col>
                    <a-col>
                        <a-form-item label="养殖场名称:">
                            <a-input placeholder="请输入养殖场名称" v-model:value="searchForm.farmName" />
                        </a-form-item>
                    </a-col>
                    <a-col>
                        <a-form-item label="上报日期:">
                            <a-range-picker v-model:value="searchForm.reportDate" />
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
                :scroll="{ y: tableHeight }">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'reviewResult'">
                        <a-tag :color="record.reviewResult === '通过' ? 'success' : 'error'">
                            {{ record.reviewResult }}
                        </a-tag>
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-button type="link" @click="handleDetail(record)">详情</a-button>
                    </template>
                </template>
            </a-table>

            <div class="pagination">
                <a-pagination v-model:current="pagination.current" v-model:pageSize="pagination.pageSize"
                    :total="pagination.total" @change="handleTableChange" show-size-changer
                    :show-total="(total) => `共 ${total} 条记录`" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    areaTreeData: {
        type: Array,
        default: () => []
    }
});

const router = useRouter();

// 搜索表单
const searchForm = reactive({
    district: undefined,
    farmName: '',
    reportDate: [],
});

// 表格高度
const tableHeight = ref('calc(80vh - 175px)');

const columns = [
    {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        width: 80,
        align: 'center'
    },
    {
        title: '任务号',
        dataIndex: 'taskId',
        key: 'taskId',
        align: 'center'
    },
    {
        title: '行政区划',
        dataIndex: 'district',
        key: 'district',
        align: 'center'
    },
    {
        title: '养殖场名称',
        dataIndex: 'farmName',
        key: 'farmName',
        align: 'center'
    },
    {
        title: '上报用户',
        dataIndex: 'reportUser',
        key: 'reportUser',
        align: 'center'
    },
    {
        title: '育肥猪',
        dataIndex: 'fatteningPigs',
        key: 'fatteningPigs',
        align: 'center'
    },
    {
        title: '仔猪',
        dataIndex: 'piglets',
        key: 'piglets',
        align: 'center'
    },
    {
        title: '母猪',
        dataIndex: 'sows',
        key: 'sows',
        align: 'center'
    },
    {
        title: '上报时间',
        dataIndex: 'reportTime',
        key: 'reportTime',
        align: 'center'
    },
    {
        title: '审核人',
        dataIndex: 'reviewer',
        key: 'reviewer',
        align: 'center'
    },
    {
        title: '审核结果',
        dataIndex: 'reviewResult',
        key: 'reviewResult',
        align: 'center'
    },
    {
        title: '审核时间',
        dataIndex: 'reviewTime',
        key: 'reviewTime',
        align: 'center'
    },
    {
        title: '操作',
        key: 'action',
        align: 'center',
        width: 80
    }
];

const generateData = () => {
    const data = [];
    for (let i = 1; i <= 10; i++) {
        data.push({
            id: i,
            index: i,
            taskId: `Task-${2025040000 + i}`,
            district: '四川省成都市武侯区',
            farmName: `测试养殖场 ${i}`,
            reportUser: `用户${i}`,
            fatteningPigs: 300 + i * 10,
            piglets: 150 + i * 5,
            sows: 50 + i * 2,
            reportTime: '2025-04-10 10:30:00',
            reviewer: '管理员',
            reviewResult: i % 2 === 0 ? '通过' : '驳回',
            reviewTime: '2025-04-15 14:30:00'
        });
    }
    return data;
};

// 表格数据
const dataSource = ref(generateData());

// 分页
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 25
});

// 方法
const handleSearch = () => {
    console.log('搜索条件:', searchForm);
    pagination.current = 1;
};

const handleReset = () => {
    searchForm.district = undefined;
    searchForm.farmName = '';
    searchForm.reportDate = [];
};

const handleDetail = (record) => {
    router.push({
        path: `/review/detail/${record.id}`,
        query: { viewMode: 'true' }
    });
};

const handleTableChange = (page, pageSize) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
};
</script>

<style lang="scss" scoped>
.completed-review {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .search-form {
        background-color: white;
        border-radius: 4px;
    }

    .data-table {
        background-color: white;
        border-radius: 4px;
        flex: 1;
        display: flex;
        flex-direction: column;

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