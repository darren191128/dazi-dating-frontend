/**
 * @fileoverview SwipeCard 滑动卡片组件
 * 用于展示用户信息的卡片组件，支持照片轮播和基本信息展示
 * 
 * @example
 * <SwipeCard 
 *   :user="{ 
 *     userId: 1, 
 *     nickname: '小明', 
 *     age: 25, 
 *     gender: 1, 
 *     avatar: '...', 
 *     photos: ['...', '...'],
 *     distance: 1.5,
 *     tags: ['运动', '音乐'],
 *     bio: '热爱生活'
 *   }" 
 *   :disabled="false"
 * />
 */

/**
 * 用户对象类型定义
 * @typedef {Object} User
 * @property {number} userId - 用户ID
 * @property {string} nickname - 用户昵称
 * @property {number} age - 年龄
 * @property {number} gender - 性别：1-男，2-女
 * @property {string} avatar - 头像URL
 * @property {string[]} [photos] - 照片列表（可选）
 * @property {number} [distance] - 距离（公里）
 * @property {string[]} [tags] - 标签列表（可选）
 * @property {string} [bio] - 个人简介（可选）
 */

const props = defineProps({
  /**
   * 用户信息对象
   * @type {User}
   * @required
   */
  user: {
    type: Object,
    required: true,
    validator(value) {
      // 验证必填字段
      return value && 
             typeof value.userId === 'number' && 
             typeof value.nickname === 'string' &&
             typeof value.age === 'number' &&
             [1, 2].includes(value.gender);
    }
  },
  /**
   * 是否禁用轮播交互
   * @type {boolean}
   * @default false
   */
  disabled: {
    type: Boolean,
    default: false
  }
});

/**
 * 定义组件事件
 * @emits {void} photoChange - 照片切换时触发
 * @emits {void} click - 点击卡片时触发
 */
const emit = defineEmits(['photoChange', 'click']);
