"use strict";
const common_vendor = require("../../common/vendor.js");
const api_reminder = require("../../api/reminder.js");
const api_favorite = require("../../api/favorite.js");
const api_item = require("../../api/item.js");
const api_user = require("../../api/user.js");
const _sfc_main = {
  data() {
    return {
      item: {},
      itemId: "",
      stockThreshold: "",
      usageInterval: "",
      stockReminder: false,
      usageReminder: false,
      lastUsageTime: null,
      reminders: [],
      isFavorite: false,
      _originalQuantity: null,
      tempQuantity: "",
      userRole: "",
      familyRoles: []
    };
  },
  computed: {
    canManageItems() {
      if (this.familyRoles && this.familyRoles.length > 0) {
        return this.familyRoles.some(
          (role) => role.role === "ADMIN" || role.role === "MEMBER"
        );
      }
      return this.userRole === "ADMIN" || this.userRole === "MEMBER";
    }
  },
  onLoad(options) {
    if (options.id) {
      this.itemId = options.id;
      this.loadUserRole();
      this.loadItemDetail(options.id);
      this.loadReminders();
      this.checkFavorite();
    }
  },
  onShow() {
    if (this.itemId) {
      this.loadItemDetail(this.itemId);
    }
  },
  methods: {
    async loadUserRole() {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const res = await api_user.userApi.getProfile(userId);
        this.userRole = res.profile.role;
        this.familyRoles = res.profile.familyRoles || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/item/detail.vue:201", "获取用户角色失败:", e);
      }
    },
    async loadItemDetail(itemId) {
      const userId = common_vendor.index.getStorageSync("userId");
      try {
        const res = await common_vendor.index.request({
          url: `http://localhost:8080/api/item/detail/${itemId}?userId=${userId}`,
          method: "GET"
        });
        if (res.data && res.data.success) {
          this.item = res.data.item;
          this._originalQuantity = this.item.quantity;
          this.stockReminder = res.data.stockReminderEnabled;
          this.usageReminder = res.data.usageReminderEnabled;
          this.stockThreshold = res.data.stockThreshold;
          this.usageInterval = res.data.usageInterval;
          this.lastUsageTime = res.data.lastUsageTime;
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "获取物品详情失败",
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
    formatTime(timeStr) {
      if (!timeStr)
        return "暂无";
      const date = new Date(timeStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    },
    handleEdit() {
      common_vendor.index.navigateTo({
        url: `/pages/item/item?id=${this.item.id}`
      });
    },
    async handleDelete() {
      const userId = common_vendor.index.getStorageSync("userId");
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该物品吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const res2 = await common_vendor.index.request({
                url: `http://localhost:8080/api/item/delete/${this.item.id}?userId=${userId}`,
                method: "DELETE"
              });
              if (res2.data && res2.data.success) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                setTimeout(() => {
                  common_vendor.index.navigateBack();
                }, 1500);
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
    async loadReminders() {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const res = await api_reminder.reminderApi.getList(userId);
        this.reminders = res.reminders || [];
        this.reminders.forEach((reminder) => {
          if (reminder.itemId === this.itemId) {
            if (reminder.type === "STOCK") {
              this.stockReminder = reminder.enabled;
              this.stockThreshold = reminder.threshold;
            } else if (reminder.type === "USAGE") {
              this.usageReminder = reminder.enabled;
              this.usageInterval = reminder.interval;
            }
          }
        });
      } catch (e) {
        common_vendor.index.showToast({
          title: "获取提醒设置失败",
          icon: "none"
        });
      }
    },
    async toggleStockReminder() {
      const userId = common_vendor.index.getStorageSync("userId");
      try {
        if (!this.stockThreshold) {
          common_vendor.index.showToast({
            title: "请设置库存阈值",
            icon: "none"
          });
          return;
        }
        await api_reminder.reminderApi.createStockReminder({
          itemId: this.itemId,
          threshold: Number(this.stockThreshold),
          userId,
          enabled: !this.stockReminder
        });
        this.stockReminder = !this.stockReminder;
        common_vendor.index.showToast({
          title: this.stockReminder ? "已开启库存提醒" : "已关闭库存提醒",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message || "设置失败",
          icon: "none"
        });
      }
    },
    async toggleUsageReminder() {
      const userId = common_vendor.index.getStorageSync("userId");
      try {
        if (!this.usageInterval) {
          common_vendor.index.showToast({
            title: "请设置使用间隔",
            icon: "none"
          });
          return;
        }
        await api_reminder.reminderApi.createUsageReminder({
          itemId: this.itemId,
          interval: Number(this.usageInterval),
          userId,
          enabled: !this.usageReminder
        });
        this.usageReminder = !this.usageReminder;
        common_vendor.index.showToast({
          title: this.usageReminder ? "已开启使用提醒" : "已关闭使用提醒",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message || "设置失败",
          icon: "none"
        });
      }
    },
    async recordUsage() {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        await api_reminder.reminderApi.updateLastUsage(this.itemId, userId);
        this.lastUsageTime = (/* @__PURE__ */ new Date()).toISOString();
        common_vendor.index.showToast({
          title: "记录成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.showToast({
          title: "记录失败",
          icon: "none"
        });
      }
    },
    async checkFavorite() {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const res = await api_favorite.favoriteApi.check(this.itemId, userId);
        this.isFavorite = res.isFavorite;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/item/detail.vue:402", "检查收藏状态失败:", e);
      }
    },
    async toggleFavorite() {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        if (this.isFavorite) {
          await api_favorite.favoriteApi.remove(this.itemId, userId);
          common_vendor.index.showToast({
            title: "已取消收藏",
            icon: "success"
          });
        } else {
          await api_favorite.favoriteApi.add({
            itemId: this.itemId,
            userId
          });
          common_vendor.index.showToast({
            title: "收藏成功",
            icon: "success"
          });
        }
        this.isFavorite = !this.isFavorite;
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message || "操作失败",
          icon: "none"
        });
      }
    },
    async updateQuantity(change) {
      const newQuantity = this.item.quantity + change;
      if (newQuantity < 0) {
        common_vendor.index.showToast({
          title: "数量不能为负",
          icon: "none"
        });
        return;
      }
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        await api_item.itemApi.updateQuantity(this.item.id, {
          amount: change,
          userId
        });
        this.item.quantity = newQuantity;
        common_vendor.index.showToast({
          title: change > 0 ? "增加成功" : "减少成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message || "操作失败",
          icon: "none"
        });
      }
    },
    showQuantityPopup() {
      this.tempQuantity = String(this.item.quantity);
      this.$refs.quantityPopup.open();
    },
    closeQuantityDialog() {
      this.$refs.quantityPopup.close();
    },
    async confirmQuantityDialog() {
      const newQuantity = parseInt(this.tempQuantity);
      if (isNaN(newQuantity) || newQuantity < 0) {
        common_vendor.index.showToast({
          title: "请输入有效数量",
          icon: "none"
        });
        return;
      }
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const change = newQuantity - this.item.quantity;
        await api_item.itemApi.updateQuantity(this.item.id, {
          amount: change,
          userId
        });
        this.item.quantity = newQuantity;
        this.$refs.quantityPopup.close();
        common_vendor.index.showToast({
          title: "更新成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message || "更新失败",
          icon: "none"
        });
      }
    },
    // 显示全屏图片
    showFullImage() {
      if (!this.item.imageUrl) {
        common_vendor.index.showToast({
          title: "暂无图片",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "加载中..."
      });
      const img = new Image();
      img.src = this.item.imageUrl;
      img.onload = () => {
        common_vendor.index.hideLoading();
        this.$refs.imagePopup.open();
      };
      img.onerror = () => {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "图片加载失败",
          icon: "none"
        });
      };
    },
    // 关闭全屏图片
    closeFullImage() {
      const container = this.$refs.imagePopup.$el.querySelector(
        ".fullscreen-image-container"
      );
      container.style.transition = "opacity 0.3s ease";
      container.style.opacity = "0";
      setTimeout(() => {
        this.$refs.imagePopup.close();
        container.style.opacity = "1";
      }, 300);
      document.removeEventListener("keydown", this.handleKeyPress);
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
  var _a;
  return common_vendor.e({
    a: $data.item.imageUrl || "/static/default-item.png",
    b: common_vendor.o((...args) => $options.showFullImage && $options.showFullImage(...args)),
    c: common_vendor.t($data.item.name),
    d: common_vendor.t($data.isFavorite ? "★" : "☆"),
    e: $data.isFavorite ? 1 : "",
    f: common_vendor.o((...args) => $options.toggleFavorite && $options.toggleFavorite(...args)),
    g: common_vendor.t(((_a = $data.item.category) == null ? void 0 : _a.name) || "未知分类"),
    h: common_vendor.o(($event) => $options.updateQuantity(-1)),
    i: common_vendor.t($data.item.quantity),
    j: common_vendor.o((...args) => $options.showQuantityPopup && $options.showQuantityPopup(...args)),
    k: common_vendor.o(($event) => $options.updateQuantity(1)),
    l: common_vendor.t($data.item.location || "暂无"),
    m: common_vendor.t($data.item.description || "暂无描述"),
    n: common_vendor.t($options.formatTime($data.item.createTime)),
    o: common_vendor.t($options.formatTime($data.item.updateTime)),
    p: $options.canManageItems
  }, $options.canManageItems ? common_vendor.e({
    q: $data.stockThreshold,
    r: common_vendor.o(($event) => $data.stockThreshold = $event.detail.value),
    s: $data.stockReminder ? 1 : "",
    t: common_vendor.o((...args) => $options.toggleStockReminder && $options.toggleStockReminder(...args)),
    v: $data.stockReminder
  }, $data.stockReminder ? {
    w: common_vendor.t($data.stockThreshold)
  } : {}, {
    x: $data.usageInterval,
    y: common_vendor.o(($event) => $data.usageInterval = $event.detail.value),
    z: $data.usageReminder ? 1 : "",
    A: common_vendor.o((...args) => $options.toggleUsageReminder && $options.toggleUsageReminder(...args)),
    B: $data.usageReminder
  }, $data.usageReminder ? common_vendor.e({
    C: common_vendor.t($data.usageInterval),
    D: $data.lastUsageTime
  }, $data.lastUsageTime ? {
    E: common_vendor.t($options.formatTime($data.lastUsageTime))
  } : {}) : {}, {
    F: common_vendor.o((...args) => $options.recordUsage && $options.recordUsage(...args))
  }) : {}, {
    G: $options.canManageItems
  }, $options.canManageItems ? {
    H: common_vendor.o((...args) => $options.handleEdit && $options.handleEdit(...args)),
    I: common_vendor.o((...args) => $options.handleDelete && $options.handleDelete(...args))
  } : {}, {
    J: $data.tempQuantity,
    K: common_vendor.o(($event) => $data.tempQuantity = $event.detail.value),
    L: common_vendor.o($options.closeQuantityDialog),
    M: common_vendor.o($options.confirmQuantityDialog),
    N: common_vendor.p({
      title: "修改数量",
      ["before-close"]: true
    }),
    O: common_vendor.sr("quantityPopup", "3a6428a3-0"),
    P: common_vendor.p({
      type: "dialog"
    }),
    Q: $data.item.imageUrl || "/static/default-item.png",
    R: common_vendor.o((...args) => $options.closeFullImage && $options.closeFullImage(...args)),
    S: common_vendor.o((...args) => $options.closeFullImage && $options.closeFullImage(...args)),
    T: common_vendor.sr("imagePopup", "3a6428a3-2"),
    U: common_vendor.p({
      type: "center"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/item/detail.js.map
