<template>
  <view class="intimacy-badge" @click="showDetail">
    <view class="badge-content">
      <image :src="levelIcon" class="level-icon" mode="aspectFit" />
      <text class="level-name">{{ levelName }}</text>
      <view class="score-bar">
        <view class="score-fill" :style="{ width: progress + '%' }"></view>
      </view>
      <text class="score-text">{{ intimacyScore }}</text>
    </view>
  </view>
</template>

<script>
import { intimacyApi } from '@/api/index.js';

export default {
  name: 'IntimacyBadge',
  props: {
    friendId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      intimacyScore: 0,
      intimacyLevel: 1,
      levelName: '初识',
      progress: 0
    };
  },
  computed: {
    levelIcon() {
      const icons = {
        1: '/static/intimacy/level1.png',
        2: '/static/intimacy/level2.png',
        3: '/static/intimacy/level3.png',
        4: '/static/intimacy/level4.png',
        5: '/static/intimacy/level5.png',
        6: '/static/intimacy/level6.png',
        7: '/static/intimacy/level7.png'
      };
      return icons[this.intimacyLevel] || icons[1];
    }
  },
  mounted() {
    this.loadIntimacy();
  },
  methods: {
    async loadIntimacy() {
      try {
        const res = await intimacyApi.getIntimacy(this.friendId);
        if (res.code === 200 && res.data) {
          this.intimacyScore = res.data.intimacyScore || 0;
          this.intimacyLevel = res.data.intimacyLevel || 1;
          this.levelName = res.data.levelName || '初识';
          this.progress = res.data.progress || 0;
        }
      } catch (error) {
        console.error('加载亲密度失败:', error);
      }
    },
    showDetail() {
      this.$emit('click');
    }
  }
};
</script>

<style lang="scss" scoped>
.intimacy-badge {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #FFF0F3 0%, #FFE4E9 100%);
  border-radius: 30rpx;
  border: 2rpx solid #FFB6C1;
  
  .badge-content {
    display: flex;
    align-items: center;
    
    .level-icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 10rpx;
    }
    
    .level-name {
      font-size: 24rpx;
      color: #FF6B9D;
      font-weight: 600;
      margin-right: 16rpx;
    }
    
    .score-bar {
      width: 80rpx;
      height: 12rpx;
      background: #FFE4E9;
      border-radius: 6rpx;
      overflow: hidden;
      margin-right: 10rpx;
      
      .score-fill {
        height: 100%;
        background: linear-gradient(90deg, #FF6B9D 0%, #FF8E53 100%);
        border-radius: 6rpx;
        transition: width 0.3s ease;
      }
    }
    
    .score-text {
      font-size: 22rpx;
      color: #FF6B9D;
      font-weight: 500;
    }
  }
}
</style>
