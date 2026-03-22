const BASE_URL = 'http://localhost:8080/api'

// 请求拦截
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data.data)
          } else {
            uni.showToast({ title: res.data.message, icon: 'none' })
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          uni.showToast({ title: '登录已过期', icon: 'none' })
          uni.navigateTo({ url: '/pages/login/index' })
          reject(res)
        } else {
          uni.showToast({ title: '请求失败', icon: 'none' })
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

export default request

// API封装
export const userApi = {
  wxLogin: (data) => request({ url: '/user/login/wx', method: 'POST', data }),
  getUserInfo: (userId) => request({ url: `/user/info/${userId}` }),
  updateProfile: (userId, data) => request({ url: `/user/profile/${userId}`, method: 'PUT', data })
}

export const activityApi = {
  getList: (params) => request({ url: '/activity/list', data: params }),
  getDetail: (id) => request({ url: `/activity/detail/${id}` }),
  create: (data) => request({ url: '/activity/create', method: 'POST', data }),
  join: (id, userId) => request({ url: `/activity/join/${id}`, method: 'POST', data: { userId } }),
  quit: (id, userId) => request({ url: `/activity/quit/${id}`, method: 'POST', data: { userId } })
}

export const matchApi = {
  getNearby: (params) => request({ url: '/match/nearby', data: params }),
  getRecommendations: (data) => request({ url: '/match/recommend', method: 'POST', data })
}

export const paymentApi = {
  createOrder: (data) => request({ url: '/payment/create', method: 'POST', data }),
  getStatus: (orderNo) => request({ url: `/payment/status/${orderNo}` })
}
