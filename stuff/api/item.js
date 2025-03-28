// 物品相关接口
import { request } from './config'

export const itemApi = {
    // 搜索物品
    search(userId, params) {
        return request({
            url: `/item/search/${userId}`,
            data: params
        })
    },
    
    // 获取物品详情
    getDetail(id, userId) {
        return request({
            url: `/item/detail/${id}?userId=${userId}`
        })
    },
    
    // 创建物品
    create(data) {
        return request({
            url: '/item/create',
            method: 'POST',
            data
        })
    },
    
    // 更新物品
    update(id, data) {
        return request({
            url: `/item/update/${id}`,
            method: 'PUT',
            data
        })
    },
    
    // 删除物品
    delete(id, userId) {
        return request({
            url: `/item/delete/${id}?userId=${userId}`,
            method: 'DELETE'
        })
    },
    
    // 更新物品数量
    updateQuantity(itemId, data) {
        return request({
            url: `/item/${itemId}/quantity`,
            method: 'POST',
            data
        })
    },
    
    // 搜索家庭组物品
    searchFamilyItems(familyId, params) {
        return request({
            url: `/item/family/${familyId}/search`,
            data: params
        })
    }
}