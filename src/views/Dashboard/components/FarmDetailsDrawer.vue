<template>
    <div class="farm-details-drawer">
        <a-spin :spinning="pageLoading" tip="正在加载数据..." class="global-loading">
            <div class="info-warning-card">
                <farm-basic-info :farm-info="farmInfo" :show-detail-button="true" @view-detail="viewFarmDetail" />

                <div style="margin-top: 20px;">
                    <abnormal-warning :warning-data="warningData" @view-more="viewMoreWarnings" />
                </div>
            </div>

            <div class="detail-section">
                <a-row :gutter="16">
                    <a-col :span="12">
                        <farm-inventory-pie :leave-data="leaveData" ref="inventoryPieRef" />
                    </a-col>
                    <a-col :span="12">
                        <report-status-bar class="report-status-adjusted" :farm-warn-data="farmWarnData"
                            :farm-id="farmId" v-model:date-range="dateRange"
                            @reload-report-data="handleReportDataReload" ref="reportStatusRef" />
                    </a-col>
                </a-row>
            </div>

            <div class="detail-section">
                <inventory-trend-line :trend-data="trendData" v-model:date-range="trendDateRange" ref="trendLineRef" />
            </div>

            <div class="detail-section">
                <monthly-change-mixed :mixed-data="mixedData" v-model:date-range="mixedChartDateRange"
                    ref="monthlyMixedRef" />
            </div>

            <div class="detail-section">
                <current-inventory-tabs :stock-data="stockData.slice(0, 5)" :outbound-data="outboundData.slice(0, 5)"
                    :inbound-data="inboundData.slice(0, 5)" :death-data="deathData.slice(0, 5)"
                    :stock-pagination="stockPagination" :outbound-pagination="outboundPagination"
                    :inbound-pagination="inboundPagination" :death-pagination="deathPagination" :show-pagination="false"
                    :show-view-more="true" @view-detail="handleViewDetail" @view-more="viewMoreInventory"
                    @tab-change="handleTabChange" />
            </div>

            <death-detail-dialog ref="deathDetailRef" v-model:visible="deathDetailVisible" :record="currentDeathRecord"
                :is-view-mode="true" />
        </a-spin>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
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
} from '@/views/InventoryList/api';
import DeathDetailDialog from '@/views/Review/details/DeathDetailDialog.vue';
import { getWebDeadRegist } from '@/views/Review/api';
import FarmBasicInfo from '@/components/FarmBasicInfo.vue';
import AbnormalWarning from '@/components/AbnormalWarning.vue';
import FarmInventoryPie from '@/components/FarmInventoryPie.vue';
import ReportStatusBar from '@/components/ReportStatusBar.vue';
import InventoryTrendLine from '@/components/InventoryTrendLine.vue';
import MonthlyChangeMixed from '@/components/MonthlyChangeMixed.vue';
import CurrentInventoryTabs from '@/components/CurrentInventoryTabs.vue';
import dayjs from 'dayjs';

const router = useRouter();
const pageLoading = ref(true);

const props = defineProps({
    farmData: {
        type: Object,
        default: () => null
    }
});

const inventoryPieRef = ref(null);
const reportStatusRef = ref(null);
const trendLineRef = ref(null);
const monthlyMixedRef = ref(null);

const farmId = ref('');

const dateRange = ref<any>([]);
const trendDateRange = ref<any>([]);
const mixedChartDateRange = ref<any>([]);

const stockPagination = reactive({
    current: 1,
    pageSize: 5,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
});

const outboundPagination = reactive({
    current: 1,
    pageSize: 5,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
});

const inboundPagination = reactive({
    current: 1,
    pageSize: 5,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
});

const deathPagination = reactive({
    current: 1,
    pageSize: 5,
    total: 0,
    showTotal: (total) => `共 ${total} 条`,
});

const farmInfo = ref({});

const warningData = ref([]);

const leaveData = ref({
    pigletCount: 0,
    porkerCount: 0,
    sowCount: 0,
    totalCount: 0
});

const farmWarnData = ref({
    nregistCount: 0,
    oregistCount: 0,
    sregistCount: 0
});

const trendData = ref([]);


const mixedData = ref([]);

const stockData = ref([]);
const outboundData = ref([]);
const inboundData = ref([]);
const deathData = ref([]);

const deathDetailVisible = ref(false);
const currentDeathRecord = ref(null);
const deathDetailRef = ref(null);
const activeTabKey = ref('1');

const resizeAllCharts = () => {
    setTimeout(() => {
        if (inventoryPieRef.value?.$el?.querySelector('.chart')) {
            const chart = inventoryPieRef.value?.$el?.querySelector('.chart').__vue__?.chart;
            chart?.resize();
        }

        if (reportStatusRef.value?.$el?.querySelector('.chart')) {
            const chart = reportStatusRef.value?.$el?.querySelector('.chart').__vue__?.chart;
            chart?.resize();
        }

        if (trendLineRef.value?.$el?.querySelector('.chart')) {
            const chart = trendLineRef.value?.$el?.querySelector('.chart').__vue__?.chart;
            chart?.resize();
        }

        if (monthlyMixedRef.value?.$el?.querySelector('.chart')) {
            const chart = monthlyMixedRef.value?.$el?.querySelector('.chart').__vue__?.chart;
            chart?.resize();
        }

        inventoryPieRef.value?.resizeChart?.();
        reportStatusRef.value?.resizeChart?.();
        trendLineRef.value?.resizeChart?.();
        monthlyMixedRef.value?.resizeChart?.();

        window.dispatchEvent(new Event('resize'));
    }, 300);
};

const fetchFarmData = async () => {
    try {
        const params = {
            condition: {
                primaryKey: farmId.value
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

const fetchWarningData = async () => {
    try {
        const params = {
            condition: {
                areacode: "",
                farmId: farmId.value,
                startDate: "",
                endDate: ""
            },
            pageNo: 1,
            pageSize: 3
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

const fetchInventoryData = async () => {
    try {
        const res = await getLeave(farmId.value);
        if (res) {
            leaveData.value = res;
        }
    } catch (error) {
        console.error('获取存栏情况数据失败:', error);
    }
};

const fetchReportStatusData = async (startDate = "", endDate = "") => {
    try {
        const params = {
            condition: {
                endDate: endDate,
                farmId: farmId.value,
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

const fetchTrendData = async (startDate = "", endDate = "") => {
    try {
        const params = {
            condition: {
                endDate: endDate,
                farmId: farmId.value,
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

const fetchMixedData = async (startMonth = "", endMonth = "") => {
    try {
        const params = {
            condition: {
                endMonth: endMonth,
                farmId: farmId.value,
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

const fetchTableData = async (type = 'all') => {
    try {
        if (type === 'all' || type === 'stock') {
            const stockParams = {
                condition: {
                    primaryKey: farmId.value
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
            const outboundParams = {
                condition: {
                    primaryKey: farmId.value
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
            const inboundParams = {
                condition: {
                    primaryKey: farmId.value
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
            const deathParams = {
                condition: {
                    primaryKey: farmId.value
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

const handleTabChange = (key) => {
    activeTabKey.value = key;

    switch (key) {
        case '1':
            fetchTableData('stock');
            break;
        case '2':
            fetchTableData('outbound');
            break;
        case '3':
            fetchTableData('inbound');
            break;
        case '4':
            fetchTableData('death');
            break;
    }
};

const viewFarmDetail = () => {
    if (farmId.value) {
        router.push({
            path: `/FARM/edit`,
            query: { id: farmId.value }
        });
    } else {
        message.info('无法获取养殖场ID，请稍后再试');
    }
};

const viewMoreWarnings = () => {
    router.push('/E-WARN');
};

const viewMoreInventory = () => {
    if (farmId.value) {
        router.push(`/KEEP/details/${farmId.value}`);
    } else {
        message.info('无法获取养殖场ID，请稍后再试');
    }
};


const handleViewDetail = async (record) => {
    if (activeTabKey.value === '4') {
        const index = deathData.value.findIndex(item => item.bizId === record.bizId);
        if (index !== -1) {
            deathData.value[index].loading = true;
        }

        try {
            const detailRes = await getWebDeadRegist(record.bizId);

            if (detailRes.files && detailRes.files.length > 0) {
                detailRes.filePreviewUrls = {
                    images: [],
                    videos: []
                };

                detailRes.files.forEach(file => {
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
            fetchInventoryData(),
            fetchReportStatusData(),
            fetchTrendData(),
            fetchMixedData(),
            fetchTableData()
        ]);
        await fetchWarningData();

        nextTick(() => {
            resizeAllCharts();
        });
    } catch (error) {
        console.error('Error loading page data:', error);
    } finally {
        pageLoading.value = false;
    }
};

watch(() => props.farmData, (newData) => {
    if (newData && newData.farmId) {
        farmId.value = newData.farmId;
        loadData();
    }
}, { immediate: true });

onMounted(() => {
    resizeAllCharts();

    window.addEventListener('resize', resizeAllCharts);
});

defineExpose({
    refreshData: () => {
        if (farmId.value) {
            loadData();
        }
    },
    resizeCharts: resizeAllCharts
});
</script>

<style lang="scss" scoped>
.farm-details-drawer {
    padding: 0 8px;
    height: 100%;
    overflow-y: auto;

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

    .info-warning-card {
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
        padding: 16px;
        margin-bottom: 20px;
    }

    .detail-section {
        margin-bottom: 20px;

        &:last-child {
            margin-bottom: 0;
        }
    }
}
</style>