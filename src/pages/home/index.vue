<template>
  <view class="home-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <u-search 
        v-model="searchKeyword" 
        placeholder="搜索用户或活动" 
        :show-action="false"
        @search="onSearch"
      />
    </view>
    
    <!-- 位置信息 -->
    <view class="location-bar" @click="chooseLocation">
      <u-icon name="map-fill" size="16" color="#007AFF" />
      <text class="location-text">{{ currentLocation || '定位中...' }}</text>
      <u-icon name="arrow-right" size="14" color="#999" />
    </view>
    
    <!-- 每日精选 -->
    <view class="daily-picks-section" v-if="dailyPicks.length > 0">
      <view class="section-header">
        <text class="section-title">每日精选</text>
        <text class="section-more" @click="goToMatch">查看更多</text>
      </view>
      <scroll-view scroll-x class="daily-picks-scroll" show-scrollbar="false">
        <view class="daily-picks-list">
          <DailyPickCard 
            v-for="user in dailyPicks" 
            :key="user.userId"
            :user="user"
            @click="goToUserDetail(user.userId)"
            @like="handleLike(user)"
            @viewDetail="goToUserDetail(user.userId)"
          />
        </view>
      </scroll-view>
    </view>
    
    <!-- Tab切换 -->
    <u-tabs 
      :list="tabList" 
      :current="currentTab" 
      @change="onTabChange"
      active-color="#007AFF"
    />
    
    <!-- 用户列表 -->
    <scroll-view 
      scroll-y 
      class="user-list"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="currentTab === 0">
        <UserCard 
          v-for="user in nearbyUsers" 
          :key="user.userId"
          :user="user"
          @click="goToUserDetail(user.userId)"
        />
      </view>
      
      <view v-else>
        <UserCard 
          v-for="user in recommendUsers" 
          :key="user.userId"
          :user="user"
          :show-match-score="true"
          @click="goToUserDetail(user.userId)"
        />
      </view>
      
      <u-loadmore :status="loadStatus" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { matchApi } from '@/api'
import UserCard from '@/components/UserCard.vue'
import DailyPickCard from '@/components/DailyPickCard.vue'

const userStore = useUserStore()

const searchKeyword = ref('')
const currentTab = ref(0)
const currentLocation = ref('')
const refreshing = ref(false)
const loadStatus = ref('loadmore')
const page = ref(1)
const pageSize = ref(10)

const tabList = [
  { name: '附近的人' },
  { name: '推荐匹配' }
]

const nearbyUsers = ref([])
const recommendUsers = ref([])
const dailyPicks = ref([])

onMounted(() => {
  getLocation()
  loadNearbyUsers()
  loadDailyPicks()
})

const getLocation = () => {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      // 逆地理编码获取位置名称
      currentLocation.value = '北京市朝阳区'
      userStore.setLocation(res.longitude, res.latitude)
    },
    fail: () => {
      currentLocation.value = '定位失败'
    }
  })
}

const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      currentLocation.value = res.name
      userStore.setLocation(res.longitude, res.latitude)
      loadNearbyUsers()
    }
  })
}

const onTabChange = (index) => {
  currentTab.value = index
  page.value = 1
  if (index === 0) {
    nearbyUsers.value = []
    loadNearbyUsers()
  } else {
    recommendUsers.value = []
    loadRecommendUsers()
  }
}

const loadNearbyUsers = async () => {
  try {
    loadStatus.value = 'loading'
    const { longitude, latitude } = userStore.location || { longitude: 116.4074, latitude: 39.9042 }
    const res = await matchApi.getNearbyUsers({
      longitude,
      latitude,
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      if (page.value === 1) {
        nearbyUsers.value = res.data.list || []
      } else {
        nearbyUsers.value = [...nearbyUsers.value, ...(res.data.list || [])]
      }
      loadStatus.value = res.data.list?.length < pageSize.value ? 'nomore' : 'loadmore'
    }
  } catch (error) {
    console.error('加载附近用户失败:', error)
    loadStatus.value = 'loadmore'
  }
}

const loadRecommendUsers = async () => {
  try {
    loadStatus.value = 'loading'
    const res = await matchApi.getRecommendations({
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      if (page.value === 1) {
        recommendUsers.value = res.data.list || []
      } else {
        recommendUsers.value = [...recommendUsers.value, ...(res.data.list || [])]
      }
      loadStatus.value = res.data.list?.length < pageSize.value ? 'nomore' : 'loadmore'
    }
  } catch (error) {
    console.error('加载推荐用户失败:', error)
    loadStatus.value = 'loadmore'
  }
}

const onSearch = () => {
  uni.navigateTo({
    url: `/pages/search/index?keyword=${searchKeyword.value}`
  })
}

const onRefresh = async () => {
  refreshing.value = true
  page.value = 1
  if (currentTab.value === 0) {
    await loadNearbyUsers()
  } else {
    await loadRecommendUsers()
  }
  refreshing.value = false
}

const loadMore = () => {
  if (loadStatus.value === 'nomore') return
  page.value++
  if (currentTab.value === 0) {
    loadNearbyUsers()
  } else {
    loadRecommendUsers()
  }
}

const goToUserDetail = (userId) => {
  uni.navigateTo({ url: `/pages/user/detail?userId=${userId}` })
}

const loadDailyPicks = async () => {
  try {
    const res = await matchApi.getDailyPicks({ limit: 10 })
    if (res.code === 200) {
      dailyPicks.value = res.data || []
    }
  } catch (error) {
    console.error('加载每日精选失败:', error)
  }
}

const handleLike = async (user) => {
  try {
    const res = await matchApi.like(user.userId)
    if (res.code === 200) {
      uni.showToast({ title: '已喜欢', icon: 'success' })
    }
  } catch (error) {
    console.error('喜欢失败:', error)
  }
}

const goToMatch = () => {
  uni.switchTab({ url: '/pages/match/index' })
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  padding: 20rpx;
  background: #fff;
}

.location-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.location-text {
  flex: 1;
  margin: 0 10rpx;
  font-size: 26rpx;
  color: #333;
}

.user-list {
  height: calc(100vh - 200rpx);
  padding: 20rpx;
}

.daily-picks-section {
  background: #fff;
  padding: 30rpx 0;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #007AFF;
}

.daily-picks-scroll {
  white-space: nowrap;
}

.daily-picks-list {
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx;
}
</style>
