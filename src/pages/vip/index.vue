<template>
  <view class="vip-container">
    <!-- VIP头部 -->
    <view class="vip-header" :class="{ 'is-vip': vipStatus.isVip }">
      <view class="header-bg"></view>
      <view class="vip-info">
        <view class="vip-badge">
          <image class="vip-icon" src="/static/vip-crown.png" mode="aspectFit" />
          <text class="vip-text">{{ vipStatus.isVip ? 'VIP会员' : '开通VIP' }}</text>
        </view>
        <view class="vip-status" v-if="vipStatus.isVip">
          <text class="status-text">有效期至 {{ formatDate(vipStatus.expireTime) }}</text>
          <text class="remaining-days">剩余 {{ vipStatus.remainingDays }} 天</text>
        </view>
        <view class="vip-status" v-else>
          <text class="status-text">开通VIP，解锁8大专属特权</text>
        </view>
      </view>
      <view class="renew-btn" v-if="vipStatus.isVip" @click="goToPackages">
        <text>立即续费</text>
      </view>
      <view class="open-btn" v-else @click="goToPackages">
        <text>立即开通</text>
      </view>
    </view>
    
    <!-- VIP特权列表 -->
    <view class="privileges-section">
      <view class="section-title">
        <text class="title-text">VIP特权</text>
        <text class="subtitle">8大专属特权，畅享无限可能</text>
      </view>
      <view class="privileges-grid">
        <view class="privilege-item" v-for="(item, index) in privileges" :key="index">
          <view class="privilege-icon" :class="item.code">
            <u-icon :name="getPrivilegeIcon(item.code)" size="40" color="#FFD700" />
          </view>
          <text class="privilege-name">{{ item.name }}</text>
          <text class="privilege-desc">{{ item.description }}</text>
        </view>
      </view>
    </view>
    
    <!-- 套餐推荐 -->
    <view class="packages-section" v-if="!vipStatus.isVip">
      <view class="section-title">
        <text class="title-text">选择套餐</text>
      </view>
      <view class="package-list">
        <view 
          class="package-card" 
          v-for="(pkg, index) in packages" 
          :key="pkg.id"
          :class="{ 'recommended': pkg.isRecommended, 'selected': selectedPackage === pkg.id }"
          @click="selectPackage(pkg.id)"
        >
          <view class="recommend-tag" v-if="pkg.isRecommended">推荐</view>
          <text class="package-name">{{ pkg.name }}</text>
          <view class="package-price">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ pkg.price }}</text>
          </view>
          <text class="original-price" v-if="pkg.originalPrice">¥{{ pkg.originalPrice }}</text>
          <text class="discount-info" v-if="pkg.discountInfo">{{ pkg.discountInfo }}</text>
          <text class="daily-price">{{ pkg.dailyPrice }}元/天</text>
        </view>
      </view>
    </view>
    
    <!-- 底部支付按钮 -->
    <view class="footer-action" v-if="!vipStatus.isVip">
      <view class="price-info">
        <text class="label">实付金额：</text>
        <text class="symbol">¥</text>
        <text class="amount">{{ selectedPackagePrice }}</text>
      </view>
      <u-button 
        type="warning" 
        size="large" 
        :loading="paying"
        @click="handlePay"
      >
        立即支付
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { vipApi } from '@/api'

const vipStatus = ref({
  isVip: false,
  expireTime: null,
  remainingDays: 0,
  privileges: []
})

const packages = ref([])
const selectedPackage = ref(null)
const paying = ref(false)
const privileges = ref([])

const selectedPackagePrice = computed(() => {
  const pkg = packages.value.find(p => p.id === selectedPackage.value)
  return pkg ? pkg.price : '0.00'
})

onMounted(() => {
  loadVipStatus()
  loadPackages()
  loadPrivileges()
})

const loadVipStatus = async () => {
  try {
    const res = await vipApi.getVipStatus()
    if (res.code === 200) {
      vipStatus.value = res.data
    }
  } catch (error) {
    console.error('加载VIP状态失败:', error)
  }
}

const loadPackages = async () => {
  try {
    const res = await vipApi.getPackages()
    if (res.code === 200) {
      packages.value = res.data
      // 默认选择推荐的套餐
      const recommended = res.data.find(p => p.isRecommended)
      selectedPackage.value = recommended ? recommended.id : res.data[0]?.id
    }
  } catch (error) {
    console.error('加载套餐失败:', error)
  }
}

const loadPrivileges = async () => {
  try {
    const res = await vipApi.getPrivileges()
    if (res.code === 200) {
      privileges.value = res.data
    }
  } catch (error) {
    console.error('加载特权失败:', error)
  }
}

const selectPackage = (id) => {
  selectedPackage.value = id
}

const goToPackages = () => {
  uni.navigateTo({ url: '/pages/vip/packages' })
}

const handlePay = async () => {
  if (!selectedPackage.value) {
    uni.showToast({ title: '请选择套餐', icon: 'none' })
    return
  }
  
  paying.value = true
  try {
    const res = await vipApi.subscribe({
      packageId: selectedPackage.value,
      payType: 'wechat'
    })
    
    if (res.code === 200) {
      // 调用微信支付
      // TODO: 接入微信支付SDK
      uni.showToast({ title: '支付成功', icon: 'success' })
      setTimeout(() => {
        loadVipStatus()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '支付失败', icon: 'none' })
    }
  } catch (error) {
    console.error('支付失败:', error)
    uni.showToast({ title: '支付失败', icon: 'none' })
  } finally {
    paying.value = false
  }
}

const getPrivilegeIcon = (code) => {
  const iconMap = {
    'unlimited_swipe': 'reload',
    'visitor_stealth': 'eye-off',
    'advanced_filter': 'filter',
    'read_receipt': 'mail-open',
    'vip_badge': 'medal',
    'priority_recommend': 'arrow-up',
    'view_visitors': 'eye',
    'super_like': 'heart'
  }
  return iconMap[code] || 'star'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.vip-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

.vip-header {
  position: relative;
  padding: 60rpx 40rpx;
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
  overflow: hidden;
}

.vip-header.is-vip {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/static/vip-bg.png') center/cover;
  opacity: 0.1;
}

.vip-info {
  position: relative;
  z-index: 1;
}

.vip-badge {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.vip-icon {
  width: 60rpx;
  height: 60rpx;
  margin-right: 16rpx;
}

.vip-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #FFD700;
}

.vip-header.is-vip .vip-text {
  color: #fff;
}

.vip-status {
  display: flex;
  flex-direction: column;
}

.status-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8rpx;
}

.remaining-days {
  font-size: 32rpx;
  color: #FFD700;
  font-weight: bold;
}

.vip-header.is-vip .remaining-days {
  color: #fff;
}

.open-btn, .renew-btn {
  position: absolute;
  right: 40rpx;
  top: 50%;
  transform: translateY(-50%);
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 40rpx;
  z-index: 1;
}

.open-btn text, .renew-btn text {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.privileges-section, .packages-section {
  margin: 20rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
}

.section-title {
  margin-bottom: 30rpx;
}

.title-text {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.subtitle {
  font-size: 24rpx;
  color: #999;
}

.privileges-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx;
}

.privilege-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.privilege-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.privilege-name {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.privilege-desc {
  font-size: 20rpx;
  color: #999;
}

.package-list {
  display: flex;
  gap: 20rpx;
}

.package-card {
  flex: 1;
  position: relative;
  padding: 30rpx 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  text-align: center;
  background: #fff;
}

.package-card.selected {
  border-color: #FFD700;
  background: #FFFBF0;
}

.package-card.recommended {
  border-color: #FFD700;
}

.recommend-tag {
  position: absolute;
  top: -2rpx;
  right: -2rpx;
  padding: 4rpx 16rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #fff;
  font-size: 20rpx;
  border-radius: 0 16rpx 0 16rpx;
}

.package-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.package-price {
  margin-bottom: 8rpx;
}

.price-symbol {
  font-size: 24rpx;
  color: #FF6B6B;
}

.price-value {
  font-size: 48rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.original-price {
  display: block;
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
  margin-bottom: 8rpx;
}

.discount-info {
  display: block;
  font-size: 20rpx;
  color: #FF6B6B;
  margin-bottom: 8rpx;
}

.daily-price {
  font-size: 20rpx;
  color: #999;
}

.footer-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 40rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-info {
  display: flex;
  align-items: baseline;
}

.price-info .label {
  font-size: 28rpx;
  color: #666;
}

.price-info .symbol {
  font-size: 24rpx;
  color: #FF6B6B;
}

.price-info .amount {
  font-size: 48rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.footer-action :deep(.u-button) {
  width: 280rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: none;
  color: #333;
  font-weight: bold;
}
</style>
