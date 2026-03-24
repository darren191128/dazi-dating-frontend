import request from '@/utils/request';

/**
 * 用户相关API
 */
export const userApi = {
  // 微信登录
  wxLogin: (code) => request.post('/user/wxLogin', { code }),
  
  // 获取用户信息
  getUserInfo: () => request.get('/user/info'),
  
  // 更新用户信息
  updateUserInfo: (data) => request.put('/user/info', data),
  
  // 上传头像
  uploadAvatar: (filePath) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: request.baseURL + '/user/avatar',
        filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        success: (res) => {
          resolve(JSON.parse(res.data));
        },
        fail: reject
      });
    });
  }
};

/**
 * 匹配相关API
 */
export const matchApi = {
  // 获取附近的人
  getNearbyUsers: (params) => request.get('/match/nearby', params),

  // 获取推荐匹配（支持高级筛选）
  getRecommendations: (params) => request.get('/match/recommendations', params),

  // 获取用户详情
  getUserDetail: (userId) => request.get(`/match/user/${userId}`),

  // 获取滑动推荐
  getSwipeRecommendations: (params) => request.get('/match/recommendations', params),

  // 喜欢用户
  like: (userId) => request.post('/user/match/like', { targetUserId: userId }),

  // 不喜欢用户
  dislike: (userId) => request.post('/user/match/dislike', { targetUserId: userId }),

  // 获取互相喜欢列表
  getMutualLikes: () => request.get('/user/match/mutual'),

  // 获取每日精选
  getDailyPicks: (params) => request.get('/match/daily-picks', params)
};

/**
 * 活动相关API
 */
export const activityApi = {
  // 获取活动列表
  getActivityList: (params) => request.get('/activity/list', params),
  
  // 获取活动详情
  getActivityDetail: (id) => request.get(`/activity/${id}`),
  
  // 创建活动
  createActivity: (data) => request.post('/activity', data),
  
  // 更新活动
  updateActivity: (id, data) => request.put(`/activity/${id}`, data),
  
  // 删除活动
  deleteActivity: (id) => request.delete(`/activity/${id}`),
  
  // 报名活动
  joinActivity: (id) => request.post(`/activity/${id}/join`),
  
  // 取消报名
  cancelJoin: (id) => request.post(`/activity/${id}/cancel`),
  
  // 获取活动类型
  getActivityTypes: () => request.get('/activity/types')
};

/**
 * 消息相关API
 */
export const messageApi = {
  // 获取会话列表
  getConversations: () => request.get('/message/conversations'),
  
  // 获取消息列表
  getMessages: (conversationId, params) => request.get(`/message/conversations/${conversationId}/messages`, params),
  
  // 发送消息
  sendMessage: (conversationId, data) => request.post(`/message/conversations/${conversationId}/messages`, data),
  
  // 标记已读
  markAsRead: (conversationId) => request.post(`/message/conversations/${conversationId}/read`)
};

/**
 * 支付相关API
 */
export const paymentApi = {
  // 创建支付订单
  createOrder: (data) => request.post('/payment/order', data),
  
  // 查询订单状态
  getOrderStatus: (orderNo) => request.get(`/payment/order/${orderNo}`),
  
  // 申请退款
  refund: (orderNo, data) => request.post(`/payment/order/${orderNo}/refund`, data)
};

/**
 * 评价相关API
 */
export const reviewApi = {
  // 提交评价
  submitReview: (data) => request.post('/review', data),

  // 获取评价列表
  getReviews: (params) => request.get('/review/list', params),

  // 获取我的评价
  getMyReviews: () => request.get('/review/my')
};

/**
 * 动态相关API
 */
export const momentApi = {
  // 发布动态
  publish: (data) => request.post('/moment/publish', data),

  // 获取动态列表
  getList: (params) => request.get('/moment/list', params),

  // 获取动态详情
  getDetail: (id) => request.get(`/moment/${id}`),

  // 点赞动态
  like: (id) => request.post(`/moment/${id}/like`),

  // 取消点赞
  unlike: (id) => request.post(`/moment/${id}/unlike`),

  // 评论动态
  comment: (id, data) => request.post(`/moment/${id}/comment`, data),

  // 获取评论列表
  getComments: (id, params) => request.get(`/moment/${id}/comments`, params),

  // 删除动态
  delete: (id) => request.delete(`/moment/${id}`),

  // 获取广场动态（全部）
  getSquareMoments: (params) => request.get('/moment/list', { ...params, type: 'all' }),

  // 获取关注动态
  getFollowingMoments: (params) => request.get('/moment/list', { ...params, type: 'following' }),

  // 获取动态详情（别名）
  getMomentDetail: (id) => request.get(`/moment/${id}`),

  // 获取点赞列表
  getMomentLikes: (id) => request.get(`/moment/${id}/likes`),

  // 点赞动态（新接口）
  likeMoment: (id) => request.post('/moment/like', { momentId: id }),

  // 取消点赞（新接口）
  unlikeMoment: (id) => request.post('/moment/unlike', { momentId: id }),

  // 评论动态（新接口）
  commentMoment: (id, data) => request.post('/moment/comment', { momentId: id, ...data }),

  // 获取热门动态
  getHotMoments: (params) => request.get('/moment/hot', params)
};

/**
 * 关注相关API
 */
export const followApi = {
  // 关注用户
  follow: (userId) => request.post('/user/follow', { followUserId: userId }),

  // 取消关注
  unfollow: (userId) => request.post('/user/unfollow', { followUserId: userId }),

  // 获取关注列表
  getFollowings: (params) => request.get('/user/followings', params),

  // 获取粉丝列表
  getFollowers: (params) => request.get('/user/followers', params)
};

/**
 * 访客相关API
 */
export const visitorApi = {
  // 获取访客记录
  getVisitors: (params) => request.get('/user/visitors', params)
};

/**
 * 消息相关API（扩展）
 */
export const messageExtApi = {
  // 上传语音
  uploadVoice: (filePath) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: request.baseURL + '/message/upload/voice',
        filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        success: (res) => {
          resolve(JSON.parse(res.data));
        },
        fail: reject
      });
    });
  },

  // 上传图片
  uploadImage: (filePath) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: request.baseURL + '/message/upload/image',
        filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        success: (res) => {
          resolve(JSON.parse(res.data));
        },
        fail: reject
      });
    });
  },

  // 标记用户消息已读
  markUserAsRead: (userId) => request.post(`/message/read/${userId}`)
};

/**
 * VIP相关API
 */
export const vipApi = {
  // 获取VIP套餐列表
  getPackages: () => request.get('/vip/packages'),
  
  // 查询用户VIP状态
  getVipStatus: () => request.get('/vip/status'),
  
  // 订阅VIP
  subscribe: (data) => request.post('/vip/subscribe', data),
  
  // 获取VIP特权列表
  getPrivileges: () => request.get('/vip/privileges'),
  
  // 检查用户是否是VIP（内部调用）
  checkVip: (userId) => request.get(`/vip/check/${userId}`),
  
  // 检查用户是否有特定特权（内部调用）
  checkPrivilege: (userId, privilegeCode) => request.get('/vip/check-privilege', { userId, privilegeCode })
};

/**
 * 钱包相关API
 */
export const walletApi = {
  // 查询钱包余额
  getWallet: () => request.get('/payment/wallet'),

  // 获取交易记录
  getTransactions: (params) => request.get('/payment/wallet/transactions', params),

  // 创建充值订单
  createRechargeOrder: (data) => request.post('/payment/wallet/recharge', data),

  // 消费（扣除余额）
  consume: (data) => request.post('/payment/wallet/consume', data)
};

/**
 * 签到相关API
 */
export const checkinApi = {
  // 每日签到
  checkin: () => request.post('/user/checkin'),

  // 查询签到状态
  getStatus: () => request.get('/user/checkin/status'),

  // 获取签到记录
  getRecords: (params) => request.get('/user/checkin/records', params)
};

/**
 * 礼物相关API
 */
export const giftApi = {
  // 获取礼物分类
  getCategories: () => request.get('/gift/categories'),

  // 获取礼物列表
  getGifts: (categoryId) => request.get('/gift/list', { categoryId }),

  // 赠送礼物
  sendGift: (data) => request.post('/gift/send', data),

  // 获取赠送记录
  getRecords: (params) => request.get('/gift/records', params)
};

/**
 * 亲密度相关API
 */
export const intimacyApi = {
  // 查询与某用户的亲密度
  getIntimacy: (friendId) => request.get(`/user/intimacy/${friendId}`),

  // 获取亲密度排行榜
  getRanking: (limit = 10) => request.get('/user/intimacy/ranking', { limit }),

  // 增加亲密度（内部调用）
  increaseIntimacy: (data) => request.post('/user/intimacy/increase', data)
};

/**
 * 举报相关API
 */
export const reportApi = {
  // 举报用户
  reportUser: (data) => request.post('/admin/report', data),

  // 获取举报列表（后台）
  getReports: (params) => request.get('/admin/reports', params),

  // 处理举报（后台）
  handleReport: (id, data) => request.put(`/admin/reports/${id}/handle`, data)
};

/**
 * 音视频通话相关API
 */
export const rtcApi = {
  // 获取通话Token
  getToken: (data) => request.post('/rtc/token', data),

  // 发起通话
  startCall: (data) => request.post('/rtc/call', data),

  // 接受通话
  acceptCall: (callId) => request.post(`/rtc/accept/${callId}`),

  // 拒绝通话
  rejectCall: (callId) => request.post(`/rtc/reject/${callId}`),

  // 结束通话
  endCall: (callId) => request.post(`/rtc/end/${callId}`),

  // 获取通话记录
  getCallRecords: (params) => request.get('/rtc/records', params)
};

/**
 * 群聊相关API
 */
export const groupApi = {
  // 创建群聊
  createGroup: (data) => request.post('/message/group/create', data),

  // 获取群聊列表
  getGroups: () => request.get('/message/groups'),

  // 获取群详情
  getGroupDetail: (groupId) => request.get(`/message/group/${groupId}`),

  // 邀请成员
  inviteMember: (groupId, data) => request.post(`/message/group/${groupId}/invite`, data),

  // 退出群聊
  leaveGroup: (groupId) => request.post(`/message/group/${groupId}/leave`),

  // 获取群消息
  getGroupMessages: (groupId, params) => request.get(`/message/group/${groupId}/messages`, params),

  // 发送群消息
  sendGroupMessage: (groupId, data) => request.post(`/message/group/${groupId}/message`, data)
};

/**
 * 话题相关API
 */
export const topicApi = {
  // 获取话题列表
  getTopics: (params) => request.get('/moment/topics', params),

  // 获取话题详情
  getTopicDetail: (topicId) => request.get(`/moment/topic/${topicId}`),

  // 获取话题下的动态
  getTopicMoments: (topicId, params) => request.get(`/moment/topic/${topicId}/moments`, params),

  // 关注话题
  followTopic: (topicId) => request.post(`/moment/topic/${topicId}/follow`),

  // 取消关注话题
  unfollowTopic: (topicId) => request.post(`/moment/topic/${topicId}/unfollow`)
};
