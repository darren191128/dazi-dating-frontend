<template>
  <view class="group-detail-container">
    <!-- 群信息 -->
    <view class="group-info">
      <image class="group-avatar" :src="groupInfo.avatar || '/static/default-group.png'" mode="aspectFill" />
      <text class="group-name">{{ groupInfo.name }}</text>
      <text class="group-id">群号: {{ groupInfo.id }}</text>
      <text class="member-count">{{ groupInfo.memberCount }}/{{ groupInfo.maxMemberCount }}人</text>
    </view>
    
    <!-- 群公告 -->
    <view class="notice-section" v-if="groupInfo.notice">
      <view class="section-title">
        <u-icon name="volume" size="28" color="#FF9500" />
        <text>群公告</text>
      </view>
      <text class="notice-content">{{ groupInfo.notice }}</text>
    </view>
    
    <!-- 成员列表 -->
    <view class="member-section">
      <view class="section-header">
        <text class="section-title">群成员</text>
        <text class="view-all" @click="viewAllMembers">查看全部</text>
      </view>
      <GroupMemberList :members="displayMembers" :show-online="true" />
    </view>
    
    <!-- 操作按钮 -->
    <view class="actions-section">
      <u-cell-group>
        <u-cell title="邀请成员" icon="plus" isLink @click="inviteMember" />
        <u-cell title="群聊设置" icon="setting" isLink @click="goToSettings" />
        <u-cell title="清空聊天记录" icon="trash" isLink @click="clearHistory" />
      </u-cell-group>
    </view>
    
    <!-- 退出群聊 -->
    <view class="footer" v-if="groupInfo.currentUserRole !== 2">
      <u-button type="error" size="large" :loading="leaving" @click="leaveGroup">
        退出群聊
      </u-button>
    </view>
    
    <!-- 解散群聊（仅群主） -->
    <view class="footer" v-else>
      <u-button type="error" size="large" :loading="dissolving" @click="dissolveGroup">
        解散群聊
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { groupApi } from '@/api/rtc-group'
import GroupMemberList from '@/components/GroupMemberList.vue'

const groupId = ref('')
const groupInfo = ref({})
const members = ref([])
const leaving = ref(false)
const dissolving = ref(false)

const displayMembers = computed(() => {
  // 只显示前10个成员
  return members.value.slice(0, 10)
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  groupId.value = currentPage.options.groupId
  
  if (groupId.value) {
    loadGroupDetail()
  }
})

// 加载群详情
const loadGroupDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await groupApi.getGroupDetail(groupId.value)
    uni.hideLoading()
    
    if (res.code === 200 && res.data) {
      groupInfo.value = res.data
      members.value = res.data.members || []
    } else {
      uni.showToast({ title: res.message || '加载失败', icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('加载群详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

// 查看全部成员
const viewAllMembers = () => {
  uni.navigateTo({
    url: `/pages/message/group-members?groupId=${groupId.value}`
  })
}

// 邀请成员
const inviteMember = () => {
  uni.navigateTo({
    url: `/pages/message/group-invite?groupId=${groupId.value}`
  })
}

// 群聊设置
const goToSettings = () => {
  uni.navigateTo({
    url: `/pages/message/group-settings?groupId=${groupId.value}`
  })
}

// 清空聊天记录
const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空聊天记录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清空本地聊天记录
        uni.removeStorageSync(`group_chat_${groupId.value}`)
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}

// 退出群聊
const leaveGroup = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出该群聊吗？',
    success: async (res) => {
      if (res.confirm) {
        leaving.value = true
        try {
          const result = await groupApi.leaveGroup(groupId.value)
          if (result.code === 200) {
            uni.showToast({ title: '已退出群聊', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack({ delta: 2 })
            }, 1500)
          } else {
            uni.showToast({ title: result.message || '退出失败', icon: 'none' })
          }
        } catch (error) {
          console.error('退出群聊失败:', error)
          uni.showToast({ title: '退出失败', icon: 'none' })
        } finally {
          leaving.value = false
        }
      }
    }
  })
}

// 解散群聊
const dissolveGroup = () => {
  uni.showModal({
    title: '提示',
    content: '确定要解散该群聊吗？解散后无法恢复！',
    confirmColor: '#ff4444',
    success: async (res) => {
      if (res.confirm) {
        dissolving.value = true
        try {
          // TODO: 调用解散群聊API
          uni.showToast({ title: '已解散群聊', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack({ delta: 2 })
          }, 1500)
        } catch (error) {
          console.error('解散群聊失败:', error)
          uni.showToast({ title: '解散失败', icon: 'none' })
        } finally {
          dissolving.value = false
        }
      }
    }
  })
}
</script>

<style scoped>
.group-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.group-info {
  background: #fff;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1rpx solid #eee;
}

.group-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 24rpx;
  margin-bottom: 30rpx;
}

.group-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.group-id {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.member-count {
  font-size: 28rpx;
  color: #666;
}

.notice-section {
  background: #fff;
  padding: 30rpx;
  margin-top: 20rpx;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.section-title text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.notice-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.member-section {
  background: #fff;
  padding: 30rpx;
  margin-top: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.view-all {
  font-size: 28rpx;
  color: #007AFF;
}

.actions-section {
  margin-top: 20rpx;
}

.footer {
  padding: 40rpx;
  margin-top: 40rpx;
}
</style>
