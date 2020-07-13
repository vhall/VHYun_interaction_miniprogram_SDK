import indexData from '../../const/const'

Page({
  /**
   * 页面的初始数据
   */
  data: { ...indexData, ratio: false },
  gotoPush() {
    let url = ''
    this.data.ratio
      ? (url = `../push/push?inavId=${this.data.inavId}&appId=${this.data.appId}&accountId=${this.data.accountId}&roomId=${this.data.roomId}&token=${this.data.token}&channelId=${this.data.channelId}`)
      : (url = `../interact/interact?inavId=${this.data.inavId}&appId=${this.data.appId}&accountId=${this.data.accountId}&roomId=${this.data.roomId}&token=${this.data.token}`)
    wx.navigateTo({
      url
    })
  },
  getinput(e) {
    this.data[e.currentTarget.id] = e.detail.value
  },
  onShareAppMessage() {},
  radioChange({ detail: { value } }) {
    value == 1 ? this.setData({ ratio: false }) : this.setData({ ratio: true })
  }
})
