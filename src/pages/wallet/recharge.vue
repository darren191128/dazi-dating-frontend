<template>
  <view class="recharge-container">
    <!-- 当前余额 -->
    <view class="balance-section">
      <text class="balance-label">当前金币余额</text>
      <text class="balance-value">{{ currentGoldCoin }}</text>
    </view>

    <!-- 充值套餐 -->
    <view class="package-section">
      <text class="section-title">选择充值套餐</text>
      <view class="package-grid">
        <view
          v-for="pkg in packages"
          :key="pkg.id"
          class="package-item"
          :class="{ active: selectedPackage === pkg.id, hot: pkg.isHot }"
          @click="selectPackage(pkg)"
        >
          <view v-if="pkg.isHot" class="hot-tag">超值</view>
          <text class="package-coin">{{ pkg.goldCoin }}金币</text>
          <text v-if="pkg.bonusCoin > 0" class="package-bonus">送{{ pkg.bonusCoin }}</text>
          <text class="package-price">¥{{ pkg.price }}</text>
        </view>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="payment-section">
      <text class="section-title">支付方式</text>
      <view class="payment-item">
        <view class="payment-left">
          <u-icon name="weixin-circle-fill" size="48" color="#07C160" />
          <text class="payment-name">微信支付</text>
        </view>
        <u-icon name="checkmark-circle-fill" size="40" color="#007AFF" />
      </view>
    </view>

    <!-- 充值按钮 -->
    <view class="recharge-btn">
      <u-button
        type="warning"
        size="large"
        :text="`立即支付 ¥${selectedPrice}`"
        @click="handleRecharge"
        :loading="loading"
      />
    </view>

    <!-- 充值说明 -->
    <view class="recharge-tips">
      <text class="tips-title">充值说明</text>
      <text class="tips-item">1. 充值比例：1元 = 10金币</text>
      <text class="tips-item">2. 充值越多赠送越多，最高赠送1500金币</text>
      <text class="tips-item">3. 金币可用于购买礼物、解锁特权等功能</text>
      <text class="tips-item">4. 充值后金币实时到账，不支持退款</text>
      <text class="tips-item">5. 如有问题请联系客服</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { walletApi } from '@/api'

const packages = ref([])
const selectedPackage = ref(null)
const currentGoldCoin = ref(0)
const loading = ref(false)

const selectedPrice = computed(() => {
  const pkg = packages.value.find(p => p.id === selectedPackage.value)
  return pkg ? pkg.price : 0
})

onMounted(() => {
  loadPackages()
  loadWallet()
})

const loadPackages = async () => {
  try {
    const res = await walletApi.getRechargePackages()
    if (res.code === 200) {
      packages.value = res.data
      // 默认选中第一个
      if (packages.value.length > 0) {
        selectedPackage.value = packages.value[0].id
      }
    }
  } catch (error) {
    console.error('加载充值套餐失败:', error)
    // 使用默认套餐
    packages.value = [
      { id: 1, name: '60金币', price: 6, goldCoin: 60, bonusCoin: 0, isHot: false },
      { id: 2, name: '330金币', price: 30, goldCoin: 300, bonusCoin: 30, isHot: false },
      { id: 3, name: '760金币', price: 68, goldCoin: 680, bonusCoin: 80, isHot: true },
      { id: 4, name: '1480金币', price: 128, goldCoin: 1280, bonusCoin: 200, isHot: false },
      { id: 5, name: '3880金币', price: 328, goldCoin: 3280, bonusCoin: 600, isHot: true },
      { id: 6, name: '7980金币', price: 648, goldCoin: 6480, bonusCoin: 1500, isHot: true }
    ]
    selectedPackage.value = 1
  }
}

const loadWallet = async () => {
  try {
    const res = await walletApi.getWallet()
    if (res.code === 200) {
      currentGoldCoin.value = res.data.goldCoin
    }
  } catch (error) {
    console.error('加载钱包失败:', error)
  }
}

const selectPackage = (pkg) => {
  selectedPackage.value = pkg.id
}

const handleRecharge = async () => {
  if (!selectedPackage.value) {
    uni.showToast({ title: '请选择充值套餐', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await walletApi.createRechargeOrder({ packageId: selectedPackage.value })
    if (res.code === 200) {
      // 调用微信支付
      const orderNo = res.data.orderNo
      requestWxPayment(orderNo)
    } else {
      uni.showToast({ title: res.message || '创建订单失败', icon: 'none' })
    }
  } catch (error) {
    console.error('创建充值订单失败:', error)
    uni.showToast({ title: '创建订单失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const requestWxPayment = (orderNo) => {
  // 这里应该调用后端接口获取微信支付参数
  // 暂时模拟支付成功
  uni.showModal({
    title: '模拟支付',
    content: '是否模拟支付成功？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '支付成功', icon: 'success' })
        setTimeout(() => {
          loadWallet()
          uni.navigateBack()
        }, 1500)
      }
    }
  })
}
</script>

<style scoped>
.recharge-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.balance-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 20rpx;
}

.balance-label {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16rpx;
}

.balance-value {
  display: block;
  font-size: 56rpx;
  color: #fff;
  font-weight: bold;
}

.package-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 24rpx;
}

.package-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.package-item {
  width: calc(33.33% - 14rpx);
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 24rpx;
  text-align: center;
  border: 2rpx solid transparent;
  position: relative;
}

.package-item.active {
  background: #FFF8E7;
  border-color: #FFD700;
}

.hot-tag {
  position: absolute;
  top: -2rpx;
  right: -2rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 0 12rpx 0 12rpx;
}

.package-coin {
  display: block;
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.package-bonus {
  display: block;
  font-size: 22rpx;
  color: #FF6B6B;
  margin-bottom: 8rpx;
}

.package-price {
  display: block;
  font-size: 28rpx;
  color: #FF9500;
  font-weight: bold;
}

.payment-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
}

.payment-left {
  display: flex;
  align-items: center;
}

.payment-name {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #333;
}

.recharge-btn {
  margin: 40rpx 20rpx;
}

.recharge-tips {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 20rpx;
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
