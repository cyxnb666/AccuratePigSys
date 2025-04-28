<template>
  <a-modal :title="isEdit ? '编辑用户' : '新增用户'" v-model:open="dialogVisible" :destroyOnClose="true" :maskClosable="false"
    width="800px" class="user-dialog" :footer="null">
    <a-form :model="formData" ref="formRef" :rules="rules" layout="vertical">
      <!-- 行政区划选择 -->
      <a-form-item label="行政区划" name="areacode" required>
        <a-tree-select v-model:value="formData.areacode" placeholder="请选择行政区划" :tree-data="areaTreeData" allow-clear
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-node-filter-prop="'title'"
          :show-search="true" />
      </a-form-item>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="用户名" name="userName" required>
            <a-input v-model:value="formData.userName" placeholder="请输入用户名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="手机号" name="userMobile" required>
            <a-input v-model:value="formData.userMobile" placeholder="请输入手机号" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="角色" name="roleCode" required>
            <a-select v-model:value="formData.roleCode" placeholder="请选择角色" @change="handleRoleChange">
              <a-select-option v-for="role in roleOptions" :key="role.roleCode" :value="role.roleCode">
                {{ role.roleName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" name="enabled" required>
            <a-select v-model:value="formData.enabled" placeholder="请选择状态">
              <a-select-option value="1">启用</a-select-option>
              <a-select-option value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 普通用户显示账号密码 -->
      <template v-if="!isFarmLinker">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="登录账号" name="userAccount" required>
              <a-input v-model:value="formData.userAccount" placeholder="请输入账号" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="登录密码" name="userCipher" :required="!isEdit">
              <a-input-password v-model:value="formData.userCipher" placeholder="请输入密码" />
            </a-form-item>
          </a-col>
        </a-row>
      </template>

      <!-- 养殖场联系人显示养殖场选择 -->
      <template v-else>
        <a-form-item label="养殖场" name="farmId" required>
          <a-select v-model:value="formData.farmId" placeholder="请选择养殖场" show-search option-filter-prop="label">
            <a-select-option v-for="farm in livestockFarms" :key="farm.farmId" :value="farm.farmId"
              :label="farm.farmAddress">
              {{ farm.farmAddress }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </template>

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
import { saveUser, updateUser } from '../api';
import { MD5 } from 'crypto-js'; // 导入 MD5 加密函数

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
  },
  areaTreeData: {
    type: Array,
    default: () => []
  },
  roleOptions: {
    type: Array,
    default: () => []
  },
  livestockFarms: {
    type: Array,
    default: () => []
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

// 是否是养殖场联系人角色
const isFarmLinker = ref(false);

const formData = reactive({
  userId: '',
  areacode: '',
  userName: '',
  userMobile: '',
  roleCode: '',
  enabled: '1',
  userAccount: '',
  userCipher: '',
  remark: '',
  farmId: ''
});

// 根据角色调整表单验证规则
const rules = computed(() => {
  const baseRules = {
    areacode: [{ required: true, message: '请选择行政区划', trigger: 'change' }],
    userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    userMobile: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    roleCode: [{ required: true, message: '请选择角色', trigger: 'change' }],
    enabled: [{ required: true, message: '请选择状态', trigger: 'change' }]
  };

  // 如果是养殖场联系人
  if (isFarmLinker.value) {
    return {
      ...baseRules,
      farmId: [{ required: true, message: '请选择养殖场', trigger: 'change' }]
    };
  } else {
    // 普通用户需要账号密码
    return {
      ...baseRules,
      userAccount: [{ required: true, message: '请输入登录账号', trigger: 'blur' }],
      userCipher: props.isEdit
        ? []
        : [{ required: true, message: '请输入登录密码', trigger: 'blur' }]
    };
  }
});

// 角色变更处理
const handleRoleChange = (value) => {
  // 判断是否是养殖场联系人角色
  isFarmLinker.value = value === 'FARM_LINKER';

  // 当角色切换时，清空相关字段
  if (isFarmLinker.value) {
    formData.userAccount = '';
    formData.userCipher = '';
  } else {
    formData.farmId = '';
  }
};

// 当编辑模式且有记录时，填充表单数据
watch(
  () => [props.modelValue, props.isEdit, props.record],
  ([visible, isEdit, record]) => {
    if (visible && isEdit && record) {
      Object.keys(formData).forEach(key => {
        if (record[key] !== undefined) {
          formData[key] = record[key];
        }
      });

      // 设置角色类型
      isFarmLinker.value = formData.roleCode === 'FARM_LINKER';

      // 清除密码字段
      formData.userCipher = '';

      if (formRef.value) {
        formRef.value.clearValidate();
      }
    } else if (visible && !isEdit) {
      resetForm();
    }
  },
  { immediate: true }
);

const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key === 'enabled') {
      formData[key] = '1';
    } else {
      formData[key] = '';
    }
  });

  isFarmLinker.value = false;

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
    .then(async () => {
      submitting.value = true;
      try {
        const submitData = { ...formData };

        // 根据角色类型处理提交数据
        if (isFarmLinker.value) {
          // 养殖场联系人：删除账号密码字段
          delete submitData.userAccount;
          delete submitData.userCipher;
        } else {
          // 普通用户：删除养殖场字段
          delete submitData.farmId;

          // 处理密码加密
          if (props.isEdit && !submitData.userCipher) {
            delete submitData.userCipher;
          } else if (submitData.userCipher) {
            // 对密码进行 MD5 加密
            submitData.userCipher = MD5(submitData.userCipher).toString();
          }
        }

        if (props.isEdit) {
          await updateUser(submitData);
        } else {
          await saveUser(submitData);
        }

        message.success(`${props.isEdit ? '编辑' : '新增'}用户成功`);
        emit('success', { ...formData });
        dialogVisible.value = false;
        resetForm();
      } catch (error) {
        console.error(`${props.isEdit ? '编辑' : '新增'}用户失败:`, error);
        message.error(`${props.isEdit ? '编辑' : '新增'}用户失败`);
      } finally {
        submitting.value = false;
      }
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