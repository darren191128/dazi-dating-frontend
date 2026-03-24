<template>
  <view class="member-list">
    <view
      class="member-item"
      v-for="member in members"
      :key="member.userId || member.id"
      @click="$emit('click', member)"
    >
      <view class="avatar-wrapper">
        <image class="avatar" :src="member.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="online-dot" v-if="showOnline && member.online"></view>
        <view class="role-badge" v-if="member.role > 0">
          <text>{{ getRoleText(member.role) }}</text>
        </view>
      </view>
      <view class="member-info">
        <text class="nickname">{{ member.nickname || member.groupNickname }}</text>
        <text class="online-status" v-if="showOnline">
          {{ member.online ? '在线' : '离线' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  members: {
    type: Array,
    default: () => []
  },
  showOnline: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const getRoleText = (role) => {
  switch (role) {
    case 2:
      return '群主'
    case 1:
      return '管理'
    default:
      return ''
  }
}
</script>

<style scoped>
.member-list {
  display: flex;
  flex-wrap: wrap;
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20%;
  padding: 20rpx 0;
}

.avatar-wrapper {
  position: relative;
  width: 100rpx;
  height: 100rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
}

.online-dot {
  position: absolute;
  right: 4rpx;
  bottom: 4rpx;
  width: 20rpx;
  height: 20rpx;
  background: #4CAF50;
  border-radius: 50%;
  border: 4rpx solid #fff;
}

.role-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #FF9500;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.role-badge text {
  font-size: 18rpx;
  color: #fff;
}

.member-info {
  margin-top: 12rpx;
  text-align: center;
}

.nickname {
  display: block;
  font-size: 24rpx;
  color: #333;
  max-width: 100rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.online-status {
  display: block;
  font-size: 20rpx;
  color: #999;
  margin-top: 4rpx;
}
</style>
