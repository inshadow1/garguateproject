<template>
  <view class="container">
    <view class="login-box">
      <view class="title">
        <image
          src="../../static/logo.png"
          style="width: 240rpx; height: 240rpx"
          mode=""
        ></image
      ></view>
      <view class="title">家庭物品收纳管理系统</view>
      <view class="title">{{ isLogin ? '登录' : '注册' }}</view>

      <view class="input-group">
        <input type="text" v-model="username" placeholder="请输入用户名" />
        <input type="password" v-model="password" placeholder="请输入密码" />
      </view>

      <button class="submit-btn" @click="handleSubmit">
        {{ isLogin ? '登录' : '注册' }}
      </button>

      <view class="switch-type" @click="switchLoginType">
        {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
      </view>
    </view>
  </view>
</template>

<script>
import { userApi } from '@/api/user'

export default {
  data() {
    return {
      isLogin: true,
      username: '',
      password: '',
      formData: {
        username: '',
        password: '',
      },
    }
  },
  methods: {
    switchLoginType() {
      this.isLogin = !this.isLogin
    },
    validatePassword(password) {
      if (password.length < 12) {
        uni.showToast({
          title: '密码长度至少12位',
          icon: 'none',
        })
        return false
      }
      return true
    },
    async handleSubmit() {
      if (!this.username || !this.password) {
        uni.showToast({
          title: '请输入用户名和密码',
          icon: 'none',
        })
        return
      }

      // 登录和注册都校验密码长度
      if (!this.validatePassword(this.password)) {
        return
      }

      // 去除用户名和密码前后的空格
      this.formData.username = this.username.trim()
      this.formData.password = this.password.trim()

      try {
        let res
        if (this.isLogin) {
          res = await userApi.login(this.formData)
        } else {
          res = await userApi.register(this.formData)
          uni.showToast({
            title: '注册成功，请登录',
            icon: 'success',
          })
          this.isLogin = true
          return
        }

        uni.setStorageSync('token', res.token || '')
        uni.setStorageSync('userId', res.userId)
        uni.setStorageSync('username', this.username)

        uni.switchTab({
          url: '/pages/home/home',
        })
      } catch (e) {
        console.error(e)
        uni.showToast({
          title: this.isLogin ? '账号或密码错误' : '注册失败，请重试',
          icon: 'none',
          duration: 2000,
        })
      }
    },
  },
}
</script>

<style>
.container {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
}

.login-box {
  width: 90%;
  max-width: 600rpx;
  padding: 40rpx;
  border-radius: 16rpx;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group input {
  width: 100%;
  height: 80rpx;
  margin-bottom: 30rpx;
  padding: 0 30rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background-color: #007aff;
  color: #fff;
  border-radius: 4px;
  margin-bottom: 15px;
}

.switch-type {
  text-align: center;
  color: #007aff;
  font-size: 14px;
}
</style>
