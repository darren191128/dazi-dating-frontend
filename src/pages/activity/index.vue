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
import { activityApi } from '@/api'
import ActivityCard from '@/components/ActivityCard.vue'

const currentType = ref(0)
const refreshing = ref(false)
const loadStatus = ref('loadmore')
const activityList = ref([])
const page = ref(1)
const pageSize = ref(10)

const typeList = [
  { name: '全部', code: '' },
  { name: '吃喝玩乐', code: 'dining' },
  { name: '户外游玩', code: 'outdoor' },
  { name: '亲子活动', code: 'family' },
  { name: '户外运动', code: 'sports' },
  { name: '相亲交友', code: 'dating' }
]

onMounted(() => {
  loadActivities()
})

const onTypeChange = (index) => {
  currentType.value = index
  page.value = 1
  activityList.value = []
  loadActivities()
}

const loadActivities = async () => {
  try {
    loadStatus.value = 'loading'
    const typeCode = typeList[currentType.value].code
    const res = await activityApi.getActivityList({
      type: typeCode,
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
