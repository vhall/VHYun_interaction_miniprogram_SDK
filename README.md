## 微吼云小程序互动 SDK

### 目录结构

- index 为入口文件夹

- push 为互动页面

- minisdk 为 SDK 文件

- 其余为微信小程序必要文件

### 扫码体验

- ![](https://static.vhallyun.com/doc-images/5d82395f01086_5d82395f.jpg)

### 使用方法

**其它客户端与小程序互动编码必须采用 H264 的编码格式否则小程序 live-player 播放会显示黑屏**

1.初始化 sdk 创建实例并在成功函数中添加监听事件

```javascript
import VhallBase from '../../minisdk/vhall-mpsdk-base-1.0.0'
import Interaction from '../../minisdk/vhall-mpsdk-interaction-1.2.0'
/**
 * 推荐写法
 */
this.vhallBase = new VhallBase()
this.vhallChat = new VhallChat()
this.interaction = new Interaction()
await this.vhallBase.createInstance({appId,accoutId,token})
try {
  this.interaction.createInstance({
    roomId: options.roomId,
    inavId: options.inavId,
    appId: options.appId,
    accountId: options.accountId,
    token: options.token,
    livePusherId: 'pusher',
    vhallBase: this.vhallBase,
    THIS:this // 小程序this，仅用于选取在自定义组件中的live-pusher、live-player，不在自定义组件中可以不传
  })
    .then(res => {
    console.log(res)
    this.vhallrtc = res.vhallrtc // 监听与触发事件实例
    this.livePusher = res.livePusher // live-pusher实例
    this.livePlayer = res.livePlayer // live-player实例
    // todo 添加监听事件
  })
    .catch(e => {
    wx.showToast({
      title: `连接失败，code: ${e.code}, message: ${e.msg}`,
      icon: 'none'
    })
    // this.destroy()
    wx.navigateBack({})
    console.log(e)
  })
} catch (error) {
  console.log(error)
}
/**
 * 旧写法
 */
this.interaction = new Interaction()
this.interaction.createInstance(
  {
    inavId: options.inavId,
    appId: options.appId,
    accountId: options.accountId,
    token: options.token,
    livePusherId: 'pusher'
    THIS:this // 小程序this，仅用于选取在自定义组件中的live-pusher、live-player，不在自定义组件中可以不传
  },
  res => {
    this.vhallrtc = res.vhallrtc // 监听与触发事件实例
    this.livePusher = res.livePusher // live-pusher实例
    this.livePlayer = res.livePlayer // live-player实例
    // todo 添加监听事件
  },
  e => {
    wx.showToast({
      title: `连接失败，code: ${e.code}, message: ${e.message}`,
      icon: 'none',
      duration: 5000
    })
  }
)
```

2.销毁实例

```javascript
/**
 * 退出房间必须销毁实例，释放资源
 */
this.interaction.destroy() // 断开所有连接，并重置页面内所有关联变量为null
this.vhallrtc = null // sdk 返回的监听与触发事件的句柄
this.livePusher = null // live-pusher方法对象
this.livePlayer = null // live-player 方法对象
this.interaction = null // sdk实例句柄
```

#### 监听事件列表

##### 房间链接出错事件

```javascript
/**
 * 信令socket onError(小程序socket error事件)
 * res:{errMsg:错误信息,code}
 */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_ERROR, res => {})
```

##### 房间正在重连事件

```javascript
/**
 * 信令socket正在重连事件
 */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_RECONNECTING, () => {})
```

##### 房间重连失败事件

```javascript
/**
 * 信令socket重连失败事件
 */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_RECONNECTFAIL, () => {})
```

##### 房间重连成功事件

```javascript
/**
 * 信令socket 重连成功事件
 */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_RECONNECTED, () => {})
```

##### 房间关闭事件

```javascript
/**
 * 小程序SocketTask onClose事件和参数
 * 数据格式：{ code:socket通用状态码，1000表示正常关闭，reason：链接被关闭的原因 }
 * 已知异常状态码及含义：
 * res.code == 1000 && res.reason == "normal closure" - 小程序主动关闭
 * res.code == 1000 && res.reason == "interrupted" - 小程序切换到后台，被微信杀掉，需要重连连接
 * res.code == 1001 && res.reason == "Stream end encountered" - 服务端拒绝连接
 * res.code == 1006 && res.reason == "abnormal closure" - 服务关闭（部分安卓返回1005）
 * 当监听到上述4种状态码时，sdk不会触发自动重联
 * */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_CLOSE, res => {})
```

##### 主动重联 socket 函数

```javascript
/**
 * 当前网络从wifi切换到4g的时候，socket会关闭并触发 code：1006，此时需要手动重联，4g切换wifi不会关闭
 * */
this.vhallBase.initiativeReconnect()
this.vhallrtc.initiativeReconnect()
```

##### 监听添加用户进黑名单事件

```javascript
/**
 * userId:初始化时传入的accountId
 */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_BLACKLIST, ({ userId }) => {})
```

##### 收到申请上麦事件

```javascript
/**
 * userId:初始化时传入的accountId
 */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_APPLY, ({ userId }) => {})
```

##### 收到审核上麦事件

```javascript
/**
 * 审核上麦事件
 * res:{userId,status} userId:初始化时传入的accountId，status: 1 上麦 2 下麦 3拒绝上麦
 */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_AUTH, res => {})
```

##### 收到被邀请上麦事件

```javascript
/**
 * userId:初始化时传入的accountId
 */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_INVITED, ({ userId }) => {})
```

##### 收到邀请上麦回复事件

```javascript
/**
 * userId：回复人的accountId status: 1 上麦 2 下麦 3拒绝上麦
 */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_CALLBACK, ({ userId, status }) => {})
```

##### 收到用户加入房间事件

```javascript
/**
 * userId:加入房间的accountId
 */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_JOIN, ({ userId }) => {})
```

##### 收到用户离开房间事件

```javascript
/**
 * userId:离开房间的accountId
 */
this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_LEAVE, ({ userId }) => {})
```

##### 推流成功后触发

```javascript
this.vhallrtc.on(this.vhallrtc.EVENT_PUSHERSUCC, () => {)
```

##### 推流异常事件

```javascript
/**
 * res： live-pusher Statechange 函数中 detail 信息
 */
this.vhallrtc.on(this.vhallrtc.EVENT_PUSHERERROR, res => {})
```

##### 拉流成功事件

```javascript
/**
 * { streamId:流id, playerId:live-player id }
 */
this.vhallrtc.on(this.vhallrtc.EVENT_PLAYERSUCC, ({ streamId, playerId }) => {})
```

##### 拉流异常事件

```javascript
/**
 * { streamId:流id, playerId:live-player id }
 */
this.vhallrtc.on(this.vhallrtc.EVENT_PLAYERREEOR, ({ streamId, playerId }) => {})
```

##### 远端流添加事件

```javascript
/**
 * event:{
      streamId: "", // 远端流ID
      streamType: 3, // 流类型 0：纯音频， 1：单视频， 2：音视频， 3：桌面采集
      attributes: "", // 用户自定义参数，创建流时传入
    }
*/
this.vhallrtc.on(this.vhallrtc.EVENT_REMOTESTREAM_ADD, event => {})
```

##### 远端流删除事件

```javascript
/**
 * event:{
      streamId: "", // 远端流ID
      streamType: 3, // 流类型 0：纯音频， 1：单视频， 2：音视频， 3：桌面采集
      attributes: "", // 用户自定义参数，创建流时传入
    }
*/
this.vhallrtc.on(this.vhallrtc.EVENT_REMOTESTREAM_REMOVED, event => {})
```

#### 主动触发事件列表

##### 推送本地流

```javascript
/**
 * 成功函数 { streamId, url } 分别为流id和推流地址
 * 返回promise
 * 推荐写法：
 */
this.vhallrtc.publish().then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.publish(
  {},
  ({ streamId, url }) => {},
  e => {}
)
```

##### 停止推送本地流

```javascript
/**
 * 成功函数 { streamId, url } 分别为流id和推流地址
 * 返回promise
 * 推荐写法：
 */
this.vhallrtc.unpublish().then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.unpublish(
  {},
  () => {},
  e => {
    console.log(e)
  }
)
```

##### 订阅远端流

```javascript
/**
 * 参数为对象，参数为添加远端流监听事件中返回的streamId
 * 成功函数 { streamId, url } 分别为流id和推流地址
 * 返回promise
 * 推荐写法：
 */
this.vhallrtc.subscribe({ streamId }).then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.subscribe(
  { streamId },
  ({ streamId, url }) => {},
  fail => {}
)
```

##### 取消订阅远端流

```javascript
/**
 * 参数为对象，参数为需要取消的 streamId
 * 返回promise
 * 推荐写法：
 */
this.vhallrtc.unsubscribe({streamId}).then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.unsubscribe({streamId}, success = () => {}, failure = () => {}) {}
```

##### 开启旁路直播推流

```javascript
/**
 * profile：清晰度,参考清晰度常量
 * layoutMode：旁路布局 - 参考旁路布局常量
 * roomId ： 房间id
 * 推荐写法：
 */
this.vhallrtc.startBroadCast({ profile, roomId, layoutMode }).then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.startBroadCast(
  { profile, roomId, layoutMode },
  () => {
    // 成功函数
  },
  e => {
    // 失败函数
)
```

##### 停止旁路直播推流

```javascript
/**
 * roomId ： 房间id
 * 推荐写法：
 */
this.vhallrtc.stopBroadCast({ roomId: this.options.roomId }).then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.stopBroadCast(
  { roomId: this.options.roomId },
  () => {
    // 成功函数
  },
  e => {
    // 失败函数
  }
)
```

##### 动态配置旁路布局

```javascript
/**
 * layout:要切换的旁路布局参数
 * 推荐写法：
 */
this.vhallrtc.setBroadCastLayout({ layout }).then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.setBroadCastLayout(
  { layout },
  () => {
    // 成功函数
  },
  () => {
    // 失败函数
  }
)
```

##### 动态配置旁路主屏

```javascript
/**
 * 要配置为主屏的流id
 * 推荐写法：
 */
this.vhallrtc.setBroadCastScreen({ mainScreenStreamId }).then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.setBroadCastScreen({ mainScreenStreamId }, (success = () => {}), (failure = () => {}))
```

##### 申请上麦

```javascript
/**
 * 第一个参数为保留字段
 * 推荐写法：
 */
this.vhallrtc.apply().then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.apply({}, (success = () => {}), (failure = () => {}))
```

##### 同意申请上麦

```javascript
/**
 * userId:要上麦的用户id
 * 推荐写法：
 */
this.vhallrtc.consentApply({ userId }).then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.consentApply({ userId }, (success = () => {}), (failure = () => {}))
```

##### 拒绝申请上麦

```javascript
/**
 * userId:要拒绝上麦的用户id
 * 推荐写法：
 */
this.vhallrtc.rejectApply({ userId }).then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.rejectApply({ userId }, (success = () => {}), (failure = () => {}))
```

##### 邀请上麦

```javascript
/**
 * userId:要邀请上麦的用户id
 * 推荐写法：
 */
this.vhallrtc.invite({ userId }).then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.invite({ userId }, (success = () => {}), (failure = () => {}))
```

##### 同意被邀请上麦

```javascript
/**
 * 推荐写法：
 */
this.vhallrtc.consentInvite().then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.consentInvite({}, (success = () => {}), (failure = () => {}))
```

##### 拒绝被邀请上麦

```javascript
/**
 * 推荐写法：
 */
this.vhallrtc.rejectInvite().then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.rejectInvite({}, (success = () => {}), (failure = () => {}))
```

##### 获取互动黑名单列表

```javascript
/**
 * 推荐写法：
 */
this.vhallrtc.getBlackList().then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.getBlackList({}, (success = () => {}), (failure = () => {}))
```

##### 将用户添加到黑名单

```javascript
/**
 * userId:要添加到黑名单的用户id
 */
this.vhallrtc.addBlackList({ userId }).then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.addBlackList({ userId }, (success = () => {}), (failure = () => {}))
```

##### 将用户从黑名单移除

```javascript
/**
 * userId:要移除黑名单的用户id
 */
this.vhallrtc.removeBlackList({ userId }).then().catch()
/**
 * 旧写法（不推荐）：
 */
this.vhallrtc.removeBlackList({ userId }, (success = () => {}), (failure = () => {}))
```

##### 获取房间信息

```javascript
/**
 * @returns {
  local: {
    users: [
      {
        accountId,
        streams: [{ streamId, type, state }]  // 流Id，流类型，状态
      } // state 0 未订阅 1 已订阅
    ]
  },
  remote: {
    users: [
      {
        accountId,
        streams: [{ streamId, type, state }, { streamId, type, state }...]
      } // state 0 未订阅 1 已订阅
    ]
  }
 }
*/
 */
const info = this.vhallrtc.getRoomInfo()

```

### 封装的 live-pusher、live-player 方法列表

#### LivePusherContext 方法列表，名称、参数遵循[小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/api/media/live/LivePusherContext.html)

```javascript
/**
 * 开始推流，同时开启摄像头预览
 * @param {Object} params - 选填
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{}, 成功/失败都会执行
 * }
 */
this.livePusher.start(params)

/**
 * 停止推流，同时停止摄像头预览
 * @param {Object} params - 选填
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{}, 成功/失败都会执行
 * }
 */
this.livePusher.stop(params)

/**
 * 切换前后摄像头
 * @param {Object} params - 选填
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{}, 成功/失败都会执行
 * }
 */
this.livePusher.switchCamera(params)

/**
 * 快照
 * @param {String} params- 必填
 * eg：
 * {
 * success:res=>{res.tempImagePath -- 图片路径},
 * fail:()=>{},
 * complete:()=>{}, 成功/失败都会执行
 * }
 */
this.livePusher.snapshot(params)

/**
 * 切换手电筒
 * @param {Object} params - 选填
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{},
 * }
 */
this.livePusher.toggleTorch(params)

/**
 * 播放背景音
 * @param {Object} params- 必填
 * eg：
 * {
 * url:string - 音频资源地址
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{},
 * }
 */
this.livePusher.playBGM(params)

/**
 * 暂停背景音
 * @param {Object} params- 选填
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{},
 * }
 */
this.livePusher.pauseBGM(params)

/**
 * 恢复背景音
 * @param {Object} params- 选填
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{},
 * }
 */
this.livePusher.resumeBGM(params)

/**
 * 停止背景音
 * @param {Object} params- 选填
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{},
 * }
 */
this.livePusher.stopBGM(params)

/**
 * 设置背景音音量
 * @param {Object} params
 * eg：
 * {
 * volume : string 音量，范围（0-1）
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{},
 * }
 */
this.livePusher.setBGMVolume(params)

/**
 * 设置麦克风音量
 * @param {Object} params
 * eg：
 * {
 * volume : number 音量，范围（0.0-1.0）
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{},
 * }
 */
this.livePusher.setMICVolume(params)

/**
 * 开启摄像头预览
 * @param {Object} params- 选填
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{},
 * }
 */
this.livePusher.startPreview(params)

/**
 * 关闭摄像头预览
 * @param {Object} params- 选填
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{},
 * }
 */
this.livePusher.stopPreview(params)
```

#### live-pusher 组件监听方法列表，名称、参数遵循[小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/component/live-pusher.html)

```javascript
  /**
   * 状态变化事件
   * @param {Object} params- detail = {code} 同微信文档
   */
  this.livePusher.statechange(e)

  /**
   * 网络状态通知
   * @param {Object} params- detail = {info} 同微信文档
   */
  this.livePusher.netstatuschange(e)

  /**
   * 渲染错误事件
   * @param {Object} params- detail = {errMsg, errCode} 同微信文档
   */
  this.livePusher.pusherror(e)

  /**
   * 背景音开始播放时触发
   * @param {Object} params- 同微信文档
   */
  this.livePusher.bgmstart(e)

  /**
   * 背景音进度变化时触发，
   * @param {Object} params- detail = {progress, duration} 同微信文档
   */
  this.livePusher.bgmprogress(e)

  /**
   * 背景音播放完成时触发
   * @param {Object} params- 同微信文档
   */
  this.livePusher.bgmcomplete(e) {}
```

#### live-player 封装方法列表：名称、param 参数遵循[小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/component/live-player.html)

```javascript
/**
 * 播放
 * { streamId：流id, playerId：live-player id }
 * param ： live-player play方法参数
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{}, 成功/失败都会执行
 * }
 */
this.livePlayer.play({ streamId, playerId }, param)
/**
 * 停止
 * { streamId：流id, playerId：live-player id }
 * param ： live-player stop方法参数
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{}, 成功/失败都会执行
 * }
 */
this.livePlayer.stop({ streamId, playerId }, param)
/**
 * 全屏
 * { streamId：流id, playerId：live-player id }
 * param ： live-player requestFullScreen方法参数
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{}, 成功/失败都会执行
 * }
 */
this.livePlayer.requestFullScreen({ streamId, playerId }, param)
/**
 * 退出全屏
 * { streamId：流id, playerId：live-player id }
 * param ： live-player exitFullScreen 方法参数
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{}, 成功/失败都会执行
 * }
 */
this.livePlayer.exitFullScreen({ streamId, playerId }, param)
/**
 * 进入、退出静音
 * { streamId：流id, playerId：live-player id }
 * param ： live-player mute 方法参数
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{}, 成功/失败都会执行
 * }
 */
this.livePlayer.mute({ streamId, playerId }, param)
/**
 * 截图
 * { streamId：流id, playerId：live-player id }
 * param ： live-player snapshot 方法参数
 * eg：
 * {
 * success:()=>{},
 * fail:()=>{},
 * complete:()=>{}, 成功/失败都会执行
 * }
 */
this.livePlayer.snapshot({ streamId, playerId }, param)
/**
 * bindstatechange 回调传入函数
 * 需要在live-player上用data-streamId绑定流id
 */
this.livePlayer.onStateChange(param)
/**
 * bindnetstatus 回调传入函数
 * 需要在live-player上用data-streamId绑定流id
 */
this.livePlayer.onNetstatus(param)
```

### 互动事件参考表（监听实例事件）

| 名称                       | 含义                 | 备注                                                                                  |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------------- |
| EVENT_ROOM_ERROR           | 房间链接出错         | 小程序 socket onError 触发                                                            |
| EVENT_ROOM_RECONNECTING    | 房间正在重连事件     | 小程序 socket 异常断线后触发                                                          |
| EVENT_ROOM_RECONNECTFAIL   | 房间重连失败事件     | 小程序 socket 重连失败                                                                |
| EVENT_ROOM_RECONNECTED     | 房间重连成功事件     | 小程序 socket 重连成功                                                                |
| EVENT_ROOM_CLOSE           | 房间关闭事件         | 小程序 socket onClose 触发                                                            |
| EVENT_ROOM_AUTH            | 审核上麦事件         | 观众端申请上麦，主持端主持端审核后触发                                                |
| EVENT_ROOM_BLACKLIST       | 添加用户进黑名单事件 | 主持端给观众加入黑名单时触发                                                          |
| EVENT_ROOM_INVITED         | 被邀请上麦事件       | 收到上麦邀请时触发                                                                    |
| EVENT_ROOM_APPLY           | 申请上麦事件         | 观众端申请上麦后触发                                                                  |
| EVENT_ROOM_CALLBACK        | 邀请上麦回复事件     | 主持端邀请上麦，观众端接受或拒绝后触发                                                |
| EVENT_ROOM_JOIN            | 用户加入房间事件     | 用户初始化后触发                                                                      |
| EVENT_ROOM_LEAVE           | 用户离开房间事件     | 用户离开时触发                                                                        |
| EVENT_PUSHERSUCC           | 推流成功后触发       | live-pusher 组件状态码为 1002 触发                                                    |
| EVENT_PUSHERERROR          | 推流异常事件         | live-pusher 组件状态码为-1307、3001、3002、3003、3004、3005 时触发                    |
| EVENT_PLAYERSUCC           | 拉流成功事件         | live-player 组件状态码为 2004 时触发                                                  |
| EVENT_PLAYERREEOR          | 拉流异常事件         | live-player 组件状态码为-2301、-2302、2101、2102、3001、3002、3003、3004、3005 时触发 |
| EVENT_REMOTESTREAM_ADD     | 远端流添加事件       | 当房间内有新推流时触发                                                                |
| EVENT_REMOTESTREAM_REMOVED | 远端流删除事件       | 当房间内有取消推流时触发                                                              |

## 互动旁路直播流分辨率参考表

| 可选值                          | 宽高比 | 分辨率（宽 x 高） | 码率 (kb |
| :------------------------------ | :----- | :---------------- | :------- |
| BROADCAST_VIDEO_PROFILE_480P_0  | 4:3    | 640x480           | 600      |
| BROADCAST_VIDEO_PROFILE_480P_1  | 16:9   | 852x480           | 725      |
| BROADCAST_VIDEO_PROFILE_720P_0  | 4:3    | 960x720           | 1050     |
| BROADCAST_VIDEO_PROFILE_720P_1  | 16:9   | 1280X720          | 1100     |
| BROADCAST_VIDEO_PROFILE_960P_0  | 4:3    | 1280x960          | 1300     |
| BROADCAST_VIDEO_PROFILE_1080P_0 | 4:3    | 1440X1080         | 1350     |
| BROADCAST_VIDEO_PROFILE_1080P_1 | 16:9   | 1920X1080         | 1600     |

- 此参数为旁路直播使用，注意与互动区分

## 互动旁路布局参考表（layout 参数）

#### 均匀布局表格

| 可选值                         | 说明       | 图示(4:3 画布)                                                                                                                                     | 图示(16:9 画布                                                                                                                                     |
| :----------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| CANVAS_LAYOUT_PATTERN_GRID_1   | 一人铺满   | ![img](https://static.vhallyun.com/doc-images/5d410d006596e_5d410d00.jpg)                                                                          | ![img](https://static.vhallyun.com/doc-images/5d410d375eb58_5d410d37.jpg)                                                                          |
| CANVAS_LAYOUT_PATTERN_GRID_2_H | 左右两格   | ![img](https://static.vhallyun.com/doc-images/5d410d751da8b_5d410d75.jpg)![img](https://static.vhallyun.com/doc-images/5d410d85be923_5d410d85.jpg) | ![img](https://static.vhallyun.com/doc-images/5d410d989cf26_5d410d98.jpg)![img](https://static.vhallyun.com/doc-images/5d410da4e3839_5d410da4.jpg) |
| CANVAS_LAYOUT_PATTERN_GRID_3_E | 正品字     | ![img](https://static.vhallyun.com/doc-images/5d410de8674db_5d410de8.jpg)                                                                          | ![img](https://static.vhallyun.com/doc-images/5d410df2bdb76_5d410df2.jpg)                                                                          |
| CANVAS_LAYOUT_PATTERN_GRID_3_D | 倒品字     | ![img](https://static.vhallyun.com/doc-images/5d410e0ad44cf_5d410e0a.jpg)                                                                          | ![img](https://static.vhallyun.com/doc-images/5d410e16168a1_5d410e16.jpg)                                                                          |
| CANVAS_LAYOUT_PATTERN_GRID_4_M | 2 行 x2 列 | ![img](https://static.vhallyun.com/doc-images/5d410e2138d8a_5d410e21.jpg)                                                                          | ![img](https://static.vhallyun.com/doc-images/5d410e2e30450_5d410e2e.jpg)                                                                          |
| CANVAS_LAYOUT_PATTERN_GRID_9_E | 3 行 x3 列 | ![img](https://static.vhallyun.com/doc-images/5d410e537f23a_5d410e53.jpg)                                                                          | ![img](https://static.vhallyun.com/doc-images/5d410e5e01a64_5d410e5e.jpg)                                                                          |

#### 主次屏浮窗布局

| 可选值                            | 说明                          | 图示(4:3 画布)                                                            | 图示(16:9 画布)                                                           |
| :-------------------------------- | :---------------------------- | :------------------------------------------------------------------------ | :------------------------------------------------------------------------ |
| CANVAS_LAYOUT_PATTERN_FLOAT_2_1DR | 大屏铺满，小屏悬浮右下角      | ![img](https://static.vhallyun.com/doc-images/5d41102a7f56d_5d41102a.jpg) | ![img](https://static.vhallyun.com/doc-images/5d41104052453_5d411040.jpg) |
| CANVAS_LAYOUT_PATTERN_FLOAT_2_1DL | 大屏铺满，小屏悬浮左下角      | ![img](https://static.vhallyun.com/doc-images/5d4110511d781_5d411051.jpg) | ![img](https://static.vhallyun.com/doc-images/5d41105cb3cfb_5d41105c.jpg) |
| CANVAS_LAYOUT_PATTERN_FLOAT_3_2DL | 大屏铺满，2 小屏悬浮左下角    | ![img](https://static.vhallyun.com/doc-images/5d41106a6f950_5d41106a.jpg) | ![img](https://static.vhallyun.com/doc-images/5d41107693be2_5d411076.jpg) |
| CANVAS_LAYOUT_PATTERN_FLOAT_6_5D  | 大屏铺满，一行 5 个悬浮于下面 | ![img](https://static.vhallyun.com/doc-images/5d41108333929_5d411083.jpg) | ![img](https://static.vhallyun.com/doc-images/5d41108ab177c_5d41108a.jpg) |
| CANVAS_LAYOUT_PATTERN_FLOAT_6_5T  | 大屏铺满，一行 5 个悬浮于上面 | ![img](https://static.vhallyun.com/doc-images/5d411095deac3_5d411095.jpg) | ![img](https://static.vhallyun.com/doc-images/5d41109d89630_5d41109d.jpg) |

#### 主次屏平铺布局

| 可选值                                     | 说明                                                 | 图示(4:3 画布)                                                            | 图示(16:9 画布)                                                           |
| :----------------------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------ | :------------------------------------------------------------------------ |
| CANVAS_LAYOUT_PATTERN_TILED_5_1T4D         | 主次平铺，一行 4 个位于底部                          | ![img](https://static.vhallyun.com/doc-images/5d4112578d867_5d411257.jpg) | ![img](https://static.vhallyun.com/doc-images/5d411b34ad216_5d411b34.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_5_1D4T         | 主次平铺，一行 4 个位于顶部                          | ![img](https://static.vhallyun.com/doc-images/5d4112c88dcf5_5d4112c8.jpg) | ![img](https://static.vhallyun.com/doc-images/5d411aa22c39c_5d411aa2.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_5_1L4R         | 主次平铺，一列 4 个位于右边                          | ![img](https://static.vhallyun.com/doc-images/5d4112f28b0f7_5d4112f2.jpg) | ![img](https://static.vhallyun.com/doc-images/5d411ab148765_5d411ab1.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_5_1R4L         | 主次平铺，一列 4 个位于左边                          | ![img](https://static.vhallyun.com/doc-images/5d4112fd4c947_5d4112fd.jpg) | ![img](https://static.vhallyun.com/doc-images/5d411a85301a0_5d411a85.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_6_1T5D         | 主次平铺，一行 5 个位于底部                          | ![img](https://static.vhallyun.com/doc-images/5d41130dd70ed_5d41130d.jpg) | ![img](https://static.vhallyun.com/doc-images/5d411a596095f_5d411a59.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_6_1D5T         | 主次平铺，一行 5 个位于顶部                          | ![img](https://static.vhallyun.com/doc-images/5d41131995796_5d411319.jpg) | ![img](https://static.vhallyun.com/doc-images/5d411a437e9ff_5d411a43.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_9_1L8R         | 主次平铺，右边为（2 列 x4 行=8 个块）                | ![img](https://static.vhallyun.com/doc-images/5d411328e3604_5d411328.jpg) | ![img](https://static.vhallyun.com/doc-images/5d411a2462124_5d411a24.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_9_1R8L         | 主次平铺，左边为（2 列 x4 行=8 个块）                | ![img](https://static.vhallyun.com/doc-images/5d411350b502b_5d411350.jpg) | ![img](https://static.vhallyun.com/doc-images/5d4119d882cf8_5d4119d8.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_9_1D8T         | 平铺，主屏在下，8 个（2 行 x4 列）在上               | ![img](https://static.vhallyun.com/doc-images/5d4119830fc1c_5d411983.jpg) | ![img](https://static.vhallyun.com/doc-images/5d4119a054b0f_5d4119a0.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_13_1L12R       | 主次平铺，右边为（3 列 x4 行=12 个块）               | ![img](https://static.vhallyun.com/doc-images/5d41171646ef1_5d411716.jpg) | ![img](https://static.vhallyun.com/doc-images/5d4117299f9b9_5d411729.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_13_1TL12GRID   | 主次平铺，主屏在左上角，其余 12 个均铺于其他剩余区域 | ![img](https://static.vhallyun.com/doc-images/5d411777a88b9_5d411777.jpg) | ![img](https://static.vhallyun.com/doc-images/5d41178910ac8_5d411789.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_17_1TL16GRID   | 主次平铺，1V16，主屏在左上角                         | ![img](https://static.vhallyun.com/doc-images/5d4119211716d_5d411921.jpg) | ![img](https://static.vhallyun.com/doc-images/5d41193a069e2_5d41193a.jpg) |
| CANVAS_LAYOUT_PATTERN_TILED_17_1TL16GRID_E | 主次平铺，主屏在左上角，其余 16 个均铺于其他剩余区域 | ![img](https://static.vhallyun.com/doc-images/5d4118d784d41_5d4118d7.jpg) | ![img](https://static.vhallyun.com/doc-images/5d4118ebadd0f_5d4118eb.jpg) |

- 便于理解，如 CANVAS_LAYOUT_PATTERN_TILED_5_1R4L，其中“5”表示共 5 块，H 表示 horizontal，E 表示 erected, M 表示 matts， T/D 表示 top/down，L/R 表示 left/right
- 当房间内只有一路视频时，无论设置哪一种预置定义模板，混流结果均是该路视频等比铺满画布

### 注意事项

- 小程序受制于手机性能，房间内建议最多订阅 4 路互动流，并且分辨率在 480P 以下。
