<template>
  <view class="publish-container">
    <!-- 文本输入 -->
    <view class="content-area">
      <textarea
        class="content-input"
        v-model="content"
        placeholder="分享你的新鲜事..."
        maxlength="500"
        auto-height
      />
      <text class="word-count">{{ content.length }}/500</text>
    </view>
    
    <!-- 话题选择 -->
    <view class="topic-area" @click="showTopicSelector = true">
      <view v-if="selectedTopics.length === 0" class="topic-placeholder">
        <u-icon name="tags-fill" size="28" color="#007AFF" />
        <text>添加话题</text>
      </view>
      <view v-else class="selected-topics">
        <text v-for="topic in selectedTopics" :key="topic.id" class="selected-topic">
          #{{ topic.name }}
        </text>
      </view>
    </view>
    
    <!-- 话题选择弹窗 -->
    <u-popup :show="showTopicSelector" mode="bottom" round="20" @close="showTopicSelector = false">
      <view class="topic-selector">
        <view class="selector-header">
          <text class="selector-title">选择话题</text>
          <text class="selector-close" @click="showTopicSelector = false">关闭</text>
        </view>
        <scroll-view scroll-y class="topic-list">
          <view 
            v-for="topic in topics" 
            :key="topic.id"
            class="topic-item"
            :class="{ selected: isTopicSelected(topic) }"
            @click="toggleTopic(topic)"
          >
            <text class="topic-name">#{{ topic.name }}</text>
            <text class="topic-count">{{ topic.postCount }} 帖子</text>
            <u-icon v-if="isTopicSelected(topic)" name="checkmark" size="28" color="#007AFF" />
          </view>
        </scroll-view>
        <view class="selector-footer">
          <u-button type="primary" size="large" @click="confirmTopics">
            确认 ({{ selectedTopics.length }})
          </u-button>
        </view>
      </view>
    </u-popup>
    
    <!-- 图片选择 -->
    <view class="image-area">
      <view 
        v-for="(image, index) in images" 
        :key="index"
        class="image-item"
      >
        <image :src="image" mode="aspectFill" @click="previewImage(index)" />
        <view class="delete-btn" @click="deleteImage(index)">
          <u-icon name="close" size="16" color="#fff" />
        </view>
      </view>
      
      <view 
        v-if="images.length < 9" 
        class="image-item add-btn"
        @click="chooseImage"
      >
        <u-icon name="plus" size="48" color="#999" />
        <text class="add-text">添加图片</text>
      </view>
    </view>
    
    <!-- 发布按钮 -->
    <view class="publish-action">
      <u-button 
        type="primary" 
        size="large"
        :loading="publishing"
        :disabled="!canPublish"
        @click="publish"
      >
        发布
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onBackPress } from '@dcloudio/uni-app'
import { momentApi, topicApi } from '@/api'

const content = ref('')
const images = ref([])
const publishing = ref(false)
const showTopicSelector = ref(false)
const topics = ref([])
const selectedTopics = ref([])

onMounted(() => {
  loadTopics()
})

const loadTopics = async () => {
  try {
    const res = await topicApi.getTopics()
    if (res.code === 200) {
      topics.value = res.data || []
    }
  } catch (error) {
    console.error('加载话题失败:', error)
  }
}

const isTopicSelected = (topic) => {
  return selectedTopics.value.some(t => t.id === topic.id)
}

const toggleTopic = (topic) => {
  const index = selectedTopics.value.findIndex(t => t.id === topic.id)
  if (index > -1) {
    selectedTopics.value.splice(index, 1)
  } else if (selectedTopics.value.length < 3) {
    selectedTopics.value.push(topic)
  } else {
    uni.showToast({ title: '最多选择3个话题', icon: 'none' })
  }
}

const confirmTopics = () => {
  showTopicSelector.value = false
}

const canPublish = computed(() => {
  return content.value.trim().length > 0 || images.value.length > 0
})

const chooseImage = () => {
  const remainCount = 9 - images.value.length
  uni.chooseImage({
    count: remainCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      images.value = [...images.value, ...res.tempFilePaths]
    }
  })
}

const deleteImage = (index) => {
  images.value.splice(index, 1)
}

const previewImage = (index) => {
  uni.previewImage({
    current: images.value[index],
    urls: images.value
  })
}

const publish = async () => {
  if (!canPublish.value) return
  
  publishing.value = true
  try {
    // 先上传图片
    const uploadedImages = []
    for (const image of images.value) {
      const res = await uploadImage(image)
      if (res.code === 200) {
        uploadedImages.push(res.data.url)
      }
    }
    
    // 发布动态
    const res = await momentApi.publish({
      content: content.value.trim(),
      images: uploadedImages,
      topicIds: selectedTopics.value.map(t => t.id)
    })
    
    if (res.code === 200) {
      uni.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '发布失败', icon: 'none' })
    }
  } catch (error) {
    console.error('发布失败:', error)
    uni.showToast({ title: '发布失败', icon: 'none' })
  } finally {
    publishing.value = false
  }
}

const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${uni.getStorageSync('baseURL')}/upload/image`,
      filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (res) => {
        resolve(JSON.parse(res.data))
      },
      fail: reject
    })
  })
}

// 返回确认
onBackPress(() => {
  if (content.value.trim() || images.value.length > 0) {
    uni.showModal({
      title: '确认返回',
      content: '确定要放弃编辑吗？',
      success: (res) => {
        if (res.confirm) {
          return false
        }
      }
    })
    return true
  }
  return false
})
</script>

<style scoped>
.publish-container {
  min-height: 100vh;
  background: #fff;
  padding: 30rpx;
}

.content-area {
  position: relative;
  margin-bottom: 30rpx;
}

.content-input {
  width: 100%;
  min-height: 200rpx;
  font-size: 32rpx;
  line-height: 1.6;
}

.word-count {
  position: absolute;
  right: 0;
  bottom: -40rpx;
  font-size: 24rpx;
  color: #999;
}

.image-area {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 60rpx;
}

.image-item {
  position: relative;
  width: 210rpx;
  height: 210rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.image-item image {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 2rpx dashed #ddd;
}

.add-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.publish-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 30rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.topic-area {
  margin: 30rpx 0;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.topic-placeholder {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 28rpx;
  color: #007AFF;
}

.selected-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.selected-topic {
  padding: 8rpx 20rpx;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #007AFF;
}

.topic-selector {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.selector-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.selector-close {
  font-size: 28rpx;
  color: #999;
}

.topic-list {
  flex: 1;
  padding: 20rpx;
}

.topic-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.topic-item.selected {
  background: rgba(0, 122, 255, 0.05);
}

.topic-name {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.topic-count {
  font-size: 24rpx;
  color: #999;
  margin-right: 20rpx;
}

.selector-footer {
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}
</style>
