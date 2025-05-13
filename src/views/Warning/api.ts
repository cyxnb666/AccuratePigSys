import axios from '@/request';

// 获取行政区划树形数据
export function getAreaTrees() {
    return axios({
        url: '/web/area/selectUserTree',
        method: 'post'
    });
}

// 分页查询异常预警列表
export function getWarningList(params: any) {
    return axios({
        url: '/web/warn/queryErrorFarmWarns',
        method: 'post',
        data: params
    });
}