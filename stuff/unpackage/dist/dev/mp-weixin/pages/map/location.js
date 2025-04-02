"use strict";
const common_vendor = require("../../common/vendor.js");
const amapKey = "fbed83ec9f299f92682bddbb09eb02e3";
const _sfc_main = {
  data() {
    return {
      latitude: 39.909,
      longitude: 116.397,
      keyword: "",
      poiList: [],
      markers: [],
      selectedLocation: null
    };
  },
  onLoad() {
  },
  methods: {
    getCurrentLocation() {
    },
    async searchLocation() {
      if (!this.keyword)
        return;
      try {
        const res = await common_vendor.index.request({
          url: `https://restapi.amap.com/v3/place/text`,
          data: {
            key: amapKey,
            keywords: this.keyword,
            location: `${this.longitude},${this.latitude}`,
            offset: 20,
            page: 1,
            extensions: "all"
          }
        });
        if (res.data.status === "1") {
          this.poiList = res.data.pois;
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "搜索失败",
          icon: "none"
        });
      }
    },
    async searchNearby() {
      try {
        const res = await common_vendor.index.request({
          url: `https://restapi.amap.com/v3/place/around`,
          data: {
            key: amapKey,
            location: `${this.longitude},${this.latitude}`,
            radius: 1e3,
            offset: 20,
            page: 1,
            extensions: "all"
          }
        });
        if (res.data.status === "1") {
          this.poiList = res.data.pois;
        }
      } catch (e) {
        common_vendor.index.showToast({
          title: "获取周边位置失败",
          icon: "none"
        });
      }
    },
    selectLocation(location) {
      this.selectedLocation = location;
      const [longitude2, latitude2] = location.location.split(",");
      this.latitude = Number(latitude2);
      this.longitude = Number(longitude2);
    },
    confirmLocation() {
      if (!this.selectedLocation)
        return;
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      prevPage.$vm.updateLocation({
        name: this.selectedLocation.name,
        address: this.selectedLocation.address,
        location: this.selectedLocation.location
      });
      common_vendor.index.navigateBack();
    },
    handleMapTap(e) {
      this.reverseGeocode(latitude, longitude);
    },
    async reverseGeocode(latitude2, longitude2) {
      try {
        this.geocoder.getAddress([longitude2, latitude2], (status, result) => {
          if (status === "complete" && result.info === "OK") {
            const addressComponent = result.regeocode.addressComponent;
            const poi = {
              name: result.regeocode.formattedAddress,
              address: (addressComponent.district || "") + (addressComponent.township || "") + (addressComponent.street || "") + (addressComponent.streetNumber || ""),
              location: `${longitude2},${latitude2}`
            };
            this.selectedLocation = poi;
            this.poiList = [poi];
          } else {
            common_vendor.index.showToast({
              title: "获取位置信息失败",
              icon: "none"
            });
          }
        });
      } catch (e) {
        common_vendor.index.showToast({
          title: "获取位置信息失败",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.searchLocation && $options.searchLocation(...args)),
    b: $data.keyword,
    c: common_vendor.o(($event) => $data.keyword = $event.detail.value),
    d: $data.poiList.length > 0
  }, $data.poiList.length > 0 ? {
    e: common_vendor.f($data.poiList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: common_vendor.t(item.address),
        c: index,
        d: common_vendor.o(($event) => $options.selectLocation(item), index)
      };
    })
  } : {}, {
    f: common_vendor.o((...args) => $options.confirmLocation && $options.confirmLocation(...args)),
    g: !$data.selectedLocation
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/map/location.js.map
