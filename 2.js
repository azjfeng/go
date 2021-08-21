const BeaconAction = require('@tencent/beacon-mp-sdk'); 
let beacon = new BeaconAction({
  appkey: "0MA00F40QG41GJ1N", //小程序appKey，从DataHub官网获取,必填
  versionCode: '', //小程序版本号，选填
  channelID: '', //小程序渠道号，选填
  openid: '', // 用户标示符号，选填
  unionid: '', // 用户唯一标示符号，选填
  delay: 2000, // 普通事件延迟上报时间(单位毫秒), 默认2000(2秒),选填
  onReportSuccess: function(res){ // 上报成功回调，选填
    console.log('res',res)
  }, 
  onReportFail: function(err){  // 上报失败回调，选填
    console.log('err',err)
  },
});



function onDirectUserAction(eventCode,value){
 //上报参数
 let config = {
  hot: "",
  page_url: "",
  event1: "",
  event2: "",
  event3: "",
  value1: "",
  value2: "",
  value3: "",
};
const mtaval = value.mtaval;
const dataArray = mtaval && Object.keys(mtaval)
//当mtaval不是undefind 并且不是空对象时遍历mtaval
if(mtaval && dataArray.length > 0){
  dataArray.forEach((element,key) => {
    value['event'+(key+1)] = element
    value['value'+(key+1)] = mtaval[element]
  });
  delete value.mtaval
}else if(mtaval && dataArray.length === 0){
  //当mtaval为空对象时删除mtaval
  delete value.mtaval
}
config = Object.assign(config,value)
try {
  beacon.onDirectUserAction(eventCode,config)
} catch (error) {
  
}
}


function onUserAction(eventCode,value){
  beacon.onUserAction(eventCode,value)
}

export default {onDirectUserAction,onUserAction};