<template>
  <view class="followings-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <u-search 
        v-model="searchKeyword" 
        placeholder="搜索关注的人" 
        :show-action="false"
        @search="onSearch"
      />
    </view>
    
    <!-- 关注列表 -->
    <scroll-view 
      scroll-y 
      class="user-list"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="followings.length > 0">
        <view 
          v-for="user in followings" 
          :key="user.userId"
          class="user-item"
          @click="goToUserDetail(user.userId)"
        >
          <image :src="user.avatar || '/static/default-avatar.png'" mode="aspectFill" class="user-avatar" />
          <view class="user-info">
            <text class="user-nickname">{{ user.nickname }}</text>
            <text class="user-bio">{{ user.bio || '这个人很懒，什么都没写' }}</text>
          </view>
          <u-button 
            type="default" 
            size="small"
            plain
            @click.stop="unfollow(user)"
          >
            取消关注
          </u-button>
        </view>
      </view>
      
      <u-empty v-else mode="list" text="还没有关注任何人" />
      
      <u-loadmore :status="loadStatus" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { followApi } from '@/api'

const searchKeyword = ref('')
const refreshing = ref(false)
const loadStatus = ref('loadmore')
const page = ref(1)
const pageSize = ref(20)
const followings = ref([])

onMounted(() => {
  loadFollowings()
})

const loadFollowings = async () => {
  try {
    loadStatus.value = 'loading'
    const res = await followApi.getFollowings({
      keyword: searchKeyword.value,
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      if (page.value === 1) {
        followings.value = res.data.list || []
      } else {
        followings.value = [...followings.value, ...(res.data.list || [])]
      }
      loadStatus.value = res.data.list?.length < pageSize.value ? 'nomore' : 'loadmore'
    }
  } catch (error) {
    console.error('加载关注列表失败:', error)
    loadStatus.value = 'loadmore'
  }
}

const onSearch = () => {
  page.value = 1
  followings.value = []
  loadFollowings()
}

const onRefresh = async () => {
  refreshing.value = true
  page.value = 1
  await loadFollowings()
  refreshing.value = false
}

const loadMore = () => {
  if (loadStatus.value === 'nomore') return
  page.value++
  loadFollowings()
}

const unfollow = async (user) => {
  uni.showModal({
    title: '确认取消关注',
    content: `确定要取消关注 ${user.nickname} 吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await followApi.unfollow(user.userId)
          if (result.code === 200) {
            uni.showToast({ title: '已取消关注', icon: 'success' })
            followings.value = followings.value.filter(item => item.userId !== user.userId)
          }
        } catch (error) {
          console.error('取消关注失败:', error)
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const goToUserDetail = (userId) => {
  uni.navigateTo({ url: `/pages/user/detail?userId=${userId}` })
}
</script>

<style scoped>
.followings-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  padding: 20rpx;
  background: #fff;
}

.user-list {
  height: calc(100vh - 120rpx);
  padding: 0 20rpx;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.user-nickname {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.user-bio {
  display: block;
  font-size: 26rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
