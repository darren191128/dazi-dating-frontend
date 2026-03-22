<template>
  <view class="chat-container">
    <!-- 聊天头部 -->
    <view class="chat-header">
      <text class="nickname">{{ nickname }}</text>
    </view>
    
    <!-- 消息列表 -->
    <scroll-view 
      scroll-y 
      class="message-list"
      :scroll-top="scrollTop"
    >
      <view 
        class="message-item" 
        :class="msg.isSelf ? 'self' : 'other'"
        v-for="(msg, index) in messages" 
        :key="index"
      >
        <image 
          class="avatar" 
          :src="msg.isSelf ? userInfo.avatar : otherAvatar" 
          mode="aspectFill"
        />
        <view class="message-content">
          <text class="message-text">{{ msg.content }}</text>
          <text class="message-time">{{ msg.time }}</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 输入框 -->
    <view class="input-area">
      <view class="input-wrapper">
        <input 
          class="input" 
          v-model="inputMessage" 
          placeholder="输入消息..."
          confirm-type="send"
          @confirm="sendMessage"
        />
      </view>
      <view class="actions">
        <u-icon name="photo" size="28" color="#666" @click="chooseImage" />
        <u-button type="primary" size="small" @click="sendMessage">发送</u-button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userInfo = userStore.userInfo

const userId = ref('')
const nickname = ref('')
const otherAvatar = ref('/static/default-avatar.png')
const inputMessage = ref('')
const scrollTop = ref(0)

const messages = ref([
  {
    content: '你好，很高兴认识你！',
    isSelf: false,
    time: '10:00'
  },
  {
    content: '你好呀，我也很高兴认识你~',
    isSelf: true,
    time: '10:01'
  }
])

onLoad((options) => {
  userId.value = options.userId
  nickname.value = options.nickname
})

const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  
  messages.value.push({
    content: inputMessage.value,
    isSelf: true,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  })
  
  inputMessage.value = ''
  scrollToBottom()
}

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      messages.value.push({
        content: '[图片]',
        isSelf: true,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
    }
  })
}

const scrollToBottom = () => {
  setTimeout(() => {
    scrollTop.value = messages.value.length * 1000
  }, 100)
}
</script>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.chat-header {
  padding: 20rpx;
  background: #fff;
  text-align: center;
  border-bottom: 1rpx solid #eee;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
}

.message-list {
  flex: 1;
  padding: 20rpx;
}

.message-item {
  display: flex;
  margin-bottom: 30rpx;
}

.message-item.self {
  flex-direction: row-reverse;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
}

.message-content {
  max-width: 60%;
  margin: 0 20rpx;
}

.message-text {
  display: inline-block;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  font-size: 30rpx;
  color: #333;
}

.message-item.self .message-text {
  background: #007AFF;
  color: #fff;
}

.message-time {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.input-area {
  padding: 20rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.input-wrapper {
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 16rpx 30rpx;
  margin-bottom: 16rpx;
}

.input {
  font-size: 30rpx;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
