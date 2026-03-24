/**
 * 节流函数
 * 在指定时间内只执行一次函数
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, delay = 300) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      return fn.apply(this, args);
    }
  };
}

/**
 * 防抖函数
 * 延迟执行函数，如果在延迟时间内再次调用则重新计时
 * @param {Function} fn - 要执行的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 格式化日期
 * @param {string|Date|number} date - 日期
 * @param {string} format - 格式模板，默认'YYYY-MM-DD HH:mm'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化距离
 * @param {number} distance - 距离（米）
 * @returns {string} 格式化后的距离字符串
 */
export function formatDistance(distance) {
  if (distance === undefined || distance === null) return '未知';
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}

/**
 * 格式化数字（超过10000显示为x.x万）
 * @param {number} num - 数字
 * @returns {string} 格式化后的字符串
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿';
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return String(num);
}

/**
 * 深拷贝对象
 * @param {Object} obj - 要拷贝的对象
 * @returns {Object} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 检查对象是否为空
 * @param {Object} obj - 要检查的对象
 * @returns {boolean} 是否为空
 */
export function isEmpty(obj) {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim() === '';
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 图片懒加载指令
 * 在组件的onReady或onLoad中使用
 * @param {string} selector - 图片选择器
 * @param {Object} options - 配置选项
 */
export function lazyLoadImages(selector = '.lazy-image', options = {}) {
  const {
    threshold = 100,
    placeholder = '/static/placeholder.png'
  } = options;

  const observer = uni.createIntersectionObserver({
    thresholds: [0],
    initialRatio: 0
  });

  observer.relativeToViewport({ bottom: threshold });
  
  observer.observe(selector, (res) => {
    if (res.intersectionRatio > 0) {
      const dataset = res.dataset;
      if (dataset.src) {
        // 这里可以设置图片的src
        // 实际使用时需要在组件中配合data-src使用
      }
    }
  });

  return observer;
}

/**
 * 页面滚动到指定位置
 * @param {number} scrollTop - 滚动位置
 * @param {number} duration - 动画时长
 * @returns {Promise}
 */
export function scrollTo(scrollTop = 0, duration = 300) {
  return new Promise((resolve) => {
    uni.pageScrollTo({
      scrollTop,
      duration,
      complete: resolve
    });
  });
}

/**
 * 显示确认对话框
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @returns {Promise<boolean>} 用户是否确认
 */
export function confirm(title = '提示', content = '') {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
}

/**
 * 显示操作菜单
 * @param {Array<string>} itemList - 菜单项列表
 * @returns {Promise<number>} 选中的索引，-1表示取消
 */
export function showActionSheet(itemList) {
  return new Promise((resolve) => {
    uni.showActionSheet({
      itemList,
      success: (res) => {
        resolve(res.tapIndex);
      },
      fail: () => {
        resolve(-1);
      }
    });
  });
}
