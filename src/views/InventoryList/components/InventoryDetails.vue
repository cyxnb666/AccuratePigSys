<template>
    <div class="inventory-details">
        <a-spin :spinning="pageLoading" tip="正在加载数据..." class="global-loading">
            <!-- 面包屑导航 -->
            <div class="bread-detail-card">
                <div class="breadcrumb">
                    <a-breadcrumb>
                        <a-breadcrumb-item>
                            <a @click="goBack">
                                <left-outlined /> 返回
                            </a>
                        </a-breadcrumb-item>
                        <a-breadcrumb-item>存栏详情</a-breadcrumb-item>
                    </a-breadcrumb>
                </div>
            </div>

            <div class="content-section">
                <div class="detail-card">
                    <a-row :gutter="24">
                        <a-col :span="10">
                            <!-- 养殖场基础信息 -->
                            <div class="info-card">
                                <farm-basic-info :farm-info="farmInfo" />

                                <!-- 异常预警 -->
                                <div style="margin-top: 20px;">
                                    <abnormal-warning :warning-data="warningData" @view-more="viewMoreWarnings" />
                                </div>
                            </div>
                        </a-col>

                        <!-- 右侧：养殖场存栏情况 -->
                        <a-col :span="7">
                            <farm-inventory-pie :leave-data="leaveData" />
                        </a-col>

                        <!-- 最右侧：上报情况 -->
                        <a-col :span="7" style="padding-left: 24px;">
                            <report-status-bar :farm-warn-data="farmWarnData" :farm-id="farmId"
                                v-model:date-range="dateRange" @reload-report-data="handleReportDataReload" />
                        </a-col>
                    </a-row>
                </div>

                <!-- 养殖区存栏量变化趋势图 -->
                <inventory-trend-line :trend-data="trendData" v-model:date-range="trendDateRange" />

                <!-- 养殖场存栏量月度变化趋势(柱状图+折线图混合) -->
                <monthly-change-mixed :mixed-data="mixedData" v-model:date-range="mixedChartDateRange" />
            </div>

            <!-- 当前存栏信息 -->
            <div class="current-inventory-section">
                <current-inventory-tabs :stock-data="stockData" :outbound-data="outboundData"
                    :inbound-data="inboundData" :death-data="deathData" :stock-pagination="stockPagination"
                    :outbound-pagination="outboundPagination" :inbound-pagination="inboundPagination"
                    :death-pagination="deathPagination" @view-detail="handleViewDetail" @tab-change="handleTabChange" />
            </div>

            <death-detail-dialog ref="deathDetailRef" v-model="deathDetailVisible" :record="currentDeathRecord"
                :is-view-mode="true" />

        </a-spin>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { LeftOutlined } from '@ant-design/icons-vue';
import {
    getLivestockFarm,
    queryErrorFarmWarns,
    getLeave,
    getFarmWarnStaticis,
    selectLeaveFenceStaticis,
    selectLeaveMonthStaticis,
    selectLeaveRegists,
    queryFarmRegistSlaughters,
    queryFarmRegistRestocks,
    queryFarmDeadRegistDeads
} from '../api';
import DeathDetailDialog from '@/views/Review/details/DeathDetailDialog.vue';
import { getWebDeadRegist } from '@/views/Review/api';
import FarmBasicInfo from '@/components/FarmBasicInfo.vue';
import AbnormalWarning from '@/components/AbnormalWarning.vue';
import FarmInventoryPie from '@/components/FarmInventoryPie.vue';
import ReportStatusBar from '@/components/ReportStatusBar.vue';
import InventoryTrendLine from '@/components/InventoryTrendLine.vue';
import MonthlyChangeMixed from '@/components/MonthlyChangeMixed.vue';
import CurrentInventoryTabs from '@/components/CurrentInventoryTabs.vue';
import dayjs from "dayjs";

const router = useRouter();
const route = useRoute();
const pageLoading = ref(true);
const farmId = route.params.id;
const goBack = () => {
    router.go(-1);
};

// 初始化日期范围
const dateRange = ref<any>([]);
const trendDateRange = ref<any>([]);
const mixedChartDateRange = ref<any>([]);

// 分页配置
const stockPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
    onChange: (page, pageSize) => {
        stockPagination.current = page;
        if (pageSize) stockPagination.pageSize = pageSize;
        fetchTableData('stock');
    }
});

const outboundPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
    onChange: (page, pageSize) => {
        outboundPagination.current = page;
        if (pageSize) outboundPagination.pageSize = pageSize;
        fetchTableData('outbound');
    }
});

const inboundPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
    onChange: (page, pageSize) => {
        inboundPagination.current = page;
        if (pageSize) inboundPagination.pageSize = pageSize;
        fetchTableData('inbound');
    }
});

const deathPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
    onChange: (page, pageSize) => {
        deathPagination.current = page;
        if (pageSize) deathPagination.pageSize = pageSize;
        fetchTableData('death');
    }
});

// 异常预警表格数据
const warningData = ref([]);
const fetchWarningData = async () => {
    try {
        const params = {
            "condition": {
                "areacode": "",
                farmId: farmId,
                "startDate": "",
                "endDate": ""
            },
            "pageNo": 1,
            "pageSize": 3
        };

        const res = await queryErrorFarmWarns(params);
        if (res && res.records) {
            warningData.value = res.records;
        } else {
            warningData.value = [];
        }
    } catch (error) {
        console.error('获取异常预警数据失败:', error);
        warningData.value = [];
    }
};

// 查看更多异常预警
const viewMoreWarnings = () => {
    router.push({
        path: '/E-WARN',
        query: { farmName: farmInfo.value.farmName }
    });
};

// 养殖场基础信息
const farmInfo = ref({});
const fetchFarmData = async () => {
    try {
        const params = {
            condition: {
                primaryKey: farmId
            }
        };
        const res = await getLivestockFarm(params);
        if (res) {
            farmInfo.value = res;
        }
    } catch (error) {
        console.error('获取养殖场数据失败:', error);
    }
};

// 存栏饼图数据
const leaveData = ref({
    pigletCount: 0,
    porkerCount: 0,
    sowCount: 0,
    totalCount: 0
});
const fetchInventoryData = async () => {
    try {
        const res = await getLeave(farmId);
        if (res) {
            leaveData.value = res;
        }
    } catch (error) {
        console.error('获取存栏情况数据失败:', error);
    }
};

// 上报情况柱状图数据
const farmWarnData = ref({
    nregistCount: 0,
    oregistCount: 0,
    sregistCount: 0
});
const fetchReportStatusData = async (startDate = "", endDate = "") => {
    try {
        const params = {
            condition: {
                endDate: endDate,
                farmId: farmId,
                startDate: startDate
            }
        };

        const res = await getFarmWarnStaticis(params);
        if (res) {
            farmWarnData.value = res;
        }
    } catch (error) {
        console.error('获取存栏上报情况数据失败:', error);
    }
};
const handleReportDataReload = (dateInfo) => {
    fetchReportStatusData(dateInfo.startDate, dateInfo.endDate);
};

// 趋势折线图数据
const trendData = ref([]);
const fetchTrendData = async (startDate = "", endDate = "") => {
    try {
        const params = {
            condition: {
                endDate: endDate,
                farmId: farmId,
                startDate: startDate
            }
        };

        const res = await selectLeaveFenceStaticis(params);
        if (res) {
            trendData.value = res;
        }
    } catch (error) {
        console.error('获取养殖区存栏量变化趋势数据失败:', error);
    }
};
watch(trendDateRange, (newValue) => {
    let startDate = "";
    let endDate = "";

    if (newValue && newValue.length === 2) {
        startDate = newValue[0] ? dayjs(newValue[0]).format('YYYY-MM-DD') : '';
        endDate = newValue[1] ? dayjs(newValue[1]).format('YYYY-MM-DD') : '';
    }
    fetchTrendData(startDate, endDate);
}, { deep: true });

// 月度变化混合图表数据
const mixedData = ref([]);
const fetchMixedData = async (startMonth = "", endMonth = "") => {
    try {
        const params = {
            condition: {
                endMonth: endMonth,
                farmId: farmId,
                startMonth: startMonth
            }
        };

        const res = await selectLeaveMonthStaticis(params);
        if (res) {
            mixedData.value = res;
        }
    } catch (error) {
        console.error('获取养殖场存栏量月度变化趋势数据失败:', error);
    }
};
watch(mixedChartDateRange, (newValue) => {
    let startMonth = "";
    let endMonth = "";

    if (newValue && newValue.length === 2) {
        startMonth = newValue[0] ? dayjs(newValue[0]).format('YYYY-MM') : '';
        endMonth = newValue[1] ? dayjs(newValue[1]).format('YYYY-MM') : '';
    }
    fetchMixedData(startMonth, endMonth);
}, { deep: true });

// 初始化表格数据
const stockData = ref([]);
const outboundData = ref([]);
const inboundData = ref([]);
const deathData = ref([]);
//获取表格数据
const fetchTableData = async (type = 'all') => {
    try {
        if (type === 'all' || type === 'stock') {
            // 存栏记录
            const stockParams = {
                condition: {
                    primaryKey: farmId
                },
                pageNo: stockPagination.current,
                pageSize: stockPagination.pageSize
            };
            const stockRes = await selectLeaveRegists(stockParams);
            if (stockRes && stockRes.records) {
                stockData.value = stockRes.records;
                stockPagination.total = stockRes.total || 0;
            }
        }

        if (type === 'all' || type === 'outbound') {
            // 出栏记录
            const outboundParams = {
                condition: {
                    primaryKey: farmId
                },
                pageNo: outboundPagination.current,
                pageSize: outboundPagination.pageSize
            };
            const outboundRes = await queryFarmRegistSlaughters(outboundParams);
            if (outboundRes && outboundRes.records) {
                outboundData.value = outboundRes.records;
                outboundPagination.total = outboundRes.total || 0;
            }
        }

        if (type === 'all' || type === 'inbound') {
            // 入栏记录
            const inboundParams = {
                condition: {
                    primaryKey: farmId
                },
                pageNo: inboundPagination.current,
                pageSize: inboundPagination.pageSize
            };
            const inboundRes = await queryFarmRegistRestocks(inboundParams);
            if (inboundRes && inboundRes.records) {
                inboundData.value = inboundRes.records;
                inboundPagination.total = inboundRes.total || 0;
            }
        }

        if (type === 'all' || type === 'death') {
            // 死亡记录
            const deathParams = {
                condition: {
                    primaryKey: farmId
                },
                pageNo: deathPagination.current,
                pageSize: deathPagination.pageSize
            };
            const deathRes = await queryFarmDeadRegistDeads(deathParams);
            if (deathRes && deathRes.records) {
                deathData.value = deathRes.records;
                deathPagination.total = deathRes.total || 0;
            }
        }
    } catch (error) {
        console.error('获取存栏信息数据失败:', error);
    }
};

const deathDetailVisible = ref(false);
const currentDeathRecord = ref(null);
const deathDetailRef = ref(null);
const activeTabKey = ref('1');

const handleTabChange = (key) => {
    activeTabKey.value = key;

    switch (key) {
        case '1': // 存栏记录
            fetchTableData('stock');
            break;
        case '2': // 出栏记录
            fetchTableData('outbound');
            break;
        case '3': // 入栏记录
            fetchTableData('inbound');
            break;
        case '4': // 死亡记录
            fetchTableData('death');
            break;
    }
};

// 查看详情
const handleViewDetail = async (record) => {
    if (activeTabKey.value === '4') { // 死亡记录
        // 设置当前记录的loading状态为true
        const index = deathData.value.findIndex(item => item.bizId === record.bizId);
        if (index !== -1) {
            deathData.value[index].loading = true;
        }

        try {
            const detailRes = await getWebDeadRegist(record.bizId);

            // 准备文件预览URLs
            if (detailRes.files && detailRes.files.length > 0) {
                detailRes.filePreviewUrls = {
                    images: [],
                    videos: []
                };

                detailRes.files.forEach(file => {
                    // 根据文件后缀判断是视频还是图片
                    const isVideo = ['mp4', 'mov', 'avi', 'wmv'].includes(file.fileSuffix.toLowerCase());

                    if (isVideo) {
                        detailRes.filePreviewUrls.videos.push({
                            id: file.fileId,
                            name: file.fileName,
                            url: file.fileUrl 
                        });
                    } else {
                        detailRes.filePreviewUrls.images.push({
                            id: file.fileId,
                            name: file.fileName,
                            url: file.fileUrl
                        });
                    }
                });
            }

            currentDeathRecord.value = detailRes;
            deathDetailVisible.value = true;
        } catch (error) {
            console.error('获取死亡登记详情失败:', error);
        } finally {
            if (index !== -1) {
                deathData.value[index].loading = false;
            }
        }
    } else {
        router.push({
            path: `/AUDITD/detail/${record.auditId}`,
            query: { viewMode: 'true' }
        });
    }
};

const loadData = async () => {
    pageLoading.value = true;
    try {
        await Promise.all([
            fetchFarmData(),
            fetchWarningData(),
            fetchInventoryData(),
            fetchReportStatusData(),
            fetchTrendData(),
            fetchMixedData(),
            fetchTableData()
        ]);
    } catch (error) {
        console.error('Error loading page data:', error);
    } finally {
        pageLoading.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>

<style lang="scss" scoped>
.inventory-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: #f0f2f5;
    height: 100%;

    .global-loading {
        height: 100%;

        :deep(.ant-spin-container) {
            height: 100%;
        }

        :deep(.ant-spin) {
            max-height: none;
        }

        :deep(.ant-spin-spinning) {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
    }

    .info-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
        padding: 16px;
    }

    .content-section,
    .current-inventory-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .bread-detail-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        padding: 6px;
    }

    .detail-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        padding: 12px;
    }

    .charts-row {
        .detail-card {
            height: 100%;
        }
    }
}
</style>