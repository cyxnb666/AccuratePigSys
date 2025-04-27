<template>
  <div class="user-management">
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
            <a-form-item label="用户名:">
              <a-input placeholder="请输入用户名" v-model:value="searchForm.username" />
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item label="手机号:">
              <a-input placeholder="请输入手机号" v-model:value="searchForm.phone" />
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item label="角色:">
              <a-select v-model:value="searchForm.role" placeholder="请选择角色" allow-clear style="min-width: 120px">
                <a-select-option value="业务管理者">业务管理者</a-select-option>
                <a-select-option value="管理员">管理员</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item label="状态:">
              <a-select v-model:value="searchForm.status" placeholder="全部" allow-clear style="min-width: 120px">
                <a-select-option value="true">启用</a-select-option>
                <a-select-option value="false">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item>
              <a-button type="primary" @click="handleSearch">查 询</a-button>
              <a-button style="margin-left: 8px" @click="handleReset">重 置</a-button>
              <a-button type="primary" style="margin-left: 8px" @click="handleAdd">新增用户</a-button>
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
            <a-switch v-model:checked="record.status" />
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="handleEdit(record)">编 辑</a-button>
            <a-button type="link" @click="handleResetPassword(record)">重置密码</a-button>
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

    <!-- 用户表单对话框 -->
    <user-dialog v-model="dialogVisible" :is-edit="isEdit" :record="currentRecord" @success="handleDialogSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import UserDialog from './components/UserDialog.vue';
import { message } from 'ant-design-vue';

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref({});

// 搜索表单
const searchForm = reactive({
  district: undefined,
  username: '',
  phone: '',
  role: undefined,
  status: undefined,
});

// 表格高度
const tableHeight = ref('calc(80vh - 180px)');

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
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    align: 'center'
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
    align: 'center'
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center'
  },
  {
    title: '最近登录日期',
    dataIndex: 'lastLoginDate',
    key: 'lastLoginDate',
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

// 模拟用户数据
const generateData = () => {
  const data = [];
  for (let i = 1; i <= 0; i++) {
    data.push({
      id: i,
      index: i,
      district: '四川省',
      username: i === 1 ? '张三' : '李四',
      phone: i === 1 ? '13412341234' : '13512351235',
      role: i === 1 ? '管理员' : '业务管理者',
      status: i === 1 ? true : false,
      lastLoginDate: '2025-03-31',
      updateTime: '2025-03-31',
      loginAccount: i === 1 ? 'admin' : 'user',
      loginPassword: '******'
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
  searchForm.username = '';
  searchForm.phone = '';
  searchForm.role = undefined;
  searchForm.status = undefined;
};

const handleAdd = () => {
  isEdit.value = false;
  currentRecord.value = {};
  dialogVisible.value = true;
};

const handleEdit = (record) => {
  isEdit.value = true;
  currentRecord.value = {
    district: record.district,
    username: record.username,
    phone: record.phone,
    role: record.role,
    status: record.status,
    loginAccount: record.loginAccount,
    loginPassword: '********',
    remark: record.remark || ''
  };
  dialogVisible.value = true;
};

const handleResetPassword = (record) => {
  message.success(`已重置${record.username}的密码`);
};

const handleDelete = (record) => {
  message.success(`已删除用户：${record.username}`);
};

const handleTableChange = (page) => {
  pagination.current = page;
};

const handleDialogSuccess = (data) => {
  if (isEdit.value) {
    message.success('编辑用户成功');
  } else {
    message.success('新增用户成功');
  }

  handleSearch();
};
</script>

<style lang="scss" scoped>
.user-management {
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