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

// 获取文件预览
export function getFilePreview(fileId: string) {
    return axios({
        url: '/web/file/preview',
        method: 'post',
        responseType: 'blob',
        data: {
            condition: {
                primaryKey: fileId
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