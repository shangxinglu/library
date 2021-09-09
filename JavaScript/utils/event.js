

let _event = Object.create(null); // 事件对象

/**
 * @description 添加事件监听器
 * 
 * @param {String|Array} type 一个或多个事件类型
 * @param {Function} handler 监听器
 */
function $on(type,handler){
    if(Array.isArray(type)){
      for(let item of type){
        on(item,handler);
      }
      return;
    }

    (_event[type]||(_event[type] = [])).push(handler);
    
}

/**
 * @description 移除事件监听器
 * 
 * @param {String|Array} type 一个或多个事件类型
 * @param {Function} handler 监听器
 */
function $off(type,handler){
  if(arguments.length===0){
    _event = Object.create(null);
    return;
  }

  if(Array.isArray(type)){
    for(let item of type){
      off(item,handler);
    }
    return;
  }


  if(!handler){
    _event[type] =[];
    return;
  }

  const handlerArr = _event[type];
  for(let i=handlerArr.length-1;i>=0;i--){
    const item = handlerArr[i];
    if(item.fn === handler||item===handler){
      handlerArr.splice(i,1);
    }
  }

}

/**
 * @description 触发事件
 * 
 * @param {String} type 
 * @param {Array} args
 */
function $emit(type,...args){
  const e = _event[type]||[];
  for(let item of e){
    item(...args);
  }
}

/**
 * @description 添加事件触犯单次的监听器
 * 
 * @param {String} type 一个或多个事件类型
 * @param {Function} handler 监听器
 */
function $once(type,handler){
  const deHandler = ()=>{
    off(type,handler);
    handler(...arguments);
  }

  deHandler.fn = handler;
  on(type,deHandler);
  // debugger
}

export {
  $on,
  $off,
  $emit,
  $once,
}