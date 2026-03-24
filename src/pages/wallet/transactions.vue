<template>
  <view class="transactions-container">
    <!-- 筛选Tab -->
    <view class="filter-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 交易列表 -->
    <scroll-view
      scroll-y
      class="transaction-list"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="transactions.length === 0 && !loading" class="empty-state">
        <u-icon name="list" size="80" color="#ccc" />
        <text class="empty-text">暂无交易记录</text>
      </view>

      <view
        v-for="item in transactions"
        :key="item.id"
        class="transaction-item"
      >
        <view class="transaction-left">
          <view class="transaction-icon" :class="getTypeClass(item.type)">
            <u-icon :name="getTypeIcon(item.type)" size="32" color="#fff" />
          </view>
          <view class="transaction-info">
            <text class="transaction-type">{{ item.typeName }}</text>
            <text class="transaction-desc">{{ item.description || '-' }}</text>
            <text class="transaction-time">{{ formatTime(item.createdAt) }}</text>
          </view>
        </view>
        <view class="transaction-right">
          <text
            class="transaction-amount"
            :class="{ positive: item.amount > 0, negative: item.amount < 0 }"
          >
            {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
          </text>
          <text class="transaction-balance">余额: {{ item.balance }}</text>
        </view>
      </view>

      <u-loadmore :status="loadStatus" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { walletApi } from '@/api'

const props = defineProps({
  type: {
    type: String,
    default: ''
  }
})

const tabs = [
  { label: '全部', value: '' },
  { label: '充值', value: '1' },
  { label: '消费', value: '2' }
]

const currentTab = ref('')
const transactions = ref([])
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const refreshing = ref(false)
const loadStatus = ref('loadmore')

onMounted(() => {
  if (props.type) {
    currentTab.value = props.type
  }
  loadTransactions()
})

const loadTransactions = async () => {
  if (loading.value) return
  loading.value = true
  loadStatus.value = 'loading'

  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (currentTab.value) {
      params.type = parseInt(currentTab.value)
    }

    const res = await walletApi.getTransactions(params)
    if (res.code === 200) {
      const list = res.data || []
      if (page.value === 1) {
        transactions.value = list
      } else {
        transactions.value = [...transactions.value, ...list]
      }
      loadStatus.value = list.length < pageSize.value ? 'nomore' : 'loadmore'
    }
  } catch (error) {
    console.error('加载交易记录失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
    loadStatus.value = 'loadmore'
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const switchTab = (value) => {
  if (currentTab.value === value) return
  currentTab.value = value
  page.value = 1
  transactions.value = []
  loadTransactions()
}

const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  loadTransactions()
}

const loadMore = () => {
  if (loadStatus.value === 'nomore' || loading.value) return
  page.value++
  loadTransactions()
}

const getTypeClass = (type) => {
  const map = {
    1: 'recharge',    // 充值
    2: 'consume',     // 消费
    3: 'give',        // 赠送
    4: 'receive',     // 接收
    5: 'system',      // 系统赠送
    6: 'checkin'      // 签到
  }
  return map[type] || 'default'
}

const getTypeIcon = (type) => {
  const map = {
    1: 'red-packet',      // 充值
    2: 'shopping-cart',   // 消费
    3: 'gift',            // 赠送
    4: 'gift-fill',       // 接收
    5: 'server-man',      // 系统
    6: 'calendar'         // 签到
  }
  return map[type] || 'list'
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.transactions-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.filter-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #007AFF;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background: #007AFF;
  border-radius: 2rpx;
}

.transaction-list {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.transaction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.transaction-left {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.transaction-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.transaction-icon.recharge {
  background: linear-gradient(135deg, #07C160 0%, #10B981 100%);
}

.transaction-icon.consume {
  background: linear-gradient(135deg, #FF9500 0%, #FFB800 100%);
}

.transaction-icon.give {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
}

.transaction-icon.receive {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.transaction-icon.system {
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
}

.transaction-icon.checkin {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
}

.transaction-icon.default {
  background: #ccc;
}

.transaction-info {
  flex: 1;
}

.transaction-type {
  display: block;
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.transaction-desc {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.transaction-time {
  display: block;
  font-size: 22rpx;
  color: #999;
}

.transaction-right {
  text-align: right;
}

.transaction-amount {
  display: block;
  font-size: 34rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.transaction-amount.positive {
  color: #07C160;
}

.transaction-amount.negative {
  color: #FF3B30;
}

.transaction-balance {
  font-size: 22rpx;
  color: #999;
}
</style>
