<template>
    <div class="report-reminder">
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
                        <a-form-item label="养殖场:">
                            <a-input placeholder="请输入养殖场名称" v-model:value="searchForm.farmName" />
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
                    <template v-if="column.key === 'action'">
                        <a-button type="link" @click="viewReminderDetails(record)">详情</a-button>
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
    farmName: ''
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
        title: '上次上报存栏数量',
        dataIndex: 'lastReportQuantity',
        key: 'lastReportQuantity',
        align: 'center'
    },
    {
        title: '上次上报时间',
        dataIndex: 'lastReportTime',
        key: 'lastReportTime',
        align: 'center'
    },
    {
        title: '提醒上报次数',
        dataIndex: 'reminderCount',
        key: 'reminderCount',
        align: 'center'
    },
    {
        title: '提醒未上报次数',
        dataIndex: 'missedReportCount',
        key: 'missedReportCount',
        align: 'center'
    },
    {
        title: '实际上报次数',
        dataIndex: 'actualReportCount',
        key: 'actualReportCount',
        align: 'center'
    },
    {
        title: '提醒记录',
        key: 'action',
        align: 'center'
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
            },
            {
                title: '绵阳市',
                value: 'mianyang',
                key: 'sichuan-mianyang',
            }
        ]
    },
    {
        title: '重庆市',
        value: 'chongqing',
        key: 'chongqing',
        children: [
            {
                title: '渝中区',
                value: 'yuzhong',
                key: 'chongqing-yuzhong',
            },
            {
                title: '江北区',
                value: 'jiangbei',
                key: 'chongqing-jiangbei',
            }
        ]
    }
];

// 模拟数据
const generateData = () => {
    const data = [];
    for (let i = 1; i <= 15; i++) {
        data.push({
            id: i,
            index: i,
            district: '四川省成都市' + (i % 2 === 0 ? '武侯区' : '锦江区'),
            farmName: `养殖场 ${i}`,
            lastReportQuantity: 500 + i * 10,
            lastReportTime: '2025-03-' + (10 + i % 20),
            reminderCount: 3 + i % 3,
            missedReportCount: i % 3,
            actualReportCount: 3 + i % 4,
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
    total: 15
});

// 方法
const handleSearch = () => {
    console.log('搜索条件:', searchForm);
    pagination.current = 1;
    // 实际项目中这里应该调用API进行搜索
};

const handleReset = () => {
    searchForm.district = undefined;
    searchForm.farmName = '';
};

const viewReminderDetails = (record) => {
    message.info(`查看养殖场 ${record.farmName} 的提醒记录`);
};

const handleTableChange = (page) => {
    pagination.current = page;
    // 加载当前页数据
};
</script>

<style lang="scss" scoped>
.report-reminder {
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