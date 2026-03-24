/**
 * @fileoverview ActivityCard 活动卡片组件
 * 用于展示活动信息的卡片组件，支持点击报名
 * 
 * @example
 * <ActivityCard 
 *   :activity="{ 
 *     id: 1, 
 *     title: '周末爬山', 
 *     typeName: '户外运动',
 *     coverImage: '...',
 *     startTime: '2024-01-01T10:00:00',
 *     location: '香山',
 *     currentParticipants: 5,
 *     maxParticipants: 20,
 *     paymentType: 1,
 *     perPersonAmount: 50
 *   }" 
 *   @click="goToDetail"
 * />
 */

/**
 * 活动对象类型定义
 * @typedef {Object} Activity
 * @property {number} id - 活动ID
 * @property {string} title - 活动标题
 * @property {string} typeName - 活动类型名称
 * @property {string} [coverImage] - 封面图片URL
 * @property {string} startTime - 开始时间（ISO格式）
 * @property {string} location - 活动地点
 * @property {number} currentParticipants - 当前参与人数
 * @property {number} maxParticipants - 最大参与人数
 * @property {number} paymentType - 支付方式：1-AA制，2-男A女免，3-请客，4-免费
 * @property {number} [perPersonAmount] - 人均费用
 */

const props = defineProps({
  /**
   * 活动信息对象
   * @type {Activity}
   * @required
   */
  activity: {
    type: Object,
    required: true,
    validator(value) {
      return value && 
             typeof value.id === 'number' && 
             typeof value.title === 'string' &&
             typeof value.location === 'string';
    }
  }
});

/**
 * 定义组件事件
 * @emits {Activity} click - 点击卡片时触发，参数为活动对象
 * @emits {Activity} join - 点击报名按钮时触发，参数为活动对象
 */
const emit = defineEmits(['click', 'join']);
