// import VhallBase from '../../mpSdkBaseCopy/main'
// import Interaction from '../../sdk/main'
// import VhallChat from '../../sdkChat/sdk/main'
import VhallBase from '../../minisdk/vhall-mpsdk-base-1.0.0'
import VhallChat from '../../minisdk/vhall-mpsdk-chat-1.1.0'
import Interaction from '../../minisdk/vhall-mpsdk-interaction-1.2.0'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    StopDisabled: true,
    StartDisabled: true,
    showUserList: true,
    playerList: [],
    userList: [],
    blackList: [],
    accountId: null,
    enableCamera: true,
    enableMic: true,
    newslist: [],
    content: '',
    layoutList: [
      { name: '一人铺满', value: 'CANVAS_LAYOUT_PATTERN_GRID_1' },
      { name: '左右两格', value: 'CANVAS_LAYOUT_PATTERN_GRID_2_H' },
      { name: '正品字', value: 'CANVAS_LAYOUT_PATTERN_GRID_3_E' },
      { name: '倒品字', value: 'CANVAS_LAYOUT_PATTERN_GRID_3_D' },
      { name: '2行x2列', value: 'CANVAS_LAYOUT_PATTERN_GRID_4_M' },
      { name: '3行x3列', value: 'CANVAS_LAYOUT_PATTERN_GRID_9_E' },
      { name: '大屏铺满，小屏悬浮右下角', value: 'CANVAS_LAYOUT_PATTERN_FLOAT_2_1DR' },
      { name: '大屏铺满，小屏悬浮左下角', value: 'CANVAS_LAYOUT_PATTERN_FLOAT_2_1DL' },
      { name: '大屏铺满，2小屏悬浮左下角', value: 'CANVAS_LAYOUT_PATTERN_FLOAT_3_2DL' },
      { name: '大屏铺满，一行5个悬浮于下面', value: 'CANVAS_LAYOUT_PATTERN_FLOAT_6_5D' },
      { name: '大屏铺满，一行5个悬浮于上面', value: 'CANVAS_LAYOUT_PATTERN_FLOAT_6_5T' },
      { name: '主次平铺，一行4个位于底部', value: 'CANVAS_LAYOUT_PATTERN_TILED_5_1T4D' },
      { name: '主次平铺，一行4个位于顶部', value: 'CANVAS_LAYOUT_PATTERN_TILED_5_1D4T' },
      { name: '主次平铺，一列4个位于右边', value: 'CANVAS_LAYOUT_PATTERN_TILED_5_1L4R' },
      { name: '主次平铺，一列4个位于左边', value: 'CANVAS_LAYOUT_PATTERN_TILED_5_1R4L' },
      { name: '主次平铺，一行5个位于底部', value: 'CANVAS_LAYOUT_PATTERN_TILED_6_1T5D' },
      { name: '主次平铺，一行5个位于顶部', value: 'CANVAS_LAYOUT_PATTERN_TILED_6_1D5T' },
      { name: '主次平铺，右边为(2列x4行=8个块)', value: 'CANVAS_LAYOUT_PATTERN_TILED_9_1L8R' },
      { name: '主次平铺，左边为（2列x4行=8个块）', value: 'CANVAS_LAYOUT_PATTERN_TILED_9_1R8L' },
      { name: '主次平铺，左边为（2列x4行=8个块）', value: 'CANVAS_LAYOUT_PATTERN_TILED_9_1R8L' },
      { name: '平铺，主屏在下，8个（2行x4列）在上', value: 'CANVAS_LAYOUT_PATTERN_TILED_9_1D8T' },
      { name: '主次平铺，右边为(3列x4行=12个块)', value: 'CANVAS_LAYOUT_PATTERN_TILED_13_1L12R' },
      { name: '主次平铺，主屏在左上角，其余12个均铺于其他剩余区域', value: 'CANVAS_LAYOUT_PATTERN_TILED_13_1TL12GRID' },
      { name: '主次平铺，1V16，主屏在左上角', value: 'CANVAS_LAYOUT_PATTERN_TILED_17_1TL16GRID' },
      {
        name: '主次平铺，主屏在左上角，其余16个均铺于其他剩余区域',
        value: 'CANVAS_LAYOUT_PATTERN_TILED_17_1TL16GRID_E'
      }
    ]
  },
  invitedId: null, // 被邀请上麦用的accountId
  options: null, // index 页面传来的参数
  interaction: null, // sdk实例句柄
  vhallrtc: null, // sdk 返回的监听与触发事件的句柄
  vhallBase: null,
  livePusher: null,
  livePlayer: null,
  networkType: null,
  /**
   * 生命周期函数-监听页面加载
   */
  async onLoad(options) {
    let users = new Set()
    this.options = options
    this.setData({ accountId: options.accountId })
    this.getNetworkType()
    this.onNetworkStatusChange()
    this.vhallBase = new VhallBase()
    this.vhallChat = new VhallChat()
    this.interaction = new Interaction()
    await this.vhallBase.createInstance(options)
    try {
      const { message } = await this.vhallChat.createInstance({ ...options, vhallBase: this.vhallBase })
      this.chat = message
      this.addChatListener(users)
      this.initInteraction({ ...options, vhallBase: this.vhallBase })
    } catch (error) {
      console.log(error)
    }

    // 保持屏幕常亮
    wx.setKeepScreenOn({ keepScreenOn: true })
  },

  /**
   * 初始化互动sdk
   */
  initInteraction(options) {
    this.interaction
      .createInstance({
        roomId: options.roomId,
        inavId: options.inavId,
        appId: options.appId,
        accountId: options.accountId,
        token: options.token,
        livePusherId: 'pusher',
        vhallBase: options.vhallBase
      })
      .then(res => {
        console.log(res)
        this.vhallrtc = res.vhallrtc // 监听与触发事件实例
        this.livePusher = res.livePusher // live-pusher实例
        this.livePlayer = res.livePlayer // live-player实例
        this.setData({ userList: this.getRoomInfo() })
        this.getBlackList()
        this.addEventListener()
        this.setData({ StartDisabled: false })
      })
      .catch(e => {
        wx.showToast({
          title: `连接失败，code: ${e.code}, message: ${e.msg}`,
          icon: 'none'
        })
        // this.destroy()
        wx.showToast({ title: e.msg, icon: 'none' })
        setTimeout(() => {
          wx.navigateBack({})
        }, 2000)
      })
  },

  onBindStart() {
    wx.showToast({
      title: '视频加载中,请勿频繁操作。',
      icon: 'none',
      duration: 1000
    })
    this.vhallrtc
      .publish()
      .then(({ streamId, url }) => {
        wx.hideToast()
        this.setData({ rtmpUrl: url }, () => {
          this.setData({ StartDisabled: true, StopDisabled: false })
          this.livePusher.start()
          this.setData({ userList: this.getRoomInfo() })
        })
      })
      .catch(e => {
        this.setData({ StartDisabled: false, StopDisabled: true })
        console.log(e)
      })
  },
  /**
   * 申请上麦
   */
  apply() {
    this.vhallrtc.apply().catch(() => {
      wx.showToast({ title: '申请上麦失败' })
    })
  },
  onBindStop() {
    this.livePusher.stop()
    this.vhallrtc.unpublish()
    this.setData({
      userList: this.getRoomInfo(),
      StopDisabled: true,
      StartDisabled: false,
      enableCamera: true,
      enableMic: true
    })
  },
  /**
   * 订阅某一路流
   */
  subscribe({
    currentTarget: {
      dataset: { streamid }
    }
  }) {
    this.vhallrtc.subscribe({ streamId: streamid }).then(response => {
      console.log('订阅成功')
      const len = this.data.playerList.length
      this.setData({ [`playerList[${len}]`]: response }, () => {
        this.livePlayer.play({
          streamId: streamid,
          playerId: streamid
        })
      })
      this.setData({ userList: this.getRoomInfo() })
    })
  },
  /**
   * 取消订阅某路流
   */
  unsubscribe({
    currentTarget: {
      dataset: { streamid }
    }
  }) {
    this.vhallrtc.unsubscribe({ streamId: streamid }).then(() => {
      for (let index = 0; index < this.data.playerList.length; index++) {
        if (this.data.playerList[index].streamId == streamid) {
          this.data.playerList.splice(index, 1)
          break
        }
      }
      this.setData({ playerList: this.data.playerList, userList: this.getRoomInfo() })
    })
  },
  /**
   * 获取房间用户信息
   */
  getRoomInfo() {
    return this.vhallrtc.getRoomInfo().remote.users
  },
  /**
   * 添加用户进黑名单
   */
  addBlackList({
    currentTarget: {
      dataset: { userid }
    }
  }) {
    this.vhallrtc.addBlackList({ userId: userid })
  },
  /**
   * 获取黑名单列表
   */
  getBlackList() {
    return new Promise((resolve, reject) => {
      this.vhallrtc
        .getBlackList()
        .then(list => {
          console.log(list)
          this.setData({ blackList: list })
          resolve(list)
        })
        .catch(e => {
          reject(e)
        })
    })
  },
  /**
   * 移除黑名单
   */
  removeBlackList({
    currentTarget: {
      dataset: { userid }
    }
  }) {
    this.vhallrtc.removeBlackList({ userId: userid }).then(() => {
      this.getBlackList()
      this.setData({ userList: this.getRoomInfo() })
    })
  },
  /**
   * 邀请上麦
   */
  invite({
    currentTarget: {
      dataset: { userid }
    }
  }) {
    this.vhallrtc.invite({ userId: userid }).then(() => {
      this.invitedId = userid
      wx.showToast({ title: '已发出邀请', icon: 'none' })
    })
  },
  onBindSwitchCamera() {
    this.livePusher.switchCamera()
  },

  pusherStatechange(param) {
    try {
      this.livePusher.pusherStatechange(param)
      if (param.detail.code > 3000) {
        this.onBindStop()
      }
    } catch (error) {
      console.log(error)
    }
  },
  pusherNetstatus(param) {
    try {
      this.livePusher.pusherNetstatus(param)
    } catch (error) {
      console.log(error)
    }
  },
  playerStatechange(param) {
    try {
      this.livePlayer.playerStatechange(param)
    } catch (error) {
      console.log(error)
    }
  },
  playerNetstatus(param) {
    try {
      this.livePlayer.playerNetstatus(param)
    } catch (error) {
      console.log(error)
    }
  },

  destroy() {
    try {
      this.vhallChat.destroy()
      this.interaction.destroy()
    } catch (error) {
      console.warn(error)
    }
    this.vhallrtc = null // sdk 返回的监听与触发事件的句柄
    this.livePusher = null
    this.livePlayer = null
    this.interaction = null // sdk实例句柄
    this.chat = null
    this.vhallBase = null
    this.vhallChat = null
    wx.navigateBack({})
  },
  /**
   * 开启旁路
   */
  onConfigRoomBroadCast() {
    let config = {
      profile: this.vhallrtc.BROADCAST_VIDEO_PROFILE_720P_0,
      roomId: this.options.roomId,
      layoutMode: this.vhallrtc[this.data.layoutList[0].value]
    }
    this.vhallrtc
      .startBroadCast(config)
      .then(() => {
        wx.showToast({
          title: `开启旁路成功`,
          icon: 'none',
          duration: 3000
        })
      })
      .catch(() => {
        wx.showToast({
          title: `开启旁路失败`,
          icon: 'none',
          duration: 3000
        })
      })
  },
  /**
   * 关闭旁路
   */
  onStopRoomBroadCast() {
    this.vhallrtc
      .stopBroadCast({ roomId: this.options.roomId })
      .then(() => {
        wx.showToast({
          title: `关闭旁路成功`,
          icon: 'none',
          duration: 3000
        })
      })
      .catch(() => {
        wx.showToast({
          title: `关闭旁路失败`,
          icon: 'none',
          duration: 3000
        })
      })
  },
  /**
   * 选取旁路推流屏幕表现
   */
  bindPickerChange({ detail: { value } }) {
    this.setMixLayoutMode(value)
  },
  /**
   * 切换旁路布局
   */
  setMixLayoutMode(value) {
    const layout = this.vhallrtc[this.data.layoutList[value].value]
    this.vhallrtc
      .setBroadCastLayout({ layout })
      .then(() => {
        wx.showToast({
          title: `设置旁路布局成功: ${this.data.layoutList[value].name}`,
          icon: 'none',
          duration: 3000
        })
      })
      .catch(() => {
        wx.showToast({
          title: `设置旁路布局失败`,
          icon: 'none',
          duration: 3000
        })
      })
  },
  cameraSwitch() {
    this.setData({ enableCamera: !this.data.enableCamera }, () => {
      wx.showToast({ title: `${this.data.enableCamera ? '打开' : '关闭'}摄像头` })
    })
    this.vhallrtc.setDeviceStatus({ enableCamera: this.data.enableCamera })
  },
  micSwitch() {
    this.setData({ enableMic: !this.data.enableMic }, () => {
      wx.showToast({ title: `${this.data.enableMic ? '打开' : '关闭'}麦克风` })
    })
    this.vhallrtc.setDeviceStatus({ enableMic: this.data.enableMic })
  },
  addEventListener() {
    this.vhallrtc.on(this.vhallrtc.EVENT_REMOTESTREAM_ADD, ({ streamId, userId }) => {
      this.setData({ userList: this.getRoomInfo() })
      if (userId == this.invitedId) {
        this.subscribe({
          currentTarget: {
            dataset: { streamid: streamId }
          }
        })
        this.invitedId = null
      }
    })

    this.vhallrtc.on(this.vhallrtc.EVENT_REMOTESTREAM_REMOVED, event => {
      for (let index = 0; index < this.data.playerList.length; index++) {
        if (this.data.playerList[index].streamId == event.streamId) {
          this.data.playerList.splice(index, 1)
          this.setData({ playerList: this.data.playerList })
          break
        }
      }
      this.setData({ userList: this.getRoomInfo() })
    })
    /**
     * 用户进入房间消息
     */
    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_JOIN, event => {
      console.log('互动收到加入房间消息')
      this.setData({ userList: this.getRoomInfo() })
      wx.showToast({
        title: `用户 ${event.userId} 进入房间`,
        icon: 'none'
      })
    })
    /**
     * 用户离开房间消息
     */
    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_LEAVE, event => {
      this.setData({ userList: this.getRoomInfo() })
      wx.showToast({
        title: `用户 ${event.userId} 离开房间`,
        icon: 'none'
      })
    })
    /**
     * 被邀请上麦事件
     */
    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_INVITED, event => {
      if (event.userId === this.options.accountId) {
        const _this = this
        wx.showModal({
          title: '提示',
          content: '主持人邀请您上麦',
          cancelText: '拒绝',
          confirmText: '同意',
          success(res) {
            if (res.confirm) {
              _this.vhallrtc.consentInvite(
                {},
                () => {},
                () => {}
              )
              _this.onBindStart()
            } else if (res.cancel) {
              _this.vhallrtc.rejectInvite(
                {},
                () => {},
                () => {}
              )
            }
          }
        })
      }
    })
    /**
     * 邀请上麦回复事件 { userId:"",type };
     * type = this.vhallrtc.VRTCCONNECTAGREE 同意上麦
     * type = this.vhallrtc.VRTCCONNECTREFUSED 拒绝上麦
     */
    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_CALLBACK, ({ userId, type }) => {
      console.log({ userId, type })
      if (userId == this.invitedId) {
        if (type == this.vhallrtc.VRTCCONNECTAGREE) {
          wx.showToast({
            title: `用户同意上麦`,
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: `用户拒绝上麦`,
            icon: 'none'
          })
        }
      }
    })

    /**
     * 收到申请上麦事件
     */
    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_APPLY, ({ userId }) => {
      console.log('收到申请上麦事件', { userId })
      if (userId != this.data.accountId) {
        const _this = this
        wx.showModal({
          title: '提示',
          content: `${userId}申请上麦`,
          cancelText: '拒绝',
          confirmText: '同意',
          success(res) {
            if (res.confirm) {
              _this.vhallrtc.consentApply(
                { userId },
                () => {},
                () => {}
              )
            } else if (res.cancel) {
              _this.vhallrtc.rejectApply(
                { userId },
                () => {},
                () => {}
              )
            }
          }
        })
      }
    })

    /**
     * 审核上麦事件
     * type = this.vhallrtc.VRTCCONNECTAGREE 同意上麦
     * type = this.vhallrtc.VRTCCONNECTREFUSED 拒绝上麦
     */
    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_AUTH, ({ userId, type }) => {
      console.log('审核上麦', { userId, type })
      if (userId == this.data.accountId) {
        switch (type) {
          case this.vhallrtc.VRTCCONNECTAGREE:
            wx.showToast({ title: '同意上麦', icon: 'none' })
            this.onBindStart()
            break
          case this.vhallrtc.VRTCCONNECTREFUSED:
            wx.showToast({ title: '拒绝上麦', icon: 'none' })
            break
          default:
            break
        }
      }
    })

    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_BLACKLIST, event => {
      console.log('收到添加黑名单消息', event)
      if (event.userId === this.options.accountId) {
        wx.showToast({
          title: `您被踢出房间`,
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack({})
        }, 2000)
      } else {
        wx.showToast({
          title: `${event.userId} 被踢出房间`,
          icon: 'none',
          duration: 3000
        })
        // 刷新黑名单列表
        this.getBlackList()
      }
    })

    this.vhallrtc.on(this.vhallrtc.FORCE_LEAVE_INAV, () => {
      console.log('收到被踢出（未添加黑名单消息）')
      wx.navigateBack({})
    })

    this.vhallrtc.on(this.vhallrtc.EVENT_PUSHERSUCC, () => {
      console.log('live-pusher推流成功')
    })
    this.vhallrtc.on(this.vhallrtc.EVENT_PUSHERERROR, () => {
      this.onBindStop()
      console.log('live-pusher推流失败')
    })
    this.vhallrtc.on(this.vhallrtc.EVENT_PLAYERSUCC, ({ streamId, playerId }) => {
      console.log('live-player拉流成功', { streamId, playerId })
    })
    this.vhallrtc.on(this.vhallrtc.EVENT_PLAYERREEOR, ({ streamId, playerId }) => {
      console.log('live-player拉流失败', { streamId, playerId })
    })
    /**
     * socket onClose事件 网络从wifi切换到4g 也能触发该事件，res.code == 1006
     */
    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_CLOSE, res => {
      if (res.code == 1000 || res.code == 1006) return
      wx.showToast({
        title: `socketcode:${res.code}`,
        icon: 'none'
      })
    })
    /**
     * 信令socket正在重连事件
     */
    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_RECONNECTING, () => {
      wx.showToast({
        title: `socket正在重连`,
        icon: 'none'
      })
    })
    /**
     * 信令socket 重连成功事件
     */
    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_RECONNECTED, () => {
      wx.showToast({
        title: `socket重连成功`,
        icon: 'none'
      })
    })
    /**
     * 信令socket重连失败事件
     */
    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_RECONNECTFAIL, () => {
      wx.showToast({
        title: `socket重连失败事件`,
        icon: 'none'
      })
    })
    /**
     * 信令socket onError
     */
    this.vhallrtc.on(this.vhallrtc.EVENT_ROOM_ERROR, err => {
      console.log('socket err', err)
    })

    /**
     * 远端流音视频开关状态变更
     */
    this.vhallrtc.on(this.vhallrtc.BROADCASTMUTESTREAM, ({ streamId, enableCamera, enableMic }) => {
      console.log('开关变更事件触发')
      for (const iterator of this.data.playerList) {
        if (iterator.streamId == streamId) {
          iterator.enableCamera = enableCamera
          iterator.enableMic = enableMic
          this.setData({ playerList: this.data.playerList })
          break
        }
      }
    })

    // 监听上线消息
    this.chat.on(this.vhallChat.EVENT_JOIN, res => {
      console.log('chat 上线', res)
      // users.add(res.user_id)
      // this.setData({
      //   online_number: users.size
      // })
      wx.showToast({
        title: `用户 ${res.user_id} 已上线`,
        icon: 'none',
        duration: 2000
      })
    })
    // 监听下线消息
    this.chat.on(this.vhallChat.EVENT_LEAVE, res => {
      console.log('chat 下线', res)
      // users.delete(res.user_id)
      // this.setData({
      //   online_number: users.size
      // })
      wx.showToast({
        title: `用户 ${res.user_id} 已下线`,
        icon: 'none',
        duration: 2000
      })
    })
  },
  onNetworkStatusChange() {
    wx.onNetworkStatusChange(({ isConnected, networkType }) => {
      console.log('监测到网络变化：', isConnected, networkType)
      if (isConnected) {
        // if (this.networkType == 'wifi' && networkType != 'wifi') {
        // 从 wifi 切到 4g socket会 断开 触发 1006，因部分服务端断开的情况也触发该状态码，sdk无法分辨进行自动重联，故需要手动重联
        this.reconnectSocket()
        // }
      }
      this.networkType = networkType
    })
  },
  getNetworkType() {
    wx.getNetworkType({
      success: ({ networkType }) => {
        this.networkType = networkType
      }
    })
  },
  addChatListener() {
    // 监听聊天消息
    this.chat.on(this.vhallChat.EVENT_CHAT, res => {
      switch (res.type) {
        case this.vhallChat.TYPE_TEXT:
          {
            let list = []
            list = this.data.newslist
            list.push({ content: res.text_content, type: res.type, nickName: res.user_id })
            this.setData({
              newslist: list,
              scrollTop: 100 * list.length
            })
          }
          break
        case this.vhallChat.TYPE_DISABLE_ALL:
          wx.showToast({ title: '全员禁言', icon: 'none' })
          break
        case this.vhallChat.TYPE_DISABLE:
          if (res.user_id == this.data.accountId) {
            wx.showToast({ title: '当前用户被禁言', icon: 'none' })
          }
          break
        case this.vhallChat.TYPE_PERMIT_ALL:
          wx.showToast({ title: '取消全员禁言', icon: 'none' })
          break
        case this.vhallChat.TYPE_PERMIT:
          if (res.user_id == this.data.accountId) {
            wx.showToast({ title: '当前用户取消禁言', icon: 'none' })
          }
          break
        default:
          break
      }
    })
    this.chat.on(this.vhallChat.EVENT_CLOSE, res => {
      console.log('onClose', res)
    })

    this.chat.on(this.vhallChat.EVENT_ERROR, res => {
      console.log('onTaskError', res)
    })
    this.chat.on(this.vhallChat.CONNECTFAIL, res => {
      wx.showToast({ title: 'socket连接失败', icon: 'none' })
    })
    this.chat.on(this.vhallChat.RECONNECTING, () => {
      wx.showToast({ title: 'socket正在重连', icon: 'none' })
    })

    this.chat.on(this.vhallChat.RECONNECTED, res => {
      wx.showToast({ title: 'socket重连成功', icon: 'none' })
    })

    this.chat.on(this.vhallChat.RECONNECTFAIL, res => {
      wx.showToast({ title: 'socket重连失败', icon: 'none' })
    })
    this.chat.on(this.vhallChat.EVENT_CUSTOM, res => {
      console.log(res)
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.destroy()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.destroy()
    wx.offNetworkStatusChange()
  },
  send() {
    if (!this.data.content || this.data.content.trim() == '') {
      wx.showToast({
        title: '消息不能为空哦~',
        icon: 'none',
        duration: 2000
      })
    } else {
      if (!this.chat) {
        return
      }
      let msgBody = {
        data: this.data.content,
        context: { nick_name: 'vhall' }
      }
      // 发送聊天消息
      this.chat
        .emitChat(msgBody)
        .then(() => {
          this.cleanInput()
        })
        .catch(e => {
          // 发送聊天消息失败
          console.log(e)
          wx.showToast({
            title: `${e.msg}: ${e.code}`,
            icon: 'none',
            duration: 2000
          })
        })
    }
  },
  //监听input值的改变
  bindChange(res) {
    this.setData({
      content: res.detail.value
    })
  },
  // 清空输入框消息
  cleanInput() {
    this.setData({
      content: ''
    })
  },
  switchView({
    currentTarget: {
      dataset: { id }
    }
  }) {
    id == 1 ? this.setData({ showUserList: true }) : this.setData({ showUserList: false })
  },
  async reconnectSocket() {
    await this.vhallBase.initiativeReconnect()
    await this.vhallChat.initiativeReconnect()
    await this.interaction.initiativeReconnect()
  }
})
