<template>
  <view class="swipe-card">
    <!-- 用户照片 -->
    <view class="photo-section">
      <swiper 
        class="photo-swiper"
        :indicator-dots="user.photos?.length > 1"
        indicator-color="rgba(255,255,255,0.4)"
        indicator-active-color="#fff"
        :disabled="disabled"
      >
        <swiper-item v-for="(photo, index) in (user.photos || [user.avatar])" :key="index">
          <image :src="photo" mode="aspectFill" class="photo" />
        </swiper-item>
      </swiper>
      
      <!-- 照片数量指示 -->
      <view v-if="user.photos?.length > 1" class="photo-count">
        <text>{{ user.photos.length }}张照片</text>
      </view>
    </view>
    
    <!-- 用户信息 -->
    <view class="info-section">
      <view class="basic-info">
        <text class="nickname">{{ user.nickname }}</text>
        <text class="age">{{ user.age }}岁</text>
        <view class="gender-tag" :class="user.gender === 1 ? 'male' : 'female'">
          <u-icon :name="user.gender === 1 ? 'man' : 'woman'" size="20" color="#fff" />
        </view>
      </view>
      
      <view class="location">
        <u-icon name="map-fill" size="20" color="#999" />
        <text>距离 {{ user.distance }}km</text>
      </view>
      
      <!-- 标签 -->
      <view v-if="user.tags?.length > 0" class="tags">
        <text 
          v-for="tag in user.tags.slice(0, 5)" 
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </text>
      </view>
      
      <!-- 简介 -->
      <text class="bio">{{ user.bio || '这个人很懒，什么都没写~' }}</text>
    </view>
  </view>
</template>

<script setup>
/**
 * SwipeCard 滑动卡片组件
 * 用于展示用户信息的卡片组件，支持照片轮播
 * @component
 */
const props = defineProps({
  /**
   * 用户信息对象
   * @type {Object}
   * @property {number} userId - 用户ID
   * @property {string} nickname - 用户昵称
   * @property {number} age - 年龄
   * @property {number} gender - 性别：1-男，2-女
   * @property {string} avatar - 头像URL
   * @property {string[]} [photos] - 照片列表
   * @property {number} [distance] - 距离
   * @property {string[]} [tags] - 标签列表
   * @property {string} [bio] - 个人简介
   */
  user: {
    type: Object,
    default: () => ({})
  },
  /**
   * 是否禁用轮播交互
   */
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.swipe-card {
  width: 100%;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.photo-section {
  position: relative;
  height: 700rpx;
}

.photo-swiper {
  height: 100%;
}

.photo {
  width: 100%;
  height: 100%;
}

.photo-count {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 8rpx 20rpx;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 20rpx;
}

.photo-count text {
  font-size: 24rpx;
  color: #fff;
}

.info-section {
  padding: 30rpx;
}

.basic-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.nickname {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
}

.age {
  font-size: 30rpx;
  color: #666;
}

.gender-tag {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gender-tag.male {
  background: #4ECDC4;
}

.gender-tag.female {
  background: #FF6B9D;
}

.location {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.location text {
  font-size: 26rpx;
  color: #999;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.tag {
  padding: 8rpx 20rpx;
  background: #f0f0f0;
  color: #666;
  font-size: 24rpx;
  border-radius: 20rpx;
}

.bio {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}
</style>
