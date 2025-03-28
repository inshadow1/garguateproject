<template>
  <view class="container">
    <!-- 用于图片转base64的隐藏canvas -->
    <canvas
      canvas-id="imageCanvas"
      style="
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 3000px;
        height: 3000px;
      "
    ></canvas>
    <view class="form-container">
      <view class="form-item">
        <text class="label">物品名称</text>
        <input
          type="text"
          v-model="formData.name"
          placeholder="请输入物品名称"
        />
      </view>

      <view class="form-item">
        <text class="label">所属分类</text>
        <picker
          @change="handleCategoryChange"
          :value="categoryIndex"
          :range="categories"
          range-key="name"
        >
          <view class="picker">
            {{ categories[categoryIndex]?.name || '请选择分类' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">数量</text>
        <input
          type="number"
          v-model="formData.quantity"
          placeholder="请输入数量"
        />
      </view>

      <view class="form-item">
        <text class="label">位置</text>
        <view class="location-input">
          <input
            type="text"
            v-model="formData.location"
            placeholder="请输入或选择存放位置"
          />
          <text class="map-btn" @click="chooseLocation">选择位置</text>
        </view>
      </view>

      <view class="form-item">
        <text class="label">描述</text>
        <textarea v-model="formData.description" placeholder="请输入物品描述" />
      </view>

      <view class="form-item">
        <text class="label">提醒设置</text>
        <view class="reminder-item">
          <text class="reminder-label">库存提醒</text>
          <input
            type="number"
            v-model="formData.stockThreshold"
            placeholder="设置库存提醒阈值，为空则不提醒"
            class="reminder-input"
          />
        </view>
        <view class="reminder-item">
          <text class="reminder-label">使用提醒</text>
          <input
            type="number"
            v-model="formData.usageInterval"
            placeholder="设置使用提醒间隔（天数），为空则不提醒"
            class="reminder-input"
          />
        </view>
      </view>

      <view class="form-item">
        <text class="label">图片</text>
        <view
          class="image-upload"
          @click="chooseImage"
          v-if="!formData.imageUrl"
        >
          <text class="upload-icon">+</text>
          <text>上传图片</text>
        </view>
        <view class="image-preview" v-else>
          <image :src="formData.imageUrl" mode="aspectFill"></image>
          <text class="delete-icon" @click.stop="deleteImage">×</text>
        </view>
      </view>

      <button class="submit-btn" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '添加物品' }}
      </button>
    </view>
  </view>
</template>

<script>
import { itemApi } from '@/api/item'
import { categoryApi } from '@/api/category'

export default {
  data() {
    return {
      isEdit: false,
      itemId: null,
      categoryIndex: -1,
      categories: [],
      formData: {
        name: '',
        categoryId: '',
        quantity: '',
        location: '',
        description: '',
        imageUrl: '',
        userId: '',
        stockThreshold: '',
        usageInterval: '',
      },
    }
  },
  onLoad(options) {
    this.formData.userId = uni.getStorageSync('userId')
    if (options.id) {
      this.isEdit = true
      this.itemId = options.id
    }
    this.loadCategories()
  },
  methods: {
    async loadCategories() {
      try {
        const userId = uni.getStorageSync('userId')
        const res = await categoryApi.getList(userId)
        this.categories = res.categories || []

        if (this.isEdit) {
          this.loadItemDetail()
        }
      } catch (e) {
        uni.showToast({
          title: '获取分类列表失败',
          icon: 'none',
        })
      }
    },

    async loadItemDetail() {
      try {
        const userId = uni.getStorageSync('userId')
        const res = await itemApi.getDetail(this.itemId, userId)
        const item = res.item
        this.formData = {
          name: item.name,
          categoryId: item.category.id,
          quantity: item.quantity,
          location: item.location || '',
          description: item.description || '',
          imageUrl: item.imageUrl || '',
          userId: this.formData.userId,
          stockThreshold: item.stockThreshold || '',
          usageInterval: item.usageInterval || '',
        }

        const categoryIndex = this.categories.findIndex(
          (c) => c.id === item.category.id
        )
        if (categoryIndex !== -1) {
          this.categoryIndex = categoryIndex
        }
      } catch (e) {
        uni.showToast({
          title: '获取物品详情失败',
          icon: 'none',
        })
      }
    },

    handleCategoryChange(e) {
      this.categoryIndex = Number(e.detail.value)
      this.formData.categoryId = this.categories[this.categoryIndex].id
      console.log('分类变更:', {
        categoryIndex: this.categoryIndex,
        categoryId: this.formData.categoryId,
        category: this.categories[this.categoryIndex],
      })
    },

    async chooseImage() {
      try {
        const res = await uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
        })

        // 将图片转换为base64格式
        const tempFilePath = res.tempFilePaths[0]
        try {
          const base64 = await this.getBase64(tempFilePath)
          this.formData.imageUrl = base64
          console.log('图片已转换为base64格式')
        } catch (error) {
          console.error('转换base64失败:', error)
          // 转换失败时不再使用临时路径，而是显示错误信息
          uni.showToast({
            title: '图片转换失败，请重试',
            icon: 'none',
          })
          return
        }
        console.log('选择的图片路径:', tempFilePath)
      } catch (e) {
        console.log('选择图片失败:', e)
      }
    },

    // 将图片转换为base64格式 - 使用canvas方式
    getBase64(filePath) {
      return new Promise((resolve, reject) => {
        const ctx = uni.createCanvasContext('imageCanvas', this)

        uni.getImageInfo({
          src: filePath,
          success: (info) => {
            const maxSize = 3000
            const scale = Math.min(
              maxSize / info.width,
              maxSize / info.height,
              1
            )
            const canvasWidth = Math.floor(info.width * scale)
            const canvasHeight = Math.floor(info.height * scale)

            ctx.drawImage(filePath, 0, 0, canvasWidth, canvasHeight)
            ctx.draw(false, () => {
              uni.canvasToTempFilePath(
                {
                  canvasId: 'imageCanvas',
                  x: 0,
                  y: 0,
                  width: canvasWidth,
                  height: canvasHeight,
                  destWidth: canvasWidth,
                  destHeight: canvasHeight,
                  fileType: 'jpg',
                  quality: 0.8,
                  success: (res) => {
                    resolve(res.tempFilePath)
                  },
                  fail: (error) => {
                    console.error('导出canvas失败:', error)
                    reject(error)
                  },
                },
                this
              )
            })
          },
          fail: (error) => {
            console.error('获取图片信息失败:', error)
            reject(error)
          },
        })
      })
    },

    deleteImage() {
      this.formData.imageUrl = ''
    },

    async handleSubmit() {
      console.log('提交表单数据:', this.formData)
      if (!this.validateForm()) return

      try {
        let res
        // 确保数值类型字段为数字类型
        const submitData = {
          ...this.formData,
          categoryId: Number(this.formData.categoryId),
          quantity: Number(this.formData.quantity),
        }

        // 处理可选的提醒设置
        if (this.formData.stockThreshold) {
          submitData.stockThreshold = Number(this.formData.stockThreshold)
        }
        if (this.formData.usageInterval) {
          submitData.usageInterval = Number(this.formData.usageInterval)
        }

        if (this.isEdit) {
          res = await itemApi.update(this.itemId, submitData)
        } else {
          res = await itemApi.create(submitData)
        }

        uni.showToast({
          title: this.isEdit ? '更新成功' : '添加成功',
          icon: 'success',
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (e) {
        console.error('提交失败:', e)
        uni.showToast({
          title: e.message || '操作失败',
          icon: 'none',
        })
      }
    },

    validateForm() {
      console.log('验证表单数据:', {
        name: this.formData.name,
        categoryId: this.formData.categoryId,
        quantity: this.formData.quantity,
      })

      if (!this.formData.name) {
        uni.showToast({
          title: '请输入物品名称',
          icon: 'none',
        })
        return false
      }
      if (!this.formData.categoryId && this.formData.categoryId !== 0) {
        uni.showToast({
          title: '请选择分类',
          icon: 'none',
        })
        return false
      }
      if (!this.formData.quantity) {
        uni.showToast({
          title: '请输入数量',
          icon: 'none',
        })
        return false
      }
      return true
    },

    chooseLocation() {
      uni.navigateTo({
        url: '/pages/map/location',
      })
    },

    updateLocation(locationInfo) {
      this.formData.location = locationInfo.name
      // 可以保存完整的地址信息供后续使用
      this.formData.address = locationInfo.address
      this.formData.coordinates = locationInfo.location
    },
  },
}
</script>

<style>
.container {
  padding: 20rpx;
}

.form-container {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 28rpx;
  color: #333;
}

input,
.picker {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}

textarea {
  width: 100%;
  height: 160rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 20rpx;
  box-sizing: border-box;
}

.image-upload {
  width: 200rpx;
  height: 200rpx;
  border: 1rpx dashed #ddd;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}

.upload-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.image-preview {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.image-preview image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.delete-icon {
  position: absolute;
  right: -20rpx;
  top: -20rpx;
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
}

.submit-btn {
  background-color: #007aff;
  color: #fff;
  margin-top: 40rpx;
}

.location-input {
  display: flex;
  align-items: center;
}

.location-input input {
  flex: 1;
  margin-right: 20rpx;
}

.map-btn {
  font-size: 28rpx;
  color: #007aff;
  padding: 10rpx 20rpx;
  border: 1rpx solid #007aff;
  border-radius: 8rpx;
}

.reminder-item {
  margin-top: 20rpx;
}

.reminder-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.reminder-input {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  margin-bottom: 20rpx;
}
</style>
