<template>
  <view class="topic-tag" :class="{ small: size === 'small', large: size === 'large' }" @click="onClick">
    <u-icon v-if="showIcon" name="tags-fill" :size="iconSize" color="#007AFF" />
    <text class="topic-name">#{{ topic.name }}</text>
    <text v-if="showCount" class="post-count">{{ topic.postCount || 0 }}</text>
  </view>
</template>

<script setup>
const props = defineProps({
  topic: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'normal' // small, normal, large
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  showCount: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const iconSize = props.size === 'small' ? 20 : props.size === 'large' ? 32 : 24

const onClick = () => {
  emit('click', props.topic)
}
</script>

<style scoped>
.topic-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 24rpx;
  transition: all 0.2s;
}

.topic-tag:active {
  background: rgba(0, 122, 255, 0.2);
}

.topic-tag.small {
  padding: 8rpx 16rpx;
}

.topic-tag.large {
  padding: 16rpx 28rpx;
}

.topic-name {
  font-size: 26rpx;
  color: #007AFF;
  font-weight: 500;
}

.topic-tag.small .topic-name {
  font-size: 22rpx;
}

.topic-tag.large .topic-name {
  font-size: 30rpx;
}

.post-count {
  font-size: 22rpx;
  color: #999;
  margin-left: 8rpx;
}
</style>
