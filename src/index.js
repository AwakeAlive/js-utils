export const emptyObject = Object.freeze({})

export function isUndef(v) {
  return v === undefined || v === null
}

export function isDef(v) {
  return v !== undefined && v !== null
}
/**
 * Get the raw type string of a value, e.g., [object Object].
 */
const _toString = Object.prototype.toString
export function toRawType(value) {
  return _toString.call(value).slice(8, -1)
}
/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
export function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}
/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
export function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]'
}

export function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Convert a value to a string that is actually rendered.
 */
export function toString(val) {
  return val == null ?
    '' :
    Array.isArray(val) || (isPlainObject(val) && val.toString === _toString) ?
    JSON.stringify(val, null, 2) :
    String(val)
}

/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */
export function toNumber(val) {
  const n = parseFloat(val)
  return isNaN(n) ? n : val
}
/**
 * Create a cached version of a pure function.
 */
export function memorized(fn) {
  const lookUpTable = {}
  return arg => lookUpTable[arg] || (lookUpTable[arg] = fn(arg))
}
/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
export function looseEqual(a, b) {
  if (a === b) return true
  const isObjectA = isObject(a)
  const isObjectB = isObject(b)
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = Array.isArray(a)
      const isArrayB = Array.isArray(b)
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every((e, i) => {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        return keysA.length === keysB.length && keysA.every(key => {
          return looseEqual(a[key], b[key])
        })
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}
/**
 * Ensure a function is called only once.
 */
export function once(fn) {
  let called = false
  return function () {
    if (!called) {
      called = true
      fn.apply(this, arguments)
    }
  }
}
/**
 * 防抖函数
 * https: //github.com/mqyqingfeng/Blog/issues/22
 * https: //github.com/Advanced-Frontend/Daily-Interview-Question/issues/5
 * https: //github.com/pekonchan/Blog/issues/14
 * @export
 * @param {Function} fn 执行函数
 * @param {Number} wait 延迟时间
 * @param {Boolean} immediate 是否立即执行
 * @returns 
 */
export function debounce(fn, wait, immediate) {
  var timerId, result

  var debounced = function () { // 保证this指向context 和 参数arguments
    var context = this
    var args = arguments
    wait = wait || 0

    if (typeof fn !== 'function') {
      throw new Error('debounce的第一个参数请传入函数')
    }
    // if (timerId) clearTimeout(timerId) 优化为下面一句
    timerId && clearTimeout(timerId)
    // 如果是立即执行
    if (immediate) {
      // 如果已经过了规定时间，则执行函数 或 第一次触发监听事件

      // var callNow = !timerId 下面两句优化为1句
      // if (callNow) result = fn.apply(context, args)
      !timerId && (result = fn.apply(context, args))
      // 规定时间后 定时器id，表明大大了规定时间
      timerId = setTimeout(function () {
        timerId = null
      }, wait)
    } else { // 延后执行
      // 只有到达了规定时间后太会执行fn函数
      timerId = setTimeout(function () {
        fn.apply(context, args)
        timerId = null
      }, wait)
    }

    return result

  }
  // 手动取消该次设定的防抖时间，取消后当成是‘第一次触发’一样
  debounced.cancel = function () {
    clearTimeout(timerId)
    timerId = null
  }

  return debounced

}
/**
 * 节流函数
 * https: //github.com/Advanced-Frontend/Daily-Interview-Question/issues/5
 * https: //github.com/mqyqingfeng/Blog/issues/26
 * https: //github.com/pekonchan/Blog/issues/14
 * throttle的场景流程说明:
 * 在 { leading: true, trailing: true } 下， 为大多数正常需求所用。 在这种情况下， 条件① 只有在第一次触发， 以及后续超过规定间隔时间后的第一次触发， 才会走到该流程下； 其余都是在条件② 下触发fn。
 * 在 { leading: false} 下， 都是在条件② 下触发fn， 走不到条件① 下的。
 * 在 { trailing: false } 下， 都是在条件① 下触发fn， 走不到条件② 下的。
 * @export
 * @param {Function} fn 实际要执行的函数，对其进行节流
 * @param {Number} wait 规定时间间隔
 * @param {Object} options 用于设置节流的函数的触发时机
 *                    默认{leading: true, trailing: true} 表示第一次触发监听事件马上执行，停止后最后也执行一次
 *                    leading为false，表示第一次触发不马上执行
 *                    trailing为false，表示最后停止触发后不执行
 * @returns {Function} 返回经过节流的函数
 */
export function throttle(fn, wait, options) {
  var timerId, context, args, result
  var previous = 0 // 上次触发fn的时间戳
  wait = wait || 0
  options = options || {} // leading为true表示开始执行一次，trailing为true，停止时执行1次

  if (typeof fn !== 'function') {
    throw new Error('throttle第一个参数请传入参数')
  }

  if (options.leading === false && options.trailing === false) {
    throw new Error('option的leading和trailing不能同时为false')
  }


  var later = function () {
    previous = options.leading === false ? 0 : +new Date()
    timerId = null
    fn.apply(context, args);
    !timerId && (context = args = null)
  }

  var throttled = function () {
    var now = +new Date()
    // 如果没有上次触发执行时间（即第一次运行），以及leading设置为false
    if (!previous && options.leading === false) previous = now
    // 距离到达规定的wait时间剩余时间
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    // 条件①：如果到达了规定的间隔时间或用户自己设定了系统时间导致的不合理时间差，则立刻执行一次触发函数
    if (remaining <= 0 || remaining > wait) {
      fn.apply(context, args);
      previous = now;
      if (timerId) {
        clearTimeout(timerId), timerId = null
      }
      if (!timerId) context = args = null
      // 条件②：如果未达到规定时间，以及要求停止后延迟执行（trailing=false）
    } else if (!timerId && options.trailing !== false) {
      timerId = setTimeout(later, remaining)
    }

  }

  throttled.cancel = function () {
    clearTimeout(timerId)
    previous = 0
    timerId = null
  }

  return throttled

}