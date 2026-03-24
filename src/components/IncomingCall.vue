<template>
  <view class="incoming-call-overlay" v-if="visible">
    <view class="call-bg">
      <image class="bg-image" :src="callerAvatar" mode="aspectFill" />
      <view class="bg-mask"></view>
    </view>
    
    <view class="call-content">
      <image class="caller-avatar" :src="callerAvatar" mode="aspectFill" />
      <text class="caller-name">{{ callerName }}</text>
      <text class="call-type">{{ callType === 2 ? '视频通话' : '语音通话' }}</text>
      
      <!-- 铃声动画 -->
      <view class="ring-animation">
        <view class="ring-ring ring-1"></view>
        <view class="ring-ring ring-2"></view>
        <view class="ring-ring ring-3"></view>
      </view>
    </view>
    
    <view class="call-actions">
      <view class="action-btn reject" @click="reject">
        <u-icon name="phone-down" size="48" color="#fff" />
        <text>拒绝</text>
      </view>
      <view class="action-btn accept" @click="accept">
        <u-icon name="phone-fill" size="48" color="#fff" />
        <text>接听</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { rtcApi } from '@/api/rtc-group'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  callId: {
    type: String,
    default: ''
  },
  callType: {
    type: Number,
    default: 1
  },
  callerId: {
    type: String,
    default: ''
  },
  callerName: {
    type: String,
    default: ''
  },
  callerAvatar: {
    type: String,
    default: '/static/default-avatar.png'
  },
  roomId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['accept', 'reject', 'close'])

// 接听
const accept = async () => {
  try {
    const res = await rtcApi.acceptCall(props.callId)
    if (res.code === 200) {
      emit('accept', {
        callId: props.callId,
        callType: props.callType,
        roomId: props.roomId,
        callerId: props.callerId,
        callerName: props.callerName,
        callerAvatar: props.callerAvatar
      })
      emit('close')
    } else {
      uni.showToast({ title: res.message || '接听失败', icon: 'none' })
    }
  } catch (error) {
    console.error('接听失败:', error)
    uni.showToast({ title: '接听失败', icon: 'none' })
  }
}

// 拒绝
const reject = async () => {
  try {
    await rtcApi.rejectCall(props.callId)
    emit('reject')
    emit('close')
  } catch (error) {
    console.error('拒绝失败:', error)
    emit('close')
  }
}
</script>

<style scoped>
.incoming-call-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.call-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.bg-image {
  width: 100%;
  height: 100%;
  filter: blur(20rpx);
}

.bg-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
}

.call-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.caller-avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.caller-name {
  margin-top: 40rpx;
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.call-type {
  margin-top: 20rpx;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
}

.ring-animation {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin-top: 60rpx;
}

.ring-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  animation: ring 2s infinite;
}

.ring-1 {
  width: 200rpx;
  height: 200rpx;
  animation-delay: 0s;
}

.ring-2 {
  width: 280rpx;
  height: 280rpx;
  animation-delay: 0.5s;
}

.ring-3 {
  width: 360rpx;
  height: 360rpx;
  animation-delay: 1s;
}

@keyframes ring {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.call-actions {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-around;
  padding: 60rpx 80rpx;
  padding-bottom: 120rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.action-btn text {
  font-size: 28rpx;
  color: #fff;
}

.reject {
  background: #ff4444;
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.accept {
  background: #4CAF50;
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
