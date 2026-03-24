<template>
  <view class="checkin-button" @click="handleClick">
    <view class="checkin-content" :class="{ checked: hasCheckinToday }">
      <u-icon 
        :name="hasCheckinToday ? 'checkmark' : 'calendar'" 
        :size="hasCheckinToday ? 32 : 36" 
        :color="hasCheckinToday ? '#07C160' : '#fff'" 
      />
      <text class="checkin-text">{{ hasCheckinToday ? '已签到' : '签到' }}</text>
    </view>
    <view v-if="!hasCheckinToday && consecutiveDays > 0" class="consecutive-badge">
      <text>{{ consecutiveDays }}天</text>
    </view>
    
    <!-- 签到成功动画 -->
    <view v-if="showAnimation" class="reward-animation">
      <view class="reward-content">
        <u-icon name="gift-fill" size="80" color="#FFD700" />
        <text class="reward-text">+{{ rewardAmount }}积分</text>
        <text class="reward-desc">连续签到{{ consecutiveDays }}天</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { checkinApi } from '@/api'

const emit = defineEmits(['checkin-success'])

const hasCheckinToday = ref(false)
const consecutiveDays = ref(0)
const showAnimation = ref(false)
const rewardAmount = ref(0)

onMounted(() => {
  loadCheckinStatus()
})

const loadCheckinStatus = async () => {
  try {
    const res = await checkinApi.getCheckinStatus()
    if (res.code === 200) {
      hasCheckinToday.value = res.data.hasCheckinToday
      consecutiveDays.value = res.data.consecutiveDays
    }
  } catch (error) {
    console.error('加载签到状态失败:', error)
  }
}

const handleClick = async () => {
  if (hasCheckinToday.value) {
    // 已签到，显示签到日历
    uni.navigateTo({ url: '/pages/user/checkin-records' })
    return
  }

  try {
    const res = await checkinApi.checkin()
    if (res.code === 200) {
      const result = res.data
      if (result.success) {
        hasCheckinToday.value = true
        consecutiveDays.value = result.consecutiveDays
        rewardAmount.value = result.rewardAmount
        
        // 显示动画
        showAnimation.value = true
        setTimeout(() => {
          showAnimation.value = false
        }, 2000)
        
        uni.showToast({ 
          title: `签到成功，获得${result.rewardAmount}积分`, 
          icon: 'success' 
        })
        
        emit('checkin-success', result)
      } else {
        uni.showToast({ title: result.message || '今日已签到', icon: 'none' })
      }
    }
  } catch (error) {
    console.error('签到失败:', error)
    uni.showToast({ title: '签到失败', icon: 'none' })
  }
}

// 暴露方法供父组件调用
defineExpose({
  loadCheckinStatus
})
</script>

<style scoped>
.checkin-button {
  position: relative;
  display: inline-block;
}

.checkin-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.4);
}

.checkin-content.checked {
  background: #f0f0f0;
  box-shadow: none;
}

.checkin-text {
  font-size: 20rpx;
  color: #fff;
  margin-top: 4rpx;
}

.checkin-content.checked .checkin-text {
  color: #07C160;
}

.consecutive-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.consecutive-badge text {
  font-size: 20rpx;
  color: #fff;
  font-weight: bold;
}

.reward-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.reward-content {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 80rpx;
  text-align: center;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.8);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

.reward-text {
  display: block;
  font-size: 48rpx;
  color: #FF9500;
  font-weight: bold;
  margin-top: 24rpx;
}

.reward-desc {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-top: 16rpx;
}
</style>
