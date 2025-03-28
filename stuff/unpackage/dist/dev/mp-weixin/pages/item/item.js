"use strict";
const common_vendor = require("../../common/vendor.js");
const api_item = require("../../api/item.js");
const api_category = require("../../api/category.js");
const _sfc_main = {
  data() {
    return {
      isEdit: false,
      itemId: null,
      categoryIndex: -1,
      categories: [],
      formData: {
        name: "",
        categoryId: "",
        quantity: "",
        location: "",
        description: "",
        imageUrl: "",
        userId: "",
        stockThreshold: "",
        usageInterval: ""
      }
    };
  },
  onLoad(options) {
    this.formData.userId = common_vendor.index.getStorageSync("userId");
    if (options.id) {
      this.isEdit = true;
      this.itemId = options.id;
    }
    this.loadCategories();
  },
  methods: {
    async loadCategories() {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const res = await api_category.categoryApi.getList(userId);
        this.categories = res.categories || [];
        if (this.isEdit) {
          this.loadItemDetail();
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "获取分类列表失败",
          icon: "none"
        });
      }
    },
    async loadItemDetail() {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const res = await api_item.itemApi.getDetail(this.itemId, userId);
        const item = res.item;
        this.formData = {
          name: item.name,
          categoryId: item.category.id,
          quantity: item.quantity,
          location: item.location || "",
          description: item.description || "",
          imageUrl: item.imageUrl || "",
          userId: this.formData.userId,
          stockThreshold: item.stockThreshold || "",
          usageInterval: item.usageInterval || ""
        };
        const categoryIndex = this.categories.findIndex((c) => c.id === item.category.id);
        if (categoryIndex !== -1) {
          this.categoryIndex = categoryIndex;
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "获取物品详情失败",
          icon: "none"
        });
      }
    },
    handleCategoryChange(e) {
      this.categoryIndex = Number(e.detail.value);
      this.formData.categoryId = this.categories[this.categoryIndex].id;
      console.log("分类变更:", {
        categoryIndex: this.categoryIndex,
        categoryId: this.formData.categoryId,
        category: this.categories[this.categoryIndex]
      });
    },
    async chooseImage() {
      try {
        const res = await common_vendor.index.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"]
        });
        this.formData.imageUrl = res.tempFilePaths[0];
      } catch (e) {
        console.log(e);
      }
    },
    deleteImage() {
      this.formData.imageUrl = "";
    },
    async handleSubmit() {
      console.log("提交表单数据:", this.formData);
      if (!this.validateForm())
        return;
      try {
        let res;
        const submitData = {
          ...this.formData,
          categoryId: Number(this.formData.categoryId),
          quantity: Number(this.formData.quantity)
        };
        if (this.formData.stockThreshold) {
          submitData.stockThreshold = Number(this.formData.stockThreshold);
        }
        if (this.formData.usageInterval) {
          submitData.usageInterval = Number(this.formData.usageInterval);
        }
        if (this.isEdit) {
          res = await api_item.itemApi.update(this.itemId, submitData);
        } else {
          res = await api_item.itemApi.create(submitData);
        }
        common_vendor.index.showToast({
          title: this.isEdit ? "更新成功" : "添加成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (e) {
        console.error("提交失败:", e);
        common_vendor.index.showToast({
          title: e.message || "操作失败",
          icon: "none"
        });
      }
    },
    validateForm() {
      console.log("验证表单数据:", {
        name: this.formData.name,
        categoryId: this.formData.categoryId,
        quantity: this.formData.quantity
      });
      if (!this.formData.name) {
        common_vendor.index.showToast({
          title: "请输入物品名称",
          icon: "none"
        });
        return false;
      }
      if (!this.formData.categoryId && this.formData.categoryId !== 0) {
        common_vendor.index.showToast({
          title: "请选择分类",
          icon: "none"
        });
        return false;
      }
      if (!this.formData.quantity) {
        common_vendor.index.showToast({
          title: "请输入数量",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    chooseLocation() {
      common_vendor.index.navigateTo({
        url: "/pages/map/location"
      });
    },
    updateLocation(locationInfo) {
      this.formData.location = locationInfo.name;
      this.formData.address = locationInfo.address;
      this.formData.coordinates = locationInfo.location;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a;
  return common_vendor.e({
    a: $data.formData.name,
    b: common_vendor.o(($event) => $data.formData.name = $event.detail.value),
    c: common_vendor.t(((_a = $data.categories[$data.categoryIndex]) == null ? void 0 : _a.name) || "请选择分类"),
    d: common_vendor.o((...args) => $options.handleCategoryChange && $options.handleCategoryChange(...args)),
    e: $data.categoryIndex,
    f: $data.categories,
    g: $data.formData.quantity,
    h: common_vendor.o(($event) => $data.formData.quantity = $event.detail.value),
    i: $data.formData.location,
    j: common_vendor.o(($event) => $data.formData.location = $event.detail.value),
    k: common_vendor.o((...args) => $options.chooseLocation && $options.chooseLocation(...args)),
    l: $data.formData.description,
    m: common_vendor.o(($event) => $data.formData.description = $event.detail.value),
    n: $data.formData.stockThreshold,
    o: common_vendor.o(($event) => $data.formData.stockThreshold = $event.detail.value),
    p: $data.formData.usageInterval,
    q: common_vendor.o(($event) => $data.formData.usageInterval = $event.detail.value),
    r: !$data.formData.imageUrl
  }, !$data.formData.imageUrl ? {
    s: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args))
  } : {
    t: $data.formData.imageUrl,
    v: common_vendor.o((...args) => $options.deleteImage && $options.deleteImage(...args))
  }, {
    w: common_vendor.t($data.isEdit ? "保存修改" : "添加物品"),
    x: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
