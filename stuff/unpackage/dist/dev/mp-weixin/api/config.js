"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://localhost:8080/api";
const request = async (options) => {
  var _a;
  const token = common_vendor.index.getStorageSync("token");
  common_vendor.index.getStorageSync("userId");
  try {
    if (options.data) {
      Object.keys(options.data).forEach((key) => {
        if (options.data[key] === null) {
          options.data[key] = "";
        }
      });
    }
    const res = await common_vendor.index.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data,
      header: {
        "Authorization": token,
        "Content-Type": "application/json",
        ...options.header
      }
    });
    if (res.statusCode === 200 && res.data && res.data.success) {
      return res.data;
    } else {
      throw new Error(((_a = res.data) == null ? void 0 : _a.message) || "请求失败");
    }
  } catch (e) {
    common_vendor.index.showToast({
      title: e.message || "网络请求失败",
      icon: "none"
    });
    throw e;
  }
};
exports.BASE_URL = BASE_URL;
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/config.js.map
