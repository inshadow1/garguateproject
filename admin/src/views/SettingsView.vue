<script setup>
import { ref } from 'vue'

const settings = ref({
  siteName: '后台管理系统',
  siteDescription: '这是一个示例后台管理系统',
  enableNotifications: true,
  theme: 'light'
})

const themes = [
  { label: '浅色主题', value: 'light' },
  { label: '深色主题', value: 'dark' }
]

const handleSave = () => {
  ElMessage.success('设置保存成功')
}
</script>

<template>
  <div class="settings-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      
      <el-form :model="settings" label-width="120px">
        <el-form-item label="系统名称">
          <el-input v-model="settings.siteName" />
        </el-form-item>
        
        <el-form-item label="系统描述">
          <el-input
            v-model="settings.siteDescription"
            type="textarea"
            rows="3"
          />
        </el-form-item>
        
        <el-form-item label="主题设置">
          <el-select v-model="settings.theme">
            <el-option
              v-for="theme in themes"
              :key="theme.value"
              :label="theme.label"
              :value="theme.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="系统通知">
          <el-switch v-model="settings.enableNotifications" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 