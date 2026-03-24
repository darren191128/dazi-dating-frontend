<template>
  <view class="message-container">
    <!-- 消息分类Tab -->
    <u-tabs 
      :list="tabList" 
      :current="currentTab" 
      @change="onTabChange"
      active-color="#007AFF"
    />
    
    <!-- 消息列表 -->
    <scroll-view scroll-y class="message-list">
      <view v-if="currentTab === 0">
        <!-- 私聊列表 -->
        <view 
          class="message-item" 
          v-for="chat in privateChats" 
          :key="chat.id"
          @click="goToChat(chat)"
        >
          <image class="avatar" :src="chat.avatar" mode="aspectFill" />
          <view class="content">
            <view class="header">
              <text class="name">{{ chat.name }}</text>
              <text class="time">{{ chat.lastTime }}</text>
            </view>
            <view class="footer">
              <text class="preview">{{ chat.lastMessage }}</text>
              <u-badge :value="chat.unread" v-if="chat.unread > 0" />
            </view>
          </view>
        </view>
      </view>
      
      <view v-else-if="currentTab === 1">
        <!-- 创建群聊按钮 -->
        <view class="create-group-btn" @click="createGroup">
          <u-icon name="plus-circle" size="32" color="#007AFF" />
          <text>创建群聊</text>
        </view>
        
        <!-- 群聊列表 -->
        <view 
          class="message-item" 
          v-for="group in groupChats" 
          :key="group.id"
          @click="goToGroupChat(group)"
        >
          <image class="avatar" :src="group.cover" mode="aspectFill" />
          <view class="content">
            <view class="header">
              <text class="name">{{ group.name }}</text>
              <text class="time">{{ group.lastTime }}</text>
            </view>
            <view class="footer">
              <text class="preview">{{ group.lastMessage }}</text>
              <u-badge :value="group.unread" v-if="group.unread > 0" />
            </view>
          </view>
        </view>
      </view>
      
      <view v-else>
        <!-- 系统消息 -->
        <view 
          class="message-item system" 
          v-for="msg in systemMessages" 
          :key="msg.id"
        >
          <view class="system-icon">
            <u-icon name="bell-fill" size="24" color="#007AFF" />
          </view>
          <view class="content">
            <text class="title">{{ msg.title }}</text>
            <text class="desc">{{ msg.content }}</text>
            <text class="time">{{ msg.time }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { messageApi } from '@/api'
import { groupApi } from '@/api/rtc-group'

const currentTab = ref(0)

const tabList = [
  { name: '私聊' },
  { name: '群聊' },
  { name: '系统' }
]

const privateChats = ref([])
const groupChats = ref([])
const systemMessages = ref([
  {
    id: 1,
    title: '活动提醒',
    content: '您报名的"周末聚餐"活动即将开始',
    time: '2024-03-25 08:00'
  },
  {
    id: 2,
    title: '信用分变动',
    content: '您成功参与活动，信用分+5',
    time: '2024-03-24 20:00'
  }
])

onMounted(() => {
  loadPrivateChats()
  loadGroupChats()
})

// 加载私聊列表
const loadPrivateChats = async () => {
  try {
    const res = await messageApi.getConversations()
    if (res.code === 200 && res.data) {
      privateChats.value = res.data.map(chat => ({
        id: chat.targetUserId,
        name: chat.targetNickname,
        avatar: chat.targetAvatar || '/static/default-avatar.png',
        lastMessage: chat.lastMessage,
        lastTime: formatTime(chat.lastTime),
        unread: chat.unreadCount || 0
      }))
    }
  } catch (error) {
    console.error('加载私聊列表失败:', error)
  }
}

// 加载群聊列表
const loadGroupChats = async () => {
  try {
    const res = await groupApi.getGroups()
    if (res.code === 200 && res.data) {
      groupChats.value = res.data.map(group => ({
        id: group.id,
        name: group.name,
        cover: group.avatar || '/static/default-group.png',
        lastMessage: group.lastMessage || '',
        lastTime: formatTime(group.lastMessageTime),
        unread: group.unreadCount || 0
      }))
    }
  } catch (error) {
    console.error('加载群聊列表失败:', error)
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  // 今天
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  // 昨天
  if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
    return '昨天'
  }
  // 更早
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

const onTabChange = (index) => {
  currentTab.value = index
  if (index === 0) {
    loadPrivateChats()
  } else if (index === 1) {
    loadGroupChats()
  }
}

const goToChat = (chat) => {
  uni.navigateTo({
    url: `/pages/message/chat?userId=${chat.id}&nickname=${chat.name}`
  })
}

const goToGroupChat = (group) => {
  uni.navigateTo({
    url: `/pages/message/group-chat?groupId=${group.id}&name=${group.name}`
  })
}

// 创建群聊
const createGroup = () => {
  uni.navigateTo({
    url: '/pages/message/group-create'
  })
}
</script>

<style scoped>
.message-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.message-list {
  height: calc(100vh - 100rpx);
}

.message-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.message-item.system {
  align-items: flex-start;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.system-icon {
  width: 100rpx;
  height: 100rpx;
  background: #E8F4FF;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.content {
  flex: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.time {
  font-size: 24rpx;
  color: #999;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview {
  font-size: 28rpx;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.desc {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.create-group-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.create-group-btn text {
  font-size: 30rpx;
  color: #007AFF;
}
</style>
