<template>
    <div class="inventory-list">
        <a-row :gutter="16" class="main-container">
            <a-col :span="5">
                <div class="district-tree-container">
                    <div class="tree-header">
                        <h3>行政区划</h3>

                        <div class="tree-search">
                            <a-input v-model:value="districtSearchText" placeholder="搜索行政区划" allowClear
                                @input="handleDistrictSearchInput" :disabled="treeLoading">
                                <template #prefix>
                                    <search-outlined />
                                </template>
                            </a-input>
                        </div>
                    </div>

                    <div class="tree-content">
                        <a-spin :spinning="treeLoading" tip="加载中..." class="centered-spin">
                            <div v-if="filteredDistrictTreeData.length > 0" class="tree-wrapper">
                                <a-tree :tree-data="filteredDistrictTreeData" @select="handleDistrictSelect"
                                    :selectedKeys="selectedDistrict" :expandedKeys="expandedKeys" @expand="onExpand"
                                    :autoExpandParent="autoExpandParent">
                                    <template #title="{ title }">
                                        <span v-if="districtSearchText && districtSearchText.trim()">
                                            <template
                                                v-for="(fragment, i) in getHighlightFragments(title, districtSearchText)"
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
                            <div v-else-if="!treeLoading" class="empty-data">
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
                        <a-table :columns="columns" :data-source="tableData" :loading="tableLoading" :pagination="false"
                            bordered row-key="id" :scroll="{ y: tableHeight }">
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
import { selectUserTree, pageQueryLeaves, exportLeaves } from './api';

const router = useRouter();
// 分离加载状态
const treeLoading = ref(true);
const tableLoading = ref(true);

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
    treeLoading.value = true;
    tableLoading.value = true; // 初始同时加载表格和树

    try {
        const res = await selectUserTree();
        if (res) {
            districtTreeData.value = transformAreaData(res);
            filteredDistrictTreeData.value = districtTreeData.value;

            // 默认选中第一个节点
            if (districtTreeData.value.length > 0) {
                const firstNode = districtTreeData.value[0];
                selectedDistrict.value = [firstNode.key];
                expandedKeys.value = [firstNode.key];
                searchForm.district = firstNode.title;
            }
        }
    } catch (error) {
        console.error('获取行政区划数据失败:', error);
    } finally {
        treeLoading.value = false;
        // 树加载完成后加载表格数据
        if (selectedDistrict.value.length > 0) {
            loadData(searchForm.district);
        } else {
            tableLoading.value = false;
        }
    }
};

const handleDistrictSearch = () => {
    const searchText = districtSearchText.value.trim();

    if (!searchText) {
        // 没有搜索文本时，恢复原始树数据
        filteredDistrictTreeData.value = JSON.parse(JSON.stringify(districtTreeData.value));
        return;
    }

    // 深度优先搜索，返回匹配的节点
    const filterTree = (tree) => {
        if (!tree || tree.length === 0) return [];

        const result = [];

        for (const node of tree) {
            // 克隆节点
            const clonedNode = { ...node };

            // 处理子节点
            if (node.children && node.children.length > 0) {
                clonedNode.children = filterTree(node.children);
            }

            // 如果标题包含搜索文本或有匹配的子节点，则保留该节点
            if ((clonedNode.title && clonedNode.title.toLowerCase().includes(searchText.toLowerCase())) ||
                (clonedNode.children && clonedNode.children.length > 0)) {
                result.push(clonedNode);
            }
        }

        return result;
    };

    // 应用过滤
    filteredDistrictTreeData.value = filterTree(JSON.parse(JSON.stringify(districtTreeData.value)));

    // 如果有搜索结果，展开所有节点以显示匹配项
    if (filteredDistrictTreeData.value.length > 0) {
        // 递归收集所有节点的key
        const getAllKeys = (nodes) => {
            if (!nodes) return [];
            let keys = [];
            for (const node of nodes) {
                keys.push(node.key);
                if (node.children) {
                    keys = keys.concat(getAllKeys(node.children));
                }
            }
            return keys;
        };

        expandedKeys.value = getAllKeys(filteredDistrictTreeData.value);
        autoExpandParent.value = true;
    }
};

// 高亮显示函数
const getHighlightFragments = (title, searchValue) => {
    if (!searchValue || !title) return [{ text: title, highlight: false }];

    const searchLower = searchValue.toLowerCase();
    const titleLower = title.toLowerCase();

    if (!titleLower.includes(searchLower)) return [{ text: title, highlight: false }];

    const fragments = [];
    let lastIndex = 0;
    let startIndex = titleLower.indexOf(searchLower);

    while (startIndex !== -1) {
        // 匹配前的文本
        if (startIndex > lastIndex) {
            fragments.push({
                text: title.substring(lastIndex, startIndex),
                highlight: false
            });
        }

        // 匹配的文本 - 使用原始大小写
        fragments.push({
            text: title.substring(startIndex, startIndex + searchValue.length),
            highlight: true
        });

        lastIndex = startIndex + searchValue.length;
        startIndex = titleLower.indexOf(searchLower, lastIndex);
    }

    // 添加剩余文本
    if (lastIndex < title.length) {
        fragments.push({
            text: title.substring(lastIndex),
            highlight: false
        });
    }

    return fragments;
};

// 在input变化时调用搜索函数
const handleDistrictSearchInput = (e) => {
    districtSearchText.value = e.target.value;
    handleDistrictSearch();
};

const handleDistrictSelect = (selectedKeys, info) => {
    if (selectedKeys.length > 0) {
        selectedDistrict.value = selectedKeys;
        const districtName = info.node.title;
        searchForm.district = districtName;
        pagination.current = 1;
        loadData(districtName);
    }
};

const handleSearch = () => {
    pagination.current = 1;
    loadData(searchForm.district);
};

const handleTableChange = (page, pageSize) => {
    pagination.current = page;
    if (pageSize) {
        pagination.pageSize = pageSize;
    }
    loadData(searchForm.district);
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
        dataIndex: 'areaname',
        key: 'areaname',
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
        dataIndex: 'porkerCount',
        key: 'porkerCount',
        align: 'center'
    },
    {
        title: '仔猪',
        dataIndex: 'pigletCount',
        key: 'pigletCount',
        align: 'center'
    },
    {
        title: '母猪',
        dataIndex: 'sowCount',
        key: 'sowCount',
        align: 'center'
    },
    {
        title: '最近上报日期',
        dataIndex: 'registTime',
        key: 'registTime',
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
    total: 0,
    showSizeChanger: true,
});

const tableData = ref([]);

const loadData = async (district) => {
    tableLoading.value = true;
    try {
        const params = {
            condition: {
                areacode: selectedDistrict.value[0] || '',
                farmName: searchForm.farmName || ''
            },
            pageNo: pagination.current,
            pageSize: pagination.pageSize
        };

        const res = await pageQueryLeaves(params);
        if (res && res.records) {
            tableData.value = res.records.map((item, index) => ({
                ...item,
                index: (pagination.current - 1) * pagination.pageSize + index + 1
            }));
            pagination.total = res.total || 0;
        } else {
            tableData.value = [];
            pagination.total = 0;
        }
    } catch (error) {
        console.error('获取存栏清单数据失败:', error);
        tableData.value = [];
        pagination.total = 0;
    } finally {
        tableLoading.value = false;
    }
};

const handleDownload = async () => {
    try {
        message.loading({ content: '清单下载中...', key: 'download', duration: 0 });

        const params = {
            condition: {
                areacode: selectedDistrict.value[0] || '',
                farmName: searchForm.farmName || ''
            }
        };

        await exportLeaves(params);

        message.success({ content: '下载成功', key: 'download', duration: 2 });
    } catch (error) {
        console.error('下载清单失败:', error);
        message.error({ content: '下载清单失败', key: 'download', duration: 2 });
    }
};

const viewDetails = (record) => {
    router.push(`/KEEP/details/${record.farmId}`);
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