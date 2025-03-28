import axios from 'axios'

const baseURL = 'http://localhost:8080/api/user'

const api = axios.create({
  baseURL,
  timeout: 5000
})

export const userApi = {
  // 用户注册
  register(data) {
    return api.post('/register', data)
  },
  
  // 用户登录
  login(data) {
    return api.post('/login', data)
  }
} 