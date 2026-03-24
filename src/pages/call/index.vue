<template>
  <view class="call-container" :class="callType === 2 ? 'video-call' : 'voice-call'">
    <!-- 背景 -->
    <view class="call-bg">
      <image class="bg-image" :src="remoteAvatar" mode="aspectFill" />
      <view class="bg-mask"></view>
    </view>
    
    <!-- 通话信息 -->
    <view class="call-info">
      <image class="remote-avatar" :src="remoteAvatar" mode="aspectFill" />
      <text class="remote-name">{{ remoteName }}</text>
      <text class="call-status">{{ callStatusText }}</text>
      <text class="call-duration" v-if="isConnected">{{ formatDuration(duration) }}</text>
    </view>
    
    <!-- 视频通话画面 -->
    <view class="video-container" v-if="callType === 2">
      <!-- 远端画面 -->
      <view class="remote-video">
        <live-pusher
          id="livePusher"
          :url="pushUrl"
          mode="RTC"
          autopush
          :muted="isMuted"
          :enable-camera="!isCameraOff"
          :enable-mic="!isMuted"
          @statechange="onPushStateChange"
          @error="onPushError"
        />
      </view>
      <!-- 本地画面 -->
      <view class="local-video">
        <live-player
          id="livePlayer"
          :src="playUrl"
          mode="RTC"
          autoplay
          @statechange="onPlayStateChange"
          @error="onPlayError"
        />
      </view>
    </view>
    
    <!-- 控制按钮 -->
    <view class="call-controls">
      <!-- 静音按钮 -->
      <view class="control-btn" @click="toggleMute">
        <u-icon :name="isMuted ? 'mic-off' : 'mic'" size="40" :color="isMuted ? '#ff6b6b' : '#fff'" />
        <text>{{ isMuted ? '静音中' : '静音' }}</text>
      </view>
      
      <!-- 切换摄像头（仅视频通话） -->
      <view class="control-btn" v-if="callType === 2" @click="toggleCamera">
        <u-icon :name="isCameraOff ? 'camera-off' : 'camera'" size="40" :color="isCameraOff ? '#ff6b6b' : '#fff'" />
        <text>{{ isCameraOff ? '摄像头关' : '摄像头' }}</text>
      </view>
      
      <!-- 切换扬声器 -->
      <view class="control-btn" @click="toggleSpeaker">
        <u-icon :name="isSpeakerOn ? 'volume-up' : 'volume-off'" size="40" :color="'#fff'" />
        <text>{{ isSpeakerOn ? '扬声器' : '听筒' }}</text>
      </view>
      
      <!-- 挂断按钮 -->
      <view class="control-btn hangup" @click="hangup">
        <u-icon name="phone-down" size="40" color="#fff" />
        <text>挂断</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad, onUnload, onMounted } from '@dcloudio/uni-app'
import { rtcApi } from '@/api/rtc-group'

// 页面参数
const callType = ref(1) // 1语音 2视频
const callId = ref('')
const roomId = ref('')
const remoteUserId = ref('')
const remoteName = ref('')
const remoteAvatar = ref('/static/default-avatar.png')
const isCaller = ref(false)

// 通话状态
const isConnected = ref(false)
const isMuted = ref(false)
const isCameraOff = ref(false)
const isSpeakerOn = ref(true)
const duration = ref(0)
const callStatusText = ref('正在呼叫...')

// TRTC相关
const pushUrl = ref('')
const playUrl = ref('')
let durationTimer = null

onLoad((options) => {
  callType.value = parseInt(options.callType) || 1
  callId.value = options.callId || ''
  roomId.value = options.roomId || ''
  remoteUserId.value = options.remoteUserId || ''
  remoteName.value = options.remoteName || '未知用户'
  remoteAvatar.value = options.remoteAvatar || '/static/default-avatar.png'
  isCaller.value = options.isCaller === 'true'
  
  // 初始化TRTC
  initTRTC()
  
  // 如果不是主叫方，显示等待接听状态
  if (!isCaller.value) {
    callStatusText.value = '等待接听...'
  }
})

onUnload(() => {
  clearInterval(durationTimer)
  // 离开房间
  leaveRoom()
})

// 初始化TRTC
const initTRTC = async () => {
  try {
    // 获取Token
    const res = await rtcApi.getToken(roomId.value)
    if (res.code === 200 && res.data) {
      const { userSig, sdkAppId, userId } = res.data
      
      // 构建推拉流地址（使用腾讯云TRTC）
      // 注意：实际项目中需要使用TRTC SDK
      pushUrl.value = `trtc://cloud.tencent.com/push/${sdkAppId}/${roomId.value}?userid=${userId}&usersig=${userSig}`
      playUrl.value = `trtc://cloud.tencent.com/play/${sdkAppId}/${roomId.value}?userid=${userId}&usersig=${userSig}`
      
      // 进入房间
      enterRoom()
    } else {
      uni.showToast({ title: '获取通话凭证失败', icon: 'none' })
    }
  } catch (error) {
    console.error('初始化TRTC失败:', error)
    uni.showToast({ title: '初始化失败', icon: 'none' })
  }
}

// 进入房间
const enterRoom = () => {
  // 创建live-pusher和live-player上下文
  // #ifdef MP-WEIXIN
  const livePusher = uni.createLivePusherContext('livePusher')
  const livePlayer = uni.createLivePlayerContext('livePlayer')
  
  // 开始推流
  livePusher.start({
    success: () => {
      console.log('开始推流')
      isConnected.value = true
      callStatusText.value = '通话中'
      startDurationTimer()
    },
    fail: (err) => {
      console.error('推流失败:', err)
      uni.showToast({ title: '连接失败', icon: 'none' })
    }
  })
  
  // 开始播放
  livePlayer.play({
    success: () => {
      console.log('开始播放')
    }
  })
  // #endif
}

// 离开房间
const leaveRoom = async () => {
  // #ifdef MP-WEIXIN
  const livePusher = uni.createLivePusherContext('livePusher')
  const livePlayer = uni.createLivePlayerContext('livePlayer')
  
  livePusher.stop()
  livePlayer.stop()
  // #endif
  
  // 结束通话
  if (callId.value) {
    try {
      await rtcApi.endCall(callId.value)
    } catch (error) {
      console.error('结束通话失败:', error)
    }
  }
}

// 开始计时
const startDurationTimer = () => {
  durationTimer = setInterval(() => {
    duration.value++
  }, 1000)
}

// 切换静音
const toggleMute = () => {
  isMuted.value = !isMuted.value
  // #ifdef MP-WEIXIN
  const livePusher = uni.createLivePusherContext('livePusher')
  if (isMuted.value) {
    livePusher.pause()
  } else {
    livePusher.resume()
  }
  // #endif
}

// 切换摄像头
const toggleCamera = () => {
  isCameraOff.value = !isCameraOff.value
  // #ifdef MP-WEIXIN
  const livePusher = uni.createLivePusherContext('livePusher')
  livePusher.switchCamera()
  // #endif
}

// 切换扬声器
const toggleSpeaker = () => {
  isSpeakerOn.value = !isSpeakerOn.value
  // #ifdef MP-WEIXIN
  const livePlayer = uni.createLivePlayerContext('livePlayer')
  livePlayer.setInnerAudioOption({
    speakerOn: isSpeakerOn.value
  })
  // #endif
}

// 挂断
const hangup = () => {
  uni.showModal({
    title: '提示',
    content: '确定要结束通话吗？',
    success: (res) => {
      if (res.confirm) {
        leaveRoom()
        uni.navigateBack()
      }
    }
  })
}

// 格式化时长
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 推流状态变化
const onPushStateChange = (e) => {
  console.log('推流状态:', e.detail)
}

// 推流错误
const onPushError = (e) => {
  console.error('推流错误:', e.detail)
  uni.showToast({ title: '连接出错', icon: 'none' })
}

// 播放状态变化
const onPlayStateChange = (e) => {
  console.log('播放状态:', e.detail)
}

// 播放错误
const onPlayError = (e) => {
  console.error('播放错误:', e.detail)
}
</script>

<style scoped>
.call-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.call-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.bg-image {
  width: 100%;
  height: 100%;
  filter: blur(20rpx);
}

.bg-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
}

.call-info {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.remote-avatar {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.remote-name {
  margin-top: 40rpx;
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.call-status {
  margin-top: 20rpx;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
}

.call-duration {
  margin-top: 20rpx;
  font-size: 36rpx;
  color: #fff;
  font-family: monospace;
}

.video-container {
  position: relative;
  z-index: 1;
  flex: 1;
  margin: 40rpx;
}

.remote-video {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
  overflow: hidden;
}

.local-video {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
  width: 200rpx;
  height: 280rpx;
  border-radius: 16rpx;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.call-controls {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-around;
  padding: 60rpx 40rpx;
  padding-bottom: 100rpx;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.control-btn text {
  font-size: 24rpx;
  color: #fff;
}

.hangup {
  background: #ff4444;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
