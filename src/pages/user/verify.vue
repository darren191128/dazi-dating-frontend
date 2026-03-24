<template>
  <view class="verify-container">
    <!-- 认证状态卡片 -->
    <view class="status-card" :class="verifyStatus">
      <view class="status-icon">
        <u-icon :name="statusIcon" size="48" :color="statusColor" />
      </view>
      <text class="status-title">{{ statusTitle }}</text>
      <text class="status-desc">{{ statusDesc }}</text>
    </view>
    
    <!-- 认证表单 -->
    <view class="form-section" v-if="verifyStatus === 'unverified' || verifyStatus === 'rejected'">
      <view class="section-title">实名认证信息</view>
      
      <u-cell-group>
        <u-cell title="真实姓名">
          <template #value>
            <input 
              class="cell-input" 
              v-model="form.realName" 
              placeholder="请输入真实姓名"
              maxlength="20"
            />
          </template>
        </u-cell>
        
        <u-cell title="身份证号">
          <template #value>
            <input 
              class="cell-input" 
              v-model="form.idCard" 
              placeholder="请输入18位身份证号"
              maxlength="18"
              type="idcard"
            />
          </template>
        </u-cell>
      </u-cell-group>
      
      <!-- 身份证上传 -->
      <view class="upload-section">
        <view class="upload-title">身份证正面照</view>
        <view class="upload-area" @click="chooseIdCardFront">
          <image v-if="form.idCardFront" :src="form.idCardFront" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <u-icon name="plus" size="32" color="#ccc" />
            <text>点击上传</text>
          </view>
        </view>
      </view>
      
      <view class="upload-section">
        <view class="upload-title">身份证反面照</view>
        <view class="upload-area" @click="chooseIdCardBack">
          <image v-if="form.idCardBack" :src="form.idCardBack" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <u-icon name="plus" size="32" color="#ccc" />
            <text>点击上传</text>
          </view>
        </view>
      </view>
      
      <!-- 手持身份证 -->
      <view class="upload-section">
        <view class="upload-title">手持身份证照</view>
        <view class="upload-area" @click="chooseIdCardHold">
          <image v-if="form.idCardHold" :src="form.idCardHold" mode="aspectFill" />
          <view v-else class="upload-placeholder">
            <u-icon name="plus" size="32" color="#ccc" />
            <text>点击上传</text>
          </view>
        </view>
        <text class="upload-tip">请确保脸部和身份证信息清晰可见</text>
      </view>
    </view>
    
    <!-- 已认证信息展示 -->
    <view class="verified-info" v-if="verifyStatus === 'verified'">
      <u-cell-group>
        <u-cell title="真实姓名" :value="verifiedInfo.realName" />
        <u-cell title="身份证号" :value="maskIdCard(verifiedInfo.idCard)" />
        <u-cell title="认证时间" :value="verifiedInfo.verifyTime" />
      </u-cell-group>
    </view>
    
    <!-- 提交按钮 -->
    <view class="submit-btn" v-if="verifyStatus === 'unverified' || verifyStatus === 'rejected'">
      <u-button type="primary" @click="submitVerify" :loading="submitting">提交认证</u-button>
    </view>
    
    <!-- 认证说明 -->
    <view class="tips-section">
      <view class="tips-title">认证说明</view>
      <view class="tips-list">
        <text class="tip-item">1. 实名认证信息仅用于身份验证，不会对外公开</text>
        <text class="tip-item">2. 认证通过后，您的信用分将提升，更容易获得他人信任</text>
        <text class="tip-item">3. 请确保上传的证件照片清晰、完整、真实有效</text>
        <text class="tip-item">4. 认证审核通常需要1-3个工作日</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userApi } from '@/api'

const verifyStatus = ref('unverified') // unverified, pending, verified, rejected
const verifiedInfo = ref({})
const submitting = ref(false)

const form = ref({
  realName: '',
  idCard: '',
  idCardFront: '',
  idCardBack: '',
  idCardHold: ''
})

const statusIcon = computed(() => {
  const icons = {
    unverified: 'info-circle',
    pending: 'clock',
    verified: 'checkmark-circle',
    rejected: 'close-circle'
  }
  return icons[verifyStatus.value]
})

const statusColor = computed(() => {
  const colors = {
    unverified: '#999',
    pending: '#FF9500',
    verified: '#52C41A',
    rejected: '#FF4D4F'
  }
  return colors[verifyStatus.value]
})

const statusTitle = computed(() => {
  const titles = {
    unverified: '未认证',
    pending: '审核中',
    verified: '已认证',
    rejected: '认证失败'
  }
  return titles[verifyStatus.value]
})

const statusDesc = computed(() => {
  const descs = {
    unverified: '完成实名认证，提升信用分',
    pending: '您的认证信息正在审核中，请耐心等待',
    verified: '您已完成实名认证，信用分已提升',
    rejected: '认证未通过，请检查信息后重新提交'
  }
  return descs[verifyStatus.value]
})

onMounted(() => {
  loadVerifyStatus()
})

const loadVerifyStatus = async () => {
  try {
    // 这里应该调用获取认证状态的接口
    // const res = await userApi.getVerifyStatus()
    // if (res.code === 200) {
    //   verifyStatus.value = res.data.status
    //   verifiedInfo.value = res.data.info || {}
    // }
  } catch (error) {
    console.error('加载认证状态失败:', error)
  }
}

const chooseIdCardFront = () => {
  chooseImage('idCardFront')
}

const chooseIdCardBack = () => {
  chooseImage('idCardBack')
}

const chooseIdCardHold = () => {
  chooseImage('idCardHold')
}

const chooseImage = (field) => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      try {
        uni.showLoading({ title: '上传中...' })
        // 这里应该调用上传接口
        // const result = await userApi.uploadIdCard(tempFilePath)
        // if (result.code === 200) {
        //   form.value[field] = result.data.url
        // }
        // 模拟上传成功
        form.value[field] = tempFilePath
        uni.showToast({ title: '上传成功', icon: 'success' })
      } catch (error) {
        console.error('上传失败:', error)
        uni.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

const maskIdCard = (idCard) => {
  if (!idCard || idCard.length !== 18) return idCard
  return idCard.substring(0, 6) + '********' + idCard.substring(14)
}

const submitVerify = async () => {
  // 表单验证
  if (!form.value.realName.trim()) {
    uni.showToast({ title: '请输入真实姓名', icon: 'none' })
    return
  }
  if (!form.value.idCard.trim() || form.value.idCard.length !== 18) {
    uni.showToast({ title: '请输入正确的身份证号', icon: 'none' })
    return
  }
  if (!form.value.idCardFront) {
    uni.showToast({ title: '请上传身份证正面照', icon: 'none' })
    return
  }
  if (!form.value.idCardBack) {
    uni.showToast({ title: '请上传身份证反面照', icon: 'none' })
    return
  }
  if (!form.value.idCardHold) {
    uni.showToast({ title: '请上传手持身份证照', icon: 'none' })
    return
  }
  
  try {
    submitting.value = true
    // 这里应该调用提交认证的接口
    // const res = await userApi.submitVerify(form.value)
    // if (res.code === 200) {
    //   verifyStatus.value = 'pending'
    //   uni.showToast({ title: '提交成功', icon: 'success' })
    // }
    // 模拟提交成功
    setTimeout(() => {
      verifyStatus.value = 'pending'
      uni.showToast({ title: '提交成功', icon: 'success' })
    }, 1500)
  } catch (error) {
    console.error('提交认证失败:', error)
    uni.showToast({ title: '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.verify-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.status-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.status-icon {
  margin-bottom: 20rpx;
}

.status-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.status-desc {
  font-size: 28rpx;
  color: #999;
}

.form-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.cell-input {
  text-align: right;
  font-size: 28rpx;
  color: #333;
}

.upload-section {
  margin-top: 30rpx;
}

.upload-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.upload-area {
  width: 100%;
  height: 300rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.upload-placeholder text {
  font-size: 28rpx;
  color: #999;
}

.upload-tip {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
}

.verified-info {
  background: #fff;
  margin-bottom: 20rpx;
}

.submit-btn {
  padding: 40rpx;
  margin-bottom: 20rpx;
}

.tips-section {
  background: #fff;
  padding: 30rpx;
  margin: 0 20rpx;
  border-radius: 16rpx;
}

.tips-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tip-item {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
</style>
