<template>
  <view class="message-item" :class="{ 'self': isSelf }">
    <image
      class="avatar"
      :src="avatar"
      mode="aspectFill"
      @click="$emit('click-avatar')"
    />
    <view class="content">
      <text class="sender-name" v-if="!isSelf">{{ senderName }}</text>
      
      <!-- 文本消息 -->
      <view v-if="messageType === 1" class="bubble">
        <text class="text">{{ content }}</text>
        <view v-if="atUserIds && atUserIds.length > 0" class="at-hint">
          <text>@{{ atUserNames }}</text>
        </view>
      </view>
      
      <!-- 图片消息 -->
      <image
        v-else-if="messageType === 2"
        class="image-msg"
        :src="imageUrl"
        mode="widthFix"
        @click="$emit('preview-image', imageUrl)"
      />
      
      <!-- 语音消息 -->
      <view v-else-if="messageType === 3" class="voice-msg" @click="$emit('play-voice')">
        <u-icon :name="isPlaying ? 'pause' : 'play-right'" size="32" color="#333" />
        <text class="duration">{{ voiceDuration }}"</text>
      </view>
      
      <text class="time">{{ formatTime }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isSelf: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: '/static/default-avatar.png'
  },
  senderName: {
    type: String,
    default: ''
  },
  messageType: {
    type: Number,
    default: 1
  },
  content: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  voiceUrl: {
    type: String,
    default: ''
  },
  voiceDuration: {
    type: Number,
    default: 0
  },
  atUserIds: {
    type: Array,
    default: () => []
  },
  atUserNames: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  },
  isPlaying: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click-avatar', 'preview-image', 'play-voice'])

const formatTime = computed(() => {
  if (!props.time) return ''
  const date = new Date(props.time)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
})
</script>

<style scoped>
.message-item {
  display: flex;
  margin-bottom: 30rpx;
}

.message-item.self {
  flex-direction: row-reverse;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
  flex-shrink: 0;
}

.content {
  max-width: 60%;
  margin: 0 20rpx;
}

.sender-name {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.bubble {
  display: inline-block;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
}

.message-item.self .bubble {
  background: #007AFF;
}

.text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.4;
}

.message-item.self .text {
  color: #fff;
}

.at-hint {
  margin-top: 8rpx;
  padding: 4rpx 12rpx;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8rpx;
  display: inline-block;
}

.at-hint text {
  font-size: 22rpx;
  color: #007AFF;
}

.image-msg {
  max-width: 300rpx;
  border-radius: 16rpx;
}

.voice-msg {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 30rpx;
  background: #fff;
  border-radius: 16rpx;
  min-width: 120rpx;
}

.message-item.self .voice-msg {
  background: #007AFF;
}

.voice-msg .duration {
  font-size: 28rpx;
  color: #333;
}

.message-item.self .voice-msg .duration {
  color: #fff;
}

.time {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}
</style>
