"use strict";
const api_config = require("./config.js");
const categoryApi = {
  // 获取分类列表
  getList(userId) {
    return api_config.request({
      url: `/category/list/${userId}`
    });
  },
  // 创建分类
  create(data) {
    return api_config.request({
      url: "/category/create",
      method: "POST",
      data
    });
  },
  // 更新分类
  update(id, data) {
    return api_config.request({
      url: `/category/update/${id}`,
      method: "PUT",
      data
    });
  },
  // 删除分类
  delete(id, userId) {
    return api_config.request({
      url: `/category/delete/${id}?userId=${userId}`,
      method: "DELETE"
    });
  }
};
exports.categoryApi = categoryApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/category.js.map
