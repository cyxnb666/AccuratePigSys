<template>
    <div class="completed-review">
        <!-- 搜索表单 -->
        <div class="search-form">
            <a-form layout="inline">
                <a-row :gutter="16" style="width: 100%">
                    <a-col>
                        <a-form-item label="行政区划:">
                            <a-tree-select v-model:value="searchForm.district" :tree-data="districtTreeData"
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
                    <!-- <a-col>
                        <a-form-item label="审核结果:">
                            <a-select v-model:value="searchForm.reviewResult" placeholder="全部" style="min-width: 120px">
                                <a-select-option value="通过">通过</a-select-option>
                                <a-select-option value="驳回">驳回</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col> -->
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

            <!-- 分页 -->
            <div class="pagination">
                <a-pagination v-model:current="pagination.current" :total="pagination.total"
                    :page-size="pagination.pageSize" @change="handleTableChange" show-size-changer show-quick-jumper />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';

// 搜索表单
const searchForm = reactive({
    district: undefined,
    farmName: '',
    reportDate: [],
    reviewResult: undefined
});

// 表格高度 - 调整为固定高度
const tableHeight = ref('calc(80vh - 210px)');

// 更新表格列
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

// 行政区划树形数据
const districtTreeData = [
    {
        title: '四川省',
        value: 'sichuan',
        key: 'sichuan',
        children: [
            {
                title: '成都市',
                value: 'chengdu',
                key: 'sichuan-chengdu',
                children: [
                    {
                        title: '武侯区',
                        value: 'wuhou',
                        key: 'sichuan-chengdu-wuhou',
                    },
                    {
                        title: '锦江区',
                        value: 'jinjiang',
                        key: 'sichuan-chengdu-jinjiang',
                    }
                ]
            }
        ]
    }
];

// 更新模拟数据以匹配新列
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
    total: 5
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
    searchForm.reviewResult = undefined;
};

const handleDetail = (record) => {
    message.info(`查看养殖场详情: ${record.farmName}`);
};

const handleTableChange = (page) => {
    pagination.current = page;
};
</script>

<style lang="scss" scoped>
.completed-review {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .search-form {
        padding: 16px;
        background-color: white;
        border-radius: 4px;
    }

    .data-table {
        background-color: white;
        border-radius: 4px;
        // padding: 16px;
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