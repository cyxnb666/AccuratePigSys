<template>
    <div class="detail-card">
        <div class="card-header">
            <div class="title">当前存栏信息</div>
            <!-- 保留查看更多按钮功能 -->
            <div v-if="showViewMore" class="view-more-link">
                <a @click="$emit('view-more')">查看更多 <right-outlined /></a>
            </div>
        </div>
        <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
            <a-tab-pane key="1" tab="存栏记录">
                <a-table :columns="stockColumns" :data-source="stockData"
                    :pagination="showPagination ? stockPagination : false" bordered>
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'action'">
                            <a href="javascript:;" @click="$emit('view-detail', record)">详情</a>
                        </template>
                        <template v-if="column.key === 'registStatus'">
                            <a-tag :color="record.registStatus === 'AUDITSUCC' ? 'success' : 'error'">
                                {{ record.registStatus === 'AUDITSUCC' ? '审核通过' : '审核不通过' }}
                            </a-tag>
                        </template>
                        <template v-if="column.key === 'index'">
                            {{ record._index }}
                        </template>
                    </template>
                </a-table>
            </a-tab-pane>
            <a-tab-pane key="2" tab="出栏记录">
                <a-table :columns="outboundColumns" :data-source="outboundData"
                    :pagination="showPagination ? outboundPagination : false" bordered>
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'index'">
                            {{ record._index }}
                        </template>
                    </template>
                </a-table>
            </a-tab-pane>
            <a-tab-pane key="3" tab="入栏记录">
                <a-table :columns="inboundColumns" :data-source="inboundData"
                    :pagination="showPagination ? inboundPagination : false" bordered>
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'index'">
                            {{ record._index }}
                        </template>
                    </template>
                </a-table>
            </a-tab-pane>
            <a-tab-pane key="4" tab="死亡记录">
                <a-table :columns="deathColumns" :data-source="deathData"
                    :pagination="showPagination ? deathPagination : false" bordered>
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'action'">
                            <a href="javascript:;" @click="$emit('view-detail', record)">详情</a>
                        </template>
                        <template v-if="column.key === 'index'">
                            {{ record._index }}
                        </template>
                    </template>
                </a-table>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { RightOutlined } from '@ant-design/icons-vue';

const props = defineProps({
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
    // 修改为四个独立的分页
    stockPagination: {
        type: Object,
        required: true,
        default: () => ({})
    },
    outboundPagination: {
        type: Object,
        required: true,
        default: () => ({})
    },
    inboundPagination: {
        type: Object,
        required: true,
        default: () => ({})
    },
    deathPagination: {
        type: Object,
        required: true,
        default: () => ({})
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
const emit = defineEmits(['view-detail', 'view-more', 'tab-change']);

const activeKey = ref('1');

// 处理标签页切换
const handleTabChange = (newActiveKey) => {
    activeKey.value = newActiveKey;
    // 通知父组件标签已切换
    emit('tab-change', newActiveKey);
};

// 为数据添加索引
watch(() => props.stockData, (newData) => {
    if (Array.isArray(newData)) {
        newData.forEach((item, index) => {
            item._index = index + 1 + (props.stockPagination.current - 1) * props.stockPagination.pageSize;
        });
    }
}, { deep: true });

watch(() => props.outboundData, (newData) => {
    if (Array.isArray(newData)) {
        newData.forEach((item, index) => {
            item._index = index + 1 + (props.outboundPagination.current - 1) * props.outboundPagination.pageSize;
        });
    }
}, { deep: true });

watch(() => props.inboundData, (newData) => {
    if (Array.isArray(newData)) {
        newData.forEach((item, index) => {
            item._index = index + 1 + (props.inboundPagination.current - 1) * props.inboundPagination.pageSize;
        });
    }
}, { deep: true });

watch(() => props.deathData, (newData) => {
    if (Array.isArray(newData)) {
        newData.forEach((item, index) => {
            item._index = index + 1 + (props.deathPagination.current - 1) * props.deathPagination.pageSize;
        });
    }
}, { deep: true });

// 表格列定义 - 根据真实API数据调整
const stockColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '上报时间', dataIndex: 'registTime', key: 'registTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'porkerCount', key: 'porkerCount', align: 'center' },
    { title: '仔猪数量', dataIndex: 'pigletCount', key: 'pigletCount', align: 'center' },
    { title: '母猪数量', dataIndex: 'sowCount', key: 'sowCount', align: 'center' },
    { title: '人工审核数量', dataIndex: 'persionalCheckCount', key: 'persionalCheckCount', align: 'center' },
    { title: '审核结果', dataIndex: 'registStatus', key: 'registStatus', align: 'center' },
    { title: '操作', key: 'action', align: 'center' },
];

// 出栏记录表格列
const outboundColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '业务ID', dataIndex: 'bizId', key: 'bizId', align: 'center' },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', align: 'center' },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate', align: 'center' },
    { title: '上报时间', dataIndex: 'registTime', key: 'registTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'porkerCount', key: 'porkerCount', align: 'center' },
    { title: '仔猪数量', dataIndex: 'pigletCount', key: 'pigletCount', align: 'center' },
    { title: '母猪数量', dataIndex: 'sowCount', key: 'sowCount', align: 'center' },
];

// 入栏记录表格列
const inboundColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '业务ID', dataIndex: 'bizId', key: 'bizId', align: 'center' },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', align: 'center' },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate', align: 'center' },
    { title: '上报时间', dataIndex: 'registTime', key: 'registTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'porkerCount', key: 'porkerCount', align: 'center' },
    { title: '仔猪数量', dataIndex: 'pigletCount', key: 'pigletCount', align: 'center' },
    { title: '母猪数量', dataIndex: 'sowCount', key: 'sowCount', align: 'center' },
];

// 死亡记录表格列
const deathColumns = [
    { title: '序号', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
    { title: '业务ID', dataIndex: 'bizId', key: 'bizId', align: 'center' },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', align: 'center' },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate', align: 'center' },
    { title: '上报时间', dataIndex: 'registTime', key: 'registTime', align: 'center' },
    { title: '育肥猪数量', dataIndex: 'porkerCount', key: 'porkerCount', align: 'center' },
    { title: '仔猪数量', dataIndex: 'pigletCount', key: 'pigletCount', align: 'center' },
    { title: '母猪数量', dataIndex: 'sowCount', key: 'sowCount', align: 'center' },
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