<template>
  <view class="user-card" @click="$emit('click')">
    <image class="avatar" :src="user.avatar || '/static/default-avatar.png'" mode="aspectFill" />
    <view class="info">
      <view class="header">
        <text class="nickname">{{ user.nickname }}</text>
        <view class="tags">
          <text class="gender-tag" :class="user.gender === 1 ? 'male' : 'female'">
            {{ user.gender === 1 ? '♂' : '♀' }}
          </text>
          <text class="age-tag">{{ user.age }}岁</text>
        </view>
      </view>
      
      <view class="location" v-if="user.distance">
        <u-icon name="map" size="12" color="#999" />
        <text>{{ formatDistance(user.distance) }}</text>
      </view>
      
      <view class="interests" v-if="user.interests">
        <text class="interest-tag" v-for="(interest, index) in user.interests.slice(0, 3)" :key="index">
          {{ interest }}
        </text>
      </view>
      
      <view class="match-score" v-if="showMatchScore && user.matchScore">
        <text class="score">匹配度 {{ user.matchScore }}%</text>
      </view>
    </view>
    
    <view class="actions">
      <u-button type="primary" size="mini" @click.stop="sayHello">打招呼</u-button>
    </view>
  </view>
</template>

<script setup>
import { formatDistance } from '@/utils/index.js'

/**
 * UserCard 用户卡片组件
 * 用于展示用户列表中的用户信息
 * @component
 */
const props = defineProps({
  /**
   * 用户信息对象
   * @type {Object}
   * @property {number} userId - 用户ID
   * @property {string} nickname - 用户昵称
   * @property {number} age - 年龄
   * @property {number} gender - 性别：1-男，2-女
   * @property {string} [avatar] - 头像URL
   * @property {number} [distance] - 距离（公里）
   * @property {string[]} [interests] - 兴趣标签
   * @property {number} [matchScore] - 匹配分数
   */
  user: {
    type: Object,
    required: true
  },
  /**
   * 是否显示匹配分数
   */
  showMatchScore: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

/**
 * 打招呼
 * 跳转到聊天页面
 */
const sayHello = () => {
  uni.navigateTo({
    url: `/pages/message/chat?userId=${props.user.userId}&nickname=${encodeURIComponent(props.user.nickname)}`
  })
}
</script>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 20rpx;
}

.info {
  flex: 1;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.nickname {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}

.tags {
  display: flex;
  gap: 10rpx;
}

.gender-tag {
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  color: #fff;
}

.gender-tag.male {
  background: #007AFF;
}

.gender-tag.female {
  background: #FF6B9D;
}

.age-tag {
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  background: #f0f0f0;
  color: #666;
}

.location {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.interests {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.interest-tag {
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  background: #E8F4FF;
  color: #007AFF;
}

.match-score {
  margin-top: 10rpx;
}

.score {
  font-size: 24rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.actions {
  margin-left: 20rpx;
}
</style>
