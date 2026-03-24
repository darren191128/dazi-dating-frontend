<template>
  <view class="group-create-container">
    <view class="form-section">
      <!-- 群头像 -->
      <view class="form-item avatar-item">
        <text class="label">群头像</text>
        <view class="avatar-upload" @click="chooseAvatar">
          <image v-if="groupAvatar" :src="groupAvatar" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <u-icon name="camera" size="40" color="#999" />
            <text>点击上传</text>
          </view>
        </view>
      </view>
      
      <!-- 群名称 -->
      <view class="form-item">
        <text class="label">群名称</text>
        <input
          class="input"
          v-model="groupName"
          placeholder="请输入群名称"
          maxlength="20"
        />
      </view>
    </view>
    
    <!-- 成员选择 -->
    <view class="member-section">
      <view class="section-header">
        <text class="title">选择成员</text>
        <text class="count">已选择 {{ selectedMembers.length }} 人</text>
      </view>
      
      <scroll-view scroll-y class="member-list">
        <view
          class="member-item"
          v-for="friend in friendList"
          :key="friend.id"
          @click="toggleMember(friend)"
        >
          <checkbox :checked="isSelected(friend.id)" />
          <image class="member-avatar" :src="friend.avatar" mode="aspectFill" />
          <text class="member-name">{{ friend.nickname }}</text>
        </view>
      </scroll-view>
    </view>
    
    <!-- 创建按钮 -->
    <view class="footer">
      <u-button
        type="primary"
        size="large"
        :disabled="!canCreate"
        :loading="creating"
        @click="createGroup"
      >
        创建群聊
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { groupApi } from '@/api/rtc-group'
import { matchApi } from '@/api'

const groupName = ref('')
const groupAvatar = ref('')
const selectedMembers = ref([])
const friendList = ref([])
const creating = ref(false)

const canCreate = computed(() => {
  return groupName.value.trim() && selectedMembers.value.length > 0
})

onMounted(() => {
  loadFriends()
})

// 加载好友列表
const loadFriends = async () => {
  try {
    // 获取互相喜欢的人列表作为好友
    const res = await matchApi.getMutualLikes()
    if (res.code === 200 && res.data) {
      friendList.value = res.data.map(user => ({
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar || '/static/default-avatar.png'
      }))
    }
  } catch (error) {
    console.error('加载好友列表失败:', error)
    uni.showToast({ title: '加载好友失败', icon: 'none' })
  }
}

// 选择头像
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      // 上传图片
      uni.showLoading({ title: '上传中...' })
      try {
        const uploadRes = await uni.uploadFile({
          url: uni.getStorageSync('baseURL') + '/message/upload/image',
          filePath: tempFilePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          }
        })
        const data = JSON.parse(uploadRes.data)
        if (data.code === 200 && data.data?.url) {
          groupAvatar.value = data.data.url
        }
      } catch (error) {
        uni.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

// 切换成员选择
const toggleMember = (friend) => {
  const index = selectedMembers.value.findIndex(m => m.id === friend.id)
  if (index > -1) {
    selectedMembers.value.splice(index, 1)
  } else {
    selectedMembers.value.push(friend)
  }
}

// 检查是否已选择
const isSelected = (id) => {
  return selectedMembers.value.some(m => m.id === id)
}

// 创建群聊
const createGroup = async () => {
  if (!canCreate.value) return
  
  creating.value = true
  try {
    const res = await groupApi.createGroup({
      name: groupName.value.trim(),
      avatar: groupAvatar.value,
      memberIds: selectedMembers.value.map(m => m.id)
    })
    
    if (res.code === 200 && res.data) {
      uni.showToast({ title: '创建成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '创建失败', icon: 'none' })
    }
  } catch (error) {
    console.error('创建群聊失败:', error)
    uni.showToast({ title: '创建失败', icon: 'none' })
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.group-create-container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.form-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.form-item:last-child {
  border-bottom: none;
}

.avatar-item {
  align-items: flex-start;
}

.label {
  width: 150rpx;
  font-size: 30rpx;
  color: #333;
}

.avatar-upload {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-upload image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.upload-placeholder text {
  font-size: 24rpx;
  color: #999;
}

.input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.member-section {
  flex: 1;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.count {
  font-size: 28rpx;
  color: #007AFF;
}

.member-list {
  flex: 1;
  padding: 0 30rpx;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.member-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
  margin: 0 20rpx;
}

.member-name {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.footer {
  padding: 30rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}
</style>
