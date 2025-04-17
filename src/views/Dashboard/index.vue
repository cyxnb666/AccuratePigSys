<template>
    <div class="dashboard-container">
      <a-row :gutter="16">
        <a-col :span="6" v-for="card in cards" :key="card.title">
          <a-card :title="card.title" :bordered="false">
            <template #extra><a href="#">详情</a></template>
            <p>{{ card.value }}</p>
          </a-card>
        </a-col>
      </a-row>
  
      <a-divider />
  
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card title="最近活动" :bordered="false">
            <a-list item-layout="horizontal" :data-source="activities">
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta :title="item.title" :description="item.time">
                    <template #avatar>
                      <a-avatar :style="{ backgroundColor: item.color }">{{ item.avatar }}</a-avatar>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card title="核验数据概览" :bordered="false">
            <div style="margin-bottom: 16px">
              <span>精准核验完成率: </span>
              <a-progress :percent="75" status="active" />
            </div>
            <div style="margin-bottom: 16px">
              <span>核验任务进度: </span>
              <a-progress :percent="45" status="active" />
            </div>
            <div>
              <span>系统负载情况: </span>
              <a-progress :percent="30" status="active" />
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const cards = ref([
    { title: '待核验车辆', value: '126' },
    { title: '已完成核验', value: '894' },
    { title: '系统预警', value: '12' },
    { title: '待处理审核', value: '5' }
  ]);
  
  const activities = ref([
    { title: '某市完成核验任务', time: '刚刚', avatar: '核', color: '#1890ff' },
    { title: '新增核验数据58条', time: '10分钟前', avatar: '新', color: '#52c41a' },
    { title: '系统自动更新完成', time: '30分钟前', avatar: '更', color: '#faad14' },
    { title: '管理员发布新任务', time: '1小时前', avatar: '任', color: '#f5222d' }
  ]);
  </script>
  
  <style scoped>
  .dashboard-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  :deep(.ant-card) {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  </style>