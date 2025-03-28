// 用户相关接口
import { request, BASE_URL } from './config'

export const userApi = {
    // 登录
    login(data) {
        return request({
            url: '/user/login',
            method: 'POST',
            data
        })
    },
    
    // 注册
    register(data) {
        return request({
            url: '/user/register',
            method: 'POST',
            data
        })
    },
    
    // 获取用户信息
    getProfile(userId) {
        return request({
            url: `/user/${userId}/profile`
        })
    },
    
    // 更新用户信息
    updateProfile(userId, data) {
        return request({
            url: `/user/${userId}/profile`,
            method: 'PUT',
            data
        })
    },
    
    // 修改密码
    updatePassword(userId, data) {
        return request({
            url: `/user/${userId}/password`,
            method: 'PUT',
            data
        })
    },
    
    // 上传头像
    uploadAvatar(userId, filePath) {
        return new Promise((resolve, reject) => {
            uni.uploadFile({
                url: `${BASE_URL}/user/${userId}/avatar`,
                filePath: filePath,
                name: 'file',
                header: {
                    'Authorization': uni.getStorageSync('token')
                },
                success: (uploadRes) => {
                    try {
                        // 确保返回的数据是JSON格式
                        const result = typeof uploadRes.data === 'string' 
                            ? JSON.parse(uploadRes.data) 
                            : uploadRes.data
                        resolve(result)
                    } catch (e) {
                        reject(new Error('解析响应数据失败'))
                    }
                },
                fail: (error) => {
                    reject(error)
                }
            })
        })
    }
} 