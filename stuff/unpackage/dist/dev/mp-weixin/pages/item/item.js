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
        const categoryIndex = this.categories.findIndex(
          (c) => c.id === item.category.id
        );
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
      common_vendor.index.__f__("log", "at pages/item/item.vue:193", "分类变更:", {
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
        const tempFilePath = res.tempFilePaths[0];
        try {
          const base64 = await this.getBase64(tempFilePath);
          this.formData.imageUrl = base64;
          common_vendor.index.__f__("log", "at pages/item/item.vue:213", "图片已转换为base64格式");
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/item/item.vue:215", "转换base64失败:", error);
          common_vendor.index.showToast({
            title: "图片转换失败，请重试",
            icon: "none"
          });
          return;
        }
        common_vendor.index.__f__("log", "at pages/item/item.vue:223", "选择的图片路径:", tempFilePath);
      } catch (e) {
        common_vendor.index.__f__("log", "at pages/item/item.vue:225", "选择图片失败:", e);
      }
    },
    // 将图片转换为base64格式 - 使用canvas方式
    getBase64(filePath) {
      return new Promise((resolve, reject) => {
        const ctx = common_vendor.index.createCanvasContext("imageCanvas", this);
        common_vendor.index.getImageInfo({
          src: filePath,
          success: (info) => {
            const maxSize = 3e3;
            const scale = Math.min(
              maxSize / info.width,
              maxSize / info.height,
              1
            );
            const canvasWidth = Math.floor(info.width * scale);
            const canvasHeight = Math.floor(info.height * scale);
            ctx.drawImage(filePath, 0, 0, canvasWidth, canvasHeight);
            ctx.draw(false, () => {
              common_vendor.index.canvasToTempFilePath(
                {
                  canvasId: "imageCanvas",
                  x: 0,
                  y: 0,
                  width: canvasWidth,
                  height: canvasHeight,
                  destWidth: canvasWidth,
                  destHeight: canvasHeight,
                  fileType: "jpg",
                  quality: 0.8,
                  success: (res) => {
                    resolve(res.tempFilePath);
                  },
                  fail: (error) => {
                    common_vendor.index.__f__("error", "at pages/item/item.vue:263", "导出canvas失败:", error);
                    reject(error);
                  }
                },
                this
              );
            });
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/item/item.vue:272", "获取图片信息失败:", error);
            reject(error);
          }
        });
      });
    },
    deleteImage() {
      this.formData.imageUrl = "";
    },
    async handleSubmit() {
      common_vendor.index.__f__("log", "at pages/item/item.vue:284", "提交表单数据:", this.formData);
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
        common_vendor.index.__f__("error", "at pages/item/item.vue:318", "提交失败:", e);
        common_vendor.index.showToast({
          title: e.message || "操作失败",
          icon: "none"
        });
      }
    },
    validateForm() {
      common_vendor.index.__f__("log", "at pages/item/item.vue:327", "验证表单数据:", {
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
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/item/item.js.map
