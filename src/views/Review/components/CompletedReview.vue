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
                            <a-button type="primary" @click="handleSearch">查询</a-button>
                            <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </div>

        <!-- 数据表格 -->
        <div class="data-table">
            <a-table :columns="columns" :data-source="dataSource" :pagination="false" :loading="loading" bordered
                row-key="id" :scroll="{ y: tableHeight }">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'porkerCount'">
                        <span>{{ record.porkerCount || 0 }}</span>
                    </template>
                    <template v-if="column.key === 'pigletCount'">
                        <span>{{ record.pigletCount || 0 }}</span>
                    </template>
                    <template v-if="column.key === 'sowCount'">
                        <span>{{ record.sowCount || 0 }}</span>
                    </template>
                    <template v-if="column.key === 'auditStatus'">
                        <a-tag
                            :color="record.auditStatus === 'AUDITSUCC' || record.auditStatus === '审核通过' ? 'success' :
                                record.auditStatus === 'AUDITING' || record.auditStatus === '待审核' ? 'processing' : 'error'">
                            {{ record.auditStatus === 'AUDITSUCC' ? '审核通过' :
                                record.auditStatus === 'AUDITING' ? '待审核' :
                                    record.auditStatus === 'AUDITFAIL' ? '审核驳回' : record.auditStatus }}
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
import { ref, reactive, defineProps, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuditList } from '../api';
import dayjs from 'dayjs';

const props = defineProps({
    areaTreeData: {
        type: Array,
        default: () => []
    }
});

const router = useRouter();
const loading = ref(false);

// 搜索表单
const searchForm = reactive({
    district: '',
    farmName: '',
    reportDate: []
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
        dataIndex: 'registId',
        key: 'registId',
        align: 'center'
    },
    {
        title: '行政区划',
        dataIndex: 'farmAddress',
        key: 'farmAddress',
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
        dataIndex: 'applyUserName',
        key: 'applyUserName',
        align: 'center'
    },
    {
        title: '育肥猪',
        dataIndex: 'porkerCount',
        key: 'porkerCount',
        align: 'center'
    },
    {
        title: '仔猪',
        dataIndex: 'pigletCount',
        key: 'pigletCount',
        align: 'center'
    },
    {
        title: '母猪',
        dataIndex: 'sowCount',
        key: 'sowCount',
        align: 'center'
    },
    {
        title: '上报时间',
        dataIndex: 'applyTime',
        key: 'applyTime',
        align: 'center'
    },
    {
        title: '审核人',
        dataIndex: 'auditUserName',
        key: 'auditUserName',
        align: 'center'
    },
    {
        title: '审核结果',
        dataIndex: 'auditStatus',
        key: 'auditStatus',
        align: 'center'
    },
    {
        title: '审核时间',
        dataIndex: 'auditTime',
        key: 'auditTime',
        align: 'center'
    },
    {
        title: '操作',
        key: 'action',
        align: 'center',
        width: 80
    }
];

// 表格数据
const dataSource = ref([]);

// 分页
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0
});

// 获取表格数据
const fetchTableData = async () => {
    loading.value = true;
    try {
        // 处理日期范围
        let startDate = '';
        let endDate = '';
        if (searchForm.reportDate && searchForm.reportDate.length === 2) {
            startDate = searchForm.reportDate[0] ? dayjs(searchForm.reportDate[0]).format('YYYY-MM-DD') : '';
            endDate = searchForm.reportDate[1] ? dayjs(searchForm.reportDate[1]).format('YYYY-MM-DD') : '';
        }

        const params = {
            condition: {
                areacodes: searchForm.district ? [searchForm.district] : [],
                auditStatus: 'AUDITOVER', // 已审核状态
                startDate: startDate,
                endDate: endDate,
                farmName: searchForm.farmName
            },
            pageNo: pagination.current,
            pageSize: pagination.pageSize
        };

        const res = await getAuditList(params);

        if (res) {
            // 添加索引
            const records = res.records || [];
            dataSource.value = records.map((item, index) => ({
                ...item,
                index: (pagination.current - 1) * pagination.pageSize + index + 1
            }));

            pagination.total = res.total || 0;
        }
    } catch (error) {
        console.error('获取已审核列表失败:', error);
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    pagination.current = 1;
    fetchTableData();
};

const handleReset = () => {
    searchForm.district = '';
    searchForm.farmName = '';
    searchForm.reportDate = [];
    pagination.current = 1;
    fetchTableData();
};

const handleDetail = (record) => {
    router.push({
        path: `/AUDITD/detail/${record.auditId}`,
        query: { viewMode: 'true', source: 'completed' }
    });
};

const handleTableChange = (page, pageSize) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    fetchTableData();
};

onMounted(() => {
    fetchTableData();
});
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