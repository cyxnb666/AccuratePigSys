import axios from '@/request';

// 获取行政区划树形数据
export function getAreaTrees() {
    return axios({
        url: '/web/area/selectWholeAreaTrees',
        method: 'post'
    });
}

// 获取上报提醒统计数据
export function getReportReminderStatistics(params: any) {
    return axios({
        url: '/web/warn/selectNormalFarmWarnStaticis',
        method: 'post',
        data: params
    });
}

// 获取提醒记录详情
export function getNormalWarns(farmId: string, pageNo: number = 1, pageSize: number = 10) {
    return axios({
        url: '/web/warn/pageQueryNormalWarns',
        method: 'post',
        data: {
            condition: {
                primaryKey: farmId
            },
            pageNo,
            pageSize
        }
    });
}