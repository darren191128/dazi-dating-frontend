<template>
  <view class="joined-container">
    <!-- Tab切换 -->
    <u-tabs 
      :list="tabList" 
      :current="currentTab" 
      @change="onTabChange"
      active-color="#007AFF"
    />
    
    <!-- 活动列表 -->
    <scroll-view 
      scroll-y 
      class="activity-list"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="activity-item" v-for="activity in activityList" :key="activity.id" @click="goToDetail(activity.id)">
        <image class="cover" :src="activity.coverImage || '/static/default-activity.jpg'" mode="aspectFill" />
        <view class="content">
          <text class="title">{{ activity.title }}</text>
          <view class="info">
            <u-icon name="clock" size="12" color="#999" />
            <text class="time">{{ formatTime(activity.startTime) }}</text>
          </view>
          <view class="info">
            <u-icon name="map" size="12" color="#999" />
            <text class="location">{{ activity.location }}</text>
          </view>
          <view class="footer">
            <text class="organizer">发起人: {{ activity.organizer?.nickname || '未知' }}</text>
            <text class="status" :class="getStatusClass(activity.status)">{{ getStatusText(activity.status) }}</text>
          </view>
        </view>
      </view>
      
      <u-empty v-if="activityList.length === 0 && !loading" mode="list" text="暂无参与的活动" />
      <u-loadmore v-else :status="loadStatus" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { activityApi } from '@/api'

const currentTab = ref(0)
const activityList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const loadStatus = ref('loadmore')
const page = ref(1)
const pageSize = ref(10)

const tabList = [
  { name: '即将开始' },
  { name: '进行中' },
  { name: '已结束' }
]

onMounted(() => {
  loadActivities()
})

const onTabChange = (index) => {
  currentTab.value = index
  page.value = 1
  activityList.value = []
  loadActivities()
}

const loadActivities = async () => {
  try {
    loading.value = true
    loadStatus.value = 'loading'
    const statusMap = { 0: 0, 1: 1, 2: 2 }
    const res = await activityApi.getActivityList({
      myJoined: true,
      status: statusMap[currentTab.value],
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

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/activity/detail?id=${id}` })
}
</script>

<style scoped>
.joined-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.activity-list {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}

.activity-item {
  display: flex;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.cover {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  gap: 8rpx;
}

.time, .location {
  font-size: 24rpx;
  color: #666;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.organizer {
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
</style>
