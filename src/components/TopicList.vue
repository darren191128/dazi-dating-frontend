<template>
  <view class="topic-list">
    <view 
      v-for="topic in topics" 
      :key="topic.id"
      class="topic-item"
      @click="onTopicClick(topic)"
    >
      <image 
        :src="topic.icon || '/static/default-topic.png'" 
        mode="aspectFill" 
        class="topic-icon"
      />
      <view class="topic-info">
        <text class="topic-name">#{{ topic.name }}</text>
        <text class="topic-desc" v-if="topic.description">{{ topic.description }}</text>
        <view class="topic-stats">
          <text class="stat-item">{{ topic.postCount || 0 }} 帖子</text>
          <text class="stat-dot">·</text>
          <text class="stat-item">{{ topic.followCount || 0 }} 关注</text>
        </view>
      </view>
      <view 
        class="follow-btn"
        :class="{ followed: topic.isFollowed }"
        @click.stop="onFollowClick(topic)"
      >
        <text>{{ topic.isFollowed ? '已关注' : '关注' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  topics: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['topicClick', 'followClick'])

const onTopicClick = (topic) => {
  emit('topicClick', topic)
}

const onFollowClick = (topic) => {
  emit('followClick', topic)
}
</script>

<style scoped>
.topic-list {
  background: #fff;
}

.topic-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.topic-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  margin-right: 24rpx;
  background: #f5f5f5;
}

.topic-info {
  flex: 1;
  min-width: 0;
}

.topic-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.topic-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-stats {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.stat-item {
  font-size: 24rpx;
  color: #999;
}

.stat-dot {
  font-size: 24rpx;
  color: #ccc;
}

.follow-btn {
  padding: 12rpx 32rpx;
  background: #007AFF;
  border-radius: 30rpx;
  margin-left: 20rpx;
}

.follow-btn text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 500;
}

.follow-btn.followed {
  background: #f5f5f5;
}

.follow-btn.followed text {
  color: #999;
}
</style>
