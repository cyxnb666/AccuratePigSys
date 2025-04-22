<template>
    <div class="reminder-detail">
        <!-- 面包屑导航 -->
        <div class="bread-detail-card">
            <div class="breadcrumb">
                <a-breadcrumb>
                    <a-breadcrumb-item>
                        <a @click="goBack">
                            <left-outlined /> 返回
                        </a>
                    </a-breadcrumb-item>
                    <a-breadcrumb-item>提醒记录详情</a-breadcrumb-item>
                </a-breadcrumb>
            </div>
        </div>

        <!-- 数据表格 -->
        <div class="content-container">
            <div class="data-table">
                <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" bordered row-key="id"
                    :scroll="{ y: tableHeight }" @change="handleTableChange">
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'rule'">
                            <!-- 规则显示，支持多行 -->
                            <div v-for="(rule, index) in record.rules" :key="index" class="rule-item">
                                {{ rule }}
                            </div>
                        </template>
                        <template v-if="column.key === 'reportStatus'">
                            <a-tag :color="record.reportStatus === '已上报' ? 'success' : 'warning'">
                                {{ record.reportStatus }}
                            </a-tag>
                        </template>
                        <template v-if="column.key === 'relatedTask'">
                            <a-button type="link" @click="viewTask(record)" v-if="record.relatedTask">
                                {{ record.relatedTask }}
                            </a-button>
                            <span v-else>-</span>
                        </template>
                    </template>
                </a-table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LeftOutlined } from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();

// 表格高度
const tableHeight = ref('calc(80vh - 140px)');

// 表格列配置
const columns = [
    {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        width: 80,
        align: 'center'
    },
    {
        title: '提醒时间',
        dataIndex: 'reminderTime',
        key: 'reminderTime',
        align: 'center',
        width: 160
    },
    {
        title: '规则',
        dataIndex: 'rule',
        key: 'rule',
        align: 'center',
        ellipsis: true
    },
    {
        title: '上报状态',
        dataIndex: 'reportStatus',
        key: 'reportStatus',
        align: 'center',
        width: 120
    },
    {
        title: '关联任务',
        dataIndex: 'relatedTask',
        key: 'relatedTask',
        align: 'center',
        width: 200
    }
];

// 模拟数据
const generateData = () => {
    const data = [];
    const rules = [
        ['存栏变化数累计达到数量（出栏/补栏/死亡）：10'],
        ['存栏变化数累计达到比例（出栏/补栏/死亡）：10%'],
        ['上次存栏上报至今累计达到天数：20'],
        ['重复不通过重新上报']
    ];

    for (let i = 1; i <= 50; i++) {
        const reportStatus = i % 3 === 0 ? '已上报' : i % 3 === 1 ? '待上报' : '逾期未上报';
        const isReviewCompleted = reportStatus === '已上报'; // 已上报的任务都已审核完成

        data.push({
            id: i,
            index: i,
            reminderTime: `2025-03-${i < 10 ? '0' + i : i}`,
            rules: [rules[i % 4][0]],
            reportStatus: reportStatus,
            relatedTask: i % 2 === 0 ? `TASK-${2025000 + i}` : null,
            relatedTaskId: i % 2 === 0 ? i : null, // 用于跳转的ID
            isReviewCompleted: isReviewCompleted // 用于控制查看模式还是审核模式
        });
    }
    return data;
};

// 表格数据
const dataSource = ref(generateData());

// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 50,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`
});

// 返回上一页
const goBack = () => {
    router.go(-1);
};

// 查看关联任务 - 根据审核状态决定跳转模式
const viewTask = (record) => {
    if (record.relatedTaskId) {
        // 如果任务已审核完成(已上报)，则以查看模式打开；否则以审核模式打开
        const viewMode = record.isReviewCompleted;

        router.push({
            path: `/review/detail/${record.relatedTaskId}`,
            query: { viewMode: viewMode.toString() }
        });
    }
};

// 表格分页变化
const handleTableChange = (pag) => {
    pagination.current = pag.current;
    pagination.pageSize = pag.pageSize;
    // 实际项目中这里应该调用API重新加载数据
};
</script>

<style lang="scss" scoped>
.reminder-detail {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    background-color: #f0f2f5;

    .bread-detail-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        padding: 16px;
    }

    .content-container {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .data-table {
        padding: 16px;
        display: flex;
        flex-direction: column;
        flex: 1;

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

    .rule-item {
        margin-bottom: 4px;

        &:last-child {
            margin-bottom: 0;
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