import { config, TIMEOUT } from '@/config';

/**
 * 请求状态管理
 */
class RequestState {
  constructor() {
    this.pendingRequests = new Map();
    this.loadingCount = 0;
  }

  /**
   * 添加请求
   */
  addRequest(key, request) {
    this.pendingRequests.set(key, request);
  }

  /**
   * 移除请求
   */
  removeRequest(key) {
    this.pendingRequests.delete(key);
  }

  /**
   * 取消所有请求
   */
  cancelAllRequests() {
    this.pendingRequests.forEach((request, key) => {
      // 微信小程序不支持AbortController，使用标记方式
      request._cancelled = true;
    });
    this.pendingRequests.clear();
  }

  /**
   * 增加loading计数
   */
  incrementLoading() {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      uni.showLoading({
        title: '加载中...',
        mask: true
      });
    }
  }

  /**
   * 减少loading计数
   */
  decrementLoading() {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      uni.hideLoading();
    }
  }
}

const requestState = new RequestState();

/**
 * 统一请求封装
 * 支持请求拦截、响应拦截、loading控制、错误处理
 */
class Request {
  constructor() {
    this.baseURL = config.baseURL;
    // 默认显示loading的请求方法
    this.showLoadingMethods = ['POST', 'PUT', 'DELETE'];
  }

  /**
   * 获取token
   * @returns {string} token
   */
  getToken() {
    return uni.getStorageSync('token') || '';
  }

  /**
   * 生成请求唯一标识
   * @param {Object} options - 请求配置
   * @returns {string} 请求标识
   */
  generateRequestKey(options) {
    return `${options.method}_${options.url}_${JSON.stringify(options.data || {})}`;
  }

  /**
   * 请求拦截
   * @param {Object} options - 请求配置
   * @param {boolean} showLoading - 是否显示loading
   * @returns {Object} 处理后的配置
   */
  interceptorsRequest(options, showLoading = true) {
    const token = this.getToken();
    if (token) {
      options.header = {
        ...options.header,
        'Authorization': `Bearer ${token}`
      };
    }

    // 防止重复提交：相同请求在pending中时，直接返回之前的promise
    const requestKey = this.generateRequestKey(options);
    if (requestState.pendingRequests.has(requestKey)) {
      console.warn(`[Request] 重复请求被拦截: ${requestKey}`);
      return { _duplicate: true, _promise: requestState.pendingRequests.get(requestKey) };
    }

    // 显示loading
    if (showLoading && this.showLoadingMethods.includes(options.method)) {
      requestState.incrementLoading();
    }

    return options;
  }

  /**
   * 响应拦截
   * @param {Object} response - 响应对象
   * @param {Object} options - 请求配置
   * @param {boolean} showLoading - 是否显示loading
   * @returns {Promise} 处理后的响应
   */
  interceptorsResponse(response, options, showLoading = true) {
    // 隐藏loading
    if (showLoading && this.showLoadingMethods.includes(options.method)) {
      requestState.decrementLoading();
    }

    // 检查请求是否被取消
    if (options._cancelled) {
      return Promise.reject(new Error('请求已取消'));
    }

    // 移除pending请求
    const requestKey = this.generateRequestKey(options);
    requestState.removeRequest(requestKey);

    // 处理HTTP状态码
    if (response.statusCode === 401) {
      // 未授权，清除登录状态并跳转登录页
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/index' });
      }, 1500);
      return Promise.reject(new Error('登录已过期'));
    }

    if (response.statusCode === 403) {
      uni.showToast({
        title: '没有权限执行此操作',
        icon: 'none'
      });
      return Promise.reject(new Error('权限不足'));
    }

    if (response.statusCode === 404) {
      uni.showToast({
        title: '请求的资源不存在',
        icon: 'none'
      });
      return Promise.reject(new Error('资源不存在'));
    }

    if (response.statusCode >= 500) {
      uni.showToast({
        title: '服务器繁忙，请稍后重试',
        icon: 'none'
      });
      return Promise.reject(new Error('服务器错误'));
    }

    if (response.statusCode !== 200) {
      uni.showToast({
        title: `请求失败(${response.statusCode})`,
        icon: 'none'
      });
      return Promise.reject(new Error(`HTTP ${response.statusCode}`));
    }

    // 处理业务错误
    if (response.data && response.data.code !== 200) {
      const message = response.data.message || '请求失败';
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2500
      });
      return Promise.reject(response.data);
    }

    return Promise.resolve(response.data);
  }

  /**
   * 处理请求错误
   * @param {Error} error - 错误对象
   * @param {Object} options - 请求配置
   * @param {boolean} showLoading - 是否显示loading
   */
  handleRequestError(error, options, showLoading = true) {
    // 隐藏loading
    if (showLoading && this.showLoadingMethods.includes(options.method)) {
      requestState.decrementLoading();
    }

    // 移除pending请求
    const requestKey = this.generateRequestKey(options);
    requestState.removeRequest(requestKey);

    console.error('[Request Error]', error);

    // 网络错误处理
    if (error.errMsg && error.errMsg.includes('timeout')) {
      uni.showToast({
        title: '请求超时，请检查网络',
        icon: 'none',
        duration: 2500
      });
    } else if (error.errMsg && error.errMsg.includes('fail')) {
      uni.showToast({
        title: '网络连接失败，请检查网络',
        icon: 'none',
        duration: 2500
      });
    }

    return Promise.reject(error);
  }

  /**
   * 发起请求
   * @param {Object} options - 请求配置
   * @param {boolean} showLoading - 是否显示loading，默认true
   * @returns {Promise} 请求Promise
   */
  request(options, showLoading = true) {
    const requestOptions = this.interceptorsRequest({
      url: this.baseURL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      timeout: options.timeout || TIMEOUT
    }, showLoading);

    // 如果是重复请求，返回之前的promise
    if (requestOptions._duplicate) {
      return requestOptions._promise;
    }

    const requestPromise = new Promise((resolve, reject) => {
      const task = uni.request({
        ...requestOptions,
        success: (res) => {
          this.interceptorsResponse(res, requestOptions, showLoading)
            .then(resolve)
            .catch(reject);
        },
        fail: (err) => {
          this.handleRequestError(err, requestOptions, showLoading)
            .catch(reject);
        }
      });

      // 保存请求任务，用于取消
      requestOptions._task = task;
    });

    // 保存到pending请求中
    const requestKey = this.generateRequestKey(requestOptions);
    requestState.addRequest(requestKey, requestOptions);

    return requestPromise;
  }

  /**
   * GET请求
   * @param {string} url - 请求地址
   * @param {Object} params - URL参数
   * @param {boolean} showLoading - 是否显示loading
   * @returns {Promise} 请求Promise
   */
  get(url, params = {}, showLoading = false) {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request({
      url: fullUrl,
      method: 'GET'
    }, showLoading);
  }

  /**
   * POST请求
   * @param {string} url - 请求地址
   * @param {Object} data - 请求数据
   * @param {boolean} showLoading - 是否显示loading
   * @returns {Promise} 请求Promise
   */
  post(url, data = {}, showLoading = true) {
    return this.request({
      url,
      method: 'POST',
      data
    }, showLoading);
  }

  /**
   * PUT请求
   * @param {string} url - 请求地址
   * @param {Object} data - 请求数据
   * @param {boolean} showLoading - 是否显示loading
   * @returns {Promise} 请求Promise
   */
  put(url, data = {}, showLoading = true) {
    return this.request({
      url,
      method: 'PUT',
      data
    }, showLoading);
  }

  /**
   * DELETE请求
   * @param {string} url - 请求地址
   * @param {Object} params - URL参数
   * @param {boolean} showLoading - 是否显示loading
   * @returns {Promise} 请求Promise
   */
  delete(url, params = {}, showLoading = true) {
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.request({
      url: fullUrl,
      method: 'DELETE'
    }, showLoading);
  }

  /**
   * 上传文件
   * @param {string} url - 上传地址
   * @param {string} filePath - 文件路径
   * @param {Object} formData - 附加表单数据
   * @returns {Promise} 上传Promise
   */
  upload(url, filePath, formData = {}) {
    return new Promise((resolve, reject) => {
      requestState.incrementLoading();
      
      uni.uploadFile({
        url: this.baseURL + url,
        filePath,
        name: 'file',
        formData,
        header: {
          'Authorization': `Bearer ${this.getToken()}`
        },
        success: (res) => {
          requestState.decrementLoading();
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data);
              if (data.code === 200) {
                resolve(data);
              } else {
                uni.showToast({
                  title: data.message || '上传失败',
                  icon: 'none'
                });
                reject(data);
              }
            } catch (e) {
              resolve(res);
            }
          } else {
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            });
            reject(res);
          }
        },
        fail: (err) => {
          requestState.decrementLoading();
          uni.showToast({
            title: '上传失败，请检查网络',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  }

  /**
   * 取消所有请求
   */
  cancelAll() {
    requestState.cancelAllRequests();
  }
}

export default new Request();
