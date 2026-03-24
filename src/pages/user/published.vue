<template>
  <view class="published-container">
    <!-- 活动列表 -->
    <scroll-view 
      scroll-y 
      class="activity-list"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="activity-item" v-for="activity in activityList" :key="activity.id">
        <image class="cover" :src="activity.coverImage || '/static/default-activity.jpg'" mode="aspectFill" />
        <view class="content">
          <text class="title">{{ activity.title }}</text>
          <view class="info">
            <text class="time">{{ formatTime(activity.startTime) }}</text>
            <text class="status" :class="getStatusClass(activity.status)">{{ getStatusText(activity.status) }}</text>
          </view>
          <view class="stats">
            <text>{{ activity.currentParticipants }}/{{ activity.maxParticipants }}人报名</text>
          </view>
        </view>
        <view class="actions">
          <u-button type="primary" size="mini" plain @click="editActivity(activity.id)">编辑</u-button>
          <u-button type="error" size="mini" plain @click="deleteActivity(activity.id)">删除</u-button>
        </view>
      </view>
      
      <u-empty v-if="activityList.length === 0 && !loading" mode="list" text="暂无发布的活动" />
      <u-loadmore v-else :status="loadStatus" />
    </scroll-view>
    
    <!-- 发布按钮 -->
    <view class="fab-btn" @click="goToCreate">
      <u-icon name="plus" size="24" color="#fff" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { activityApi } from '@/api'

const activityList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const loadStatus = ref('loadmore')
const page = ref(1)
const pageSize = ref(10)

onMounted(() => {
  loadActivities()
})

const loadActivities = async () => {
  try {
    loading.value = true
    loadStatus.value = 'loading'
    const res = await activityApi.getActivityList({
      myPublished: true,
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      if (page.value === 1) {
        activityList.value = res.data.list || []
      } else {
        activityList.value = [...activityList.value, ...(res.data.list || [])]
      }
      loadStatus.value = res.data.list?.length < pageSize.value ? 'nomore' : 'loadmore'
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
    loadStatus.value = 'loadmore'
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  refreshing.value = true
  page.value = 1
  await loadActivities()
  refreshing.value = false
}

const loadMore = () => {
  if (loadStatus.value === 'nomore') return
  page.value++
  loadActivities()
}

const formatTime = (time) => {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 16)
}

const getStatusText = (status) => {
  const statusMap = {
    0: '待开始',
    1: '进行中',
    2: '已结束',
    3: '已取消'
  }
  return statusMap[status] || '未知'
}

const getStatusClass = (status) => {
  const classMap = {
    0: 'status-pending',
    1: 'status-active',
    2: 'status-ended',
    3: 'status-cancelled'
  }
  return classMap[status] || ''
}

const editActivity = (id) => {
  uni.navigateTo({ url: `/pages/activity/create?id=${id}` })
}

const deleteActivity = (id) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个活动吗？删除后不可恢复。',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await activityApi.deleteActivity(id)
          if (result.code === 200) {
            uni.showToast({ title: '删除成功', icon: 'success' })
            page.value = 1
            loadActivities()
          } else {
            uni.showToast({ title: result.message || '删除失败', icon: 'none' })
          }
        } catch (error) {
          console.error('删除活动失败:', error)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

const goToCreate = () => {
  uni.navigateTo({ url: '/pages/activity/create' })
}
</script>

<style scoped>
.published-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.activity-list {
  height: 100vh;
  padding: 20rpx;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160rpx;
}

.title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.time {
  font-size: 24rpx;
  color: #999;
}

.status {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.status-pending {
  background: #E8F4FF;
  color: #007AFF;
}

.status-active {
  background: #E6F7E6;
  color: #52C41A;
}

.status-ended {
  background: #F5F5F5;
  color: #999;
}

.status-cancelled {
  background: #FFF1F0;
  color: #FF4D4F;
}

.stats {
  font-size: 24rpx;
  color: #666;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-left: 20rpx;
}

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
  width: 100rpx;
  height: 100rpx;
  background: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.4);
}
</style>
