<template>
    <div class="review-container">
        <a-tabs v-model:activeKey="activeKey" class="review-tabs">
            <a-tab-pane key="pending" tab="待审核任务">
                <pending-review v-if="activeKey === 'pending'" />
            </a-tab-pane>
            <a-tab-pane key="completed" tab="已审核任务">
                <completed-review v-if="activeKey === 'completed'" />
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PendingReview from './components/PendingReview.vue';
import CompletedReview from './components/CompletedReview.vue';

const activeKey = ref('pending');
</script>

<style lang="scss" scoped>
.review-container {
    height: 100%;
    padding: 16px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    .review-tabs {
        height: 100%;

        :deep(.ant-tabs-content) {
            height: calc(100%);

            .ant-tabs-tabpane {
                height: 100%;
            }
        }
    }
}
</style>