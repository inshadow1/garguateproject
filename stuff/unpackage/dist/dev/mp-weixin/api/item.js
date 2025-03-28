"use strict";
const api_config = require("./config.js");
const itemApi = {
  // 搜索物品
  search(userId, params) {
    return api_config.request({
      url: `/item/search/${userId}`,
      data: params
    });
  },
  // 获取物品详情
  getDetail(id, userId) {
    return api_config.request({
      url: `/item/detail/${id}?userId=${userId}`
    });
  },
  // 创建物品
  create(data) {
    return api_config.request({
      url: "/item/create",
      method: "POST",
      data
    });
  },
  // 更新物品
  update(id, data) {
    return api_config.request({
      url: `/item/update/${id}`,
      method: "PUT",
      data
    });
  },
  // 删除物品
  delete(id, userId) {
    return api_config.request({
      url: `/item/delete/${id}?userId=${userId}`,
      method: "DELETE"
    });
  },
  // 更新物品数量
  updateQuantity(itemId, data) {
    return api_config.request({
      url: `/item/${itemId}/quantity`,
      method: "POST",
      data
    });
  }
};
exports.itemApi = itemApi;
