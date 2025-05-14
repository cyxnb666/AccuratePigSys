<template>
  <div class="tenant-management">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline">
        <a-row :gutter="16" style="width: 100%">
          <a-col>
            <a-form-item label="租户名称:">
              <a-input placeholder="请输入租户名称" v-model:value="searchForm.tencentName" />
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item label="租户编码:">
              <a-input placeholder="请输入租户编码" v-model:value="searchForm.tencentCode" />
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
              <a-button type="primary" style="margin-left: 8px" @click="handleAdd">新增租户</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 数据表格 -->
    <div class="data-table">
      <a-table :columns="columns" :data-source="dataSource" :loading="loading" :pagination="false" bordered row-key="id"
        :scroll="{ y: tableHeight }">
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.key === 'enabled'">
            <a-switch :checked="record.enabled === '1'" @change="() => handleStatusChange(record)" />
          </template>
          <template v-if="column.key === 'remark'">
            <a-tooltip placement="topLeft" :title="record.remark || '-'">
              <span class="col-sql">{{ record.remark || '-' }}</span>
            </a-tooltip>
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="handleEdit(record)"
              :loading="editingId === record.tencentCode && editLoading">编辑</a-button>
            <a-button type="link" danger @click="handleDelete(record)">删除</a-button>
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

    <tenant-dialog v-model="dialogVisible" :is-edit="isEdit" :record="currentRecord" :area-tree-data="areaTreeData"
      @success="handleDialogSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { createVNode } from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import TenantDialog from './components/TenantDialog.vue';
import {
  getTenantList,
  getAreaTrees,
  enableTenant,
  deleteTenant,
  getTenantDetail
} from './api';

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<any>({});
const loading = ref(false);
const areaTreeData = ref<any[]>([]);
const editLoading = ref(false);
const editingId = ref<string | null>(null);

// 搜索表单
const searchForm = reactive({
  tencentName: '',
  tencentCode: ''
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
    dataIndex: 'tencentCode',
    key: 'tencentCode',
    align: 'center'
  },
  {
    title: '租户名称',
    dataIndex: 'tencentName',
    key: 'tencentName',
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
    dataIndex: 'enabled',
    key: 'enabled',
    align: 'center',
    customRender: ({ text }) => {
      return text === "0";
    }
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

// 表格数据
const dataSource = ref<any[]>([]);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

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

const fetchTableData = async () => {
  loading.value = true;
  try {
    const params = {
      condition: {
        tencentCode: searchForm.tencentCode,
        tencentName: searchForm.tencentName
      },
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };

    const res = await getTenantList(params);

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
    console.error('获取租户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchTableData();
};

const handleReset = () => {
  searchForm.tencentName = '';
  searchForm.tencentCode = '';
  handleSearch();
};

const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    icon: createVNode(ExclamationCircleOutlined),
    content: `确定要删除租户 "${record.tencentName}" 吗？此操作不可恢复。`,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteTenant(record.tencentCode);
        message.success('删除租户成功');
        fetchTableData();
      } catch (error) {
        console.error('删除租户失败:', error);
      }
    }
  });
};

const handleTableChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  fetchTableData();
};

// 切换租户状态
const handleStatusChange = async (record) => {
  const originalValue = record.enabled;

  try {
    await enableTenant(record.tencentCode);
    message.success(`${originalValue === "1" ? '禁用' : '启用'}租户成功`);
    fetchTableData();
  } catch (error) {
    console.error('更新租户状态失败:', error);
  }
};

const handleAdd = () => {
  isEdit.value = false;
  currentRecord.value = {};
  dialogVisible.value = true;
};

const handleEdit = async (record) => {
  try {
    // 设置当前正在编辑的记录ID和loading状态
    editingId.value = record.tencentCode;
    editLoading.value = true;

    const res = await getTenantDetail(record.tencentCode);
    if (res) {
      console.log(res);
      isEdit.value = true;
      currentRecord.value = res;
      dialogVisible.value = true;
    }
  } catch (error) {
    console.error('获取租户详情失败:', error);
  } finally {
    editLoading.value = false;
    editingId.value = null;
  }
};

const handleDialogSuccess = () => {
  fetchTableData();
};

onMounted(() => {
  fetchAreaTrees();
  fetchTableData();
});
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

    .col-sql {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
      width: 100px;
    }

    .pagination {
      margin-top: 16px;
      text-align: right;
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