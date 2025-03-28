<template>
  <view class="container">
    <view class="item-detail">
      <view class="image-container">
        <image
          class="item-image"
          :src="item.imageUrl || '/static/default-item.png'"
          mode="aspectFit"
          @dblclick="showFullImage"
        ></image>
      </view>

      <view class="info-section">
        <view class="item-header">
          <view class="item-name">{{ item.name }}</view>
          <view class="favorite-btn" @click="toggleFavorite">
            <text class="icon" :class="{ active: isFavorite }">{{
              isFavorite ? '★' : '☆'
            }}</text>
          </view>
        </view>
        <view class="item-category"
          >分类：{{ item.category?.name || '未知分类' }}</view
        >
        <view class="item-quantity">
          <text>数量：</text>
          <view class="quantity-control">
            <button class="quantity-btn" @click="updateQuantity(-1)">-</button>
            <text class="quantity-value" @click="showQuantityPopup">{{
              item.quantity
            }}</text>
            <button class="quantity-btn" @click="updateQuantity(1)">+</button>
          </view>
        </view>
        <view class="item-location">位置：{{ item.location || '暂无' }}</view>
        <view class="item-description">
          <view class="label">描述：</view>
          <view class="content">{{ item.description || '暂无描述' }}</view>
        </view>
        <view class="item-time">
          <view class="time-item"
            >创建时间：{{ formatTime(item.createTime) }}</view
          >
          <view class="time-item"
            >更新时间：{{ formatTime(item.updateTime) }}</view
          >
        </view>
      </view>

      <view class="reminder-section" v-if="canManageItems">
        <view class="section-title">提醒设置</view>

        <view class="reminder-item">
          <text class="reminder-label">库存提醒</text>
          <view class="reminder-content">
            <input
              type="number"
              v-model="stockThreshold"
              placeholder="设置库存阈值"
              class="reminder-input"
            />
            <button
              class="reminder-btn"
              :class="{ active: stockReminder }"
              @click="toggleStockReminder"
            >
              设置
            </button>
          </view>
          <text class="reminder-tip" v-if="stockReminder"
            >当前阈值：{{ stockThreshold }}，低于时提醒</text
          >
        </view>

        <view class="reminder-item">
          <text class="reminder-label">使用提醒</text>
          <view class="reminder-content">
            <input
              type="number"
              v-model="usageInterval"
              placeholder="设置使用间隔(天)"
              class="reminder-input"
            />
            <button
              class="reminder-btn"
              :class="{ active: usageReminder }"
              @click="toggleUsageReminder"
            >
              设置
            </button>
          </view>
          <text class="reminder-tip" v-if="usageReminder">
            使用间隔：{{ usageInterval }}天
            <text v-if="lastUsageTime"
              >，上次使用：{{ formatTime(lastUsageTime) }}</text
            >
          </text>
        </view>

        <button class="usage-btn" @click="recordUsage">记录使用</button>
      </view>

      <view class="action-buttons" v-if="canManageItems">
        <button class="edit-btn" @click="handleEdit">编辑</button>
        <button class="delete-btn" @click="handleDelete">删除</button>
      </view>
    </view>
  </view>

  <!-- 数量修改弹窗 -->
  <uni-popup ref="quantityPopup" type="dialog">
    <uni-popup-dialog
      title="修改数量"
      :before-close="true"
      @close="closeQuantityDialog"
      @confirm="confirmQuantityDialog"
    >
      <view class="popup-content">
        <input
          type="number"
          v-model="tempQuantity"
          class="quantity-popup-input"
          placeholder="请输入数量"
        />
      </view>
    </uni-popup-dialog>
  </uni-popup>

  <!-- 全屏图片弹窗 -->
  <uni-popup ref="imagePopup" type="center">
    <view class="fullscreen-image-container">
      <image
        class="fullscreen-image"
        :src="item.imageUrl || '/static/default-item.png'"
        mode="widthFix"
        @click="closeFullImage"
      ></image>
      <view class="close-btn" @click="closeFullImage">×</view>
    </view>
  </uni-popup>
</template>

<script>
import { reminderApi } from '@/api/reminder'
import { favoriteApi } from '@/api/favorite'
import { itemApi } from '@/api/item'
import { userApi } from '@/api/user'

export default {
  data() {
    return {
      item: {},
      itemId: '',
      stockThreshold: '',
      usageInterval: '',
      stockReminder: false,
      usageReminder: false,
      lastUsageTime: null,
      reminders: [],
      isFavorite: false,
      _originalQuantity: null,
      tempQuantity: '',
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
  },
  onLoad(options) {
    if (options.id) {
      this.itemId = options.id
      this.loadUserRole()
      this.loadItemDetail(options.id)
      this.loadReminders()
      this.checkFavorite()
    }
  },
  onShow() {
    if (this.itemId) {
      this.loadItemDetail(this.itemId)
    }
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
    async loadItemDetail(itemId) {
      const userId = uni.getStorageSync('userId')
      try {
        const res = await uni.request({
          url: `http://localhost:8080/api/item/detail/${itemId}?userId=${userId}`,
          method: 'GET',
        })

        if (res.data && res.data.success) {
          this.item = res.data.item
          this._originalQuantity = this.item.quantity
          this.stockReminder = res.data.stockReminderEnabled
          this.usageReminder = res.data.usageReminderEnabled
          this.stockThreshold = res.data.stockThreshold
          this.usageInterval = res.data.usageInterval
          this.lastUsageTime = res.data.lastUsageTime
        } else {
          uni.showToast({
            title: res.data.message || '获取物品详情失败',
            icon: 'none',
          })
        }
      } catch (e) {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
        })
      }
    },

    formatTime(timeStr) {
      if (!timeStr) return '暂无'
      const date = new Date(timeStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getDate()).padStart(2, '0')} ${String(
        date.getHours()
      ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },

    handleEdit() {
      uni.navigateTo({
        url: `/pages/item/item?id=${this.item.id}`,
      })
    },

    async handleDelete() {
      const userId = uni.getStorageSync('userId')
      uni.showModal({
        title: '提示',
        content: '确定要删除该物品吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const res = await uni.request({
                url: `http://localhost:8080/api/item/delete/${this.item.id}?userId=${userId}`,
                method: 'DELETE',
              })

              if (res.data && res.data.success) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success',
                })
                setTimeout(() => {
                  uni.navigateBack()
                }, 1500)
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

    async loadReminders() {
      try {
        const userId = uni.getStorageSync('userId')
        const res = await reminderApi.getList(userId)
        this.reminders = res.reminders || []

        // 找到当前物品的提醒
        this.reminders.forEach((reminder) => {
          if (reminder.itemId === this.itemId) {
            if (reminder.type === 'STOCK') {
              this.stockReminder = reminder.enabled
              this.stockThreshold = reminder.threshold
            } else if (reminder.type === 'USAGE') {
              this.usageReminder = reminder.enabled
              this.usageInterval = reminder.interval
            }
          }
        })
      } catch (e) {
        uni.showToast({
          title: '获取提醒设置失败',
          icon: 'none',
        })
      }
    },

    async toggleStockReminder() {
      const userId = uni.getStorageSync('userId')

      try {
        if (!this.stockThreshold) {
          uni.showToast({
            title: '请设置库存阈值',
            icon: 'none',
          })
          return
        }

        await reminderApi.createStockReminder({
          itemId: this.itemId,
          threshold: Number(this.stockThreshold),
          userId,
          enabled: !this.stockReminder,
        })

        this.stockReminder = !this.stockReminder
        uni.showToast({
          title: this.stockReminder ? '已开启库存提醒' : '已关闭库存提醒',
          icon: 'success',
        })
      } catch (e) {
        uni.showToast({
          title: e.message || '设置失败',
          icon: 'none',
        })
      }
    },

    async toggleUsageReminder() {
      const userId = uni.getStorageSync('userId')

      try {
        if (!this.usageInterval) {
          uni.showToast({
            title: '请设置使用间隔',
            icon: 'none',
          })
          return
        }

        await reminderApi.createUsageReminder({
          itemId: this.itemId,
          interval: Number(this.usageInterval),
          userId,
          enabled: !this.usageReminder,
        })

        this.usageReminder = !this.usageReminder
        uni.showToast({
          title: this.usageReminder ? '已开启使用提醒' : '已关闭使用提醒',
          icon: 'success',
        })
      } catch (e) {
        uni.showToast({
          title: e.message || '设置失败',
          icon: 'none',
        })
      }
    },

    async recordUsage() {
      try {
        const userId = uni.getStorageSync('userId')
        await reminderApi.updateLastUsage(this.itemId, userId)
        this.lastUsageTime = new Date().toISOString()
        uni.showToast({
          title: '记录成功',
          icon: 'success',
        })
      } catch (e) {
        uni.showToast({
          title: '记录失败',
          icon: 'none',
        })
      }
    },

    async checkFavorite() {
      try {
        const userId = uni.getStorageSync('userId')
        const res = await favoriteApi.check(this.itemId, userId)
        this.isFavorite = res.isFavorite
      } catch (e) {
        console.error('检查收藏状态失败:', e)
      }
    },

    async toggleFavorite() {
      try {
        const userId = uni.getStorageSync('userId')
        if (this.isFavorite) {
          await favoriteApi.remove(this.itemId, userId)
          uni.showToast({
            title: '已取消收藏',
            icon: 'success',
          })
        } else {
          await favoriteApi.add({
            itemId: this.itemId,
            userId,
          })
          uni.showToast({
            title: '收藏成功',
            icon: 'success',
          })
        }
        this.isFavorite = !this.isFavorite
      } catch (e) {
        uni.showToast({
          title: e.message || '操作失败',
          icon: 'none',
        })
      }
    },

    async updateQuantity(change) {
      const newQuantity = this.item.quantity + change
      if (newQuantity < 0) {
        uni.showToast({
          title: '数量不能为负',
          icon: 'none',
        })
        return
      }

      try {
        const userId = uni.getStorageSync('userId')
        await itemApi.updateQuantity(this.item.id, {
          amount: change,
          userId,
        })

        this.item.quantity = newQuantity
        uni.showToast({
          title: change > 0 ? '增加成功' : '减少成功',
          icon: 'success',
        })
      } catch (e) {
        uni.showToast({
          title: e.message || '操作失败',
          icon: 'none',
        })
      }
    },

    showQuantityPopup() {
      this.tempQuantity = String(this.item.quantity)
      this.$refs.quantityPopup.open()
    },

    closeQuantityDialog() {
      this.$refs.quantityPopup.close()
    },

    async confirmQuantityDialog() {
      const newQuantity = parseInt(this.tempQuantity)
      if (isNaN(newQuantity) || newQuantity < 0) {
        uni.showToast({
          title: '请输入有效数量',
          icon: 'none',
        })
        return
      }

      try {
        const userId = uni.getStorageSync('userId')
        const change = newQuantity - this.item.quantity
        await itemApi.updateQuantity(this.item.id, {
          amount: change,
          userId,
        })

        this.item.quantity = newQuantity
        this.$refs.quantityPopup.close()
        uni.showToast({
          title: '更新成功',
          icon: 'success',
        })
      } catch (e) {
        uni.showToast({
          title: e.message || '更新失败',
          icon: 'none',
        })
      }
    },

    // 显示全屏图片
    showFullImage() {
      // 检查图片是否存在
      if (!this.item.imageUrl) {
        uni.showToast({
          title: '暂无图片',
          icon: 'none',
        })
        return
      }

      // 预览图片前先预加载
      uni.showLoading({
        title: '加载中...',
      })

      const img = new Image()
      img.src = this.item.imageUrl

      img.onload = () => {
        uni.hideLoading()
        this.$refs.imagePopup.open()
      }

      img.onerror = () => {
        uni.hideLoading()
        uni.showToast({
          title: '图片加载失败',
          icon: 'none',
        })
      }
    },

    // 关闭全屏图片
    closeFullImage() {
      // 添加渐隐动画效果
      const container = this.$refs.imagePopup.$el.querySelector(
        '.fullscreen-image-container'
      )
      container.style.transition = 'opacity 0.3s ease'
      container.style.opacity = '0'

      // 等待动画完成后关闭弹窗
      setTimeout(() => {
        this.$refs.imagePopup.close()
        // 重置透明度,为下次打开做准备
        container.style.opacity = '1'
      }, 300)

      // 移除可能的全局事件监听器
      document.removeEventListener('keydown', this.handleKeyPress)
    },
  },
}
</script>

<style>
.container {
  padding: 20rpx;
}

.item-detail {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.image-container {
  width: 100%;
  height: 400rpx;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image {
  width: 100%;
  height: 100%;
}

.info-section {
  padding: 30rpx;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.item-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.item-category,
.item-quantity,
.item-location {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.item-description {
  margin-top: 30rpx;
}

.item-description .label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.item-description .content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.action-buttons {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
}

.edit-btn,
.delete-btn {
  flex: 1;
  margin: 0 10rpx;
}

.edit-btn {
  background-color: #007aff;
  color: #fff;
}

.delete-btn {
  background-color: #ff4d4f;
  color: #fff;
}

.item-time {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.time-item {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.reminder-section {
  margin-top: 30rpx;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.reminder-item {
  margin-bottom: 20rpx;
}

.reminder-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.reminder-content {
  display: flex;
  align-items: center;
}

.reminder-input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  margin-right: 20rpx;
}

.reminder-btn {
  width: 160rpx;
  height: 70rpx;
  line-height: 70rpx;
  text-align: center;
  border: 1rpx solid #007aff;
  color: #007aff;
  border-radius: 8rpx;
  font-size: 28rpx;
  background: #fff;
}

.reminder-btn.active {
  background: #007aff;
  color: #fff;
}

.usage-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: #4cd964;
  color: #fff;
  border-radius: 8rpx;
  margin-top: 30rpx;
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

.reminder-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.item-quantity {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
}

.quantity-btn {
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 32rpx;
  color: #333;
  margin: 0;
  padding: 0;
}

.quantity-value {
  margin: 0 30rpx;
  font-size: 32rpx;
  color: #333;
  min-width: 60rpx;
  text-align: center;
  padding: 10rpx 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
}

.quantity-popup-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  text-align: center;
  margin: 20rpx 0;
}

.quantity-btn:active {
  background: #e0e0e0;
}

.fullscreen-image-container {
  position: relative;
  width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fullscreen-image {
  width: 100%;
  height: auto;
  display: block;
}

.close-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  color: #fff;
  font-size: 48rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}
</style>
