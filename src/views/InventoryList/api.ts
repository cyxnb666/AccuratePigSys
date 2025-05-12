import axios from '@/request';

// 获取行政区划树形数据
export function selectUserTree() {
    return axios({
        url: '/web/area/selectUserTree',
        method: 'post'
    });
}

// 获取存栏清单分页数据
export function pageQueryLeaves(params) {
    return axios({
        url: '/web/leave/pageQueryLeaves',
        method: 'post',
        data: params
    });
}

// 导出存栏清单
export function exportLeaves(params) {
    return axios({
        url: '/web/leave/export',
        method: 'post',
        data: params,
        responseType: 'blob',
        isDownload: true,
        name: '存栏清单.xlsx'
    });
}

// 获取养殖场基础信息
export function getLivestockFarm(params) {
    return axios({
        url: '/web/livestock/getLivestockFarm',
        method: 'post',
        data: params
    });
}

// 获取异常预警数据
export function queryErrorFarmWarns(params) {
    return axios({
        url: '/web/warn/queryErrorFarmWarns',
        method: 'post',
        data: params
    });
}

// 获取养殖场存栏情况
export function getLeave(farmId) {
    return axios({
        url: '/web/leave/getLeave',
        method: 'post',
        data: {
            condition: {
                primaryKey: farmId
            }
        }
    });
}

// 获取存栏上报情况
export function getFarmWarnStaticis(params) {
    return axios({
        url: '/web/leave/getFarmWarnStaticis',
        method: 'post',
        data: params
    });
}