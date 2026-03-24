<template>
  <view class="favorites-container">
    <!-- 分类Tab -->
    <u-tabs 
      :list="tabList" 
      :current="currentTab" 
      @change="onTabChange"
      active-color="#007AFF"
    />
    
    <!-- 收藏列表 -->
    <scroll-view 
      scroll-y 
      class="content-list"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 收藏的活动 -->
      <view v-if="currentTab === 0">
        <view class="activity-item" v-for="activity in activityList" :key="activity.id" @click="goToActivityDetail(activity.id)">
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
          </view>
          <view class="action" @click.stop="cancelFavorite('activity', activity.id)">
            <u-icon name="star-fill" size="24" color="#FF6B6B" />
          </view>
        </view>
      </view>
      
      <!-- 收藏的用户 -->
      <view v-else>
        <view class="user-item" v-for="user in userList" :key="user.userId" @click="goToUserDetail(user.userId)">
          <image class="avatar" :src="user.avatar || '/static/default-avatar.png'" mode="aspectFill" />
          <view class="info">
            <view class="header">
              <text class="nickname">{{ user.nickname }}</text>
              <text class="gender-tag" :class="user.gender === 1 ? 'male' : 'female'">
                {{ user.gender === 1 ? '♂' : '♀' }}
              </text>
              <text class="age-tag">{{ user.age }}岁</text>
            </view>
            <view class="interests" v-if="user.interests">
              <text class="interest-tag" v-for="(interest, index) in user.interests.slice(0, 3)" :key="index">
                {{ interest }}
              </text>
            </view>
          </view>
          <view class="action" @click.stop="cancelFavorite('user', user.userId)">
            <u-icon name="star-fill" size="24" color="#FF6B6B" />
          </view>
        </view>
      </view>
      
      <u-empty v-if="showEmpty" mode="list" text="暂无收藏" />
      <u-loadmore v-else :status="loadStatus" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { activityApi, matchApi } from '@/api'

const currentTab = ref(0)
const activityList = ref([])
const userList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const loadStatus = ref('loadmore')
const page = ref(1)
const pageSize = ref(10)

const tabList = [
  { name: '活动' },
  { name: '用户' }
]

const showEmpty = computed(() => {
  if (currentTab.value === 0) {
    return activityList.value.length === 0 && !loading.value
  }
  return userList.value.length === 0 && !loading.value
})

onMounted(() => {
  loadFavorites()
})

const onTabChange = (index) => {
  currentTab.value = index
  page.value = 1
  activityList.value = []
  userList.value = []
  loadFavorites()
}

const loadFavorites = async () => {
  try {
    loading.value = true
    loadStatus.value = 'loading'
    
    if (currentTab.value === 0) {
      // 加载收藏的活动
      const res = await activityApi.getActivityList({
        favorited: true,
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
    } else {
      // 加载收藏的用户 - 这里使用推荐接口模拟，实际应该使用收藏用户接口
      const res = await matchApi.getRecommendations({
        page: page.value,
        pageSize: pageSize.value
      })
      if (res.code === 200) {
        if (page.value === 1) {
          userList.value = res.data.list || []
        } else {
          userList.value = [...userList.value, ...(res.data.list || [])]
        }
        loadStatus.value = res.data.list?.length < pageSize.value ? 'nomore' : 'loadmore'
      }
    }
  } catch (error) {
    console.error('加载收藏失败:', error)
    loadStatus.value = 'loadmore'
  } finally {
    loading.value = false
  }
}

const onRefresh = async () => {
  refreshing.value = true
  page.value = 1
  await loadFavorites()
  refreshing.value = false
}

const loadMore = () => {
  if (loadStatus.value === 'nomore') return
  page.value++
  loadFavorites()
}

const formatTime = (time) => {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 16)
}

const cancelFavorite = (type, id) => {
  uni.showModal({
    title: '取消收藏',
    content: '确定要取消收藏吗？',
    success: (res) => {
      if (res.confirm) {
        // 这里应该调用取消收藏接口
        if (type === 'activity') {
          activityList.value = activityList.value.filter(item => item.id !== id)
        } else {
          userList.value = userList.value.filter(item => item.userId !== id)
        }
        uni.showToast({ title: '已取消收藏', icon: 'none' })
      }
    }
  })
}

const goToActivityDetail = (id) => {
  uni.navigateTo({ url: `/pages/activity/detail?id=${id}` })
}

const goToUserDetail = (userId) => {
  uni.navigateTo({ url: `/pages/user/detail?userId=${userId}` })
}
</script>

<style scoped>
.favorites-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.content-list {
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

.activity-item .cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.activity-item .content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.activity-item .title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-item .info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.activity-item .time, .activity-item .location {
  font-size: 24rpx;
  color: #666;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.user-item .avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  margin-right: 20rpx;
}

.user-item .info {
  flex: 1;
}

.user-item .header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.user-item .nickname {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.gender-tag {
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #fff;
}

.gender-tag.male {
  background: #007AFF;
}

.gender-tag.female {
  background: #FF6B9D;
}

.age-tag {
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  background: #f0f0f0;
  color: #666;
}

.interests {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.interest-tag {
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background: #E8F4FF;
  color: #007AFF;
}

.action {
  padding: 20rpx;
}
</style>
