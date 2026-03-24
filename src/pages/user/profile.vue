<template>
  <view class="profile-container">
    <!-- 头像编辑 -->
    <view class="avatar-section">
      <view class="avatar-wrapper" @click="chooseAvatar">
        <image class="avatar" :src="form.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="avatar-mask">
          <u-icon name="camera" size="32" color="#fff" />
        </view>
      </view>
      <text class="avatar-tip">点击更换头像</text>
    </view>
    
    <!-- 表单区域 -->
    <view class="form-section">
      <u-cell-group>
        <u-cell title="昵称">
          <template #value>
            <input 
              class="cell-input" 
              v-model="form.nickname" 
              placeholder="请输入昵称"
              maxlength="20"
            />
          </template>
        </u-cell>
        
        <u-cell title="性别" isLink @click="showGenderPicker = true">
          <template #value>
            <text :class="{ placeholder: !form.gender }">{{ genderText }}</text>
          </template>
        </u-cell>
        
        <u-cell title="年龄" isLink @click="showAgePicker = true">
          <template #value>
            <text :class="{ placeholder: !form.age }">{{ form.age ? form.age + '岁' : '请选择' }}</text>
          </template>
        </u-cell>
        
        <u-cell title="职业">
          <template #value>
            <input 
              class="cell-input" 
              v-model="form.occupation" 
              placeholder="请输入职业"
              maxlength="20"
            />
          </template>
        </u-cell>
        
        <u-cell title="所在城市">
          <template #value>
            <input 
              class="cell-input" 
              v-model="form.city" 
              placeholder="请输入城市"
              maxlength="20"
            />
          </template>
        </u-cell>
      </u-cell-group>
      
      <!-- 兴趣标签 -->
      <view class="tags-section">
        <view class="section-title">兴趣标签</view>
        <view class="tags-list">
          <view 
            class="tag-item" 
            v-for="(tag, index) in form.interests" 
            :key="index"
          >
            <text>{{ tag }}</text>
            <u-icon name="close" size="12" color="#999" @click="removeTag(index)" />
          </view>
          <view class="tag-add" @click="showAddTag = true" v-if="form.interests.length < 8">
            <u-icon name="plus" size="20" color="#007AFF" />
            <text>添加</text>
          </view>
        </view>
      </view>
      
      <!-- 个人简介 -->
      <view class="bio-section">
        <view class="section-title">个人简介</view>
        <textarea 
          class="bio-textarea" 
          v-model="form.bio" 
          placeholder="介绍一下自己，让更多人了解你..."
          maxlength="200"
        />
        <text class="bio-count">{{ form.bio.length }}/200</text>
      </view>
    </view>
    
    <!-- 保存按钮 -->
    <view class="save-btn">
      <u-button type="primary" @click="saveProfile" :loading="saving">保存</u-button>
    </view>
    
    <!-- 性别选择器 -->
    <u-picker
      :show="showGenderPicker"
      :columns="[genderOptions]"
      keyName="label"
      @confirm="onGenderConfirm"
      @cancel="showGenderPicker = false"
    />
    
    <!-- 年龄选择器 -->
    <u-picker
      :show="showAgePicker"
      :columns="[ageOptions]"
      @confirm="onAgeConfirm"
      @cancel="showAgePicker = false"
    />
    
    <!-- 添加标签弹窗 -->
    <u-popup :show="showAddTag" mode="center" round="16">
      <view class="add-tag-popup">
        <view class="popup-title">添加标签</view>
        <input 
          class="tag-input" 
          v-model="newTag" 
          placeholder="输入标签名称"
          maxlength="10"
          focus
        />
        <view class="popup-btns">
          <u-button @click="showAddTag = false">取消</u-button>
          <u-button type="primary" @click="addTag">确定</u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api'

const userStore = useUserStore()

const form = ref({
  avatar: '',
  nickname: '',
  gender: null,
  age: null,
  occupation: '',
  city: '',
  interests: [],
  bio: ''
})

const saving = ref(false)
const showGenderPicker = ref(false)
const showAgePicker = ref(false)
const showAddTag = ref(false)
const newTag = ref('')

const genderOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 2 }
]

const ageOptions = [Array.from({ length: 63 }, (_, i) => (18 + i) + '岁')]

const genderText = computed(() => {
  const option = genderOptions.find(item => item.value === form.value.gender)
  return option?.label || '请选择'
})

onMounted(() => {
  loadUserInfo()
})

const loadUserInfo = () => {
  const userInfo = userStore.userInfo
  if (userInfo) {
    form.value = {
      avatar: userInfo.avatar || '',
      nickname: userInfo.nickname || '',
      gender: userInfo.gender || null,
      age: userInfo.age || null,
      occupation: userInfo.occupation || '',
      city: userInfo.city || '',
      interests: userInfo.interests || [],
      bio: userInfo.bio || ''
    }
  }
}

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]
      try {
        uni.showLoading({ title: '上传中...' })
        const result = await userApi.uploadAvatar(tempFilePath)
        if (result.code === 200) {
          form.value.avatar = result.data.url
          uni.showToast({ title: '上传成功', icon: 'success' })
        } else {
          uni.showToast({ title: result.message || '上传失败', icon: 'none' })
        }
      } catch (error) {
        console.error('上传头像失败:', error)
        uni.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

const onGenderConfirm = (e) => {
  form.value.gender = e.value[0]?.value
  showGenderPicker.value = false
}

const onAgeConfirm = (e) => {
  form.value.age = parseInt(e.value[0])
  showAgePicker.value = false
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (!tag) {
    uni.showToast({ title: '请输入标签', icon: 'none' })
    return
  }
  if (form.value.interests.includes(tag)) {
    uni.showToast({ title: '标签已存在', icon: 'none' })
    return
  }
  if (form.value.interests.length >= 8) {
    uni.showToast({ title: '最多添加8个标签', icon: 'none' })
    return
  }
  form.value.interests.push(tag)
  newTag.value = ''
  showAddTag.value = false
}

const removeTag = (index) => {
  form.value.interests.splice(index, 1)
}

const saveProfile = async () => {
  if (!form.value.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  
  try {
    saving.value = true
    const res = await userApi.updateUserInfo(form.value)
    if (res.code === 200) {
      userStore.setUserInfo({ ...userStore.userInfo, ...form.value })
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '保存失败', icon: 'none' })
    }
  } catch (error) {
    console.error('保存资料失败:', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background: #fff;
}

.avatar-wrapper {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  overflow: hidden;
}

.avatar {
  width: 100%;
  height: 100%;
}

.avatar-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-tip {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #999;
}

.form-section {
  margin-top: 20rpx;
}

.cell-input {
  text-align: right;
  font-size: 28rpx;
  color: #333;
}

.placeholder {
  color: #999;
}

.tags-section {
  background: #fff;
  padding: 30rpx;
  margin-top: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  background: #E8F4FF;
  border-radius: 30rpx;
}

.tag-item text {
  font-size: 26rpx;
  color: #007AFF;
}

.tag-add {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 20rpx;
  border: 2rpx dashed #007AFF;
  border-radius: 30rpx;
}

.tag-add text {
  font-size: 26rpx;
  color: #007AFF;
}

.bio-section {
  background: #fff;
  padding: 30rpx;
  margin-top: 20rpx;
}

.bio-textarea {
  width: 100%;
  height: 200rpx;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.bio-count {
  display: block;
  text-align: right;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #999;
}

.save-btn {
  padding: 40rpx;
  margin-top: 40rpx;
}

.add-tag-popup {
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

.tag-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 30rpx;
  box-sizing: border-box;
}

.popup-btns {
  display: flex;
  gap: 20rpx;
}

.popup-btns .u-button {
  flex: 1;
}
</style>
