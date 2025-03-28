"use strict";
const common_vendor = require("../../common/vendor.js");
const api_favorite = require("../../api/favorite.js");
const api_user = require("../../api/user.js");
const api_reminder = require("../../api/reminder.js");
const _sfc_main = {
  data() {
    return {
      username: "",
      userId: "",
      favorites: [],
      currentPage: 0,
      pageSize: 10,
      hasMore: true,
      profile: {
        username: "",
        email: "",
        nickname: "",
        avatar: "",
        role: "",
        roleDesc: "",
        familyRoles: []
      },
      // 修改密码表单
      passwordForm: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      },
      stockReminders: [],
      usageReminders: [],
      hasReminders: false
    };
  },
  computed: {
    canManageItems() {
      if (this.profile.familyRoles && this.profile.familyRoles.length > 0) {
        return this.profile.familyRoles.some(
          (role) => role.role === "ADMIN" || role.role === "MEMBER"
        );
      }
      return this.profile.role === "ADMIN" || this.profile.role === "MEMBER";
    },
    isAdmin() {
      if (this.profile.familyRoles && this.profile.familyRoles.length > 0) {
        return this.profile.familyRoles.some((role) => role.role === "ADMIN");
      }
      return this.profile.role === "ADMIN";
    }
  },
  onShow() {
    this.userId = common_vendor.index.getStorageSync("userId") || "";
    this.loadUserProfile();
  },
  methods: {
    async loadUserProfile() {
      try {
        const res = await api_user.userApi.getProfile(this.userId);
        this.profile = res.profile;
        this.username = this.profile.nickname || this.profile.username;
      } catch (e) {
        console.error("获取用户信息失败:", e);
      }
    },
    showProfilePopup() {
      this.$refs.profilePopup.open();
    },
    hideProfilePopup() {
      this.$refs.profilePopup.close();
    },
    showPasswordPopup() {
      this.$refs.passwordPopup.open();
    },
    hidePasswordPopup() {
      this.$refs.passwordPopup.close();
      this.passwordForm = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      };
    },
    async handleUpdateProfile() {
      try {
        await api_user.userApi.updateProfile(this.userId, this.profile);
        common_vendor.index.showToast({
          title: "更新成功",
          icon: "success"
        });
        this.hideProfilePopup();
        this.loadUserProfile();
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message || "更新失败",
          icon: "none"
        });
      }
    },
    async handleUpdatePassword() {
      if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return;
      }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        common_vendor.index.showToast({
          title: "两次输入的新密码不一致",
          icon: "none"
        });
        return;
      }
      try {
        await api_user.userApi.updatePassword(this.userId, {
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        });
        common_vendor.index.showToast({
          title: "密码修改成功",
          icon: "success"
        });
        this.hidePasswordPopup();
        setTimeout(() => {
          this.handleLogout();
        }, 1500);
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message || "修改失败",
          icon: "none"
        });
      }
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.clearStorageSync();
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          }
        }
      });
    },
    navigateTo(url) {
      common_vendor.index.navigateTo({
        url
      });
    },
    navigateToDetail(itemId) {
      common_vendor.index.navigateTo({
        url: `/pages/item/detail?id=${itemId}`
      });
    },
    showFavorites() {
      this.currentPage = 0;
      this.hasMore = true;
      this.favorites = [];
      this.loadFavorites();
      this.$refs.favoritesPopup.open();
    },
    hideFavorites() {
      this.$refs.favoritesPopup.close();
    },
    async loadFavorites() {
      if (!this.hasMore)
        return;
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const res = await api_favorite.favoriteApi.getList(userId, {
          page: this.currentPage,
          size: this.pageSize
        });
        const newItems = res.favorites || [];
        this.favorites = [...this.favorites, ...newItems];
        this.hasMore = newItems.length === this.pageSize;
        this.currentPage++;
      } catch (e) {
        common_vendor.index.showToast({
          title: "获取收藏列表失败",
          icon: "none"
        });
      }
    },
    async toggleFavorite(favorite) {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        await api_favorite.favoriteApi.remove(favorite.item.id, userId);
        common_vendor.index.showToast({
          title: "已取消收藏",
          icon: "success"
        });
        this.favorites = this.favorites.filter((f) => f.id !== favorite.id);
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message || "操作失败",
          icon: "none"
        });
      }
    },
    showReminders() {
      this.loadReminders();
      this.$refs.remindersPopup.open();
    },
    hideReminders() {
      this.$refs.remindersPopup.close();
    },
    async loadReminders() {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const res = await api_reminder.reminderApi.getAlerts(userId);
        this.stockReminders = res.data.lowStockAlerts || [];
        this.usageReminders = res.data.usageAlerts || [];
        this.hasReminders = this.stockReminders.length > 0 || this.usageReminders.length > 0;
      } catch (e) {
        common_vendor.index.showToast({
          title: "获取提醒列表失败",
          icon: "none"
        });
      }
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    async chooseAvatar() {
      try {
        const res = await common_vendor.index.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"]
        });
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          const filePath = res.tempFilePaths[0];
          await this.uploadAvatar(filePath);
        }
      } catch (e) {
        console.error("选择图片失败:", e);
      }
    },
    async uploadAvatar(filePath) {
      try {
        common_vendor.index.showLoading({
          title: "上传中..."
        });
        const result = await api_user.userApi.uploadAvatar(this.userId, filePath);
        if (result.success) {
          this.profile.avatar = result.avatar;
          await this.loadUserProfile();
          common_vendor.index.showToast({
            title: "上传成功",
            icon: "success"
          });
        } else {
          throw new Error(result.message || "上传失败");
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message || "上传失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
  }
};
if (!Array) {
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  _easycom_uni_popup2();
}
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  _easycom_uni_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.profile.avatar || "/static/avatar.png",
    b: common_vendor.o((...args) => $options.chooseAvatar && $options.chooseAvatar(...args)),
    c: common_vendor.t($data.username),
    d: common_vendor.t($data.profile.email || "未设置邮箱"),
    e: common_vendor.t($data.profile.roleDesc),
    f: common_vendor.f($data.profile.familyRoles, (role, index, i0) => {
      return {
        a: common_vendor.t(role.familyName),
        b: common_vendor.t(role.roleDesc),
        c: index
      };
    }),
    g: $options.canManageItems
  }, $options.canManageItems ? {
    h: common_vendor.o(($event) => $options.navigateTo("/pages/category/category"))
  } : {}, {
    i: common_vendor.o((...args) => $options.showFavorites && $options.showFavorites(...args)),
    j: $options.canManageItems
  }, $options.canManageItems ? {
    k: common_vendor.o((...args) => $options.showReminders && $options.showReminders(...args))
  } : {}, {
    l: common_vendor.o((...args) => $options.showProfilePopup && $options.showProfilePopup(...args)),
    m: common_vendor.o((...args) => $options.showPasswordPopup && $options.showPasswordPopup(...args)),
    n: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args)),
    o: common_vendor.o((...args) => $options.hideFavorites && $options.hideFavorites(...args)),
    p: $data.favorites.length === 0
  }, $data.favorites.length === 0 ? {} : {
    q: common_vendor.f($data.favorites, (favorite, index, i0) => {
      var _a;
      return {
        a: favorite.item.imageUrl || "/static/default-item.png",
        b: common_vendor.t(favorite.item.name),
        c: common_vendor.t(((_a = favorite.item.category) == null ? void 0 : _a.name) || "未分类"),
        d: common_vendor.t(favorite.item.quantity),
        e: common_vendor.t(favorite.item.location || "暂无"),
        f: common_vendor.o(($event) => $options.navigateToDetail(favorite.item.id), favorite.id),
        g: common_vendor.o(($event) => $options.toggleFavorite(favorite), favorite.id),
        h: favorite.id
      };
    })
  }, {
    r: common_vendor.sr("favoritesPopup", "2fb17fc1-0"),
    s: common_vendor.p({
      type: "bottom"
    }),
    t: common_vendor.o((...args) => $options.hideReminders && $options.hideReminders(...args)),
    v: !$data.hasReminders
  }, !$data.hasReminders ? {} : {}, {
    w: $data.stockReminders.length > 0
  }, $data.stockReminders.length > 0 ? {
    x: common_vendor.f($data.stockReminders, (reminder, index, i0) => {
      return {
        a: common_vendor.t(reminder.itemName),
        b: common_vendor.t(reminder.location),
        c: common_vendor.t(reminder.threshold),
        d: common_vendor.t(reminder.currentQuantity),
        e: "stock-" + index,
        f: common_vendor.o(($event) => $options.navigateToDetail(reminder.itemId), "stock-" + index)
      };
    })
  } : {}, {
    y: $data.usageReminders.length > 0
  }, $data.usageReminders.length > 0 ? {
    z: common_vendor.f($data.usageReminders, (reminder, index, i0) => {
      return {
        a: common_vendor.t(reminder.itemName),
        b: common_vendor.t(reminder.location),
        c: common_vendor.t(reminder.interval),
        d: common_vendor.t($options.formatTime(reminder.lastUsageTime)),
        e: "usage-" + index,
        f: common_vendor.o(($event) => $options.navigateToDetail(reminder.itemId), "usage-" + index)
      };
    })
  } : {}, {
    A: common_vendor.sr("remindersPopup", "2fb17fc1-1"),
    B: common_vendor.p({
      type: "bottom"
    }),
    C: common_vendor.o((...args) => $options.hideProfilePopup && $options.hideProfilePopup(...args)),
    D: $data.profile.username,
    E: common_vendor.o(($event) => $data.profile.username = $event.detail.value),
    F: $data.profile.nickname,
    G: common_vendor.o(($event) => $data.profile.nickname = $event.detail.value),
    H: $data.profile.email,
    I: common_vendor.o(($event) => $data.profile.email = $event.detail.value),
    J: common_vendor.o((...args) => $options.handleUpdateProfile && $options.handleUpdateProfile(...args)),
    K: common_vendor.sr("profilePopup", "2fb17fc1-2"),
    L: common_vendor.p({
      type: "bottom"
    }),
    M: common_vendor.o((...args) => $options.hidePasswordPopup && $options.hidePasswordPopup(...args)),
    N: $data.passwordForm.oldPassword,
    O: common_vendor.o(($event) => $data.passwordForm.oldPassword = $event.detail.value),
    P: $data.passwordForm.newPassword,
    Q: common_vendor.o(($event) => $data.passwordForm.newPassword = $event.detail.value),
    R: $data.passwordForm.confirmPassword,
    S: common_vendor.o(($event) => $data.passwordForm.confirmPassword = $event.detail.value),
    T: common_vendor.o((...args) => $options.handleUpdatePassword && $options.handleUpdatePassword(...args)),
    U: common_vendor.sr("passwordPopup", "2fb17fc1-3"),
    V: common_vendor.p({
      type: "bottom"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
