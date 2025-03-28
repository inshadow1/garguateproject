<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api/admin'

const loading = ref(false)
const statistics = ref([
  { title: '总用户数', value: 0, icon: 'User', key: 'totalUsers' },
  { title: '总家庭组', value: 0, icon: 'House', key: 'totalFamilies' },
  // { title: '待处理邀请', value: 0, icon: 'Message', key: 'pendingInvitations' },
  { title: '今日新增用户', value: 0, icon: 'UserPlus', key: 'newUsersToday' },
])

// 获取统计数据
const getStatistics = async () => {
  loading.value = true
  try {
    const res = await adminApi.getDashboardStats()
    if (res.data.success) {
      // 更新统计数据，注意现在要从 statistics 字段中获取数据
      statistics.value.forEach((item) => {
        item.value = res.data.statistics[item.key] || 0
      })
    } else {
      ElMessage.error('获取统计数据失败')
    }
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  }
  loading.value = false
}

onMounted(() => {
  getStatistics()
})
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in statistics" :key="item.title">
        <el-card shadow="hover" class="stat-card" v-loading="loading">
          <el-row align="middle">
            <el-col :span="16">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-title">{{ item.title }}</div>
            </el-col>
            <el-col :span="8" class="stat-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #303133;
}

.stat-title {
  color: #909399;
  font-size: 14px;
}

.stat-icon {
  font-size: 32px;
  color: #409eff;
  text-align: center;
  opacity: 0.8;
}
</style>
