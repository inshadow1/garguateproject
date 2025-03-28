<template>
	<view class="container">
		<view class="user-info">
			<view class="avatar" @click="chooseAvatar">
				<image :src="profile.avatar || '/static/avatar.png'" mode="aspectFill"></image>
			</view>
			<view class="info">
				<text class="username">{{username}}</text>
				<text class="user-email">{{profile.email || '未设置邮箱'}}</text>
				<view class="role-info">
					<text class="role-tag">{{profile.roleDesc}}</text>
					<text class="family-role" v-for="(role, index) in profile.familyRoles" :key="index">
						{{role.familyName}}: {{role.roleDesc}}
					</text>
				</view>
			</view>
		</view>
		
		<view class="menu-list">
			<view class="menu-item" v-if="canManageItems" @click="navigateTo('/pages/category/category')">
				<text>分类管理</text>
				<text class="arrow">></text>
			</view>
			<view class="menu-item" @click="showFavorites">
				<text>我的收藏</text>
				<text class="arrow">></text>
			</view>
			<view class="menu-item" v-if="canManageItems" @click="showReminders">
				<text>我的提醒</text>
				<text class="arrow">></text>
			</view>
			<view class="menu-item" @click="showProfilePopup">
				<text>我的信息</text>
				<text class="arrow">></text>
			</view>
			<view class="menu-item" @click="showPasswordPopup">
				<text>修改密码</text>
				<text class="arrow">></text>
			</view>
			<!-- <view class="menu-item">
				<text>关于我们</text>
				<text class="arrow">></text>
			</view> -->
		</view>
		
		<button class="logout-btn" @click="handleLogout">退出登录</button>
		
		<!-- 收藏列表弹窗 -->
		<uni-popup ref="favoritesPopup" type="bottom">
			<view class="favorites-popup">
				<view class="popup-header">
					<text class="title">我的收藏</text>
					<text class="close" @click="hideFavorites">×</text>
				</view>
				
				<scroll-view class="favorites-list" scroll-y>
					<view v-if="favorites.length === 0" class="empty-tip">
						<text>暂无收藏物品</text>
					</view>
					<view v-else v-for="(favorite, index) in favorites" :key="favorite.id" class="favorite-item">
						<view class="item-content" @click="navigateToDetail(favorite.item.id)">
							<image class="item-image" :src="favorite.item.imageUrl || '/static/default-item.png'" mode="aspectFill"></image>
							<view class="item-info">
								<text class="item-name">{{favorite.item.name}}</text>
								<text class="item-category">{{favorite.item.category?.name || '未分类'}}</text>
								<text class="item-quantity">数量：{{favorite.item.quantity}}</text>
								<text class="item-location">位置：{{favorite.item.location || '暂无'}}</text>
							</view>
						</view>
						<view class="favorite-btn" @click.stop="toggleFavorite(favorite)">
							<text class="icon active">★</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</uni-popup>
		
		<!-- 提醒列表弹窗 -->
		<uni-popup ref="remindersPopup" type="bottom">
			<view class="reminders-popup">
				<view class="popup-header">
					<text class="title">我的提醒</text>
					<text class="close" @click="hideReminders">×</text>
				</view>
				
				<scroll-view class="reminders-list" scroll-y>
					<view v-if="!hasReminders" class="empty-tip">
						<text>暂无提醒设置</text>
					</view>
					
					<!-- 库存提醒 -->
					<view v-if="stockReminders.length > 0" class="reminder-section">
						<view class="section-title">库存提醒</view>
						<view 
							class="reminder-item" 
							v-for="(reminder, index) in stockReminders" 
							:key="'stock-' + index"
							@click="navigateToDetail(reminder.itemId)"
						>
							<view class="reminder-header">
								<text class="item-name">{{reminder.itemName}}</text>
								<text class="location">{{reminder.location}}</text>
							</view>
							<view class="reminder-content">
								<text class="threshold">库存阈值：{{reminder.threshold}}</text>
								<text class="current">当前库存：{{reminder.currentQuantity}}</text>
							</view>
						</view>
					</view>
					
					<!-- 使用提醒 -->
					<view v-if="usageReminders.length > 0" class="reminder-section">
						<view class="section-title">使用提醒</view>
						<view 
							class="reminder-item" 
							v-for="(reminder, index) in usageReminders" 
							:key="'usage-' + index"
							@click="navigateToDetail(reminder.itemId)"
						>
							<view class="reminder-header">
								<text class="item-name">{{reminder.itemName}}</text>
								<text class="location">{{reminder.location}}</text>
							</view>
							<view class="reminder-content">
								<text class="interval">使用间隔：{{reminder.interval}}天</text>
								<text class="last-usage">上次使用：{{formatTime(reminder.lastUsageTime)}}</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</uni-popup>
		
		<!-- 个人信息修改弹窗 -->
		<uni-popup ref="profilePopup" type="bottom">
			<view class="profile-popup">
				<view class="popup-header">
					<text class="title">个人信息</text>
					<text class="close" @click="hideProfilePopup">×</text>
				</view>
				
				<view class="profile-form">
					<view class="form-item">
						<text class="label">用户名</text>
						<input type="text" v-model="profile.username" placeholder="请输入用户名" />
					</view>
					
					<view class="form-item">
						<text class="label">昵称</text>
						<input type="text" v-model="profile.nickname" placeholder="请输入昵称" />
					</view>
					
					<view class="form-item">
						<text class="label">邮箱</text>
						<input type="text" v-model="profile.email" placeholder="请输入邮箱" />
					</view>
					
					<button class="submit-btn" @click="handleUpdateProfile">保存修改</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 修改密码弹窗 -->
		<uni-popup ref="passwordPopup" type="bottom">
			<view class="password-popup">
				<view class="popup-header">
					<text class="title">修改密码</text>
					<text class="close" @click="hidePasswordPopup">×</text>
				</view>
				
				<view class="password-form">
					<view class="form-item">
						<text class="label">旧密码</text>
						<input type="password" v-model="passwordForm.oldPassword" placeholder="请输入旧密码" />
					</view>
					
					<view class="form-item">
						<text class="label">新密码</text>
						<input type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码" />
					</view>
					
					<view class="form-item">
						<text class="label">确认密码</text>
						<input type="password" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
					</view>
					
					<button class="submit-btn" @click="handleUpdatePassword">确认修改</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { favoriteApi } from '@/api/favorite'
import { userApi } from '@/api/user'
import { reminderApi } from '@/api/reminder'

export default {
	data() {
		return {
			username: '',
			userId: '',
			favorites: [],
			currentPage: 0,
			pageSize: 10,
			hasMore: true,
			profile: {
				username: '',
				email: '',
				nickname: '',
				avatar: '',
				role: '',
				roleDesc: '',
				familyRoles: []
			},
			// 修改密码表单
			passwordForm: {
				oldPassword: '',
				newPassword: '',
				confirmPassword: ''
			},
			stockReminders: [],
			usageReminders: [],
			hasReminders: false
		}
	},
	computed: {
		canManageItems() {
			// 如果有家庭角色，则检查家庭角色权限
			if (this.profile.familyRoles && this.profile.familyRoles.length > 0) {
				return this.profile.familyRoles.some(role => 
					role.role === 'ADMIN' || role.role === 'MEMBER'
				)
			}
			// 如果没有家庭角色，则使用全局角色
			return this.profile.role === 'ADMIN' || this.profile.role === 'MEMBER'
		},
		isAdmin() {
			// 如果有家庭角色，则检查是否有管理员权限
			if (this.profile.familyRoles && this.profile.familyRoles.length > 0) {
				return this.profile.familyRoles.some(role => role.role === 'ADMIN')
			}
			// 如果没有家庭角色，则使用全局角色
			return this.profile.role === 'ADMIN'
		}
	},
	onShow() {
		this.userId = uni.getStorageSync('userId') || ''
		this.loadUserProfile()
	},
	methods: {
		async loadUserProfile() {
			try {
				const res = await userApi.getProfile(this.userId)
				this.profile = res.profile
				this.username = this.profile.nickname || this.profile.username
			} catch (e) {
				console.error('获取用户信息失败:', e)
			}
		},
		
		showProfilePopup() {
			this.$refs.profilePopup.open()
		},
		
		hideProfilePopup() {
			this.$refs.profilePopup.close()
		},
		
		showPasswordPopup() {
			this.$refs.passwordPopup.open()
		},
		
		hidePasswordPopup() {
			this.$refs.passwordPopup.close()
			// 清空密码表单
			this.passwordForm = {
				oldPassword: '',
				newPassword: '',
				confirmPassword: ''
			}
		},
		
		async handleUpdateProfile() {
			try {
				await userApi.updateProfile(this.userId, this.profile)
				uni.showToast({
					title: '更新成功',
					icon: 'success'
				})
				this.hideProfilePopup()
				this.loadUserProfile()
			} catch (e) {
				uni.showToast({
					title: e.message || '更新失败',
					icon: 'none'
				})
			}
		},
		
		async handleUpdatePassword() {
			if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				})
				return
			}
			
			if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
				uni.showToast({
					title: '两次输入的新密码不一致',
					icon: 'none'
				})
				return
			}
			
			try {
				await userApi.updatePassword(this.userId, {
					oldPassword: this.passwordForm.oldPassword,
					newPassword: this.passwordForm.newPassword
				})
				
				uni.showToast({
					title: '密码修改成功',
					icon: 'success'
				})
				this.hidePasswordPopup()
				
				// 密码修改成功后退出登录
				setTimeout(() => {
					this.handleLogout()
				}, 1500)
			} catch (e) {
				uni.showToast({
					title: e.message || '修改失败',
					icon: 'none'
				})
			}
		},
		handleLogout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						uni.clearStorageSync()
						uni.reLaunch({
							url: '/pages/index/index'
						})
					}
				}
			})
		},
		navigateTo(url) {
			uni.navigateTo({
				url
			})
		},
		navigateToDetail(itemId) {
			uni.navigateTo({
				url: `/pages/item/detail?id=${itemId}`
			})
		},
		showFavorites() {
			this.currentPage = 0
			this.hasMore = true
			this.favorites = []
			this.loadFavorites()
			this.$refs.favoritesPopup.open()
		},
		hideFavorites() {
			this.$refs.favoritesPopup.close()
		},
		async loadFavorites() {
			if (!this.hasMore) return
			
			try {
				const userId = uni.getStorageSync('userId')
				const res = await favoriteApi.getList(userId, {
					page: this.currentPage,
					size: this.pageSize
				})
				
				const newItems = res.favorites || []
				this.favorites = [...this.favorites, ...newItems]
				this.hasMore = newItems.length === this.pageSize
				this.currentPage++
			} catch (e) {
				uni.showToast({
					title: '获取收藏列表失败',
					icon: 'none'
				})
			}
		},
		async toggleFavorite(favorite) {
			try {
				const userId = uni.getStorageSync('userId')
				await favoriteApi.remove(favorite.item.id, userId)
				uni.showToast({
					title: '已取消收藏',
					icon: 'success'
				})
				// 从列表中移除
				this.favorites = this.favorites.filter(f => f.id !== favorite.id)
			} catch (e) {
				uni.showToast({
					title: e.message || '操作失败',
					icon: 'none'
				})
			}
		},
		showReminders() {
			this.loadReminders()
			this.$refs.remindersPopup.open()
		},
		hideReminders() {
			this.$refs.remindersPopup.close()
		},
		async loadReminders() {
			try {
				const userId = uni.getStorageSync('userId')
				const res = await reminderApi.getAlerts(userId)
				this.stockReminders = res.data.lowStockAlerts || []
				this.usageReminders = res.data.usageAlerts || []
				this.hasReminders = this.stockReminders.length > 0 || this.usageReminders.length > 0
			} catch (e) {
				uni.showToast({
					title: '获取提醒列表失败',
					icon: 'none'
				})
			}
		},
		formatTime(timestamp) {
			const date = new Date(timestamp)
			return date.toLocaleString()
		},
		async chooseAvatar() {
			try {
				const res = await uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera']
				})
				
				if (res.tempFilePaths && res.tempFilePaths.length > 0) {
					const filePath = res.tempFilePaths[0]
					await this.uploadAvatar(filePath)
				}
			} catch (e) {
				console.error('选择图片失败:', e)
			}
		},
		async uploadAvatar(filePath) {
			try {
				uni.showLoading({
					title: '上传中...'
				})
				
				const result = await userApi.uploadAvatar(this.userId, filePath)
				
				if (result.success) {
					// 更新本地头像
					this.profile.avatar = result.avatar
					// 重新加载用户信息
					await this.loadUserProfile()
					
					uni.showToast({
						title: '上传成功',
						icon: 'success'
					})
				} else {
					throw new Error(result.message || '上传失败')
				}
			} catch (e) {
				uni.showToast({
					title: e.message || '上传失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		}
	}
}
</script>

<style>
.container {
	padding: 20rpx;
}

.user-info {
	padding: 40rpx;
	background-color: #007AFF;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	overflow: hidden;
	margin-right: 30rpx;
	border: 2rpx solid rgba(255,255,255,0.3);
}

.avatar image {
	width: 100%;
	height: 100%;
}

.avatar:active {
	opacity: 0.8;
}

.info {
	color: #fff;
}

.username {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	display: block;
}

.user-email {
	font-size: 24rpx;
	opacity: 0.8;
}

.role-info {
	margin-top: 10rpx;
}

.role-tag {
	font-size: 24rpx;
	color: #fff;
	background: rgba(255,255,255,0.2);
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	margin-right: 10rpx;
}

.family-role {
	font-size: 24rpx;
	color: #fff;
	opacity: 0.8;
	display: block;
	margin-top: 6rpx;
}

.menu-list {
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 30rpx;
}

.menu-item {
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.menu-item:last-child {
	border-bottom: none;
}

.arrow {
	color: #999;
}

.logout-btn {
	width: 100%;
	background-color: #ff4d4f;
	color: #fff;
	margin-top: 40rpx;
}

.favorites-popup {
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	padding: 30rpx;
	height: 80vh;
	display: flex;
	flex-direction: column;
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

.favorites-list {
	flex: 1;
	overflow-y: auto;
}

.empty-tip {
	text-align: center;
	padding: 100rpx 0;
	color: #999;
}

.favorite-item {
	background: #fff;
	border-bottom: 1rpx solid #eee;
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

.item-category {
	font-size: 24rpx;
	color: #007AFF;
	background: rgba(0,122,255,0.1);
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	display: inline-block;
	margin-bottom: 10rpx;
}

.item-quantity, .item-location {
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

.profile-popup, .password-popup {
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	padding: 30rpx;
	min-height: 60vh;
	display: flex;
	flex-direction: column;
}

.profile-form, .password-form {
	padding: 20rpx;
	flex: 1;
	display: flex;
	flex-direction: column;
}

.form-item {
	margin-bottom: 30rpx;
}

.form-item .label {
	display: block;
	font-size: 28rpx;
	color: #333;
	margin-bottom: 10rpx;
}

.form-item input {
	width: 100%;
	height: 80rpx;
	border: 1rpx solid #eee;
	border-radius: 8rpx;
	padding: 0 20rpx;
	box-sizing: border-box;
}

.submit-btn {
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	background: #007AFF;
	color: #fff;
	border-radius: 8rpx;
	margin-bottom: 20rpx;
}

.reminders-popup {
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	padding: 30rpx;
	height: 80vh;
	display: flex;
	flex-direction: column;
}

.reminders-list {
	flex: 1;
	overflow-y: auto;
}

.reminder-section {
	margin-bottom: 30rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	padding: 0 20rpx;
}

.reminder-item {
	background: #f8f8f8;
	border-radius: 12rpx;
	padding: 20rpx;
	margin: 0 20rpx 20rpx;
}

.reminder-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.reminder-header .item-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.reminder-header .location {
	font-size: 24rpx;
	color: #666;
	background: #fff;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
}

.reminder-content {
	font-size: 24rpx;
	color: #666;
}

.reminder-content .threshold,
.reminder-content .current,
.reminder-content .interval,
.reminder-content .last-usage {
	display: block;
	margin-top: 6rpx;
}

.reminder-content .current,
.reminder-content .last-usage {
	color: #ff6b6b;
}
</style> 