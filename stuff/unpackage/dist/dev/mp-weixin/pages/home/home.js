"use strict";
const common_vendor = require("../../common/vendor.js");
const api_item = require("../../api/item.js");
const api_category = require("../../api/category.js");
const api_favorite = require("../../api/favorite.js");
const api_reminder = require("../../api/reminder.js");
const api_user = require("../../api/user.js");
const _sfc_main = {
  data() {
    return {
      searchParams: {
        keyword: "",
        categoryId: null,
        location: "",
        startDate: "",
        endDate: "",
        page: 0,
        size: 10
      },
      categoryIndex: -1,
      searchText: "",
      currentCategory: null,
      categories: [],
      items: [],
      hasMore: true,
      alerts: {
        lowStockAlerts: [],
        usageAlerts: []
      },
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
    },
    hasAlerts() {
      return this.alerts.lowStockAlerts && this.alerts.lowStockAlerts.length > 0 || this.alerts.usageAlerts && this.alerts.usageAlerts.length > 0;
    }
  },
  onShow() {
    this.loadUserRole();
    this.loadCategories();
    this.loadItems();
    this.checkAlerts();
  },
  methods: {
    async loadUserRole() {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const res = await api_user.userApi.getProfile(userId);
        this.userRole = res.profile.role;
        this.familyRoles = res.profile.familyRoles || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:301", "获取用户角色失败:", e);
      }
    },
    async loadCategories() {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const res = await api_category.categoryApi.getList(userId);
        this.categories = res.categories || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:310", e);
      }
    },
    async loadItems(refresh = true) {
      if (refresh) {
        this.searchParams.page = 0;
        this.hasMore = true;
      }
      if (!this.hasMore)
        return;
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        let res;
        if (this.familyRoles && this.familyRoles.length > 0) {
          const familyId = this.familyRoles[0].familyId;
          res = await api_item.itemApi.searchFamilyItems(familyId, this.searchParams);
        } else {
          res = await api_item.itemApi.search(userId, this.searchParams);
        }
        const newItems = res.items || [];
        for (let item of newItems) {
          const favoriteRes = await api_favorite.favoriteApi.check(item.id, userId);
          item.isFavorite = favoriteRes.isFavorite;
          item.ownerName = item.user ? item.user.username : "未知";
        }
        this.items = refresh ? newItems : [...this.items, ...newItems];
        this.hasMore = newItems.length === this.searchParams.size;
        this.searchParams.page++;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:349", e);
      }
    },
    switchCategory(categoryId) {
      this.searchParams.categoryId = categoryId;
      this.loadItems();
    },
    editItem(item) {
      this.navigateTo(`/pages/item/item?id=${item.id}`);
    },
    async deleteItem(itemId) {
      const userId = common_vendor.index.getStorageSync("userId");
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要删除该物品吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const res2 = await common_vendor.index.request({
                url: `http://localhost:8080/api/item/delete/${itemId}?userId=${userId}`,
                method: "DELETE"
              });
              if (res2.data && res2.data.success) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                this.loadItems();
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
    showSearchPopup() {
      this.$refs.searchPopup.open();
    },
    hideSearchPopup() {
      this.$refs.searchPopup.close();
    },
    handleCategoryChange(e) {
      this.categoryIndex = e.detail.value;
      this.searchParams.categoryId = this.categoryIndex === -1 ? null : this.categories[this.categoryIndex].id;
    },
    handleStartDateChange(e) {
      this.searchParams.startDate = e.detail.value;
    },
    handleEndDateChange(e) {
      this.searchParams.endDate = e.detail.value;
    },
    resetSearch() {
      this.searchParams = {
        keyword: "",
        categoryId: null,
        location: "",
        startDate: "",
        endDate: "",
        page: 0,
        size: 10
      };
      this.categoryIndex = -1;
      this.loadItems();
    },
    confirmSearch() {
      this.hideSearchPopup();
      this.loadItems();
    },
    handleSearch() {
      this.loadItems();
    },
    async toggleFavorite(item) {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        if (item.isFavorite) {
          await api_favorite.favoriteApi.remove(item.id, userId);
          common_vendor.index.showToast({
            title: "已取消收藏",
            icon: "success"
          });
        } else {
          await api_favorite.favoriteApi.add({
            itemId: item.id,
            userId
          });
          common_vendor.index.showToast({
            title: "收藏成功",
            icon: "success"
          });
        }
        item.isFavorite = !item.isFavorite;
      } catch (e) {
        common_vendor.index.showToast({
          title: e.message || "操作失败",
          icon: "none"
        });
      }
    },
    async checkAlerts() {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const res = await api_reminder.reminderApi.getAlerts(userId);
        this.alerts = res.data;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:491", "获取提醒失败:", e);
      }
    },
    showAlertsPopup() {
      this.checkAlerts();
      this.$refs.alertsPopup.open();
    },
    hideAlertsPopup() {
      this.$refs.alertsPopup.close();
    },
    formatLastUsageTime(timeStr) {
      if (!timeStr)
        return "";
      const date = new Date(timeStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
    navigateToItemDetail(itemId) {
      this.navigateTo(`/pages/item/detail?id=${itemId}`);
    }
  },
  onReachBottom() {
    this.loadItems(false);
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
  var _a;
  return common_vendor.e({
    a: $options.hasAlerts
  }, $options.hasAlerts ? {} : {}, {
    b: common_vendor.o((...args) => $options.showAlertsPopup && $options.showAlertsPopup(...args)),
    c: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    d: $data.searchParams.keyword,
    e: common_vendor.o(($event) => $data.searchParams.keyword = $event.detail.value),
    f: common_vendor.o((...args) => $options.showSearchPopup && $options.showSearchPopup(...args)),
    g: $data.searchParams.categoryId === null ? 1 : "",
    h: common_vendor.o(($event) => $options.switchCategory(null)),
    i: common_vendor.f($data.categories, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: item.id,
        c: $data.searchParams.categoryId === item.id ? 1 : "",
        d: common_vendor.o(($event) => $options.switchCategory(item.id), item.id)
      };
    }),
    j: common_vendor.o((...args) => $options.resetSearch && $options.resetSearch(...args)),
    k: $data.items.length === 0
  }, $data.items.length === 0 ? {} : {
    l: common_vendor.f($data.items, (item, index, i0) => {
      var _a2;
      return common_vendor.e({
        a: item.imageUrl || "/static/default.png",
        b: common_vendor.t(item.name)
      }, $data.familyRoles && $data.familyRoles.length > 0 ? {
        c: common_vendor.t(item.ownerName)
      } : {}, {
        d: common_vendor.t(((_a2 = item.category) == null ? void 0 : _a2.name) || "未分类"),
        e: common_vendor.t(item.quantity),
        f: common_vendor.t(item.location || "暂无"),
        g: common_vendor.o(($event) => $options.navigateToDetail(item.id), item.id),
        h: common_vendor.t(item.isFavorite ? "★" : "☆"),
        i: item.isFavorite ? 1 : "",
        j: common_vendor.o(($event) => $options.toggleFavorite(item), item.id),
        k: item.id
      });
    }),
    m: $data.familyRoles && $data.familyRoles.length > 0
  }, {
    n: $options.canManageItems
  }, $options.canManageItems ? {
    o: common_vendor.o(($event) => $options.navigateTo("/pages/item/item"))
  } : {}, {
    p: common_vendor.o((...args) => $options.hideSearchPopup && $options.hideSearchPopup(...args)),
    q: $data.searchParams.keyword,
    r: common_vendor.o(($event) => $data.searchParams.keyword = $event.detail.value),
    s: common_vendor.t(((_a = $data.categories[$data.categoryIndex]) == null ? void 0 : _a.name) || "全部分类"),
    t: common_vendor.o((...args) => $options.handleCategoryChange && $options.handleCategoryChange(...args)),
    v: $data.categoryIndex,
    w: $data.categories,
    x: $data.searchParams.location,
    y: common_vendor.o(($event) => $data.searchParams.location = $event.detail.value),
    z: common_vendor.t($data.searchParams.startDate || "开始日期"),
    A: $data.searchParams.startDate,
    B: common_vendor.o((...args) => $options.handleStartDateChange && $options.handleStartDateChange(...args)),
    C: common_vendor.t($data.searchParams.endDate || "结束日期"),
    D: $data.searchParams.endDate,
    E: common_vendor.o((...args) => $options.handleEndDateChange && $options.handleEndDateChange(...args)),
    F: common_vendor.o((...args) => $options.resetSearch && $options.resetSearch(...args)),
    G: common_vendor.o((...args) => $options.confirmSearch && $options.confirmSearch(...args)),
    H: common_vendor.sr("searchPopup", "d171bf36-0"),
    I: common_vendor.p({
      type: "bottom"
    }),
    J: common_vendor.o((...args) => $options.hideAlertsPopup && $options.hideAlertsPopup(...args)),
    K: $data.alerts.lowStockAlerts && $data.alerts.lowStockAlerts.length > 0
  }, $data.alerts.lowStockAlerts && $data.alerts.lowStockAlerts.length > 0 ? {
    L: common_vendor.f($data.alerts.lowStockAlerts, (item, index, i0) => {
      return {
        a: common_vendor.t(item.itemName),
        b: common_vendor.t(item.location),
        c: common_vendor.t(item.currentQuantity),
        d: common_vendor.t(item.threshold),
        e: "stock-" + index,
        f: common_vendor.o(($event) => $options.navigateToItemDetail(item.itemId), "stock-" + index)
      };
    })
  } : {}, {
    M: $data.alerts.usageAlerts && $data.alerts.usageAlerts.length > 0
  }, $data.alerts.usageAlerts && $data.alerts.usageAlerts.length > 0 ? {
    N: common_vendor.f($data.alerts.usageAlerts, (item, index, i0) => {
      return {
        a: common_vendor.t(item.itemName),
        b: common_vendor.t(item.location),
        c: common_vendor.t($options.formatLastUsageTime(item.lastUsageTime)),
        d: common_vendor.t(item.interval),
        e: "usage-" + index,
        f: common_vendor.o(($event) => $options.navigateToItemDetail(item.itemId), "usage-" + index)
      };
    })
  } : {}, {
    O: !$options.hasAlerts
  }, !$options.hasAlerts ? {} : {}, {
    P: common_vendor.sr("alertsPopup", "d171bf36-1"),
    Q: common_vendor.p({
      type: "bottom"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
