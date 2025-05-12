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