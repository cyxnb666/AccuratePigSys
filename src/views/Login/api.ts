import request from '@/request/index'
import { sessionManager } from '@/request/sessionManager';

/**
 * 获取验证码
 * @returns {Promise<Blob>}
 */
export function getVerifyCode() {
    return request({
        url: '/auth/getVerifyCode',
        method: 'get',
        responseType: 'blob',
        headers: {
            'JSESSIONID': sessionManager.getSessionId()
        }
    })
}
