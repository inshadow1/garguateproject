<template>
	<view class="container">
		<view class="header">
			<button class="add-btn" @click="showAddModal">添加分类</button>
		</view>
		
		<view class="category-list">
			<view v-if="categories.length === 0" class="empty-tip">
				<text>暂无分类数据</text>
			</view>
			<view v-else v-for="(item, index) in categories" :key="item.id" class="category-item">
				<view class="category-content">
					<view class="category-name">{{item.name}}</view>
					<view class="category-desc">{{item.description || '暂无描述'}}</view>
				</view>
				<view class="category-actions">
					<text class="edit-btn" @click="handleEdit(item)">编辑</text>
					<text class="delete-btn" @click="handleDelete(item.id)">删除</text>
				</view>
			</view>
		</view>
		
		<!-- 添加/编辑弹窗 -->
		<uni-popup ref="popup" type="dialog">
			<uni-popup-dialog 
				:title="isEdit ? '编辑分类' : '添加分类'"
				:before-close="true"
				@close="closeDialog"
				@confirm="confirmDialog">
				<view class="popup-content">
					<input 
						type="text" 
						v-model="formData.name" 
						placeholder="请输入分类名称"
						class="input-field"
					/>
					<input 
						type="text" 
						v-model="formData.description" 
						placeholder="请输入分类描述"
						class="input-field"
					/>
				</view>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			categories: [],
			formData: {
				name: '',
				description: '',
				userId: ''
			},
			isEdit: false,
			currentCategoryId: null
		}
	},
	onShow() {
		this.loadCategories()
	},
	methods: {
		async loadCategories() {
			const userId = uni.getStorageSync('userId')
			try {
				const res = await uni.request({
					url: `http://localhost:8080/api/category/list/${userId}`,
					method: 'GET'
				})
				
				if (res.data && res.data.success) {
					this.categories = res.data.categories || []
				} else {
					uni.showToast({
						title: '获取分类列表失败',
						icon: 'none'
					})
				}
			} catch (e) {
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			}
		},
		
		showAddModal() {
			this.isEdit = false
			this.formData = {
				name: '',
				description: '',
				userId: uni.getStorageSync('userId')
			}
			this.$refs.popup.open()
		},
		
		handleEdit(item) {
			this.isEdit = true
			this.currentCategoryId = item.id
			this.formData = {
				name: item.name,
				description: item.description || '',
				userId: uni.getStorageSync('userId')
			}
			this.$refs.popup.open()
		},
		
		async handleDelete(categoryId) {
			const userId = uni.getStorageSync('userId')
			uni.showModal({
				title: '提示',
				content: '确定要删除该分类吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const res = await uni.request({
								url: `http://localhost:8080/api/category/delete/${categoryId}?userId=${userId}`,
								method: 'DELETE'
							})
							
							if (res.data && res.data.success) {
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								})
								this.loadCategories()
							} else {
								uni.showToast({
									title: res.data.message || '删除失败',
									icon: 'none'
								})
							}
						} catch (e) {
							uni.showToast({
								title: '网络请求失败',
								icon: 'none'
							})
						}
					}
				}
			})
		},
		
		closeDialog() {
			this.$refs.popup.close()
		},
		
		async confirmDialog() {
			if (!this.formData.name) {
				uni.showToast({
					title: '请输入分类名称',
					icon: 'none'
				})
				return
			}
			
			try {
				let res
				if (this.isEdit) {
					res = await uni.request({
						url: `http://localhost:8080/api/category/update/${this.currentCategoryId}`,
						method: 'PUT',
						data: this.formData
					})
				} else {
					res = await uni.request({
						url: 'http://localhost:8080/api/category/create',
						method: 'POST',
						data: this.formData
					})
				}
				
				if (res.data && res.data.success) {
					uni.showToast({
						title: this.isEdit ? '更新成功' : '添加成功',
						icon: 'success'
					})
					this.$refs.popup.close()
					this.loadCategories()
				} else {
					uni.showToast({
						title: res.data.message || (this.isEdit ? '更新失败' : '添加失败'),
						icon: 'none'
					})
				}
			} catch (e) {
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style>
.container {
	padding: 20rpx;
}

.header {
	margin-bottom: 20rpx;
}

.add-btn {
	background-color: #007AFF;
	color: #fff;
}

.category-list {
	background-color: #fff;
	border-radius: 16rpx;
}

.empty-tip {
	text-align: center;
	padding: 40rpx;
	color: #999;
}

.category-item {
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.category-item:last-child {
	border-bottom: none;
}

.category-content {
	flex: 1;
}

.category-name {
	font-size: 32rpx;
	margin-bottom: 10rpx;
}

.category-desc {
	font-size: 24rpx;
	color: #666;
}

.category-actions {
	display: flex;
	align-items: center;
}

.edit-btn, .delete-btn {
	padding: 10rpx 20rpx;
	font-size: 28rpx;
	margin-left: 20rpx;
}

.edit-btn {
	color: #007AFF;
}

.delete-btn {
	color: #ff4d4f;
}

.popup-content {
	padding: 20rpx;
}

.input-field {
	width: 100%;
	height: 80rpx;
	border: 1rpx solid #eee;
	border-radius: 8rpx;
	margin-bottom: 20rpx;
	padding: 0 20rpx;
	box-sizing: border-box;
}
</style> 