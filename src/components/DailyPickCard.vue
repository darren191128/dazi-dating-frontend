<template>
  <view class="daily-pick-card" @click="onClick">
    <image 
      :src="user.avatar || '/static/default-avatar.png'" 
      mode="aspectFill" 
      class="user-avatar"
    />
    <view class="match-badge">
      <text class="match-percent">{{ user.matchPercent || 85 }}%</text>
      <text class="match-label">匹配度</text>
    </view>
    <view class="user-info">
      <text class="nickname">{{ user.nickname }}</text>
      <text class="user-meta">{{ user.age }}岁 · {{ user.distance }}km</text>
    </view>
    <view class="quick-actions">
      <view class="action-btn like-btn" @click.stop="onLike">
        <u-icon name="heart-fill" size="32" color="#fff" />
      </view>
      <view class="action-btn detail-btn" @click.stop="onViewDetail">
        <u-icon name="eye-fill" size="32" color="#fff" />
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'like', 'viewDetail'])

const onClick = () => {
  emit('click', props.user)
}

const onLike = () => {
  emit('like', props.user)
}

const onViewDetail = () => {
  emit('viewDetail', props.user)
}
</script>

<style scoped>
.daily-pick-card {
  position: relative;
  width: 280rpx;
  height: 380rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.user-avatar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.match-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  border-radius: 24rpx;
  padding: 12rpx 20rpx;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.match-percent {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  line-height: 1;
}

.match-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4rpx;
}

.user-info {
  position: absolute;
  bottom: 100rpx;
  left: 20rpx;
  right: 20rpx;
  z-index: 2;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 8rpx;
}

.user-meta {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.quick-actions {
  position: absolute;
  bottom: 20rpx;
  left: 20rpx;
  right: 20rpx;
  display: flex;
  gap: 16rpx;
  z-index: 2;
}

.action-btn {
  flex: 1;
  height: 64rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.like-btn {
  background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
}

.detail-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
