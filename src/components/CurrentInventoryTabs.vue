<template>
    <div class="detail-card">
        <div class="card-header">
            <div class="title">当前存栏信息</div>
            <!-- 添加可选的查看更多按钮 -->
            <div v-if="showViewMore" class="view-more-link">
                <a @click="$emit('view-more')">查看更多 <right-outlined /></a>
            </div>
        </div>
        <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
            <a-tab-pane key="1" tab="存栏记录">
                <a-table :columns="stockColumns" :data-source="stockData"
                    :pagination="showPagination ? pagination : false" bordered>
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'action'">
                            <a href="javascript:;" @click="$emit('view-detail', record)">详情</a>
                        </template>
                        <template v-if="column.key === 'reviewResult'">
                            <a-tag :color="record.reviewResult === '审核通过' ? 'success' : 'error'">
                                {{ record.reviewResult }}
                            </a-tag>
                        </template>
                    </template>
                </a-table>
            </a-tab-pane>
            <a-tab-pane key="2" tab="出栏记录">
                <a-table :columns="outboundColumns" :data-source="outboundData"
                    :pagination="showPagination ? pagination : false" bordered>
                </a-table>
            </a-tab-pane>
            <a-tab-pane key="3" tab="入栏记录">
                <a-table :columns="inboundColumns" :data-source="inboundData"
                    :pagination="showPagination ? pagination : false" bordered>
                </a-table>
            </a-tab-pane>
            <a-tab-pane key="4" tab="死亡记录">
                <a-table :columns="deathColumns" :data-source="deathData"
                    :pagination="showPagination ? pagination : false" bordered>
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'action'">
                            <a href="javascript:;" @click="$emit('view-detail', record)">详情</a>
                        </template>
                    </template>
                </a-table>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RightOutlined } from '@ant-design/icons-vue';

defineProps({
    stockData: {
        type: Array,
        required: true,
        default: () => []
    },
    outboundData: {
        type: Array,
        required: true,
        default: () => []
    },
    inboundData: {
        type: Array,
        required: true,
        default: () => []
    },
    deathData: {
        type: Array,
        required: true,
        default: () => []
    },
    pagination: {
        type: Object,
        required: true,
        default: () => ({
            current: 1,
            pageSize: 10,
            total: 50,
            showTotal: (total) => `共 ${total} 条`,
            onChange: () => { }
        })
    },
    showViewMore: {
        type: Boolean,
        default: false
    },
    showPagination: {
        type: Boolean,
        default: true
    }
});
defineEmits(['view-detail', 'view-more']);

const handleTabChange = (newActiveKey) => {
    if (pagination && pagination.onChange && showPagination) {
        pagination.current = 1;
    }
};
const activeKey = ref('1');

// 表格列定义
const stockColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '时间', dataIndex: 'time', key: 'time', align: 'center' },
    { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'fatteningPigs', key: 'fatteningPigs', align: 'center' },
    { title: '仔猪数量', dataIndex: 'piglets', key: 'piglets', align: 'center' },
    { title: '母猪数量', dataIndex: 'sows', key: 'sows', align: 'center' },
    { title: '审核结果', dataIndex: 'reviewResult', key: 'reviewResult', align: 'center' },
    { title: '操作', key: 'action', align: 'center' },
];

// 出栏记录表格列
const outboundColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '出栏日期', dataIndex: 'date', key: 'date', align: 'center' },
    { title: '出栏类型', dataIndex: 'type', key: 'type', align: 'center' },
    { title: '出栏数量', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    { title: '出栏原因', dataIndex: 'reason', key: 'reason', align: 'center' },
];

// 入栏记录表格列
const inboundColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '入栏日期', dataIndex: 'date', key: 'date', align: 'center' },
    { title: '入栏类型', dataIndex: 'type', key: 'type', align: 'center' },
    { title: '入栏数量', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    { title: '入栏来源', dataIndex: 'source', key: 'source', align: 'center' },
];

// 死亡记录表格列
const deathColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '死亡日期', dataIndex: 'date', key: 'date', align: 'center' },
    { title: '死亡类型', dataIndex: 'type', key: 'type', align: 'center' },
    { title: '死亡数量', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    { title: '死亡原因', dataIndex: 'reason', key: 'reason', align: 'center' },
    { title: '操作', key: 'action', align: 'center' },
];
</script>

<style lang="scss" scoped>
.detail-card {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    padding: 16px;

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;
        margin-bottom: 16px;

        .title {
            font-size: 16px;
            font-weight: 500;
            color: #333;
        }

        .view-more-link {
            a {
                color: #5276E5;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
            }
        }
    }
}
</style>