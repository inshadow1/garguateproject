import axios from 'axios'

const baseURL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL,
  timeout: 5000
})

export const adminApi = {
  // 用户管理接口
  getUsers(params) {
    return api.get('/admin/users', { params })
  },

  createUser(data) {
    return api.post('/admin/users', data)
  },

  updateUser(userId, data) {
    return api.put(`/admin/users/${userId}`, data)
  },

  deleteUser(userId) {
    return api.delete(`/admin/users/${userId}`)
  },

  // 家庭组管理接口
  createFamily(data) {
    return api.post('/admin/families', data)
  },

  getFamilies(params) {
    return api.get('/admin/families', { params })
  },

  getFamilyMembers(familyId) {
    return api.get(`/admin/families/${familyId}/members`)
  },

  addFamilyMember(familyId, data) {
    return api.post(`/admin/families/${familyId}/members`, data)
  },

  createInvitation(familyId, data) {
    return api.post(`/admin/families/${familyId}/invite`, data)
  },

  updateMemberRole(familyId, memberId, adminId, data) {
    return api.put(`/admin/families/${familyId}/members/${memberId}/role`, {
      adminId,
      role: data.role
    })
  },

  removeMember(familyId, userId) {
    return api.delete(`/admin/families/${familyId}/members/${userId}`)
  },

  // 删除家庭组
  deleteFamily(familyId, userId) {
    return api.post(`/admin/families/${familyId}/delete`, null, {
      params: { userId }
    })
  },

  // 获取仪表盘统计数据
  getDashboardStats() {
    return api.get('/statistics/dashboard', {
      headers: {
        'X-User-Id': localStorage.getItem('userId')
      }
    })
  }
} 