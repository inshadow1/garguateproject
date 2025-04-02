/**
 * AI API 服务
 */

// 基础URL
const BASE_URL = 'http://localhost:8080/api/ai'

export const aiApi = {
  /**
   * 发送聊天消息到AI助手
   * @param {String} content - 用户发送的消息内容
   * @returns {Promise} - 返回AI的响应
   */
  chat(content) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: `${BASE_URL}/chat`,
        method: 'POST',
        data: { content },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          resolve(res.data)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }
} 