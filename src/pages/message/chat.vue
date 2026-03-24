<template>
  <view class="chat-container">
    <!-- 聊天头部 -->
    <view class="chat-header">
      <text class="nickname">{{ nickname }}</text>
      <view class="header-actions">
        <u-icon name="phone-fill" size="28" color="#007AFF" @click="startVoiceCall" />
        <u-icon name="video-camera" size="28" color="#007AFF" @click="startVideoCall" />
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view
      scroll-y
      class="message-list"
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
    >
      <view
        class="message-item"
        :class="msg.isSelf ? 'self' : 'other'"
        v-for="(msg, index) in messages"
        :key="msg.id || index"
      >
        <image
          class="avatar"
          :src="msg.isSelf ? userInfo.avatar : otherAvatar"
          mode="aspectFill"
        />
        <view class="message-content">
          <!-- 文本消息 -->
          <text v-if="msg.type === 'text'" class="message-text">{{ msg.content }}</text>

          <!-- 图片消息 -->
          <image
            v-else-if="msg.type === 'image'"
            class="message-image"
            :src="msg.content"
            mode="widthFix"
            @click="previewImage(msg.content)"
          />

          <!-- 语音消息 -->
          <VoiceMessage
            v-else-if="msg.type === 'voice'"
            :src="msg.content"
            :duration="msg.duration || 0"
            :is-self="msg.isSelf"
            :is-read="msg.isRead"
            @play="onVoicePlay"
            @stop="onVoiceStop"
          />

          <!-- 已读状态 -->
          <text v-if="msg.isSelf" class="read-status">{{ msg.isRead ? '已读' : '未读' }}</text>
          <text class="message-time">{{ formatTime(msg.createTime) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 输入框 -->
    <view class="input-area">
      <view class="input-wrapper">
        <!-- 语音/文本切换 -->
        <view class="input-mode-toggle" @click="toggleInputMode">
          <u-icon :name="isVoiceMode ? 'keyboard' : 'mic'" size="28" color="#666" />
        </view>

        <!-- 文本输入 -->
        <input
          v-if="!isVoiceMode"
          class="input"
          v-model="inputMessage"
          placeholder="输入消息..."
          confirm-type="send"
          @confirm="sendTextMessage"
        />

        <!-- 语音输入 -->
        <view
          v-else
          class="voice-btn"
          @touchstart="startRecord"
          @touchend="stopRecord"
          @touchcancel="cancelRecord"
        >
          {{ isRecording ? '松开发送' : '按住说话' }}
        </view>
      </view>

      <view class="actions">
        <u-icon name="photo" size="28" color="#666" @click="chooseImage" />
        <u-button type="primary" size="small" @click="sendTextMessage" :loading="sending">发送</u-button>
      </view>
    </view>

    <!-- 录音提示 -->
    <view v-if="isRecording" class="recording-tip">
      <u-icon name="mic" size="48" color="#fff" />
      <text>录音中...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad, onUnload } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { messageApi, messageExtApi } from '@/api'
import { rtcApi } from '@/api/rtc-group'
import VoiceMessage from '@/components/VoiceMessage.vue'

const userStore = useUserStore()
const userInfo = userStore.userInfo

// 页面参数
const userId = ref('')
const nickname = ref('')
const otherAvatar = ref('/static/default-avatar.png')
const conversationId = ref('')

// 消息相关
const messages = ref([])
const inputMessage = ref('')
const scrollTop = ref(0)
const sending = ref(false)

// 语音相关
const isVoiceMode = ref(false)
const isRecording = ref(false)
const recorderManager = ref(null)
const recordDuration = ref(0)

// 轮询定时器
let pollTimer = null

onLoad((options) => {
  userId.value = options.userId
  nickname.value = options.nickname
  otherAvatar.value = options.avatar || '/static/default-avatar.png'
  conversationId.value = options.conversationId || ''

  // 初始化录音管理器
  // #ifdef MP-WEIXIN
  recorderManager.value = uni.getRecorderManager()
  recorderManager.value.onStop((res) => {
    if (res.duration > 1000) {
      uploadAndSendVoice(res.tempFilePath, Math.round(res.duration / 1000))
    } else {
      uni.showToast({ title: '录音时间太短', icon: 'none' })
    }
  })
  recorderManager.value.onError((err) => {
    console.error('录音错误:', err)
    uni.showToast({ title: '录音失败', icon: 'none' })
  })
  // #endif

  // 加载历史消息
  loadMessages()

  // 开始轮询新消息
  startPolling()
})

onUnload(() => {
  stopPolling()
})

// 加载历史消息
const loadMessages = async () => {
  try {
    const res = await messageApi.getMessages(conversationId.value || userId.value, {
      page: 1,
      pageSize: 50
    })

    if (res.code === 200 && res.data) {
      messages.value = res.data.list || res.data || []
      scrollToBottom()

      // 标记消息已读
      markAsRead()
    }
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

// 发送文本消息
const sendTextMessage = async () => {
  if (!inputMessage.value.trim() || sending.value) return

  const content = inputMessage.value.trim()
  sending.value = true

  try {
    const res = await messageApi.sendMessage(conversationId.value || userId.value, {
      type: 'text',
      content: content,
      toUserId: userId.value
    })

    if (res.code === 200) {
      // 添加到本地消息列表
      messages.value.push({
        id: res.data?.id || Date.now(),
        type: 'text',
        content: content,
        isSelf: true,
        isRead: false,
        createTime: new Date().toISOString()
      })

      inputMessage.value = ''
      scrollToBottom()
    } else {
      uni.showToast({ title: res.message || '发送失败', icon: 'none' })
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    uni.showToast({ title: '发送失败', icon: 'none' })
  } finally {
    sending.value = false
  }
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      await uploadAndSendImage(tempFilePath)
    }
  })
}

// 上传并发送图片
const uploadAndSendImage = async (filePath) => {
  uni.showLoading({ title: '发送中...' })

  try {
    // 上传图片
    const uploadRes = await messageExtApi.uploadImage(filePath)

    if (uploadRes.code === 200 && uploadRes.data?.url) {
      // 发送图片消息
      const res = await messageApi.sendMessage(conversationId.value || userId.value, {
        type: 'image',
        content: uploadRes.data.url,
        toUserId: userId.value
      })

      if (res.code === 200) {
        messages.value.push({
          id: res.data?.id || Date.now(),
          type: 'image',
          content: uploadRes.data.url,
          isSelf: true,
          isRead: false,
          createTime: new Date().toISOString()
        })
        scrollToBottom()
      }
    } else {
      uni.showToast({ title: '图片上传失败', icon: 'none' })
    }
  } catch (error) {
    console.error('发送图片失败:', error)
    uni.showToast({ title: '发送失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 切换输入模式
const toggleInputMode = () => {
  isVoiceMode.value = !isVoiceMode.value
}

// 开始录音
const startRecord = () => {
  // #ifdef MP-WEIXIN
  if (recorderManager.value) {
    isRecording.value = true
    recorderManager.value.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    })
  }
  // #endif
}

// 停止录音
const stopRecord = () => {
  // #ifdef MP-WEIXIN
  if (recorderManager.value && isRecording.value) {
    isRecording.value = false
    recorderManager.value.stop()
  }
  // #endif
}

// 取消录音
const cancelRecord = () => {
  // #ifdef MP-WEIXIN
  if (recorderManager.value && isRecording.value) {
    isRecording.value = false
    recorderManager.value.stop()
  }
  // #endif
}

// 上传并发送语音
const uploadAndSendVoice = async (filePath, duration) => {
  uni.showLoading({ title: '发送中...' })

  try {
    // 上传语音
    const uploadRes = await messageExtApi.uploadVoice(filePath)

    if (uploadRes.code === 200 && uploadRes.data?.url) {
      // 发送语音消息
      const res = await messageApi.sendMessage(conversationId.value || userId.value, {
        type: 'voice',
        content: uploadRes.data.url,
        duration: duration,
        toUserId: userId.value
      })

      if (res.code === 200) {
        messages.value.push({
          id: res.data?.id || Date.now(),
          type: 'voice',
          content: uploadRes.data.url,
          duration: duration,
          isSelf: true,
          isRead: false,
          createTime: new Date().toISOString()
        })
        scrollToBottom()
      }
    } else {
      uni.showToast({ title: '语音上传失败', icon: 'none' })
    }
  } catch (error) {
    console.error('发送语音失败:', error)
    uni.showToast({ title: '发送失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 标记已读
const markAsRead = async () => {
  try {
    await messageApi.markAsRead(conversationId.value || userId.value)
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

// 轮询新消息
const startPolling = () => {
  pollTimer = setInterval(() => {
    loadNewMessages()
  }, 5000) // 每5秒轮询一次
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 加载新消息
const loadNewMessages = async () => {
  try {
    const lastMessageId = messages.value.length > 0
      ? messages.value[messages.value.length - 1].id
      : 0

    const res = await messageApi.getMessages(conversationId.value || userId.value, {
      page: 1,
      pageSize: 20,
      afterId: lastMessageId
    })

    if (res.code === 200 && res.data) {
      const newMessages = res.data.list || res.data || []
      if (newMessages.length > 0) {
        messages.value.push(...newMessages)
        scrollToBottom()
        markAsRead()
      }
    }
  } catch (error) {
    console.error('加载新消息失败:', error)
  }
}

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    scrollTop.value = messages.value.length * 1000
  }, 100)
}

// 预览图片
const previewImage = (url) => {
  uni.previewImage({
    urls: [url],
    current: url
  })
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 语音播放回调
const onVoicePlay = () => {
  console.log('语音播放开始')
}

const onVoiceStop = () => {
  console.log('语音播放结束')
}

// 发起语音通话
const startVoiceCall = async () => {
  try {
    uni.showLoading({ title: '正在呼叫...' })
    const res = await rtcApi.startCall({
      calleeId: userId.value,
      callType: 1 // 语音
    })
    uni.hideLoading()
    
    if (res.code === 200 && res.data) {
      const { id, roomId } = res.data
      uni.navigateTo({
        url: `/pages/call/index?callType=1&callId=${id}&roomId=${roomId}&remoteUserId=${userId.value}&remoteName=${nickname.value}&remoteAvatar=${otherAvatar.value}&isCaller=true`
      })
    } else {
      uni.showToast({ title: res.message || '呼叫失败', icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('发起语音通话失败:', error)
    uni.showToast({ title: '呼叫失败', icon: 'none' })
  }
}

// 发起视频通话
const startVideoCall = async () => {
  try {
    uni.showLoading({ title: '正在呼叫...' })
    const res = await rtcApi.startCall({
      calleeId: userId.value,
      callType: 2 // 视频
    })
    uni.hideLoading()
    
    if (res.code === 200 && res.data) {
      const { id, roomId } = res.data
      uni.navigateTo({
        url: `/pages/call/index?callType=2&callId=${id}&roomId=${roomId}&remoteUserId=${userId.value}&remoteName=${nickname.value}&remoteAvatar=${otherAvatar.value}&isCaller=true`
      })
    } else {
      uni.showToast({ title: res.message || '呼叫失败', icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('发起视频通话失败:', error)
    uni.showToast({ title: '呼叫失败', icon: 'none' })
  }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #eee;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 30rpx;
  padding: 0 20rpx;
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
  position: relative;
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

.message-image {
  max-width: 300rpx;
  border-radius: 16rpx;
}

.message-time {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.read-status {
  display: block;
  font-size: 20rpx;
  color: #999;
  margin-top: 4rpx;
  text-align: right;
}

.input-area {
  padding: 20rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 16rpx 30rpx;
  margin-bottom: 16rpx;
}

.input-mode-toggle {
  margin-right: 20rpx;
  padding: 10rpx;
}

.input {
  flex: 1;
  font-size: 30rpx;
}

.voice-btn {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: #333;
  padding: 10rpx 0;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recording-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 40rpx 60rpx;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.recording-tip text {
  color: #fff;
  font-size: 28rpx;
}
</style>
