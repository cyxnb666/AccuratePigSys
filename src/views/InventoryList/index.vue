<template>
    <div class="inventory-list">
        <a-row :gutter="16" class="main-container">
            <a-col :span="5">
                <div class="district-tree-container">
                    <h3>行政区划</h3>
                    <a-tree :tree-data="districtTreeData" @select="handleDistrictSelect"
                        :defaultExpandedKeys="['sichuan']" :selectedKeys="selectedDistrict">
                        <template #title="{ title }">
                            <span>{{ title }}</span>
                        </template>
                    </a-tree>
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
                                :page-size="pagination.pageSize" @change="handleTableChange" show-size-changer />
                        </div>
                    </div>
                </div>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const districtTreeData = [
    {
        title: '四川省',
        key: 'sichuan',
        value: 'sichuan',
        children: [
            {
                title: '成都市',
                key: 'chengdu',
                value: 'chengdu',
            },
            {
                title: '南充市',
                key: 'nanchong',
                value: 'nanchong',
            },
            {
                title: '绵阳市',
                key: 'mianyang',
                value: 'mianyang',
            }
        ]
    }
];

const tableHeight = ref('calc(80vh - 150px)');

const selectedDistrict = ref(['sichuan']);

const searchForm = reactive({
    farmName: '',
    district: '四川省'
});

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
    showQuickJumper: true
});

const handleTableChange = (page) => {
    pagination.current = page;
};

const generateMockData = (district = '四川省') => {
    const data = [];
    for (let i = 1; i <= 100; i++) {
        data.push({
            id: i,
            index: i,
            district: district,
            farmName: `XXXXX养殖场`,
            fatteningPigs: 5,
            piglets: i % 2 === 0 ? 0 : 5,
            sows: i % 2 === 0 ? 0 : 5,
            reportDate: '2025-03-31'
        });
    }
    return data;
};

const tableData = ref(generateMockData());

const handleDistrictSelect = (selectedKeys, info) => {
    if (selectedKeys.length > 0) {
        selectedDistrict.value = selectedKeys;
        const districtName = info.node.title;
        searchForm.district = districtName;
        loadData(districtName);
    }
};

const loadData = (district) => {
    tableData.value = generateMockData(district);
};

const handleSearch = () => {
    loadData(searchForm.district);

    if (searchForm.farmName) {
        tableData.value = tableData.value.filter(item =>
            item.farmName.includes(searchForm.farmName)
        );
    }
};

const handleDownload = () => {
    message.success('清单下载中...');
};

const viewDetails = (record) => {
    router.push(`/archive/details/${record.id}`);
};

onMounted(() => {
    loadData('四川省');
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
        height: 100%;
        padding: 16px;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

        h3 {
            margin-bottom: 16px;
            font-weight: 500;
        }
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

:deep(.ant-table-wrapper) {  .ant-table-thead>tr>th {
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