import { request } from './config'

export const reminderApi = {
    // 获取用户的所有提醒
    getList(userId) {
        return request({
            url: `/reminder/list/${userId}`
        })
    },
    
    // 获取提醒信息
    getAlerts(userId) {
        return request({
            url: `/reminder/alerts/${userId}`
        })
    },
    
    // 创建库存提醒
    createStockReminder(data) {
        return request({
            url: '/reminder/stock',
            method: 'POST',
            data
        })
    },
    
    // 创建使用提醒
    createUsageReminder(data) {
        return request({
            url: '/reminder/usage',
            method: 'POST',
            data
        })
    },
    
    // 更新最后使用时间
    updateLastUsage(itemId, userId) {
        return request({
            url: `/reminder/usage/${itemId}?userId=${userId}`,
            method: 'POST'
        })
    },
    
    // 启用/禁用提醒
    toggleReminder(reminderId, data) {
        return request({
            url: `/reminder/toggle/${reminderId}`,
            method: 'PUT',
            data
        })
    },
    
    // 删除提醒
    deleteReminder(reminderId, userId) {
        return request({
            url: `/reminder/${reminderId}?userId=${userId}`,
            method: 'DELETE'
        })
    }
} 