'use strict';


export const showLoading = (mask = false) => {
  wx.showLoading({
    mask,
  })
}

export const hideLoading = () => {
  wx.hideLoading();
}


/**
 * @description 格式化时间戳
 * 
 * @param {Date|Number} [date] 时间对象或时间戳
 * @param {String} [format='Y-M-D'] 目标格式   Y:年  M:月   D:日   h:小时   i:分   s:秒   'Y-M-D'=>'2020-01-01' 
 * 
 * @returns {String}
 */
export const formatTime = (date, format = 'Y-M-D') => {
  let result = '';

  switch (typeof date) {
    case 'undefined':
      date = new Date();
      break;

    case 'number':
      if (('' + date).length === 10) {
        date *= 1000;
      }
      date = new Date(date);
      break;

    case 'object':
      if (date === null) {
        date = new Date();
      }
      break;

    default:
      // if (ENV === envType.dev) {
      //   throw new Error('date类型错误');
      // }
      break;
  }

  let year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate(),
    hour = date.getHours(),
    minute = date.getMinutes(),
    second = date.getSeconds();

  [year, month, day, hour, minute, second] = [year, month, day, hour, minute, second].map(formatNumber);

  result = format.replace(/(Y)|(M)|(D)|(h)|(i)|(s)/g, (match) => {
    let result = '';
    switch (match) {
      case 'Y':
        result = year;
        break;

      case 'M':
        result = month;

        break;

      case 'D':
        result = day;

        break;

      case 'h':
        result = hour;

        break;

      case 'i':
        result = minute;

        break;

      case 's':
        result = second;

        break;
    }

    return result;
  });

  return result;
}



/**
 * @description 个位数补0
 * @param {Number|String} n 
 */
export const formatNumber = n => {
  n = '' + n;
  return n[1] ? n : '0' + n;
}


/**
 * @description 手机号格式验证
 * 
 * @param {String} phone 
 * 
 * @returns {Boolean}
 */
export const verifyPhone = phone => /^1(3[0-9]|4[5,7]|5[0,1,2,3,5,6,7,8,9]|6[2,5,6,7]|7[0,1,7,8]|8[0-9]|9[1,8,9])\d{8}$/.test(phone);

/**
 * @description 微信API调用状态
 * 
 * @param {String} msg
 * 
 * @returns {Boolean}
 */
export const isWXAPISuccess = msg => {
  const regexp = /:ok/;

  return regexp.test(msg);
}

/**
 * 判断是否是undefined
 */
export const isUndefined = val => val === undefined;

/**
 * 判断Promise
 */
export const isPromise = val=>{
  return val instanceof Promise;
}


/**
 * @description 将秒数转一个包含时分秒的对象
 */
export const secondToObj = second => {
  const s = second % 60 || 0,
    m = Math.floor(second / 60 % 60) || 0,
    h = Math.floor(second / 60 / 60) || 0;

  return { h, m, s };
}

/**
 * @description 秒表
 * 
 * @param {Number} second秒数
 * @param {Object} [options={}] 其他选项
 * @param {String} options.type  秒表类型  timing:计时  countdown:倒计时  
 * @param {Boolean} options.immediate 立即开始
 * @param {Function} options.secondCb 每秒回调
 * @param {Function} options.endCb 倒计时结束回调
 * 
 */
export class StopWatch {
  constructor(second, options = {}) {
    this.secondCb = options.secondCb; // 每秒回调
    this.endCb = options.endCb; // 结束回调
    this.timer = null; // 计时器

    this.grandTotal = 0; // 累计丢失时间
    this.startStamp = 0; // 开始时间戳
    this.stopStamp = 0; // 停止时间戳

    const { h, m, s } = secondToObj(second);

    [this.h, this.m, this.s] = [h, m, s].map(key => formatNumber(key));

    const { type = 'timing' } = options;
    this.type = type;

    const strategy = {
      timing: () => {
        let { s, m, h } = this;

        s = parseInt(s),
          m = parseInt(m),
          h = parseInt(h);

        if (s < 59) {
          s++;
          this.s = formatNumber(s);
          return;
        }

        this.s = '00';

        if (m < 59) {
          m++;
          this.m = formatNumber(m);
          return;
        }

        this.m = '00';

        h++;
        this.h = formatNumber(h)
      },

      countdown: () => {
        let { s, m, h } = this;

        s = parseInt(s),
          m = parseInt(m),
          h = parseInt(h);

        s--;
        if (s > 0) {
          this.s = formatNumber(s);
          return;
        }
        this.s = '00';

        if (m > 0) {
          this.s = 59;
          m--;
          this.m = formatNumber(m);
          return;
        }

        if (h > 0) {
          this.m = 59;
          h--;
          this.h = formatNumber(h);
          return;
        }

        this.stop();
        this.endCb();
      }

    }

    this.exec = strategy[type];

    this.timerCb = this.timerCb.bind(this);
    if (options.immediate) {
      this.start();
    }
  }

  // 重置
  reset() {
    this.h = '00',
      this.m = '00',
      this.s = '00';
    this.startStamp = 0;
    this.stopStamp = 0;
  }

  // 停止
  stop() {
    
    this.grandTotal += (Date.now() - this.startStamp) % 1000;
    clearInterval(this.timer);
    clearTimeout(this.timer);
  }

  // 开始
  start() {
    const { grandTotal } = this;
    this.startStamp = Date.now();

    // 增加时间精度
    // 填补丢失时间
    if (grandTotal >= 1000) {

      this.timerCb();
      this.grandTotal -= 1000;
      this.start();
      return;
    } else if (grandTotal > 0) {
      this.timer = setTimeout(() => {
        this.timerCb();
        this.grandTotal = 0;
        this.start();
      }, 1000 - grandTotal);

      return;

    }

    this.timer = setInterval(this.timerCb, 1000);

  }

  // 计时器回调
  timerCb() {
    this.exec();
    this.secondCb?.(this.s, this.m, this.h);
  }


}

