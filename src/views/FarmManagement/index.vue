<template>
  <div class="farm-management">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline">
        <a-row :gutter="16" style="width: 100%">
          <a-col>
            <a-form-item label="行政区划:">
              <a-tree-select v-model:value="searchForm.district" :tree-data="districtTreeData" placeholder="请选择行政区划"
                allow-clear :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-node-filter-prop="'title'"
                :show-search="true" style="min-width: 200px" />
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item label="养殖场名称:">
              <a-input placeholder="请输入养殖场名称" v-model:value="searchForm.farmName" />
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item>
              <a-button type="primary" @click="handleSearch">查 询</a-button>
              <a-button style="margin-left: 8px" @click="handleReset">重 置</a-button>
              <a-button type="primary" style="margin-left: 8px" @click="handleAdd">新增养殖场</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 数据表格 -->
    <div class="data-table">
      <a-table :columns="columns" :data-source="dataSource" :pagination="false" :loading="loading" bordered row-key="id"
        :scroll="{ y: tableHeight }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'remark'">
            <a-tooltip placement="topLeft" :title="record.remark">
              <span class="col-sql">{{ record.remark }}</span>
            </a-tooltip>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="handleEdit(record)">编辑</a-button>
            <a-button type="link" @click="handleReportConfig(record)">上报任务配置</a-button>
            <a-button type="link" danger @click="handleDelete(record)">删 除</a-button>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <div class="pagination">
        <a-pagination v-model:current="pagination.current" v-model:pageSize="pagination.pageSize"
          :total="pagination.total" @change="handleTableChange" show-size-changer
          :show-total="(total) => `共 ${total} 条记录`" />
      </div>
    </div>

    <!-- 上报任务配置对话框 -->
    <report-task-dialog v-model="reportTaskDialogVisible" :record="currentRecord" @success="handleReportTaskSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import ReportTaskDialog from './components/ReportTaskDialog.vue';
import { message, Modal } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { getAreaTrees, getFarmList, deleteFarm, saveReportTask } from './api';

const router = useRouter();
const reportTaskDialogVisible = ref(false);
const currentRecord = ref({});
const loading = ref(false);

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
    dataIndex: 'provinceName',
    key: 'provinceName',
    align: 'center'
  },
  {
    title: '养殖场名称',
    dataIndex: 'farmName',
    key: 'farmName',
    align: 'center'
  },
  {
    title: '养殖场地址',
    dataIndex: 'farmAddress',
    key: 'farmAddress',
    align: 'center'
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    align: 'center'
  },
  {
    title: '编辑日期',
    dataIndex: 'updateTime',
    key: 'updateTime',
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    align: 'center'
  }
];

// 行政区划树形数据
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

// 行政区划树形数据
const districtTreeData = ref([]);

const fetchAreaTrees = async () => {
  try {
    const res = await getAreaTrees();
    if (res) {
      districtTreeData.value = transformAreaData(res);
    }
  } catch (error) {
    console.error('获取行政区划数据失败:', error);
  }
};

// 表格数据
const dataSource = ref<any[]>([]);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

const fetchTableData = async () => {
  loading.value = true;
  try {
    const params = {
      condition: {
        areacode: searchForm.district,
        farmName: searchForm.farmName
      },
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };

    const res = await getFarmList(params);

    if (res) {
      // 添加索引
      const records = res.records || [];
      dataSource.value = records.map((item: any, index: number) => ({
        ...item,
        index: (pagination.current - 1) * pagination.pageSize + index + 1
      }));

      pagination.total = res.total || 0;
    }
  } catch (error) {
    console.error('获取养殖场列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 方法
const handleSearch = () => {
  pagination.current = 1;
  fetchTableData();
};

const handleReset = () => {
  searchForm.district = undefined;
  searchForm.farmName = '';
  handleSearch();
};

const handleAdd = () => {
  router.push('/farm/edit');
};

const handleEdit = (record) => {
  router.push(`/farm/edit?id=${record.farmId}`);
};

const handleReportConfig = (record) => {
  currentRecord.value = { ...record };
  reportTaskDialogVisible.value = true;
};

const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除养殖场：${record.farmName}吗？`,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteFarm(record.id);
        message.success(`已删除养殖场：${record.farmName}`);
        fetchTableData();
      } catch (error) {
        console.error('删除养殖场失败:', error);
      }
    }
  });
};

const handleTableChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  fetchTableData();
};

const handleReportTaskSuccess = async (config) => {
  try {
    await saveReportTask(currentRecord.value.id, config);
    message.success('上报任务配置保存成功');
  } catch (error) {
    console.error('保存上报任务配置失败:', error);
  }
};

onMounted(() => {
  fetchAreaTrees();
  fetchTableData();
});
</script>

<style lang="scss" scoped>
.farm-management {
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

  .col-sql {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    width: 100px;
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