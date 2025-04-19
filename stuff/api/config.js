// API 配置文件
export const BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080/api'
    : 'https://your-production-domain.com/api'

// 统一处理请求
export const request = async (options) => {
    const token = uni.getStorageSync('token')
    const userId = uni.getStorageSync('userId')
    
    try {
        // 处理请求参数，将null转换为空字符串
        if (options.data) {
            Object.keys(options.data).forEach(key => {
                if (options.data[key] === null) {
                    options.data[key] = ''
                }
            })
        }

        const res = await uni.request({
            url: BASE_URL + options.url,
            method: options.method || 'GET',
            data: options.data,
            header: {
                'Authorization': token,
                'Content-Type': 'application/json',
                ...options.header
            }
        })
        
        // 检查HTTP状态码和服务器响应
        if (res.statusCode !== 200) {
            throw new Error(`HTTP错误: ${res.statusCode}`)
        }
        
        // 检查业务成功标志
        if (res.data && res.data.success === false) {
            throw new Error(res.data.message || '操作失败')
        }
        
        return res.data
    } catch (e) {
        uni.showToast({
            title: e.message || '网络请求失败',
            icon: 'none'
        })
        throw e
    }
} 