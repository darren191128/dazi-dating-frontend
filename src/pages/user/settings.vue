<template>
  <view class="settings-container">
    <!-- 账号设置 -->
    <view class="settings-group">
      <view class="group-title">账号设置</view>
      <u-cell-group>
        <u-cell title="修改手机号" icon="phone" isLink @click="changePhone" />
        <u-cell title="修改密码" icon="lock" isLink @click="changePassword" />
        <u-cell title="绑定微信" icon="weixin-fill" isLink @click="bindWechat">
          <template #value>
            <text class="bind-status" :class="{ bound: isWechatBound }">{{ isWechatBound ? '已绑定' : '未绑定' }}</text>
          </template>
        </u-cell>
      </u-cell-group>
    </view>
    
    <!-- 消息通知 -->
    <view class="settings-group">
      <view class="group-title">消息通知</view>
      <u-cell-group>
        <u-cell title="接收新消息通知">
          <template #value>
            <u-switch v-model="settings.messageNotification" @change="saveSettings" />
          </template>
        </u-cell>
        <u-cell title="接收活动提醒">
          <template #value>
            <u-switch v-model="settings.activityReminder" @change="saveSettings" />
          </template>
        </u-cell>
        <u-cell title="接收匹配推荐">
          <template #value>
            <u-switch v-model="settings.matchRecommendation" @change="saveSettings" />
          </template>
        </u-cell>
        <u-cell title="声音提醒">
          <template #value>
            <u-switch v-model="settings.soundEnabled" @change="saveSettings" />
          </template>
        </u-cell>
        <u-cell title="振动提醒">
          <template #value>
            <u-switch v-model="settings.vibrationEnabled" @change="saveSettings" />
          </template>
        </u-cell>
      </u-cell-group>
    </view>
    
    <!-- 隐私设置 -->
    <view class="settings-group">
      <view class="group-title">隐私设置</view>
      <u-cell-group>
        <u-cell title="允许附近的人找到我">
          <template #value>
            <u-switch v-model="settings.allowNearby" @change="saveSettings" />
          </template>
        </u-cell>
        <u-cell title="允许推荐匹配">
          <template #value>
            <u-switch v-model="settings.allowRecommendation" @change="saveSettings" />
          </template>
        </u-cell>
        <u-cell title="个人资料可见范围" isLink @click="showPrivacyPicker = true">
          <template #value>
            <text>{{ privacyText }}</text>
          </template>
        </u-cell>
      </u-cell-group>
    </view>
    
    <!-- 通用设置 -->
    <view class="settings-group">
      <view class="group-title">通用设置</view>
      <u-cell-group>
        <u-cell title="清除缓存" isLink @click="clearCache">
          <template #value>
            <text class="cache-size">{{ cacheSize }}</text>
          </template>
        </u-cell>
        <u-cell title="关于版本" isLink @click="showVersion">
          <template #value>
            <text>v{{ version }}</text>
          </template>
        </u-cell>
      </u-cell-group>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-section">
      <u-button type="error" plain @click="logout">退出登录</u-button>
    </view>
    
    <!-- 隐私设置选择器 -->
    <u-picker
      :show="showPrivacyPicker"
      :columns="[privacyOptions]"
      keyName="label"
      @confirm="onPrivacyConfirm"
      @cancel="showPrivacyPicker = false"
    />
    
    <!-- 修改密码弹窗 -->
    <u-popup :show="showPasswordPopup" mode="center" round="16" @close="showPasswordPopup = false">
      <view class="password-popup">
        <view class="popup-title">修改密码</view>
        <input class="popup-input" v-model="passwordForm.oldPassword" placeholder="请输入原密码" password />
        <input class="popup-input" v-model="passwordForm.newPassword" placeholder="请输入新密码" password />
        <input class="popup-input" v-model="passwordForm.confirmPassword" placeholder="请确认新密码" password />
        <view class="popup-btns">
          <u-button @click="showPasswordPopup = false">取消</u-button>
          <u-button type="primary" @click="submitPassword" :loading="submitting">确定</u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const isWechatBound = ref(true)
const cacheSize = ref('12.5MB')
const version = ref('1.0.0')
const showPrivacyPicker = ref(false)
const showPasswordPopup = ref(false)
const submitting = ref(false)

const settings = ref({
  messageNotification: true,
  activityReminder: true,
  matchRecommendation: true,
  soundEnabled: true,
  vibrationEnabled: true,
  allowNearby: true,
  allowRecommendation: true,
  privacyLevel: 'public'
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const privacyOptions = [
  { label: '公开', value: 'public' },
  { label: '仅好友可见', value: 'friends' },
  { label: '私密', value: 'private' }
]

const privacyText = computed(() => {
  const option = privacyOptions.find(item => item.value === settings.value.privacyLevel)
  return option?.label || '公开'
})

onMounted(() => {
  loadSettings()
})

const loadSettings = () => {
  const savedSettings = uni.getStorageSync('userSettings')
  if (savedSettings) {
    settings.value = { ...settings.value, ...savedSettings }
  }
}

const saveSettings = () => {
  uni.setStorageSync('userSettings', settings.value)
  uni.showToast({ title: '设置已保存', icon: 'none' })
}

const onPrivacyConfirm = (e) => {
  settings.value.privacyLevel = e.value[0]?.value
  showPrivacyPicker.value = false
  saveSettings()
}

const changePhone = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const changePassword = () => {
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  showPasswordPopup.value = true
}

const submitPassword = () => {
  if (!passwordForm.value.oldPassword) {
    uni.showToast({ title: '请输入原密码', icon: 'none' })
    return
  }
  if (!passwordForm.value.newPassword) {
    uni.showToast({ title: '请输入新密码', icon: 'none' })
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }
  
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    showPasswordPopup.value = false
    uni.showToast({ title: '密码修改成功', icon: 'success' })
  }, 1500)
}

const bindWechat = () => {
  if (isWechatBound.value) {
    uni.showModal({
      title: '解绑微信',
      content: '确定要解绑微信吗？',
      success: (res) => {
        if (res.confirm) {
          isWechatBound.value = false
          uni.showToast({ title: '解绑成功', icon: 'success' })
        }
      }
    })
  } else {
    uni.showToast({ title: '功能开发中', icon: 'none' })
  }
}

const clearCache = () => {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorage()
        cacheSize.value = '0MB'
        uni.showToast({ title: '清除成功', icon: 'success' })
      }
    }
  })
}

const showVersion = () => {
  uni.showModal({
    title: '关于版本',
    content: `当前版本: v${version.value}\n最新版本: v${version.value}\n\n已是最新版本`,
    showCancel: false
  })
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
.settings-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.settings-group {
  margin-bottom: 20rpx;
}

.group-title {
  padding: 20rpx 30rpx;
  font-size: 26rpx;
  color: #999;
}

.bind-status {
  font-size: 28rpx;
  color: #999;
}

.bind-status.bound {
  color: #52C41A;
}

.cache-size {
  font-size: 28rpx;
  color: #999;
}

.logout-section {
  padding: 40rpx;
  margin-top: 40rpx;
}

.password-popup {
  width: 560rpx;
  padding: 40rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}

.popup-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  box-sizing: border-box;
}

.popup-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.popup-btns .u-button {
  flex: 1;
}
</style>
