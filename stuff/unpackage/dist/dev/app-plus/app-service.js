if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const BASE_URL = "http://192.168.1.4:8080/api";
  const request = async (options) => {
    const token = uni.getStorageSync("token");
    uni.getStorageSync("userId");
    try {
      const res = await uni.request({
        url: BASE_URL + options.url,
        method: options.method || "GET",
        data: options.data,
        header: {
          "Authorization": token,
          "Content-Type": "application/json",
          ...options.header
        }
      });
      if (res.data && res.data.success) {
        return res.data;
      } else {
        throw new Error(res.data.message || "请求失败");
      }
    } catch (e) {
      uni.showToast({
        title: e.message || "网络请求失败",
        icon: "none"
      });
      throw e;
    }
  };
  const userApi = {
    // 登录
    login(data) {
      return request({
        url: "/user/login",
        method: "POST",
        data
      });
    },
    // 注册
    register(data) {
      return request({
        url: "/user/register",
        method: "POST",
        data
      });
    }
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$a = {
    data() {
      return {
        isLogin: true,
        username: "",
        password: "",
        formData: {
          username: "",
          password: ""
        }
      };
    },
    methods: {
      switchLoginType() {
        this.isLogin = !this.isLogin;
      },
      async handleSubmit() {
        if (!this.username || !this.password) {
          uni.showToast({
            title: "请输入用户名和密码",
            icon: "none"
          });
          return;
        }
        this.formData.username = this.username;
        this.formData.password = this.password;
        try {
          const res = await userApi.login(this.formData);
          uni.setStorageSync("token", res.token || "");
          uni.setStorageSync("userId", res.userId);
          uni.setStorageSync("username", this.username);
          uni.switchTab({
            url: "/pages/home/home"
          });
        } catch (e) {
          formatAppLog("error", "at pages/index/index.vue:61", e);
          uni.showToast({
            title: e.message || "登录失败",
            icon: "none"
          });
        }
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "login-box" }, [
        vue.createElementVNode(
          "view",
          { class: "title" },
          vue.toDisplayString($data.isLogin ? "登录" : "注册"),
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "input-group" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.username = $event),
              placeholder: "请输入用户名"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.username]
          ]),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "password",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.password = $event),
              placeholder: "请输入密码"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.password]
          ])
        ]),
        vue.createElementVNode(
          "button",
          {
            class: "submit-btn",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.handleSubmit && $options.handleSubmit(...args))
          },
          vue.toDisplayString($data.isLogin ? "登录" : "注册"),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "view",
          {
            class: "switch-type",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.switchLoginType && $options.switchLoginType(...args))
          },
          vue.toDisplayString($data.isLogin ? "没有账号？去注册" : "已有账号？去登录"),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__file", "C:/Users/Administrator/Documents/HBuilderProjects/stuff/pages/index/index.vue"]]);
  class MPAnimation {
    constructor(options, _this) {
      this.options = options;
      this.animation = uni.createAnimation({
        ...options
      });
      this.currentStepAnimates = {};
      this.next = 0;
      this.$ = _this;
    }
    _nvuePushAnimates(type, args) {
      let aniObj = this.currentStepAnimates[this.next];
      let styles = {};
      if (!aniObj) {
        styles = {
          styles: {},
          config: {}
        };
      } else {
        styles = aniObj;
      }
      if (animateTypes1.includes(type)) {
        if (!styles.styles.transform) {
          styles.styles.transform = "";
        }
        let unit = "";
        if (type === "rotate") {
          unit = "deg";
        }
        styles.styles.transform += `${type}(${args + unit}) `;
      } else {
        styles.styles[type] = `${args}`;
      }
      this.currentStepAnimates[this.next] = styles;
    }
    _animateRun(styles = {}, config = {}) {
      let ref = this.$.$refs["ani"].ref;
      if (!ref)
        return;
      return new Promise((resolve, reject) => {
        nvueAnimation.transition(ref, {
          styles,
          ...config
        }, (res) => {
          resolve();
        });
      });
    }
    _nvueNextAnimate(animates, step = 0, fn) {
      let obj = animates[step];
      if (obj) {
        let {
          styles,
          config
        } = obj;
        this._animateRun(styles, config).then(() => {
          step += 1;
          this._nvueNextAnimate(animates, step, fn);
        });
      } else {
        this.currentStepAnimates = {};
        typeof fn === "function" && fn();
        this.isEnd = true;
      }
    }
    step(config = {}) {
      this.animation.step(config);
      return this;
    }
    run(fn) {
      this.$.animationData = this.animation.export();
      this.$.timer = setTimeout(() => {
        typeof fn === "function" && fn();
      }, this.$.durationTime);
    }
  }
  const animateTypes1 = [
    "matrix",
    "matrix3d",
    "rotate",
    "rotate3d",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scale3d",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skew",
    "skewX",
    "skewY",
    "translate",
    "translate3d",
    "translateX",
    "translateY",
    "translateZ"
  ];
  const animateTypes2 = ["opacity", "backgroundColor"];
  const animateTypes3 = ["width", "height", "left", "right", "top", "bottom"];
  animateTypes1.concat(animateTypes2, animateTypes3).forEach((type) => {
    MPAnimation.prototype[type] = function(...args) {
      this.animation[type](...args);
      return this;
    };
  });
  function createAnimation(option, _this) {
    if (!_this)
      return;
    clearTimeout(_this.timer);
    return new MPAnimation(option, _this);
  }
  const _sfc_main$9 = {
    name: "uniTransition",
    emits: ["click", "change"],
    props: {
      show: {
        type: Boolean,
        default: false
      },
      modeClass: {
        type: [Array, String],
        default() {
          return "fade";
        }
      },
      duration: {
        type: Number,
        default: 300
      },
      styles: {
        type: Object,
        default() {
          return {};
        }
      },
      customClass: {
        type: String,
        default: ""
      },
      onceRender: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isShow: false,
        transform: "",
        opacity: 1,
        animationData: {},
        durationTime: 300,
        config: {}
      };
    },
    watch: {
      show: {
        handler(newVal) {
          if (newVal) {
            this.open();
          } else {
            if (this.isShow) {
              this.close();
            }
          }
        },
        immediate: true
      }
    },
    computed: {
      // 生成样式数据
      stylesObject() {
        let styles = {
          ...this.styles,
          "transition-duration": this.duration / 1e3 + "s"
        };
        let transform = "";
        for (let i in styles) {
          let line = this.toLine(i);
          transform += line + ":" + styles[i] + ";";
        }
        return transform;
      },
      // 初始化动画条件
      transformStyles() {
        return "transform:" + this.transform + ";opacity:" + this.opacity + ";" + this.stylesObject;
      }
    },
    created() {
      this.config = {
        duration: this.duration,
        timingFunction: "ease",
        transformOrigin: "50% 50%",
        delay: 0
      };
      this.durationTime = this.duration;
    },
    methods: {
      /**
       *  ref 触发 初始化动画
       */
      init(obj = {}) {
        if (obj.duration) {
          this.durationTime = obj.duration;
        }
        this.animation = createAnimation(Object.assign(this.config, obj), this);
      },
      /**
       * 点击组件触发回调
       */
      onClick() {
        this.$emit("click", {
          detail: this.isShow
        });
      },
      /**
       * ref 触发 动画分组
       * @param {Object} obj
       */
      step(obj, config = {}) {
        if (!this.animation)
          return;
        for (let i in obj) {
          try {
            if (typeof obj[i] === "object") {
              this.animation[i](...obj[i]);
            } else {
              this.animation[i](obj[i]);
            }
          } catch (e) {
            formatAppLog("error", "at uni_modules/uni-transition/components/uni-transition/uni-transition.vue:148", `方法 ${i} 不存在`);
          }
        }
        this.animation.step(config);
        return this;
      },
      /**
       *  ref 触发 执行动画
       */
      run(fn) {
        if (!this.animation)
          return;
        this.animation.run(fn);
      },
      // 开始过度动画
      open() {
        clearTimeout(this.timer);
        this.transform = "";
        this.isShow = true;
        let { opacity, transform } = this.styleInit(false);
        if (typeof opacity !== "undefined") {
          this.opacity = opacity;
        }
        this.transform = transform;
        this.$nextTick(() => {
          this.timer = setTimeout(() => {
            this.animation = createAnimation(this.config, this);
            this.tranfromInit(false).step();
            this.animation.run();
            this.$emit("change", {
              detail: this.isShow
            });
          }, 20);
        });
      },
      // 关闭过度动画
      close(type) {
        if (!this.animation)
          return;
        this.tranfromInit(true).step().run(() => {
          this.isShow = false;
          this.animationData = null;
          this.animation = null;
          let { opacity, transform } = this.styleInit(false);
          this.opacity = opacity || 1;
          this.transform = transform;
          this.$emit("change", {
            detail: this.isShow
          });
        });
      },
      // 处理动画开始前的默认样式
      styleInit(type) {
        let styles = {
          transform: ""
        };
        let buildStyle = (type2, mode) => {
          if (mode === "fade") {
            styles.opacity = this.animationType(type2)[mode];
          } else {
            styles.transform += this.animationType(type2)[mode] + " ";
          }
        };
        if (typeof this.modeClass === "string") {
          buildStyle(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildStyle(type, mode);
          });
        }
        return styles;
      },
      // 处理内置组合动画
      tranfromInit(type) {
        let buildTranfrom = (type2, mode) => {
          let aniNum = null;
          if (mode === "fade") {
            aniNum = type2 ? 0 : 1;
          } else {
            aniNum = type2 ? "-100%" : "0";
            if (mode === "zoom-in") {
              aniNum = type2 ? 0.8 : 1;
            }
            if (mode === "zoom-out") {
              aniNum = type2 ? 1.2 : 1;
            }
            if (mode === "slide-right") {
              aniNum = type2 ? "100%" : "0";
            }
            if (mode === "slide-bottom") {
              aniNum = type2 ? "100%" : "0";
            }
          }
          this.animation[this.animationMode()[mode]](aniNum);
        };
        if (typeof this.modeClass === "string") {
          buildTranfrom(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildTranfrom(type, mode);
          });
        }
        return this.animation;
      },
      animationType(type) {
        return {
          fade: type ? 0 : 1,
          "slide-top": `translateY(${type ? "0" : "-100%"})`,
          "slide-right": `translateX(${type ? "0" : "100%"})`,
          "slide-bottom": `translateY(${type ? "0" : "100%"})`,
          "slide-left": `translateX(${type ? "0" : "-100%"})`,
          "zoom-in": `scaleX(${type ? 1 : 0.8}) scaleY(${type ? 1 : 0.8})`,
          "zoom-out": `scaleX(${type ? 1 : 1.2}) scaleY(${type ? 1 : 1.2})`
        };
      },
      // 内置动画类型与实际动画对应字典
      animationMode() {
        return {
          fade: "opacity",
          "slide-top": "translateY",
          "slide-right": "translateX",
          "slide-bottom": "translateY",
          "slide-left": "translateX",
          "zoom-in": "scale",
          "zoom-out": "scale"
        };
      },
      // 驼峰转中横线
      toLine(name) {
        return name.replace(/([A-Z])/g, "-$1").toLowerCase();
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.withDirectives((vue.openBlock(), vue.createElementBlock("view", {
      ref: "ani",
      animation: $data.animationData,
      class: vue.normalizeClass($props.customClass),
      style: vue.normalizeStyle($options.transformStyles),
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 14, ["animation"])), [
      [vue.vShow, $data.isShow]
    ]);
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__file", "C:/Users/Administrator/Documents/HBuilderProjects/stuff/uni_modules/uni-transition/components/uni-transition/uni-transition.vue"]]);
  const _sfc_main$8 = {
    name: "uniPopup",
    components: {},
    emits: ["change", "maskClick"],
    props: {
      // 开启动画
      animation: {
        type: Boolean,
        default: true
      },
      // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
      // message: 消息提示 ; dialog : 对话框
      type: {
        type: String,
        default: "center"
      },
      // maskClick
      isMaskClick: {
        type: Boolean,
        default: null
      },
      // TODO 2 个版本后废弃属性 ，使用 isMaskClick
      maskClick: {
        type: Boolean,
        default: null
      },
      backgroundColor: {
        type: String,
        default: "none"
      },
      safeArea: {
        type: Boolean,
        default: true
      },
      maskBackgroundColor: {
        type: String,
        default: "rgba(0, 0, 0, 0.4)"
      },
      borderRadius: {
        type: String
      }
    },
    watch: {
      /**
       * 监听type类型
       */
      type: {
        handler: function(type) {
          if (!this.config[type])
            return;
          this[this.config[type]](true);
        },
        immediate: true
      },
      isDesktop: {
        handler: function(newVal) {
          if (!this.config[newVal])
            return;
          this[this.config[this.type]](true);
        },
        immediate: true
      },
      /**
       * 监听遮罩是否可点击
       * @param {Object} val
       */
      maskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      isMaskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      // H5 下禁止底部滚动
      showPopup(show) {
      }
    },
    data() {
      return {
        duration: 300,
        ani: [],
        showPopup: false,
        showTrans: false,
        popupWidth: 0,
        popupHeight: 0,
        config: {
          top: "top",
          bottom: "bottom",
          center: "center",
          left: "left",
          right: "right",
          message: "top",
          dialog: "center",
          share: "bottom"
        },
        maskClass: {
          position: "fixed",
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)"
        },
        transClass: {
          backgroundColor: "transparent",
          borderRadius: this.borderRadius || "0",
          position: "fixed",
          left: 0,
          right: 0
        },
        maskShow: true,
        mkclick: true,
        popupstyle: "top"
      };
    },
    computed: {
      getStyles() {
        let res = { backgroundColor: this.bg };
        if (this.borderRadius || "0") {
          res = Object.assign(res, { borderRadius: this.borderRadius });
        }
        return res;
      },
      isDesktop() {
        return this.popupWidth >= 500 && this.popupHeight >= 500;
      },
      bg() {
        if (this.backgroundColor === "" || this.backgroundColor === "none") {
          return "transparent";
        }
        return this.backgroundColor;
      }
    },
    mounted() {
      const fixSize = () => {
        const {
          windowWidth,
          windowHeight,
          windowTop,
          safeArea,
          screenHeight,
          safeAreaInsets
        } = uni.getSystemInfoSync();
        this.popupWidth = windowWidth;
        this.popupHeight = windowHeight + (windowTop || 0);
        if (safeArea && this.safeArea) {
          this.safeAreaInsets = safeAreaInsets.bottom;
        } else {
          this.safeAreaInsets = 0;
        }
      };
      fixSize();
    },
    // TODO vue3
    unmounted() {
      this.setH5Visible();
    },
    activated() {
      this.setH5Visible(!this.showPopup);
    },
    deactivated() {
      this.setH5Visible(true);
    },
    created() {
      if (this.isMaskClick === null && this.maskClick === null) {
        this.mkclick = true;
      } else {
        this.mkclick = this.isMaskClick !== null ? this.isMaskClick : this.maskClick;
      }
      if (this.animation) {
        this.duration = 300;
      } else {
        this.duration = 0;
      }
      this.messageChild = null;
      this.clearPropagation = false;
      this.maskClass.backgroundColor = this.maskBackgroundColor;
    },
    methods: {
      setH5Visible(visible = true) {
      },
      /**
       * 公用方法，不显示遮罩层
       */
      closeMask() {
        this.maskShow = false;
      },
      /**
       * 公用方法，遮罩层禁止点击
       */
      disableMask() {
        this.mkclick = false;
      },
      // TODO nvue 取消冒泡
      clear(e) {
        e.stopPropagation();
        this.clearPropagation = true;
      },
      open(direction) {
        if (this.showPopup) {
          return;
        }
        let innerType = ["top", "center", "bottom", "left", "right", "message", "dialog", "share"];
        if (!(direction && innerType.indexOf(direction) !== -1)) {
          direction = this.type;
        }
        if (!this.config[direction]) {
          formatAppLog("error", "at uni_modules/uni-popup/components/uni-popup/uni-popup.vue:298", "缺少类型：", direction);
          return;
        }
        this[this.config[direction]]();
        this.$emit("change", {
          show: true,
          type: direction
        });
      },
      close(type) {
        this.showTrans = false;
        this.$emit("change", {
          show: false,
          type: this.type
        });
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.showPopup = false;
        }, 300);
      },
      // TODO 处理冒泡事件，头条的冒泡事件有问题 ，先这样兼容
      touchstart() {
        this.clearPropagation = false;
      },
      onTap() {
        if (this.clearPropagation) {
          this.clearPropagation = false;
          return;
        }
        this.$emit("maskClick");
        if (!this.mkclick)
          return;
        this.close();
      },
      /**
       * 顶部弹出样式处理
       */
      top(type) {
        this.popupstyle = this.isDesktop ? "fixforpc-top" : "top";
        this.ani = ["slide-top"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
        this.$nextTick(() => {
          if (this.messageChild && this.type === "message") {
            this.messageChild.timerClose();
          }
        });
      },
      /**
       * 底部弹出样式处理
       */
      bottom(type) {
        this.popupstyle = "bottom";
        this.ani = ["slide-bottom"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: this.safeAreaInsets + "px",
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      /**
       * 中间弹出样式处理
       */
      center(type) {
        this.popupstyle = "center";
        this.ani = ["zoom-out", "fade"];
        this.transClass = {
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: this.borderRadius || "0"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      left(type) {
        this.popupstyle = "left";
        this.ani = ["slide-left"];
        this.transClass = {
          position: "fixed",
          left: 0,
          bottom: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      right(type) {
        this.popupstyle = "right";
        this.ani = ["slide-right"];
        this.transClass = {
          position: "fixed",
          bottom: 0,
          right: 0,
          top: 0,
          backgroundColor: this.bg,
          borderRadius: this.borderRadius || "0",
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_0$1);
    return $data.showPopup ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["uni-popup", [$data.popupstyle, $options.isDesktop ? "fixforpc-z-index" : ""]])
      },
      [
        vue.createElementVNode(
          "view",
          {
            onTouchstart: _cache[1] || (_cache[1] = (...args) => $options.touchstart && $options.touchstart(...args))
          },
          [
            $data.maskShow ? (vue.openBlock(), vue.createBlock(_component_uni_transition, {
              key: "1",
              name: "mask",
              "mode-class": "fade",
              styles: $data.maskClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, null, 8, ["styles", "duration", "show", "onClick"])) : vue.createCommentVNode("v-if", true),
            vue.createVNode(_component_uni_transition, {
              key: "2",
              "mode-class": $data.ani,
              name: "content",
              styles: $data.transClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["uni-popup__wrapper", [$data.popupstyle]]),
                    style: vue.normalizeStyle($options.getStyles),
                    onClick: _cache[0] || (_cache[0] = (...args) => $options.clear && $options.clear(...args))
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                  ],
                  6
                  /* CLASS, STYLE */
                )
              ]),
              _: 3
              /* FORWARDED */
            }, 8, ["mode-class", "styles", "duration", "show", "onClick"])
          ],
          32
          /* NEED_HYDRATION */
        )
      ],
      2
      /* CLASS */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-4dd3c44b"], ["__file", "C:/Users/Administrator/Documents/HBuilderProjects/stuff/uni_modules/uni-popup/components/uni-popup/uni-popup.vue"]]);
  const itemApi = {
    // 搜索物品
    search(userId, params) {
      return request({
        url: `/item/search/${userId}`,
        data: params
      });
    },
    // 获取物品详情
    getDetail(id, userId) {
      return request({
        url: `/item/detail/${id}?userId=${userId}`
      });
    },
    // 创建物品
    create(data) {
      return request({
        url: "/item/create",
        method: "POST",
        data
      });
    },
    // 更新物品
    update(id, data) {
      return request({
        url: `/item/update/${id}`,
        method: "PUT",
        data
      });
    },
    // 删除物品
    delete(id, userId) {
      return request({
        url: `/item/delete/${id}?userId=${userId}`,
        method: "DELETE"
      });
    }
  };
  const categoryApi = {
    // 获取分类列表
    getList(userId) {
      return request({
        url: `/category/list/${userId}`
      });
    },
    // 创建分类
    create(data) {
      return request({
        url: "/category/create",
        method: "POST",
        data
      });
    },
    // 更新分类
    update(id, data) {
      return request({
        url: `/category/update/${id}`,
        method: "PUT",
        data
      });
    },
    // 删除分类
    delete(id, userId) {
      return request({
        url: `/category/delete/${id}?userId=${userId}`,
        method: "DELETE"
      });
    }
  };
  const _sfc_main$7 = {
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
        hasMore: true
      };
    },
    onShow() {
      this.loadCategories();
      this.loadItems();
    },
    methods: {
      async loadCategories() {
        try {
          const userId = uni.getStorageSync("userId");
          const res = await categoryApi.getList(userId);
          this.categories = res.categories || [];
        } catch (e) {
          formatAppLog("error", "at pages/home/home.vue:137", e);
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
          const userId = uni.getStorageSync("userId");
          const res = await itemApi.search(userId, this.searchParams);
          const newItems = res.items || [];
          this.items = refresh ? newItems : [...this.items, ...newItems];
          this.hasMore = newItems.length === this.searchParams.size;
          this.searchParams.page++;
        } catch (e) {
          formatAppLog("error", "at pages/home/home.vue:157", e);
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
        const userId = uni.getStorageSync("userId");
        uni.showModal({
          title: "提示",
          content: "确定要删除该物品吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                const res2 = await uni.request({
                  url: `http://localhost:8080/api/item/delete/${itemId}?userId=${userId}`,
                  method: "DELETE"
                });
                if (res2.data && res2.data.success) {
                  uni.showToast({
                    title: "删除成功",
                    icon: "success"
                  });
                  this.loadItems();
                } else {
                  uni.showToast({
                    title: res2.data.message || "删除失败",
                    icon: "none"
                  });
                }
              } catch (e) {
                uni.showToast({
                  title: "网络请求失败",
                  icon: "none"
                });
              }
            }
          }
        });
      },
      navigateTo(url) {
        uni.navigateTo({
          url
        });
      },
      navigateToDetail(itemId) {
        uni.navigateTo({
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
      }
    },
    onReachBottom() {
      this.loadItems(false);
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "search-header" }, [
        vue.createElementVNode("view", { class: "search-bar" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              placeholder: "搜索物品",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.searchParams.keyword = $event),
              onConfirm: _cache[1] || (_cache[1] = (...args) => $options.handleSearch && $options.handleSearch(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.searchParams.keyword]
          ]),
          vue.createElementVNode("text", {
            class: "advanced-search-btn",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.showSearchPopup && $options.showSearchPopup(...args))
          }, "高级搜索")
        ]),
        vue.createElementVNode("view", { class: "category-list" }, [
          vue.createElementVNode("scroll-view", {
            "scroll-x": "true",
            class: "scroll-view"
          }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["category-item", { "active": $data.searchParams.categoryId === null }]),
                onClick: _cache[3] || (_cache[3] = ($event) => $options.switchCategory(null))
              },
              " 全部 ",
              2
              /* CLASS */
            ),
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.categories, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: item.id,
                  class: vue.normalizeClass(["category-item", { "active": $data.searchParams.categoryId === item.id }]),
                  onClick: ($event) => $options.switchCategory(item.id)
                }, vue.toDisplayString(item.name), 11, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("text", {
            class: "reset-btn",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.resetSearch && $options.resetSearch(...args))
          }, "重置")
        ])
      ]),
      vue.createElementVNode("view", { class: "item-list" }, [
        $data.items.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-tip"
        }, [
          vue.createElementVNode("text", null, "暂无物品数据")
        ])) : (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          vue.renderList($data.items, (item, index) => {
            var _a;
            return vue.openBlock(), vue.createElementBlock("view", {
              key: item.id,
              class: "item-card",
              onClick: ($event) => $options.navigateToDetail(item.id)
            }, [
              vue.createElementVNode("image", {
                class: "item-image",
                src: item.imageUrl || "/static/default-item.png",
                mode: "aspectFill"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "item-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "item-name" },
                  vue.toDisplayString(item.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "item-category" },
                  vue.toDisplayString(((_a = item.category) == null ? void 0 : _a.name) || "未分类"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "item-quantity" },
                  "数量：" + vue.toDisplayString(item.quantity),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "item-location" },
                  "位置：" + vue.toDisplayString(item.location || "暂无"),
                  1
                  /* TEXT */
                )
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", {
        class: "add-btn",
        onClick: _cache[5] || (_cache[5] = ($event) => $options.navigateTo("/pages/item/item"))
      }, [
        vue.createElementVNode("text", { class: "plus" }, "+")
      ]),
      vue.createCommentVNode(" 高级搜索弹窗 "),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "searchPopup",
          type: "bottom"
        },
        {
          default: vue.withCtx(() => {
            var _a;
            return [
              vue.createElementVNode("view", { class: "search-popup" }, [
                vue.createElementVNode("view", { class: "popup-header" }, [
                  vue.createElementVNode("text", { class: "title" }, "高级搜索"),
                  vue.createElementVNode("text", {
                    class: "close",
                    onClick: _cache[6] || (_cache[6] = (...args) => $options.hideSearchPopup && $options.hideSearchPopup(...args))
                  }, "×")
                ]),
                vue.createElementVNode("view", { class: "search-form" }, [
                  vue.createElementVNode("view", { class: "form-item" }, [
                    vue.createElementVNode("text", { class: "label" }, "关键词"),
                    vue.withDirectives(vue.createElementVNode(
                      "input",
                      {
                        type: "text",
                        "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.searchParams.keyword = $event),
                        placeholder: "搜索名称或描述"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vue.vModelText, $data.searchParams.keyword]
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "form-item" }, [
                    vue.createElementVNode("text", { class: "label" }, "分类"),
                    vue.createElementVNode("picker", {
                      onChange: _cache[8] || (_cache[8] = (...args) => $options.handleCategoryChange && $options.handleCategoryChange(...args)),
                      value: $data.categoryIndex,
                      range: $data.categories,
                      "range-key": "name"
                    }, [
                      vue.createElementVNode(
                        "view",
                        { class: "picker" },
                        vue.toDisplayString(((_a = $data.categories[$data.categoryIndex]) == null ? void 0 : _a.name) || "全部分类"),
                        1
                        /* TEXT */
                      )
                    ], 40, ["value", "range"])
                  ]),
                  vue.createElementVNode("view", { class: "form-item" }, [
                    vue.createElementVNode("text", { class: "label" }, "位置"),
                    vue.withDirectives(vue.createElementVNode(
                      "input",
                      {
                        type: "text",
                        "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $data.searchParams.location = $event),
                        placeholder: "搜索存放位置"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vue.vModelText, $data.searchParams.location]
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "form-item" }, [
                    vue.createElementVNode("text", { class: "label" }, "创建时间"),
                    vue.createElementVNode("view", { class: "date-range" }, [
                      vue.createElementVNode("picker", {
                        mode: "date",
                        value: $data.searchParams.startDate,
                        onChange: _cache[10] || (_cache[10] = (...args) => $options.handleStartDateChange && $options.handleStartDateChange(...args))
                      }, [
                        vue.createElementVNode(
                          "view",
                          { class: "picker" },
                          vue.toDisplayString($data.searchParams.startDate || "开始日期"),
                          1
                          /* TEXT */
                        )
                      ], 40, ["value"]),
                      vue.createElementVNode("text", { class: "separator" }, "至"),
                      vue.createElementVNode("picker", {
                        mode: "date",
                        value: $data.searchParams.endDate,
                        onChange: _cache[11] || (_cache[11] = (...args) => $options.handleEndDateChange && $options.handleEndDateChange(...args))
                      }, [
                        vue.createElementVNode(
                          "view",
                          { class: "picker" },
                          vue.toDisplayString($data.searchParams.endDate || "结束日期"),
                          1
                          /* TEXT */
                        )
                      ], 40, ["value"])
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "form-actions" }, [
                    vue.createElementVNode("button", {
                      class: "reset-btn",
                      onClick: _cache[12] || (_cache[12] = (...args) => $options.resetSearch && $options.resetSearch(...args))
                    }, "重置"),
                    vue.createElementVNode("button", {
                      class: "confirm-btn",
                      onClick: _cache[13] || (_cache[13] = (...args) => $options.confirmSearch && $options.confirmSearch(...args))
                    }, "确定")
                  ])
                ])
              ])
            ];
          }),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesHomeHome = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__file", "C:/Users/Administrator/Documents/HBuilderProjects/stuff/pages/home/home.vue"]]);
  const _imports_0 = "/static/default-avatar.png";
  const _sfc_main$6 = {
    data() {
      return {
        username: "",
        userId: ""
      };
    },
    onShow() {
      this.username = uni.getStorageSync("username") || "用户";
      this.userId = uni.getStorageSync("userId") || "";
    },
    methods: {
      handleLogout() {
        uni.showModal({
          title: "提示",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              uni.clearStorageSync();
              uni.reLaunch({
                url: "/pages/index/index"
              });
            }
          }
        });
      },
      navigateTo(url) {
        uni.navigateTo({
          url
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "user-info" }, [
        vue.createElementVNode("view", { class: "avatar" }, [
          vue.createElementVNode("image", {
            src: _imports_0,
            mode: "aspectFill"
          })
        ]),
        vue.createElementVNode("view", { class: "info" }, [
          vue.createElementVNode(
            "text",
            { class: "username" },
            vue.toDisplayString($data.username),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "user-id" },
            "ID: " + vue.toDisplayString($data.userId),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "menu-list" }, [
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[0] || (_cache[0] = ($event) => $options.navigateTo("/pages/category/category"))
        }, [
          vue.createElementVNode("text", null, "分类管理"),
          vue.createElementVNode("text", { class: "arrow" }, ">")
        ]),
        vue.createElementVNode("view", { class: "menu-item" }, [
          vue.createElementVNode("text", null, "我的信息"),
          vue.createElementVNode("text", { class: "arrow" }, ">")
        ]),
        vue.createElementVNode("view", { class: "menu-item" }, [
          vue.createElementVNode("text", null, "修改密码"),
          vue.createElementVNode("text", { class: "arrow" }, ">")
        ]),
        vue.createElementVNode("view", { class: "menu-item" }, [
          vue.createElementVNode("text", null, "关于我们"),
          vue.createElementVNode("text", { class: "arrow" }, ">")
        ])
      ]),
      vue.createElementVNode("button", {
        class: "logout-btn",
        onClick: _cache[1] || (_cache[1] = (...args) => $options.handleLogout && $options.handleLogout(...args))
      }, "退出登录")
    ]);
  }
  const PagesUserUser = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "C:/Users/Administrator/Documents/HBuilderProjects/stuff/pages/user/user.vue"]]);
  const popup = {
    data() {
      return {};
    },
    created() {
      this.popup = this.getParent();
    },
    methods: {
      /**
       * 获取父元素实例
       */
      getParent(name = "uniPopup") {
        let parent = this.$parent;
        let parentName = parent.$options.name;
        while (parentName !== name) {
          parent = parent.$parent;
          if (!parent)
            return false;
          parentName = parent.$options.name;
        }
        return parent;
      }
    }
  };
  const isObject = (val) => val !== null && typeof val === "object";
  const defaultDelimiters = ["{", "}"];
  class BaseFormatter {
    constructor() {
      this._caches = /* @__PURE__ */ Object.create(null);
    }
    interpolate(message, values, delimiters = defaultDelimiters) {
      if (!values) {
        return [message];
      }
      let tokens = this._caches[message];
      if (!tokens) {
        tokens = parse(message, delimiters);
        this._caches[message] = tokens;
      }
      return compile(tokens, values);
    }
  }
  const RE_TOKEN_LIST_VALUE = /^(?:\d)+/;
  const RE_TOKEN_NAMED_VALUE = /^(?:\w)+/;
  function parse(format, [startDelimiter, endDelimiter]) {
    const tokens = [];
    let position = 0;
    let text = "";
    while (position < format.length) {
      let char = format[position++];
      if (char === startDelimiter) {
        if (text) {
          tokens.push({ type: "text", value: text });
        }
        text = "";
        let sub = "";
        char = format[position++];
        while (char !== void 0 && char !== endDelimiter) {
          sub += char;
          char = format[position++];
        }
        const isClosed = char === endDelimiter;
        const type = RE_TOKEN_LIST_VALUE.test(sub) ? "list" : isClosed && RE_TOKEN_NAMED_VALUE.test(sub) ? "named" : "unknown";
        tokens.push({ value: sub, type });
      } else {
        text += char;
      }
    }
    text && tokens.push({ type: "text", value: text });
    return tokens;
  }
  function compile(tokens, values) {
    const compiled = [];
    let index = 0;
    const mode = Array.isArray(values) ? "list" : isObject(values) ? "named" : "unknown";
    if (mode === "unknown") {
      return compiled;
    }
    while (index < tokens.length) {
      const token = tokens[index];
      switch (token.type) {
        case "text":
          compiled.push(token.value);
          break;
        case "list":
          compiled.push(values[parseInt(token.value, 10)]);
          break;
        case "named":
          if (mode === "named") {
            compiled.push(values[token.value]);
          } else {
            {
              console.warn(`Type of token '${token.type}' and format of value '${mode}' don't match!`);
            }
          }
          break;
        case "unknown":
          {
            console.warn(`Detect 'unknown' type of token!`);
          }
          break;
      }
      index++;
    }
    return compiled;
  }
  const LOCALE_ZH_HANS = "zh-Hans";
  const LOCALE_ZH_HANT = "zh-Hant";
  const LOCALE_EN = "en";
  const LOCALE_FR = "fr";
  const LOCALE_ES = "es";
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty.call(val, key);
  const defaultFormatter = new BaseFormatter();
  function include(str, parts) {
    return !!parts.find((part) => str.indexOf(part) !== -1);
  }
  function startsWith(str, parts) {
    return parts.find((part) => str.indexOf(part) === 0);
  }
  function normalizeLocale(locale, messages2) {
    if (!locale) {
      return;
    }
    locale = locale.trim().replace(/_/g, "-");
    if (messages2 && messages2[locale]) {
      return locale;
    }
    locale = locale.toLowerCase();
    if (locale === "chinese") {
      return LOCALE_ZH_HANS;
    }
    if (locale.indexOf("zh") === 0) {
      if (locale.indexOf("-hans") > -1) {
        return LOCALE_ZH_HANS;
      }
      if (locale.indexOf("-hant") > -1) {
        return LOCALE_ZH_HANT;
      }
      if (include(locale, ["-tw", "-hk", "-mo", "-cht"])) {
        return LOCALE_ZH_HANT;
      }
      return LOCALE_ZH_HANS;
    }
    let locales = [LOCALE_EN, LOCALE_FR, LOCALE_ES];
    if (messages2 && Object.keys(messages2).length > 0) {
      locales = Object.keys(messages2);
    }
    const lang = startsWith(locale, locales);
    if (lang) {
      return lang;
    }
  }
  class I18n {
    constructor({ locale, fallbackLocale, messages: messages2, watcher, formater: formater2 }) {
      this.locale = LOCALE_EN;
      this.fallbackLocale = LOCALE_EN;
      this.message = {};
      this.messages = {};
      this.watchers = [];
      if (fallbackLocale) {
        this.fallbackLocale = fallbackLocale;
      }
      this.formater = formater2 || defaultFormatter;
      this.messages = messages2 || {};
      this.setLocale(locale || LOCALE_EN);
      if (watcher) {
        this.watchLocale(watcher);
      }
    }
    setLocale(locale) {
      const oldLocale = this.locale;
      this.locale = normalizeLocale(locale, this.messages) || this.fallbackLocale;
      if (!this.messages[this.locale]) {
        this.messages[this.locale] = {};
      }
      this.message = this.messages[this.locale];
      if (oldLocale !== this.locale) {
        this.watchers.forEach((watcher) => {
          watcher(this.locale, oldLocale);
        });
      }
    }
    getLocale() {
      return this.locale;
    }
    watchLocale(fn) {
      const index = this.watchers.push(fn) - 1;
      return () => {
        this.watchers.splice(index, 1);
      };
    }
    add(locale, message, override = true) {
      const curMessages = this.messages[locale];
      if (curMessages) {
        if (override) {
          Object.assign(curMessages, message);
        } else {
          Object.keys(message).forEach((key) => {
            if (!hasOwn(curMessages, key)) {
              curMessages[key] = message[key];
            }
          });
        }
      } else {
        this.messages[locale] = message;
      }
    }
    f(message, values, delimiters) {
      return this.formater.interpolate(message, values, delimiters).join("");
    }
    t(key, locale, values) {
      let message = this.message;
      if (typeof locale === "string") {
        locale = normalizeLocale(locale, this.messages);
        locale && (message = this.messages[locale]);
      } else {
        values = locale;
      }
      if (!hasOwn(message, key)) {
        console.warn(`Cannot translate the value of keypath ${key}. Use the value of keypath as default.`);
        return key;
      }
      return this.formater.interpolate(message[key], values).join("");
    }
  }
  function watchAppLocale(appVm, i18n) {
    if (appVm.$watchLocale) {
      appVm.$watchLocale((newLocale) => {
        i18n.setLocale(newLocale);
      });
    } else {
      appVm.$watch(() => appVm.$locale, (newLocale) => {
        i18n.setLocale(newLocale);
      });
    }
  }
  function getDefaultLocale() {
    if (typeof uni !== "undefined" && uni.getLocale) {
      return uni.getLocale();
    }
    if (typeof global !== "undefined" && global.getLocale) {
      return global.getLocale();
    }
    return LOCALE_EN;
  }
  function initVueI18n(locale, messages2 = {}, fallbackLocale, watcher) {
    if (typeof locale !== "string") {
      const options = [
        messages2,
        locale
      ];
      locale = options[0];
      messages2 = options[1];
    }
    if (typeof locale !== "string") {
      locale = getDefaultLocale();
    }
    if (typeof fallbackLocale !== "string") {
      fallbackLocale = typeof __uniConfig !== "undefined" && __uniConfig.fallbackLocale || LOCALE_EN;
    }
    const i18n = new I18n({
      locale,
      fallbackLocale,
      messages: messages2,
      watcher
    });
    let t2 = (key, values) => {
      if (typeof getApp !== "function") {
        t2 = function(key2, values2) {
          return i18n.t(key2, values2);
        };
      } else {
        let isWatchedAppLocale = false;
        t2 = function(key2, values2) {
          const appVm = getApp().$vm;
          if (appVm) {
            appVm.$locale;
            if (!isWatchedAppLocale) {
              isWatchedAppLocale = true;
              watchAppLocale(appVm, i18n);
            }
          }
          return i18n.t(key2, values2);
        };
      }
      return t2(key, values);
    };
    return {
      i18n,
      f(message, values, delimiters) {
        return i18n.f(message, values, delimiters);
      },
      t(key, values) {
        return t2(key, values);
      },
      add(locale2, message, override = true) {
        return i18n.add(locale2, message, override);
      },
      watch(fn) {
        return i18n.watchLocale(fn);
      },
      getLocale() {
        return i18n.getLocale();
      },
      setLocale(newLocale) {
        return i18n.setLocale(newLocale);
      }
    };
  }
  const en = {
    "uni-popup.cancel": "cancel",
    "uni-popup.ok": "ok",
    "uni-popup.placeholder": "pleace enter",
    "uni-popup.title": "Hint",
    "uni-popup.shareTitle": "Share to"
  };
  const zhHans = {
    "uni-popup.cancel": "取消",
    "uni-popup.ok": "确定",
    "uni-popup.placeholder": "请输入",
    "uni-popup.title": "提示",
    "uni-popup.shareTitle": "分享到"
  };
  const zhHant = {
    "uni-popup.cancel": "取消",
    "uni-popup.ok": "確定",
    "uni-popup.placeholder": "請輸入",
    "uni-popup.title": "提示",
    "uni-popup.shareTitle": "分享到"
  };
  const messages = {
    en,
    "zh-Hans": zhHans,
    "zh-Hant": zhHant
  };
  const {
    t
  } = initVueI18n(messages);
  const _sfc_main$5 = {
    name: "uniPopupDialog",
    mixins: [popup],
    emits: ["confirm", "close", "update:modelValue", "input"],
    props: {
      inputType: {
        type: String,
        default: "text"
      },
      showClose: {
        type: Boolean,
        default: true
      },
      modelValue: {
        type: [Number, String],
        default: ""
      },
      placeholder: {
        type: [String, Number],
        default: ""
      },
      type: {
        type: String,
        default: "error"
      },
      mode: {
        type: String,
        default: "base"
      },
      title: {
        type: String,
        default: ""
      },
      content: {
        type: String,
        default: ""
      },
      beforeClose: {
        type: Boolean,
        default: false
      },
      cancelText: {
        type: String,
        default: ""
      },
      confirmText: {
        type: String,
        default: ""
      },
      maxlength: {
        type: Number,
        default: -1
      },
      focus: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        dialogType: "error",
        val: ""
      };
    },
    computed: {
      okText() {
        return this.confirmText || t("uni-popup.ok");
      },
      closeText() {
        return this.cancelText || t("uni-popup.cancel");
      },
      placeholderText() {
        return this.placeholder || t("uni-popup.placeholder");
      },
      titleText() {
        return this.title || t("uni-popup.title");
      }
    },
    watch: {
      type(val) {
        this.dialogType = val;
      },
      mode(val) {
        if (val === "input") {
          this.dialogType = "info";
        }
      },
      value(val) {
        if (this.maxlength != -1 && this.mode === "input") {
          this.val = val.slice(0, this.maxlength);
        } else {
          this.val = val;
        }
      },
      val(val) {
        this.$emit("update:modelValue", val);
      }
    },
    created() {
      this.popup.disableMask();
      if (this.mode === "input") {
        this.dialogType = "info";
        this.val = this.value;
        this.val = this.modelValue;
      } else {
        this.dialogType = this.type;
      }
    },
    methods: {
      /**
       * 点击确认按钮
       */
      onOk() {
        if (this.mode === "input") {
          this.$emit("confirm", this.val);
        } else {
          this.$emit("confirm");
        }
        if (this.beforeClose)
          return;
        this.popup.close();
      },
      /**
       * 点击取消按钮
       */
      closeDialog() {
        this.$emit("close");
        if (this.beforeClose)
          return;
        this.popup.close();
      },
      close() {
        this.popup.close();
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-popup-dialog" }, [
      vue.createElementVNode("view", { class: "uni-dialog-title" }, [
        vue.createElementVNode(
          "text",
          {
            class: vue.normalizeClass(["uni-dialog-title-text", ["uni-popup__" + $data.dialogType]])
          },
          vue.toDisplayString($options.titleText),
          3
          /* TEXT, CLASS */
        )
      ]),
      $props.mode === "base" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "uni-dialog-content"
      }, [
        vue.renderSlot(_ctx.$slots, "default", {}, () => [
          vue.createElementVNode(
            "text",
            { class: "uni-dialog-content-text" },
            vue.toDisplayString($props.content),
            1
            /* TEXT */
          )
        ], true)
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "uni-dialog-content"
      }, [
        vue.renderSlot(_ctx.$slots, "default", {}, () => [
          vue.withDirectives(vue.createElementVNode("input", {
            class: "uni-dialog-input",
            maxlength: $props.maxlength,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.val = $event),
            type: $props.inputType,
            placeholder: $options.placeholderText,
            focus: $props.focus
          }, null, 8, ["maxlength", "type", "placeholder", "focus"]), [
            [vue.vModelDynamic, $data.val]
          ])
        ], true)
      ])),
      vue.createElementVNode("view", { class: "uni-dialog-button-group" }, [
        $props.showClose ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "uni-dialog-button",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.closeDialog && $options.closeDialog(...args))
        }, [
          vue.createElementVNode(
            "text",
            { class: "uni-dialog-button-text" },
            vue.toDisplayString($options.closeText),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["uni-dialog-button", $props.showClose ? "uni-border-left" : ""]),
            onClick: _cache[2] || (_cache[2] = (...args) => $options.onOk && $options.onOk(...args))
          },
          [
            vue.createElementVNode(
              "text",
              { class: "uni-dialog-button-text uni-button-color" },
              vue.toDisplayString($options.okText),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ])
    ]);
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-d78c88b7"], ["__file", "C:/Users/Administrator/Documents/HBuilderProjects/stuff/uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.vue"]]);
  const _sfc_main$4 = {
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
        const userId = uni.getStorageSync("userId");
        try {
          const res = await uni.request({
            url: `http://localhost:8080/api/category/list/${userId}`,
            method: "GET"
          });
          if (res.data && res.data.success) {
            this.categories = res.data.categories || [];
          } else {
            uni.showToast({
              title: "获取分类列表失败",
              icon: "none"
            });
          }
        } catch (e) {
          uni.showToast({
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
          userId: uni.getStorageSync("userId")
        };
        this.$refs.popup.open();
      },
      handleEdit(item) {
        this.isEdit = true;
        this.currentCategoryId = item.id;
        this.formData = {
          name: item.name,
          description: item.description || "",
          userId: uni.getStorageSync("userId")
        };
        this.$refs.popup.open();
      },
      async handleDelete(categoryId) {
        const userId = uni.getStorageSync("userId");
        uni.showModal({
          title: "提示",
          content: "确定要删除该分类吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                const res2 = await uni.request({
                  url: `http://localhost:8080/api/category/delete/${categoryId}?userId=${userId}`,
                  method: "DELETE"
                });
                if (res2.data && res2.data.success) {
                  uni.showToast({
                    title: "删除成功",
                    icon: "success"
                  });
                  this.loadCategories();
                } else {
                  uni.showToast({
                    title: res2.data.message || "删除失败",
                    icon: "none"
                  });
                }
              } catch (e) {
                uni.showToast({
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
          uni.showToast({
            title: "请输入分类名称",
            icon: "none"
          });
          return;
        }
        try {
          let res;
          if (this.isEdit) {
            res = await uni.request({
              url: `http://localhost:8080/api/category/update/${this.currentCategoryId}`,
              method: "PUT",
              data: this.formData
            });
          } else {
            res = await uni.request({
              url: "http://localhost:8080/api/category/create",
              method: "POST",
              data: this.formData
            });
          }
          if (res.data && res.data.success) {
            uni.showToast({
              title: this.isEdit ? "更新成功" : "添加成功",
              icon: "success"
            });
            this.$refs.popup.close();
            this.loadCategories();
          } else {
            uni.showToast({
              title: res.data.message || (this.isEdit ? "更新失败" : "添加失败"),
              icon: "none"
            });
          }
        } catch (e) {
          uni.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_popup_dialog = resolveEasycom(vue.resolveDynamicComponent("uni-popup-dialog"), __easycom_0);
    const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("button", {
          class: "add-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.showAddModal && $options.showAddModal(...args))
        }, "添加分类")
      ]),
      vue.createElementVNode("view", { class: "category-list" }, [
        $data.categories.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-tip"
        }, [
          vue.createElementVNode("text", null, "暂无分类数据")
        ])) : (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          vue.renderList($data.categories, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: item.id,
              class: "category-item"
            }, [
              vue.createElementVNode("view", { class: "category-content" }, [
                vue.createElementVNode(
                  "view",
                  { class: "category-name" },
                  vue.toDisplayString(item.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  { class: "category-desc" },
                  vue.toDisplayString(item.description || "暂无描述"),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "category-actions" }, [
                vue.createElementVNode("text", {
                  class: "edit-btn",
                  onClick: ($event) => $options.handleEdit(item)
                }, "编辑", 8, ["onClick"]),
                vue.createElementVNode("text", {
                  class: "delete-btn",
                  onClick: ($event) => $options.handleDelete(item.id)
                }, "删除", 8, ["onClick"])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 添加/编辑弹窗 "),
      vue.createVNode(
        _component_uni_popup,
        {
          ref: "popup",
          type: "dialog"
        },
        {
          default: vue.withCtx(() => [
            vue.createVNode(_component_uni_popup_dialog, {
              title: $data.isEdit ? "编辑分类" : "添加分类",
              "before-close": true,
              onClose: $options.closeDialog,
              onConfirm: $options.confirmDialog
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("view", { class: "popup-content" }, [
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "text",
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.formData.name = $event),
                      placeholder: "请输入分类名称",
                      class: "input-field"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $data.formData.name]
                  ]),
                  vue.withDirectives(vue.createElementVNode(
                    "input",
                    {
                      type: "text",
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.formData.description = $event),
                      placeholder: "请输入分类描述",
                      class: "input-field"
                    },
                    null,
                    512
                    /* NEED_PATCH */
                  ), [
                    [vue.vModelText, $data.formData.description]
                  ])
                ])
              ]),
              _: 1
              /* STABLE */
            }, 8, ["title", "onClose", "onConfirm"])
          ]),
          _: 1
          /* STABLE */
        },
        512
        /* NEED_PATCH */
      )
    ]);
  }
  const PagesCategoryCategory = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "C:/Users/Administrator/Documents/HBuilderProjects/stuff/pages/category/category.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {
        isEdit: false,
        itemId: null,
        categoryIndex: 0,
        categories: [],
        formData: {
          name: "",
          categoryId: "",
          quantity: "",
          location: "",
          description: "",
          imageUrl: "",
          userId: ""
        }
      };
    },
    onLoad(options) {
      this.formData.userId = uni.getStorageSync("userId");
      if (options.id) {
        this.isEdit = true;
        this.itemId = options.id;
      }
      this.loadCategories();
    },
    methods: {
      async loadCategories() {
        try {
          const userId = uni.getStorageSync("userId");
          const res = await categoryApi.getList(userId);
          this.categories = res.categories || [];
          if (this.isEdit) {
            this.loadItemDetail();
          }
        } catch (e) {
          uni.showToast({
            title: "获取分类列表失败",
            icon: "none"
          });
        }
      },
      async loadItemDetail() {
        try {
          const userId = uni.getStorageSync("userId");
          const res = await itemApi.getDetail(this.itemId, userId);
          const item = res.item;
          this.formData = {
            name: item.name,
            categoryId: item.category.id,
            quantity: item.quantity,
            location: item.location || "",
            description: item.description || "",
            imageUrl: item.imageUrl || "",
            userId: this.formData.userId
          };
          const categoryIndex = this.categories.findIndex((c) => c.id === item.category.id);
          if (categoryIndex !== -1) {
            this.categoryIndex = categoryIndex;
          }
        } catch (e) {
          uni.showToast({
            title: "获取物品详情失败",
            icon: "none"
          });
        }
      },
      handleCategoryChange(e) {
        this.categoryIndex = e.detail.value;
        this.formData.categoryId = this.categories[this.categoryIndex].id;
      },
      async chooseImage() {
        try {
          const res = await uni.chooseImage({
            count: 1,
            sizeType: ["compressed"],
            sourceType: ["album", "camera"]
          });
          this.formData.imageUrl = res.tempFilePaths[0];
        } catch (e) {
          formatAppLog("log", "at pages/item/item.vue:148", e);
        }
      },
      deleteImage() {
        this.formData.imageUrl = "";
      },
      async handleSubmit() {
        if (!this.validateForm())
          return;
        try {
          let res;
          if (this.isEdit) {
            res = await itemApi.update(this.itemId, this.formData);
          } else {
            res = await itemApi.create(this.formData);
          }
          uni.showToast({
            title: this.isEdit ? "更新成功" : "添加成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (e) {
          uni.showToast({
            title: e.message || "操作失败",
            icon: "none"
          });
        }
      },
      validateForm() {
        if (!this.formData.name) {
          uni.showToast({
            title: "请输入物品名称",
            icon: "none"
          });
          return false;
        }
        if (!this.formData.categoryId && this.categoryIndex === -1) {
          uni.showToast({
            title: "请选择分类",
            icon: "none"
          });
          return false;
        }
        if (!this.formData.quantity) {
          uni.showToast({
            title: "请输入数量",
            icon: "none"
          });
          return false;
        }
        return true;
      },
      chooseLocation() {
        uni.navigateTo({
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
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "form-container" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "物品名称"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.formData.name = $event),
              placeholder: "请输入物品名称"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.formData.name]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "所属分类"),
          vue.createElementVNode("picker", {
            onChange: _cache[1] || (_cache[1] = (...args) => $options.handleCategoryChange && $options.handleCategoryChange(...args)),
            value: $data.categoryIndex,
            range: $data.categories,
            "range-key": "name"
          }, [
            vue.createElementVNode(
              "view",
              { class: "picker" },
              vue.toDisplayString(((_a = $data.categories[$data.categoryIndex]) == null ? void 0 : _a.name) || "请选择分类"),
              1
              /* TEXT */
            )
          ], 40, ["value", "range"])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "数量"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "number",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.formData.quantity = $event),
              placeholder: "请输入数量"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.formData.quantity]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "位置"),
          vue.createElementVNode("view", { class: "location-input" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.formData.location = $event),
                placeholder: "请输入或选择存放位置"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.formData.location]
            ]),
            vue.createElementVNode("text", {
              class: "map-btn",
              onClick: _cache[4] || (_cache[4] = (...args) => $options.chooseLocation && $options.chooseLocation(...args))
            }, "选择位置")
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "描述"),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.formData.description = $event),
              placeholder: "请输入物品描述"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.formData.description]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "图片"),
          !$data.formData.imageUrl ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "image-upload",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.chooseImage && $options.chooseImage(...args))
          }, [
            vue.createElementVNode("text", { class: "upload-icon" }, "+"),
            vue.createElementVNode("text", null, "上传图片")
          ])) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "image-preview"
          }, [
            vue.createElementVNode("image", {
              src: $data.formData.imageUrl,
              mode: "aspectFill"
            }, null, 8, ["src"]),
            vue.createElementVNode("text", {
              class: "delete-icon",
              onClick: _cache[7] || (_cache[7] = vue.withModifiers((...args) => $options.deleteImage && $options.deleteImage(...args), ["stop"]))
            }, "×")
          ]))
        ]),
        vue.createElementVNode(
          "button",
          {
            class: "submit-btn",
            onClick: _cache[8] || (_cache[8] = (...args) => $options.handleSubmit && $options.handleSubmit(...args))
          },
          vue.toDisplayString($data.isEdit ? "保存修改" : "添加物品"),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const PagesItemItem = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "C:/Users/Administrator/Documents/HBuilderProjects/stuff/pages/item/item.vue"]]);
  const reminderApi = {
    // 获取用户的所有提醒
    getList(userId) {
      return request({
        url: `/reminder/list/${userId}`
      });
    },
    // 创建库存提醒
    createStockReminder(data) {
      return request({
        url: "/reminder/stock",
        method: "POST",
        data
      });
    },
    // 创建使用提醒
    createUsageReminder(data) {
      return request({
        url: "/reminder/usage",
        method: "POST",
        data
      });
    },
    // 更新最后使用时间
    updateLastUsage(itemId, userId) {
      return request({
        url: `/reminder/usage/${itemId}?userId=${userId}`,
        method: "POST"
      });
    },
    // 启用/禁用提醒
    toggleReminder(reminderId, data) {
      return request({
        url: `/reminder/toggle/${reminderId}`,
        method: "PUT",
        data
      });
    },
    // 删除提醒
    deleteReminder(reminderId, userId) {
      return request({
        url: `/reminder/${reminderId}?userId=${userId}`,
        method: "DELETE"
      });
    }
  };
  const _sfc_main$2 = {
    data() {
      return {
        item: {},
        itemId: "",
        stockThreshold: "",
        usageInterval: "",
        stockReminder: null,
        usageReminder: null,
        reminders: []
      };
    },
    onLoad(options) {
      if (options.id) {
        this.itemId = options.id;
        this.loadItemDetail(options.id);
        this.loadReminders();
      }
    },
    onShow() {
      if (this.itemId) {
        this.loadItemDetail(this.itemId);
      }
    },
    methods: {
      async loadItemDetail(itemId) {
        const userId = uni.getStorageSync("userId");
        try {
          const res = await uni.request({
            url: `http://localhost:8080/api/item/detail/${itemId}?userId=${userId}`,
            method: "GET"
          });
          if (res.data && res.data.success) {
            this.item = res.data.item;
          } else {
            uni.showToast({
              title: res.data.message || "获取物品详情失败",
              icon: "none"
            });
          }
        } catch (e) {
          uni.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      },
      formatTime(timeStr) {
        if (!timeStr)
          return "暂无";
        const date = new Date(timeStr);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      },
      handleEdit() {
        uni.navigateTo({
          url: `/pages/item/item?id=${this.item.id}`
        });
      },
      async handleDelete() {
        const userId = uni.getStorageSync("userId");
        uni.showModal({
          title: "提示",
          content: "确定要删除该物品吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                const res2 = await uni.request({
                  url: `http://localhost:8080/api/item/delete/${this.item.id}?userId=${userId}`,
                  method: "DELETE"
                });
                if (res2.data && res2.data.success) {
                  uni.showToast({
                    title: "删除成功",
                    icon: "success"
                  });
                  setTimeout(() => {
                    uni.navigateBack();
                  }, 1500);
                } else {
                  uni.showToast({
                    title: res2.data.message || "删除失败",
                    icon: "none"
                  });
                }
              } catch (e) {
                uni.showToast({
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
          const userId = uni.getStorageSync("userId");
          const res = await reminderApi.getList(userId);
          this.reminders = res.reminders || [];
          this.reminders.forEach((reminder) => {
            if (reminder.itemId === this.itemId) {
              if (reminder.type === "STOCK") {
                this.stockReminder = reminder;
                this.stockThreshold = reminder.threshold;
              } else if (reminder.type === "USAGE") {
                this.usageReminder = reminder;
                this.usageInterval = reminder.interval;
              }
            }
          });
        } catch (e) {
          uni.showToast({
            title: "获取提醒设置失败",
            icon: "none"
          });
        }
      },
      async toggleStockReminder() {
        const userId = uni.getStorageSync("userId");
        try {
          if (this.stockReminder) {
            await reminderApi.toggleReminder(this.stockReminder.id, {
              enabled: !this.stockReminder.enabled,
              userId
            });
          } else {
            if (!this.stockThreshold) {
              uni.showToast({
                title: "请设置库存阈值",
                icon: "none"
              });
              return;
            }
            await reminderApi.createStockReminder({
              itemId: this.itemId,
              threshold: Number(this.stockThreshold),
              userId
            });
          }
          this.loadReminders();
          uni.showToast({
            title: "设置成功",
            icon: "success"
          });
        } catch (e) {
          uni.showToast({
            title: e.message || "设置失败",
            icon: "none"
          });
        }
      },
      async toggleUsageReminder() {
        const userId = uni.getStorageSync("userId");
        try {
          if (this.usageReminder) {
            await reminderApi.toggleReminder(this.usageReminder.id, {
              enabled: !this.usageReminder.enabled,
              userId
            });
          } else {
            if (!this.usageInterval) {
              uni.showToast({
                title: "请设置使用间隔",
                icon: "none"
              });
              return;
            }
            await reminderApi.createUsageReminder({
              itemId: this.itemId,
              interval: Number(this.usageInterval),
              userId
            });
          }
          this.loadReminders();
          uni.showToast({
            title: "设置成功",
            icon: "success"
          });
        } catch (e) {
          uni.showToast({
            title: e.message || "设置失败",
            icon: "none"
          });
        }
      },
      async recordUsage() {
        try {
          const userId = uni.getStorageSync("userId");
          await reminderApi.updateLastUsage(this.itemId, userId);
          uni.showToast({
            title: "记录成功",
            icon: "success"
          });
        } catch (e) {
          uni.showToast({
            title: "记录失败",
            icon: "none"
          });
        }
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    var _a;
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "item-detail" }, [
        vue.createElementVNode("view", { class: "image-container" }, [
          vue.createElementVNode("image", {
            class: "item-image",
            src: $data.item.imageUrl || "/static/default-item.png",
            mode: "aspectFit"
          }, null, 8, ["src"])
        ]),
        vue.createElementVNode("view", { class: "info-section" }, [
          vue.createElementVNode(
            "view",
            { class: "item-name" },
            vue.toDisplayString($data.item.name),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            { class: "item-category" },
            "分类：" + vue.toDisplayString(((_a = $data.item.category) == null ? void 0 : _a.name) || "未知分类"),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            { class: "item-quantity" },
            "数量：" + vue.toDisplayString($data.item.quantity),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            { class: "item-location" },
            "位置：" + vue.toDisplayString($data.item.location || "暂无"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "item-description" }, [
            vue.createElementVNode("view", { class: "label" }, "描述："),
            vue.createElementVNode(
              "view",
              { class: "content" },
              vue.toDisplayString($data.item.description || "暂无描述"),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "item-time" }, [
            vue.createElementVNode(
              "view",
              { class: "time-item" },
              "创建时间：" + vue.toDisplayString($options.formatTime($data.item.createTime)),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "view",
              { class: "time-item" },
              "更新时间：" + vue.toDisplayString($options.formatTime($data.item.updateTime)),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "reminder-section" }, [
          vue.createElementVNode("view", { class: "section-title" }, "提醒设置"),
          vue.createElementVNode("view", { class: "reminder-item" }, [
            vue.createElementVNode("text", { class: "reminder-label" }, "库存提醒"),
            vue.createElementVNode("view", { class: "reminder-content" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "number",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.stockThreshold = $event),
                  placeholder: "设置库存阈值",
                  class: "reminder-input"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.stockThreshold]
              ]),
              vue.createElementVNode(
                "button",
                {
                  class: vue.normalizeClass(["reminder-btn", { "active": $data.stockReminder }]),
                  onClick: _cache[1] || (_cache[1] = (...args) => $options.toggleStockReminder && $options.toggleStockReminder(...args))
                },
                vue.toDisplayString($data.stockReminder ? "已开启" : "未开启"),
                3
                /* TEXT, CLASS */
              )
            ])
          ]),
          vue.createElementVNode("view", { class: "reminder-item" }, [
            vue.createElementVNode("text", { class: "reminder-label" }, "使用提醒"),
            vue.createElementVNode("view", { class: "reminder-content" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "number",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.usageInterval = $event),
                  placeholder: "设置使用间隔(天)",
                  class: "reminder-input"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.usageInterval]
              ]),
              vue.createElementVNode(
                "button",
                {
                  class: vue.normalizeClass(["reminder-btn", { "active": $data.usageReminder }]),
                  onClick: _cache[3] || (_cache[3] = (...args) => $options.toggleUsageReminder && $options.toggleUsageReminder(...args))
                },
                vue.toDisplayString($data.usageReminder ? "已开启" : "未开启"),
                3
                /* TEXT, CLASS */
              )
            ])
          ]),
          vue.createElementVNode("button", {
            class: "usage-btn",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.recordUsage && $options.recordUsage(...args))
          }, "记录使用")
        ]),
        vue.createElementVNode("view", { class: "action-buttons" }, [
          vue.createElementVNode("button", {
            class: "edit-btn",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.handleEdit && $options.handleEdit(...args))
          }, "编辑"),
          vue.createElementVNode("button", {
            class: "delete-btn",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.handleDelete && $options.handleDelete(...args))
          }, "删除")
        ])
      ])
    ]);
  }
  const PagesItemDetail = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "C:/Users/Administrator/Documents/HBuilderProjects/stuff/pages/item/detail.vue"]]);
  const amapKey = "fbed83ec9f299f92682bddbb09eb02e3";
  const _sfc_main$1 = {
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
      this.getCurrentLocation();
    },
    methods: {
      getCurrentLocation() {
        uni.getLocation({
          type: "gcj02",
          success: (res) => {
            this.latitude = res.latitude;
            this.longitude = res.longitude;
            this.searchNearby();
          },
          fail: () => {
            uni.showToast({
              title: "获取位置失败",
              icon: "none"
            });
          }
        });
      },
      async searchLocation() {
        if (!this.keyword)
          return;
        try {
          const res = await uni.request({
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
            this.updateMarkers(this.poiList);
          }
        } catch (e) {
          uni.showToast({
            title: "搜索失败",
            icon: "none"
          });
        }
      },
      async searchNearby() {
        try {
          const res = await uni.request({
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
            this.updateMarkers(this.poiList);
          }
        } catch (e) {
          uni.showToast({
            title: "获取周边位置失败",
            icon: "none"
          });
        }
      },
      updateMarkers(pois) {
        this.markers = pois.map((poi, index) => {
          const [longitude, latitude] = poi.location.split(",");
          return {
            id: index,
            latitude: Number(latitude),
            longitude: Number(longitude),
            title: poi.name,
            width: 32,
            height: 32,
            callout: {
              content: poi.name,
              padding: 10,
              borderRadius: 4,
              display: "ALWAYS"
            }
          };
        });
      },
      handleMarkerTap(e) {
        const marker = this.markers[e.detail.markerId];
        if (marker) {
          const poi = this.poiList[e.detail.markerId];
          if (poi) {
            this.selectLocation(poi);
          }
        }
      },
      selectLocation(location) {
        this.selectedLocation = location;
        const [longitude, latitude] = location.location.split(",");
        this.latitude = Number(latitude);
        this.longitude = Number(longitude);
        this.markers = [{
          id: 0,
          latitude: Number(latitude),
          longitude: Number(longitude),
          title: location.name,
          width: 32,
          height: 32,
          callout: {
            content: location.name,
            padding: 10,
            borderRadius: 4,
            display: "ALWAYS"
          }
        }];
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
        uni.navigateBack();
      },
      handleMapTap(e) {
        const { latitude, longitude } = e.detail;
        this.reverseGeocode(latitude, longitude);
      },
      async reverseGeocode(latitude, longitude) {
        try {
          this.geocoder.getAddress([longitude, latitude], (status, result) => {
            if (status === "complete" && result.info === "OK") {
              const addressComponent = result.regeocode.addressComponent;
              const poi = {
                name: result.regeocode.formattedAddress,
                address: (addressComponent.district || "") + (addressComponent.township || "") + (addressComponent.street || "") + (addressComponent.streetNumber || ""),
                location: `${longitude},${latitude}`
              };
              this.selectedLocation = poi;
              this.poiList = [poi];
              this.updateMarkers([poi]);
            } else {
              uni.showToast({
                title: "获取位置信息失败",
                icon: "none"
              });
            }
          });
        } catch (e) {
          uni.showToast({
            title: "获取位置信息失败",
            icon: "none"
          });
        }
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("map", {
        id: "map",
        class: "map",
        latitude: $data.latitude,
        longitude: $data.longitude,
        markers: $data.markers,
        onTap: _cache[0] || (_cache[0] = (...args) => $options.handleMapTap && $options.handleMapTap(...args)),
        onMarkertap: _cache[1] || (_cache[1] = (...args) => $options.handleMarkerTap && $options.handleMarkerTap(...args)),
        "show-location": ""
      }, null, 40, ["latitude", "longitude", "markers"]),
      vue.createElementVNode("view", { class: "search-box" }, [
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            type: "text",
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.keyword = $event),
            placeholder: "搜索地点",
            onConfirm: _cache[3] || (_cache[3] = (...args) => $options.searchLocation && $options.searchLocation(...args))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [
          [vue.vModelText, $data.keyword]
        ])
      ]),
      $data.poiList.length > 0 ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
        key: 0,
        class: "poi-list",
        "scroll-y": ""
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.poiList, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "poi-item",
              key: index,
              onClick: ($event) => $options.selectLocation(item)
            }, [
              vue.createElementVNode(
                "text",
                { class: "name" },
                vue.toDisplayString(item.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "address" },
                vue.toDisplayString(item.address),
                1
                /* TEXT */
              )
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "bottom-bar" }, [
        vue.createElementVNode("button", {
          class: "confirm-btn",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.confirmLocation && $options.confirmLocation(...args)),
          disabled: !$data.selectedLocation
        }, " 确定选择 ", 8, ["disabled"])
      ])
    ]);
  }
  const PagesMapLocation = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "C:/Users/Administrator/Documents/HBuilderProjects/stuff/pages/map/location.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/home/home", PagesHomeHome);
  __definePage("pages/user/user", PagesUserUser);
  __definePage("pages/category/category", PagesCategoryCategory);
  __definePage("pages/item/item", PagesItemItem);
  __definePage("pages/item/detail", PagesItemDetail);
  __definePage("pages/map/location", PagesMapLocation);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("warn", "at App.vue:4", "当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！");
      formatAppLog("log", "at App.vue:5", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:8", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:11", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/Administrator/Documents/HBuilderProjects/stuff/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
