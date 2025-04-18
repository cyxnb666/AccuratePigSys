<template>
    <div class="info-section">
        <div class="section-header">
            <div class="title">异常预警</div>
            <div class="more-link">
                <a @click="$emit('view-more')">查看更多 <right-outlined /></a>
            </div>
        </div>
        <div class="warning-table">
            <a-table :columns="warningColumns" :data-source="warningData" :pagination="false" size="small"
                :bordered="true">
            </a-table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { RightOutlined } from '@ant-design/icons-vue';

defineProps({
    warningData: {
        type: Array,
        required: true,
        default: () => []
    }
});

defineEmits(['view-more']);

const warningColumns = [
    { title: '任务号', dataIndex: 'taskId', key: 'taskId', align: 'center' },
    { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime', align: 'center' },
    { title: '上报总数', dataIndex: 'totalReported', key: 'totalReported', align: 'center' },
    { title: '人工审核数量', dataIndex: 'manualReviewCount', key: 'manualReviewCount', align: 'center' },
    { title: '偏差率', dataIndex: 'deviationRate', key: 'deviationRate', align: 'center' },
];
</script>

<style lang="scss" scoped>
.info-section {
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .title {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            position: relative;
            padding-left: 10px;

            &:before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 4px;
                height: 16px;
                background-color: #5276E5;
                border-radius: 2px;
            }
        }

        .more-link {
            a {
                color: #5276E5;
                font-size: 14px;
            }
        }
    }

    .warning-table {
        :deep(.ant-table-small) {
            font-size: 12px;
        }

        :deep(.ant-table-thead > tr > th) {
            background-color: #f6f7fa;
            font-weight: normal;
            color: #666;
        }
    }
}
</style>