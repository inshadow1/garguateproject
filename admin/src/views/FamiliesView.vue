<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api/admin'

// 基础数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)

// 分页参数
const queryParams = ref({
  page: 0,
  size: 10,
})

// 对话框控制
const createFamilyDialog = ref(false)
const membersDialogVisible = ref(false)
const addMemberDialog = ref(false)
const currentFamily = ref(null)
const membersList = ref([])

// 创建家庭组表单
const familyForm = ref({
  name: '',
  description: '',
  creatorId: localStorage.getItem('userId'),
})

// 添加成员表单
const memberForm = ref({
  userId: '',
  role: 'MEMBER',
})

// 用户列表（用于选择要添加的成员）
const usersList = ref([])

// 角色选项
const roleOptions = [
  { label: '访客', value: 'GUEST' },
  { label: '普通成员', value: 'MEMBER' },
  { label: '管理员', value: 'ADMIN' },
]

// 角色标签映射
const roleLabels = {
  OWNER: '创建者',
  ADMIN: '管理员',
  MEMBER: '普通成员',
  GUEST: '访客',
}

// 计算当前页码（前端显示从1开始）
const currentPage = computed({
  get: () => queryParams.value.page + 1,
  set: (val) => {
    queryParams.value.page = val - 1
    getFamilies()
  },
})

// 获取当前用户ID
const currentUserId = computed(() => {
  return Number(localStorage.getItem('userId'))
})

// 判断是否是创建者
const isCreator = computed(() => {
  return (row) => row.creator.id === currentUserId.value
})

// 修改数据部分，添加邀请码相关数据
const inviteCodeDialog = ref(false)
const currentFamilyForInvite = ref(null)
const inviteCode = ref('')
const inviteCodeExpireTime = ref(null)
const generatingCode = ref(false)

// 获取家庭组列表
const getFamilies = async () => {
  loading.value = true
  try {
    const res = await adminApi.getFamilies(queryParams.value)
    tableData.value = res.data.families
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取家庭组列表失败')
  }
  loading.value = false
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  queryParams.value.size = size
  queryParams.value.page = 0
  getFamilies()
}

// 创建家庭组
const handleCreateFamily = async () => {
  try {
    await adminApi.createFamily(familyForm.value)
    ElMessage.success('创建成功')
    createFamilyDialog.value = false
    // 重置表单
    familyForm.value = {
      name: '',
      description: '',
      creatorId: localStorage.getItem('userId'),
    }
    // 刷新列表
    setTimeout(() => {
      getFamilies()
    }, 300)
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '创建失败')
  }
}

// 获取用户列表
const getUsers = async () => {
  try {
    const res = await adminApi.getUsers({ page: 0, size: 100 })
    usersList.value = res.data.users
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

// 查看成员
const handleViewMembers = async (row) => {
  currentFamily.value = row
  try {
    const res = await adminApi.getFamilyMembers(row.id)
    // 保存原始角色值，用于更新失败时还原
    membersList.value = res.data.members.map((member) => ({
      ...member,
      originalRole: member.role,
    }))
    membersDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取成员列表失败')
  }
}

// 打开添加成员对话框
const handleAddMember = () => {
  memberForm.value = {
    userId: '',
    role: 'MEMBER',
  }
  getUsers() // 获取用户列表
  addMemberDialog.value = true
}

// 添加成员
const submitAddMember = async () => {
  try {
    await adminApi.addFamilyMember(currentFamily.value.id, memberForm.value)
    ElMessage.success('添加成员成功')
    addMemberDialog.value = false
    handleViewMembers(currentFamily.value)
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '添加成员失败')
  }
}

// 更新成员角色
const handleUpdateRole = async (member, role) => {
  try {
    await adminApi.updateMemberRole(
      currentFamily.value.id,
      member.id, // 使用成员ID而不是用户ID
      currentUserId.value, // 当前管理员ID
      { role },
    )
    ElMessage.success('角色更新成功')
    await handleViewMembers(currentFamily.value)
  } catch (error) {
    // 还原角色值
    member.role = member.originalRole
    ElMessage.error(error.response?.data?.message || '角色更新失败')
  }
}

// 移除成员
const handleRemoveMember = async (member) => {
  if (member.role === 'OWNER') {
    ElMessage.warning('不能移除创建者')
    return
  }

  try {
    await ElMessageBox.confirm('确定要移除该成员吗？', '提示', {
      type: 'warning',
    })
    await adminApi.removeMember(currentFamily.value.id, member.user.id)
    ElMessage.success('成员移除成功')
    await handleViewMembers(currentFamily.value)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '移除失败')
    }
  }
}

// 删除家庭组
const handleDeleteFamily = async (row) => {
  if (!isCreator.value(row)) {
    ElMessage.warning('只有创建者才能删除家庭组')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除该家庭组吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })

    await adminApi.deleteFamily(row.id, currentUserId.value)
    ElMessage.success('删除成功')
    // 刷新列表
    setTimeout(() => {
      getFamilies()
    }, 300)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

// 打开邀请码对话框
const handleGenerateInviteCode = (row) => {
  currentFamilyForInvite.value = row
  inviteCode.value = ''
  inviteCodeExpireTime.value = null
  inviteCodeDialog.value = true
}

// 生成邀请码
const confirmGenerateInviteCode = async () => {
  if (!currentFamilyForInvite.value) return

  generatingCode.value = true
  try {
    const res = await adminApi.generateFamilyInviteCode(
      currentFamilyForInvite.value.id,
      currentUserId.value,
    )
    inviteCode.value = res.data.inviteCode
    inviteCodeExpireTime.value = res.data.expireTime
    ElMessage.success('邀请码生成成功')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '生成邀请码失败')
  } finally {
    generatingCode.value = false
  }
}

// 复制邀请码到剪贴板
const copyInviteCode = () => {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(inviteCode.value)
      .then(() => {
        ElMessage.success('邀请码已复制到剪贴板')
      })
      .catch(() => {
        ElMessage.error('复制失败，请手动复制')
      })
  } else {
    // 兼容性处理
    const textarea = document.createElement('textarea')
    textarea.value = inviteCode.value
    document.body.appendChild(textarea)
    textarea.select()

    try {
      document.execCommand('copy')
      ElMessage.success('邀请码已复制到剪贴板')
    } catch (err) {
      ElMessage.error('复制失败，请手动复制')
    }

    document.body.removeChild(textarea)
  }
}

onMounted(() => {
  getFamilies()
})
</script>

<template>
  <div class="families-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>家庭组管理</span>
          <el-button type="primary" @click="createFamilyDialog = true">创建家庭组</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="creator.username" label="创建者" width="120" />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewMembers(row)">
              查看成员
            </el-button>
            <el-button type="success" size="small" @click="handleGenerateInviteCode(row)">
              生成邀请码
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteFamily(row)"
              :disabled="!isCreator(row)"
            >
              删除
            </el-button>
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

    <!-- 创建家庭组对话框 -->
    <el-dialog v-model="createFamilyDialog" title="创建家庭组" width="500px">
      <el-form ref="familyFormRef" :model="familyForm" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="familyForm.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="familyForm.description" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createFamilyDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreateFamily">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 成员列表对话框 -->
    <el-dialog v-model="membersDialogVisible" title="成员列表" width="800px">
      <div class="dialog-header">
        <el-button type="primary" @click="handleAddMember">添加成员</el-button>
      </div>

      <el-table :data="membersList">
        <el-table-column label="用户名" width="120">
          <template #default="{ row }">
            {{ row.user.username }}
          </template>
        </el-table-column>
        <el-table-column label="角色" width="150">
          <template #default="{ row }">
            <template v-if="row.role === 'OWNER'">
              <el-tag type="success">{{ roleLabels[row.role] }}</el-tag>
            </template>
            <el-select v-else v-model="row.role" @change="handleUpdateRole(row, $event)">
              <el-option
                v-for="option in roleOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="加入时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.joinTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              v-if="row.role !== 'OWNER'"
              type="danger"
              size="small"
              @click="handleRemoveMember(row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加成员对话框 -->
    <el-dialog v-model="addMemberDialog" title="添加成员" width="500px">
      <el-form :model="memberForm" label-width="80px">
        <el-form-item label="选择用户" required>
          <el-select v-model="memberForm.userId" filterable placeholder="请选择用户">
            <el-option
              v-for="user in usersList"
              :key="user.id"
              :label="user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="memberForm.role">
            <el-option
              v-for="option in roleOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addMemberDialog = false">取消</el-button>
          <el-button type="primary" @click="submitAddMember">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 邀请码对话框 -->
    <el-dialog v-model="inviteCodeDialog" title="家庭组邀请码" width="400px">
      <div v-if="inviteCode" class="invite-code-container">
        <div class="invite-code">{{ inviteCode }}</div>
        <div class="expire-time">有效期至: {{ formatTime(inviteCodeExpireTime) }}</div>
        <div class="copy-hint">请将此邀请码分享给家庭成员</div>
        <el-button type="primary" @click="copyInviteCode">复制邀请码</el-button>
      </div>
      <div v-else class="generate-container">
        <p>点击生成邀请码，将家庭组分享给亲友</p>
        <el-button type="primary" @click="confirmGenerateInviteCode" :loading="generatingCode">
          生成邀请码
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.families-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-header {
  margin-bottom: 20px;
}

.invite-code-container {
  text-align: center;
  padding: 20px;
}

.invite-code {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 15px;
  letter-spacing: 2px;
  background: #f0f9ff;
  padding: 15px;
  border-radius: 4px;
}

.expire-time {
  font-size: 14px;
  color: #909399;
  margin-bottom: 15px;
}

.copy-hint {
  font-size: 14px;
  margin-bottom: 20px;
}

.generate-container {
  text-align: center;
  padding: 20px;
}
</style>
