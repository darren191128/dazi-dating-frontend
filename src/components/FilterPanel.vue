<template>
  <u-popup :show="visible" mode="right" width="80%" @close="onClose">
    <view class="filter-panel">
      <view class="filter-header">
        <text class="title">筛选条件</text>
        <text class="reset" @click="resetFilters">重置</text>
      </view>
      
      <scroll-view scroll-y class="filter-content">
        <!-- 身高范围 -->
        <view class="filter-section">
          <text class="section-title">身高范围 (cm)</text>
          <view class="range-inputs">
            <input 
              v-model="filters.minHeight" 
              type="number" 
              placeholder="最低"
              class="range-input"
            />
            <text class="range-separator">-</text>
            <input 
              v-model="filters.maxHeight" 
              type="number" 
              placeholder="最高"
              class="range-input"
            />
          </view>
          <view class="quick-tags">
            <text 
              v-for="range in heightRanges" 
              :key="range.label"
              class="tag"
              :class="{ active: isHeightRangeActive(range) }"
              @click="selectHeightRange(range)"
            >
              {{ range.label }}
            </text>
          </view>
        </view>
        
        <!-- 学历 -->
        <view class="filter-section">
          <text class="section-title">学历</text>
          <view class="tag-list">
            <text 
              v-for="edu in educationOptions" 
              :key="edu"
              class="tag"
              :class="{ active: filters.education === edu }"
              @click="selectEducation(edu)"
            >
              {{ edu }}
            </text>
          </view>
        </view>
        
        <!-- 收入范围 -->
        <view class="filter-section">
          <text class="section-title">月收入</text>
          <view class="tag-list">
            <text 
              v-for="income in incomeOptions" 
              :key="income.label"
              class="tag"
              :class="{ active: isIncomeActive(income) }"
              @click="selectIncome(income)"
            >
              {{ income.label }}
            </text>
          </view>
        </view>
        
        <!-- 职业 -->
        <view class="filter-section">
          <text class="section-title">职业</text>
          <view class="tag-list">
            <text 
              v-for="job in occupationOptions" 
              :key="job"
              class="tag"
              :class="{ active: filters.occupation === job }"
              @click="selectOccupation(job)"
            >
              {{ job }}
            </text>
          </view>
        </view>
        
        <!-- 房车情况 -->
        <view class="filter-section">
          <text class="section-title">房车情况</text>
          <view class="switch-list">
            <view class="switch-item">
              <text>有房</text>
              <u-switch v-model="filters.hasHouse" size="20" />
            </view>
            <view class="switch-item">
              <text>有车</text>
              <u-switch v-model="filters.hasCar" size="20" />
            </view>
          </view>
        </view>
        
        <!-- 婚姻状况 -->
        <view class="filter-section">
          <text class="section-title">婚姻状况</text>
          <view class="tag-list">
            <text 
              v-for="status in maritalOptions" 
              :key="status"
              class="tag"
              :class="{ active: filters.maritalStatus === status }"
              @click="selectMaritalStatus(status)"
            >
              {{ status }}
            </text>
          </view>
        </view>
      </scroll-view>
      
      <view class="filter-footer">
        <u-button type="primary" size="large" @click="confirmFilters">
          确认筛选
        </u-button>
      </view>
    </view>
  </u-popup>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'confirm'])

const filters = reactive({
  minHeight: '',
  maxHeight: '',
  education: '',
  occupation: '',
  minIncome: '',
  maxIncome: '',
  hasHouse: false,
  hasCar: false,
  maritalStatus: ''
})

const heightRanges = [
  { label: '150-160', min: 150, max: 160 },
  { label: '160-170', min: 160, max: 170 },
  { label: '170-180', min: 170, max: 180 },
  { label: '180+', min: 180, max: '' }
]

const educationOptions = ['不限', '高中', '大专', '本科', '硕士', '博士']

const incomeOptions = [
  { label: '3K以下', min: 0, max: 3000 },
  { label: '3K-5K', min: 3000, max: 5000 },
  { label: '5K-10K', min: 5000, max: 10000 },
  { label: '10K-20K', min: 10000, max: 20000 },
  { label: '20K-50K', min: 20000, max: 50000 },
  { label: '50K+', min: 50000, max: '' }
]

const occupationOptions = ['不限', 'IT/互联网', '金融', '教育', '医疗', '公务员', '自由职业', '企业高管', '其他']

const maritalOptions = ['不限', '未婚', '离异', '丧偶']

const isHeightRangeActive = (range) => {
  return filters.minHeight == range.min && filters.maxHeight == range.max
}

const selectHeightRange = (range) => {
  if (isHeightRangeActive(range)) {
    filters.minHeight = ''
    filters.maxHeight = ''
  } else {
    filters.minHeight = range.min
    filters.maxHeight = range.max
  }
}

const selectEducation = (edu) => {
  filters.education = filters.education === edu || edu === '不限' ? '' : edu
}

const isIncomeActive = (income) => {
  return filters.minIncome == income.min && filters.maxIncome == income.max
}

const selectIncome = (income) => {
  if (isIncomeActive(income)) {
    filters.minIncome = ''
    filters.maxIncome = ''
  } else {
    filters.minIncome = income.min
    filters.maxIncome = income.max
  }
}

const selectOccupation = (job) => {
  filters.occupation = filters.occupation === job || job === '不限' ? '' : job
}

const selectMaritalStatus = (status) => {
  filters.maritalStatus = filters.maritalStatus === status || status === '不限' ? '' : status
}

const resetFilters = () => {
  filters.minHeight = ''
  filters.maxHeight = ''
  filters.education = ''
  filters.occupation = ''
  filters.minIncome = ''
  filters.maxIncome = ''
  filters.hasHouse = false
  filters.hasCar = false
  filters.maritalStatus = ''
}

const onClose = () => {
  emit('close')
}

const confirmFilters = () => {
  const params = {}
  if (filters.minHeight) params.minHeight = parseInt(filters.minHeight)
  if (filters.maxHeight) params.maxHeight = parseInt(filters.maxHeight)
  if (filters.education) params.education = filters.education
  if (filters.occupation) params.occupation = filters.occupation
  if (filters.minIncome) params.minIncome = parseInt(filters.minIncome)
  if (filters.maxIncome) params.maxIncome = parseInt(filters.maxIncome)
  if (filters.hasHouse) params.hasHouse = true
  if (filters.hasCar) params.hasCar = true
  if (filters.maritalStatus) params.maritalStatus = filters.maritalStatus
  
  emit('confirm', params)
}
</script>

<style scoped>
.filter-panel {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.reset {
  font-size: 28rpx;
  color: #007AFF;
}

.filter-content {
  flex: 1;
  padding: 20rpx;
}

.filter-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.range-inputs {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.range-input {
  flex: 1;
  height: 70rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  text-align: center;
  font-size: 28rpx;
}

.range-separator {
  margin: 0 20rpx;
  color: #999;
}

.quick-tags,
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.2s;
}

.tag.active {
  background: #007AFF;
  color: #fff;
}

.switch-list {
  display: flex;
  gap: 40rpx;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  font-size: 28rpx;
  color: #333;
}

.filter-footer {
  padding: 30rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}
</style>
