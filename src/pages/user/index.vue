<template>
  <view class="user-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill" />
      <view class="info">
        <view class="name-row">
          <text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
          <view class="vip-badge" v-if="isVip" @click="goToVip">
            <u-icon name="medal" size="24" color="#FFD700" />
            <text>VIP</text>
          </view>
        </view>
        <view class="level">
          <text class="level-badge">Lv{{ userInfo.level || 1 }}</text>
          <text class="credit">信用分 {{ userInfo.creditScore || 100 }}</text>
        </view>
      </view>
      <u-icon name="arrow-right" size="16" color="#999" @click="editProfile" />
    </view>
    
    <!-- VIP入口卡片 -->
    <view class="vip-card" v-if="!isVip" @click="goToVip">
      <view class="vip-content">
        <view class="vip-left">
          <u-icon name="medal" size="40" color="#FFD700" />
          <view class="vip-text">
            <text class="vip-title">开通VIP会员</text>
            <text class="vip-desc">解锁无限滑动、访客隐身等8大特权</text>
          </view>
        </view>
        <view class="vip-btn">
          <text>立即开通</text>
        </view>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-list">
      <u-cell-group>
        <u-cell title="VIP中心" icon="medal" @click="goToVip" isLink>
          <template #right-icon>
            <view class="vip-tag" v-if="isVip">
              <text>有效期至 {{ formatVipExpireTime }}</text>
            </view>
            <u-icon name="arrow-right" size="16" color="#999" />
          </template>
        </u-cell>
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
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { userApi, vipApi } from '@/api'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo || {})
const isVip = ref(false)
const vipExpireTime = ref(null)

const formatVipExpireTime = computed(() => {
  if (!vipExpireTime.value) return ''
  const date = new Date(vipExpireTime.value)
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

onMounted(() => {
  loadUserInfo()
  loadVipStatus()
})

const loadUserInfo = async () => {
  try {
    const res = await userApi.getUserInfo()
    if (res.code === 200) {
      userStore.setUserInfo(res.data)
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

const loadVipStatus = async () => {
  try {
    const res = await vipApi.getVipStatus()
    if (res.code === 200) {
      isVip.value = res.data.isVip
      vipExpireTime.value = res.data.expireTime
    }
  } catch (error) {
    console.error('加载VIP状态失败:', error)
  }
}

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

const goToVip = () => {
  uni.navigateTo({ url: '/pages/vip/index' })
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

.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.vip-badge {
  display: flex;
  align-items: center;
  margin-left: 16rpx;
  padding: 4rpx 16rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 20rpx;
}

.vip-badge text {
  font-size: 22rpx;
  color: #333;
  margin-left: 4rpx;
  font-weight: bold;
}

.vip-card {
  margin: 20rpx;
  padding: 30rpx;
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
  border-radius: 16rpx;
}

.vip-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vip-left {
  display: flex;
  align-items: center;
}

.vip-text {
  margin-left: 20rpx;
}

.vip-title {
  display: block;
  font-size: 32rpx;
  color: #FFD700;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.vip-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.vip-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 32rpx;
}

.vip-btn text {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}

.vip-tag {
  padding: 4rpx 16rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 20rpx;
  margin-right: 16rpx;
}

.vip-tag text {
  font-size: 22rpx;
  color: #333;
}

.menu-list {
  margin-top: 20rpx;
}

.logout-btn {
  padding: 40rpx;
  margin-top: 40rpx;
}
</style>
