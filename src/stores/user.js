import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref(uni.getStorageSync('userInfo') || null)
  const location = ref({ longitude: 0, latitude: 0 })
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userId = computed(() => userInfo.value?.userId)
  
  // Actions
  const setToken = (newToken) => {
    token.value = newToken
    uni.setStorageSync('token', newToken)
  }
  
  const setUserInfo = (info) => {
    userInfo.value = info
    uni.setStorageSync('userInfo', info)
  }
  
  const setLocation = (longitude, latitude) => {
    location.value = { longitude, latitude }
  }
  
  const wxLogin = async (data) => {
    // 调用登录API
    // const res = await api.user.wxLogin(data)
    // setToken(res.token)
    // setUserInfo(res.userInfo)
    
    // 模拟登录
    setToken('mock_token_' + Date.now())
    setUserInfo({
      userId: 1,
      nickname: data.nickname,
      avatar: data.avatar,
      gender: data.gender,
      level: 1,
      creditScore: 100
    })
  }
  
  const logout = () => {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }
  
  return {
    token,
    userInfo,
    location,
    isLoggedIn,
    userId,
    setToken,
    setUserInfo,
    setLocation,
    wxLogin,
    logout
  }
})
