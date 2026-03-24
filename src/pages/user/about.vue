<template>
  <view class="about-container">
    <!-- Logo和版本 -->
    <view class="header-section">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="app-name">搭子交友</text>
      <text class="version">版本 {{ version }}</text>
    </view>
    
    <!-- 功能介绍 -->
    <view class="feature-section">
      <view class="section-title">功能介绍</view>
      <view class="feature-list">
        <view class="feature-item">
          <view class="feature-icon">
            <u-icon name="map-fill" size="32" color="#007AFF" />
          </view>
          <view class="feature-content">
            <text class="feature-title">附近的人</text>
            <text class="feature-desc">发现身边的有趣灵魂，找到志同道合的搭子</text>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon">
            <u-icon name="heart-fill" size="32" color="#FF6B9D" />
          </view>
          <view class="feature-content">
            <text class="feature-title">智能匹配</text>
            <text class="feature-desc">基于兴趣和偏好，为你推荐最合适的搭子</text>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon">
            <u-icon name="calendar-fill" size="32" color="#52C41A" />
          </view>
          <view class="feature-content">
            <text class="feature-title">活动发布</text>
            <text class="feature-desc">发起或参与各种线下活动，丰富业余生活</text>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon">
            <u-icon name="chat-fill" size="32" color="#FF9500" />
          </view>
          <view class="feature-content">
            <text class="feature-title">即时聊天</text>
            <text class="feature-desc">与感兴趣的搭子实时沟通，快速建立联系</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 菜单列表 -->
    <view class="menu-section">
      <u-cell-group>
        <u-cell title="用户协议" isLink @click="openAgreement" />
        <u-cell title="隐私政策" isLink @click="openPrivacy" />
        <u-cell title="功能介绍" isLink @click="showFeatures" />
        <u-cell title="联系我们" isLink @click="contactUs" />
        <u-cell title="给应用评分" isLink @click="rateApp" />
      </u-cell-group>
    </view>
    
    <!-- 版权信息 -->
    <view class="footer-section">
      <text class="copyright">© 2024 搭子交友 版权所有</text>
      <text class="company">北京搭子科技有限公司</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const version = ref('1.0.0')

const openAgreement = () => {
  uni.navigateTo({
    url: '/pages/webview/index?url=https://example.com/agreement&title=用户协议'
  })
}

const openPrivacy = () => {
  uni.navigateTo({
    url: '/pages/webview/index?url=https://example.com/privacy&title=隐私政策'
  })
}

const showFeatures = () => {
  uni.showModal({
    title: '功能介绍',
    content: '搭子交友是一款帮助用户找到志同道合伙伴的社交应用。\n\n主要功能包括：\n• 发现附近的人\n• 智能匹配推荐\n• 发布和参与活动\n• 即时聊天沟通\n\n我们致力于打造一个真实、安全、有趣的社交平台。',
    showCancel: false
  })
}

const contactUs = () => {
  uni.showActionSheet({
    itemList: ['客服电话: 400-123-4567', '客服邮箱: support@dazi.com', '微信公众号: 搭子交友'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.makePhoneCall({ phoneNumber: '400-123-4567' })
      }
    }
  })
}

const rateApp = () => {
  // #ifdef APP-PLUS
  uni.showToast({ title: '跳转应用商店...', icon: 'none' })
  // #endif
  // #ifndef APP-PLUS
  uni.showToast({ title: '请在应用商店评分', icon: 'none' })
  // #endif
}
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
  background: #fff;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.version {
  font-size: 28rpx;
  color: #999;
}

.feature-section {
  background: #fff;
  padding: 40rpx;
  margin-top: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.feature-item {
  display: flex;
  align-items: flex-start;
}

.feature-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 16rpx;
  margin-right: 20rpx;
}

.feature-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.feature-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
}

.menu-section {
  margin-top: 20rpx;
}

.footer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
}

.copyright {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.company {
  font-size: 24rpx;
  color: #999;
}
</style>
