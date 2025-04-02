"use strict";
const api_config = require("./config.js");
const favoriteApi = {
  // 添加收藏
  add(data) {
    return api_config.request({
      url: "/favorite/add",
      method: "POST",
      data
    });
  },
  // 获取收藏列表
  getList(userId, params) {
    return api_config.request({
      url: `/favorite/list/${userId}`,
      data: params
    });
  },
  // 取消收藏
  remove(itemId, userId) {
    return api_config.request({
      url: `/favorite/remove?itemId=${itemId}&userId=${userId}`,
      method: "DELETE"
    });
  },
  // 检查是否已收藏
  check(itemId, userId) {
    return api_config.request({
      url: `/favorite/check?itemId=${itemId}&userId=${userId}`
    });
  }
};
exports.favoriteApi = favoriteApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/favorite.js.map
