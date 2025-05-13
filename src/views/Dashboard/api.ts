import axios from '@/request';

// 获取行政区划树形数据
export function selectUserTree() {
    return axios({
        url: '/web/area/selectUserTree',
        method: 'post'
    });
}