"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      isLogin: true,
      username: "",
      password: "",
      formData: {
        username: "",
        password: ""
      }
    };
  },
  methods: {
    switchLoginType() {
      this.isLogin = !this.isLogin;
    },
    validatePassword(password) {
      if (password.length < 12) {
        common_vendor.index.showToast({
          title: "密码长度至少12位",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    async handleSubmit() {
      if (!this.username || !this.password) {
        common_vendor.index.showToast({
          title: "请输入用户名和密码",
          icon: "none"
        });
        return;
      }
      if (!this.validatePassword(this.password)) {
        return;
      }
      this.formData.username = this.username;
      this.formData.password = this.password;
      try {
        let res;
        if (this.isLogin) {
          res = await api_user.userApi.login(this.formData);
        } else {
          res = await api_user.userApi.register(this.formData);
          common_vendor.index.showToast({
            title: "注册成功，请登录",
            icon: "success"
          });
          this.isLogin = true;
          return;
        }
        common_vendor.index.setStorageSync("token", res.token || "");
        common_vendor.index.setStorageSync("userId", res.userId);
        common_vendor.index.setStorageSync("username", this.username);
        common_vendor.index.switchTab({
          url: "/pages/home/home"
        });
      } catch (e) {
        console.error(e);
        common_vendor.index.showToast({
          title: this.isLogin ? "账号或密码错误" : "注册失败，请重试",
          icon: "none",
          duration: 2e3
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_vendor.t($data.isLogin ? "登录" : "注册"),
    c: $data.username,
    d: common_vendor.o(($event) => $data.username = $event.detail.value),
    e: $data.password,
    f: common_vendor.o(($event) => $data.password = $event.detail.value),
    g: common_vendor.t($data.isLogin ? "登录" : "注册"),
    h: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args)),
    i: common_vendor.t($data.isLogin ? "没有账号？去注册" : "已有账号？去登录"),
    j: common_vendor.o((...args) => $options.switchLoginType && $options.switchLoginType(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
