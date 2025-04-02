<template>
  <view class="container">
    <view class="chat-container">
      <scroll-view
        scroll-y="true"
        class="chat-messages"
        :scroll-top="scrollTop"
      >
        <view
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="message.role"
        >
          <view class="message-content">
            <view class="avatar" v-if="message.role === 'assistant'">
              <image src="/static/ai-icon.svg" class="avatar-img"></image>
            </view>
            <view class="avatar user-avatar" v-else>我</view>
            <view class="text">{{ message.content }}</view>
          </view>
        </view>
      </scroll-view>

      <view class="input-container">
        <input
          type="text"
          v-model="userInput"
          placeholder="输入您的问题"
          @confirm="sendMessage"
        />
        <button class="send-btn" @click="sendMessage">发送</button>
      </view>
    </view>

    <view class="loading-mask" v-if="loading">
      <view class="loading-spinner"></view>
      <text>AI 思考中...</text>
    </view>
  </view>
</template>

<script>
import { aiApi } from '@/api/ai'

export default {
  data() {
    return {
      userInput: '',
      messages: [
        {
          role: 'assistant',
          content: '你好！我是AI助手，有什么可以帮助你的？',
        },
      ],
      loading: false,
      scrollTop: 0,
    }
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim()) return

      // 添加用户消息
      this.messages.push({
        role: 'user',
        content: this.userInput,
      })

      const userQuestion = this.userInput
      this.userInput = ''

      // 设置加载状态
      this.loading = true

      try {
        const response = await aiApi.chat(userQuestion)

        // 添加AI响应
        if (response && response.success) {
          this.messages.push({
            role: 'assistant',
            content: response.content,
          })
        } else {
          this.messages.push({
            role: 'assistant',
            content: '抱歉，我遇到了问题。请稍后再试。',
          })
        }
      } catch (error) {
        console.error('请求AI接口失败:', error)
        this.messages.push({
          role: 'assistant',
          content: '网络请求失败，请检查网络连接。',
        })
      } finally {
        this.loading = false
        this.scrollToBottom()
      }
    },
    scrollToBottom() {
      // 在下一个渲染循环中滚动到底部
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this)
        query
          .select('.chat-messages')
          .boundingClientRect((data) => {
            this.scrollTop = data.height * 2 // 确保滚动到底部
          })
          .exec()
      })
    },
  },
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.chat-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.message {
  margin-bottom: 30rpx;
  max-width: 80%;
  clear: both;
}

.user {
  float: right;
}

.assistant {
  float: left;
}

.message-content {
  display: flex;
  align-items: flex-start;
}

.user .message-content {
  flex-direction: row-reverse;
}

.avatar {
  width: 70rpx;
  height: 70rpx;
  min-width: 70rpx;
  min-height: 70rpx;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2rpx solid #536dfe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  margin: 0 20rpx;
  overflow: hidden;
  padding: 10rpx;
  box-sizing: border-box;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.user-avatar {
  background-color: #67c23a;
  color: white;
  border: none;
}

.text {
  padding: 20rpx;
  border-radius: 12rpx;
  background-color: white;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  font-size: 28rpx;
  word-break: break-word;
  max-width: 80%;
  flex-shrink: 1;
}

.user .text {
  background-color: #536dfe;
  color: white;
}

.input-container {
  display: flex;
  padding: 20rpx;
  background-color: white;
  border-top: 1rpx solid #ebeef5;
}

.input-container input {
  flex: 1;
  height: 80rpx;
  padding: 0 20rpx;
  background-color: #f0f2f5;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.send-btn {
  margin-left: 20rpx;
  height: 80rpx;
  line-height: 80rpx;
  width: 120rpx;
  font-size: 28rpx;
  background-color: #536dfe;
  color: white;
  border-radius: 40rpx;
  padding: 0;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #536dfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
