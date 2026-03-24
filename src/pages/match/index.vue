<template>
  <view class="match-container">
    <!-- 顶部筛选栏 -->
    <view class="filter-bar">
      <view class="filter-btn" @click="showFilterPanel = true">
        <u-icon name="filter-fill" size="32" color="#666" />
        <text>筛选</text>
      </view>
    </view>
    
    <!-- 筛选面板 -->
    <FilterPanel 
      :visible="showFilterPanel" 
      @close="showFilterPanel = false"
      @confirm="onFilterConfirm"
    />
    
    <!-- 卡片堆叠区域 -->
    <view class="card-stack">
      <view v-if="cards.length === 0 && !loading" class="empty-state">
        <u-empty mode="list" text="暂时没有更多推荐" />
        <u-button type="primary" size="small" @click="reloadCards" style="margin-top: 40rpx;">
          重新加载
        </u-button>
      </view>
      
      <template v-else>
        <!-- 后面的卡片（预览） -->
        <view 
          v-for="(card, index) in cards.slice(1, 3)" 
          :key="card.userId"
          class="card-wrapper behind"
          :style="getBehindStyle(index)"
        >
          <SwipeCard :user="card" :disabled="true" />
        </view>
        
        <!-- 当前卡片 -->
        <view 
          v-if="cards[0]"
          class="card-wrapper front"
          :style="cardStyle"
          @touchstart="touchStart"
          @touchmove="touchMove"
          @touchend="touchEnd"
        >
          <SwipeCard :user="cards[0]" />
          
          <!-- 滑动指示器 -->
          <view class="swipe-indicator like" :class="{ show: translateX > 50 }">
            <text>喜欢</text>
          </view>
          <view class="swipe-indicator dislike" :class="{ show: translateX < -50 }">
            <text>不喜欢</text>
          </view>
          <view class="swipe-indicator super-like" :class="{ show: translateY < -50 }">
            <text>超级喜欢</text>
          </view>
        </view>
      </template>
    </view>
    
    <!-- 底部按钮 -->
    <view class="action-buttons">
      <view class="action-btn dislike-btn" @click="handleDislike">
        <u-icon name="close" size="48" color="#FF6B6B" />
      </view>
      <view class="action-btn super-like-btn" @click="handleSuperLike">
        <u-icon name="star-fill" size="40" color="#FFD93D" />
      </view>
      <view class="action-btn like-btn" @click="handleLike">
        <u-icon name="heart-fill" size="48" color="#4ECDC4" />
      </view>
    </view>
    
    <!-- 匹配成功弹窗 -->
    <u-popup :show="showMatchModal" mode="center" round="20" :overlay-opacity="0.8">
      <view class="match-modal">
        <text class="match-title">匹配成功！</text>
        <text class="match-subtitle">你们互相喜欢了对方</text>
        
        <view class="match-avatars">
          <image :src="currentUser?.avatar" mode="aspectFill" class="avatar" />
          <view class="heart-icon">
            <u-icon name="heart-fill" size="40" color="#FF6B6B" />
          </view>
          <image :src="matchedUser?.avatar" mode="aspectFill" class="avatar" />
        </view>
        
        <view class="match-actions">
          <u-button type="primary" size="large" @click="goToChat">
            立即聊天
          </u-button>
          <u-button type="default" size="large" plain @click="continueBrowsing">
            继续浏览
          </u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { matchApi } from '@/api'
import SwipeCard from '@/components/SwipeCard.vue'
import FilterPanel from '@/components/FilterPanel.vue'

const userStore = useUserStore()
const cards = ref([])
const loading = ref(false)
const showMatchModal = ref(false)
const showFilterPanel = ref(false)
const currentFilter = ref({})
const matchedUser = ref(null)
const currentUser = computed(() => userStore.userInfo)

// 滑动相关
const startX = ref(0)
const startY = ref(0)
const translateX = ref(0)
const translateY = ref(0)
const rotate = ref(0)

const cardStyle = computed(() => {
  return {
    transform: `translateX(${translateX.value}px) translateY(${translateY.value}px) rotate(${rotate.value}deg)`,
    transition: translateX.value === 0 && translateY.value === 0 ? 'transform 0.3s ease' : 'none'
  }
})

const getBehindStyle = (index) => {
  const scale = 1 - (index + 1) * 0.05
  const translateY = (index + 1) * 10
  return {
    transform: `scale(${scale}) translateY(${translateY}px)`,
    zIndex: 10 - index
  }
}

onMounted(() => {
  loadCards()
})

const loadCards = async () => {
  try {
    loading.value = true
    const params = {
      pageSize: 10,
      ...currentFilter.value
    }
    const res = await matchApi.getSwipeRecommendations(params)
    if (res.code === 200) {
      cards.value = [...cards.value, ...(res.data.list || [])]
    }
  } catch (error) {
    console.error('加载推荐失败:', error)
  } finally {
    loading.value = false
  }
}

const onFilterConfirm = (filters) => {
  currentFilter.value = filters
  showFilterPanel.value = false
  cards.value = []
  loadCards()
}

const reloadCards = () => {
  cards.value = []
  loadCards()
}

const touchStart = (e) => {
  startX.value = e.touches[0].clientX
  startY.value = e.touches[0].clientY
}

const touchMove = (e) => {
  const moveX = e.touches[0].clientX - startX.value
  const moveY = e.touches[0].clientY - startY.value
  
  translateX.value = moveX
  translateY.value = moveY
  rotate.value = moveX * 0.1
}

const touchEnd = () => {
  const threshold = 100
  
  if (translateX.value > threshold) {
    // 右滑 - 喜欢
    swipeCard('like')
  } else if (translateX.value < -threshold) {
    // 左滑 - 不喜欢
    swipeCard('dislike')
  } else if (translateY.value < -threshold) {
    // 上滑 - 超级喜欢
    swipeCard('superLike')
  } else {
    // 回弹
    translateX.value = 0
    translateY.value = 0
    rotate.value = 0
  }
}

const swipeCard = async (type) => {
  const card = cards.value[0]
  if (!card) return
  
  // 动画效果
  if (type === 'like') {
    translateX.value = 500
  } else if (type === 'dislike') {
    translateX.value = -500
  } else if (type === 'superLike') {
    translateY.value = -500
  }
  
  // 发送请求
  try {
    const res = await matchApi.swipeAction({
      targetUserId: card.userId,
      action: type
    })
    
    if (res.code === 200 && res.data.isMatch) {
      matchedUser.value = card
      showMatchModal.value = true
    }
  } catch (error) {
    console.error('滑动操作失败:', error)
  }
  
  // 移除卡片
  setTimeout(() => {
    cards.value.shift()
    translateX.value = 0
    translateY.value = 0
    rotate.value = 0
    
    // 卡片不足时加载更多
    if (cards.value.length < 3) {
      loadCards()
    }
  }, 300)
}

const handleDislike = () => {
  swipeCard('dislike')
}

const handleLike = () => {
  swipeCard('like')
}

const handleSuperLike = () => {
  swipeCard('superLike')
}

const goToChat = () => {
  showMatchModal.value = false
  uni.navigateTo({
    url: `/pages/message/chat?userId=${matchedUser.value.userId}&nickname=${matchedUser.value.nickname}`
  })
}

const continueBrowsing = () => {
  showMatchModal.value = false
  matchedUser.value = null
}
</script>

<style scoped>
.match-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx 30rpx;
  background: #fff;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
}

.filter-btn text {
  font-size: 26rpx;
  color: #666;
}

.card-stack {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.card-wrapper {
  position: absolute;
  width: 100%;
  max-width: 600rpx;
}

.card-wrapper.front {
  z-index: 20;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.swipe-indicator {
  position: absolute;
  top: 60rpx;
  padding: 16rpx 32rpx;
  border-radius: 16rpx;
  border: 4rpx solid;
  font-size: 36rpx;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.2s;
}

.swipe-indicator.show {
  opacity: 1;
}

.swipe-indicator.like {
  right: 40rpx;
  color: #4ECDC4;
  border-color: #4ECDC4;
  transform: rotate(15deg);
}

.swipe-indicator.dislike {
  left: 40rpx;
  color: #FF6B6B;
  border-color: #FF6B6B;
  transform: rotate(-15deg);
}

.swipe-indicator.super-like {
  top: 100rpx;
  left: 50%;
  transform: translateX(-50%);
  color: #FFD93D;
  border-color: #FFD93D;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60rpx;
  padding: 60rpx 40rpx;
}

.action-btn {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.action-btn:active {
  transform: scale(0.95);
}

.dislike-btn {
  background: #fff;
}

.super-like-btn {
  width: 100rpx;
  height: 100rpx;
  background: #fff;
}

.like-btn {
  background: #fff;
}

.match-modal {
  width: 600rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  background: #fff;
}

.match-title {
  display: block;
  font-size: 52rpx;
  font-weight: bold;
  color: #FF6B6B;
  margin-bottom: 16rpx;
}

.match-subtitle {
  display: block;
  font-size: 30rpx;
  color: #666;
  margin-bottom: 60rpx;
}

.match-avatars {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30rpx;
  margin-bottom: 60rpx;
}

.match-avatars .avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.heart-icon {
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.match-actions {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
</style>
