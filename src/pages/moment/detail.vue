<template>
  <view class="detail-container">
    <!-- 动态内容 -->
    <view class="moment-content">
      <MomentCard :moment="moment" :show-actions="false" />
    </view>
    
    <!-- 点赞列表 -->
    <view class="like-section" v-if="likes.length > 0">
      <view class="section-title">
        <u-icon name="thumb-up-fill" size="24" color="#007AFF" />
        <text>{{ moment.likeCount }}人点赞</text>
      </view>
      <view class="like-avatars">
        <image 
          v-for="like in likes.slice(0, 8)" 
          :key="like.userId"
          :src="like.avatar"
          mode="aspectFill"
        />
        <view v-if="likes.length > 8" class="more-likes">
          <text>+{{ likes.length - 8 }}</text>
        </view>
      </view>
    </view>
    
    <!-- 评论列表 -->
    <view class="comment-section">
      <view class="section-title">
        <text>评论 ({{ comments.length }})</text>
      </view>
      
      <view v-if="comments.length > 0" class="comment-list">
        <view 
          v-for="comment in comments" 
          :key="comment.id"
          class="comment-item"
        >
          <image :src="comment.user.avatar" mode="aspectFill" class="comment-avatar" />
          <view class="comment-body">
            <text class="comment-nickname">{{ comment.user.nickname }}</text>
            <text class="comment-content">{{ comment.content }}</text>
            <text class="comment-time">{{ comment.time }}</text>
            
            <!-- 回复列表 -->
            <view v-if="comment.replies?.length > 0" class="reply-list">
              <view 
                v-for="reply in comment.replies" 
                :key="reply.id"
                class="reply-item"
              >
                <text class="reply-nickname">{{ reply.user.nickname }}</text>
                <text class="reply-text">回复</text>
                <text class="reply-nickname">{{ reply.replyTo.nickname }}</text>
                <text class="reply-content">：{{ reply.content }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <u-empty v-else mode="message" text="暂无评论，快来抢沙发吧" />
    </view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="input-wrapper" @click="showCommentInput = true">
        <u-icon name="edit-pen" size="28" color="#999" />
        <text class="placeholder">写评论...</text>
      </view>
      
      <view class="action-btns">
        <view class="action-btn" @click="handleLike">
          <u-icon 
            :name="moment.isLiked ? 'thumb-up-fill' : 'thumb-up'" 
            size="32" 
            :color="moment.isLiked ? '#007AFF' : '#666'" 
          />
          <text :class="{ active: moment.isLiked }">{{ moment.likeCount || '点赞' }}</text>
        </view>
        <view class="action-btn">
          <u-icon name="share" size="32" color="#666" />
          <text>分享</text>
        </view>
      </view>
    </view>
    
    <!-- 评论输入弹窗 -->
    <u-popup :show="showCommentInput" mode="bottom" @close="showCommentInput = false">
      <view class="comment-popup">
        <textarea
          class="comment-input"
          v-model="commentContent"
          placeholder="写下你的评论..."
          maxlength="200"
          auto-focus
        />
        <view class="comment-actions">
          <text class="word-count">{{ commentContent.length }}/200</text>
          <u-button type="primary" size="small" :disabled="!commentContent.trim()" @click="submitComment">
            发送
          </u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { momentApi } from '@/api'
import MomentCard from '@/components/MomentCard.vue'

const momentId = ref('')
const moment = ref({})
const likes = ref([])
const comments = ref([])
const showCommentInput = ref(false)
const commentContent = ref('')

onLoad((options) => {
  momentId.value = options.id
  loadMomentDetail()
  loadLikes()
  loadComments()
})

const loadMomentDetail = async () => {
  try {
    const res = await momentApi.getMomentDetail(momentId.value)
    if (res.code === 200) {
      moment.value = res.data
    }
  } catch (error) {
    console.error('加载动态详情失败:', error)
  }
}

const loadLikes = async () => {
  try {
    const res = await momentApi.getMomentLikes(momentId.value)
    if (res.code === 200) {
      likes.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载点赞列表失败:', error)
  }
}

const loadComments = async () => {
  try {
    const res = await momentApi.getMomentComments(momentId.value)
    if (res.code === 200) {
      comments.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

const handleLike = async () => {
  try {
    const res = await momentApi.likeMoment(momentId.value)
    if (res.code === 200) {
      moment.value.isLiked = !moment.value.isLiked
      moment.value.likeCount += moment.value.isLiked ? 1 : -1
      if (moment.value.isLiked) {
        loadLikes()
      }
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const submitComment = async () => {
  if (!commentContent.value.trim()) return
  
  try {
    const res = await momentApi.commentMoment(momentId.value, {
      content: commentContent.value.trim()
    })
    if (res.code === 200) {
      uni.showToast({ title: '评论成功', icon: 'success' })
      commentContent.value = ''
      showCommentInput.value = false
      loadComments()
    }
  } catch (error) {
    console.error('评论失败:', error)
    uni.showToast({ title: '评论失败', icon: 'none' })
  }
}
</script>

<style scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.moment-content {
  background: #fff;
}

.like-section {
  margin-top: 20rpx;
  padding: 30rpx;
  background: #fff;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.like-avatars {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.like-avatars image {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}

.more-likes {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-likes text {
  font-size: 22rpx;
  color: #666;
}

.comment-section {
  margin-top: 20rpx;
  padding: 30rpx;
  background: #fff;
  min-height: 400rpx;
}

.comment-list {
  margin-top: 20rpx;
}

.comment-item {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.comment-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.comment-body {
  flex: 1;
}

.comment-nickname {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.comment-content {
  display: block;
  font-size: 30rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 8rpx;
}

.comment-time {
  font-size: 24rpx;
  color: #999;
}

.reply-list {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.reply-item {
  padding: 8rpx 0;
  font-size: 28rpx;
  line-height: 1.5;
}

.reply-nickname {
  color: #007AFF;
}

.reply-text {
  color: #666;
}

.reply-content {
  color: #333;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.placeholder {
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #999;
}

.action-btns {
  display: flex;
  gap: 30rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.action-btn text {
  font-size: 22rpx;
  color: #666;
}

.action-btn text.active {
  color: #007AFF;
}

.comment-popup {
  padding: 30rpx;
  background: #fff;
}

.comment-input {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 30rpx;
  margin-bottom: 20rpx;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-count {
  font-size: 24rpx;
  color: #999;
}
</style>
