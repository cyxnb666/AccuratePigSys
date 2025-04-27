<template>
  <div class="tenant-management">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline">
        <a-row :gutter="16" style="width: 100%">
          <a-col>
            <a-form-item label="租户名称:">
              <a-input placeholder="请输入租户名称" v-model:value="searchForm.tenantName" />
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item label="租户编码:">
              <a-input placeholder="请输入租户编码" v-model:value="searchForm.tenantCode" />
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item>
              <a-button type="primary" @click="handleSearch">查 询</a-button>
              <a-button style="margin-left: 8px" @click="handleReset">重 置</a-button>
              <a-button type="primary" style="margin-left: 8px" @click="handleAdd">新增租户</a-button>
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
          <template v-if="column.key === 'status'">
            <a-switch v-model:checked="record.status" :disabled="false" />
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="handleEdit(record)">编 辑</a-button>
            <a-button type="link" danger @click="handleDelete(record)">删 除</a-button>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <div class="pagination">
        <a-pagination v-model:current="pagination.current" :total="pagination.total" :page-size="pagination.pageSize"
          @change="handleTableChange" show-size-changer />
      </div>
    </div>

    <tenant-dialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :record="currentRecord"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import TenantDialog from './components/TenantDialog.vue';

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref({});
// 搜索表单
const searchForm = reactive({
  tenantName: '',
  tenantCode: ''
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
    title: '租户编码',
    dataIndex: 'code',
    key: 'code',
    align: 'center'
  },
  {
    title: '租户名称',
    dataIndex: 'name',
    key: 'name',
    align: 'center'
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
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

// 模拟大量数据
const generateData = () => {
  const data = [];
  for (let i = 1; i <= 50; i++) {
    data.push({
      id: i,
      index: i,
      code: `CODE-${i}`,
      name: `租户名称 ${i}`,
      remark: `这是租户 ${i} 的备注信息`,
      status: i % 3 === 0,
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
  total: 50
});

// 方法
const handleSearch = () => {
  console.log('搜索条件:', searchForm);
  pagination.current = 1;
};

const handleReset = () => {
  searchForm.tenantName = '';
  searchForm.tenantCode = '';
};

const handleDelete = (record) => {
  console.log('删除租户:', record);
};

const handleTableChange = (page) => {
  pagination.current = page;
  // 加载当前页数据
};

// 点击"新增租户"按钮
const handleAdd = () => {
  isEdit.value = false;
  currentRecord.value = {};
  dialogVisible.value = true;
};

// 点击"编辑"按钮
const handleEdit = (record) => {
  isEdit.value = true;
  currentRecord.value = {
    tenantName: record.name,
    tenantCode: record.code,
    tenantAccount: record.code, // 假设账号与编码相同
    tenantPassword: '', // 编辑时不显示密码
    administrativeArea: record.area,
    status: record.status,
    remark: record.remark
  };
  dialogVisible.value = true;
};

// 对话框提交成功回调
const handleDialogSuccess = (data) => {
  if (isEdit.value) {
    // 处理编辑成功逻辑
    console.log('编辑租户成功:', data);
    // 可以在这里刷新数据或更新本地数据
    handleSearch();
  } else {
    // 处理新增成功逻辑
    console.log('新增租户成功:', data);
    // 可以在这里刷新数据
    handleSearch();
  }
};
</script>

<style lang="scss" scoped>
.tenant-management {
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