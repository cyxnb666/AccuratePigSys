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
      <a-table :columns="columns" :data-source="dataSource" :pagination="false" bordered row-key="id"
        :scroll="{ y: tableHeight }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="handleEdit(record)">编 辑</a-button>
            <a-button type="link" @click="handleReportConfig(record)">上报任务配置</a-button>
            <a-button type="link" danger @click="handleDelete(record)">删 除</a-button>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <div class="pagination">
        <a-pagination v-model:current="pagination.current" :total="pagination.total" :page-size="pagination.pageSize"
          @change="handleTableChange" show-size-changer show-quick-jumper />
      </div>
    </div>

    <!-- 上报任务配置对话框 -->
    <report-task-dialog v-model="reportTaskDialogVisible" :record="currentRecord" @success="handleReportTaskSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import ReportTaskDialog from './components/ReportTaskDialog.vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const reportTaskDialogVisible = ref(false);
const currentRecord = ref({});

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
    title: '养殖场地址',
    dataIndex: 'address',
    key: 'address',
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

// 模拟养殖场数据
const generateData = () => {
  const data = [];
  for (let i = 1; i <= 20; i++) {
    data.push({
      id: i,
      index: i,
      district: '四川省',
      farmName: `XXX养殖场`,
      address: `XXXXXXX`,
      remark: `备注`,
      updateTime: '2025-03-31'
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
  total: 2
});

// 方法
const handleSearch = () => {
  console.log('搜索条件:', searchForm);
  pagination.current = 1;
};

const handleReset = () => {
  searchForm.district = undefined;
  searchForm.farmName = '';
};

const handleAdd = () => {
  router.push('/farm/edit');
};

const handleEdit = (record) => {
  router.push(`/farm/edit?id=${record.id}`);
};

const handleReportConfig = (record) => {
  currentRecord.value = { ...record };
  reportTaskDialogVisible.value = true;
};

const handleDelete = (record) => {
  message.success(`已删除养殖场：${record.farmName}`);
};

const handleTableChange = (page) => {
  pagination.current = page;
};

const handleReportTaskSuccess = () => {
  message.success('上报任务配置保存成功');
};
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