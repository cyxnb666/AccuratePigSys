<template>
  <div class="user-management">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline">
        <a-row :gutter="16" style="width: 100%">
          <a-col>
            <a-form-item label="行政区划:">
              <a-tree-select v-model:value="searchForm.district" :tree-data="areaTreeData" placeholder="请选择行政区划"
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
                <a-select-option v-for="role in roleOptions" :key="role.roleCode" :value="role.roleCode">
                  {{ role.roleName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item label="状态:">
              <a-select v-model:value="searchForm.status" placeholder="全部" allow-clear style="min-width: 120px">
                <a-select-option value="1">启用</a-select-option>
                <a-select-option value="0">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col>
            <a-form-item>
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
              <a-button type="primary" style="margin-left: 8px" @click="handleAdd">新增用户</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 数据表格 -->
    <div class="data-table">
      <a-table :columns="columns" :data-source="dataSource" :loading="loading" :pagination="false" bordered
        row-key="userId" :scroll="{ y: tableHeight }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-switch :checked="record.enabled === '1'" @change="() => handleStatusChange(record)" />
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="handleEdit(record)" :loading="editingId === record.userId && editLoading">编
              辑</a-button>
            <a-button type="link" @click="handleResetPassword(record)">重置密码</a-button>
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

    <!-- 用户表单对话框 -->
    <user-dialog v-model="dialogVisible" :is-edit="isEdit" :record="currentRecord" 
    :area-tree-data="areaTreeData" :role-options="roleOptions" 
    :livestock-farms="livestockFarms" @success="handleDialogSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import UserDialog from './components/UserDialog.vue';
import { message, Modal } from 'ant-design-vue';
import { createVNode } from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import {
  getUserList,
  getAreaTrees,
  getRoles,
  getLivestockFarms,
  enableUser,
  deleteUser,
  getUserDetail,
  resetUserPwd
} from './api';

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<any>({});
const loading = ref(false);
const areaTreeData = ref<any[]>([]);
const roleOptions = ref<any[]>([]);
const livestockFarms = ref<any[]>([]);
const editLoading = ref(false);
const editingId = ref<string | null>(null);

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
    dataIndex: 'areaname',
    key: 'areaname',
    align: 'center'
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    key: 'userName',
    align: 'center'
  },
  {
    title: '手机号',
    dataIndex: 'userMobile',
    key: 'userMobile',
    align: 'center'
  },
  {
    title: '角色',
    dataIndex: 'roleName',
    key: 'roleName',
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'enabled',
    key: 'status',
    align: 'center'
  },
  {
    title: '最近登录日期',
    dataIndex: 'loginTime',
    key: 'loginTime',
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

// 获取角色数据
const fetchRoles = async () => {
  try {
    const res = await getRoles();
    if (res) {
      roleOptions.value = res || [];
    }
  } catch (error) {
    console.error('获取角色数据失败:', error);
  }
};

// 获取养殖场数据
const fetchLivestockFarms = async () => {
  try {
    const res = await getLivestockFarms();
    if (res) {
      livestockFarms.value = res || [];
    }
  } catch (error) {
    console.error('获取养殖场数据失败:', error);
  }
};

// 获取表格数据
const fetchTableData = async () => {
  loading.value = true;
  try {
    const params = {
      condition: {
        areacodes: searchForm.district ? [searchForm.district] : [],
        enabled: searchForm.status || "",
        roleCode: searchForm.role || "",
        userMobile: searchForm.phone || "",
        userName: searchForm.username || ""
      },
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    };

    const res = await getUserList(params);

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
    console.error('获取用户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchTableData();
};

const handleReset = () => {
  searchForm.district = undefined;
  searchForm.username = '';
  searchForm.phone = '';
  searchForm.role = undefined;
  searchForm.status = undefined;
  handleSearch();
};

const handleDelete = (record) => {
  Modal.confirm({
    title: '确认删除',
    icon: createVNode(ExclamationCircleOutlined),
    content: `确定要删除用户 "${record.userName}" 吗？此操作不可恢复。`,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await deleteUser(record.userId);
        message.success('删除用户成功');
        fetchTableData();
      } catch (error) {
        console.error('删除用户失败:', error);
      }
    }
  });
};

const handleTableChange = (page, pageSize) => {
  pagination.current = page;
  pagination.pageSize = pageSize;
  fetchTableData();
};

// 切换用户状态
const handleStatusChange = async (record) => {
  const originalValue = record.enabled;

  try {
    await enableUser(record.userId);
    message.success(`${originalValue === "1" ? '禁用' : '启用'}用户成功`);
    fetchTableData();
  } catch (error) {
    console.error('更新用户状态失败:', error);
  }
};

// 点击"新增用户"按钮
const handleAdd = () => {
  isEdit.value = false;
  currentRecord.value = {};
  dialogVisible.value = true;
};

// 点击"编辑"按钮
const handleEdit = async (record) => {
  try {
    // 设置当前正在编辑的记录ID和loading状态
    editingId.value = record.userId;
    editLoading.value = true;

    const res = await getUserDetail(record.userId);
    if (res) {
      isEdit.value = true;
      currentRecord.value = res;
      dialogVisible.value = true;
    }
  } catch (error) {
    console.error('获取用户详情失败:', error);
  } finally {
    // 无论成功还是失败，都重置loading状态
    editLoading.value = false;
    editingId.value = null;
  }
};

// 重置密码
const handleResetPassword = (record) => {
  Modal.confirm({
    title: '确认重置密码',
    icon: createVNode(ExclamationCircleOutlined),
    content: `确定要重置用户 "${record.userName}" 的密码吗？`,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await resetUserPwd(record.userId);
        message.success(`已重置${record.userName}的密码`);
      } catch (error) {
        console.error('重置密码失败:', error);
      }
    }
  });
};

// 对话框提交成功回调
const handleDialogSuccess = () => {
  fetchTableData();
};

onMounted(() => {
  fetchAreaTrees();
  fetchLivestockFarms();
  fetchRoles();
  fetchTableData();
});
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