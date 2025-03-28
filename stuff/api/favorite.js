import { request } from './config'

export const favoriteApi = {
    // 添加收藏
    add(data) {
        return request({
            url: '/favorite/add',
            method: 'POST',
            data
        })
    },
    
    // 获取收藏列表
    getList(userId, params) {
        return request({
            url: `/favorite/list/${userId}`,
            data: params
        })
    },
    
    // 取消收藏
    remove(itemId, userId) {
        return request({
            url: `/favorite/remove?itemId=${itemId}&userId=${userId}`,
            method: 'DELETE'
        })
    },
    
    // 检查是否已收藏
    check(itemId, userId) {
        return request({
            url: `/favorite/check?itemId=${itemId}&userId=${userId}`
        })
    }
} 