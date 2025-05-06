<template>
    <div class="inventory-list">
        <a-row :gutter="16" class="main-container">
            <a-col :span="5">
                <div class="district-tree-container">
                    <div class="tree-header">
                        <h3>行政区划</h3>

                        <div class="tree-search">
                            <a-input v-model:value="districtSearchText" placeholder="搜索行政区划" allowClear
                                @change="handleDistrictSearch" :disabled="loading">
                                <template #prefix>
                                    <search-outlined />
                                </template>
                            </a-input>
                        </div>
                    </div>

                    <div class="tree-content">
                        <a-spin :spinning="loading" tip="加载中..." class="centered-spin">
                            <div v-if="filteredDistrictTreeData.length > 0" class="tree-wrapper">
                                <a-tree :tree-data="filteredDistrictTreeData" @select="handleDistrictSelect"
                                    :selectedKeys="selectedDistrict" :expandedKeys="expandedKeys" @expand="onExpand"
                                    :autoExpandParent="autoExpandParent">
                                    <template #title="{ title, searchValue }">
                                        <span v-if="searchValue && title.includes(searchValue)">
                                            <template v-for="(fragment, i) in getHighlightFragments(title, searchValue)"
                                                :key="i">
                                                <span v-if="fragment.highlight" class="highlight-text">{{ fragment.text
                                                }}</span>
                                                <span v-else>{{ fragment.text }}</span>
                                            </template>
                                        </span>
                                        <span v-else>{{ title }}</span>
                                    </template>
                                </a-tree>
                            </div>
                            <div v-else-if="!loading" class="empty-data">
                                <a-empty description="暂无行政区划数据" />
                            </div>
                        </a-spin>
                    </div>
                </div>
            </a-col>

            <a-col :span="19">
                <div class="content-container">
                    <div class="search-bar">
                        <span>养殖场</span>
                        <a-input v-model:value="searchForm.farmName" placeholder="请输入养殖场名称"
                            style="width: 220px; margin: 0 12px" />
                        <a-button type="primary" @click="handleSearch">查询</a-button>
                        <a-button style="margin-left: 8px" @click="handleDownload">下载清单</a-button>
                    </div>

                    <div class="data-table">
                        <a-table :columns="columns" :data-source="tableData" :pagination="false" bordered row-key="id"
                            :scroll="{ y: tableHeight }">
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.key === 'action'">
                                    <a-button type="link" @click="viewDetails(record)">详情</a-button>
                                </template>
                            </template>
                        </a-table>

                        <!-- 分页 -->
                        <div class="pagination">
                            <a-pagination v-model:current="pagination.current" :total="pagination.total"
                                :page-size="pagination.pageSize" @change="handleTableChange" show-size-changer
                                :showTotal="(total) => `共 ${total} 条记录`" />
                        </div>
                    </div>
                </div>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { SearchOutlined } from '@ant-design/icons-vue';
import { getAreaTrees } from './api';

const router = useRouter();

// 加载状态
const loading = ref(true);

// 区域树数据
const districtTreeData = ref<any[]>([]);
const filteredDistrictTreeData = ref<any[]>([]);
const districtSearchText = ref('');
const expandedKeys = ref<string[]>([]);
const autoExpandParent = ref(true);

// 表格高度
const tableHeight = ref('calc(80vh - 150px)');

// 选中的区域
const selectedDistrict = ref<string[]>([]);

const searchForm = reactive({
    farmName: '',
    district: ''
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
    loading.value = true;

    try {
        const res = await getAreaTrees();
        if (res) {
            districtTreeData.value = transformAreaData(res);
            filteredDistrictTreeData.value = districtTreeData.value;

            // 默认选中第一个节点
            if (districtTreeData.value.length > 0) {
                const firstNode = districtTreeData.value[0];
                selectedDistrict.value = [firstNode.key];
                expandedKeys.value = [firstNode.key];
                searchForm.district = firstNode.title;

                // 加载表格数据
                loadData(firstNode.title);
            }
        }
    } catch (error) {
        console.error('获取行政区划数据失败:', error);
        message.error('获取行政区划数据失败');
    } finally {
        loading.value = false;
    }
};

const getHighlightFragments = (title: string, searchValue: string) => {
    if (!searchValue || !title.includes(searchValue)) {
        return [{ text: title, highlight: false }];
    }

    const fragments = [];
    let lastIndex = 0;
    let index = title.indexOf(searchValue);

    while (index !== -1) {
        // 添加匹配前的普通文本
        if (index > lastIndex) {
            fragments.push({
                text: title.substring(lastIndex, index),
                highlight: false
            });
        }

        // 添加匹配的文本部分
        fragments.push({
            text: title.substring(index, index + searchValue.length),
            highlight: true
        });

        lastIndex = index + searchValue.length;
        index = title.indexOf(searchValue, lastIndex);
    }

    // 添加最后一部分普通文本
    if (lastIndex < title.length) {
        fragments.push({
            text: title.substring(lastIndex),
            highlight: false
        });
    }

    return fragments;
};

// 搜索
const handleDistrictSearch = () => {
    if (!districtSearchText.value) {
        filteredDistrictTreeData.value = districtTreeData.value;
        return;
    }

    // 查找匹配的节点
    const searchValue = districtSearchText.value.toLowerCase();

    // 递归搜索函数
    const searchTree = (nodes: any[]) => {
        const result: any[] = [];

        nodes.forEach(node => {
            // 深拷贝节点
            const newNode = { ...node };

            // 如果当前节点匹配，添加searchValue属性
            if (node.title.toLowerCase().includes(searchValue)) {
                newNode.searchValue = searchValue;
                if (node.children) {
                    newNode.children = [...node.children];
                }
                result.push(newNode);

                // 添加到展开的键中
                if (!expandedKeys.value.includes(node.key)) {
                    expandedKeys.value.push(node.key);
                }
            }
            // 如果有子节点，递归搜索
            else if (node.children) {
                const filteredChildren = searchTree(node.children);
                if (filteredChildren.length > 0) {
                    newNode.children = filteredChildren;
                    result.push(newNode);

                    // 添加到展开的键中
                    if (!expandedKeys.value.includes(node.key)) {
                        expandedKeys.value.push(node.key);
                    }
                }
            }
        });

        return result;
    };

    filteredDistrictTreeData.value = searchTree(districtTreeData.value);
    autoExpandParent.value = true;
};
const onExpand = (keys) => {
    expandedKeys.value = keys;
    autoExpandParent.value = false;
};

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
        title: '养殖场名称',
        dataIndex: 'farmName',
        key: 'farmName',
        align: 'center'
    },
    {
        title: '育肥猪',
        dataIndex: 'fatteningPigs',
        key: 'fatteningPigs',
        align: 'center'
    },
    {
        title: '仔猪',
        dataIndex: 'piglets',
        key: 'piglets',
        align: 'center'
    },
    {
        title: '母猪',
        dataIndex: 'sows',
        key: 'sows',
        align: 'center'
    },
    {
        title: '最近上报日期',
        dataIndex: 'reportDate',
        key: 'reportDate',
        align: 'center'
    },
    {
        title: '操作',
        key: 'action',
        align: 'center',
        width: 100
    }
];

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 50,
    showSizeChanger: true,
});

const handleTableChange = (page) => {
    pagination.current = page;
    loadData(searchForm.district);
};

const tableData = ref([]);

// 处理区域选择
const handleDistrictSelect = (selectedKeys, info) => {
    if (selectedKeys.length > 0) {
        selectedDistrict.value = selectedKeys;
        const districtName = info.node.title;
        searchForm.district = districtName;
        loadData(districtName);
    }
};

// 根据区域加载数据
const loadData = (district) => {
    // 模拟数据加载，实际项目中这里应该调用API
    const data = [];
    for (let i = 1; i <= 50; i++) {
        data.push({
            id: i,
            index: (pagination.current - 1) * pagination.pageSize + i,
            district: district,
            farmName: `${district}养殖场${i}`,
            fatteningPigs: Math.floor(Math.random() * 100),
            piglets: Math.floor(Math.random() * 50),
            sows: Math.floor(Math.random() * 30),
            reportDate: '2025-04-30'
        });
    }
    tableData.value = data;
    pagination.total = 50;
};

const handleSearch = () => {
    pagination.current = 1;
    loadData(searchForm.district);

    if (searchForm.farmName) {
        tableData.value = tableData.value.filter(item =>
            item.farmName.includes(searchForm.farmName)
        );
        pagination.total = tableData.value.length;
    }
};

const handleDownload = () => {
    message.success('清单下载中...');
};

const viewDetails = (record) => {
    router.push(`/KEEP/details/${record.id}`);
};

onMounted(() => {
    fetchAreaTrees();
});
</script>

<style lang="scss" scoped>
.inventory-list {
    height: 100%;

    .main-container {
        height: 100%;
    }

    .district-tree-container {
        background-color: white;
        height: calc(100vh - 90px);
        padding: 16px;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;

        .tree-header {
            margin-bottom: 16px;

            h3 {
                margin-bottom: 16px;
                font-weight: 500;
            }

            .tree-search {
                margin-bottom: 16px;
            }
        }

        .tree-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;

            &::-webkit-scrollbar {
                width: 6px;
            }

            &::-webkit-scrollbar-thumb {
                background-color: #d9d9d9;
                border-radius: 3px;
            }

            &::-webkit-scrollbar-track {
                background-color: #f0f0f0;
            }

            .tree-wrapper {
                min-height: 100px;
            }

            .empty-data {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 200px;
            }

            .centered-spin {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;

                :deep(.ant-spin-container) {
                    height: 100%;
                }

                :deep(.ant-spin) {
                    max-height: none;
                }

                :deep(.ant-spin-nested-loading) {
                    height: 100%;
                }

                /* 加载中状态时显示在正中间 */
                :deep(.ant-spin-spinning) {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10;
                }
            }
        }
    }

    .highlight-text {
        font-weight: bold;
        color: #1890ff;
        /* 蓝色高亮 */
    }

    .content-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 16px;

        .search-bar {
            display: flex;
            align-items: center;
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
            flex: 1;
            display: flex;
            flex-direction: column;

            .ant-table-wrapper {
                flex: 1;
            }

            .pagination {
                margin-top: 16px;
                text-align: right;
            }
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