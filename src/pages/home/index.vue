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
import UserCard from '@/components/UserCard.vue'

const userStore = useUserStore()

const searchKeyword = ref('')
const currentTab = ref(0)
const currentLocation = ref('')
const refreshing = ref(false)
const loadStatus = ref('loadmore')

const tabList = [
  { name: '附近的人' },
  { name: '推荐匹配' }
]

const nearbyUsers = ref([])
const recommendUsers = ref([])

onMounted(() => {
  getLocation()
  loadNearbyUsers()
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
  if (index === 0) {
    loadNearbyUsers()
  } else {
    loadRecommendUsers()
  }
}

const loadNearbyUsers = async () => {
  // 调用API获取附近的人
  // nearbyUsers.value = await api.match.getNearbyUsers(...)
}

const loadRecommendUsers = async () => {
  // 调用API获取推荐匹配
  // recommendUsers.value = await api.match.getRecommendations(...)
}

const onSearch = () => {
  uni.navigateTo({
    url: `/pages/search/index?keyword=${searchKeyword.value}`
  })
}

const onRefresh = async () => {
  refreshing.value = true
  if (currentTab.value === 0) {
    await loadNearbyUsers()
  } else {
    await loadRecommendUsers()
  }
  refreshing.value = false
}

const loadMore = () => {
  loadStatus.value = 'loading'
  // 加载更多数据
  setTimeout(() => {
    loadStatus.value = 'nomore'
  }, 1000)
}

const goToUserDetail = (userId) => {
  uni.navigateTo({ url: `/pages/user/detail?userId=${userId}` })
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
</style>
