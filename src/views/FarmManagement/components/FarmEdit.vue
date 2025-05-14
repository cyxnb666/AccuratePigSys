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
                    <a-form :model="formData" layout="vertical" ref="formRef" :rules="formRules">
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item label="行政区划" name="district" required>
                                    <a-tree-select v-model:value="formData.district" placeholder="请选择"
                                        :tree-data="districtTreeData" allow-clear
                                        :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                                        :tree-node-filter-prop="'title'" :show-search="true" style="width: 100%"
                                        :disabled="isEdit" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="养殖场名称" name="farmName" required>
                                    <a-input v-model:value="formData.farmName" placeholder="请输入" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item label="养殖场地址" name="address" required>
                                    <a-input v-model:value="formData.address" placeholder="请输入" />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item label="备注" name="remark">
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
                    <a-table :columns="contactColumns" :data-source="contacts" :pagination="false"
                        :loading="contactsTableLoading" bordered>
                        <template #bodyCell="{ column, record, index }">
                            <template v-if="column.key === 'name'">
                                <span v-if="!record.isEditing">{{ record.name }}</span>
                                <a-form-item v-else :validate-status="record.nameError ? 'error' : ''"
                                    :help="record.nameError" class="table-edit-form-item">
                                    <a-input v-model:value="record.name" />
                                </a-form-item>
                            </template>
                            <template v-if="column.key === 'phone'">
                                <span v-if="!record.isEditing">{{ record.phone }}</span>
                                <a-form-item v-else :validate-status="record.phoneError ? 'error' : ''"
                                    :help="record.phoneError" class="table-edit-form-item">
                                    <a-input v-model:value="record.phone" />
                                </a-form-item>
                            </template>
                            <template v-if="column.key === 'status'">
                                <a-switch :checked="record.status === '启用'" @change="() => toggleContactStatus(record)"
                                    :checkedChildren="'启用'" :unCheckedChildren="'禁用'" :style="{
                                        backgroundColor: record.status === '启用' ? '#52c41a' : '#f5222d'
                                    }" />
                            </template>
                            <template v-if="column.key === 'isPrimary'">
                                <a-switch :checked="record.isPrimary" @change="() => setPrimaryContact(record)" :style="{
                                    backgroundColor: record.isPrimary ? '#1890ff' : '#d9d9d9'
                                }" />
                            </template>
                            <template v-if="column.key === 'remark'">
                                <a-tooltip v-if="!record.isEditing" placement="topLeft" :title="record.remark">
                                    <span class="col-sql">{{ record.remark }}</span>
                                </a-tooltip>
                                <a-textarea v-else v-model:value="record.remark" :rows="1" />
                            </template>
                            <template v-if="column.key === 'action'">
                                <a-space>
                                    <a-button type="link" v-if="isEdit && !record.isEditing"
                                        @click="() => startEditContact(record)">编辑</a-button>
                                    <a-button type="link" v-if="isEdit && record.isEditing"
                                        @click="() => saveContactChanges(record)">保存</a-button>
                                    <a-button type="link" danger @click="() => deleteContact(record)">删除</a-button>
                                </a-space>
                            </template>
                        </template>
                    </a-table>
                </div>

                <!-- 电子围栏 -->
                <div class="fence-section">
                    <div class="section-header">
                        <span class="section-title">养殖场电子围栏编辑</span>
                        <div class="fence-edit-switch" v-if="hasEditPermission">
                            <span>开启电子围栏编辑</span>
                            <a-switch v-model:checked="fenceEditEnabled" @change="handleFenceEditChange" />
                        </div>
                    </div>
                    <electronic-fence-map ref="fenceMapRef" :showToolbar="toolbarVisible" />
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
        <a-modal v-model:open="contactDialogVisible" title="新增联系人" @ok="addContact"
            @cancel="contactDialogVisible = false">
            <a-form :model="newContact" layout="vertical">
                <a-form-item label="联系人姓名" required :validate-status="newContactErrors.name ? 'error' : ''"
                    :help="newContactErrors.name">
                    <a-input v-model:value="newContact.name" placeholder="请输入联系人姓名" />
                </a-form-item>
                <a-form-item label="手机号" required :validate-status="newContactErrors.phone ? 'error' : ''"
                    :help="newContactErrors.phone">
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
                <a-button type="primary" @click="addContact" :loading="contactDialogLoading">确 定</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { LeftOutlined } from '@ant-design/icons-vue';
import ElectronicFenceMap from './ElectronicFenceMap.vue';
import {
    getUserAreaTrees,
    saveFarm,
    updateFarm,
    getFarmDetail,
    getFarmLinkers,
    toggleContactStatus as apiToggleContactStatus,
    setAsPrimaryContact,
    editContact,
    addContact as apiAddContact,
    deleteContact as apiDeleteContact,
    toggleFenceEdit
} from '../api';

const router = useRouter();
const route = useRoute();
const isEdit = ref(route.query.id !== undefined);
const fenceMapRef = ref<any>(null);
const fenceEditEnabled = ref(false);
const showMapToolbar = ref(false);
const contactDialogLoading = ref(false);
const contactsTableLoading = ref(false);
const editFenceStatus = ref('0');

// 行政区划树形数据
const districtTreeData = ref([]);

const fetchAreaTrees = async () => {
    try {
        const res = await getUserAreaTrees();
        if (res) {
            districtTreeData.value = transformAreaData(res);
        }
    } catch (error) {
        console.error('获取行政区划数据失败:', error);
    }
};

const transformAreaData = (areaList: any[]): any[] => {
    return areaList.map(area => {
        const node = {
            title: area.areaname,
            value: area.areacode,
            key: area.areacode,
            // 只有第四级别的行政区划可选，其他级别禁用
            disabled: area.areaLevel !== "4",
            // 添加选择器过滤属性，用于搜索功能
            searchValue: area.areaname,
            children: area.children ? transformAreaData(area.children) : []
        };
        return node;
    });
};

// 检查用户是否有权限编辑围栏
const hasEditPermission = computed(() => {
    try {
        const userInfoStr = sessionStorage.getItem('userInfo');
        if (!userInfoStr) return false;

        const userInfo = JSON.parse(userInfoStr);
        const allowedRoles = ['BUSI_MANAGER', 'SURVEY_MANAGER'];

        return allowedRoles.includes(userInfo.roleCode);
    } catch (error) {
        console.error('Error checking user permissions:', error);
        return false;
    }
});
// 专门计算操作栏可见性的计算属性
const toolbarVisible = computed(() => {
    // 新增模式下始终显示操作栏
    if (!isEdit.value) {
        return true;
    }

    // 有特定权限的用户始终可以看到操作栏
    if (hasEditPermission.value) {
        return true;
    }

    // 对于其他用户，根据editFence状态决定
    return editFenceStatus.value === '1';
});

// 表单数据
const formData = reactive({
    district: undefined,
    farmName: '',
    address: '',
    remark: '',
    farmId: '' // 仅编辑模式使用
});
const formRef = ref(null);
const formRules = {
    district: [
        { required: true, message: '请选择行政区划', trigger: 'change' }
    ],
    farmName: [
        { required: true, message: '请输入养殖场名称', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5]{1,50}$/, message: '养殖场名称只能输入1-50个中文字符', trigger: 'blur' }
    ],
    address: [
        { required: true, message: '请输入养殖场地址', trigger: 'blur' },
        { pattern: /^[\u4e00-\u9fa5]{1,150}$/, message: '养殖场地址只能输入1-150个中文字符', trigger: 'blur' }
    ],
    remark: [
        { pattern: /^[\u4e00-\u9fa5]{0,250}$/, message: '备注只能输入0-250个中文字符', trigger: 'blur' }
    ]
};

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
    remark: ''
});

// 新联系人表单验证错误
const newContactErrors = reactive({
    name: '',
    phone: ''
});

const goBack = () => {
    router.go(-1);
};

// 验证联系人表单
const validateContact = (contact) => {
    let isValid = true;
    const errors = {
        name: '',
        phone: ''
    };

    // 验证姓名
    if (!contact.name) {
        errors.name = '请输入联系人姓名';
        isValid = false;
    } else if (!/^[\u4e00-\u9fa5]{1,20}$/.test(contact.name)) {
        errors.name = '姓名只能输入1-20个中文字符';
        isValid = false;
    }

    // 验证手机号
    if (!contact.phone) {
        errors.phone = '请输入手机号';
        isValid = false;
    } else if (!/^1[3-9]\d{9}$/.test(contact.phone)) {
        errors.phone = '请输入正确的手机号格式';
        isValid = false;
    }

    return { isValid, errors };
};

const showAddContactDialog = () => {
    // 重置表单和错误
    newContact.name = '';
    newContact.phone = '';
    newContact.status = '启用';
    newContact.remark = '';
    newContactErrors.name = '';
    newContactErrors.phone = '';

    contactDialogVisible.value = true;
};

const addContact = async () => {
    // 验证表单
    const { isValid, errors } = validateContact(newContact);
    if (!isValid) {
        newContactErrors.name = errors.name;
        newContactErrors.phone = errors.phone;
        return;
    }

    if (isEdit.value) {
        const farmId = route.query.id as string;
        contactDialogLoading.value = true;
        try {
            const contactData = {
                farmId: farmId,
                userName: newContact.name,
                userMobile: newContact.phone,
                enabled: newContact.status === '启用' ? '1' : '0',
                remark: newContact.remark || ''
            };

            await apiAddContact(contactData);
            message.success('添加联系人成功');

            // 重新加载联系人列表
            contactsTableLoading.value = true;
            const farmLinkers = await getFarmLinkers(farmId);
            updateContactsFromAPI(farmLinkers);
            contactsTableLoading.value = false;
            contactDialogVisible.value = false;
        } catch (error) {
            console.error('添加联系人失败:', error);
        } finally {
            contactDialogLoading.value = false;
        }
    } else {
        // 新增模式，仅在本地添加
        const contact = {
            key: Date.now().toString(),
            name: newContact.name,
            phone: newContact.phone,
            status: newContact.status,
            isPrimary: contacts.value.length === 0, // 如果是第一个联系人，设为主要联系人
            remark: newContact.remark || '',
            isEditing: false,
            nameError: '',
            phoneError: ''
        };

        if (contact.isPrimary) {
            // 确保只有一个主要联系人
            contacts.value.forEach(c => c.isPrimary = false);
        }

        contacts.value.push(contact);
        message.success('添加联系人成功');
        contactDialogVisible.value = false;
    }

    contactDialogVisible.value = false;
};

const startEditContact = (record) => {
    // 开始编辑，标记当前记录为编辑状态
    record.isEditing = true;
    record.nameError = '';
    record.phoneError = '';

    // 保存原始值，用于取消编辑
    record._originalName = record.name;
    record._originalPhone = record.phone;
    record._originalRemark = record.remark;
};

const saveContactChanges = async (record) => {
    // 验证数据
    const { isValid, errors } = validateContact(record);
    if (!isValid) {
        record.nameError = errors.name;
        record.phoneError = errors.phone;
        return;
    }

    try {
        const contactData = {
            farmLinkerId: record.key,
            farmId: formData.farmId,
            userName: record.name,
            userMobile: record.phone,
            enabled: record.status === '启用' ? '1' : '0',
            isPrimary: record.isPrimary ? '1' : '0',
            remark: record.remark || '',
            userId: record.userId || ''
        };

        await editContact(contactData);
        message.success('保存联系人信息成功');

        // 结束编辑状态
        record.isEditing = false;
        record.nameError = '';
        record.phoneError = '';

    } catch (error) {
        console.error('保存联系人信息失败:', error);

        // 恢复原始值
        record.name = record._originalName;
        record.phone = record._originalPhone;
        record.remark = record._originalRemark;
    }
};

const toggleContactStatus = async (record) => {
    if (isEdit.value) {
        try {
            await apiToggleContactStatus(record.key);

            // 切换状态
            record.status = record.status === '启用' ? '禁用' : '启用';
            message.success(`已${record.status === '启用' ? '启用' : '禁用'}联系人: ${record.name}`);
        } catch (error) {
            console.error('更新联系人状态失败:', error);
        }
    } else {
        // 新增模式，仅在本地切换状态
        record.status = record.status === '启用' ? '禁用' : '启用';
        message.success(`已${record.status === '启用' ? '启用' : '禁用'}联系人: ${record.name}`);
    }
};

const setPrimaryContact = async (record) => {
    if (isEdit.value) {
        try {
            // 如果已经是主要联系人，不做操作
            if (record.isPrimary) return;

            // 先找到当前的主要联系人
            const currentPrimaryContact = contacts.value.find(c => c.isPrimary);

            // 如果存在当前主要联系人，先取消其主要状态
            if (currentPrimaryContact) {
                await setAsPrimaryContact(currentPrimaryContact.key);
            }

            // 然后设置新的主要联系人
            await setAsPrimaryContact(record.key);

            // 更新UI状态
            contacts.value.forEach(c => c.isPrimary = c === record);
            message.success(`已设置 ${record.name} 为主要联系人`);
        } catch (error) {
            console.error('设置主要联系人失败:', error);
        }
    } else {
        // 新增模式，仅在本地设置主要联系人
        contacts.value.forEach(c => c.isPrimary = c === record);
        message.success(`已设置 ${record.name} 为主要联系人`);
    }
};

const deleteContact = async (record) => {
    Modal.confirm({
        title: '确认删除',
        content: `确定要删除联系人 "${record.name}" 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
            if (isEdit.value) {
                try {
                    await apiDeleteContact(record.userId);
                    contacts.value = contacts.value.filter(item => item.key !== record.key);
                    message.success('删除联系人成功');
                } catch (error) {
                    console.error('删除联系人失败:', error);
                }
            } else {
                // 新增模式，仅在本地删除
                contacts.value = contacts.value.filter(item => item.key !== record.key);
                message.success('删除联系人成功');
            }
        }
    });
};

const updateContactsFromAPI = (farmLinkers) => {
    if (Array.isArray(farmLinkers)) {
        contacts.value = farmLinkers.map(linker => ({
            key: linker.farmLinkerId,
            userId: linker.userId,
            name: linker.userName,
            phone: linker.userMobile,
            status: linker.enabled === '1' ? '启用' : '禁用',
            isPrimary: linker.isPrimary === '1',
            remark: linker.remark || '',
            isEditing: false,
            nameError: '',
            phoneError: ''
        }));
    }
};

const saveForm = async () => {
    // 表单验证
    try {
        await formRef.value.validate();
    } catch (error) {
        message.error('请正确填写表单信息');
        return;
    }

    // 获取电子围栏数据
    const fenceList = fenceMapRef.value?.getFenceList() || [];

    // 格式化围栏数据
    const formattedFences = fenceList.map(fence => {
        // 将每个围栏的路径点格式化为JSON字符串
        const coordinatesJson = JSON.stringify(fence.path.map(point => ({
            lng: point.lng || point.getLng(),
            lat: point.lat || point.getLat()
        })));

        return {
            coordinate: coordinatesJson,
            fenceName: fence.name,
            remark: fence.remark || '',
            enabled: fence.isDisabled ? "0" : "1"  // "1"表示启用，"0"表示禁用
        };
    });

    // 如果没有围栏点就--
    let randomLat = "0.0";
    let randomLng = "0.0";

    // 从围栏点中随机选择一个点获取经纬度
    if (fenceList.length > 0) {
        const randomFence = fenceList[Math.floor(Math.random() * fenceList.length)];
        if (randomFence.path && randomFence.path.length > 0) {
            const randomPoint = randomFence.path[Math.floor(Math.random() * randomFence.path.length)];

            // 确保获取到正确的经纬度值
            randomLat = randomPoint.lat ||
                (typeof randomPoint.getLat === 'function' ? randomPoint.getLat() : randomPoint.lat) ||
                randomLat;

            randomLng = randomPoint.lng ||
                (typeof randomPoint.getLng === 'function' ? randomPoint.getLng() : randomPoint.lng) ||
                randomLng;
        }
    }

    // 准备提交的数据
    const submitData = {
        districtCode: formData.district,
        farmName: formData.farmName,
        farmAddress: formData.address,
        fences: formattedFences,
        remark: formData.remark || '',
        latitude: String(randomLat),
        longitude: String(randomLng)
    };

    // 在新增模式下，添加联系人数据
    if (!isEdit.value) {
        submitData['farmLinkers'] = contacts.value.map(contact => ({
            enabled: contact.status === '启用' ? "1" : "0",
            isPrimary: contact.isPrimary ? "1" : "0",
            remark: contact.remark || '',
            userMobile: contact.phone,
            userName: contact.name
        }));
    }

    console.log('准备提交的数据:', JSON.stringify(submitData, null, 2));

    try {
        if (isEdit.value) {
            // 添加主键用于更新
            submitData['primaryKey'] = formData.farmId;
            submitData['farmId'] = formData.farmId;
            await updateFarm(submitData);
        } else {
            await saveFarm(submitData);
        }
        message.success(`${isEdit.value ? '编辑' : '新增'}养殖场成功`);
        router.go(-1);
    } catch (error) {
        console.error(`${isEdit.value ? '编辑' : '新增'}养殖场失败:`, error);
    }
};

// 围栏编辑状态变化
const handleFenceEditChange = async (checked) => {
    // 检查权限
    if (!hasEditPermission.value) {
        message.error('您没有权限操作电子围栏编辑功能');
        fenceEditEnabled.value = false; // 重置开关状态
        return;
    }

    try {
        const farmId = route.query.id as string;
        if (!farmId) {
            message.error('养殖场ID不存在');
            return;
        }

        // 调用API更新服务器上的状态
        await toggleFenceEdit(farmId);

        // 更新本地状态
        editFenceStatus.value = checked ? '1' : '0';
        showMapToolbar.value = checked;

        console.log('电子围栏编辑状态:', checked ? '已开启' : '已关闭');
        message.success(`电子围栏编辑已${checked ? '开启' : '关闭'}`);
    } catch (error) {
        console.error('切换电子围栏编辑状态失败:', error);
        // 操作失败时回滚UI状态
        fenceEditEnabled.value = !checked;
    }
};

onMounted(async () => {
    fetchAreaTrees();

    if (!hasEditPermission.value) {
        fenceEditEnabled.value = false;
        showMapToolbar.value = false;
    }

    if (isEdit.value) {
        const farmId = route.query.id as string;

        try {
            // 显示加载提示
            const loadingMsg = message.loading('正在加载养殖场数据...', 0);
            contactsTableLoading.value = true;

            // 获取养殖场详情
            const farmDetail = await getFarmDetail(farmId);

            // 获取养殖场联系人
            const farmLinkers = await getFarmLinkers(farmId);

            // 关闭加载提示
            loadingMsg();
            contactsTableLoading.value = false;

            // 填充基本信息
            formData.district = farmDetail.districtCode;
            formData.farmName = farmDetail.farmName;
            formData.address = farmDetail.farmAddress;
            formData.remark = farmDetail.remark || '';
            formData.farmId = farmId;

            // 存储并设置围栏编辑状态
            editFenceStatus.value = farmDetail.editFence || '0';
            fenceEditEnabled.value = editFenceStatus.value === '1';
            showMapToolbar.value = fenceEditEnabled.value;

            // 填充联系人列表
            updateContactsFromAPI(farmLinkers);

            // 处理电子围栏数据
            if (farmDetail.fences && farmDetail.fences.length > 0) {
                // 延迟设置围栏数据，确保地图组件已加载
                const loadFences = () => {
                    if (fenceMapRef.value) {
                        try {
                            const fenceData = farmDetail.fences.map(fence => {
                                // 解析围栏坐标
                                let path = [];
                                try {
                                    path = JSON.parse(fence.coordinate);
                                } catch (e) {
                                    console.error('解析围栏坐标失败:', e);
                                }

                                return {
                                    id: fence.fenceId,
                                    name: fence.fenceName,
                                    remark: fence.remark || '',
                                    path: path,
                                    isDisabled: fence.enabled !== '1' // "1"表示启用，其他值表示禁用
                                };
                            });

                            fenceMapRef.value.setFenceList(fenceData);
                            message.success(`已加载${fenceData.length}个电子围栏`, 2);
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

                // 延迟1秒等待地图初始化完成
                setTimeout(loadFences, 1000);
            }

        } catch (error) {
            contactsTableLoading.value = false;
            console.error('获取养殖场数据失败:', error);
        }
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

    .col-sql {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
        width: 100px;
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        /* 修改为两端对齐 */
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;

        .section-title {
            font-size: 16px;
            font-weight: 500;
        }

        .fence-edit-switch {
            display: flex;
            align-items: center;

            span {
                margin-right: 8px;
                font-size: 14px;
                color: #666;
            }

            :deep(.ant-switch) {
                min-width: 44px;
            }
        }
    }

    .table-edit-form-item {
        margin-bottom: 0 !important;

        :deep(.ant-form-item-explain) {
            position: absolute;
            top: 100%;
        }

        :deep(.ant-form-item-control-input) {
            min-height: 28px;
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