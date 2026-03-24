<template>
  <view class="activity-detail-container" v-if="activity.id">
    <!-- 活动封面 -->
    <image class="cover-image" :src="activity.coverImage || '/static/default-activity.jpg'" mode="aspectFill" />
    
    <!-- 活动信息 -->
    <view class="info-section">
      <view class="header">
        <text class="type-tag">{{ activity.typeName }}</text>
        <text class="title">{{ activity.title }}</text>
      </view>
      
      <view class="info-list">
        <view class="info-item">
          <u-icon name="clock" size="18" color="#007AFF" />
          <view class="info-content">
            <text class="label">活动时间</text>
            <text class="value">{{ formatTime(activity.startTime) }}</text>
          </view>
        </view>
        
        <view class="info-item">
          <u-icon name="map" size="18" color="#007AFF" />
          <view class="info-content">
            <text class="label">活动地点</text>
            <text class="value">{{ activity.location }}</text>
          </view>
        </view>
        
        <view class="info-item">
          <u-icon name="account" size="18" color="#007AFF" />
          <view class="info-content">
            <text class="label">参与人数</text>
            <text class="value">{{ activity.currentParticipants }}/{{ activity.maxParticipants }}人</text>
          </view>
        </view>
        
        <view class="info-item">
          <u-icon name="rmb-circle" size="18" color="#007AFF" />
          <view class="info-content">
            <text class="label">费用说明</text>
            <text class="value">{{ paymentTypeText }} {{ activity.perPersonAmount > 0 ? `¥${activity.perPersonAmount}/人` : '免费' }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 活动详情 -->
    <view class="detail-section">
      <view class="section-title">活动详情</view>
      <text class="detail-content">{{ activity.description || '暂无活动详情' }}</text>
    </view>
    
    <!-- 发起人信息 -->
    <view class="organizer-section" v-if="activity.organizer">
      <view class="section-title">发起人</view>
      <view class="organizer-card" @click="goToUserDetail(activity.organizer.userId)">
        <image class="avatar" :src="activity.organizer.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="organizer-info">
          <text class="nickname">{{ activity.organizer.nickname }}</text>
          <text class="credit">信用分 {{ activity.organizer.creditScore || 100 }}</text>
        </view>
        <u-icon name="arrow-right" size="16" color="#999" />
      </view>
    </view>
    
    <!-- 参与者列表 -->
    <view class="participants-section">
      <view class="section-header">
        <text class="section-title">参与者</text>
        <text class="count">{{ participants.length }}人</text>
      </view>
      <view class="participants-list">
        <view 
          class="participant-item" 
          v-for="participant in participants" 
          :key="participant.userId"
          @click="goToUserDetail(participant.userId)"
        >
          <image class="avatar" :src="participant.avatar || '/static/default-avatar.png'" mode="aspectFill" />
          <text class="nickname">{{ participant.nickname }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-btns">
        <view class="action-btn" @click="toggleFavorite">
          <u-icon :name="isFavorited ? 'star-fill' : 'star'" size="24" :color="isFavorited ? '#FF6B6B' : '#666'" />
          <text :class="{ favorited: isFavorited }">收藏</text>
        </view>
        <view class="action-btn" @click="shareActivity">
          <u-icon name="share" size="24" color="#666" />
          <text>分享</text>
        </view>
      </view>
      <u-button 
        type="primary" 
        :disabled="isJoined || isFull"
        @click="handleJoin"
      >
        {{ joinButtonText }}
      </u-button>
    </view>
  </view>
  
  <u-loading-page v-else loading-text="加载中..." />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { activityApi } from '@/api'

const activity = ref({})
const participants = ref([])
const isFavorited = ref(false)
const isJoined = ref(false)

const activityId = ref('')

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  activityId.value = currentPage.options.id
  if (activityId.value) {
    loadActivityDetail()
    loadParticipants()
  }
})

const loadActivityDetail = async () => {
  try {
    const res = await activityApi.getActivityDetail(activityId.value)
    if (res.code === 200) {
      activity.value = res.data
      isJoined.value = res.data.isJoined || false
      isFavorited.value = res.data.isFavorited || false
    }
  } catch (error) {
    console.error('加载活动详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const loadParticipants = async () => {
  try {
    // 这里假设有获取参与者列表的接口，实际可能需要根据后端API调整
    participants.value = activity.value.participants || []
  } catch (error) {
    console.error('加载参与者失败:', error)
  }
}

const paymentTypeText = computed(() => {
  const types = { 1: 'AA制', 2: '男A女免', 3: '请客', 4: '免费' }
  return types[activity.value.paymentType] || 'AA制'
})

const isFull = computed(() => {
  return activity.value.currentParticipants >= activity.value.maxParticipants
})

const joinButtonText = computed(() => {
  if (isJoined.value) return '已报名'
  if (isFull.value) return '已满员'
  return '立即报名'
})

const formatTime = (time) => {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 16)
}

const handleJoin = () => {
  if (isJoined.value || isFull.value) return
  
  uni.showModal({
    title: '确认报名',
    content: `确定要报名参加"${activity.value.title}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await activityApi.joinActivity(activityId.value)
          if (result.code === 200) {
            uni.showToast({ title: '报名成功', icon: 'success' })
            isJoined.value = true
            activity.value.currentParticipants++
          } else {
            uni.showToast({ title: result.message || '报名失败', icon: 'none' })
          }
        } catch (error) {
          console.error('报名失败:', error)
          uni.showToast({ title: '报名失败', icon: 'none' })
        }
      }
    }
  })
}

const toggleFavorite = async () => {
  try {
    // 这里假设有收藏/取消收藏的接口
    isFavorited.value = !isFavorited.value
    uni.showToast({ 
      title: isFavorited.value ? '收藏成功' : '取消收藏', 
      icon: 'none' 
    })
  } catch (error) {
    console.error('收藏操作失败:', error)
  }
}

const shareActivity = () => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

const goToUserDetail = (userId) => {
  uni.navigateTo({ url: `/pages/user/detail?userId=${userId}` })
}

// 分享配置
onShareAppMessage(() => {
  return {
    title: activity.value.title,
    path: `/pages/activity/detail?id=${activityId.value}`,
    imageUrl: activity.value.coverImage
  }
})

onShareTimeline(() => {
  return {
    title: activity.value.title,
    query: `id=${activityId.value}`,
    imageUrl: activity.value.coverImage
  }
})
</script>

<style scoped>
.activity-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.cover-image {
  width: 100%;
  height: 400rpx;
}

.info-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.header {
  margin-bottom: 30rpx;
}

.type-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: #E8F4FF;
  color: #007AFF;
  font-size: 24rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-content {
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 24rpx;
  color: #999;
}

.value {
  font-size: 28rpx;
  color: #333;
  margin-top: 4rpx;
}

.detail-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.detail-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}

.organizer-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.organizer-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 16rpx;
}

.organizer-card .avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.organizer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.organizer-info .nickname {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.organizer-info .credit {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.participants-section {
  background: #fff;
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.count {
  font-size: 26rpx;
  color: #999;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.participant-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100rpx;
}

.participant-item .avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-bottom: 8rpx;
}

.participant-item .nickname {
  font-size: 22rpx;
  color: #666;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-btns {
  display: flex;
  gap: 40rpx;
  margin-right: 30rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.action-btn text {
  font-size: 22rpx;
  color: #666;
}

.action-btn text.favorited {
  color: #FF6B6B;
}

.bottom-bar .u-button {
  flex: 1;
}
</style>
