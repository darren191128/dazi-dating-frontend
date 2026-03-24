<template>
  <view class="visitors-container">
    <!-- 标题栏 -->
    <view class="header">
      <text class="header-title">访客记录</text>
      <text class="header-count">共 {{ total }} 位访客</text>
    </view>
    
    <!-- 访客列表 -->
    <scroll-view 
      scroll-y 
      class="visitor-list"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="visitors.length > 0">
        <view 
          v-for="visitor in visitors" 
          :key="visitor.userId"
          class="visitor-item"
        >
          <image 
            :src="visitor.avatar || '/static/default-avatar.png'" 
            mode="aspectFill" 
            class="visitor-avatar"
            @click="goToUserDetail(visitor.userId)"
          />
          <view class="visitor-info" @click="goToUserDetail(visitor.userId)">
            <text class="visitor-nickname">{{ visitor.nickname }}</text>
            <text class="visitor-time">{{ visitor.visitTime }}</text>
          </view>
          <u-button 
            v-if="!visitor.isFollowing"
            type="primary" 
            size="small"
            @click="followUser(visitor)"
          >
            关注
          </u-button>
          <text v-else class="followed-text">已关注</text>
        </view>
      </view>
      
      <view v-else class="empty-state">
        <u-empty mode="list" text="还没有人访问过你" />
        <text class="empty-tip">多发布动态，让更多人发现你吧~</text>
      </view>
      
      <u-loadmore :status="loadStatus" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { visitorApi, followApi } from '@/api'

const visitors = ref([])
const total = ref(0)
const refreshing = ref(false)
const loadStatus = ref('loadmore')
const page = ref(1)
const pageSize = ref(20)

onMounted(() => {
  loadVisitors()
})

const loadVisitors = async () => {
  try {
    loadStatus.value = 'loading'
    const res = await visitorApi.getVisitors({
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      if (page.value === 1) {
        visitors.value = res.data.list || []
      } else {
        visitors.value = [...visitors.value, ...(res.data.list || [])]
      }
      total.value = res.data.total || 0
      loadStatus.value = res.data.list?.length < pageSize.value ? 'nomore' : 'loadmore'
    }
  } catch (error) {
    console.error('加载访客记录失败:', error)
    loadStatus.value = 'loadmore'
  }
}

const onRefresh = async () => {
  refreshing.value = true
  page.value = 1
  await loadVisitors()
  refreshing.value = false
}

const loadMore = () => {
  if (loadStatus.value === 'nomore') return
  page.value++
  loadVisitors()
}

const followUser = async (visitor) => {
  try {
    const res = await followApi.follow(visitor.userId)
    if (res.code === 200) {
      visitor.isFollowing = true
      uni.showToast({ title: '关注成功', icon: 'success' })
    }
  } catch (error) {
    console.error('关注失败:', error)
    uni.showToast({ title: '关注失败', icon: 'none' })
  }
}

const goToUserDetail = (userId) => {
  uni.navigateTo({ url: `/pages/user/detail?userId=${userId}` })
}
</script>

<style scoped>
.visitors-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.header-count {
  font-size: 26rpx;
  color: #999;
}

.visitor-list {
  height: calc(100vh - 120rpx);
  padding: 20rpx;
}

.visitor-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.visitor-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.visitor-info {
  flex: 1;
}

.visitor-nickname {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.visitor-time {
  font-size: 26rpx;
  color: #999;
}

.followed-text {
  font-size: 26rpx;
  color: #999;
  padding: 0 20rpx;
}

.empty-state {
  padding-top: 200rpx;
  text-align: center;
}

.empty-tip {
  display: block;
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #999;
}
</style>
