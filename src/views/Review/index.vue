<template>
    <div class="review-container">
        <a-tabs v-model:activeKey="activeKey" class="review-tabs">
            <a-tab-pane key="pending" tab="待审核任务">
                <pending-review v-if="activeKey === 'pending'" :area-tree-data="areaTreeData" />
            </a-tab-pane>
            <a-tab-pane key="completed" tab="已审核任务">
                <completed-review v-if="activeKey === 'completed'" :area-tree-data="areaTreeData" />
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import PendingReview from './components/PendingReview.vue';
import CompletedReview from './components/CompletedReview.vue';
import { getAreaTrees } from './api';

const route = useRoute();
const activeKey = ref('pending');
const areaTreeData = ref<any[]>([]);

watch(() => route.query.activeKey, (newActiveKey) => {
    if (newActiveKey === 'pending' || newActiveKey === 'completed') {
        activeKey.value = newActiveKey as string;
    }
}, { immediate: true });

// 转换行政区划数据为树形结构
const transformAreaData = (areaList: any[]): any[] => {
    return areaList.map(area => {
        const node = {
            title: area.areaname,
            value: area.areacode,
            key: area.areacode,
            children: area.children ? transformAreaData(area.children) : []
        };
        return node;
    });
};

// 获取行政区划数据
const fetchAreaTrees = async () => {
    try {
        const res = await getAreaTrees();
        if (res) {
            areaTreeData.value = transformAreaData(res);
        }
    } catch (error) {
        console.error('获取行政区划数据失败:', error);
    }
};

onMounted(() => {
    fetchAreaTrees();
});
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