<template>
  <view class="packages-container">
    <!-- 头部 -->
    <view class="header">
      <text class="title">选择VIP套餐</text>
      <text class="subtitle">解锁全部特权，畅享无限可能</text>
    </view>
    
    <!-- 套餐列表 -->
    <view class="packages-list">
      <view 
        class="package-item" 
        v-for="(pkg, index) in packages" 
        :key="pkg.id"
        :class="{ 'recommended': pkg.isRecommended, 'selected': selectedPackage === pkg.id }"
        @click="selectPackage(pkg.id)"
      >
        <view class="recommend-badge" v-if="pkg.isRecommended">
          <text>超值推荐</text>
        </view>
        
        <view class="package-header">
          <text class="package-name">{{ pkg.name }}</text>
          <view class="package-duration">
            <text>{{ pkg.durationDays }}天</text>
          </view>
        </view>
        
        <view class="package-body">
          <view class="price-section">
            <text class="price-symbol">¥</text>
            <text class="price-value">{{ pkg.price }}</text>
            <text class="price-unit">/ {{ formatDuration(pkg.durationDays) }}</text>
          </view>
          <text class="original-price" v-if="pkg.originalPrice">
            原价 ¥{{ pkg.originalPrice }}
          </text>
          <view class="discount-badge" v-if="pkg.discountInfo">
            <text>{{ pkg.discountInfo }}</text>
          </view>
        </view>
        
        <view class="package-footer">
          <text class="daily-price">低至 {{ pkg.dailyPrice }}元/天</text>
          <view class="select-indicator" v-if="selectedPackage === pkg.id">
            <u-icon name="checkmark" size="24" color="#FFD700" />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 特权说明 -->
    <view class="privileges-section">
      <text class="section-title">VIP特权说明</text>
      <view class="privilege-list">
        <view class="privilege-item" v-for="(item, index) in privileges" :key="index">
          <view class="privilege-icon">
            <u-icon :name="getPrivilegeIcon(item.code)" size="32" color="#FFD700" />
          </view>
          <view class="privilege-content">
            <text class="privilege-name">{{ item.name }}</text>
            <text class="privilege-desc">{{ item.description }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部支付栏 -->
    <view class="pay-bar">
      <view class="pay-info">
        <view class="selected-info">
          <text class="label">已选择：</text>
          <text class="package-name">{{ selectedPackageInfo?.name }}</text>
        </view>
        <view class="pay-amount">
          <text class="label">实付金额：</text>
          <text class="symbol">¥</text>
          <text class="amount">{{ selectedPackageInfo?.price || '0.00' }}</text>
        </view>
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

const packages = ref([])
const privileges = ref([])
const selectedPackage = ref(null)
const paying = ref(false)

const selectedPackageInfo = computed(() => {
  return packages.value.find(p => p.id === selectedPackage.value)
})

onMounted(() => {
  loadPackages()
  loadPrivileges()
})

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
    uni.showToast({ title: '加载失败', icon: 'none' })
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

const formatDuration = (days) => {
  if (days >= 365) {
    return '年'
  } else if (days >= 90) {
    return '季'
  } else if (days >= 30) {
    return '月'
  }
  return '期'
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
      // TODO: 接入微信支付SDK
      uni.showToast({ title: '支付成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
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
</script>

<style scoped>
.packages-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 200rpx;
}

.header {
  padding: 60rpx 40rpx;
  background: linear-gradient(135deg, #434343 0%, #000000 100%);
  text-align: center;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #FFD700;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
}

.packages-list {
  padding: 30rpx;
}

.package-item {
  position: relative;
  margin-bottom: 30rpx;
  padding: 40rpx;
  background: #fff;
  border-radius: 20rpx;
  border: 4rpx solid transparent;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.package-item.selected {
  border-color: #FFD700;
  background: linear-gradient(135deg, #FFFBF0 0%, #FFF8DC 100%);
}

.package-item.recommended {
  border-color: #FFD700;
}

.recommend-badge {
  position: absolute;
  top: -4rpx;
  right: 40rpx;
  padding: 8rpx 24rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 0 0 16rpx 16rpx;
}

.recommend-badge text {
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.package-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.package-duration {
  padding: 8rpx 20rpx;
  background: #f0f0f0;
  border-radius: 20rpx;
}

.package-duration text {
  font-size: 24rpx;
  color: #666;
}

.package-body {
  margin-bottom: 30rpx;
}

.price-section {
  display: flex;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.price-symbol {
  font-size: 32rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.price-value {
  font-size: 72rpx;
  color: #FF6B6B;
  font-weight: bold;
  margin: 0 8rpx;
}

.price-unit {
  font-size: 28rpx;
  color: #999;
}

.original-price {
  display: block;
  font-size: 26rpx;
  color: #999;
  text-decoration: line-through;
  margin-bottom: 12rpx;
}

.discount-badge {
  display: inline-block;
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  border-radius: 8rpx;
}

.discount-badge text {
  font-size: 24rpx;
  color: #fff;
}

.package-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.daily-price {
  font-size: 26rpx;
  color: #666;
}

.select-indicator {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #FFD700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.privileges-section {
  margin: 0 30rpx 30rpx;
  padding: 40rpx;
  background: #fff;
  border-radius: 20rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.privilege-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.privilege-item {
  display: flex;
  align-items: flex-start;
}

.privilege-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.privilege-content {
  flex: 1;
}

.privilege-content .privilege-name {
  display: block;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.privilege-content .privilege-desc {
  font-size: 26rpx;
  color: #999;
}

.pay-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx 40rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pay-info {
  flex: 1;
}

.selected-info {
  margin-bottom: 8rpx;
}

.selected-info .label {
  font-size: 26rpx;
  color: #666;
}

.selected-info .package-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.pay-amount {
  display: flex;
  align-items: baseline;
}

.pay-amount .label {
  font-size: 26rpx;
  color: #666;
}

.pay-amount .symbol {
  font-size: 28rpx;
  color: #FF6B6B;
  margin-left: 8rpx;
}

.pay-amount .amount {
  font-size: 48rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.pay-bar :deep(.u-button) {
  width: 280rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border: none;
  color: #333;
  font-weight: bold;
  font-size: 32rpx;
}
</style>
