<template>
  <view class="container">
    <view class="search-header">
      <view class="search-bar">
        <view class="alerts-btn" @click="showAlertsPopup">
          <text class="alerts-icon">🔔</text>
          <text class="alerts-badge" v-if="hasAlerts"></text>
        </view>
        <input
          type="text"
          placeholder="搜索物品"
          v-model="searchParams.keyword"
          @confirm="handleSearch"
        />
        <text class="advanced-search-btn" @click="showSearchPopup"
          >高级搜索</text
        >
      </view>

      <view class="category-list">
        <scroll-view scroll-x="true" class="scroll-view">
          <view
            class="category-item"
            :class="{ active: searchParams.categoryId === null }"
            @click="switchCategory(null)"
          >
            全部
          </view>
          <view
            v-for="(item, index) in categories"
            :key="item.id"
            class="category-item"
            :class="{ active: searchParams.categoryId === item.id }"
            @click="switchCategory(item.id)"
          >
            {{ item.name }}
          </view>
        </scroll-view>
        <text class="reset-btn" @click="resetSearch">重置</text>
      </view>
    </view>

    <view class="item-list">
      <view v-if="items.length === 0" class="empty-tip">
        <text>暂无物品数据</text>
      </view>
      <view
        v-else
        v-for="(item, index) in items"
        :key="item.id"
        class="item-card"
      >
        <view class="item-content" @click="navigateToDetail(item.id)">
          <image
            class="item-image"
            :src="item.imageUrl || '/static/default.png'"
            mode="aspectFill"
          ></image>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text
              class="item-owner"
              v-if="familyRoles && familyRoles.length > 0"
              >所有者：{{ item.ownerName }}</text
            >
            <text class="item-category">{{
              item.category?.name || '未分类'
            }}</text>
            <text class="item-quantity">数量：{{ item.quantity }}</text>
            <text class="item-location"
              >位置：{{ item.location || '暂无' }}</text
            >
          </view>
        </view>
        <view class="favorite-btn" @click.stop="toggleFavorite(item)">
          <text class="icon" :class="{ active: item.isFavorite }">{{
            item.isFavorite ? '★' : '☆'
          }}</text>
        </view>
      </view>
    </view>

    <view
      class="add-btn"
      v-if="canManageItems"
      @click="navigateTo('/pages/item/item')"
    >
      <text class="plus">+</text>
    </view>

    <!-- AI助手按钮 -->
    <view class="ai-btn" @click="navigateTo('/pages/ai/chat')">
      <image src="/static/ai-icon.svg" class="ai-icon"></image>
    </view>

    <!-- 高级搜索弹窗 -->
    <uni-popup ref="searchPopup" type="bottom">
      <view class="search-popup">
        <view class="popup-header">
          <text class="title">高级搜索</text>
          <text class="close" @click="hideSearchPopup">×</text>
        </view>

        <view class="search-form">
          <view class="form-item">
            <text class="label">关键词</text>
            <input
              type="text"
              v-model="searchParams.keyword"
              placeholder="搜索名称或描述"
            />
          </view>

          <view class="form-item">
            <text class="label">分类</text>
            <picker
              @change="handleCategoryChange"
              :value="categoryIndex"
              :range="categories"
              range-key="name"
            >
              <view class="picker">
                {{ categories[categoryIndex]?.name || '全部分类' }}
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="label">位置</text>
            <input
              type="text"
              v-model="searchParams.location"
              placeholder="搜索存放位置"
            />
          </view>

          <view class="form-item">
            <text class="label">创建时间</text>
            <view class="date-range">
              <picker
                mode="date"
                :value="searchParams.startDate"
                @change="handleStartDateChange"
              >
                <view class="picker">{{
                  searchParams.startDate || '开始日期'
                }}</view>
              </picker>
              <text class="separator">至</text>
              <picker
                mode="date"
                :value="searchParams.endDate"
                @change="handleEndDateChange"
              >
                <view class="picker">{{
                  searchParams.endDate || '结束日期'
                }}</view>
              </picker>
            </view>
          </view>

          <view class="form-actions">
            <button class="reset-btn" @click="resetSearch">重置</button>
            <button class="confirm-btn" @click="confirmSearch">确定</button>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 提醒弹窗 -->
    <uni-popup ref="alertsPopup" type="bottom">
      <view class="alerts-popup">
        <view class="popup-header">
          <text class="title">提醒</text>
          <text class="close" @click="hideAlertsPopup">×</text>
        </view>

        <view class="alerts-content">
          <!-- 低库存提醒 -->
          <view
            v-if="alerts.lowStockAlerts && alerts.lowStockAlerts.length > 0"
            class="alert-section"
          >
            <view class="section-title">库存提醒</view>
            <view
              class="alert-item"
              v-for="(item, index) in alerts.lowStockAlerts"
              :key="'stock-' + index"
              @click="navigateToItemDetail(item.itemId)"
            >
              <view class="alert-header">
                <text class="item-name">{{ item.itemName }}</text>
                <text class="location">{{ item.location }}</text>
              </view>
              <view class="alert-content">
                <text class="warning"
                  >当前库存：{{ item.currentQuantity }}，低于预警值：{{
                    item.threshold
                  }}</text
                >
              </view>
            </view>
          </view>

          <!-- 使用提醒 -->
          <view
            v-if="alerts.usageAlerts && alerts.usageAlerts.length > 0"
            class="alert-section"
          >
            <view class="section-title">使用提醒</view>
            <view
              class="alert-item"
              v-for="(item, index) in alerts.usageAlerts"
              :key="'usage-' + index"
              @click="navigateToItemDetail(item.itemId)"
            >
              <view class="alert-header">
                <text class="item-name">{{ item.itemName }}</text>
                <text class="location">{{ item.location }}</text>
              </view>
              <view class="alert-content">
                <text class="warning"
                  >上次使用：{{
                    formatLastUsageTime(item.lastUsageTime)
                  }}，建议使用间隔：{{ item.interval }}天</text
                >
              </view>
            </view>
          </view>

          <!-- 无提醒时显示 -->
          <view v-if="!hasAlerts" class="empty-alerts">
            <text>暂无提醒</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { itemApi } from '@/api/item'
import { categoryApi } from '@/api/category'
import { favoriteApi } from '@/api/favorite'
import { reminderApi } from '@/api/reminder'
import { userApi } from '@/api/user'

export default {
  data() {
    return {
      searchParams: {
        keyword: '',
        categoryId: null,
        location: '',
        startDate: '',
        endDate: '',
        page: 0,
        size: 10,
      },
      categoryIndex: -1,
      searchText: '',
      currentCategory: null,
      categories: [],
      items: [],
      hasMore: true,
      alerts: {
        lowStockAlerts: [],
        usageAlerts: [],
      },
      userRole: '',
      familyRoles: [],
    }
  },
  computed: {
    canManageItems() {
      // 如果有家庭角色，则检查家庭角色权限
      if (this.familyRoles && this.familyRoles.length > 0) {
        return this.familyRoles.some(
          (role) => role.role === 'ADMIN' || role.role === 'MEMBER'
        )
      }
      // 如果没有家庭角色，则使用全局角色
      return this.userRole === 'ADMIN' || this.userRole === 'MEMBER'
    },
    hasAlerts() {
      return (
        (this.alerts.lowStockAlerts && this.alerts.lowStockAlerts.length > 0) ||
        (this.alerts.usageAlerts && this.alerts.usageAlerts.length > 0)
      )
    },
  },
  onShow() {
    this.loadUserRole()
    this.loadCategories()
    this.loadItems()
    this.checkAlerts()
  },
  methods: {
    async loadUserRole() {
      try {
        const userId = uni.getStorageSync('userId')
        const res = await userApi.getProfile(userId)
        this.userRole = res.profile.role
        this.familyRoles = res.profile.familyRoles || []
      } catch (e) {
        console.error('获取用户角色失败:', e)
      }
    },
    async loadCategories() {
      try {
        const userId = uni.getStorageSync('userId')
        const res = await categoryApi.getList(userId)
        this.categories = res.categories || []
      } catch (e) {
        console.error(e)
      }
    },

    async loadItems(refresh = true) {
      if (refresh) {
        this.searchParams.page = 0
        this.hasMore = true
      }

      if (!this.hasMore) return

      try {
        const userId = uni.getStorageSync('userId')
        let res

        // 如果用户有家庭组，则获取家庭组内的所有物品
        if (this.familyRoles && this.familyRoles.length > 0) {
          const familyId = this.familyRoles[0].familyId // 使用第一个家庭组
          res = await itemApi.searchFamilyItems(familyId, this.searchParams)
        } else {
          // 如果用户没有家庭组，则只获取用户自己的物品
          res = await itemApi.search(userId, this.searchParams)
        }

        const newItems = res.items || []

        // 检查每个物品的收藏状态
        for (let item of newItems) {
          const favoriteRes = await favoriteApi.check(item.id, userId)
          item.isFavorite = favoriteRes.isFavorite
          // 添加物品所有者信息
          item.ownerName = item.user ? item.user.username : '未知'
        }

        this.items = refresh ? newItems : [...this.items, ...newItems]
        this.hasMore = newItems.length === this.searchParams.size
        this.searchParams.page++
      } catch (e) {
        console.error(e)
      }
    },

    switchCategory(categoryId) {
      this.searchParams.categoryId = categoryId
      this.loadItems()
    },

    editItem(item) {
      this.navigateTo(`/pages/item/item?id=${item.id}`)
    },

    async deleteItem(itemId) {
      const userId = uni.getStorageSync('userId')
      uni.showModal({
        title: '提示',
        content: '确定要删除该物品吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const res = await uni.request({
                url: `http://localhost:8080/api/item/delete/${itemId}?userId=${userId}`,
                method: 'DELETE',
              })

              if (res.data && res.data.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success',
                })
                this.loadItems()
              } else {
                uni.showToast({
                  title: res.data.message || '删除失败',
                  icon: 'none',
                })
              }
            } catch (e) {
              uni.showToast({
                title: '网络请求失败',
                icon: 'none',
              })
            }
          }
        },
      })
    },

    navigateTo(url) {
      uni.navigateTo({
        url,
      })
    },

    navigateToDetail(itemId) {
      uni.navigateTo({
        url: `/pages/item/detail?id=${itemId}`,
      })
    },

    showSearchPopup() {
      this.$refs.searchPopup.open()
    },

    hideSearchPopup() {
      this.$refs.searchPopup.close()
    },

    handleCategoryChange(e) {
      this.categoryIndex = e.detail.value
      this.searchParams.categoryId =
        this.categoryIndex === -1
          ? null
          : this.categories[this.categoryIndex].id
    },

    handleStartDateChange(e) {
      this.searchParams.startDate = e.detail.value
    },

    handleEndDateChange(e) {
      this.searchParams.endDate = e.detail.value
    },

    resetSearch() {
      this.searchParams = {
        keyword: '',
        categoryId: null,
        location: '',
        startDate: '',
        endDate: '',
        page: 0,
        size: 10,
      }
      this.categoryIndex = -1
      this.loadItems()
    },

    confirmSearch() {
      this.hideSearchPopup()
      this.loadItems()
    },

    handleSearch() {
      this.loadItems()
    },

    async toggleFavorite(item) {
      try {
        const userId = uni.getStorageSync('userId')
        if (item.isFavorite) {
          await favoriteApi.remove(item.id, userId)
          uni.showToast({
            title: '已取消收藏',
            icon: 'success',
          })
        } else {
          await favoriteApi.add({
            itemId: item.id,
            userId,
          })
          uni.showToast({
            title: '收藏成功',
            icon: 'success',
          })
        }
        item.isFavorite = !item.isFavorite
      } catch (e) {
        uni.showToast({
          title: e.message || '操作失败',
          icon: 'none',
        })
      }
    },

    async checkAlerts() {
      try {
        const userId = uni.getStorageSync('userId')
        const res = await reminderApi.getAlerts(userId)
        this.alerts = res.data
      } catch (e) {
        console.error('获取提醒失败:', e)
      }
    },

    showAlertsPopup() {
      this.checkAlerts() // 显示弹窗前重新检查提醒
      this.$refs.alertsPopup.open()
    },

    hideAlertsPopup() {
      this.$refs.alertsPopup.close()
    },

    formatLastUsageTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getDate()).padStart(2, '0')}`
    },

    navigateToItemDetail(itemId) {
      this.navigateTo(`/pages/item/detail?id=${itemId}`)
    },
  },

  onReachBottom() {
    this.loadItems(false)
  },
}
</script>

<style>
.container {
  padding: 20rpx;
}

.search-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8f8f8;
  padding-bottom: 20rpx;
}

.search-bar {
  padding: 20rpx 0;
  display: flex;
  align-items: center;
}

.alerts-btn {
  position: relative;
  padding: 10rpx 20rpx;
  margin-right: 20rpx;
}

.alerts-icon {
  font-size: 40rpx;
}

.alerts-badge {
  position: absolute;
  top: 0;
  right: 10rpx;
  width: 16rpx;
  height: 16rpx;
  background-color: #ff4d4f;
  border-radius: 50%;
}

.search-bar input {
  flex: 1;
  margin-right: 20rpx;
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 20rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
}

.advanced-search-btn {
  font-size: 28rpx;
  color: #007aff;
  padding: 10rpx 20rpx;
}

.category-list {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
}

.scroll-view {
  flex: 1;
  white-space: nowrap;
}

.category-item {
  display: inline-block;
  padding: 10rpx 30rpx;
  background: #f0f0f0;
  border-radius: 30rpx;
  margin-right: 20rpx;
}

.category-item.active {
  background: #007aff;
  color: #fff;
}

.reset-btn {
  font-size: 28rpx;
  color: #666;
  background: #f0f0f0;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  margin-left: 20rpx;
}

.empty-tip {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}

.item-list {
  padding: 20rpx 0;
}

.item-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
}

.item-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.item-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.item-owner {
  font-size: 24rpx;
  color: #409eff;
  margin-bottom: 10rpx;
  display: block;
}

.item-category {
  font-size: 24rpx;
  color: #007aff;
  background: rgba(0, 122, 255, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  display: inline-block;
  margin-bottom: 10rpx;
}

.item-quantity,
.item-location {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 6rpx;
}

.favorite-btn {
  padding: 20rpx;
}

.favorite-btn .icon {
  font-size: 48rpx;
  color: #999;
}

.favorite-btn .icon.active {
  color: #ff6b6b;
}

.add-btn {
  position: fixed;
  right: 30rpx;
  bottom: 220rpx;
  width: 100rpx;
  height: 100rpx;
  background: #007aff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.plus {
  color: #fff;
  font-size: 60rpx;
  font-weight: bold;
}

.search-popup {
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  height: 60vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.popup-header .title {
  font-size: 32rpx;
  font-weight: bold;
}

.popup-header .close {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.search-form .form-item {
  margin-bottom: 30rpx;
}

.search-form .label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 28rpx;
  color: #333;
}

.date-range {
  display: flex;
  align-items: center;
}

.date-range .picker {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
}

.date-range .separator {
  padding: 0 20rpx;
  color: #999;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}

.form-actions button {
  width: 45%;
}

.reset-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #007aff;
  color: #fff;
}

/* uni-popup 的遮罩层样式，确保它的 z-index 比 search-header 高 */
:deep(.uni-popup) {
  z-index: 99;
}

:deep(.uni-popup__mask) {
  z-index: 98;
}

.alerts-popup {
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  max-height: 80vh;
  height: 50vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.popup-header .title {
  font-size: 32rpx;
  font-weight: bold;
}

.popup-header .close {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.alerts-content {
  padding: 20rpx;
  max-height: calc(80vh - 100rpx);
  overflow-y: auto;
}

.alert-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

.alert-item {
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.item-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.location {
  font-size: 24rpx;
  color: #666;
  background: #fff;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.alert-content {
  margin-top: 10rpx;
}

.warning {
  font-size: 24rpx;
  color: #ff6b6b;
}

.empty-alerts {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}

.ai-btn {
  position: fixed;
  right: 30rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  border: 2rpx solid #536dfe;
}

.ai-icon {
  width: 60rpx;
  height: 60rpx;
}
</style>
