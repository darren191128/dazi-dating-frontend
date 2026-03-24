<template>
  <view class="gift-animation" v-if="visible">
    <view class="animation-container">
      <!-- 礼物图标 -->
      <view class="gift-wrapper" :class="{ 'animate-in': animateIn }">
        <image :src="gift?.icon" class="gift-image" mode="aspectFit" />
        <view class="gift-glow"></view>
      </view>
      
      <!-- 礼物名称 -->
      <view class="gift-name-wrapper" :class="{ 'fade-in': animateIn }">
        <text class="sender-name">{{ senderName }}</text>
        <text class="send-text"> 赠送了 </text>
        <text class="gift-name">{{ gift?.name }}</text>
      </view>
      
      <!-- 连击效果 -->
      <view v-if="combo > 1" class="combo-wrapper" :class="{ 'bounce-in': animateIn }">
        <text class="combo-text">×{{ combo }}</text>
      </view>
      
      <!-- 全屏特效 -->
      <view class="full-screen-effect" v-if="showFullEffect">
        <view class="particle" v-for="n in 20" :key="n" :style="getParticleStyle(n)"></view>
      </view>
      
      <!-- 留言 -->
      <view v-if="message" class="message-wrapper" :class="{ 'slide-up': animateIn }">
        <text class="message-text">"{{ message }}"</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'GiftAnimation',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    gift: {
      type: Object,
      default: null
    },
    senderName: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    combo: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      animateIn: false,
      showFullEffect: false
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.startAnimation();
      }
    }
  },
  methods: {
    startAnimation() {
      this.animateIn = false;
      this.showFullEffect = false;
      
      // 触发入场动画
      setTimeout(() => {
        this.animateIn = true;
      }, 50);
      
      // 高价值礼物显示全屏特效
      if (this.gift && this.gift.price >= 500) {
        setTimeout(() => {
          this.showFullEffect = true;
        }, 300);
      }
      
      // 自动关闭
      setTimeout(() => {
        this.$emit('complete');
      }, 3000);
    },
    getParticleStyle(n) {
      const angle = (n / 20) * 360;
      const delay = Math.random() * 0.5;
      return {
        transform: `rotate(${angle}deg)`,
        animationDelay: `${delay}s`
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.gift-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  pointer-events: none;
  
  .animation-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .gift-wrapper {
    position: relative;
    width: 300rpx;
    height: 300rpx;
    opacity: 0;
    transform: scale(0.5) translateY(100rpx);
    
    &.animate-in {
      animation: giftEnter 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    }
    
    .gift-image {
      width: 100%;
      height: 100%;
      z-index: 2;
      position: relative;
    }
    
    .gift-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400rpx;
      height: 400rpx;
      background: radial-gradient(circle, rgba(255, 107, 157, 0.4) 0%, transparent 70%);
      border-radius: 50%;
      animation: glowPulse 2s ease-in-out infinite;
    }
  }
  
  .gift-name-wrapper {
    margin-top: 40rpx;
    opacity: 0;
    
    &.fade-in {
      animation: fadeIn 0.5s ease-out 0.5s forwards;
    }
    
    .sender-name {
      font-size: 32rpx;
      color: #FF6B9D;
      font-weight: 600;
    }
    
    .send-text {
      font-size: 28rpx;
      color: #666;
    }
    
    .gift-name {
      font-size: 36rpx;
      color: #FF8E53;
      font-weight: 700;
    }
  }
  
  .combo-wrapper {
    margin-top: 20rpx;
    opacity: 0;
    
    &.bounce-in {
      animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.6s forwards;
    }
    
    .combo-text {
      font-size: 64rpx;
      font-weight: 800;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 4rpx 8rpx rgba(255, 165, 0, 0.3);
    }
  }
  
  .message-wrapper {
    margin-top: 30rpx;
    padding: 20rpx 40rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 40rpx;
    opacity: 0;
    transform: translateY(30rpx);
    
    &.slide-up {
      animation: slideUp 0.5s ease-out 0.8s forwards;
    }
    
    .message-text {
      font-size: 28rpx;
      color: #666;
      font-style: italic;
    }
  }
  
  .full-screen-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    
    .particle {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20rpx;
      height: 20rpx;
      background: linear-gradient(135deg, #FFD700 0%, #FF6B9D 100%);
      border-radius: 50%;
      animation: particleExplode 1.5s ease-out forwards;
    }
  }
}

@keyframes giftEnter {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(100rpx);
  }
  60% {
    transform: scale(1.1) translateY(-20rpx);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes glowPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes particleExplode {
  0% {
    transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateX(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--rotation, 0deg)) translateX(400rpx);
    opacity: 0;
  }
}
</style>
