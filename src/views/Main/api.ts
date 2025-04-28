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