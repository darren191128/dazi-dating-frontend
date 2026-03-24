<template>
  <view class="login-container">
    <view class="logo-section">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">搭子交友</text>
      <text class="subtitle">找到志同道合的伙伴</text>
    </view>
    
    <view class="login-section">
      <view class="agreement">
        <u-checkbox v-model="agreed" shape="circle" activeColor="#007AFF">
          我已阅读并同意
        </u-checkbox>
        <text class="link" @click="showAgreement">《用户协议》</text>
        和
        <text class="link" @click="showPrivacy">《隐私政策》</text>
      </view>
      
      <u-button 
        type="primary" 
        size="large" 
        :disabled="!agreed"
        @click="wxLogin"
        :loading="loading"
      >
        <u-icon name="weixin-fill" size="20" color="#fff" />
        微信一键登录
      </u-button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'

const userStore = useUserStore()
const agreed = ref(false)
const loading = ref(false)

const wxLogin = async () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }

  loading.value = true

  try {
    // 获取微信登录凭证
    const [loginErr, loginRes] = await uni.login({ provider: 'weixin' })

    if (loginErr) {
      throw new Error('微信登录失败')
    }

    // 获取用户信息
    const [profileErr, profileRes] = await uni.getUserProfile({
      desc: '用于完善用户资料'
    })

    if (profileErr) {
      throw new Error('获取用户信息失败')
    }

    const { code } = loginRes
    const { userInfo } = profileRes

    // 调用登录接口
    const res = await userApi.wxLogin(code)

    if (res.code === 200) {
      // 保存token
      uni.setStorageSync('token', res.data.token)
      // 保存用户信息
      userStore.setUserInfo({
        userId: res.data.userId,
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        gender: userInfo.gender
      })

      uni.showToast({ title: '登录成功', icon: 'success' })

      // 跳转到首页
      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/index' })
      }, 1500)
    } else {
      throw new Error(res.message || '登录失败')
    }

  } catch (error) {
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const showAgreement = () => {
  uni.navigateTo({ url: '/pages/agreement/index' })
}

const showPrivacy = () => {
  uni.navigateTo({ url: '/pages/privacy/index' })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40rpx;
}

.logo-section {
  text-align: center;
  margin-bottom: 100rpx;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
}

.agreement {
  margin-bottom: 40rpx;
  font-size: 24rpx;
  color: #666;
}

.link {
  color: #007AFF;
}
</style>
