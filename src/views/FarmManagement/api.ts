import axios from '@/request';

// 获取行政区划树形数据
export function getAreaTrees() {
    return axios({
        url: '/web/area/selectWholeAreaTrees',
        method: 'post'
    });
}

// 获取用户行政区划树数据
export function getUserAreaTrees() {
    return axios({
        url: '/web/area/selectUserTree',
        method: 'post'
    });
}

// 分页查询养殖场列表
export function getFarmList(params: any) {
    return axios({
        url: '/web/livestock/pageQueryLivestockFarms',
        method: 'post',
        data: params
    });
}

// 获取养殖场详情
export function getFarmDetail(farmId: string) {
    return axios({
        url: '/web/livestock/getLivestockFarm',
        method: 'post',
        data: {
            condition: {
                primaryKey: farmId
            }
        }
    });
}

// 获取养殖场联系人
export function getFarmLinkers(farmId: string) {
    return axios({
        url: '/web/livestock/queryLivestockFarmLinkers',
        method: 'post',
        data: {
            condition: {
                primaryKey: farmId
            }
        }
    });
}

// 新增养殖场
export function saveFarm(data: any) {
    return axios({
        url: '/web/livestock/saveLivestockFarm',
        method: 'post',
        data: {
            condition: data
        }
    });
}

// 修改养殖场
export function updateFarm(data: any) {
    return axios({
        url: '/web/livestock/editLivestockFarm',
        method: 'post',
        data: {
            condition: data
        }
    });
}

// 删除养殖场
export function deleteFarm(primaryKey: any) {
    return axios({
        url: '/web/livestock/softRemoveLivestockFarm',
        method: 'post',
        data: {
            condition: {
                primaryKey
            }
        }
    });
}

// 保存上报任务配置
export function saveReportTask(farmId: string, config: any) {
    return axios({
        url: '/web/livestock/saveReportTaskConfig',
        method: 'post',
        data: {
            condition: {
                farmId: farmId,
                config: config
            }
        }
    });
}

// 启用/禁用联系人
export function toggleContactStatus(farmLinkerId: string) {
    return axios({
        url: '/web/livestock/enable',
        method: 'post',
        data: {
            condition: {
                primaryKey: farmLinkerId
            }
        }
    });
}

// 设置主要联系人
export function setAsPrimaryContact(farmLinkerId: string) {
    return axios({
        url: '/web/livestock/changePrimary',
        method: 'post',
        data: {
            condition: {
                primaryKey: farmLinkerId
            }
        }
    });
}

// 编辑联系人
export function editContact(contactData: any) {
    return axios({
        url: '/web/livestock/editLinker',
        method: 'post',
        data: {
            condition: contactData
        }
    });
}

// 新增联系人
export function addContact(contactData: any) {
    return axios({
        url: '/web/livestock/addNewLinker',
        method: 'post',
        data: {
            condition: contactData
        }
    });
}

// 删除联系人
export function deleteContact(farmLinkerId: string) {
    return axios({
        url: '/web/sys/softRemoveSysUser',
        method: 'post',
        data: {
            condition: {
                primaryKey: farmLinkerId
            }
        }
    });
}

// 开启-关闭围栏编辑开关
export function toggleFenceEdit(primaryKey: string) {
    return axios({
        url: '/web/livestock/openOrCloseFenceEdit',
        method: 'post',
        data: {
            condition: {
                primaryKey
            }
        }
    });
}