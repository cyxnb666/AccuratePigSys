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
        <a-table 
          :columns="columns" 
          :data-source="dataSource" 
          :pagination="false" 
          bordered
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-switch 
                v-model:checked="record.status" 
                :disabled="false"
              />
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" @click="handleEdit(record)">编 辑</a-button>
              <a-button type="link" danger @click="handleDelete(record)">删 除</a-button>
            </template>
          </template>
        </a-table>
  
        <!-- 分页 -->
        <div class="pagination">
          <a-pagination 
            v-model:current="pagination.current" 
            :total="pagination.total" 
            :page-size="pagination.pageSize"
            @change="handleTableChange"
            show-size-changer
            show-quick-jumper
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue';
  
  // 搜索表单
  const searchForm = reactive({
    tenantName: '',
    tenantCode: ''
  });
  
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
  
  // 表格数据
  const dataSource = ref([
    {
      id: 1,
      index: 1,
      code: 'ZXCL',
      name: '智迅车联',
      remark: '备注',
      status: true,
      updateTime: '2025-03-31'
    },
    {
      id: 2,
      index: 2,
      code: 'CS',
      name: '测试',
      remark: '备注',
      status: false,
      updateTime: '2025-03-31'
    }
  ]);
  
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
    searchForm.tenantName = '';
    searchForm.tenantCode = '';
  };
  
  const handleAdd = () => {
    console.log('添加租户');
  };
  
  const handleEdit = (record) => {
    console.log('编辑租户:', record);
  };
  
  const handleDelete = (record) => {
    console.log('删除租户:', record);
  };
  
  const handleTableChange = (page) => {
    pagination.current = page;
    // 加载当前页数据
  };
  </script>
  
  <style lang="scss" scoped>
  .tenant-management {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
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
      
      .pagination {
        margin-top: 16px;
        text-align: right;
      }
    }
  }
  
  // 表格样式优化
  :deep(.ant-table-wrapper) {
    .ant-table-thead > tr > th {
      background-color: #F3F5F9;
      font-weight: 500;
    }
    
    .ant-table-tbody > tr:nth-child(odd) {
      background-color: #F6F7FA;
    }
    
    .ant-table-tbody > tr:nth-child(even) {
      background-color: #FFFFFF;
    }
  }
  </style>