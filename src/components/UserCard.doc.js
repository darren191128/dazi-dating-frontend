/**
 * @fileoverview UserCard 用户卡片组件
 * 用于展示用户列表中的用户信息
 * 
 * @example
 * <UserCard 
 *   :user="{ 
 *     userId: 1, 
 *     nickname: '小明', 
 *     age: 25, 
 *     gender: 1, 
 *     avatar: '...',
 *     distance: 1.5,
 *     matchScore: 85
 *   }" 
 *   :showMatchScore="true"
 *   @click="goToUserDetail"
 * />
 */

/**
 * 用户对象类型定义
 * @typedef {Object} UserCardUser
 * @property {number} userId - 用户ID
 * @property {string} nickname - 用户昵称
 * @property {number} age - 年龄
 * @property {number} gender - 性别：1-男，2-女
 * @property {string} [avatar] - 头像URL
 * @property {number} [distance] - 距离（公里）
 * @property {number} [matchScore] - 匹配分数（0-100）
 */

const props = defineProps({
  /**
   * 用户信息对象
   * @type {UserCardUser}
   * @required
   */
  user: {
    type: Object,
    required: true,
    validator(value) {
      return value && 
             typeof value.userId === 'number' && 
             typeof value.nickname === 'string';
    }
  },
  /**
   * 是否显示匹配分数
   * @type {boolean}
   * @default false
   */
  showMatchScore: {
    type: Boolean,
    default: false
  }
});

/**
 * 定义组件事件
 * @emits {number} click - 点击卡片时触发，参数为用户ID
 */
const emit = defineEmits(['click']);
