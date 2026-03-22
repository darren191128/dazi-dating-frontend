<template>
  <view class="app-container">
    <u-navbar :title="navbarTitle" :fixed="true" :border="false" :placeholder="true" @click-left="handleBack" @click-right="handleRight" />
    <view class="page-content">
      <slot />
    </view>
    <u-tabbar v-model="tabbarIndex" :list="tabbarList" @change="handleTabChange" />
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const navbarTitle = ref('搭子交友')
const tabbarIndex = ref(0)

const tabbarList = [
  {
    iconPath: '/static/icons/home.png',
    selectedIconPath: '/static/icons/home-active.png',
    text: '首页',
    pagePath: '/pages/home/index'
  },
  {
    iconPath: '/static/icons/match.png',
    selectedIconPath: '/static/icons/match-active.png',
    text: '匹配',
    pagePath: '/pages/match/index'
  },
  {
    iconPath: '/static/icons/activity.png',
    selectedIconPath: '/static/icons/activity-active.png',
    text: '活动',
    pagePath: '/pages/activity/index'
  },
  {
    iconPath: '/static/icons/message.png',
    selectedIconPath: '/static/icons/message-active.png',
    text: '消息',
    pagePath: '/pages/message/index'
  },
  {
    iconPath: '/static/icons/user.png',
    selectedIconPath: '/static/icons/user-active.png',
    text: '我的',
    pagePath: '/pages/user/index'
  }
]

const handleBack = () => {
  if (router.currentRoute.value.name === 'home') {
    uni.navigateBack()
  } else {
    router.push('/pages/home/index')
  }
}

const handleRight = () => {
  // Handle right button action
}

const handleTabChange = (index) => {
  const pagePath = tabbarList[index].pagePath
  if (route.path !== pagePath) {
    router.push(pagePath)
  }
}

// Set initial tab based on current route
onMounted(() => {
  const currentIndex = tabbarList.findIndex(item => item.pagePath === route.path)
  if (currentIndex !== -1) {
    tabbarIndex.value = currentIndex
  }
})

// Update navbar title based on route
watch(() => route.path, (newPath) => {
  switch (newPath) {
    case '/pages/home/index':
      navbarTitle.value = '首页'
      break
    case '/pages/match/index':
      navbarTitle.value = '匹配'
      break
    case '/pages/activity/index':
      navbarTitle.value = '活动'
      break
    case '/pages/message/index':
      navbarTitle.value = '消息'
      break
    case '/pages/user/index':
      navbarTitle.value = '我的'
      break
    default:
      navbarTitle.value = '搭子交友'
  }
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  overflow-y: auto;
}
</style>