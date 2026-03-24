<template>
  <view class="topic-detail-container">
    <!-- 话题信息 -->
    <view class="topic-header" v-if="topic">
      <image 
        :src="topic.cover || '/static/default-topic-cover.png'" 
        mode="aspectFill" 
        class="topic-cover"
      />
      <view class="topic-info">
        <text class="topic-name">#{{ topic.name }}</text>
        <text class="topic-desc">{{ topic.description }}</text>
        <view class="topic-stats">
          <text>{{ topic.postCount || 0 }} 帖子</text>
          <text class="divider">|</text>
          <text>{{ topic.followCount || 0 }} 关注</text>
        </view>
        <view 
          class="follow-btn"
          :class="{ followed: topic.isFollowed }"
          @click="toggleFollow"
        >
          <text>{{ topic.isFollowed ? '已关注' : '关注话题' }}</text>
        </view>
      </view>
    </view>
    
    <!-- 动态列表 -->
    <view class="moments-section">
      <text class="section-title">最新动态</text>
      <scroll-view 
        scroll-y 
        class="moment-list"
        @scrolltolower="loadMore"
        refresher-enabled
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="moments.length > 0">
          <MomentCard 
            v-for="moment in moments" 
            :key="moment.id"
            :moment="moment"
            @like="handleLike"
            @comment="goToDetail"
            @click="goToDetail(moment)"
          />
        </view>
        <u-empty v-else mode="list" text="暂无动态" />
        <u-loadmore :status="loadStatus" />
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { topicApi, momentApi } from '@/api'
import MomentCard from '@/components/MomentCard.vue'

const topic = ref(null)
const moments = ref([])
const refreshing = ref(false)
const loadStatus = ref('loadmore')
const page = ref(1)
const pageSize = ref(20)

let topicId = null

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  topicId = currentPage.options.id
  
  if (topicId) {
    loadTopicDetail()
    loadTopicMoments()
  }
})

const loadTopicDetail = async () => {
  try {
    const res = await topicApi.getTopicDetail(topicId)
    if (res.code === 200) {
      topic.value = res.data
    }
  } catch (error) {
    console.error('加载话题详情失败:', error)
  }
}

const loadTopicMoments = async () => {
  try {
    loadStatus.value = 'loading'
    const res = await topicApi.getTopicMoments(topicId, {
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      if (page.value === 1) {
        moments.value = res.data || []
      } else {
        moments.value = [...moments.value, ...(res.data || [])]
      }
      loadStatus.value = res.data?.length < pageSize.value ? 'nomore' : 'loadmore'
    }
  } catch (error) {
    console.error('加载话题动态失败:', error)
    loadStatus.value = 'loadmore'
  }
}

const toggleFollow = async () => {
  if (!topic.value) return
  
  try {
    const api = topic.value.isFollowed ? topicApi.unfollowTopic : topicApi.followTopic
    const res = await api(topicId)
    if (res.code === 200) {
      topic.value.isFollowed = !topic.value.isFollowed
      topic.value.followCount += topic.value.isFollowed ? 1 : -1
      uni.showToast({ 
        title: topic.value.isFollowed ? '关注成功' : '取消关注',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('关注操作失败:', error)
  }
}

const onRefresh = async () => {
  refreshing.value = true
  page.value = 1
  await Promise.all([loadTopicDetail(), loadTopicMoments()])
  refreshing.value = false
}

const loadMore = () => {
  if (loadStatus.value === 'nomore') return
  page.value++
  loadTopicMoments()
}

const handleLike = async (moment) => {
  try {
    const res = moment.isLiked 
      ? await momentApi.unlikeMoment(moment.id)
      : await momentApi.likeMoment(moment.id)
    if (res.code === 200) {
      moment.isLiked = !moment.isLiked
      moment.likeCount += moment.isLiked ? 1 : -1
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const goToDetail = (moment) => {
  uni.navigateTo({ url: `/pages/moment/detail?id=${moment.id}` })
}
</script>

<style scoped>
.topic-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.topic-header {
  background: #fff;
  padding-bottom: 30rpx;
}

.topic-cover {
  width: 100%;
  height: 300rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.topic-info {
  padding: 30rpx;
  text-align: center;
}

.topic-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.topic-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 20rpx;
}

.topic-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 24rpx;
}

.divider {
  color: #ddd;
}

.follow-btn {
  display: inline-block;
  padding: 16rpx 60rpx;
  background: #007AFF;
  border-radius: 40rpx;
}

.follow-btn text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}

.follow-btn.followed {
  background: #f5f5f5;
}

.follow-btn.followed text {
  color: #999;
}

.moments-section {
  background: #fff;
  margin-top: 20rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.moment-list {
  height: calc(100vh - 600rpx);
}
</style>
