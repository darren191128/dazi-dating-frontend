<template>
  <view class="moment-card">
    <!-- 用户信息 -->
    <view class="user-header">
      <image 
        :src="moment.user?.avatar || '/static/default-avatar.png'" 
        mode="aspectFill" 
        class="user-avatar"
        @click="goToUserDetail"
      />
      <view class="user-meta">
        <text class="user-nickname">{{ moment.user?.nickname || '未知用户' }}</text>
        <text class="publish-time">{{ moment.time }}</text>
      </view>
      <u-icon 
        v-if="showMore" 
        name="more-dot-fill" 
        size="32" 
        color="#999"
        @click="showMoreActions"
      />
    </view>
    
    <!-- 动态内容 -->
    <view class="moment-content" @click="goToDetail">
      <text class="content-text">{{ moment.content }}</text>
      
      <!-- 图片网格 -->
      <view v-if="moment.images?.length > 0" class="image-grid" :class="`grid-${Math.min(moment.images.length, 9)}`">
        <image 
          v-for="(img, index) in moment.images.slice(0, 9)" 
          :key="index"
          :src="img" 
          mode="aspectFill"
          @click.stop="previewImage(index)"
        />
      </view>
    </view>
    
    <!-- 操作栏 -->
    <view v-if="showActions" class="moment-actions">
      <view class="action-item" @click="handleLike">
        <u-icon 
          :name="moment.isLiked ? 'thumb-up-fill' : 'thumb-up'" 
          size="28" 
          :color="moment.isLiked ? '#007AFF' : '#666'" 
        />
        <text :class="{ active: moment.isLiked }">{{ moment.likeCount || '点赞' }}</text>
      </view>
      <view class="action-item" @click="handleComment">
        <u-icon name="chat" size="28" color="#666" />
        <text>{{ moment.commentCount || '评论' }}</text>
      </view>
      <view class="action-item" @click="handleShare">
        <u-icon name="share" size="28" color="#666" />
        <text>分享</text>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * MomentCard 动态卡片组件
 * 用于展示用户动态信息，支持点赞、评论、分享
 * @component
 */
const props = defineProps({
  /**
   * 动态信息对象
   * @type {Object}
   * @property {number} id - 动态ID
   * @property {string} content - 动态内容
   * @property {string[]} [images] - 图片列表
   * @property {string} time - 发布时间
   * @property {number} [likeCount] - 点赞数
   * @property {number} [commentCount] - 评论数
   * @property {boolean} [isLiked] - 是否已点赞
   * @property {Object} user - 发布者信息
   */
  moment: {
    type: Object,
    default: () => ({})
  },
  /**
   * 是否显示操作栏（点赞、评论、分享）
   */
  showActions: {
    type: Boolean,
    default: true
  },
  /**
   * 是否显示更多操作按钮
   */
  showMore: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['like', 'comment', 'click'])

/**
 * 跳转到用户详情页
 */
const goToUserDetail = () => {
  if (props.moment.user?.userId) {
    uni.navigateTo({ url: `/pages/user/detail?userId=${props.moment.user.userId}` })
  }
}

/**
 * 点击动态内容
 * 触发click事件
 */
const goToDetail = () => {
  emit('click', props.moment)
}

/**
 * 预览图片
 * @param {number} index - 图片索引
 */
const previewImage = (index) => {
  uni.previewImage({
    current: props.moment.images[index],
    urls: props.moment.images
  })
}

/**
 * 点赞/取消点赞
 */
const handleLike = () => {
  emit('like', props.moment)
}

/**
 * 评论
 */
const handleComment = () => {
  emit('comment', props.moment)
}

/**
 * 分享动态
 */
const handleShare = () => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

/**
 * 显示更多操作
 * 举报或不感兴趣
 */
const showMoreActions = () => {
  uni.showActionSheet({
    itemList: ['举报', '不感兴趣'],
    success: (res) => {
      // TODO: 实现举报/不感兴趣逻辑
    }
  })
}
</script>

<style scoped>
.moment-card {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-meta {
  flex: 1;
}

.user-nickname {
  display: block;
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 6rpx;
}

.publish-time {
  font-size: 24rpx;
  color: #999;
}

.moment-content {
  margin-bottom: 20rpx;
}

.content-text {
  display: block;
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20rpx;
  word-wrap: break-word;
}

.image-grid {
  display: grid;
  gap: 8rpx;
}

.image-grid.grid-1 {
  grid-template-columns: 1fr;
}

.image-grid.grid-1 image {
  max-height: 400rpx;
  border-radius: 12rpx;
}

.image-grid.grid-2,
.image-grid.grid-4 {
  grid-template-columns: repeat(2, 1fr);
}

.image-grid.grid-3,
.image-grid.grid-5,
.image-grid.grid-6,
.image-grid.grid-7,
.image-grid.grid-8,
.image-grid.grid-9 {
  grid-template-columns: repeat(3, 1fr);
}

.image-grid image {
  width: 100%;
  height: 200rpx;
  border-radius: 8rpx;
}

.moment-actions {
  display: flex;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.action-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.action-item text {
  font-size: 26rpx;
  color: #666;
}

.action-item text.active {
  color: #007AFF;
}
</style>
