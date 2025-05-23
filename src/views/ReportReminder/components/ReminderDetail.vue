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
                    <a-breadcrumb-item>{{ farmName }}提醒记录详情</a-breadcrumb-item>
                </a-breadcrumb>
            </div>
        </div>

        <!-- 数据表格 -->
        <div class="content-container">
            <div class="data-table">
                <a-table :columns="columns" :data-source="dataSource" :pagination="false" :loading="loading" bordered
                    row-key="id" :scroll="{ y: tableHeight }">
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'rule'">
                            <div class="rule-item">
                                {{ record.rule }}
                            </div>
                        </template>
                        <template v-if="column.key === 'reportStatus'">
                            <a-tag :color="getStatusColor(record.registStatus)">
                                {{ getStatusText(record.registStatus) }}
                            </a-tag>
                        </template>
                        <template v-if="column.key === 'relatedTask'">
                            <a-button type="link" @click="viewTask(record)" v-if="record.auditId">
                                {{ record.auditId }}
                            </a-button>
                            <span v-else>-</span>
                        </template>
                    </template>
                </a-table>

                <!-- 分页 -->
                <div class="pagination">
                    <a-pagination :current="pagination.current" :pageSize="pagination.pageSize"
                        :total="pagination.total" @change="handlePaginationChange" show-size-changer
                        :show-total="(total) => `共 ${total} 条记录`" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LeftOutlined } from '@ant-design/icons-vue';
import { getNormalWarns } from '../api';

const router = useRouter();
const route = useRoute();
const isLoading = ref(false);

const tableHeight = ref('calc(80vh - 150px)');
const loading = ref(false);
const dataSource = ref([]);

const farmId = computed(() => route.query.farmId as string);
const farmName = computed(() => route.query.farmName as string || '未知养殖场');

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
        dataIndex: 'warnTime',
        key: 'warnTime',
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

// 分页配置
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0
});

// 获取状态文本
const getStatusText = (status) => {
    switch (status) {
        case 'S': return '已上报';
        case 'O': return '逾期未上报';
        case 'N': return '待上报';
        default: return '未知状态';
    }
};

// 根据状态获取颜色
const getStatusColor = (status) => {
    switch (status) {
        case 'S': return 'success';
        case 'O': return 'error';
        case 'N': return 'warning';
        default: return 'default';
    }
};

// 获取提醒记录详情数据
const fetchWarnDetails = async () => {
    if (!farmId.value) {
        console.error('未提供养殖场ID');
        return;
    }

    loading.value = true;
    try {
        const res = await getNormalWarns(farmId.value, pagination.current, pagination.pageSize);

        if (res && res.records) {
            dataSource.value = res.records.map((item, index) => ({
                ...item,
                id: item.warnId,
                index: (pagination.current - 1) * pagination.pageSize + index + 1,
                rule: item.ruleContent
            }));

            pagination.total = res.total || 0;
        } else {
            dataSource.value = [];
            pagination.total = 0;
        }
    } catch (error) {
        console.error('获取提醒记录详情失败:', error);
        dataSource.value = [];
    } finally {
        loading.value = false;
    }
};

// 返回上一页
const goBack = () => {
    router.go(-1);
};

// 查看关联任务
const viewTask = (record) => {
    if (record.auditId) {
        // 根据审核状态决定是否以只读模式打开
        // 只有在待审核状态(AUDITING)时才可编辑，其他状态只能查看
        const isViewMode = record.auditStatus !== 'AUDITING';

        router.push({
            path: `/AUDITD/detail/${record.auditId}`,
            query: { viewMode: isViewMode.toString() }
        });
    }
};

const handlePaginationChange = (page, pageSize) => {
    if (isLoading.value) return;

    // 设置锁以防止重复请求
    isLoading.value = true;

    pagination.current = page;
    pagination.pageSize = pageSize;

    // 请求完成后在 finally 中解锁
    fetchWarnDetails().finally(() => {
        isLoading.value = false;
    });
};

// 初始化加载数据
onMounted(() => {
    fetchWarnDetails();
});
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

        .pagination {
            margin-top: 16px;
            text-align: right;
        }
    }

    .rule-item {
        margin-bottom: 4px;

        &:last-child {
            margin-bottom: 0;
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