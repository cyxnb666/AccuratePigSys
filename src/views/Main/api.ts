import request from '@/request/index'

/**
 * 退出登录接口
 * @returns {Promise}
 */
export function logout() {
    return request({
        url: '/web/auth/logout',
        method: 'get'
    })
}

/**
 * 修改密码接口
 * @param {Object} data - 密码信息
 * @returns {Promise}
 */
export function resetPassword(data) {
    return request({
        url: '/web/sys/resetPwd',
        method: 'post',
        data
    })
}