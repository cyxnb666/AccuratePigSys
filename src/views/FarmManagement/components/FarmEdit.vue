<template>
    <div class="farm-edit">
        <!-- 面包屑导航 -->
        <div class="bread-detail-card">
            <div class="breadcrumb">
                <a-breadcrumb>
                    <a-breadcrumb-item>
                        <a @click="goBack">
                            <left-outlined /> 返回
                        </a>
                    </a-breadcrumb-item>
                    <a-breadcrumb-item>{{ isEdit ? '编辑养殖场' : '新增养殖场' }}</a-breadcrumb-item>
                </a-breadcrumb>
            </div>
        </div>

        <!-- 表单内容 -->
        <div class="content-container">
            <div class="scrollable-content">
                <!-- 基本信息 -->
                <div class="form-section">
                    <a-form :model="formData" layout="vertical">
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item label="行政区划" required>
                                    <a-tree-select v-model:value="formData.district" placeholder="请选择"
                                        :tree-data="districtTreeData" allow-clear
                                        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                                        :tree-node-filter-prop="'title'" :show-search="true" style="width: 100%" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="养殖场名称" required>
                                    <a-input v-model:value="formData.farmName" placeholder="请输入" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item label="养殖场地址" required>
                                    <a-input v-model:value="formData.address" placeholder="请输入" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="备注">
                                    <a-input v-model:value="formData.remark" placeholder="请输入" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                    </a-form>
                </div>

                <!-- 联系人列表 -->
                <div class="contact-section">
                    <div class="section-header">
                        <span class="section-title">养殖场联系人列表</span>
                        <a-button type="primary" size="small" @click="showAddContactDialog"
                            style="margin-left: 10px;">新增</a-button>
                    </div>
                    <a-table :columns="contactColumns" :data-source="contacts" :pagination="false" bordered>
                        <template #bodyCell="{ column, record }">
                            <template v-if="column.key === 'isPrimary'">
                                <a-radio :checked="record.isPrimary" @change="setPrimaryContact(record)" />
                            </template>
                            <template v-if="column.key === 'action'">
                                <a-button type="link" danger @click="deleteContact(record)">删除</a-button>
                            </template>
                        </template>
                    </a-table>
                </div>

                <!-- 电子围栏 -->
                <div class="fence-section">
                    <div class="section-header">
                        <span class="section-title">养殖场电子围栏编辑</span>
                        <div class="fence-toggle">
                            开启电子围栏编辑
                            <a-switch v-model:checked="enableFence" style="margin-left: 8px" />
                        </div>
                    </div>
                    <div class="map-container">
                        <!-- 地图占位区域 -->
                        <div class="map-placeholder"></div>
                        <a-button type="primary" class="add-fence-button">新增养殖区域</a-button>
                    </div>
                </div>

                <!-- 底部空白区域，确保电子围栏完全可见 -->
                <div class="bottom-spacer"></div>
            </div>

            <!-- 底部按钮区域 -->
            <div class="form-actions">
                <a-button @click="goBack">返回</a-button>
                <a-button type="primary" @click="saveForm" style="margin-left: 16px;">保存</a-button>
            </div>
        </div>

        <!-- 添加联系人对话框 -->
        <a-modal v-model:open="contactDialogVisible" title="新增用户" @ok="addContact"
            @cancel="contactDialogVisible = false">
            <a-form :model="newContact" layout="vertical">
                <a-form-item label="用户名" required>
                    <a-input v-model:value="newContact.name" placeholder="请输入用户名" />
                </a-form-item>
                <a-form-item label="手机号" required>
                    <a-input v-model:value="newContact.phone" placeholder="请输入手机号" />
                </a-form-item>
                <a-form-item label="状态" required>
                    <a-select v-model:value="newContact.status" placeholder="请选择">
                        <a-select-option value="启用">启用</a-select-option>
                        <a-select-option value="禁用">禁用</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="备注">
                    <a-textarea v-model:value="newContact.remark" placeholder="请输入" :rows="4" />
                </a-form-item>
            </a-form>
            <template #footer>
                <a-button @click="contactDialogVisible = false">取 消</a-button>
                <a-button type="primary" @click="addContact">确 定</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { LeftOutlined } from '@ant-design/icons-vue';

const router = useRouter();
const route = useRoute();
const isEdit = ref(route.query.id !== undefined);

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

// 表单数据
const formData = reactive({
    district: undefined,
    farmName: '',
    address: '',
    remark: ''
});

// 联系人列表配置
const contactColumns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '主要联系人', dataIndex: 'isPrimary', key: 'isPrimary' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    { title: '操作', key: 'action' }
];

const contacts = ref([]);

// 电子围栏
const enableFence = ref(false);

// 联系人对话框
const contactDialogVisible = ref(false);
const newContact = reactive({
    name: '',
    phone: '',
    status: '启用',
    isPrimary: false,
    remark: ''
});

// 方法
const goBack = () => {
    router.go(-1);
};

const showAddContactDialog = () => {
    contactDialogVisible.value = true;
};

const addContact = () => {
    if (!newContact.name || !newContact.phone) {
        message.error('请填写必填项');
        return;
    }

    const contact = {
        key: Date.now(),
        name: newContact.name,
        phone: newContact.phone,
        status: newContact.status,
        isPrimary: newContact.isPrimary,
        remark: newContact.remark
    };

    if (newContact.isPrimary) {
        // 如果设为主要联系人，更新其他联系人状态
        contacts.value.forEach(c => c.isPrimary = false);
    }

    contacts.value.push(contact);

    // 重置表单
    newContact.name = '';
    newContact.phone = '';
    newContact.status = '启用';
    newContact.isPrimary = false;
    newContact.remark = '';

    contactDialogVisible.value = false;
    message.success('添加联系人成功');
};

const setPrimaryContact = (record) => {
    contacts.value.forEach(contact => {
        contact.isPrimary = contact.key === record.key;
    });
};

const deleteContact = (record) => {
    contacts.value = contacts.value.filter(item => item.key !== record.key);
    message.success('删除联系人成功');
};

const saveForm = () => {
    if (!formData.district || !formData.farmName || !formData.address) {
        message.error('请填写必填项');
        return;
    }

    message.success(`${isEdit.value ? '编辑' : '新增'}养殖场成功`);
    router.go(-1);
};

onMounted(() => {
    if (isEdit.value) {
        // 加载编辑数据
        // 实际应用中这里应该是API调用
        formData.district = 'sichuan';
        formData.farmName = '测试养殖场';
        formData.address = '四川省成都市武侯区';
        formData.remark = '这是一个测试养殖场';

        contacts.value = [
            {
                key: 1,
                name: '张三',
                phone: '13800138000',
                status: '启用',
                isPrimary: true,
                remark: '主要联系人'
            }
        ];
    }
});
</script>


<style lang="scss" scoped>
.farm-edit {
    display: flex;
    flex-direction: column;
    height: 100%;

    .bread-detail-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        padding: 16px;
        margin-bottom: 16px;
    }

    .content-container {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        /* 防止内容溢出 */
    }

    .scrollable-content {
        flex: 1;
        padding: 20px;
        padding-bottom: 0;
        /* 底部留给按钮区域 */
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .form-section {
        margin-bottom: 16px;
    }

    .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;

        .section-title {
            font-size: 16px;
            font-weight: 500;
        }
    }

    .fence-toggle {
        margin-left: auto;
        display: flex;
        align-items: center;
    }

    .map-container {
        position: relative;

        .map-placeholder {
            width: 100%;
            height: 400px;
            background-color: #f5f5f5;
            border: 1px solid #e8e8e8;
        }

        .add-fence-button {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 1;
        }
    }

    .bottom-spacer {
        height: 60px;
        /* 确保电子围栏与底部按钮之间有足够空间 */
    }

    .form-actions {
        display: flex;
        justify-content: center;
        padding: 16px 0;
        background-color: #f8f8f8;
        /* 按钮区域背景色 */
        border-top: 1px solid #e8e8e8;
        position: sticky;
        bottom: 0;
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
}
</style>