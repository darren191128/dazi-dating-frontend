<template>
  <view class="activity-container">
    <!-- 分类Tab -->
    <u-tabs 
      :list="typeList" 
      :current="currentType" 
      @change="onTypeChange"
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
      <ActivityCard 
        v-for="activity in activityList" 
        :key="activity.id"
        :activity="activity"
        @click="goToDetail(activity.id)"
      />
      
      <u-loadmore :status="loadStatus" />
    </scroll-view>
    
    <!-- 发布按钮 -->
    <view class="fab-btn" @click="goToCreate">
      <u-icon name="plus" size="24" color="#fff" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ActivityCard from '@/components/ActivityCard.vue'

const currentType = ref(0)
const refreshing = ref(false)
const loadStatus = ref('loadmore')
const activityList = ref([])

const typeList = [
  { name: '全部' },
  { name: '吃喝玩乐' },
  { name: '户外游玩' },
  { name: '亲子活动' },
  { name: '户外运动' },
  { name: '相亲交友' }
]

onMounted(() => {
  loadActivities()
})

const onTypeChange = (index) => {
  currentType.value = index
  loadActivities()
}

const loadActivities = async () => {
  // 调用API获取活动列表
  // activityList.value = await api.activity.getList({ type: currentType.value })
  
  // 模拟数据
  activityList.value = [
    {
      id: 1,
      title: '周末聚餐，AA制',
      typeName: '吃喝玩乐',
      location: '朝阳区三里屯',
      startTime: '2024-03-25 18:00',
      currentParticipants: 3,
      maxParticipants: 8,
      paymentType: 1,
      perPersonAmount: 150,
      coverImage: '/static/activity1.jpg'
    },
    {
      id: 2,
      title: '羽毛球约起来',
      typeName: '户外运动',
      location: '朝阳区奥体中心',
      startTime: '2024-03-26 14:00',
      currentParticipants: 2,
      maxParticipants: 6,
      paymentType: 1,
      perPersonAmount: 50,
      coverImage: '/static/activity2.jpg'
    }
  ]
}

const onRefresh = async () => {
  refreshing.value = true
  await loadActivities()
  refreshing.value = false
}

const loadMore = () => {
  loadStatus.value = 'loading'
  setTimeout(() => {
    loadStatus.value = 'nomore'
  }, 1000)
}

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/activity/detail?id=${id}` })
}

const goToCreate = () => {
  uni.navigateTo({ url: '/pages/activity/create' })
}
</script>

<style scoped>
.activity-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.activity-list {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
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
