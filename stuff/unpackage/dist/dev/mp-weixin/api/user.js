"use strict";
const common_vendor = require("../common/vendor.js");
const api_config = require("./config.js");
const userApi = {
  // 登录
  login(data) {
    return api_config.request({
      url: "/user/login",
      method: "POST",
      data
    });
  },
  // 注册
  register(data) {
    return api_config.request({
      url: "/user/register",
      method: "POST",
      data
    });
  },
  // 获取用户信息
  getProfile(userId) {
    return api_config.request({
      url: `/user/${userId}/profile`
    });
  },
  // 更新用户信息
  updateProfile(userId, data) {
    return api_config.request({
      url: `/user/${userId}/profile`,
      method: "PUT",
      data
    });
  },
  // 修改密码
  updatePassword(userId, data) {
    return api_config.request({
      url: `/user/${userId}/password`,
      method: "PUT",
      data
    });
  },
  // 上传头像
  uploadAvatar(userId, filePath) {
    return new Promise((resolve, reject) => {
      common_vendor.index.uploadFile({
        url: `${api_config.BASE_URL}/user/${userId}/avatar`,
        filePath,
        name: "file",
        header: {
          "Authorization": common_vendor.index.getStorageSync("token")
        },
        success: (uploadRes) => {
          try {
            const result = typeof uploadRes.data === "string" ? JSON.parse(uploadRes.data) : uploadRes.data;
            resolve(result);
          } catch (e) {
            reject(new Error("解析响应数据失败"));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }
};
exports.userApi = userApi;
