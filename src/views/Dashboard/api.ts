import axios from '@/request';

// 获取行政区划树形数据
export function selectUserTree() {
    return axios({
        url: '/web/area/selectUserTree',
        method: 'post'
    });
}

// 获取养殖场情况数据
export function selectAreaFarms(areacode) {
    return axios({
        url: '/web/home/selectAreaFarms',
        method: 'post',
        data: {
            condition: {
                areacode: areacode
            }
        }
    });
}

// 获取存栏品种数据
export function selectHomeFarms(areacode) {
    return axios({
        url: '/web/home/selectHomeFarms',
        method: 'post',
        data: {
            condition: {
                areacode: areacode
            }
        }
    });
}