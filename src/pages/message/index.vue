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
import { ref } from 'vue'

const currentTab = ref(0)

const tabList = [
  { name: '私聊' },
  { name: '群聊' },
  { name: '系统' }
]

const privateChats = ref([
  {
    id: 1,
    name: '小明',
    avatar: '/static/avatar1.jpg',
    lastMessage: '周末一起去打球吗？',
    lastTime: '10:30',
    unread: 2
  },
  {
    id: 2,
    name: '小红',
    avatar: '/static/avatar2.jpg',
    lastMessage: '好的，到时候见',
    lastTime: '昨天',
    unread: 0
  }
])

const groupChats = ref([
  {
    id: 1,
    name: '周末聚餐群',
    cover: '/static/group1.jpg',
    lastMessage: '张三：我已经到了',
    lastTime: '09:00',
    unread: 5
  }
])

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

const onTabChange = (index) => {
  currentTab.value = index
}

const goToChat = (chat) => {
  uni.navigateTo({
    url: `/pages/message/chat?userId=${chat.id}&nickname=${chat.name}`
  })
}

const goToGroupChat = (group) => {
  uni.navigateTo({
    url: `/pages/message/groupChat?groupId=${group.id}&name=${group.name}`
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
</style>
