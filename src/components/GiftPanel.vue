<template>
  <view class="gift-panel" v-if="visible">
    <view class="mask" @click="close"></view>
    <view class="panel">
      <view class="header">
        <text class="title">赠送礼物</text>
        <text class="close" @click="close">×</text>
      </view>
      
      <!-- 分类Tab -->
      <view class="category-tabs">
        <view 
          v-for="cat in categories" 
          :key="cat.id"
          class="tab-item"
          :class="{ active: currentCategory === cat.id }"
          @click="selectCategory(cat.id)"
        >
          <image :src="cat.icon" class="tab-icon" mode="aspectFit" />
          <text class="tab-name">{{ cat.name }}</text>
        </view>
      </view>
      
      <!-- 礼物网格 -->
      <scroll-view class="gift-grid" scroll-y>
        <view class="gift-list">
          <view 
            v-for="gift in filteredGifts" 
            :key="gift.id"
            class="gift-item"
            :class="{ selected: selectedGift?.id === gift.id, 'vip-only': gift.vipOnly }"
            @click="selectGift(gift)"
          >
            <view class="gift-icon-wrapper">
              <image :src="gift.icon" class="gift-icon" mode="aspectFit" />
              <view v-if="gift.vipOnly" class="vip-badge">VIP</view>
            </view>
            <text class="gift-name">{{ gift.name }}</text>
            <view class="gift-price">
              <image src="/static/icons/coin.png" class="coin-icon" mode="aspectFit" />
              <text class="price">{{ gift.price }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
      
      <!-- 留言输入 -->
      <view class="message-input">
        <input 
          v-model="message"
          type="text"
          placeholder="写点祝福语吧..."
          maxlength="50"
        />
      </view>
      
      <!-- 底部操作栏 -->
      <view class="footer">
        <view class="balance">
          <image src="/static/icons/coin.png" class="coin-icon" mode="aspectFit" />
          <text class="balance-text">{{ balance }}</text>
        </view>
        <button 
          class="send-btn"
          :disabled="!selectedGift || balance < selectedGift.price"
          @click="sendGift"
        >
          {{ sendButtonText }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { giftApi } from '@/api/index.js';

export default {
  name: 'GiftPanel',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    receiverId: {
      type: [String, Number],
      required: true
    },
    balance: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      categories: [],
      gifts: [],
      currentCategory: null,
      selectedGift: null,
      message: ''
    };
  },
  computed: {
    filteredGifts() {
      if (!this.currentCategory) {
        return this.gifts;
      }
      return this.gifts.filter(g => g.categoryId === this.currentCategory);
    },
    sendButtonText() {
      if (!this.selectedGift) {
        '请选择礼物';
      }
      if (this.balance < this.selectedGift.price) {
        return '余额不足';
      }
      return `赠送 (${this.selectedGift.price}金币)`;
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadData();
      }
    }
  },
  methods: {
    async loadData() {
      try {
        const [catRes, giftRes] = await Promise.all([
          giftApi.getCategories(),
          giftApi.getGifts()
        ]);
        
        if (catRes.code === 200) {
          this.categories = catRes.data || [];
          if (this.categories.length > 0) {
            this.currentCategory = this.categories[0].id;
          }
        }
        
        if (giftRes.code === 200) {
          this.gifts = giftRes.data || [];
        }
      } catch (error) {
        console.error('加载礼物数据失败:', error);
        uni.showToast({ title: '加载失败', icon: 'none' });
      }
    },
    selectCategory(categoryId) {
      this.currentCategory = categoryId;
      this.selectedGift = null;
    },
    selectGift(gift) {
      this.selectedGift = gift;
    },
    async sendGift() {
      if (!this.selectedGift) {
        uni.showToast({ title: '请选择礼物', icon: 'none' });
        return;
      }
      
      if (this.balance < this.selectedGift.price) {
        uni.showToast({ title: '余额不足', icon: 'none' });
        return;
      }
      
      try {
        const res = await giftApi.sendGift({
          receiverId: this.receiverId,
          giftId: this.selectedGift.id,
          message: this.message
        });
        
        if (res.code === 200) {
          uni.showToast({ title: '赠送成功', icon: 'success' });
          this.$emit('success', this.selectedGift);
          this.close();
        } else {
          uni.showToast({ title: res.message || '赠送失败', icon: 'none' });
        }
      } catch (error) {
        console.error('赠送礼物失败:', error);
        uni.showToast({ title: '赠送失败', icon: 'none' });
      }
    },
    close() {
      this.selectedGift = null;
      this.message = '';
      this.$emit('close');
    }
  }
};
</script>

<style lang="scss" scoped>
.gift-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .panel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
      
      .close {
        font-size: 48rpx;
        color: #999;
        line-height: 1;
      }
    }
    
    .category-tabs {
      display: flex;
      padding: 20rpx 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      .tab-item {
        display: flex;
        align-items: center;
        padding: 16rpx 30rpx;
        margin-right: 20rpx;
        background: #f5f5f5;
        border-radius: 32rpx;
        
        &.active {
          background: linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%);
          
          .tab-name {
            color: #fff;
          }
        }
        
        .tab-icon {
          width: 32rpx;
          height: 32rpx;
          margin-right: 8rpx;
        }
        
        .tab-name {
          font-size: 26rpx;
          color: #666;
        }
      }
    }
    
    .gift-grid {
      max-height: 600rpx;
      padding: 20rpx;
      
      .gift-list {
        display: flex;
        flex-wrap: wrap;
        
        .gift-item {
          width: calc(25% - 20rpx);
          margin: 10rpx;
          padding: 20rpx;
          background: #f9f9f9;
          border-radius: 16rpx;
          text-align: center;
          border: 2rpx solid transparent;
          
          &.selected {
            border-color: #FF6B9D;
            background: #FFF0F3;
          }
          
          &.vip-only {
            .gift-icon-wrapper {
              position: relative;
            }
          }
          
          .gift-icon-wrapper {
            position: relative;
            width: 100rpx;
            height: 100rpx;
            margin: 0 auto 10rpx;
            
            .gift-icon {
              width: 100%;
              height: 100%;
            }
            
            .vip-badge {
              position: absolute;
              top: 0;
              right: 0;
              background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
              color: #fff;
              font-size: 18rpx;
              padding: 2rpx 8rpx;
              border-radius: 8rpx;
            }
          }
          
          .gift-name {
            font-size: 24rpx;
            color: #333;
            display: block;
            margin-bottom: 8rpx;
          }
          
          .gift-price {
            display: flex;
            align-items: center;
            justify-content: center;
            
            .coin-icon {
              width: 24rpx;
              height: 24rpx;
              margin-right: 4rpx;
            }
            
            .price {
              font-size: 22rpx;
              color: #FF6B9D;
              font-weight: 600;
            }
          }
        }
      }
    }
    
    .message-input {
      padding: 20rpx 30rpx;
      border-top: 1rpx solid #f5f5f5;
      
      input {
        height: 80rpx;
        background: #f5f5f5;
        border-radius: 40rpx;
        padding: 0 30rpx;
        font-size: 28rpx;
      }
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 30rpx 40rpx;
      
      .balance {
        display: flex;
        align-items: center;
        
        .coin-icon {
          width: 40rpx;
          height: 40rpx;
          margin-right: 10rpx;
        }
        
        .balance-text {
          font-size: 32rpx;
          color: #FF6B9D;
          font-weight: 600;
        }
      }
      
      .send-btn {
        min-width: 240rpx;
        height: 80rpx;
        line-height: 80rpx;
        background: linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%);
        color: #fff;
        font-size: 28rpx;
        border-radius: 40rpx;
        border: none;
        
        &:disabled {
          background: #ccc;
        }
        
        &::after {
          border: none;
        }
      }
    }
  }
}
</style>
