import axios from '@/request';

// 获取行政区划数据
export function getDistrictList(params: any) {
    return axios({
        url: '/web/area/selectChildren',
        method: 'post',
        data: params
    });
}

// 获取行政区划详情
export function getDistrictDetail(areacode: string) {
    return axios({
        url: '/web/area/getArea',
        method: 'post',
        data: {
            condition: {
                primaryKey: areacode
            }
        }
    });
}

// 修改行政区划
export function updateDistrict(data: any) {
    return axios({
        url: '/web/area/editArea',
        method: 'post',
        data: {
            condition: data
        }
    });
}

// 启用/禁用行政区划
export function enableDistrict(areacode: string) {
    return axios({
        url: '/web/area/enable',
        method: 'post',
        data: {
            condition: {
                primaryKey: areacode
            }
        }
    });
}

// 获取行政区划树形数据
export function getAreaTrees() {
    return axios({
        url: '/web/area/selectWholeAreaTrees',
        method: 'post'
    });
}