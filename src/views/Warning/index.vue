<template>
    <div class="abnormal-warning">
        <!-- 搜索表单 -->
        <div class="search-form">
            <a-form layout="inline">
                <a-row :gutter="16" style="width: 100%">
                    <a-col>
                        <a-form-item label="行政区划:">
                            <a-tree-select v-model:value="searchForm.district" :tree-data="areaTreeData"
                                placeholder="请选择行政区划" allow-clear
                                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                                :tree-node-filter-prop="'title'" :show-search="true" style="min-width: 200px" />
                        </a-form-item>
                    </a-col>
                    <a-col>
                        <a-form-item label="养殖场:">
                            <a-input placeholder="请输入养殖场名称" v-model:value="searchForm.farmName" />
                        </a-form-item>
                    </a-col>
                    <a-col>
                        <a-form-item label="上报时间:">
                            <a-range-picker v-model:value="searchForm.reportTimeRange" />
                        </a-form-item>
                    </a-col>
                    <a-col>
                        <a-form-item>
                            <a-button type="primary" @click="handleSearch">查 询</a-button>
                            <a-button style="margin-left: 8px" @click="handleReset">重 置</a-button>
                        </a-form-item>
                    </a-col>
                </a-row>
            </a-form>
        </div>

        <!-- 数据表格 -->
        <div class="data-table">
            <a-table :columns="columns" :data-source="dataSource" :pagination="false" bordered row-key="id"
                :scroll="{ y: tableHeight }">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'deviationRate'">
                        <span :style="{ color: getDeviationColor(record.deviationRate) }">
                            {{ record.deviationRate }}%
                        </span>
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-button type="link" @click="viewDetails(record)">详情</a-button>
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
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { getAreaTrees } from './api';

const router = useRouter();

// 搜索表单
const searchForm = reactive({
    district: undefined,
    farmName: '',
    reportTimeRange: []
});

// 表格高度
const tableHeight = ref('calc(80vh - 150px)');

// 行政区划树形数据
const areaTreeData = ref<any[]>([]);

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
        title: '上报时间',
        dataIndex: 'reportTime',
        key: 'reportTime',
        align: 'center'
    },
    {
        title: '上报总数',
        dataIndex: 'totalReported',
        key: 'totalReported',
        align: 'center'
    },
    {
        title: '人工审核数量',
        dataIndex: 'manualReviewCount',
        key: 'manualReviewCount',
        align: 'center'
    },
    {
        title: '偏差率',
        dataIndex: 'deviationRate',
        key: 'deviationRate',
        align: 'center'
    },
    {
        title: '操作',
        key: 'action',
        align: 'center'
    }
];

// 获取偏差率颜色
const getDeviationColor = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate > 15) return '#FF4D4F'; // 红色 - 高偏差
    if (numRate > 8) return '#FAAD14';  // 黄色 - 中偏差
    return '#52C41A';                   // 绿色 - 低偏差
};

// 模拟数据
const generateData = () => {
    const data = [];
    for (let i = 1; i <= 15; i++) {
        // 生成随机的偏差率，介于0-20%之间
        const deviationRate = (Math.random() * 20).toFixed(2);
        const totalReported = 500 + i * 20;

        // 根据偏差率计算人工审核数量
        const manualReviewCount = Math.round(totalReported * (1 - parseFloat(deviationRate) / 100));

        data.push({
            id: i,
            index: i,
            district: '四川省成都市' + (i % 2 === 0 ? '武侯区' : '锦江区'),
            farmName: `养殖场 ${i}`,
            reportTime: `2025-04-${10 + i % 20}`,
            totalReported: totalReported,
            manualReviewCount: manualReviewCount,
            deviationRate: deviationRate
        });
    }
    return data;
};

// 表格数据
const dataSource = ref(generateData());

// 分页
const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 15
});

const handleSearch = () => {
    console.log('搜索条件:', searchForm);
    pagination.current = 1;
    // 实际项目中这里应该调用API进行搜索
};

const handleReset = () => {
    searchForm.district = undefined;
    searchForm.farmName = '';
    searchForm.reportTimeRange = [];
};

const viewDetails = (record) => {
    router.push({
        path: `/review/detail/${record.id}`,
        query: { viewMode: 'true' }
    });
};

const handleTableChange = (page, pageSize) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    // 加载当前页数据
};

onMounted(() => {
    fetchAreaTrees();
});
</script>

<style lang="scss" scoped>
.abnormal-warning {
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

// 表格样式优化
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