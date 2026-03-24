<template>
  <view class="activity-card" @click="$emit('click')">
    <image class="cover" :src="activity.coverImage || '/static/default-activity.jpg'" mode="aspectFill" />
    <view class="content">
      <view class="header">
        <text class="type-tag">{{ activity.typeName }}</text>
        <text class="title">{{ activity.title }}</text>
      </view>
      
      <view class="info">
        <view class="info-item">
          <u-icon name="clock" size="14" color="#999" />
          <text>{{ formatTime(activity.startTime) }}</text>
        </view>
        <view class="info-item">
          <u-icon name="map" size="14" color="#999" />
          <text>{{ activity.location }}</text>
        </view>
        <view class="info-item">
          <u-icon name="account" size="14" color="#999" />
          <text>{{ activity.currentParticipants }}/{{ activity.maxParticipants }}人</text>
        </view>
      </view>
      
      <view class="footer">
        <view class="payment">
          <text class="payment-type">{{ paymentTypeText }}</text>
          <text class="amount" v-if="activity.perPersonAmount > 0">¥{{ activity.perPersonAmount }}/人</text>
          <text class="amount free" v-else>免费</text>
        </view>
        <u-button type="primary" size="mini" @click.stop="join">报名</u-button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/index.js'

/**
 * ActivityCard 活动卡片组件
 * 用于展示活动信息的卡片组件
 * @component
 */
const props = defineProps({
  /**
   * 活动信息对象
   * @type {Object}
   * @property {number} id - 活动ID
   * @property {string} title - 活动标题
   * @property {string} typeName - 活动类型名称
   * @property {string} [coverImage] - 封面图片
   * @property {string} startTime - 开始时间
   * @property {string} location - 活动地点
   * @property {number} currentParticipants - 当前参与人数
   * @property {number} maxParticipants - 最大参与人数
   * @property {number} paymentType - 支付方式
   * @property {number} [perPersonAmount] - 人均费用
   */
  activity: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'join'])

/**
 * 支付方式文本映射
 * @type {ComputedRef<string>}
 */
const paymentTypeText = computed(() => {
  const types = { 1: 'AA制', 2: '男A女免', 3: '请客', 4: '免费' }
  return types[props.activity.paymentType] || 'AA制'
})

/**
 * 格式化活动时间
 * @param {string} time - ISO格式时间字符串
 * @returns {string} 格式化后的时间
 */
const formatTime = (time) => {
  if (!time) return ''
  return formatDate(time, 'MM-DD HH:mm')
}

/**
 * 报名活动
 * 显示确认对话框，确认后触发join事件
 */
const join = () => {
  uni.showModal({
    title: '确认报名',
    content: `确定要报名参加"${props.activity.title}"吗？`,
    success: (res) => {
      if (res.confirm) {
        emit('join', props.activity)
      }
    }
  })
}
</script>

<style scoped>
.activity-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.cover {
  width: 100%;
  height: 300rpx;
}

.content {
  padding: 20rpx;
}

.header {
  margin-bottom: 16rpx;
}

.type-tag {
  display: inline-block;
  padding: 4rpx 12rpx;
  background: #E8F4FF;
  color: #007AFF;
  font-size: 22rpx;
  border-radius: 8rpx;
  margin-right: 12rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.info {
  margin-bottom: 16rpx;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.info-item text {
  margin-left: 8rpx;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #eee;
}

.payment {
  display: flex;
  align-items: center;
}

.payment-type {
  font-size: 24rpx;
  color: #666;
  margin-right: 12rpx;
}

.amount {
  font-size: 32rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.amount.free {
  color: #52C41A;
}
</style>
