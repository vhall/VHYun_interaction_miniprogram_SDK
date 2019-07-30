// pages/demo/index.js
import { VhallRTC } from '../sdk/vhall-mpsdk-interaction-1.0.0'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inavId: '',
    appId: '',
    accountId: '',
    roomId: '',
    token: '',
    objectArray: [],
    layout_pattern: VhallRTC.CANVAS_LAYOUT_PATTERN_TILED_17_1TL16GRID,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ DisconnectDisabled: true });
    this.setData({ StartDisabled: true });
    this.setData({ StopDisabled: true });
    for (var key in options) {
      if (this.data.hasOwnProperty(key)) {
        var _d = {};
        _d[key] = options[key];
        this.setData(_d);
      }
    }

    wx.getSystemInfo({
      success: (res) => {
        var h = (res.windowWidth / 16) * 9;
        this.setData({
          playerHeight: h
        });
      }
    });
    // 创建实例
    let params = {
      inavId: this.data.inavId,
      appId: this.data.appId,
      accountId: this.data.accountId,
      token: this.data.token,
      context: this,
      role: VhallRTC.MASTER
    };
    VhallRTC.createInstance(params, (res)=> {
      this.vhallrtc = res.vhallrtc;
      for (let streamId of res.streams) {
        this.vhallrtc.subscribe({ streamId });
      }

      this.vhallrtc.on(VhallRTC.EVENT_REMOTESTREAM_ADD, (event) => {
        this.vhallrtc.subscribe({ streamId: event.streamId });
      });

      this.vhallrtc.on(VhallRTC.EVENT_REMOTESTREAM_REMOVED, (event) => {
        this.vhallrtc.unsubscribe({ streamId: event.streamId });
      });

      this.vhallrtc.on(VhallRTC.EVENT_ROOM_JOIN, (event) => {
        wx.showToast({
          title: `用户 ${event.userId} 进入房间`,
          icon: 'none',
          duration: 1000
        })
      });

      this.vhallrtc.on(VhallRTC.EVENT_ROOM_LEAVE, (event) => {
        wx.showToast({
          title: `用户 ${event.userId} 离开房间`,
          icon: 'none',
          duration: 1000
        })
      });

      this.vhallrtc.on(VhallRTC.EVENT_ROOM_INVITED, (event) => {
        if (event.userId === this.data.accountId) {
          wx.showToast({
            title: `主持人邀请您上麦`,
            icon: 'none',
            duration: 5000
          })
        }
      });

      this.vhallrtc.on(VhallRTC.EVENT_ROOM_BLACKLIST, (event) => {
        if (event.userId === this.data.accountId) {
          wx.showToast({
            title: `您被踢出房间`,
            icon: 'none',
            duration: 5000
          })
          this.onDisconnect();
        } else {
          wx.showToast({
            title: `${event.userId} 被踢出房间`,
            icon: 'none',
            duration: 3000
          })
        }
      });

      this.setData({ StartDisabled: false });
      this.setData({ DisconnectDisabled: false });
    }, (e)=> {
      wx.showToast({
        title: `连接失败，code: ${e.code}, message: ${e.message}`,
        icon: 'none',
        duration: 5000
      })
      this.setData({ DisconnectDisabled: false });
      console.log(e);
    });

    // 保持屏幕常亮
    wx.setKeepScreenOn({ keepScreenOn: true });
  },

  onBindStart: function () {
    this.setData({ StartDisabled: true });
    wx.showToast({
      title: '视频加载中,请勿频繁操作。',
      icon: 'none',
      duration: 1000
    })
    this.vhallrtc.publish({}, () => {
      wx.hideToast();
      this.setData({ StopDisabled: false });
    }, (e) => {
      console.log(e);
    });
  },

  onBindStop: function () {
    this.vhallrtc.unpublish({}, () => {
      this.setData({ StartDisabled: false });
      this.setData({ StopDisabled: true });
    }, (e) => {
      console.log(e);
    });
  },

  onBindSwitchCamera: function () {
    let pusherContext = wx.createLivePusherContext();
    pusherContext.switchCamera();
  },

  onStatechange: function (event) {
    if (!this.vhallrtc) {
      return;
    }

    if (event.target.id === "pusher") {
      this.vhallrtc.onPublishStateChange(event);
      if (event.detail.code <= 0 || event.detail.code >= 1100) {
        // retry
        this.vhallrtc.unpublish({}, ()=> {
          this.vhallrtc.publish();
        });
        console.log(`Publish error code: ${event.detail.code}`);
        wx.showToast({
          title: `推流异常: ${event.detail.code}`,
          icon: 'none',
          duration: 3000
        })
      }
    } else {
      this.vhallrtc.onSubscribeStateChange(event.target.id, event);
      // 网络错误
      if (event.detail.code === -2301) {
        console.log(`Subscribe error code: ${event.detail.code}`);
        wx.showToast({
          title: `订阅流网络错误, ID: ${event.target.id}, code: ${event.detail.code}`,
          icon: 'none',
          duration: 5000
        })
      } else if (2100 <= event.detail.code <= 3000) {
        console.log(`Subscribe error code: ${event.detail.code}`);
      } else if (event.detail.code >= 3000) {
        console.log(`Subscribe error code: ${event.detail.code}`);
        wx.showToast({
          title: `RTMP链接失败，ID: ${event.target.id}, code: ${event.detail.code}`,
          icon: 'none',
          duration: 5000
        })
      }
    }
  },

  onNetstatus: function (event) {
    if (!this.vhallrtc) {
      return;
    }

    if (event.target.id === "pusher") {
      this.vhallrtc.onPublishNetstatus(event);
    } else {
      this.vhallrtc.onSubscribeNetstatus(event.target.id, event);
    }
  },

  onDisconnect: function () {
    if (this.vhallrtc) {
      this.vhallrtc.destroyInstance();
    }
    wx.navigateBack({});
  },

  // 配置旁路
  onConfigRoomBroadCast: function () {
    let config = {
      profile: VhallRTC.BROADCAST_VIDEO_PROFILE_720P_1,
      roomId: this.data.roomId,
      layout: this.data.layout_pattern
    }
    this.vhallrtc.startBroadCast(config, ()=> {
      wx.showToast({
        title: `开启旁路成功`,
        icon: 'none',
        duration: 3000
      })
    }, (e) => {
      wx.showToast({
        title: `开启旁路失败`,
        icon: 'none',
        duration: 3000
      })
      console.log(e);
    });
  },

  // 停止旁路
  onStopRoomBroadCast: function () {
    this.vhallrtc.stopBroadCast({ roomId: this.data.roomId}, ()=> {
      wx.showToast({
        title: `关闭旁路成功`,
        icon: 'none',
        duration: 3000
      })
    }, ()=> {
      wx.showToast({
        title: `关闭旁路失败`,
        icon: 'none',
        duration: 3000
      })
      console.log(e);
    });
  },

  // 配置旁路布局
  onSetMixLayoutMode: function () {
    this.data.layout_pattern = (this.data.layout_pattern+1) % 26;
    this.vhallrtc.setBroadCastLayout({ layout: this.data.layout_pattern }, ()=> {
      wx.showToast({
        title: `设置旁路布局成功: ${this.data.layout_pattern}`,
        icon: 'none',
        duration: 3000
      })
    }, ()=> {
      wx.showToast({
        title: `设置旁路布局失败`,
        icon: 'none',
        duration: 3000
      })
      console.log(e);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.vhallrtc) {
      this.vhallrtc.destroyInstance();
    }
    wx.createLivePusherContext().stop();
    this.data.objectArray = [];
    this.setData({
      objectArray: this.data.objectArray
    })
    wx.navigateBack({});
  },
 
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.vhallrtc) {
      this.vhallrtc.destroyInstance();
    }
    wx.createLivePusherContext().stop();
    this.data.objectArray = [];
    this.setData({
      objectArray: this.data.objectArray
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})