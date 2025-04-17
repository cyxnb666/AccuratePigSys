<template>
  <a-modal :title="isEdit ? '编辑用户' : '新增用户'" v-model:open="dialogVisible" :destroyOnClose="true" :maskClosable="false"
    width="800px" class="user-dialog" :footer="null">
    <a-form :model="formData" ref="formRef" :rules="rules" layout="vertical">
      <!-- 行政区划选择 -->
      <a-form-item label="行政区划" name="district" required>
        <a-tree-select v-model:value="formData.district" placeholder="请选择行政区划" :tree-data="districtTreeData" allow-clear
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-node-filter-prop="'title'"
          :show-search="true" />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="用户名" name="username" required>
            <a-input v-model:value="formData.username" placeholder="请输入用户名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="手机号" name="phone" required>
            <a-input v-model:value="formData.phone" placeholder="请输入手机号" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="角色" name="role" required>
            <a-select v-model:value="formData.role" placeholder="请选择角色">
              <a-select-option value="业务管理者">业务管理者</a-select-option>
              <a-select-option value="管理员">管理员</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" name="status" required>
            <a-select v-model:value="formData.status" placeholder="请选择状态">
              <a-select-option :value="true">启用</a-select-option>
              <a-select-option :value="false">禁用</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="登录账号" name="loginAccount" required>
            <a-input v-model:value="formData.loginAccount" placeholder="请输入账号" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="登录密码" name="loginPassword" required>
            <a-input-password v-model:value="formData.loginPassword" placeholder="请输入密码" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="formData.remark" placeholder="请输入备注信息" :rows="4" />
      </a-form-item>

      <div class="form-footer">
        <a-button @click="handleCancel">取 消</a-button>
        <a-button type="primary" @click="handleSubmit" :loading="submitting" style="margin-left: 8px;">确 定</a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, defineProps, defineEmits, watch, computed } from 'vue';
import { message } from 'ant-design-vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  record: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'success']);

// 计算属性实现双向绑定
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const formRef = ref();
const submitting = ref(false);

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

const formData = reactive({
  district: undefined,
  username: '',
  phone: '',
  role: undefined,
  status: true,
  loginAccount: '',
  loginPassword: '',
  remark: ''
});

const rules = {
  district: [{ required: true, message: '请选择行政区划', trigger: 'change' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  loginAccount: [{ required: true, message: '请输入登录账号', trigger: 'blur' }],
  loginPassword: [{ required: true, message: '请输入登录密码', trigger: 'blur' }]
};

// 当编辑模式且有记录时，填充表单数据
watch(
  () => [props.modelValue, props.record],
  ([visible, record]) => {
    if (visible && props.isEdit && record) {
      // 编辑时填充表单数据
      Object.keys(formData).forEach(key => {
        if (record[key] !== undefined) {
          formData[key] = record[key];
        }
      });
    } else if (visible && !props.isEdit) {
      // 新增时重置表单
      resetForm();
    }
  }
);

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key === 'status') {
      formData[key] = true;
    } else if (key === 'district' || key === 'role') {
      formData[key] = undefined;
    } else {
      formData[key] = '';
    }
  });

  if (formRef.value) {
    formRef.value.resetFields();
  }
};

const handleCancel = () => {
  dialogVisible.value = false;
  resetForm();
};

const handleSubmit = () => {
  formRef.value.validate()
    .then(() => {
      submitting.value = true;

      // 模拟API调用
      setTimeout(() => {
        submitting.value = false;
        emit('success', { ...formData });
        dialogVisible.value = false;
        resetForm();
      }, 500);
    })
    .catch(errorInfo => {
      console.log('验证失败:', errorInfo);
    });
};
</script>

<style lang="scss" scoped>
.user-dialog {
  :deep(.ant-modal-content) {
    padding: 0;

    .ant-modal-close {
      top: 10px;
      color: #FFFFFF;
    }

    .ant-modal-header {
      margin: 0;
      padding: 16px 24px;
      background-color: #5276E5;

      .ant-modal-title {
        color: #FFFFFF;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .ant-modal-body {
      padding: 24px;
    }
  }

  .form-footer {
    text-align: center;
    margin-top: 24px;
  }

  :deep(.ant-form-item-required::before) {
    display: inline-block;
    margin-right: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
    content: '*';
  }

  :deep(.ant-select),
  :deep(.ant-input),
  :deep(.ant-input-password),
  :deep(.ant-tree-select) {
    width: 100%;
  }
}
</style>