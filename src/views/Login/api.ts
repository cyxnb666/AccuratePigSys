import request from '@/request/index'
import { sessionManager } from '@/request/sessionManager';

/**
 * 获取验证码
 * @returns {Promise<Blob>}
 */
export function getVerifyCode() {
    return request({
        url: '/web/auth/getVerifyCode',
        method: 'get',
        responseType: 'blob',
        headers: {
            'JSESSIONID': sessionManager.getSessionId()
        }
    })
}

/**
 * 登录接口
 * @param data 登录信息
 * @returns {Promise}
 */
export function login(data: {
    tenantCode: string;
    username: string;
    password: string;
    verificationCode: string;
}) {
    return request({
        url: '/web/auth/login',
        method: 'post',
        data,
        headers: {
            'JSESSIONID': sessionManager.getSessionId()
        }
    })
}