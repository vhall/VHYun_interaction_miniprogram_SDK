import indexData from '../../const/const'

Page({
  /**
   * 页面的初始数据
   */
  data: indexData,
  gotoPush() {
    wx.navigateTo({
      url: `../push/push?inavId=${this.data.inavId}&appId=${this.data.appId}&accountId=${this.data.accountId}&roomId=${this.data.roomId}&token=${this.data.token}`
    })
  },
  getinput(e) {
    this.data[e.currentTarget.id] = e.detail.value
  }
})
