import axios from '@/request';

// 获取行政区划树形数据
export function getAreaTrees() {
    return axios({
        url: '/web/area/selectWholeAreaTrees',
        method: 'post'
    });
}

// 获取所有角色列表
export function getRoles() {
    return axios({
        url: '/web/sys/selectWholeRoles',
        method: 'post'
    });
}

// 获取养殖场列表
export function getLivestockFarms() {
    return axios({
        url: '/web/livestock/queryChooiseLivestockFarms',
        method: 'post'
    });
}

// 分页查询用户列表
export function getUserList(params: any) {
    return axios({
        url: '/web/sys/pageQuerySysUsers',
        method: 'post',
        data: params
    });
}

// 获取用户详情
export function getUserDetail(userId: string) {
    return axios({
        url: '/web/sys/getSysUser',
        method: 'post',
        data: {
            condition: {
                primaryKey: userId
            }
        }
    });
}

// 新增用户
export function saveUser(data: any) {
    return axios({
        url: '/web/sys/saveSysUser',
        method: 'post',
        data: {
            condition: data
        }
    });
}

// 修改用户
export function updateUser(data: any) {
    return axios({
        url: '/web/sys/editSysUser',
        method: 'post',
        data: {
            condition: data
        }
    });
}

// 启用/禁用用户
export function enableUser(userId: string) {
    return axios({
        url: '/web/sys/enable',
        method: 'post',
        data: {
            condition: {
                primaryKey: userId
            }
        }
    });
}

// 重置密码
export function resetPassword(userId: string) {
    return axios({
        url: '/web/sys/resetPwd',
        method: 'post',
        data: {
            condition: {
                primaryKey: userId
            }
        }
    });
}

// 删除用户
export function deleteUser(userId: string) {
    return axios({
        url: '/web/sys/softRemoveSysUser',
        method: 'post',
        data: {
            condition: {
                primaryKey: userId
            }
        }
    });
}