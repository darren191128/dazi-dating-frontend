/**
 * RTC音视频通话相关API
 */
export const rtcApi = {
  // 获取通话Token
  getToken: (roomId) => request.post('/rtc/token', { roomId }),
  
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
