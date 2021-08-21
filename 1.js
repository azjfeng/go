/**
 * 定义接口的base_url--现网
 */
//const base_url = 'https://kf.qq.com/cgi-bin/common?';
//const uploadimg_url = 'https://file.service.qq.com/cgi-bin/minipic?';
/**
 * 定义接口的base_url--测试环境
 */
import config from '../config';

//云服务接入测试
// const base_url_dev = 'https://kftest.qq.com/cgi-bin/common?'
// const uploadimg_url_dev = 'https://kf.qq.com/dev_miniChengXu/cgi-bin/minipic?'
// const static_js_url_dev = 'https://kftest.qq.com/touch/xcx/static/';
// const production_static_js_url = 'https://kftest.qq.com/touch/xcx/static/';

const base_url_dev = 'https://kf.qq.com/dev_miniChengXu/cgi-bin/common?'
const uploadimg_url_dev = 'https://kf.qq.com/dev_miniChengXu/cgi-bin/minipic?'
const static_js_url_dev = 'https://kf.qq.com/dev_miniChengXu/touch/xcx/static/'

const base_url_test = 'https://kf.qq.com/miniChengXu/cgi-bin/common?';
const uploadimg_url_test = 'https://kf.qq.com/miniChengXu/cgi-bin/minipic?';
const static_js_url_test = 'https://kf.qq.com/miniChengXu/touch/xcx/static/';

const base_url = 'https://kf.qq.com/cgi-bin/common?';
const uploadimg_url = 'https://file.service.qq.com/cgi-bin/minipic?';
const static_js_url = 'https://kf.qq.com/touch/xcx/static/';

const production_static_js_url = 'https://kf.qq.com/touch/xcx/static/';
const mta = require('mta_analysis.js');
const report = require('report.js');
import beacon from './beacon';
export function mtainit() {
  mta.Page.init()
}
/**
 * 通过异步get数据
 * @param url           请求地址
 * @param params        请求参数
 * @param callback      回调函数
 * @returns void
 */
export function ajaxGet(url, params, callback) {
  ajaxApi('GET', url, params, callback);
}
/**
 * 通过异步post数据
 * @param url           请求地址
 * @param params        请求参数
 * @param callback      回调函数
 * @returns void
 */
export function ajaxPost(url, params, callback) {
  ajaxApi('POST', url, params, callback);
}
/**
 * 通过wx.request异步
 * @param method        请求类型: OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
 * @param url           请求地址
 * @param params        请求参数
 * @param callback      回调函数
 * @returns void
 */
export function ajaxApi(method, url, params, callback) {
  params = params || {};
  method = method.toUpperCase();
  if (url.indexOf("https") !== 0) {
    switch (config.mode) {
      case 'dev':
        url = base_url_dev + url;
        break;
      case 'test':
        url = base_url_test + url;
        break;
      case 'pro':
        url = base_url + url
        break;
      default:
        break;
    }
  }
  wx.request({
    url: url,
    data: params,
    method: method,
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      if (typeof callback == 'function') callback(res, params);
    },
    fail: function (res) {
      //接口异常返回状态值为-1
      report.api_fail(url);
      res = res || {};
      res.statusCode = -1;
      res.data = [];
      if (typeof callback == 'function') callback(res, params);
    }
  })
}

/**
 * 通过wx.request异步
 * @param method        请求类型: OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
 * @param url           请求地址
 * @param params        请求参数
 * @param callback      回调函数
 * @returns void
 */
export function pingAjaxApi(method, url, params, callback) {
  params = params || {};
  method = method.toUpperCase();
  if (url.indexOf("https") !== 0) {
    switch (config.mode) {
      case 'dev':
        url = base_url_dev + url;
        break;
      case 'test':
        url = base_url_test + url;
        break;
      case 'pro':
        url = base_url + url
        break;
      default:
        break;
    }
  }
  wx.request({
    url: url,
    data: params,
    method: method,
    timeout: 5000,
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      if (typeof callback == 'function') callback(res, params);
    },
    fail: function (res) {
      //接口异常返回状态值为-1
      report.api_fail(url);
      res = res || {};
      res.statusCode = -1;
      res.data = [];
      if (typeof callback == 'function') callback(res, params);
    }
  })
}

/**
 * 登录验证
 * @param callback  回调函数
 * @returns void
 */
export function login(callback) {
  wx.login({
    success: function (res) {
      if (res.code) {
        const command = "channel=flow&command=" + encodeURIComponent("command=F10181&code=" + res.code + "\r\n");
        ajaxGet(command, {}, function (response) {
          response.code = res.code;
          if (response.data.resultcode === 0 && response.data.resultinfo.list && response.data.resultinfo.list[0].miniskey) {
            //接口返回信息保存session中
            var nowtime = Date.parse(new Date()) / 1000;
            setSession('miniskeytime', nowtime);
            setSession('miniskey', response.data.resultinfo.list[0].miniskey);
          } else {
            setSession('miniskey', '');
            wx.showModal({
              showCancel: false,
              content: "网络繁忙，请稍后再试"
            })
          }
          if (typeof callback == 'function') callback(response);
        });
      } else {
        res.statusCode = -1;
        if (typeof callback == 'function') callback(res);
      }
    },
    fail: function (res) {
      res.statusCode = -1;
      if (typeof callback == 'function') callback(res);
    }
  })
}
/**
 * 检测用户登录态是否失效，如失效则重新登录
 * @param callback  回调函数
 * @returns void
 */
export function checkLogin(callback) {
  wx.checkSession({
    success: function (res) {
      //session 未过期，并且在本生命周期一直有效
    },
    fail: function () {
      //登录态过期,重新登录
      login(callback);
    }
  })
}
/**
 * 检测用户登录态是否失效，如失效则重新登录
 * @param callback  回调函数
 * @returns void
 */
export function getminiskey(callback) {
  wx.checkSession({
    success: function (res) {
      //session 未过期，并且在本生命周期一直有效
      var miniskey = getSession("miniskey");
      var miniskeytime = +getSession("miniskeytime");
      var nowtime = +new Date / 1000;
      var limit = 60 * 60;//miniskey有效期单位：秒
      //console.log('getminiskeyXXXXXXXXXXXXXXXXXXXXX', miniskeytime, nowtime, miniskey);
      if (miniskey != '' && miniskeytime > 0 && (nowtime - miniskeytime) <= limit) {
        //console.log('getminiskey cache', miniskeytime, nowtime);
        if (typeof callback == 'function') callback(miniskey);
      } else {
        //console.log('getminiskey nocache', miniskeytime, nowtime);
        loginnew(function (result) {
          if (result.statusCode == 0) {
            if (typeof callback == 'function') callback(result.miniskey);
          } else {
            if (typeof callback == 'function') callback(-1);
          }
        });
      }
    },
    fail: function () {
      //登录态过期,重新登录
      loginnew(function (result) {
        if (result.statusCode == 0) {
          if (typeof callback == 'function') callback(result.miniskey);
        } else {
          if (typeof callback == 'function') callback(-1);
        }
      });
    }
  })
}
/**
 * 登录验证
 * @param callback  回调函数
 * @returns void
 */
export function loginnew(callback) {
  wx.login({
    success: function (res) {
      if (res.code) {
        const command = "channel=flow&command=" + encodeURIComponent("command=F10181&code=" + res.code + "\r\n");
        ajaxGet(command, {}, function (response) {
          console.log('loginnew')
          response.code = res.code;
          var result = {};
          result.statusCode = 0;
          if (response.data.resultcode === 0 && response.data.resultinfo.list && response.data.resultinfo.list[0].miniskey) {
            //接口返回信息保存session中
            var nowtime = Date.parse(new Date()) / 1000;
            setSession('miniskeytime', nowtime);
            setSession('miniskey', response.data.resultinfo.list[0].miniskey);
            result.miniskey = response.data.resultinfo.list[0].miniskey;
          } else {
            setSession('miniskey', '');
            result.statusCode = -1;
            // wx.showModal({
            //   showCancel: false,
            //   content: "网络繁忙，请稍后再试"
            // })
          }
          if (typeof callback == 'function') callback(result);
        });
      } else {
        res.statusCode = -1;
        if (typeof callback == 'function') callback(res);
      }
    },
    fail: function (res) {
      res.statusCode = -1;
      if (typeof callback == 'function') callback(res);
    }
  })
}

/**
 * 设置session值
 * @param  key
 * @param  value
 * @param  isAsync 是否异步保存
 */
export function setSession(key, value, isAsync) {
  if (isAsync) {
    wx.setStorage({
      key: key,
      data: value
    });
  } else {
    wx.setStorageSync(key, value);
  }
}

/**
 * 根据key获取session值
 * @param key
 * @param callback 回调函数，主要是获取异步storage
 */
export function getSession(key, callback) {
  if (typeof callback == 'function') {//异步
    wx.getStorage({
      key: key,
      success: function (res) {
        if (typeof callback == 'function') callback(res.data);
      }
    });
  } else {
    return wx.getStorageSync(key);
  }
}
//获取文件后缀名
function getFileExt(path) {
  let index = -1;
  let ext = '';
  if (path && path.length && path.indexOf('.') > 0) {
    index = path.lastIndexOf('.');
    if (index > 0) {
      ext = path.substring(index + 1);
    }
  }
  return ext;
}
//判断文件是否是图片
function isImage(path) {
  let ext = getFileExt(path);
  let formats = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
  let res = false;
  for (let p in formats) {
    if (ext == formats[p]) {
      res = true;
    }
  }
  return res;
}
/**
 * 上传图片接口
 * 返回参数：
 * statusCode： 200成功，其它失败
 * currPath: 当前成功url
 * filePaths: 所有成功url
 *
 * sourceType：选择拍照或相册
 * sizeType：选择原图或压缩
 *
 * 注：https://kf.qq.com/cgi-bin/minipic' 上传图片服务端地址
 * @param  callback
 */
export function uploadsImage(callback, sourceTypeIndex, sourceType, countIndex, chooseCallback) {
  var sourceTypeIndex = sourceTypeIndex
  var sizeTypeIndex = sizeTypeIndex
  var countIndex = countIndex
  var sourceType = [['camera'], ['album'], ['camera', 'album']]
  var sizeType = [['compressed'], ['original'], ['compressed', 'original']]
  var count = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  var fileLimit = 5 * 1024 * 1024;
  var errorFileCount = 0;
  var errorFormatCount = 0;
  wx.chooseImage({
    sourceType: sourceType[sourceTypeIndex],
    sizeType: sizeType[sizeTypeIndex],
    count: count[countIndex],
    success: function (res) {
      const miniskey = getSession('miniskey');
      const tempFilePaths = res.tempFilePaths;
      const tempFiles = res.tempFiles;
      //校验图片大小
      if (tempFiles && tempFiles.length) {
        for (let tmpImg in tempFiles) {
          //console.log('filesize', tempFiles[tmpImg], tempFiles[tmpImg].path, tempFiles[tmpImg].size);
          if (tempFiles[tmpImg].size > fileLimit) {
            //图片超过大小限制
            errorFileCount++;
          }
          if (!isImage(tempFiles[tmpImg].path)) {
            errorFormatCount++;
          }
        }
        if (errorFormatCount > 0) {
          wx.showModal({
            title: '上传提示',
            content: '图片格式错误,仅支持jpg,jpeg,png,gif格式的图片',
            showCancel: false,
            confirmColor: '#357ae0',
            confirmText: '知道了'
          });
          // wx.showToast({ title: '图片格式错误\r\n(仅支持jpg,jpeg,png,gif格式的图片)', icon: 'loading', duration: 1000 });
          return;
        }
        //如果全部图片超过限制大小，则提示错误
        if (errorFileCount > 0 && errorFileCount == tempFiles.length) {
          //提示错误
          wx.showModal({
            title: '上传提示',
            content: '图片过大,仅支持5M以内的图片',
            showCancel: false,
            confirmColor: '#357ae0',
            confirmText: '知道了'
          });
          // wx.showToast({ title: '图片过大,仅支持5M以内的图片', icon: 'loading', duration:1000});
          return;
        }
      }
      chooseCallback && chooseCallback(true, tempFilePaths);
      let apiUrl = '';
      switch (config.mode) {
        case 'dev':
          apiUrl = uploadimg_url_dev
          break;
        case 'test':
          apiUrl = uploadimg_url_test
          break;
        case 'pro':
          apiUrl = uploadimg_url
          break;
        default:
          break;
      }
      let return_num = 0, max_num = tempFilePaths.length, filePaths = [];
      for (let i in tempFilePaths) {
        wx.uploadFile({
          url: apiUrl,
          filePath: tempFilePaths[i],
          name: 'minifile',
          formData: {
            'miniskey': encodeURI(miniskey)
          },
          success: function (response) {
            // console.log(response)s
            return_num += 1;
            // response.statusCode = 501;
            let statusCode = response.statusCode;
            response.currPath = tempFilePaths[i];//当前图片路径
            if (statusCode != 200) {
              response.statusCode = 200;
              response.data = '';
              report.upload_image_fail(statusCode);
            }
            else {
              if (response.data) {
                filePaths.push(tempFilePaths[i]);//保存成功图片路径
                if (response.data.indexOf('符合格式要求') >= 0) {
                  //接口返回失败
                  response.data = '';
                }
              }
            }
            response.filePaths = filePaths;
            response.isComplete = return_num == max_num ? true : false;//是否所有图片上传完成
            if (typeof callback == 'function') callback(response);
          },
          fail: function (response) {
            return_num += 1;
            response.statusCode = -1;//接口失败状态码
            response.currPath = tempFilePaths[i];//当前图片路径
            response.filePaths = filePaths;
            response.isComplete = return_num == max_num ? true : false;//是否所有图片上传完成
            if (typeof callback == 'function') callback(response);
          }
        });
      }
    },
    fail: function () {
      chooseCallback && chooseCallback(false);
    }
  })
}
/**
 * 通过ping上报用户轨迹
 * @param speedMark     加载时长
 * @param sourceUrl     来源
 * @param params      	URL参数
 * @returns void
 */
export function reportPgv(sourceUrl, params) {
  mta.Page.init();
  //console.log("pgvParam====",params);
  let miniskey = getSession('miniskey');
  let urlParams = sourceUrl;
  if (params) {
    urlParams += '&params=' + JSON.stringify(params);
    //urlParams +='&'+encodeURIComponent(params);
  }
  let logparameters = "uin=" + encodeURI(miniskey) + "&source_url=" + encodeURIComponent(urlParams) + "&source=miniprogram&&rand=" + Math.random();
  let pingUrl = "https://kf.qq.com/touch/ping.html?" + logparameters;
  ajaxGet(pingUrl, {}, function (res) { })
}
/**
 * 小程序点击流统计
 * @param hot     		统计内容
 * @param sourceUrl   来源
 * @param mtakey      mtakey
 * @param mtakey      mtaval
 * @returns proInfo   产品相关
 */
export function xcx_tagClick(hot, sourceUrl, mtakey, mtaval, proInfo) {
  const pages = sourceUrl;
  //灯塔上报
  let beaconParam = {};
  try {
    if (mtakey && mtaval) {
      beaconParam = {
        hot: mtakey,
        page_url: pages,
        mtaval: mtaval
      }
      beacon.onDirectUserAction(encodeURIComponent(mtakey), beaconParam)
    } else {
      beaconParam = {
        hot: 'pages_expo',
        page_url: pages
      }
      beacon.onDirectUserAction(encodeURIComponent('pages_expo'), beaconParam)

    }
  } catch (error) {

  }

  let product_info = '';
  if (proInfo) {
    product_info = proInfo;
  }
  let tagsend = "tag_name=" + encodeURIComponent(hot);
  let miniskey = getSession('miniskey');
  let curPages = getCurrentPages();
  let curPageCount = curPages.length;
  if (curPageCount > 0) {
    let scene_id = '';
    let curPage = curPages[curPageCount - 1];
    let app = getApp();
    if (curPage.options && curPage.options.scene_id) {
      scene_id = curPage.options.scene_id;
    }
    let params = curPage.options || {};
    scene_id = scene_id || app.globalData.scene_id || '';
    if (sourceUrl.indexOf('?') < 0) {
      sourceUrl += '?';
    }
    if (scene_id) {
      params.scene_id = scene_id;
    }
    sourceUrl += 'params=' + JSON.stringify(params);
  }
  let urlParams = sourceUrl;
  let logparameters = "&uin=" + encodeURI(miniskey) + "&source_url=" + encodeURIComponent(urlParams) + "&product_info=" + encodeURIComponent(product_info) + "&source=qq_miniprogram&rand=" + Math.random();
  let pingUrl = "https://kf.qq.com/touch/ping.html?" + tagsend + logparameters;
  pingAjaxApi("GET", pingUrl, {}, function (res) { })
}
/**
 * 通过异步get数据
 * @param url           请求地址
 * @param params        请求参数
 * @param callback      回调函数
 * @returns void
 */
export function ajaxGetStaticJS(url, params, callback) {
  if (url.indexOf("https") !== 0) {
    let mode = config.mode;
    if (mode != 'pro' && params && params.production) {
      url = production_static_js_url + url;
    } else {
      switch (mode) {
        case 'dev':
          url = static_js_url_dev + url;
          break;
        case 'test':
          url = static_js_url_test + url;
          break;
        case 'pro':
          url = static_js_url + url;
          break;
        default:
          break;
      }
    }
  }
  ajaxApi('GET', url, params, callback);
}

/**
 * @param callback  获取工单列表信息
 * @returns void
 */
export function gettasklist(miniskey, callback, fromIndex) {
  fromIndex = fromIndex || false;
  var command = "command=F10187&miniskey=" + miniskey;
  if (fromIndex) {
    command += '&type=home';
  }
  var url = "channel=flow&command=" + encodeURIComponent(command) + "&rand=" + Math.random()
  ajaxGet(url, {}, (res) => {
    //console.log(res,'res========================')
    var ret = {};
    if (res.data.resultcode == "0" && res.data.resultinfo.list[0].result == "0") {
      var dataList = decodeURIComponent(res.data.resultinfo.list[0].content);
      if (dataList != '') {
        dataList = JSON.parse(dataList);
      }
      else {
        report.get_tasklist_fail();
        dataList = [];
      }
      var processingList = [];
      var allNum = 0;
      var processingNum = 0;
      if (typeof dataList == 'object' && dataList.length > 0) {
        //console.log("dataList", dataList)
        for (var key in dataList) {
          if (dataList[key]['createtime'] != '') {
            if (dataList[key]['createtime'].length >= 15) {
              dataList[key]['createtime'] = dataList[key]['createtime'].substr(5, 5)
            } else {
              dataList[key]['createtime'] = dataList[key]['createtime'].substr(0, 5)
            }
          }
          if (dataList[key]['penalty_result_num'] == 1) {
            processingList.push(dataList[key]);
            processingNum++;
          }
          allNum++;
        }
      }

      ret.dataList = dataList;
      ret.processingList = processingList;
      ret.allNum = allNum;
      ret.processingNum = processingNum;
    }
    if (typeof callback == 'function') callback(ret);

  })
}
/**
 * @param callback  获取工单列表信息
 * @returns void
 */
export function checktask(billid, callback, label_key) {
  getminiskey(function (miniskey) {
    if (miniskey == -1) {
    } else {
      var formid = '';
      var command = "command=F10196";
      if (typeof billid === 'string') {
        formid = billid
      } else if (typeof billid === 'object' && ('billid' in billid)) {
        formid = billid.billid
      }
      command += "&miniskey=" + miniskey + "&sessionid=&formid=" + formid;

      if (typeof billid === 'object' && ('label_key' in billid)) {
        command += '&label_key=' + billid.label_key;
      }

      var url = "channel=flow&command=" + encodeURIComponent(command) + "&rand=" + Math.random()
      //api.checkLogin()
      ajaxGet(url, {}, (res) => {
        if (typeof callback == 'function') callback(res);
      })

    }
  })
}
/**
 * @param callback  获取通用表单列表
 * @returns void
 */
export function getbilllist(callback) {
  var url = 'form/billist.js';
  var billlist = getSession("billlist");
  var billlisttime = getSession("billlisttime");
  var nowtime = Date.parse(new Date()) / 1000;
  //console.log(nowtime - minorssettime);
  if (billlist != '' && (!billlisttime || (nowtime - billlisttime) <= 5 * 60)) {//2 * 60 * 60 
    if (typeof callback == 'function') callback(billlist);
  } else {
    ajaxGetStaticJS(url, {}, function (res) {
      setSession('billlisttime', nowtime);
      setSession('billlist', res);
      if (typeof callback == 'function') callback(res);
    });
  }
}
/**
 * @param callback  跳转到举报小程序
 * @returns void
 */
export function gotojubao(path) {
  if (wx.navigateToMiniProgram) {
    //console.log("jubao start");
    if (getApp().globalData.ENVIRONMENT == "testing") {
      wx.navigateToMiniProgram({
        appId: 'wx47caa939245ce4d0',
        path: path || 'pages/index/index',
        envVersion: 'trial',
        success(res) {
          // 打开成功
          console.log("jubao ok");
        }
      })
    } else {
      wx.navigateToMiniProgram({
        appId: 'wxcf1f51ec21883acf',
        path: path || 'pages/index/index',
        success(res) {
          // 打开成功
        }
      })
    }

  } else {
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    //console.log("jubao error");
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
}

/**
 * @param callback  跳转到未成年小程序
 * @returns void
 */
export function gotoTeenager() {
  if (wx.navigateToMiniProgram) {
    //console.log("teenager start");
    if (getApp().globalData.ENVIRONMENT == "testing") {
      wx.navigateToMiniProgram({
        appId: 'wxd4ba78639c55b160',
        path: 'pages/index/index',
        envVersion: 'trial',
        success(res) {
          // 打开成功
          console.log("teenager ok");
        }
      })
    } else {
      wx.navigateToMiniProgram({
        appId: 'wx9ad6cad70a574471',
        path: 'pages/index/index',
        success(res) {
          // 打开成功
        }
      })
    }

  } else {
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    console.log("teenager error");
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
}
/**
 * @param callback  跳转到乘车码小程序
 * @returns void
 */
export function gotoChengCheMa() {
  if (wx.navigateToMiniProgram) {
    wx.navigateToMiniProgram({
      appId: 'wxbb58374cdce267a6',
      path: 'pages/order/list?channel=tx_cs_mp',
      success(res) {
        // 打开成功
        console.log("chengchema ok");
      }
    })
  } else {
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    console.log("chengchema error");
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
}
/**
 * @param callback  微信支付商户助手的小程序
 * @returns void
 */
export function gotoWCPayMerchant() {
  if (wx.navigateToMiniProgram) {
    wx.navigateToMiniProgram({
      appId: 'wx49625208931d29ec',
      path: 'pages/index/index/index',
      success(res) {
        // 打开成功
        console.log("gotoWCPayMerchant ok");
      }
    })
  } else {
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    console.log("gotoWCPayMerchant error");
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
}
/**
 * 用户历史卡券列表--小程序
 */
export function gotoCardReco() {
  if (wx.navigateToMiniProgram) {
    wx.navigateToMiniProgram({
      appId: 'wxaf1a99ed0e8c15de',
      path: 'pages/cardRecord',
      // envVersion: 'trial',
      extraData: {
        scene: 1
      },
      success(res) {
        // 打开成功
        console.log("gotoCardReco ok");
      }
    })
  } else {
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    console.log("gotoCardReco error");
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
}
/**
 * 吐个槽--小程序
 * 卡包：产品ID:45280
 * 分付：产品ID:64690
 */
export function gotoTucao(id = 45280) {
  if (wx.navigateToMiniProgram) {
    let customData = {};
    try {
      let info = wx.getSystemInfoSync();
      if (info) {
        customData.clientInfo = 'mini_portal';
        customData.clientVersion = config.version;
        customData.osVersion = info.system;
      }
    }
    catch (e) { }
    console.log('xxxxxxxx', customData);
    wx.navigateToMiniProgram({
      appId: 'wx8abaf00ee8c3202e',
      extraData: {
        id: id,
        customData: customData
      },
      success(res) {
        // 打开成功
        console.log("gotoTucao ok");
      }
    })
  } else {
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    console.log("gotoTucao error");
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
}

/**
 * @param callback  分付的小程序
 * @returns void
 */
export function gotoFenFu(page = '') {
  if (wx.navigateToMiniProgram) {
    wx.navigateToMiniProgram({
      appId: 'wx3bc1a30dc2147d64',
      path: page,
      success(res) {
        // 打开成功
        console.log("gotoFenFu ok");
      }
    })
  } else {
    // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
    console.log("gotoFenFu error");
    wx.showModal({
      title: '提示',
      showCancel: false,
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
}

export function makePhoneCall(phoneNum) {
  wx.makePhoneCall({
    phoneNumber: phoneNum,
    fail: function (res) {
      if (res.errMsg && res.errMsg.indexOf('cancel') >= 0) return;//用户取消 直接返回

      report.phone_call_fail();
      if (wx.setClipboardData) {//如果可以使用剪切板 则使用剪切板
        wx.showModal({
          title: '拨号失败',
          showCancel: false,
          confirmText: '好的',
          content: '电话号码（0755-83761852）已复制，请粘贴到拨号键盘使用。',
          success: function (res) {
            wx.setClipboardData({ data: '0755-83761852' });
          }
        });
      } else {//否则 提示调起失败 直接拨打
        wx.showModal({
          title: '拨号失败',
          content: '请拨打0755-83761852联系客服',
          success: function () {
          }
        });
      }

    },
    success: function (res) {
    }
  });
}