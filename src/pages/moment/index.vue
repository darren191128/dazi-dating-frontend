<template>
  <view class="moment-container">
    <!-- 顶部Tab切换 -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 0 }"
        @click="switchTab(0)"
      >
        <text>广场</text>
        <view v-if="currentTab === 0" class="tab-line" />
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 1 }"
        @click="switchTab(1)"
      >
        <text>热门</text>
        <view v-if="currentTab === 1" class="tab-line" />
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 2 }"
        @click="switchTab(2)"
      >
        <text>关注</text>
        <view v-if="currentTab === 2" class="tab-line" />
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 3 }"
        @click="switchTab(3)"
      >
        <text>话题</text>
        <view v-if="currentTab === 3" class="tab-line" />
      </view>
    </view>
    
    <!-- 动态列表 -->
    <scroll-view 
      scroll-y 
      class="moment-list"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="momentList.length > 0">
        <MomentCard 
          v-for="moment in momentList" 
          :key="moment.id"
          :moment="moment"
          @like="handleLike"
          @comment="goToDetail"
          @click="goToDetail(moment)"
        />
      </view>
      
      <u-empty v-else mode="list" text="暂无动态" />
      
      <u-loadmore :status="loadStatus" />
    </scroll-view>
    
    <!-- 发布按钮 -->
    <view class="publish-btn" @click="goToPublish">
      <u-icon name="plus" size="32" color="#fff" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { momentApi } from '@/api'
import MomentCard from '@/components/MomentCard.vue'

const currentTab = ref(0)
const refreshing = ref(false)
const loadStatus = ref('loadmore')
const page = ref(1)
const pageSize = ref(10)
const momentList = ref([])

onMounted(() => {
  loadMoments()
})

const switchTab = (index) => {
  if (currentTab.value === index) return
  currentTab.value = index
  page.value = 1
  momentList.value = []
  loadMoments()
}

const loadMoments = async () => {
  try {
    loadStatus.value = 'loading'
    let api
    switch (currentTab.value) {
      case 0:
        api = momentApi.getSquareMoments
        break
      case 1:
        api = momentApi.getHotMoments
        break
      case 2:
        api = momentApi.getFollowingMoments
        break
      case 3:
        goToTopics()
        return
      default:
        api = momentApi.getSquareMoments
    }
    const res = await api({
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      if (page.value === 1) {
        momentList.value = res.data.list || []
      } else {
        momentList.value = [...momentList.value, ...(res.data.list || [])]
      }
      loadStatus.value = res.data.list?.length < pageSize.value ? 'nomore' : 'loadmore'
    }
  } catch (error) {
    console.error('加载动态失败:', error)
    loadStatus.value = 'loadmore'
  }
}

const goToTopics = () => {
  uni.navigateTo({ url: '/pages/topic/index' })
}

const onRefresh = async () => {
  refreshing.value = true
  page.value = 1
  await loadMoments()
  refreshing.value = false
}

const loadMore = () => {
  if (loadStatus.value === 'nomore') return
  page.value++
  loadMoments()
}

const handleLike = async (moment) => {
  try {
    const res = await momentApi.likeMoment(moment.id)
    if (res.code === 200) {
      moment.isLiked = !moment.isLiked
      moment.likeCount += moment.isLiked ? 1 : -1
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const goToDetail = (moment) => {
  uni.navigateTo({ url: `/pages/moment/detail?id=${moment.id}` })
}

const goToPublish = () => {
  uni.navigateTo({ url: '/pages/moment/publish' })
}
</script>

<style scoped>
.moment-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.tab-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx 0;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  position: relative;
  padding: 0 40rpx;
  font-size: 32rpx;
  color: #666;
  font-weight: 500;
}

.tab-item.active {
  color: #333;
  font-weight: bold;
}

.tab-line {
  position: absolute;
  bottom: -20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background: #007AFF;
  border-radius: 3rpx;
}

.moment-list {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}

.publish-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}
</style>
