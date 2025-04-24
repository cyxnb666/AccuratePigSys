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
                            <template v-if="column.key === 'status'">
                                <a-switch :checked="record.status === '启用'" @change="toggleContactStatus(record)"
                                    :checkedChildren="'启用'" :unCheckedChildren="'禁用'" :style="{
                                        backgroundColor: record.status === '启用' ? '#52c41a' : '#f5222d'
                                    }" />
                            </template>
                            <template v-if="column.key === 'isPrimary'">
                                <a-switch :checked="record.isPrimary" @change="setPrimaryContact(record)" :style="{
                                    backgroundColor: record.isPrimary ? '#1890ff' : '#d9d9d9'
                                }" />
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
                    </div>
                    <electronic-fence-map ref="fenceMapRef" />
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
import ElectronicFenceMap from './ElectronicFenceMap.vue';

const router = useRouter();
const route = useRoute();
const isEdit = ref(route.query.id !== undefined);
const fenceMapRef = ref<any>(null);

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

// 修改设置主要联系人的方法
const setPrimaryContact = (record) => {
    // 直接切换状态
    record.isPrimary = !record.isPrimary;

    // 这里可以调用API更新主要联系人状态
    console.log(`已${record.isPrimary ? '设置' : '取消'}主要联系人: ${record.name}`);

    // 模拟API调用
    message.success(`已${record.isPrimary ? '设置' : '取消'}主要联系人: ${record.name}`);
};

// 切换联系人状态
const toggleContactStatus = (record) => {
    // 切换状态
    record.status = record.status === '启用' ? '禁用' : '启用';

    // 这里可以调用API更新状态
    console.log(`联系人 ${record.name} 状态已更新为: ${record.status}`);

    // 模拟API调用
    message.success(`已${record.status === '启用' ? '启用' : '禁用'}联系人: ${record.name}`);
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

    // 获取电子围栏数据
    const fenceList = fenceMapRef.value?.getFenceList();

    // 在这里可以处理保存围栏数据的逻辑
    console.log('保存围栏数据:', fenceList);

    message.success(`${isEdit.value ? '编辑' : '新增'}养殖场成功`);
    router.go(-1);
};

onMounted(() => {
    if (isEdit.value) {
        // 假设这是从API获取的养殖场数据
        const farmId = route.query.id;
        // 从dataSource中获取对应ID的养殖场数据
        const farmData = {
            district: 'sichuan',
            farmName: '测试养殖场',
            address: '四川省成都市武侯区',
            remark: '这是一个测试养殖场',
            fenceData: [
                {
                    id: 'fence_1',
                    name: '围栏A区',
                    remark: '正常使用中的围栏',
                    path: [
                        { lng: 116.458694, lat: 40.000431 },
                        { lng: 116.4629, lat: 40.000628 },
                        { lng: 116.466505, lat: 39.991949 }
                    ],
                    isDisabled: false
                },
                {
                    id: 'fence_2',
                    name: '围栏B区',
                    remark: '已禁用的围栏',
                    path: [
                        { lng: 116.473371, lat: 39.999445 },
                        { lng: 116.486503, lat: 39.998919 },
                        { lng: 116.483842, lat: 39.988398 }
                    ],
                    isDisabled: true
                }
            ]
        };

        // 填充表单数据
        formData.district = farmData.district;
        formData.farmName = farmData.farmName;
        formData.address = farmData.address;
        formData.remark = farmData.remark;

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

        // 在控制台输出电子围栏数据，供开发参考
        console.log('养殖场电子围栏数据:', farmData.fenceData);

        // 等待地图加载完成后再设置围栏数据
        const loadFences = () => {
            if (fenceMapRef.value) {
                try {
                    fenceMapRef.value.setFenceList(farmData.fenceData);
                    message.success('已加载2个电子围栏，其中1个为禁用状态');
                } catch (e) {
                    console.error('设置围栏失败:', e);
                    // 如果失败，再次尝试
                    setTimeout(loadFences, 1000);
                }
            } else {
                console.log('地图组件尚未初始化，等待...');
                setTimeout(loadFences, 1000);
            }
        };

        // 延迟3秒等待地图初始化完成
        setTimeout(loadFences, 1000);
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
    }

    .scrollable-content {
        flex: 1;
        padding: 20px;
        padding-bottom: 0;
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

    .bottom-spacer {
        height: 60px;
    }

    .form-actions {
        display: flex;
        justify-content: center;
        padding: 16px 0;
        background-color: #f8f8f8;
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