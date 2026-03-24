/**
 * @fileoverview MomentCard 动态卡片组件
 * 用于展示用户动态信息的卡片组件，支持点赞、评论、分享
 * 
 * @example
 * <MomentCard 
 *   :moment="{ 
 *     id: 1, 
 *     content: '今天天气真好', 
 *     images: ['...', '...'],
 *     time: '2小时前',
 *     likeCount: 10,
 *     commentCount: 5,
 *     isLiked: false,
 *     user: {
 *       userId: 1,
 *       nickname: '小明',
 *       avatar: '...'
 *     }
 *   }" 
 *   :showActions="true"
 *   :showMore="true"
 *   @like="handleLike"
 *   @comment="handleComment"
 *   @click="goToDetail"
 * />
 */

/**
 * 用户对象类型定义
 * @typedef {Object} MomentUser
 * @property {number} userId - 用户ID
 * @property {string} nickname - 用户昵称
 * @property {string} [avatar] - 头像URL
 */

/**
 * 动态对象类型定义
 * @typedef {Object} Moment
 * @property {number} id - 动态ID
 * @property {string} content - 动态内容
 * @property {string[]} [images] - 图片列表
 * @property {string} time - 发布时间描述
 * @property {number} [likeCount] - 点赞数
 * @property {number} [commentCount] - 评论数
 * @property {boolean} [isLiked] - 当前用户是否已点赞
 * @property {MomentUser} user - 发布者信息
 */

const props = defineProps({
  /**
   * 动态信息对象
   * @type {Moment}
   * @required
   */
  moment: {
    type: Object,
    required: true,
    validator(value) {
      return value && 
             typeof value.id === 'number' && 
             typeof value.content === 'string' &&
             value.user && typeof value.user.userId === 'number';
    }
  },
  /**
   * 是否显示操作栏（点赞、评论、分享）
   * @type {boolean}
   * @default true
   */
  showActions: {
    type: Boolean,
    default: true
  },
  /**
   * 是否显示更多操作按钮
   * @type {boolean}
   * @default true
   */
  showMore: {
    type: Boolean,
    default: true
  }
});

/**
 * 定义组件事件
 * @emits {Moment} click - 点击卡片时触发，参数为动态对象
 * @emits {Moment} like - 点击点赞时触发，参数为动态对象
 * @emits {Moment} comment - 点击评论时触发，参数为动态对象
 */
const emit = defineEmits(['click', 'like', 'comment']);
