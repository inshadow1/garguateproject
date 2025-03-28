<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isCollapse = ref(false)

const handleLogout = () => {
  localStorage.removeItem('userId')
  router.push('/login')
}

const menuItems = [
  {
    index: '/dashboard',
    icon: 'Odometer',
    title: '仪表盘'
  },
  {
    index: '/users',
    icon: 'User',
    title: '用户管理'
  },
  {
    index: '/families',
    icon: 'House',
    title: '家庭组'
  },
  {
    index: '/settings',
    icon: 'Setting',
    title: '系统设置'
  }
]
</script>

<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <el-menu
        :collapse="isCollapse"
        router
        class="menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :default-active="$route.path"
      >
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <el-button type="text" @click="isCollapse = !isCollapse">
          <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
        </el-button>
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              管理员<el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
}

.menu {
  height: 100%;
  border-right: none;
}

.el-header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dcdfe6;
}

.header-right {
  margin-right: 20px;
}

.el-dropdown-link {
  cursor: pointer;
}
</style> 