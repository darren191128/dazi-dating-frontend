<template>
  <view class="group-chat-container">
    <!-- 聊天头部 -->
    <view class="chat-header">
      <text class="group-name">{{ groupName }}</text>
      <text class="member-count">({{ memberCount }}人)</text>
      <u-icon name="more-dot-fill" size="32" color="#666" @click="goToDetail" />
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
          :src="msg.senderAvatar"
          mode="aspectFill"
          @click="viewUserProfile(msg.senderId)"
        />
        <view class="message-content">
          <text class="sender-name" v-if="!msg.isSelf">{{ msg.senderName }}</text>
          
          <!-- 文本消息 -->
          <view v-if="msg.messageType === 1" class="message-bubble">
            <text class="message-text">{{ msg.content }}</text>
            <!-- @标记 -->
            <view v-if="msg.atUserIds && msg.atUserIds.length > 0" class="at-tag">
              <text>@{{ getAtUserNames(msg.atUserIds) }}</text>
            </view>
          </view>

          <!-- 图片消息 -->
          <image
            v-else-if="msg.messageType === 2"
            class="message-image"
            :src="msg.imageUrl"
            mode="widthFix"
            @click="previewImage(msg.imageUrl)"
          />

          <!-- 语音消息 -->
          <VoiceMessage
            v-else-if="msg.messageType === 3"
            :src="msg.voiceUrl"
            :duration="msg.voiceDuration || 0"
            :is-self="msg.isSelf"
            @play="onVoicePlay"
          />

          <text class="message-time">{{ formatTime(msg.createdAt) }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 输入框 -->
    <view class="input-area">
      <view class="input-wrapper">
        <!-- @成员按钮 -->
        <view class="at-btn" @click="showMemberSelector">
          <u-icon name="at" size="28" color="#666" />
        </view>
        
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
        <u-button type="primary" size="small" @click="sendMessage" :loading="sending">发送</u-button>
      </view>
    </view>
    
    <!-- @成员选择器 -->
    <view class="member-selector" v-if="showAtSelector">
      <view class="selector-header">
        <text>选择要@的成员</text>
        <u-icon name="close" size="28" color="#999" @click="showAtSelector = false" />
      </view>
      <scroll-view scroll-y class="selector-list">
        <view
          class="selector-item"
          v-for="member in memberList"
          :key="member.userId"
          @click="atMember(member)"
        >
          <image class="selector-avatar" :src="member.avatar" mode="aspectFill" />
          <text class="selector-name">{{ member.nickname }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad, onUnload, onMounted } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { groupApi } from '@/api/rtc-group'
import VoiceMessage from '@/components/VoiceMessage.vue'

const userStore = useUserStore()
const userInfo = userStore.userInfo

// 页面参数
const groupId = ref('')
const groupName = ref('')
const memberCount = ref(0)

// 消息相关
const messages = ref([])
const inputMessage = ref('')
const scrollTop = ref(0)
const sending = ref(false)
const atUserIds = ref([])

// 成员相关
const memberList = ref([])
const showAtSelector = ref(false)

// 轮询定时器
let pollTimer = null

onLoad((options) => {
  groupId.value = options.groupId
  groupName.value = options.name || '群聊'
  
  // 加载历史消息
  loadMessages()
  
  // 加载成员列表
  loadMembers()
  
  // 开始轮询新消息
  startPolling()
})

onUnload(() => {
  stopPolling()
})

// 加载群成员
const loadMembers = async () => {
  try {
    const res = await groupApi.getGroupDetail(groupId.value)
    if (res.code === 200 && res.data) {
      memberList.value = res.data.members || []
      memberCount.value = res.data.memberCount
    }
  } catch (error) {
    console.error('加载成员列表失败:', error)
  }
}

// 加载历史消息
const loadMessages = async () => {
  try {
    const res = await groupApi.getGroupMessages(groupId.value, {
      page: 1,
      pageSize: 50
    })

    if (res.code === 200 && res.data) {
      const list = res.data.records || res.data.list || []
      messages.value = list.map(msg => ({
        ...msg,
        isSelf: msg.senderId === userInfo.id
      }))
      scrollToBottom()
    }
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || sending.value) return

  const content = inputMessage.value.trim()
  sending.value = true

  try {
    const res = await groupApi.sendGroupMessage(groupId.value, {
      messageType: 1,
      content: content,
      atUserIds: atUserIds.value
    })

    if (res.code === 200) {
      // 添加到本地消息列表
      messages.value.push({
        id: res.data?.id || Date.now(),
        messageType: 1,
        content: content,
        senderId: userInfo.id,
        senderName: userInfo.nickname,
        senderAvatar: userInfo.avatar,
        isSelf: true,
        atUserIds: [...atUserIds.value],
        createdAt: new Date().toISOString()
      })

      inputMessage.value = ''
      atUserIds.value = []
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
    const uploadRes = await uni.uploadFile({
      url: uni.getStorageSync('baseURL') + '/message/upload/image',
      filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      }
    })
    const data = JSON.parse(uploadRes.data)
    
    if (data.code === 200 && data.data?.url) {
      // 发送图片消息
      const res = await groupApi.sendGroupMessage(groupId.value, {
        messageType: 2,
        imageUrl: data.data.url
      })

      if (res.code === 200) {
        messages.value.push({
          id: res.data?.id || Date.now(),
          messageType: 2,
          imageUrl: data.data.url,
          senderId: userInfo.id,
          senderName: userInfo.nickname,
          senderAvatar: userInfo.avatar,
          isSelf: true,
          createdAt: new Date().toISOString()
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

// 显示成员选择器
const showMemberSelector = () => {
  showAtSelector.value = true
}

// @成员
const atMember = (member) => {
  if (!atUserIds.value.includes(member.userId)) {
    atUserIds.value.push(member.userId)
  }
  inputMessage.value += `@${member.nickname} `
  showAtSelector.value = false
}

// 获取@用户名称
const getAtUserNames = (ids) => {
  if (!ids || ids.length === 0) return ''
  const names = ids.map(id => {
    const member = memberList.value.find(m => m.userId === id)
    return member ? member.nickname : ''
  }).filter(Boolean)
  return names.join(' ')
}

// 查看用户资料
const viewUserProfile = (userId) => {
  uni.navigateTo({
    url: `/pages/user/profile?userId=${userId}`
  })
}

// 前往群详情
const goToDetail = () => {
  uni.navigateTo({
    url: `/pages/message/group-detail?groupId=${groupId.value}`
  })
}

// 轮询新消息
const startPolling = () => {
  pollTimer = setInterval(() => {
    loadNewMessages()
  }, 5000)
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

    const res = await groupApi.getGroupMessages(groupId.value, {
      page: 1,
      pageSize: 20
    })

    if (res.code === 200 && res.data) {
      const list = res.data.records || res.data.list || []
      const newMessages = list.filter(msg => msg.id > lastMessageId)
      
      if (newMessages.length > 0) {
        messages.value.push(...newMessages.map(msg => ({
          ...msg,
          isSelf: msg.senderId === userInfo.id
        })))
        scrollToBottom()
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
</script>

<style scoped>
.group-chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.chat-header {
  padding: 20rpx;
  background: #fff;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eee;
}

.group-name {
  font-size: 32rpx;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.member-count {
  font-size: 26rpx;
  color: #999;
  margin-right: 20rpx;
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

.sender-name {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.message-bubble {
  display: inline-block;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
}

.message-item.self .message-bubble {
  background: #007AFF;
}

.message-text {
  font-size: 30rpx;
  color: #333;
}

.message-item.self .message-text {
  color: #fff;
}

.at-tag {
  margin-top: 8rpx;
  padding: 4rpx 12rpx;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8rpx;
  display: inline-block;
}

.at-tag text {
  font-size: 24rpx;
  color: #007AFF;
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

.at-btn {
  margin-right: 20rpx;
  padding: 10rpx;
}

.input {
  flex: 1;
  font-size: 30rpx;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-selector {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 60vh;
  z-index: 100;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.selector-header text {
  font-size: 32rpx;
  font-weight: bold;
}

.selector-list {
  max-height: 50vh;
  padding: 0 30rpx;
}

.selector-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.selector-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.selector-name {
  font-size: 30rpx;
  color: #333;
}
</style>
