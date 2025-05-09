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