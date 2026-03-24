<template>
  <view class="topic-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <u-search 
        v-model="searchKeyword" 
        placeholder="搜索话题" 
        :show-action="false"
        @search="onSearch"
      />
    </view>
    
    <!-- 热门话题 -->
    <view class="hot-topics-section" v-if="hotTopics.length > 0">
      <text class="section-title">热门话题</text>
      <view class="hot-topics-grid">
        <view 
          v-for="topic in hotTopics" 
          :key="topic.id"
          class="hot-topic-item"
          @click="goToTopicDetail(topic)"
        >
          <image 
            :src="topic.cover || topic.icon || '/static/default-topic.png'" 
            mode="aspectFill" 
            class="hot-topic-cover"
          />
          <text class="hot-topic-name">#{{ topic.name }}</text>
          <text class="hot-topic-count">{{ topic.postCount }} 帖子</text>
        </view>
      </view>
    </view>
    
    <!-- 全部话题 -->
    <view class="all-topics-section">
      <text class="section-title">全部话题</text>
      <TopicList 
        :topics="topics"
        @topicClick="goToTopicDetail"
        @followClick="handleFollow"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { topicApi } from '@/api'
import TopicList from '@/components/TopicList.vue'

const searchKeyword = ref('')
const topics = ref([])
const hotTopics = ref([])

onMounted(() => {
  loadTopics()
})

const loadTopics = async () => {
  try {
    const res = await topicApi.getTopics()
    if (res.code === 200) {
      topics.value = res.data || []
      // 取前6个作为热门话题
      hotTopics.value = topics.value.slice(0, 6)
    }
  } catch (error) {
    console.error('加载话题失败:', error)
  }
}

const onSearch = async () => {
  try {
    const res = await topicApi.getTopics({ keyword: searchKeyword.value })
    if (res.code === 200) {
      topics.value = res.data || []
    }
  } catch (error) {
    console.error('搜索话题失败:', error)
  }
}

const goToTopicDetail = (topic) => {
  uni.navigateTo({ url: `/pages/topic/detail?id=${topic.id}` })
}

const handleFollow = async (topic) => {
  try {
    const api = topic.isFollowed ? topicApi.unfollowTopic : topicApi.followTopic
    const res = await api(topic.id)
    if (res.code === 200) {
      topic.isFollowed = !topic.isFollowed
      topic.followCount += topic.isFollowed ? 1 : -1
      uni.showToast({ 
        title: topic.isFollowed ? '关注成功' : '取消关注',
        icon: 'success'
      })
    }
  } catch (error) {
    console.error('关注操作失败:', error)
  }
}
</script>

<style scoped>
.topic-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  padding: 20rpx;
  background: #fff;
}

.hot-topics-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.hot-topics-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.hot-topic-item {
  width: calc(33.33% - 14rpx);
  text-align: center;
}

.hot-topic-cover {
  width: 100%;
  height: 160rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
  background: #f5f5f5;
}

.hot-topic-name {
  font-size: 26rpx;
  color: #333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-topic-count {
  font-size: 22rpx;
  color: #999;
}

.all-topics-section {
  background: #fff;
  padding: 30rpx;
}
</style>
