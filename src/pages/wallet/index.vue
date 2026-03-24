<template>
  <view class="wallet-container">
    <!-- 余额卡片 -->
    <view class="balance-card">
      <view class="balance-header">
        <text class="balance-title">我的资产</text>
      </view>
      <view class="balance-content">
        <view class="balance-item">
          <view class="balance-icon gold">
            <u-icon name="gold-coin" size="48" color="#FFD700" />
          </view>
          <view class="balance-info">
            <text class="balance-label">金币</text>
            <text class="balance-value">{{ wallet.goldCoin || 0 }}</text>
          </view>
          <view class="balance-action">
            <u-button type="warning" size="small" text="充值" @click="goToRecharge" />
          </view>
        </view>
        <view class="balance-divider" />
        <view class="balance-item">
          <view class="balance-icon point">
            <u-icon name="integral" size="48" color="#FF6B6B" />
          </view>
          <view class="balance-info">
            <text class="balance-label">积分</text>
            <text class="balance-value">{{ wallet.point || 0 }}</text>
          </view>
          <view class="balance-action">
            <text class="point-desc">可兑换特权</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-value">¥{{ wallet.totalRecharge || '0.00' }}</text>
        <text class="stats-label">累计充值</text>
      </view>
      <view class="stats-divider" />
      <view class="stats-item">
        <text class="stats-value">¥{{ wallet.totalConsume || '0.00' }}</text>
        <text class="stats-label">累计消费</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-list">
      <u-cell-group>
        <u-cell title="交易记录" icon="list" @click="goToTransactions" isLink>
          <template #right-icon>
            <u-icon name="arrow-right" size="16" color="#999" />
          </template>
        </u-cell>
        <u-cell title="充值记录" icon="red-packet" @click="goToRechargeRecords" isLink>
          <template #right-icon>
            <u-icon name="arrow-right" size="16" color="#999" />
          </template>
        </u-cell>
      </u-cell-group>
    </view>

    <!-- 充值提示 -->
    <view class="recharge-tips">
      <text class="tips-title">充值说明</text>
      <text class="tips-item">1. 金币可用于购买礼物、解锁特权等功能</text>
      <text class="tips-item">2. 积分可通过签到、活动获得，可兑换金币</text>
      <text class="tips-item">3. 充值后金币实时到账，不支持退款</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { walletApi } from '@/api'

const wallet = ref({})

onMounted(() => {
  loadWallet()
})

const loadWallet = async () => {
  try {
    const res = await walletApi.getWallet()
    if (res.code === 200) {
      wallet.value = res.data
    }
  } catch (error) {
    console.error('加载钱包失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const goToRecharge = () => {
  uni.navigateTo({ url: '/pages/wallet/recharge' })
}

const goToTransactions = () => {
  uni.navigateTo({ url: '/pages/wallet/transactions' })
}

const goToRechargeRecords = () => {
  uni.navigateTo({ url: '/pages/wallet/transactions?type=1' })
}
</script>

<style scoped>
.wallet-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
}

.balance-header {
  margin-bottom: 30rpx;
}

.balance-title {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.balance-content {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 30rpx;
}

.balance-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
}

.balance-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.balance-icon.gold {
  background: rgba(255, 215, 0, 0.2);
}

.balance-icon.point {
  background: rgba(255, 107, 107, 0.2);
}

.balance-info {
  flex: 1;
}

.balance-label {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8rpx;
}

.balance-value {
  display: block;
  font-size: 44rpx;
  color: #fff;
  font-weight: bold;
}

.balance-action {
  width: 140rpx;
}

.point-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.balance-divider {
  height: 1rpx;
  background: rgba(255, 255, 255, 0.2);
  margin: 20rpx 0;
}

.stats-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.stats-item {
  flex: 1;
  text-align: center;
}

.stats-value {
  display: block;
  font-size: 36rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.stats-label {
  font-size: 24rpx;
  color: #999;
}

.stats-divider {
  width: 1rpx;
  background: #eee;
  margin: 0 20rpx;
}

.menu-list {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.recharge-tips {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.tips-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.tips-item {
  display: block;
  font-size: 24rpx;
  color: #666;
  line-height: 1.8;
}
</style>
