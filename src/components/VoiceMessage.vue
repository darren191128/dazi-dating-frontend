<template>
  <view class="voice-message" :class="{ self: isSelf }" @click="togglePlay">
    <!-- 语音图标 -->
    <view class="voice-icon">
      <view class="wave" :class="{ playing: isPlaying }">
        <view class="bar" />
        <view class="bar" />
        <view class="bar" />
      </view>
    </view>
    
    <!-- 时长 -->
    <text class="duration">{{ duration }}"</text>
    
    <!-- 已读标记 -->
    <view v-if="isSelf && isRead" class="read-badge">
      <text>已读</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  isSelf: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['play', 'stop'])

const isPlaying = ref(false)
let innerAudioContext = null

const togglePlay = () => {
  if (isPlaying.value) {
    stopPlay()
  } else {
    startPlay()
  }
}

const startPlay = () => {
  // #ifdef MP-WEIXIN
  innerAudioContext = uni.createInnerAudioContext()
  innerAudioContext.src = props.src
  innerAudioContext.play()
  
  innerAudioContext.onPlay(() => {
    isPlaying.value = true
    emit('play')
  })
  
  innerAudioContext.onEnded(() => {
    isPlaying.value = false
    emit('stop')
  })
  
  innerAudioContext.onError(() => {
    isPlaying.value = false
    uni.showToast({ title: '播放失败', icon: 'none' })
  })
  // #endif
  
  // #ifdef H5
  const audio = new Audio(props.src)
  audio.play()
  isPlaying.value = true
  
  audio.onended = () => {
    isPlaying.value = false
    emit('stop')
  }
  
  audio.onerror = () => {
    isPlaying.value = false
    uni.showToast({ title: '播放失败', icon: 'none' })
  }
  // #endif
}

const stopPlay = () => {
  if (innerAudioContext) {
    innerAudioContext.stop()
    innerAudioContext.destroy()
    innerAudioContext = null
  }
  isPlaying.value = false
  emit('stop')
}

onUnmounted(() => {
  if (innerAudioContext) {
    innerAudioContext.destroy()
  }
})
</script>

<style scoped>
.voice-message {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 30rpx;
  background: #fff;
  border-radius: 16rpx;
  min-width: 140rpx;
}

.voice-message.self {
  background: #007AFF;
}

.voice-icon {
  display: flex;
  align-items: center;
}

.wave {
  display: flex;
  align-items: center;
  gap: 4rpx;
  height: 32rpx;
}

.bar {
  width: 6rpx;
  height: 16rpx;
  background: #999;
  border-radius: 3rpx;
  transition: all 0.3s;
}

.wave.playing .bar {
  background: #007AFF;
  animation: wave 0.6s ease-in-out infinite;
}

.voice-message.self .wave.playing .bar {
  background: rgba(255, 255, 255, 0.8);
}

.bar:nth-child(1) {
  animation-delay: 0s;
}

.bar:nth-child(2) {
  height: 24rpx;
  animation-delay: 0.2s;
}

.bar:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes wave {
  0%, 100% {
    transform: scaleY(0.6);
  }
  50% {
    transform: scaleY(1);
  }
}

.duration {
  font-size: 28rpx;
  color: #666;
}

.voice-message.self .duration {
  color: rgba(255, 255, 255, 0.9);
}

.read-badge {
  position: absolute;
  bottom: -30rpx;
  right: 0;
}

.read-badge text {
  font-size: 20rpx;
  color: #999;
}
</style>
