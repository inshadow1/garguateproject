// 分类相关接口
import { request } from './config'

export const categoryApi = {
    // 获取分类列表
    getList(userId) {
        return request({
            url: `/category/list/${userId}`
        })
    },
    
    // 创建分类
    create(data) {
        return request({
            url: '/category/create',
            method: 'POST',
            data
        })
    },
    
    // 更新分类
    update(id, data) {
        return request({
            url: `/category/update/${id}`,
            method: 'PUT',
            data
        })
    },
    
    // 删除分类
    delete(id, userId) {
        return request({
            url: `/category/delete/${id}?userId=${userId}`,
            method: 'DELETE'
        })
    }
} 