<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api/admin'

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 分页参数
const queryParams = ref({
  page: 0,
  size: 10,
  keyword: ''
})

// 计算当前页码
const currentPage = computed({
  get: () => queryParams.value.page + 1,
  set: (val) => {
    queryParams.value.page = val - 1
    getUsers()
  }
})

// 对话框控制
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = ref({
  id: null,
  username: '',
  password: ''
})

// 表单规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 获取用户列表
const getUsers = async () => {
  loading.value = true
  try {
    const res = await adminApi.getUsers(queryParams.value)
    tableData.value = res.data.users
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
  loading.value = false
}

// 搜索
const handleSearch = () => {
  queryParams.value.page = 0
  getUsers()
}

// 重置搜索
const resetSearch = () => {
  queryParams.value = {
    page: 0,
    size: 10,
    keyword: ''
  }
  getUsers()
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  queryParams.value.size = size
  queryParams.value.page = 0  // 切换页面大小时重置为第一页
  getUsers()
}

// 打开新增对话框
const handleAdd = () => {
  formData.value = {
    id: null,
    username: '',
    password: ''
  }
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = (row) => {
  formData.value = {
    id: row.id,
    username: row.username,
    password: ''
  }
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  try {
    if (formData.value.id) {
      // 编辑
      await adminApi.updateUser(formData.value.id, formData.value)
      ElMessage.success('更新成功')
    } else {
      // 新增
      await adminApi.createUser(formData.value)
      ElMessage.success('创建成功')
      // 重置为第一页并刷新
      queryParams.value.page = 0
    }
    dialogVisible.value = false
    getUsers()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      type: 'warning'
    })
    await adminApi.deleteUser(row.id)
    ElMessage.success('删除成功')
    getUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  getUsers()
})
</script>

<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="search-box">
            <el-input
              v-model="queryParams.keyword"
              placeholder="请输入用户名搜索"
              style="width: 200px"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
            <el-button @click="resetSearch">重置</el-button>
          </div>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="password" label="密码" width="180">
          <template #default="{ row }">
            <span>******</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="queryParams.size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
    
    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.users-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 