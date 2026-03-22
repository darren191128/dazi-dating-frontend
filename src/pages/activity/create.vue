<template>
  <view class="create-container">
    <u-form :model="form" ref="formRef" :rules="rules">
      <!-- 活动类型 -->
      <u-form-item label="活动类型" prop="type">
        <u-radio-group v-model="form.type">
          <u-radio 
            v-for="(item, index) in typeList" 
            :key="index"
            :name="item.value"
          >
            {{ item.name }}
          </u-radio>
        </u-radio-group>
      </u-form-item>
      
      <!-- 活动标题 -->
      <u-form-item label="活动标题" prop="title">
        <u-input v-model="form.title" placeholder="请输入活动标题" />
      </u-form-item>
      
      <!-- 活动描述 -->
      <u-form-item label="活动描述" prop="description">
        <u-textarea v-model="form.description" placeholder="请输入活动描述" />
      </u-form-item>
      
      <!-- 活动时间 -->
      <u-form-item label="开始时间" prop="startTime">
        <u-datetime-picker
          v-model="form.startTime"
          mode="datetime"
          @confirm="onStartTimeConfirm"
        >
          <u-input v-model="form.startTimeText" placeholder="选择开始时间" readonly />
        </u-datetime-picker>
      </u-form-item>
      
      <!-- 活动地点 -->
      <u-form-item label="活动地点" prop="location">
        <u-input v-model="form.location" placeholder="请选择活动地点" readonly @click="chooseLocation" />
      </u-form-item>
      
      <!-- 人数限制 -->
      <u-form-item label="人数限制" prop="maxParticipants">
        <u-number-box v-model="form.maxParticipants" :min="2" :max="50" />
      </u-form-item>
      
      <!-- 付费模式 -->
      <u-form-item label="付费模式" prop="paymentType">
        <u-radio-group v-model="form.paymentType">
          <u-radio :name="1">AA制</u-radio>
          <u-radio :name="2">男A女免</u-radio>
          <u-radio :name="3">请客</u-radio>
          <u-radio :name="4">免费</u-radio>
        </u-radio-group>
      </u-form-item>
      
      <!-- 费用 -->
      <u-form-item label="总费用" prop="totalAmount" v-if="form.paymentType !== 4">
        <u-input v-model="form.totalAmount" type="number" placeholder="请输入总费用">
          <template #suffix>
            <text>元</text>
          </template>
        </u-input>
      </u-form-item>
      
      <!-- 报名截止 -->
      <u-form-item label="报名截止" prop="registrationDeadline">
        <u-datetime-picker
          v-model="form.registrationDeadline"
          mode="datetime"
        >
          <u-input v-model="form.deadlineText" placeholder="选择报名截止时间" readonly />
        </u-datetime-picker>
      </u-form-item>
    </u-form>
    
    <!-- 提交按钮 -->
    <view class="submit-btn">
      <u-button type="primary" size="large" @click="submit">发布活动</u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'

const formRef = ref(null)

const form = reactive({
  type: 1,
  title: '',
  description: '',
  startTime: '',
  startTimeText: '',
  location: '',
  maxParticipants: 10,
  paymentType: 1,
  totalAmount: '',
  registrationDeadline: '',
  deadlineText: ''
})

const typeList = [
  { name: '吃喝玩乐', value: 1 },
  { name: '户外游玩', value: 2 },
  { name: '亲子活动', value: 3 },
  { name: '户外运动', value: 4 },
  { name: '相亲交友', value: 5 }
]

const rules = {
  title: [{ required: true, message: '请输入活动标题' }],
  description: [{ required: true, message: '请输入活动描述' }],
  location: [{ required: true, message: '请选择活动地点' }]
}

const onStartTimeConfirm = (e) => {
  form.startTimeText = e.value
}

const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      form.location = res.name
    }
  })
}

const submit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      uni.showModal({
        title: '确认发布',
        content: '确定要发布这个活动吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '发布成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        }
      })
    }
  })
}
</script>

<style scoped>
.create-container {
  min-height: 100vh;
  background: #fff;
  padding: 20rpx;
}

.submit-btn {
  margin-top: 60rpx;
  padding: 0 40rpx;
}
</style>
