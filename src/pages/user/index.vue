<template>
  <view class="user-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill" />
      <view class="info">
        <text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
        <view class="level">
          <text class="level-badge">Lv{{ userInfo.level || 1 }}</text>
          <text class="credit">信用分 {{ userInfo.creditScore || 100 }}</text>
        </view>
      </view>
      <u-icon name="arrow-right" size="16" color="#999" @click="editProfile" />
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-list">
      <u-cell-group>
        <u-cell title="我的发布" icon="file-text" @click="goToPublished" isLink />
        <u-cell title="我的参与" icon="calendar" @click="goToJoined" isLink />
        <u-cell title="我的收藏" icon="star" @click="goToFavorites" isLink />
        <u-cell title="实名认证" icon="account" @click="goToVerify" isLink />
      </u-cell-group>
    </view>
    
    <!-- 设置菜单 -->
    <view class="menu-list">
      <u-cell-group>
        <u-cell title="设置" icon="setting" @click="goToSettings" isLink />
        <u-cell title="关于我们" icon="info-circle" @click="goToAbout" isLink />
      </u-cell-group>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-btn">
      <u-button type="error" plain @click="logout">退出登录</u-button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo || {})

const editProfile = () => {
  uni.navigateTo({ url: '/pages/user/profile' })
}

const goToPublished = () => {
  uni.navigateTo({ url: '/pages/user/published' })
}

const goToJoined = () => {
  uni.navigateTo({ url: '/pages/user/joined' })
}

const goToFavorites = () => {
  uni.navigateTo({ url: '/pages/user/favorites' })
}

const goToVerify = () => {
  uni.navigateTo({ url: '/pages/user/verify' })
}

const goToSettings = () => {
  uni.navigateTo({ url: '/pages/user/settings' })
}

const goToAbout = () => {
  uni.navigateTo({ url: '/pages/user/about' })
}

const logout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.reLaunch({ url: '/pages/login/index' })
      }
    }
  })
}
</script>

<style scoped>
.user-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 4rpx solid #fff;
  margin-right: 24rpx;
}

.info {
  flex: 1;
}

.nickname {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12rpx;
}

.level {
  display: flex;
  align-items: center;
}

.level-badge {
  padding: 4rpx 16rpx;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 24rpx;
  border-radius: 20rpx;
  margin-right: 16rpx;
}

.credit {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.menu-list {
  margin-top: 20rpx;
}

.logout-btn {
  padding: 40rpx;
  margin-top: 40rpx;
}
</style>
