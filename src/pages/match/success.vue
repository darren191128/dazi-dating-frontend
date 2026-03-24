<template>
  <view class="success-container">
    <view class="success-content">
      <!-- 标题 -->
      <text class="success-title">匹配成功！</text>
      
      <!-- 头像展示 -->
      <view class="avatars-section">
        <view class="avatar-wrapper">
          <image :src="currentUser?.avatar" mode="aspectFill" class="avatar" />
        </view>
        
        <view class="heart-animation">
          <u-icon name="heart-fill" size="60" color="#FF6B6B" />
          <view class="heart-pulse" />
        </view>
        
        <view class="avatar-wrapper">
          <image :src="matchedUser?.avatar" mode="aspectFill" class="avatar" />
        </view>
      </view>
      
      <!-- 提示文字 -->
      <text class="success-text">你们互相喜欢了对方</text>
      
      <!-- 按钮 -->
      <view class="action-buttons">
        <u-button type="primary" size="large" @click="goToChat">
          立即聊天
        </u-button>
        <u-button type="default" size="large" plain @click="continueBrowsing">
          继续浏览
        </u-button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const currentUser = computed(() => userStore.userInfo)
const matchedUser = ref(null)

onLoad((options) => {
  if (options.userData) {
    try {
      matchedUser.value = JSON.parse(decodeURIComponent(options.userData))
    } catch (e) {
      console.error('解析用户数据失败:', e)
    }
  }
})

const goToChat = () => {
  if (!matchedUser.value) return
  uni.navigateTo({
    url: `/pages/message/chat?userId=${matchedUser.value.userId}&nickname=${matchedUser.value.nickname}`
  })
}

const continueBrowsing = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.success-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

.success-content {
  width: 100%;
  text-align: center;
}

.success-title {
  display: block;
  font-size: 64rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 80rpx;
  text-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.avatars-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40rpx;
  margin-bottom: 60rpx;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 8rpx solid #fff;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.heart-animation {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 107, 107, 0.3);
  border-radius: 50%;
  animation: pulse 1.5s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.success-text {
  display: block;
  font-size: 34rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 80rpx;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}
</style>
