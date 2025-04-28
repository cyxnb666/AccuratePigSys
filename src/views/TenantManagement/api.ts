import axios from '@/request';

// 获取行政区划树形数据
export function getAreaTrees() {
    return axios({
        url: '/web/area/selectWholeAreaTrees',
        method: 'post'
    });
}

// 分页查询租户列表
export function getTenantList(params: any) {
    return axios({
        url: '/web/tencent/pageQueryTencents',
        method: 'post',
        data: params
    });
}

// 获取租户详情
export function getTenantDetail(tencentCode: string) {
    return axios({
        url: '/web/tencent/getTencent',
        method: 'post',
        data: {
            condition: {
                primaryKey: tencentCode
            }
        }
    });
}

// 新增租户
export function saveTenant(data: any) {
    return axios({
        url: '/web/tencent/saveTencent',
        method: 'post',
        data: {
            condition: data
        }
    });
}

// 修改租户
export function updateTenant(data: any) {
    return axios({
        url: '/web/tencent/editTencent',
        method: 'post',
        data: {
            condition: data
        }
    });
}

// 启用/禁用租户
export function enableTenant(tencentCode: string) {
    return axios({
        url: '/web/tencent/enable',
        method: 'post',
        data: {
            condition: {
                primaryKey: tencentCode
            }
        }
    });
}

// 删除租户
export function deleteTenant(primaryKey: any) {
    return axios({
        url: '/web/tencent/softRemoveTencent',
        method: 'post',
        data: {
            condition: {
                primaryKey
            }
        }
    });
}