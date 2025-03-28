"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      categories: [],
      formData: {
        name: "",
        description: "",
        userId: ""
      },
      isEdit: false,
      currentCategoryId: null
    };
  },
  onShow() {
    this.loadCategories();
  },
  methods: {
    async loadCategories() {
      const userId = common_vendor.index.getStorageSync("userId");
      try {
        const res = await common_vendor.index.request({
          url: `http://localhost:8080/api/category/list/${userId}`,
          method: "GET"
        });
        if (res.data && res.data.success) {
          this.categories = res.data.categories || [];
        } else {
          common_vendor.index.showToast({
            title: "获取分类列表失败",
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      }
    },
    showAddModal() {
      this.isEdit = false;
      this.formData = {
        name: "",
        description: "",
        userId: common_vendor.index.getStorageSync("userId")
      };
      this.$refs.popup.open();
    },
    handleEdit(item) {
      this.isEdit = true;
      this.currentCategoryId = item.id;
      this.formData = {
        name: item.name,
        description: item.description || "",
        userId: common_vendor.index.getStorageSync("userId")
      };
      this.$refs.popup.open();
    },
    async handleDelete(categoryId) {
      const userId = common_vendor.index.getStorageSync("userId");
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该分类吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const res2 = await common_vendor.index.request({
                url: `http://localhost:8080/api/category/delete/${categoryId}?userId=${userId}`,
                method: "DELETE"
              });
              if (res2.data && res2.data.success) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                this.loadCategories();
              } else {
                common_vendor.index.showToast({
                  title: res2.data.message || "删除失败",
                  icon: "none"
                });
              }
            } catch (e) {
              common_vendor.index.showToast({
                title: "网络请求失败",
                icon: "none"
              });
            }
          }
        }
      });
    },
    closeDialog() {
      this.$refs.popup.close();
    },
    async confirmDialog() {
      if (!this.formData.name) {
        common_vendor.index.showToast({
          title: "请输入分类名称",
          icon: "none"
        });
        return;
      }
      try {
        let res;
        if (this.isEdit) {
          res = await common_vendor.index.request({
            url: `http://localhost:8080/api/category/update/${this.currentCategoryId}`,
            method: "PUT",
            data: this.formData
          });
        } else {
          res = await common_vendor.index.request({
            url: "http://localhost:8080/api/category/create",
            method: "POST",
            data: this.formData
          });
        }
        if (res.data && res.data.success) {
          common_vendor.index.showToast({
            title: this.isEdit ? "更新成功" : "添加成功",
            icon: "success"
          });
          this.$refs.popup.close();
          this.loadCategories();
        } else {
          common_vendor.index.showToast({
            title: res.data.message || (this.isEdit ? "更新失败" : "添加失败"),
            icon: "none"
          });
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "网络请求失败",
          icon: "none"
        });
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_uni_popup_dialog = () => "../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_popup_dialog + _easycom_uni_popup)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.showAddModal && $options.showAddModal(...args)),
    b: $data.categories.length === 0
  }, $data.categories.length === 0 ? {} : {
    c: common_vendor.f($data.categories, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.description || "暂无描述"),
        c: common_vendor.o(($event) => $options.handleEdit(item), item.id),
        d: common_vendor.o(($event) => $options.handleDelete(item.id), item.id),
        e: item.id
      };
    })
  }, {
    d: $data.formData.name,
    e: common_vendor.o(($event) => $data.formData.name = $event.detail.value),
    f: $data.formData.description,
    g: common_vendor.o(($event) => $data.formData.description = $event.detail.value),
    h: common_vendor.o($options.closeDialog),
    i: common_vendor.o($options.confirmDialog),
    j: common_vendor.p({
      title: $data.isEdit ? "编辑分类" : "添加分类",
      ["before-close"]: true
    }),
    k: common_vendor.sr("popup", "89b385be-0"),
    l: common_vendor.p({
      type: "dialog"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
