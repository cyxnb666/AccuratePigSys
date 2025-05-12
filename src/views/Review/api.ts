import axios from '@/request';

// 获取行政区划树形数据
export function getAreaTrees() {
    return axios({
        url: '/web/area/selectWholeAreaTrees',
        method: 'post'
    });
}

// 分页查询审核列表
export function getAuditList(params: any) {
    return axios({
        url: '/web/audit/pageQueryAudits',
        method: 'post',
        data: params
    });
}

// 获取审核详情
export function getAuditDetail(auditId: string) {
    return axios({
        url: '/web/audit/getAudit',
        method: 'post',
        data: {
            condition: {
                primaryKey: auditId
            }
        }
    });
}

// 获取死亡登记记录
export function queryRangeRegistDeads(auditId: string) {
    return axios({
        url: '/web/audit/queryRangeRegistDeads',
        method: 'post',
        data: {
            condition: {
                primaryKey: auditId
            }
        }
    });
}

// 获取补栏登记记录
export function queryRangeRegistRestocks(auditId: string) {
    return axios({
        url: '/web/audit/queryRangeRegistRestocks',
        method: 'post',
        data: {
            condition: {
                primaryKey: auditId
            }
        }
    });
}

// 获取出栏登记记录
export function queryRangeRegistSlaughters(auditId: string) {
    return axios({
        url: '/web/audit/queryRangeRegistSlaughters',
        method: 'post',
        data: {
            condition: {
                primaryKey: auditId
            }
        }
    });
}

// 获取死亡登记详情
export function getWebDeadRegist(bizId: string) {
    return axios({
        url: '/web/audit/getWebDeadRegist',
        method: 'post',
        data: {
            condition: {
                primaryKey: bizId
            }
        }
    });
}

// 获取围栏详细数据
export function getLeaveFence(fenceRegistId: string) {
    return axios({
        url: '/web/audit/getLeaveFence',
        method: 'post',
        data: {
            condition: {
                primaryKey: fenceRegistId
            }
        }
    });
}

// 死亡登记确认接口
export function deadConfirm(data: any) {
    return axios({
        url: '/web/audit/deadConfirm',
        method: 'post',
        data: data
    });
}

// 提交审核结果
export function submitAudit(data: any) {
    return axios({
        url: '/web/audit/audit',
        method: 'post',
        data: {
            condition: data
        }
    });
}