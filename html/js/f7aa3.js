if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === "[object Array]";
  };
}
(function ($) {
  "use strict";
  $(function () {
    $.avia_utilities = $.avia_utilities || {};
    AviaBrowserDetection("html");
    AviaDeviceDetection("html");
    avia_scroll_top_fade();
    aviaCalcContentWidth();
    new $.AviaTooltip({
      class: "avia-search-tooltip",
      data: "avia-search-tooltip",
      event: "click",
      position: "bottom",
      scope: "body",
      attach: "element",
      within_screen: true,
      close_keys: 27,
    });
    new $.AviaTooltip({
      class: "avia-related-tooltip",
      data: "avia-related-tooltip",
      scope: ".related_posts, .av-share-box",
      attach: "element",
      delay: 0,
    });
    new $.AviaAjaxSearch({ scope: "#header, .avia_search_element" });
    if ($.fn.avia_iso_sort) {
      $(".grid-sort-container").avia_iso_sort();
    }
    AviaSidebarShadowHelper();
    $.avia_utilities.avia_ajax_call();
  });
  $.avia_utilities = $.avia_utilities || {};
  $.avia_utilities.avia_ajax_call = function (container) {
    if (typeof container == "undefined") {
      container = "body";
    }
    $("a.avianolink").on("click", function (e) {
      e.preventDefault();
    });
    $("a.aviablank").attr("target", "_blank");
    if ($.fn.avia_activate_lightbox) {
      $(container).avia_activate_lightbox();
    }
    if ($.fn.avia_scrollspy) {
      if (container == "body") {
        $("body").avia_scrollspy({ target: ".main_menu .menu li > a" });
      } else {
        $("body").avia_scrollspy("refresh");
      }
    }
    if ($.fn.avia_smoothscroll) {
      $('a[href*="#"]', container).avia_smoothscroll(container);
    }
    avia_small_fixes(container);
    avia_hover_effect(container);
    avia_iframe_fix(container);
    if ($.fn.avia_html5_activation && $.fn.mediaelementplayer) {
      $(".avia_video, .avia_audio", container).avia_html5_activation({
        ratio: "16:9",
      });
    }
  };
  $.avia_utilities.log = function (text, type, extra) {
    if (typeof console == "undefined") {
      return;
    }
    if (typeof type == "undefined") {
      type = "log";
    }
    type = "AVIA-" + type.toUpperCase();
    console.log("[" + type + "] " + text);
    if (typeof extra != "undefined") {
      console.log(extra);
    }
  };
  function aviaCalcContentWidth() {
    var win = $(window),
      width_select = $("html").is(".html_header_sidebar") ? "#main" : "#header",
      outer = $(width_select),
      outerParent = outer.parents("div").eq(0),
      the_main = $(width_select + " .container").first(),
      css_block = "",
      calc_dimensions = function () {
        var css = "",
          w_12 = Math.round(the_main.width()),
          w_outer = Math.round(outer.width()),
          w_inner = Math.round(outerParent.width());
        css += " #header .three.units{width:" + w_12 * 0.25 + "px;}";
        css += " #header .six.units{width:" + w_12 * 0.5 + "px;}";
        css += " #header .nine.units{width:" + w_12 * 0.75 + "px;}";
        css += " #header .twelve.units{width:" + w_12 + "px;}";
        css +=
          " .av-framed-box .av-layout-tab-inner .container{width:" +
          w_inner +
          "px;}";
        css +=
          " .html_header_sidebar .av-layout-tab-inner .container{width:" +
          w_outer +
          "px;}";
        css +=
          " .boxed .av-layout-tab-inner .container{width:" + w_outer + "px;}";
        css +=
          " .av-framed-box#top .av-submenu-container{width:" + w_inner + "px;}";
        try {
          css_block.text(css);
        } catch (err) {
          css_block.remove();
          var headFirst = $("head").first();
          css_block = $(
            "<style type='text/css' id='av-browser-width-calc'>" +
              css +
              "</style>"
          ).appendTo(headFirst);
        }
      };
    if (
      $(".avia_mega_div").length > 0 ||
      $(".av-layout-tab-inner").length > 0 ||
      $(".av-submenu-container").length > 0
    ) {
      var headFirst = $("head").first();
      css_block = $(
        "<style type='text/css' id='av-browser-width-calc'></style>"
      ).appendTo(headFirst);
      win.on("debouncedresize", calc_dimensions);
      calc_dimensions();
    }
  }
  function AviaSidebarShadowHelper() {
    var $sidebar_container = $(".sidebar_shadow#top #main .sidebar");
    var $content_container = $(".sidebar_shadow .content");
    if ($sidebar_container.height() >= $content_container.height()) {
      $sidebar_container.addClass("av-enable-shadow");
    } else {
      $content_container.addClass("av-enable-shadow");
    }
  }
  function AviaScrollSpy(element, options) {
    var self = this;
    var process = self.process.bind(self),
      refresh = self.refresh.bind(self),
      $element = $(element).is("body") ? $(window) : $(element),
      href;
    self.$body = $("body");
    self.$win = $(window);
    self.options = $.extend({}, $.fn.avia_scrollspy.defaults, options);
    self.selector =
      self.options.target ||
      ((href = $(element).attr("href")) &&
        href.replace(/.*(?=#[^\s]+$)/, "")) ||
      "";
    self.activation_true = false;
    if (self.$body.find(self.selector + "[href*='#']").length) {
      self.$scrollElement = $element.on("scroll.scroll-spy.data-api", process);
      self.$win.on("av-height-change", refresh);
      self.$body.on("av_resize_finished", refresh);
      self.activation_true = true;
      self.checkFirst();
      setTimeout(function () {
        self.refresh();
        self.process();
      }, 100);
    }
  }
  AviaScrollSpy.prototype = {
    constructor: AviaScrollSpy,
    checkFirst: function () {
      var current = window.location.href.split("#")[0],
        matching_link = this.$body
          .find(this.selector + "[href='" + current + "']")
          .attr("href", current + "#top");
    },
    refresh: function () {
      if (!this.activation_true) return;
      var self = this,
        $targets;
      this.offsets = $([]);
      this.targets = $([]);
      $targets = this.$body
        .find(this.selector)
        .map(function () {
          var $el = $(this),
            href = $el.data("target") || $el.attr("href"),
            hash = this.hash,
            hash = hash.replace(/\//g, ""),
            $href = /^#\w/.test(hash) && $(hash);
          var obj = self.$scrollElement.get(0);
          var isWindow = obj != null && obj === obj.window;
          return (
            ($href &&
              $href.length && [
                [
                  $href.position().top +
                    (!isWindow && self.$scrollElement.scrollTop()),
                  href,
                ],
              ]) ||
            null
          );
        })
        .sort(function (a, b) {
          return a[0] - b[0];
        })
        .each(function () {
          self.offsets.push(this[0]);
          self.targets.push(this[1]);
        });
    },
    process: function () {
      if (!this.offsets) return;
      if (isNaN(this.options.offset)) this.options.offset = 0;
      var scrollTop = this.$scrollElement.scrollTop() + this.options.offset,
        scrollHeight =
          this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight,
        maxScroll = scrollHeight - this.$scrollElement.height(),
        offsets = this.offsets,
        targets = this.targets,
        activeTarget = this.activeTarget,
        i;
      if (scrollTop >= maxScroll) {
        return activeTarget != (i = targets.last()[0]) && this.activate(i);
      }
      for (i = offsets.length; i--; ) {
        activeTarget != targets[i] &&
          scrollTop >= offsets[i] &&
          (!offsets[i + 1] || scrollTop <= offsets[i + 1]) &&
          this.activate(targets[i]);
      }
    },
    activate: function (target) {
      var active, selector;
      this.activeTarget = target;
      $(this.selector)
        .parent("." + this.options.applyClass)
        .removeClass(this.options.applyClass);
      selector =
        this.selector +
        '[data-target="' +
        target +
        '"],' +
        this.selector +
        '[href="' +
        target +
        '"]';
      active = $(selector).parent("li").addClass(this.options.applyClass);
      if (active.parent(".sub-menu").length) {
        active = active
          .closest("li.dropdown_ul_available")
          .addClass(this.options.applyClass);
      }
      active.trigger("activate");
    },
  };
  $.fn.avia_scrollspy = function (option) {
    return this.each(function () {
      var $this = $(this),
        data = $this.data("scrollspy"),
        options = typeof option == "object" && option;
      if (!data)
        $this.data("scrollspy", (data = new AviaScrollSpy(this, options)));
      if (typeof option == "string") data[option]();
    });
  };
  $.fn.avia_scrollspy.Constructor = AviaScrollSpy;
  $.fn.avia_scrollspy.calc_offset = function () {
    var offset_1 =
        parseInt($(".html_header_sticky #main").data("scroll-offset"), 10) || 0,
      offset_2 =
        $(
          ".html_header_sticky:not(.html_top_nav_header) #header_main_alternate"
        ).outerHeight() || 0,
      offset_3 =
        $(
          ".html_header_sticky.html_header_unstick_top_disabled #header_meta"
        ).outerHeight() || 0,
      offset_4 = 1,
      offset_5 = parseInt($("html").css("margin-top"), 10) || 0,
      offset_6 = parseInt($(".av-frame-top ").outerHeight(), 10) || 0;
    return offset_1 + offset_2 + offset_3 + offset_4 + offset_5 + offset_6;
  };
  $.fn.avia_scrollspy.defaults = {
    offset: $.fn.avia_scrollspy.calc_offset(),
    applyClass: "current-menu-item",
  };
  function AviaBrowserDetection(outputClassElement) {
    var current_browser = {},
      uaMatch = function (ua) {
        ua = ua.toLowerCase();
        var match =
          /(edge)\/([\w.]+)/.exec(ua) ||
          /(opr)[\/]([\w.]+)/.exec(ua) ||
          /(chrome)[ \/]([\w.]+)/.exec(ua) ||
          /(iemobile)[\/]([\w.]+)/.exec(ua) ||
          /(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(
            ua
          ) ||
          /(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(
            ua
          ) ||
          /(webkit)[ \/]([\w.]+)/.exec(ua) ||
          /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
          /(msie) ([\w.]+)/.exec(ua) ||
          (ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec(ua)) ||
          (ua.indexOf("compatible") < 0 &&
            /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)) ||
          [];
        return {
          browser: match[5] || match[3] || match[1] || "",
          version: match[2] || match[4] || "0",
          versionNumber: match[4] || match[2] || "0",
        };
      };
    var matched = uaMatch(navigator.userAgent);
    if (matched.browser) {
      current_browser.browser = matched.browser;
      current_browser[matched.browser] = true;
      current_browser.version = matched.version;
    }
    if (current_browser.chrome) {
      current_browser.webkit = true;
    } else if (current_browser.webkit) {
      current_browser.safari = true;
    }
    if (typeof current_browser !== "undefined") {
      var bodyclass = "",
        version = current_browser.version
          ? parseInt(current_browser.version)
          : "";
      if (
        current_browser.msie ||
        current_browser.rv ||
        current_browser.iemobile
      ) {
        bodyclass += "avia-msie";
      } else if (current_browser.webkit) {
        bodyclass += "avia-webkit";
      } else if (current_browser.mozilla) {
        bodyclass += "avia-mozilla";
      }
      if (current_browser.version)
        bodyclass += " " + bodyclass + "-" + version + " ";
      if (current_browser.browser)
        bodyclass +=
          " avia-" +
          current_browser.browser +
          " avia-" +
          current_browser.browser +
          "-" +
          version +
          " ";
    }
    if (outputClassElement) {
      $(outputClassElement).addClass(bodyclass);
    }
    return bodyclass;
  }
  function AviaDeviceDetection(outputClassElement) {
    var classes = [];
    $.avia_utilities.isTouchDevice =
      "ontouchstart" in window ||
      (window.DocumentTouch && document instanceof window.DocumentTouch) ||
      navigator.maxTouchPoints > 0 ||
      window.navigator.msMaxTouchPoints > 0;
    classes.push(
      $.avia_utilities.isTouchDevice ? "touch-device" : "no-touch-device"
    );
    $.avia_utilities.pointerDevices = [];
    if (typeof window.matchMedia != "function") {
      $.avia_utilities.pointerDevices.push("undefined");
      classes.push("pointer-device-undefined");
    } else {
      var pointer_fine = false;
      if (window.matchMedia("(any-pointer: fine)")) {
        classes.push("pointer-device-fine");
        $.avia_utilities.pointerDevices.push("fine");
        pointer_fine = true;
      }
      if (window.matchMedia("(any-pointer: coarse)")) {
        classes.push("pointer-device-coarse");
        $.avia_utilities.pointerDevices.push("coarse");
        if (!pointer_fine) {
          classes.push("pointer-device-coarse-only");
        }
      }
      if (!$.avia_utilities.pointerDevices.length) {
        classes.push("pointer-device-none");
        $.avia_utilities.pointerDevices.push("none");
      }
    }
    if ("undefined" == typeof $.avia_utilities.isMobile) {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) &&
        "ontouchstart" in document.documentElement
      ) {
        $.avia_utilities.isMobile = true;
      } else {
        $.avia_utilities.isMobile = false;
      }
    }
    $(outputClassElement).addClass(classes.join(" "));
  }
  $.fn.avia_html5_activation = function (options) {
    var defaults = { ratio: "16:9" };
    var options = $.extend(defaults, options);
    this.each(function () {
      var fv = $(this),
        id_to_apply = "#" + fv.attr("id"),
        posterImg = fv.attr("poster"),
        features = [
          "playpause",
          "progress",
          "current",
          "duration",
          "tracks",
          "volume",
        ],
        container = fv.closest(".avia-video");
      if (
        container.length > 0 &&
        container.hasClass("av-html5-fullscreen-btn")
      ) {
        features.push("fullscreen");
      }
      fv.mediaelementplayer({
        defaultVideoWidth: 480,
        defaultVideoHeight: 270,
        videoWidth: -1,
        videoHeight: -1,
        audioWidth: 400,
        audioHeight: 30,
        startVolume: 0.8,
        loop: false,
        enableAutosize: false,
        features: features,
        alwaysShowControls: false,
        iPadUseNativeControls: false,
        iPhoneUseNativeControls: false,
        AndroidUseNativeControls: false,
        alwaysShowHours: false,
        showTimecodeFrameCount: false,
        framesPerSecond: 25,
        enableKeyboard: true,
        pauseOtherPlayers: false,
        poster: posterImg,
        success: function (mediaElement, domObject, instance) {
          $.AviaVideoAPI.players[fv.attr("id").replace(/_html5/, "")] =
            instance;
          setTimeout(function () {
            if (mediaElement.pluginType == "flash") {
              mediaElement.addEventListener(
                "canplay",
                function () {
                  fv.trigger("av-mediajs-loaded");
                },
                false
              );
            } else {
              fv.trigger("av-mediajs-loaded").addClass("av-mediajs-loaded");
            }
            mediaElement.addEventListener(
              "ended",
              function () {
                fv.trigger("av-mediajs-ended");
              },
              false
            );
            var html5MediaElement = document.getElementById(
              $(mediaElement).attr("id") + "_html5"
            );
            if (html5MediaElement && html5MediaElement !== mediaElement) {
              mediaElement.addEventListener("ended", function () {
                $(html5MediaElement).trigger("av-mediajs-ended");
              });
            }
          }, 10);
        },
        error: function () {},
        keyActions: [],
      });
    });
  };
  function avia_hover_effect(container) {
    if ($.avia_utilities.isMobile) {
      return;
    }
    if ($("body").hasClass("av-disable-avia-hover-effect")) {
      return;
    }
    var overlay = "",
      cssTrans = $.avia_utilities.supports("transition");
    if (container == "body") {
      var elements = $("#main a img")
        .parents("a")
        .not(
          ".noLightbox, .noLightbox a, .avia-gallery-thumb a, .ls-wp-container a, .noHover, .noHover a, .av-logo-container .logo a"
        )
        .add("#main .avia-hover-fx");
    } else {
      var elements = $("a img", container)
        .parents("a")
        .not(
          ".noLightbox, .noLightbox a, .avia-gallery-thumb a, .ls-wp-container a, .noHover, .noHover a, .av-logo-container .logo a"
        )
        .add(".avia-hover-fx", container);
    }
    elements.each(function (e) {
      var link = $(this),
        current = link.find("img").first();
      if (current.hasClass("alignleft"))
        link
          .addClass("alignleft")
          .css({ float: "left", margin: 0, padding: 0 });
      if (current.hasClass("alignright"))
        link
          .addClass("alignright")
          .css({ float: "right", margin: 0, padding: 0 });
      if (current.hasClass("aligncenter"))
        link
          .addClass("aligncenter")
          .css({
            float: "none",
            "text-align": "center",
            margin: 0,
            padding: 0,
          });
      if (current.hasClass("alignnone")) {
        link.addClass("alignnone").css({ margin: 0, padding: 0 });
        if (!link.css("display") || link.css("display") == "inline") {
          link.css({ display: "inline-block" });
        }
      }
      if (!link.css("position") || link.css("position") == "static") {
        link.css({ position: "relative", overflow: "hidden" });
      }
      var url = link.attr("href"),
        span_class = "overlay-type-video",
        opa = link.data("opacity") || 0.7,
        overlay_offset = 5,
        overlay = link.find(".image-overlay");
      if (url) {
        if (url.match(/(jpg|gif|jpeg|png|tif)/))
          span_class = "overlay-type-image";
        if (
          !url.match(
            /(jpg|gif|jpeg|png|\.tif|\.mov|\.swf|vimeo\.com|youtube\.com)/
          )
        )
          span_class = "overlay-type-extern";
      }
      if (!overlay.length) {
        overlay = $(
          "<span class='image-overlay " +
            span_class +
            "'><span class='image-overlay-inside'></span></span>"
        ).appendTo(link);
      }
      link
        .on("mouseenter", function (e) {
          var current = link.find("img").first(),
            _self = current.get(0),
            outerH = current.outerHeight(),
            outerW = current.outerWidth(),
            pos = current.position(),
            linkCss = link.css("display"),
            overlay = link.find(".image-overlay");
          if (outerH > 100) {
            if (!overlay.length) {
              overlay = $(
                "<span class='image-overlay " +
                  span_class +
                  "'><span class='image-overlay-inside'></span></span>"
              ).appendTo(link);
            }
            if (link.height() == 0) {
              link.addClass(_self.className);
              _self.className = "";
            }
            if (!linkCss || linkCss == "inline") {
              link.css({ display: "block" });
            }
            overlay
              .css({
                left:
                  pos.left -
                  overlay_offset +
                  parseInt(current.css("margin-left"), 10),
                top: pos.top + parseInt(current.css("margin-top"), 10),
              })
              .css({
                overflow: "hidden",
                display: "block",
                height: outerH,
                width: outerW + 2 * overlay_offset,
              });
            if (cssTrans === false)
              overlay.stop().animate({ opacity: opa }, 400);
          } else {
            overlay.css({ display: "none" });
          }
        })
        .on("mouseleave", elements, function () {
          if (overlay.length) {
            if (cssTrans === false) overlay.stop().animate({ opacity: 0 }, 400);
          }
        });
    });
  }
  (function ($) {
    $.fn.avia_smoothscroll = function (apply_to_container) {
      if (!this.length) {
        return;
      }
      var the_win = $(window),
        $header = $("#header"),
        $main = $(".html_header_top.html_header_sticky #main").not(
          ".page-template-template-blank-php #main"
        ),
        $meta = $(
          ".html_header_top.html_header_unstick_top_disabled #header_meta"
        ),
        $alt = $(
          ".html_header_top:not(.html_top_nav_header) #header_main_alternate"
        ),
        menu_above_logo = $(".html_header_top.html_top_nav_header"),
        shrink = $(".html_header_top.html_header_shrinking").length,
        frame = $(".av-frame-top"),
        fixedMainPadding = 0,
        isMobile = $.avia_utilities.isMobile,
        sticky_sub = $(".sticky_placeholder").first(),
        calc_main_padding = function () {
          if ($header.css("position") == "fixed") {
            var tempPadding = parseInt($main.data("scroll-offset"), 10) || 0,
              non_shrinking = parseInt($meta.outerHeight(), 10) || 0,
              non_shrinking2 = parseInt($alt.outerHeight(), 10) || 0;
            if (tempPadding > 0 && shrink) {
              tempPadding = tempPadding / 2 + non_shrinking + non_shrinking2;
            } else {
              tempPadding = tempPadding + non_shrinking + non_shrinking2;
            }
            tempPadding += parseInt($("html").css("margin-top"), 10);
            fixedMainPadding = tempPadding;
          } else {
            fixedMainPadding = parseInt($("html").css("margin-top"), 10);
          }
          if (frame.length) {
            fixedMainPadding += frame.height();
          }
          if (menu_above_logo.length) {
            fixedMainPadding =
              $(".html_header_sticky #header_main_alternate").height() +
              parseInt($("html").css("margin-top"), 10);
          }
          if (isMobile) {
            fixedMainPadding = 0;
          }
        };
      if (isMobile) {
        shrink = false;
      }
      calc_main_padding();
      the_win.on("debouncedresize av-height-change", calc_main_padding);
      var hash = window.location.hash.replace(/\//g, "");
      if (
        fixedMainPadding > 0 &&
        hash &&
        apply_to_container == "body" &&
        hash.charAt(1) != "!" &&
        hash.indexOf("=") === -1
      ) {
        var scroll_to_el = $(hash),
          modifier = 0;
        if (scroll_to_el.length) {
          the_win.on("scroll.avia_first_scroll", function () {
            setTimeout(function () {
              if (
                sticky_sub.length &&
                scroll_to_el.offset().top > sticky_sub.offset().top
              ) {
                modifier = sticky_sub.outerHeight() - 3;
              }
              the_win
                .off("scroll.avia_first_scroll")
                .scrollTop(
                  scroll_to_el.offset().top - fixedMainPadding - modifier
                );
            }, 10);
          });
        }
      }
      return this.each(function () {
        $(this).on("click", function (e) {
          var newHash = this.hash.replace(/\//g, ""),
            clicked = $(this),
            data = clicked.data();
          if (
            newHash != "" &&
            newHash != "#" &&
            newHash != "#prev" &&
            newHash != "#next" &&
            !clicked.is(
              ".comment-reply-link, #cancel-comment-reply-link, .no-scroll"
            )
          ) {
            var container = "",
              originHash = "";
            if ("#next-section" == newHash) {
              originHash = newHash;
              var next_containers = clicked
                .parents(".container_wrap")
                .eq(0)
                .nextAll(".container_wrap");
              next_containers.each(function () {
                var cont = $(this);
                if (
                  cont.css("display") == "none" ||
                  cont.css("visibility") == "hidden"
                ) {
                  return;
                }
                container = cont;
                return false;
              });
              if ("object" == typeof container && container.length > 0) {
                newHash = "#" + container.attr("id");
              }
            } else {
              container = $(this.hash.replace(/\//g, ""));
            }
            if (container.length) {
              var cur_offset = the_win.scrollTop(),
                container_offset = container.offset().top,
                target = container_offset - fixedMainPadding,
                hash = window.location.hash,
                hash = hash.replace(/\//g, ""),
                oldLocation = window.location.href.replace(hash, ""),
                newLocation = this,
                duration = data.duration || 1200,
                easing = data.easing || "easeInOutQuint";
              if (
                sticky_sub.length &&
                container_offset > sticky_sub.offset().top
              ) {
                target -= sticky_sub.outerHeight() - 3;
              }
              if (oldLocation + newHash == newLocation || originHash) {
                if (cur_offset != target) {
                  if (!(cur_offset == 0 && target <= 0)) {
                    the_win.trigger("avia_smooth_scroll_start");
                    $("html:not(:animated),body:not(:animated)").animate(
                      { scrollTop: target },
                      duration,
                      easing,
                      function () {
                        if (window.history.replaceState) {
                          window.history.replaceState("", "", newHash);
                        }
                      }
                    );
                  }
                }
                e.preventDefault();
              }
            }
          }
        });
      });
    };
  })(jQuery);
  function avia_iframe_fix(container) {
    var iframe = jQuery(
        'iframe[src*="youtube.com"]:not(.av_youtube_frame)',
        container
      ),
      youtubeEmbed = jQuery(
        'iframe[src*="youtube.com"]:not(.av_youtube_frame) object, iframe[src*="youtube.com"]:not(.av_youtube_frame) embed',
        container
      ).attr("wmode", "opaque");
    iframe.each(function () {
      var current = jQuery(this),
        src = current.attr("src");
      if (src) {
        if (src.indexOf("?") !== -1) {
          src += "&wmode=opaque&rel=0";
        } else {
          src += "?wmode=opaque&rel=0";
        }
        current.attr("src", src);
      }
    });
  }
  function avia_small_fixes(container) {
    if (!container) container = document;
    var win = jQuery(window),
      iframes = jQuery(
        ".avia-iframe-wrap iframe:not(.avia-slideshow iframe):not( iframe.no_resize):not(.avia-video iframe)",
        container
      ),
      adjust_iframes = function () {
        iframes.each(function () {
          var iframe = jQuery(this),
            parent = iframe.parent(),
            proportions = 56.25;
          if (this.width && this.height) {
            proportions = (100 / this.width) * this.height;
            parent.css({ "padding-bottom": proportions + "%" });
          }
        });
      };
    adjust_iframes();
  }
  function avia_scroll_top_fade() {
    var win = $(window),
      timeo = false,
      scroll_top = $("#scroll-top-link"),
      set_status = function () {
        var st = win.scrollTop();
        if (st < 500) {
          scroll_top.removeClass("avia_pop_class");
        } else if (!scroll_top.is(".avia_pop_class")) {
          scroll_top.addClass("avia_pop_class");
        }
      };
    win.on("scroll", function () {
      window.requestAnimationFrame(set_status);
    });
    set_status();
  }
  $.AviaAjaxSearch = function (options) {
    var defaults = { delay: 300, minChars: 3, scope: "body" };
    this.options = $.extend({}, defaults, options);
    this.scope = $(this.options.scope);
    this.timer = false;
    this.lastVal = "";
    this.bind_events();
  };
  $.AviaAjaxSearch.prototype = {
    bind_events: function () {
      this.scope.on(
        "keyup",
        '#s:not(".av_disable_ajax_search #s")',
        this.try_search.bind(this)
      );
      this.scope.on("click", "#s.av-results-parked", this.reset.bind(this));
    },
    try_search: function (e) {
      var form = $(e.currentTarget).parents("form").eq(0),
        resultscontainer = form.find(".ajax_search_response");
      clearTimeout(this.timer);
      if (e.keyCode === 27) {
        this.reset(e);
        return;
      }
      if (
        e.currentTarget.value.length >= this.options.minChars &&
        this.lastVal != e.currentTarget.value.trim()
      ) {
        this.timer = setTimeout(
          this.do_search.bind(this, e),
          this.options.delay
        );
      } else if (e.currentTarget.value.length == 0) {
        this.timer = setTimeout(this.reset.bind(this, e), this.options.delay);
      }
    },
    reset: function (e) {
      var form = $(e.currentTarget).parents("form").eq(0),
        resultscontainer = form.find(".ajax_search_response"),
        alternative_resultscontainer = $(form.attr("data-ajaxcontainer")).find(
          ".ajax_search_response"
        ),
        searchInput = $(e.currentTarget);
      if ($(e.currentTarget).hasClass("av-results-parked")) {
        resultscontainer.show();
        alternative_resultscontainer.show();
        $("body > .ajax_search_response").show();
      } else {
        resultscontainer.remove();
        alternative_resultscontainer.remove();
        searchInput.val("");
        $("body > .ajax_search_response").remove();
      }
    },
    do_search: function (e) {
      var obj = this,
        currentField = $(e.currentTarget).attr("autocomplete", "off"),
        currentFieldWrapper = $(e.currentTarget)
          .parents(".av_searchform_wrapper")
          .eq(0),
        currentField_position = currentFieldWrapper.offset(),
        currentField_width = currentFieldWrapper.outerWidth(),
        currentField_height = currentFieldWrapper.outerHeight(),
        form = currentField.parents("form").eq(0),
        submitbtn = form.find("#searchsubmit"),
        resultscontainer = form,
        results = resultscontainer.find(".ajax_search_response"),
        loading = $(
          '<div class="ajax_load"><span class="ajax_load_inner"></span></div>'
        ),
        action = form.attr("action"),
        values = form.serialize(),
        elementID = form.data("element_id"),
        custom_color = form.data("custom_color");
      values += "&action=avia_ajax_search";
      if (!results.length) {
        results = $(
          '<div class="ajax_search_response" style="display:none;"></div>'
        );
      }
      if ("undefined" != typeof elementID) {
        results.addClass(elementID);
      }
      if ("undefined" != typeof custom_color && custom_color != "") {
        results.addClass("av_has_custom_color");
      }
      if (form.attr("id") == "searchform_element") {
        results.addClass("av_searchform_element_results");
      }
      if (action.indexOf("?") != -1) {
        action = action.split("?");
        values += "&" + action[1];
      }
      if (form.attr("data-ajaxcontainer")) {
        var rescon = form.attr("data-ajaxcontainer");
        if ($(rescon).length) {
          $(rescon).find(".ajax_search_response").remove();
          resultscontainer = $(rescon);
        }
      }
      results_css = {};
      if (form.hasClass("av_results_container_fixed")) {
        $("body").find(".ajax_search_response").remove();
        resultscontainer = $("body");
        var results_css = {
          top: currentField_position.top + currentField_height,
          left: currentField_position.left,
          width: currentField_width,
        };
        results.addClass("main_color");
        $(window).resize(function () {
          results.remove();
          this.reset.bind(this);
          currentField.val("");
        });
      }
      if (form.attr("data-results_style")) {
        var results_style = JSON.parse(form.attr("data-results_style"));
        results_css = Object.assign(results_css, results_style);
        if ("color" in results_css) {
          results.addClass("av_has_custom_color");
        }
      }
      results.css(results_css);
      if (resultscontainer.hasClass("avia-section")) {
        results.addClass("container");
      }
      results.appendTo(resultscontainer);
      if (
        results.find(".ajax_not_found").length &&
        e.currentTarget.value.indexOf(this.lastVal) != -1
      ) {
        return;
      }
      this.lastVal = e.currentTarget.value;
      $.ajax({
        url: avia_framework_globals.ajaxurl,
        type: "POST",
        data: values,
        beforeSend: function () {
          loading.insertAfter(submitbtn);
          form.addClass("ajax_loading_now");
        },
        success: function (response) {
          if (response == 0) {
            response = "";
          }
          results.html(response).show();
        },
        complete: function () {
          loading.remove();
          form.removeClass("ajax_loading_now");
        },
      });
      $(document).on("click", function (e) {
        if (!$(e.target).closest(form).length) {
          if ($(results).is(":visible")) {
            $(results).hide();
            currentField.addClass("av-results-parked");
          }
        }
      });
    },
  };
  $.AviaTooltip = function (options) {
    var defaults = {
      delay: 1500,
      delayOut: 300,
      delayHide: 0,
      class: "avia-tooltip",
      scope: "body",
      data: "avia-tooltip",
      attach: "body",
      event: "mouseenter",
      position: "top",
      extraClass: "avia-tooltip-class",
      permanent: false,
      within_screen: false,
      close_keys: null,
    };
    this.options = $.extend({}, defaults, options);
    var close_keys = "";
    if (this.options.close_keys != null) {
      if (!Array.isArray(this.options.close_keys)) {
        this.options.close_keys = [this.options.close_keys];
      }
      close_keys =
        ' data-close-keys="' + this.options.close_keys.join(",") + '" ';
    }
    this.body = $("body");
    this.scope = $(this.options.scope);
    this.tooltip = $(
      '<div class="' +
        this.options["class"] +
        ' avia-tt"' +
        close_keys +
        '><span class="avia-arrow-wrap"><span class="avia-arrow"></span></span></div>'
    );
    this.inner = $('<div class="inner_tooltip"></div>').prependTo(this.tooltip);
    this.open = false;
    this.timer = false;
    this.active = false;
    this.bind_events();
  };
  $.AviaTooltip.openTTs = [];
  $.AviaTooltip.openTT_Elements = [];
  $.AviaTooltip.prototype = {
    bind_events: function () {
      var perma_tooltips =
          ".av-permanent-tooltip [data-" + this.options.data + "]",
        default_tooltips =
          "[data-" +
          this.options.data +
          "]:not( .av-permanent-tooltip [data-" +
          this.options.data +
          "])";
      this.scope.on(
        "av_permanent_show",
        perma_tooltips,
        this.display_tooltip.bind(this)
      );
      $(perma_tooltips)
        .addClass("av-perma-tooltip")
        .trigger("av_permanent_show");
      this.scope.on(
        this.options.event + " mouseleave",
        default_tooltips,
        this.start_countdown.bind(this)
      );
      if (this.options.event != "click") {
        this.scope.on(
          "mouseleave",
          default_tooltips,
          this.hide_tooltip.bind(this)
        );
        this.scope.on(
          "click",
          default_tooltips,
          this.hide_on_click_tooltip.bind(this)
        );
      } else {
        this.body.on("mousedown", this.hide_tooltip.bind(this));
      }
      if (this.options.close_keys != null) {
        this.body.on("keyup", this.close_on_keyup.bind(this));
      }
    },
    start_countdown: function (e) {
      clearTimeout(this.timer);
      var target = this.options.event == "click" ? e.target : e.currentTarget,
        element = $(target);
      if (e.type == this.options.event) {
        var delay =
          this.options.event == "click"
            ? 0
            : this.open
            ? 0
            : this.options.delay;
        this.timer = setTimeout(this.display_tooltip.bind(this, e), delay);
      } else if (e.type == "mouseleave") {
        if (!element.hasClass("av-close-on-click-tooltip")) {
          this.timer = setTimeout(
            this.stop_instant_open.bind(this, e),
            this.options.delayOut
          );
        }
      }
      e.preventDefault();
    },
    reset_countdown: function (e) {
      clearTimeout(this.timer);
      this.timer = false;
    },
    display_tooltip: function (e) {
      var _self = this,
        target = this.options.event == "click" ? e.target : e.currentTarget,
        element = $(target),
        text = element.data(this.options.data),
        tip_index = element.data("avia-created-tooltip"),
        extraClass = element.data("avia-tooltip-class"),
        attach = this.options.attach == "element" ? element : this.body,
        offset =
          this.options.attach == "element"
            ? element.position()
            : element.offset(),
        position = element.data("avia-tooltip-position"),
        align = element.data("avia-tooltip-alignment"),
        force_append = false,
        newTip = false,
        is_new_tip = false;
      text = "string" == typeof text ? text.trim() : "";
      if (element.is(".av-perma-tooltip")) {
        offset = { top: 0, left: 0 };
        attach = element;
        force_append = true;
      }
      if (text == "") {
        return;
      }
      if (position == "" || typeof position == "undefined") {
        position = this.options.position;
      }
      if (align == "" || typeof align == "undefined") {
        align = "center";
      }
      if (typeof tip_index != "undefined") {
        newTip = $.AviaTooltip.openTTs[tip_index];
      } else {
        this.inner.html(text);
        newTip = this.tooltip.clone();
        is_new_tip = true;
        if (this.options.attach == "element" && force_append !== true) {
          newTip.insertAfter(attach);
        } else {
          newTip.appendTo(attach);
        }
        if (extraClass != "") {
          newTip.addClass(extraClass);
        }
      }
      if (this.open && this.active == newTip) {
        return;
      }
      if (element.hasClass("av-close-on-click-tooltip")) {
        this.hide_all_tooltips();
      }
      this.open = true;
      this.active = newTip;
      if (
        (newTip.is(":animated:visible") && e.type == "click") ||
        element.is("." + this.options["class"]) ||
        element.parents("." + this.options["class"]).length != 0
      ) {
        return;
      }
      var animate1 = {},
        animate2 = {},
        pos1 = "",
        pos2 = "";
      if (position == "top" || position == "bottom") {
        switch (align) {
          case "left":
            pos2 = offset.left;
            break;
          case "right":
            pos2 = offset.left + element.outerWidth() - newTip.outerWidth();
            break;
          default:
            pos2 =
              offset.left + element.outerWidth() / 2 - newTip.outerWidth() / 2;
            break;
        }
        if (_self.options.within_screen) {
          var boundary =
            element.offset().left +
            element.outerWidth() / 2 -
            newTip.outerWidth() / 2 +
            parseInt(newTip.css("margin-left"), 10);
          if (boundary < 0) {
            pos2 = pos2 - boundary;
          }
        }
      } else {
        switch (align) {
          case "top":
            pos1 = offset.top;
            break;
          case "bottom":
            pos1 = offset.top + element.outerHeight() - newTip.outerHeight();
            break;
          default:
            pos1 =
              offset.top + element.outerHeight() / 2 - newTip.outerHeight() / 2;
            break;
        }
      }
      switch (position) {
        case "top":
          pos1 = offset.top - newTip.outerHeight();
          animate1 = { top: pos1 - 10, left: pos2 };
          animate2 = { top: pos1 };
          break;
        case "bottom":
          pos1 = offset.top + element.outerHeight();
          animate1 = { top: pos1 + 10, left: pos2 };
          animate2 = { top: pos1 };
          break;
        case "left":
          pos2 = offset.left - newTip.outerWidth();
          animate1 = { top: pos1, left: pos2 - 10 };
          animate2 = { left: pos2 };
          break;
        case "right":
          pos2 = offset.left + element.outerWidth();
          animate1 = { top: pos1, left: pos2 + 10 };
          animate2 = { left: pos2 };
          break;
      }
      animate1["display"] = "block";
      animate1["opacity"] = 0;
      animate2["opacity"] = 1;
      newTip.css(animate1).stop().animate(animate2, 200);
      newTip.find("input, textarea").trigger("focus");
      if (is_new_tip) {
        $.AviaTooltip.openTTs.push(newTip);
        $.AviaTooltip.openTT_Elements.push(element);
        element.data("avia-created-tooltip", $.AviaTooltip.openTTs.length - 1);
      }
    },
    hide_on_click_tooltip: function (e) {
      if (this.options.event == "click") {
        return;
      }
      var element = $(e.currentTarget);
      if (!element.hasClass("av-close-on-click-tooltip")) {
        return;
      }
      if (!element.find("a")) {
        e.preventDefault();
      }
      var ttip_index = element.data("avia-created-tooltip");
      if ("undefined" != typeof ttip_index) {
        var current = $.AviaTooltip.openTTs[ttip_index];
        if ("undefined" != typeof current && current == this.active) {
          this.hide_all_tooltips();
        }
      }
    },
    close_on_keyup: function (e) {
      if (this.options.close_keys == null) {
        return;
      }
      if ($.inArray(e.keyCode, this.options.close_keys) < 0) {
        return;
      }
      this.hide_all_tooltips(e.keyCode);
    },
    hide_all_tooltips: function (keyCode) {
      var ttip,
        position,
        element,
        keyCodeCheck = "undefined" != typeof keyCode ? keyCode + "" : null;
      for (var index = 0; index < $.AviaTooltip.openTTs.length; ++index) {
        ttip = $.AviaTooltip.openTTs[index];
        element = $.AviaTooltip.openTT_Elements[index];
        position = element.data("avia-tooltip-position");
        if (keyCodeCheck != null) {
          var keys = ttip.data("close-keys");
          if ("undefined" == typeof keys) {
            continue;
          }
          keys = keys + "";
          keys = keys.split(",");
          if ($.inArray(keyCodeCheck, keys) < 0) {
            continue;
          }
        }
        this.animate_hide_tooltip(ttip, position);
      }
      this.open = false;
      this.active = false;
    },
    hide_tooltip: function (e) {
      var element = $(e.currentTarget),
        newTip,
        animateTo,
        position = element.data("avia-tooltip-position"),
        align = element.data("avia-tooltip-alignment"),
        newTip = false;
      if (position == "" || typeof position == "undefined") {
        position = this.options.position;
      }
      if (align == "" || typeof align == "undefined") {
        align = "center";
      }
      if (this.options.event == "click") {
        element = $(e.target);
        if (
          !element.is("." + this.options["class"]) &&
          element.parents("." + this.options["class"]).length == 0
        ) {
          if (this.active.length) {
            newTip = this.active;
            this.active = false;
          }
        }
      } else {
        if (!element.hasClass("av-close-on-click-tooltip")) {
          newTip = element.data("avia-created-tooltip");
          newTip =
            typeof newTip != "undefined"
              ? $.AviaTooltip.openTTs[newTip]
              : false;
        }
      }
      this.animate_hide_tooltip(newTip, position);
    },
    animate_hide_tooltip: function (ttip, position) {
      if (ttip) {
        var animate = { opacity: 0 };
        switch (position) {
          case "top":
            animate["top"] = parseInt(ttip.css("top"), 10) - 10;
            break;
          case "bottom":
            animate["top"] = parseInt(ttip.css("top"), 10) + 10;
            break;
          case "left":
            animate["left"] = parseInt(ttip.css("left"), 10) - 10;
            break;
          case "right":
            animate["left"] = parseInt(ttip.css("left"), 10) + 10;
            break;
        }
        ttip.animate(animate, 200, function () {
          ttip.css({ display: "none" });
        });
      }
    },
    stop_instant_open: function (e) {
      this.open = false;
    },
  };
})(jQuery);
/*!
Waypoints - 4.0.2
Copyright © 2011-2016 Caleb Troughton (up to 4.0.1)
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
!(function () {
  "use strict";
  function t(o) {
    if (!o) throw new Error("No options passed to Waypoint constructor");
    if (!o.element)
      throw new Error("No element option passed to Waypoint constructor");
    if (!o.handler)
      throw new Error("No handler option passed to Waypoint constructor");
    (this.key = "waypoint-" + e),
      (this.options = t.Adapter.extend({}, t.defaults, o)),
      (this.element = this.options.element),
      (this.adapter = new t.Adapter(this.element)),
      (this.callback = o.handler),
      (this.axis = this.options.horizontal ? "horizontal" : "vertical"),
      (this.enabled = this.options.enabled),
      (this.triggerPoint = null),
      (this.group = t.Group.findOrCreate({
        name: this.options.group,
        axis: this.axis,
      })),
      (this.context = t.Context.findOrCreateByElement(this.options.context)),
      t.offsetAliases[this.options.offset] &&
        (this.options.offset = t.offsetAliases[this.options.offset]),
      this.group.add(this),
      this.context.add(this),
      (i[this.key] = this),
      (e += 1);
  }
  var e = 0,
    i = {};
  (t.prototype.queueTrigger = function (t) {
    this.group.queueTrigger(this, t);
  }),
    (t.prototype.trigger = function (t) {
      this.enabled && this.callback && this.callback.apply(this, t);
    }),
    (t.prototype.destroy = function () {
      this.context.remove(this), this.group.remove(this), delete i[this.key];
    }),
    (t.prototype.disable = function () {
      return (this.enabled = !1), this;
    }),
    (t.prototype.enable = function () {
      return this.context.refresh(), (this.enabled = !0), this;
    }),
    (t.prototype.next = function () {
      return this.group.next(this);
    }),
    (t.prototype.previous = function () {
      return this.group.previous(this);
    }),
    (t.invokeAll = function (t) {
      var e = [];
      for (var o in i) e.push(i[o]);
      for (var n = 0, r = e.length; r > n; n++) e[n][t]();
    }),
    (t.destroyAll = function () {
      t.invokeAll("destroy");
    }),
    (t.disableAll = function () {
      t.invokeAll("disable");
    }),
    (t.enableAll = function () {
      t.Context.refreshAll();
      for (var e in i) i[e].enabled = !0;
      return this;
    }),
    (t.refreshAll = function () {
      t.Context.refreshAll();
    }),
    (t.viewportHeight = function () {
      return window.innerHeight || document.documentElement.clientHeight;
    }),
    (t.viewportWidth = function () {
      return document.documentElement.clientWidth;
    }),
    (t.adapters = []),
    (t.defaults = {
      context: window,
      continuous: !0,
      enabled: !0,
      group: "default",
      horizontal: !1,
      offset: 0,
    }),
    (t.offsetAliases = {
      "bottom-in-view": function () {
        return this.context.innerHeight() - this.adapter.outerHeight();
      },
      "right-in-view": function () {
        return this.context.innerWidth() - this.adapter.outerWidth();
      },
    }),
    (window.Waypoint = t);
})(),
  (function () {
    "use strict";
    function t(t) {
      window.setTimeout(t, 1e3 / 60);
    }
    function e(t) {
      (this.element = t),
        (this.Adapter = n.Adapter),
        (this.adapter = new this.Adapter(t)),
        (this.key = "waypoint-context-" + i),
        (this.didScroll = !1),
        (this.didResize = !1),
        (this.oldScroll = {
          x: this.adapter.scrollLeft(),
          y: this.adapter.scrollTop(),
        }),
        (this.waypoints = { vertical: {}, horizontal: {} }),
        (t.waypointContextKey = this.key),
        (o[t.waypointContextKey] = this),
        (i += 1),
        n.windowContext ||
          ((n.windowContext = !0), (n.windowContext = new e(window))),
        this.createThrottledScrollHandler(),
        this.createThrottledResizeHandler();
    }
    var i = 0,
      o = {},
      n = window.Waypoint,
      r = window.onload;
    (e.prototype.add = function (t) {
      var e = t.options.horizontal ? "horizontal" : "vertical";
      (this.waypoints[e][t.key] = t), this.refresh();
    }),
      (e.prototype.checkEmpty = function () {
        var t = this.Adapter.isEmptyObject(this.waypoints.horizontal),
          e = this.Adapter.isEmptyObject(this.waypoints.vertical),
          i = this.element == this.element.window;
        t && e && !i && (this.adapter.off(".waypoints"), delete o[this.key]);
      }),
      (e.prototype.createThrottledResizeHandler = function () {
        function t() {
          e.handleResize(), (e.didResize = !1);
        }
        var e = this;
        this.adapter.on("resize.waypoints", function () {
          e.didResize || ((e.didResize = !0), n.requestAnimationFrame(t));
        });
      }),
      (e.prototype.createThrottledScrollHandler = function () {
        function t() {
          e.handleScroll(), (e.didScroll = !1);
        }
        var e = this;
        this.adapter.on("scroll.waypoints", function () {
          (!e.didScroll || n.isTouch) &&
            ((e.didScroll = !0), n.requestAnimationFrame(t));
        });
      }),
      (e.prototype.handleResize = function () {
        n.Context.refreshAll();
      }),
      (e.prototype.handleScroll = function () {
        var t = {},
          e = {
            horizontal: {
              newScroll: this.adapter.scrollLeft(),
              oldScroll: this.oldScroll.x,
              forward: "right",
              backward: "left",
            },
            vertical: {
              newScroll: this.adapter.scrollTop(),
              oldScroll: this.oldScroll.y,
              forward: "down",
              backward: "up",
            },
          };
        for (var i in e) {
          var o = e[i],
            n = o.newScroll > o.oldScroll,
            r = n ? o.forward : o.backward;
          for (var s in this.waypoints[i]) {
            var a = this.waypoints[i][s];
            if (null !== a.triggerPoint) {
              var l = o.oldScroll < a.triggerPoint,
                h = o.newScroll >= a.triggerPoint,
                p = l && h,
                u = !l && !h;
              (p || u) && (a.queueTrigger(r), (t[a.group.id] = a.group));
            }
          }
        }
        for (var c in t) t[c].flushTriggers();
        this.oldScroll = { x: e.horizontal.newScroll, y: e.vertical.newScroll };
      }),
      (e.prototype.innerHeight = function () {
        return this.element == this.element.window
          ? n.viewportHeight()
          : this.adapter.innerHeight();
      }),
      (e.prototype.remove = function (t) {
        delete this.waypoints[t.axis][t.key], this.checkEmpty();
      }),
      (e.prototype.innerWidth = function () {
        return this.element == this.element.window
          ? n.viewportWidth()
          : this.adapter.innerWidth();
      }),
      (e.prototype.destroy = function () {
        var t = [];
        for (var e in this.waypoints)
          for (var i in this.waypoints[e]) t.push(this.waypoints[e][i]);
        for (var o = 0, n = t.length; n > o; o++) t[o].destroy();
      }),
      (e.prototype.refresh = function () {
        var t,
          e = this.element == this.element.window,
          i = e ? void 0 : this.adapter.offset(),
          o = {};
        this.handleScroll(),
          (t = {
            horizontal: {
              contextOffset: e ? 0 : i.left,
              contextScroll: e ? 0 : this.oldScroll.x,
              contextDimension: this.innerWidth(),
              oldScroll: this.oldScroll.x,
              forward: "right",
              backward: "left",
              offsetProp: "left",
            },
            vertical: {
              contextOffset: e ? 0 : i.top,
              contextScroll: e ? 0 : this.oldScroll.y,
              contextDimension: this.innerHeight(),
              oldScroll: this.oldScroll.y,
              forward: "down",
              backward: "up",
              offsetProp: "top",
            },
          });
        for (var r in t) {
          var s = t[r];
          for (var a in this.waypoints[r]) {
            var l,
              h,
              p,
              u,
              c,
              d = this.waypoints[r][a],
              f = d.options.offset,
              w = d.triggerPoint,
              y = 0,
              g = null == w;
            d.element !== d.element.window &&
              (y = d.adapter.offset()[s.offsetProp]),
              "function" == typeof f
                ? (f = f.apply(d))
                : "string" == typeof f &&
                  ((f = parseFloat(f)),
                  d.options.offset.indexOf("%") > -1 &&
                    (f = Math.ceil((s.contextDimension * f) / 100))),
              (l = s.contextScroll - s.contextOffset),
              (d.triggerPoint = Math.floor(y + l - f)),
              (h = w < s.oldScroll),
              (p = d.triggerPoint >= s.oldScroll),
              (u = h && p),
              (c = !h && !p),
              !g && u
                ? (d.queueTrigger(s.backward), (o[d.group.id] = d.group))
                : !g && c
                ? (d.queueTrigger(s.forward), (o[d.group.id] = d.group))
                : g &&
                  s.oldScroll >= d.triggerPoint &&
                  (d.queueTrigger(s.forward), (o[d.group.id] = d.group));
          }
        }
        return (
          n.requestAnimationFrame(function () {
            for (var t in o) o[t].flushTriggers();
          }),
          this
        );
      }),
      (e.findOrCreateByElement = function (t) {
        return e.findByElement(t) || new e(t);
      }),
      (e.refreshAll = function () {
        for (var t in o) o[t].refresh();
      }),
      (e.findByElement = function (t) {
        return o[t.waypointContextKey];
      }),
      (window.onload = function () {
        r && r(), e.refreshAll();
      }),
      (n.requestAnimationFrame = function (e) {
        var i =
          window.requestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          t;
        i.call(window, e);
      }),
      (n.Context = e);
  })(),
  (function () {
    "use strict";
    function t(t, e) {
      return t.triggerPoint - e.triggerPoint;
    }
    function e(t, e) {
      return e.triggerPoint - t.triggerPoint;
    }
    function i(t) {
      (this.name = t.name),
        (this.axis = t.axis),
        (this.id = this.name + "-" + this.axis),
        (this.waypoints = []),
        this.clearTriggerQueues(),
        (o[this.axis][this.name] = this);
    }
    var o = { vertical: {}, horizontal: {} },
      n = window.Waypoint;
    (i.prototype.add = function (t) {
      this.waypoints.push(t);
    }),
      (i.prototype.clearTriggerQueues = function () {
        this.triggerQueues = { up: [], down: [], left: [], right: [] };
      }),
      (i.prototype.flushTriggers = function () {
        for (var i in this.triggerQueues) {
          var o = this.triggerQueues[i],
            n = "up" === i || "left" === i;
          o.sort(n ? e : t);
          for (var r = 0, s = o.length; s > r; r += 1) {
            var a = o[r];
            (a.options.continuous || r === o.length - 1) && a.trigger([i]);
          }
        }
        this.clearTriggerQueues();
      }),
      (i.prototype.next = function (e) {
        this.waypoints.sort(t);
        var i = n.Adapter.inArray(e, this.waypoints),
          o = i === this.waypoints.length - 1;
        return o ? null : this.waypoints[i + 1];
      }),
      (i.prototype.previous = function (e) {
        this.waypoints.sort(t);
        var i = n.Adapter.inArray(e, this.waypoints);
        return i ? this.waypoints[i - 1] : null;
      }),
      (i.prototype.queueTrigger = function (t, e) {
        this.triggerQueues[e].push(t);
      }),
      (i.prototype.remove = function (t) {
        var e = n.Adapter.inArray(t, this.waypoints);
        e > -1 && this.waypoints.splice(e, 1);
      }),
      (i.prototype.first = function () {
        return this.waypoints[0];
      }),
      (i.prototype.last = function () {
        return this.waypoints[this.waypoints.length - 1];
      }),
      (i.findOrCreate = function (t) {
        return o[t.axis][t.name] || new i(t);
      }),
      (n.Group = i);
  })(),
  (function () {
    "use strict";
    function t(t) {
      this.$element = e(t);
    }
    var e = window.jQuery,
      i = window.Waypoint;
    e.each(
      [
        "innerHeight",
        "innerWidth",
        "off",
        "offset",
        "on",
        "outerHeight",
        "outerWidth",
        "scrollLeft",
        "scrollTop",
      ],
      function (e, i) {
        t.prototype[i] = function () {
          var t = Array.prototype.slice.call(arguments);
          return this.$element[i].apply(this.$element, t);
        };
      }
    ),
      e.each(["extend", "inArray", "isEmptyObject"], function (i, o) {
        t[o] = e[o];
      }),
      i.adapters.push({ name: "jquery", Adapter: t }),
      (i.Adapter = t);
  })(),
  (function () {
    "use strict";
    function t(t) {
      return function () {
        var i = [],
          o = arguments[0];
        return (
          "function" === typeof arguments[0] &&
            ((o = t.extend({}, arguments[1])), (o.handler = arguments[0])),
          this.each(function () {
            var n = t.extend({}, o, { element: this });
            "string" == typeof n.context &&
              (n.context = t(this).closest(n.context)[0]),
              i.push(new e(n));
          }),
          i
        );
      };
    }
    var e = window.Waypoint;
    window.jQuery && (window.jQuery.fn.waypoint = t(window.jQuery)),
      window.Zepto && (window.Zepto.fn.waypoint = t(window.Zepto));
  })();
(function () {
  var lastTime = 0;
  var vendors = ["ms", "moz", "webkit", "o"];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vendors[x] + "CancelAnimationFrame"] ||
      window[vendors[x] + "CancelRequestAnimationFrame"];
  }
  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
})();
jQuery.expr.pseudos.regex = function (elem, index, match) {
  var matchParams = match[3].split(","),
    validLabels = /^(data|css):/,
    attr = {
      method: matchParams[0].match(validLabels)
        ? matchParams[0].split(":")[0]
        : "attr",
      property: matchParams.shift().replace(validLabels, ""),
    },
    regexFlags = "ig",
    regex = new RegExp(
      matchParams.join("").replace(/^\s+|\s+$/g, ""),
      regexFlags
    );
  return regex.test(jQuery(elem)[attr.method](attr.property));
};
(function ($) {
  "use strict";
  $(function () {
    $.avia_utilities = $.avia_utilities || {};
    if ("undefined" == typeof $.avia_utilities.isMobile) {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) &&
        "ontouchstart" in document.documentElement
      ) {
        $.avia_utilities.isMobile = true;
      } else {
        $.avia_utilities.isMobile = false;
      }
    }
    if ($.fn.avia_mobile_fixed) {
      $(".avia-bg-style-fixed").avia_mobile_fixed();
    }
    if ($.fn.avia_browser_height) {
      $(
        ".av-minimum-height, .avia-fullscreen-slider, .av-cell-min-height"
      ).avia_browser_height();
    }
    if ($.fn.avia_container_height) {
      $(".av-column-min-height-pc").avia_container_height();
    }
    if ($.fn.avia_video_section) {
      $(".av-section-with-video-bg").avia_video_section();
    }
    new $.AviaTooltip({
      class: "avia-tooltip",
      data: "avia-tooltip",
      delay: 0,
      scope: "body",
    });
    new $.AviaTooltip({
      class: "avia-tooltip avia-icon-tooltip",
      data: "avia-icon-tooltip",
      delay: 0,
      scope: "body",
    });
    $.avia_utilities.activate_shortcode_scripts();
    if ($.fn.layer_slider_height_helper) {
      $(".avia-layerslider").layer_slider_height_helper();
    }
    if ($.fn.avia_portfolio_preview) {
      $(".grid-links-ajax").avia_portfolio_preview();
    }
    if ($.fn.avia_masonry) {
      $(".av-masonry").avia_masonry();
    }
    if ($.fn.aviaccordion) {
      $(".aviaccordion").aviaccordion();
    }
    if ($.fn.avia_textrotator) {
      $(".av-rotator-container").avia_textrotator();
    }
    if ($.fn.avia_sc_tab_section) {
      $(".av-tab-section-container").avia_sc_tab_section();
    }
    if ($.fn.avia_hor_gallery) {
      $(".av-horizontal-gallery").avia_hor_gallery();
    }
    if ($.fn.avia_link_column) {
      $(".avia-link-column").avia_link_column();
    }
    if ($.fn.avia_delayed_animation_in_container) {
      $(".av-animation-delay-container").avia_delayed_animation_in_container();
    }
  });
  $.avia_utilities = $.avia_utilities || {};
  $.avia_utilities.activate_shortcode_scripts = function (container) {
    if (typeof container == "undefined") {
      container = "body";
    }
    if ($.fn.avia_ajax_form) {
      $(
        ".avia_ajax_form:not( .avia-disable-default-ajax )",
        container
      ).avia_ajax_form();
    }
    activate_waypoints(container);
    if ($.fn.aviaVideoApi) {
      $(
        '.avia-slideshow iframe[src*="youtube.com"], .av_youtube_frame, .av_vimeo_frame, .avia-slideshow video'
      ).aviaVideoApi({}, "li");
    }
    if ($.fn.avia_sc_toggle) {
      $(".togglecontainer", container).avia_sc_toggle();
    }
    if ($.fn.avia_sc_tabs) {
      $(".top_tab", container).avia_sc_tabs();
      $(".sidebar_tab", container).avia_sc_tabs({ sidebar: true });
    }
    if ($.fn.avia_sc_gallery) {
      $(".avia-gallery", container).avia_sc_gallery();
    }
    if ($.fn.avia_sc_animated_number) {
      $(".avia-animated-number", container).avia_sc_animated_number();
    }
    if ($.fn.avia_sc_animation_delayed) {
      $(".av_font_icon", container).avia_sc_animation_delayed({ delay: 100 });
      $(".avia-image-container", container).avia_sc_animation_delayed({
        delay: 100,
      });
      $(".av-hotspot-image-container", container).avia_sc_animation_delayed({
        delay: 100,
      });
      $(".av-animated-generic", container).avia_sc_animation_delayed({
        delay: 100,
      });
      $(".av-animated-when-visible", container).avia_sc_animation_delayed({
        delay: 100,
      });
      $(
        ".av-animated-when-almost-visible",
        container
      ).avia_sc_animation_delayed({ delay: 100 });
      $(".av-animated-when-visible-95", container).avia_sc_animation_delayed({
        delay: 100,
      });
    }
    if ($.fn.avia_sc_iconlist) {
      $(
        ".avia-icon-list.av-iconlist-big.avia-iconlist-animate",
        container
      ).avia_sc_iconlist();
    }
    if ($.fn.avia_sc_progressbar) {
      $(".avia-progress-bar-container", container).avia_sc_progressbar();
    }
    if ($.fn.avia_sc_testimonial) {
      $(".avia-testimonial-wrapper", container).avia_sc_testimonial();
    }
    if ($.fn.aviaFullscreenSlider) {
      $(".avia-slideshow.av_fullscreen", container).aviaFullscreenSlider();
    }
    if ($.fn.aviaSlider) {
      $(".avia-slideshow:not(.av_fullscreen)", container).aviaSlider();
      $(".avia-content-slider-active", container).aviaSlider({
        wrapElement: ".avia-content-slider-inner",
        slideElement: ".slide-entry-wrap",
        fullfade: true,
      });
      $(".avia-slider-testimonials", container).aviaSlider({
        wrapElement: ".avia-testimonial-row",
        slideElement: ".avia-testimonial",
        fullfade: true,
      });
    }
    if ($.fn.aviaMagazine) {
      $(".av-magazine-tabs-active", container).aviaMagazine();
    }
    if ($.fn.aviaHotspots) {
      $(".av-hotspot-image-container", container).aviaHotspots();
    }
    if ($.fn.aviaCountdown) {
      $(".av-countdown-timer", container).aviaCountdown();
    }
    if ($.fn.aviaPlayer) {
      $(".av-player", container).aviaPlayer();
    }
  };
  function activate_waypoints(container) {
    if ($.fn.avia_waypoints) {
      if (typeof container == "undefined") {
        container = "body";
      }
      $(".avia_animate_when_visible", container).avia_waypoints();
      $(".avia_animate_when_almost_visible", container).avia_waypoints({
        offset: "80%",
      });
      $(".av-animated-when-visible", container).avia_waypoints();
      $(".av-animated-when-almost-visible", container).avia_waypoints({
        offset: "80%",
      });
      $(".av-animated-when-visible-95", container).avia_waypoints({
        offset: "95%",
      });
      var disable_mobile = $("body").hasClass("avia-mobile-no-animations");
      if (container == "body" && disable_mobile) {
        container = ".avia_desktop body";
      }
      $(".av-animated-generic", container).avia_waypoints({ offset: "95%" });
    }
  }
  $.fn.avia_mobile_fixed = function (options) {
    var isMobile = $.avia_utilities.isMobile;
    if (!isMobile) {
      return;
    }
    return this.each(function () {
      var current = $(this).addClass("av-parallax-section"),
        $background = current.attr("style"),
        $attachment_class = current.data("section-bg-repeat"),
        template = "";
      if ($attachment_class == "stretch" || $attachment_class == "no-repeat") {
        $attachment_class = " avia-full-stretch";
      } else {
        $attachment_class = "";
      }
      template =
        "<div class='av-parallax " +
        $attachment_class +
        "' data-avia-parallax-ratio='0.0' style = '" +
        $background +
        "' ></div>";
      current.prepend(template);
      current.attr("style", "");
    });
  };
  $.fn.avia_sc_animation_delayed = function (options) {
    var global_timer = 0,
      delay = options.delay || 50,
      max_timer = 10,
      new_max = setTimeout(function () {
        max_timer = 20;
      }, 500);
    return this.each(function () {
      var elements = $(this);
      elements.on("avia_start_animation", function () {
        var element = $(this);
        if (global_timer < max_timer) {
          global_timer++;
        }
        setTimeout(function () {
          element.addClass("avia_start_delayed_animation");
          if (global_timer > 0) {
            global_timer--;
          }
        }, global_timer * delay);
      });
    });
  };
  $.fn.avia_delayed_animation_in_container = function (options) {
    return this.each(function () {
      var elements = $(this);
      elements.on(
        "avia_start_animation_if_current_slide_is_active",
        function () {
          var current = $(this),
            animate = current.find(".avia_start_animation_when_active");
          animate
            .addClass("avia_start_animation")
            .trigger("avia_start_animation");
        }
      );
      elements.on("avia_remove_animation", function () {
        var current = $(this),
          animate = current.find(
            ".avia_start_animation_when_active, .avia_start_animation"
          );
        animate.removeClass(
          "avia_start_animation avia_start_delayed_animation"
        );
      });
    });
  };
  $.fn.avia_browser_height = function () {
    if (!this.length) {
      return this;
    }
    var win = $(window),
      html_el = $("html"),
      headFirst = $("head").first(),
      subtract = $(
        "#wpadminbar, #header.av_header_top:not(.html_header_transparency #header), #main>.title_container"
      ),
      css_block = $(
        "<style type='text/css' id='av-browser-height'></style>"
      ).appendTo(headFirst),
      sidebar_menu = $(".html_header_sidebar #top #header_main"),
      full_slider = $(
        ".html_header_sidebar .avia-fullscreen-slider.avia-builder-el-0.avia-builder-el-no-sibling"
      ).addClass("av-solo-full"),
      pc_heights = [25, 50, 75],
      calc_height = function () {
        var css = "",
          wh100 = win.height(),
          ww100 = win.width(),
          wh100_mod = wh100,
          whCover = (wh100 / 9) * 16,
          wwCover = (ww100 / 16) * 9,
          solo = 0;
        if (sidebar_menu.length) {
          solo = sidebar_menu.height();
        }
        subtract.each(function () {
          wh100_mod -= this.offsetHeight - 1;
        });
        var whCoverMod = (wh100_mod / 9) * 16;
        css += ".avia-section.av-minimum-height .container{opacity: 1; }\n";
        css +=
          ".av-minimum-height-100:not(.av-slideshow-section) .container, .avia-fullscreen-slider .avia-slideshow, #top.avia-blank .av-minimum-height-100 .container, .av-cell-min-height-100 > .flex_cell{height:" +
          wh100 +
          "px;}\n";
        css +=
          ".av-minimum-height-100.av-slideshow-section .container { height:unset; }\n";
        css +=
          ".av-minimum-height-100.av-slideshow-section {min-height:" +
          wh100 +
          "px;}\n";
        $.each(pc_heights, function (index, value) {
          var wh = Math.round(wh100 * (value / 100.0));
          css +=
            ".av-minimum-height-" +
            value +
            ":not(.av-slideshow-section) .container, .av-cell-min-height-" +
            value +
            " > .flex_cell {height:" +
            wh +
            "px;}\n";
          css +=
            ".av-minimum-height-" +
            value +
            ".av-slideshow-section {min-height:" +
            wh +
            "px;}\n";
        });
        css +=
          ".avia-builder-el-0.av-minimum-height-100:not(.av-slideshow-section) .container, .avia-builder-el-0.avia-fullscreen-slider .avia-slideshow, .avia-builder-el-0.av-cell-min-height-100 > .flex_cell{height:" +
          wh100_mod +
          "px;}\n";
        css +=
          "#top .av-solo-full .avia-slideshow {min-height:" + solo + "px;}\n";
        if (ww100 / wh100 < 16 / 9) {
          css +=
            "#top .av-element-cover iframe, #top .av-element-cover embed, #top .av-element-cover object, #top .av-element-cover video{width:" +
            whCover +
            "px; left: -" +
            (whCover - ww100) / 2 +
            "px;}\n";
        } else {
          css +=
            "#top .av-element-cover iframe, #top .av-element-cover embed, #top .av-element-cover object, #top .av-element-cover video{height:" +
            wwCover +
            "px; top: -" +
            (wwCover - wh100) / 2 +
            "px;}\n";
        }
        if (ww100 / wh100_mod < 16 / 9) {
          css +=
            "#top .avia-builder-el-0 .av-element-cover iframe, #top .avia-builder-el-0 .av-element-cover embed, #top .avia-builder-el-0 .av-element-cover object, #top .avia-builder-el-0 .av-element-cover video{width:" +
            whCoverMod +
            "px; left: -" +
            (whCoverMod - ww100) / 2 +
            "px;}\n";
        } else {
          css +=
            "#top .avia-builder-el-0 .av-element-cover iframe, #top .avia-builder-el-0 .av-element-cover embed, #top .avia-builder-el-0 .av-element-cover object, #top .avia-builder-el-0 .av-element-cover video{height:" +
            wwCover +
            "px; top: -" +
            (wwCover - wh100_mod) / 2 +
            "px;}\n";
        }
        try {
          css_block.text(css);
        } catch (err) {
          css_block.remove();
          css_block = $(
            "<style type='text/css' id='av-browser-height'>" + css + "</style>"
          ).appendTo(headFirst);
        }
        setTimeout(function () {
          win.trigger("av-height-change");
        }, 100);
      };
    this.each(function (index) {
      var height = $(this).data("av_minimum_height_pc");
      if ("number" != typeof height) {
        return this;
      }
      height = parseInt(height);
      if (-1 == $.inArray(height, pc_heights) && height != 100) {
        pc_heights.push(height);
      }
      return this;
    });
    win.on("debouncedresize", calc_height);
    calc_height();
  };
  $.fn.avia_container_height = function () {
    if (!this.length) {
      return this;
    }
    var win = $(window),
      calc_height = function () {
        var column = $(this),
          jsonHeight = column.data("av-column-min-height"),
          minHeight = parseInt(jsonHeight["column-min-pc"], 10),
          container = null,
          containerHeight = 0,
          columMinHeight = 0;
        if (isNaN(minHeight) || minHeight == 0) {
          return;
        }
        container = column.closest(".avia-section");
        if (!container.length) {
          container = column.closest(".av-gridrow-cell");
        }
        if (!container.length) {
          container = column.closest(".av-layout-tab");
        }
        containerHeight = container.length
          ? container.outerHeight()
          : win.height();
        columMinHeight = containerHeight * (minHeight / 100.0);
        if (!jsonHeight["column-equal-height"]) {
          column.css("min-height", columMinHeight + "px");
          column.css("height", "auto");
        } else {
          column.css("height", columMinHeight + "px");
        }
        setTimeout(function () {
          win.trigger("av-height-change");
        }, 100);
      };
    this.each(function (index) {
      var column = $(this),
        jsonHeight = column.data("av-column-min-height");
      if ("object" != typeof jsonHeight) {
        return this;
      }
      win.on("debouncedresize", calc_height.bind(column));
      calc_height.call(column);
      return this;
    });
  };
  $.fn.avia_video_section = function () {
    if (!this.length) return;
    var elements = this.length,
      content = "",
      win = $(window),
      headFirst = $("head").first(),
      css_block = $(
        "<style type='text/css' id='av-section-height'></style>"
      ).appendTo(headFirst),
      calc_height = function (section, counter) {
        if (counter === 0) {
          content = "";
        }
        var css = "",
          the_id = "#" + section.attr("id"),
          wh100 = section.height(),
          ww100 = section.width(),
          aspect = section.data("sectionVideoRatio").split(":"),
          video_w = aspect[0],
          video_h = aspect[1],
          whCover = (wh100 / video_h) * video_w,
          wwCover = (ww100 / video_w) * video_h;
        if (ww100 / wh100 < video_w / video_h) {
          css +=
            "#top " +
            the_id +
            " .av-section-video-bg iframe, #top " +
            the_id +
            " .av-section-video-bg embed, #top " +
            the_id +
            " .av-section-video-bg object, #top " +
            the_id +
            " .av-section-video-bg video{width:" +
            whCover +
            "px; left: -" +
            (whCover - ww100) / 2 +
            "px;}\n";
        } else {
          css +=
            "#top " +
            the_id +
            " .av-section-video-bg iframe, #top " +
            the_id +
            " .av-section-video-bg embed, #top " +
            the_id +
            " .av-section-video-bg object, #top " +
            the_id +
            " .av-section-video-bg video{height:" +
            wwCover +
            "px; top: -" +
            (wwCover - wh100) / 2 +
            "px;}\n";
        }
        content = content + css;
        if (elements == counter + 1) {
          try {
            css_block.text(content);
          } catch (err) {
            css_block.remove();
            css_block = $(
              "<style type='text/css' id='av-section-height'>" +
                content +
                "</style>"
            ).appendTo(headFirst);
          }
        }
      };
    return this.each(function (i) {
      var self = $(this);
      win.on("debouncedresize", function () {
        calc_height(self, i);
      });
      calc_height(self, i);
    });
  };
  $.fn.avia_link_column = function () {
    return this.each(function () {
      $(this).on("click", function (e) {
        if (
          "undefined" !== typeof e.target &&
          "undefined" !== typeof e.target.href
        ) {
          return;
        }
        var column = $(this),
          url = column.data("link-column-url"),
          target = column.data("link-column-target"),
          link = window.location.hostname + window.location.pathname;
        if ("undefined" === typeof url || "string" !== typeof url) {
          return;
        }
        if ("undefined" !== typeof target || "_blank" == target) {
          var a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.click();
          return false;
        } else {
          if (
            column.hasClass("av-cell-link") ||
            column.hasClass("av-column-link")
          ) {
            var reader = column.hasClass("av-cell-link")
              ? column.prev("a.av-screen-reader-only").first()
              : column.find("a.av-screen-reader-only").first();
            url = url.trim();
            if (
              0 == url.indexOf("#") ||
              (url.indexOf(link) >= 0 && url.indexOf("#") > 0)
            ) {
              reader.trigger("click");
              if ("undefined" == typeof target || "_blank" != target) {
                window.location.href = url;
              }
              return;
            }
          }
          window.location.href = url;
        }
        e.preventDefault();
        return;
      });
    });
  };
  $.fn.avia_waypoints = function (options_passed) {
    if (!$("html").is(".avia_transform")) {
      return;
    }
    var defaults = { offset: "bottom-in-view", triggerOnce: true },
      options = $.extend({}, defaults, options_passed),
      isMobile = $.avia_utilities.isMobile;
    return this.each(function () {
      var element = $(this),
        force_animate = element.hasClass("animate-all-devices"),
        mobile_no_animations = $("body").hasClass("avia-mobile-no-animations");
      setTimeout(function () {
        if (isMobile && mobile_no_animations && !force_animate) {
          element
            .addClass("avia_start_animation")
            .trigger("avia_start_animation");
        } else {
          element.waypoint(function (direction) {
            var current = $(this.element),
              parent = current.parents(".av-animation-delay-container").eq(0);
            if (parent.length) {
              current
                .addClass("avia_start_animation_when_active")
                .trigger("avia_start_animation_when_active");
            }
            if (
              !parent.length ||
              (parent.length && parent.is(".__av_init_open")) ||
              (parent.length && parent.is(".av-active-tab-content"))
            ) {
              current
                .addClass("avia_start_animation")
                .trigger("avia_start_animation");
            }
          }, options);
        }
      }, 100);
    });
  };
  var $event = $.event,
    $special,
    resizeTimeout;
  $special = $event.special.debouncedresize = {
    setup: function () {
      $(this).on("resize", $special.handler);
    },
    teardown: function () {
      $(this).off("resize", $special.handler);
    },
    handler: function (event, execAsap) {
      var context = this,
        args = arguments,
        dispatch = function () {
          event.type = "debouncedresize";
          $event.dispatch.apply(context, args);
        };
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      execAsap
        ? dispatch()
        : (resizeTimeout = setTimeout(dispatch, $special.threshold));
    },
    threshold: 150,
  };
})(jQuery);
(function ($) {
  "use strict";
  $.avia_utilities = $.avia_utilities || {};
  $.avia_utilities.loading = function (attach_to, delay) {
    var loader = {
      active: false,
      show: function () {
        if (loader.active === false) {
          loader.active = true;
          loader.loading_item.css({ display: "block", opacity: 0 });
        }
        loader.loading_item.stop().animate({ opacity: 1 });
      },
      hide: function () {
        if (typeof delay === "undefined") {
          delay = 600;
        }
        loader.loading_item
          .stop()
          .delay(delay)
          .animate({ opacity: 0 }, function () {
            loader.loading_item.css({ display: "none" });
            loader.active = false;
          });
      },
      attach: function () {
        if (typeof attach_to === "undefined") {
          attach_to = "body";
        }
        loader.loading_item = $(
          '<div class="avia_loading_icon"><div class="av-siteloader"></div></div>'
        )
          .css({ display: "none" })
          .appendTo(attach_to);
      },
    };
    loader.attach();
    return loader;
  };
  $.avia_utilities.playpause = function (attach_to, delay) {
    var pp = {
      active: false,
      to1: "",
      to2: "",
      set: function (status) {
        pp.loading_item.removeClass("av-play av-pause");
        pp.to1 = setTimeout(function () {
          pp.loading_item.addClass("av-" + status);
        }, 10);
        pp.to2 = setTimeout(function () {
          pp.loading_item.removeClass("av-" + status);
        }, 1500);
      },
      attach: function () {
        if (typeof attach_to === "undefined") {
          attach_to = "body";
        }
        pp.loading_item = $('<div class="avia_playpause_icon"></div>')
          .css({ display: "none" })
          .appendTo(attach_to);
      },
    };
    pp.attach();
    return pp;
  };
  $.avia_utilities.preload = function (options_passed) {
    new $.AviaPreloader(options_passed);
  };
  $.AviaPreloader = function (options) {
    this.win = $(window);
    this.defaults = {
      container: "body",
      maxLoops: 10,
      trigger_single: true,
      single_callback: function () {},
      global_callback: function () {},
    };
    this.options = $.extend({}, this.defaults, options);
    this.preload_images = 0;
    this.load_images();
  };
  $.AviaPreloader.prototype = {
    load_images: function () {
      var _self = this;
      if (typeof _self.options.container === "string") {
        _self.options.container = $(_self.options.container);
      }
      _self.options.container.each(function () {
        var container = $(this);
        container.images = container.find("img");
        container.allImages = container.images;
        _self.preload_images += container.images.length;
        setTimeout(function () {
          _self.checkImage(container);
        }, 10);
      });
    },
    checkImage: function (container) {
      var _self = this;
      container.images.each(function () {
        if (this.complete === true) {
          container.images = container.images.not(this);
          _self.preload_images -= 1;
        }
      });
      if (container.images.length && _self.options.maxLoops >= 0) {
        _self.options.maxLoops -= 1;
        setTimeout(function () {
          _self.checkImage(container);
        }, 500);
      } else {
        _self.preload_images = _self.preload_images - container.images.length;
        _self.trigger_loaded(container);
      }
    },
    trigger_loaded: function (container) {
      var _self = this;
      if (_self.options.trigger_single !== false) {
        _self.win.trigger("avia_images_loaded_single", [container]);
        _self.options.single_callback.call(container);
      }
      if (_self.preload_images === 0) {
        _self.win.trigger("avia_images_loaded");
        _self.options.global_callback.call();
      }
    },
  };
  $.avia_utilities.css_easings = {
    linear: "linear",
    swing: "ease-in-out",
    bounce: "cubic-bezier(0.0, 0.35, .5, 1.3)",
    easeInQuad: "cubic-bezier(0.550, 0.085, 0.680, 0.530)",
    easeInCubic: "cubic-bezier(0.550, 0.055, 0.675, 0.190)",
    easeInQuart: "cubic-bezier(0.895, 0.030, 0.685, 0.220)",
    easeInQuint: "cubic-bezier(0.755, 0.050, 0.855, 0.060)",
    easeInSine: "cubic-bezier(0.470, 0.000, 0.745, 0.715)",
    easeInExpo: "cubic-bezier(0.950, 0.050, 0.795, 0.035)",
    easeInCirc: "cubic-bezier(0.600, 0.040, 0.980, 0.335)",
    easeInBack: "cubic-bezier(0.600, -0.280, 0.735, 0.04)",
    easeOutQuad: "cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    easeOutCubic: "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    easeOutQuart: "cubic-bezier(0.165, 0.840, 0.440, 1.000)",
    easeOutQuint: "cubic-bezier(0.230, 1.000, 0.320, 1.000)",
    easeOutSine: "cubic-bezier(0.390, 0.575, 0.565, 1.000)",
    easeOutExpo: "cubic-bezier(0.190, 1.000, 0.220, 1.000)",
    easeOutCirc: "cubic-bezier(0.075, 0.820, 0.165, 1.000)",
    easeOutBack: "cubic-bezier(0.175, 0.885, 0.320, 1.275)",
    easeInOutQuad: "cubic-bezier(0.455, 0.030, 0.515, 0.955)",
    easeInOutCubic: "cubic-bezier(0.645, 0.045, 0.355, 1.000)",
    easeInOutQuart: "cubic-bezier(0.770, 0.000, 0.175, 1.000)",
    easeInOutQuint: "cubic-bezier(0.860, 0.000, 0.070, 1.000)",
    easeInOutSine: "cubic-bezier(0.445, 0.050, 0.550, 0.950)",
    easeInOutExpo: "cubic-bezier(1.000, 0.000, 0.000, 1.000)",
    easeInOutCirc: "cubic-bezier(0.785, 0.135, 0.150, 0.860)",
    easeInOutBack: "cubic-bezier(0.680, -0.550, 0.265, 1.55)",
    easeInOutBounce: "cubic-bezier(0.580, -0.365, 0.490, 1.365)",
    easeOutBounce: "cubic-bezier(0.760, 0.085, 0.490, 1.365)",
  };
  $.avia_utilities.supported = {};
  $.avia_utilities.supports = (function () {
    var div = document.createElement("div"),
      vendors = ["Khtml", "Ms", "Moz", "Webkit"];
    return function (prop, vendor_overwrite) {
      if (div.style[prop] !== undefined) {
        return "";
      }
      if (vendor_overwrite !== undefined) {
        vendors = vendor_overwrite;
      }
      prop = prop.replace(/^[a-z]/, function (val) {
        return val.toUpperCase();
      });
      var len = vendors.length;
      while (len--) {
        if (div.style[vendors[len] + prop] !== undefined) {
          return "-" + vendors[len].toLowerCase() + "-";
        }
      }
      return false;
    };
  })();
  $.fn.avia_animate = function (prop, speed, easing, callback) {
    if (typeof speed === "function") {
      callback = speed;
      speed = false;
    }
    if (typeof easing === "function") {
      callback = easing;
      easing = false;
    }
    if (typeof speed === "string") {
      easing = speed;
      speed = false;
    }
    if (callback === undefined || callback === false) {
      callback = function () {};
    }
    if (easing === undefined || easing === false) {
      easing = "easeInQuad";
    }
    if (speed === undefined || speed === false) {
      speed = 400;
    }
    if ($.avia_utilities.supported.transition === undefined) {
      $.avia_utilities.supported.transition =
        $.avia_utilities.supports("transition");
    }
    if ($.avia_utilities.supported.transition !== false) {
      var prefix = $.avia_utilities.supported.transition + "transition",
        cssRule = {},
        cssProp = {},
        thisStyle = document.body.style,
        end =
          thisStyle.WebkitTransition !== undefined
            ? "webkitTransitionEnd"
            : thisStyle.OTransition !== undefined
            ? "oTransitionEnd"
            : "transitionend";
      easing = $.avia_utilities.css_easings[easing];
      cssRule[prefix] = "all " + speed / 1000 + "s " + easing;
      end = end + ".avia_animate";
      for (var rule in prop) {
        if (prop.hasOwnProperty(rule)) {
          cssProp[rule] = prop[rule];
        }
      }
      prop = cssProp;
      this.each(function () {
        var element = $(this),
          css_difference = false,
          rule,
          current_css;
        for (rule in prop) {
          if (prop.hasOwnProperty(rule)) {
            current_css = element.css(rule);
            if (
              prop[rule] != current_css &&
              prop[rule] != current_css.replace(/px|%/g, "")
            ) {
              css_difference = true;
              break;
            }
          }
        }
        if (css_difference) {
          if (!($.avia_utilities.supported.transition + "transform" in prop)) {
            prop[$.avia_utilities.supported.transition + "transform"] =
              "translateZ(0)";
          }
          var endTriggered = false;
          element.on(end, function (event) {
            if (event.target != event.currentTarget) return false;
            if (endTriggered == true) return false;
            endTriggered = true;
            cssRule[prefix] = "none";
            element.off(end);
            element.css(cssRule);
            setTimeout(function () {
              callback.call(element);
            });
          });
          setTimeout(function () {
            if (
              !endTriggered &&
              !avia_is_mobile &&
              $("html").is(".avia-safari")
            ) {
              element.trigger(end);
              $.avia_utilities.log("Safari Fallback " + end + " trigger");
            }
          }, speed + 100);
          setTimeout(function () {
            element.css(cssRule);
          }, 10);
          setTimeout(function () {
            element.css(prop);
          }, 20);
        } else {
          setTimeout(function () {
            callback.call(element);
          });
        }
      });
    } else {
      this.animate(prop, speed, easing, callback);
    }
    return this;
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.avia_keyboard_controls = function (options_passed) {
    var defaults = { 37: ".prev-slide", 39: ".next-slide" },
      methods = {
        mousebind: function (slider) {
          slider
            .on("mouseenter", function () {
              slider.mouseover = true;
            })
            .on("mouseleave", function () {
              slider.mouseover = false;
            });
        },
        keybind: function (slider) {
          $(document).on("keydown", function (e) {
            if (
              slider.mouseover &&
              typeof slider.options[e.keyCode] !== "undefined"
            ) {
              var item;
              if (typeof slider.options[e.keyCode] === "string") {
                item = slider.find(slider.options[e.keyCode]);
              } else {
                item = slider.options[e.keyCode];
              }
              if (item.length) {
                item.trigger("click", ["keypress"]);
                return false;
              }
            }
          });
        },
      };
    return this.each(function () {
      var slider = $(this);
      slider.options = $.extend({}, defaults, options_passed);
      slider.mouseover = false;
      methods.mousebind(slider);
      methods.keybind(slider);
    });
  };
  $.fn.avia_swipe_trigger = function (passed_options) {
    var win = $(window),
      isMobile = $.avia_utilities.isMobile,
      isTouchDevice = $.avia_utilities.isTouchDevice,
      defaults = {
        prev: ".prev-slide",
        next: ".next-slide",
        event: { prev: "click", next: "click" },
      },
      methods = {
        activate_touch_control: function (slider) {
          var i, differenceX, differenceY;
          slider.touchPos = {};
          slider.hasMoved = false;
          slider.on("touchstart", function (event) {
            slider.touchPos.X = event.originalEvent.touches[0].clientX;
            slider.touchPos.Y = event.originalEvent.touches[0].clientY;
          });
          slider.on("touchend", function (event) {
            slider.touchPos = {};
            if (slider.hasMoved) {
              event.preventDefault();
            }
            slider.hasMoved = false;
          });
          slider.on("touchmove", function (event) {
            if (!slider.touchPos.X) {
              slider.touchPos.X = event.originalEvent.touches[0].clientX;
              slider.touchPos.Y = event.originalEvent.touches[0].clientY;
            } else {
              differenceX =
                event.originalEvent.touches[0].clientX - slider.touchPos.X;
              differenceY =
                event.originalEvent.touches[0].clientY - slider.touchPos.Y;
              if (Math.abs(differenceX) > Math.abs(differenceY)) {
                event.preventDefault();
                if (
                  slider.touchPos !== event.originalEvent.touches[0].clientX
                ) {
                  if (Math.abs(differenceX) > 50) {
                    i = differenceX > 0 ? "prev" : "next";
                    if (typeof slider.options[i] === "string") {
                      slider
                        .find(slider.options[i])
                        .trigger(slider.options.event[i], ["swipe"]);
                    } else {
                      slider.options[i].trigger(slider.options.event[i], [
                        "swipe",
                      ]);
                    }
                    slider.hasMoved = true;
                    slider.touchPos = {};
                    return false;
                  }
                }
              }
            }
          });
        },
      };
    return this.each(function () {
      if (isMobile || isTouchDevice) {
        var slider = $(this);
        slider.options = $.extend({}, defaults, passed_options);
        methods.activate_touch_control(slider);
      }
    });
  };
})(jQuery);
(function ($) {
  if (typeof $.easing !== "undefined") {
    $.easing["jswing"] = $.easing["swing"];
  }
  var pow = Math.pow,
    sqrt = Math.sqrt,
    sin = Math.sin,
    cos = Math.cos,
    PI = Math.PI,
    c1 = 1.70158,
    c2 = c1 * 1.525,
    c3 = c1 + 1,
    c4 = (2 * PI) / 3,
    c5 = (2 * PI) / 4.5;
  function bounceOut(x) {
    var n1 = 7.5625,
      d1 = 2.75;
    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  }
  $.extend($.easing, {
    def: "easeOutQuad",
    swing: function (x) {
      return $.easing[$.easing.def](x);
    },
    easeInQuad: function (x) {
      return x * x;
    },
    easeOutQuad: function (x) {
      return 1 - (1 - x) * (1 - x);
    },
    easeInOutQuad: function (x) {
      return x < 0.5 ? 2 * x * x : 1 - pow(-2 * x + 2, 2) / 2;
    },
    easeInCubic: function (x) {
      return x * x * x;
    },
    easeOutCubic: function (x) {
      return 1 - pow(1 - x, 3);
    },
    easeInOutCubic: function (x) {
      return x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2;
    },
    easeInQuart: function (x) {
      return x * x * x * x;
    },
    easeOutQuart: function (x) {
      return 1 - pow(1 - x, 4);
    },
    easeInOutQuart: function (x) {
      return x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2;
    },
    easeInQuint: function (x) {
      return x * x * x * x * x;
    },
    easeOutQuint: function (x) {
      return 1 - pow(1 - x, 5);
    },
    easeInOutQuint: function (x) {
      return x < 0.5 ? 16 * x * x * x * x * x : 1 - pow(-2 * x + 2, 5) / 2;
    },
    easeInSine: function (x) {
      return 1 - cos((x * PI) / 2);
    },
    easeOutSine: function (x) {
      return sin((x * PI) / 2);
    },
    easeInOutSine: function (x) {
      return -(cos(PI * x) - 1) / 2;
    },
    easeInExpo: function (x) {
      return x === 0 ? 0 : pow(2, 10 * x - 10);
    },
    easeOutExpo: function (x) {
      return x === 1 ? 1 : 1 - pow(2, -10 * x);
    },
    easeInOutExpo: function (x) {
      return x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5
        ? pow(2, 20 * x - 10) / 2
        : (2 - pow(2, -20 * x + 10)) / 2;
    },
    easeInCirc: function (x) {
      return 1 - sqrt(1 - pow(x, 2));
    },
    easeOutCirc: function (x) {
      return sqrt(1 - pow(x - 1, 2));
    },
    easeInOutCirc: function (x) {
      return x < 0.5
        ? (1 - sqrt(1 - pow(2 * x, 2))) / 2
        : (sqrt(1 - pow(-2 * x + 2, 2)) + 1) / 2;
    },
    easeInElastic: function (x) {
      return x === 0
        ? 0
        : x === 1
        ? 1
        : -pow(2, 10 * x - 10) * sin((x * 10 - 10.75) * c4);
    },
    easeOutElastic: function (x) {
      return x === 0
        ? 0
        : x === 1
        ? 1
        : pow(2, -10 * x) * sin((x * 10 - 0.75) * c4) + 1;
    },
    easeInOutElastic: function (x) {
      return x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5
        ? -(pow(2, 20 * x - 10) * sin((20 * x - 11.125) * c5)) / 2
        : (pow(2, -20 * x + 10) * sin((20 * x - 11.125) * c5)) / 2 + 1;
    },
    easeInBack: function (x) {
      return c3 * x * x * x - c1 * x * x;
    },
    easeOutBack: function (x) {
      return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2);
    },
    easeInOutBack: function (x) {
      return x < 0.5
        ? (pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
        : (pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
    },
    easeInBounce: function (x) {
      return 1 - bounceOut(1 - x);
    },
    easeOutBounce: bounceOut,
    easeInOutBounce: function (x) {
      return x < 0.5
        ? (1 - bounceOut(1 - 2 * x)) / 2
        : (1 + bounceOut(2 * x - 1)) / 2;
    },
  });
})(jQuery);
(function ($) {
  "use strict";
  var autostarted = false,
    container = null,
    monitorStart = function (container) {
      var play_pause = container.find(
        ".av-player-player-container .mejs-playpause-button"
      );
      if (play_pause.length == 0) {
        setTimeout(function () {
          monitorStart(container);
        }, 200);
      }
      if (!play_pause.hasClass("mejs-pause")) {
        play_pause.trigger("click");
      }
    };
  $.fn.aviaPlayer = function (options) {
    if (!this.length) {
      return;
    }
    return this.each(function () {
      var _self = {};
      _self.container = $(this);
      _self.stopLoop = false;
      _self.container.find("audio").on("play", function () {
        if (_self.stopLoop) {
          this.pause();
          _self.stopLoop = false;
        }
      });
      if (_self.container.hasClass("avia-playlist-no-loop")) {
        _self.container.find("audio").on("ended", function () {
          var lastTrack = _self.container
            .find(".wp-playlist-tracks .wp-playlist-item")
            .last()
            .find("a");
          try {
            var lastURI = decodeURI(lastTrack.attr("href"));
            var currentURI = decodeURI(this.currentSrc);
            if (currentURI === lastURI) {
              _self.stopLoop = true;
            }
          } catch (e) {
            _self.stopLoop = false;
          }
        });
      }
      if (_self.container.hasClass("avia-playlist-autoplay") && !autostarted) {
        if (
          _self.container.css("display") == "none" ||
          _self.container.css("visibility") == "hidden"
        ) {
          return;
        }
        autostarted = true;
        setTimeout(function () {
          monitorStart(_self.container, _self);
        }, 200);
      }
    });
  };
})(jQuery);
(function ($) {
  $.fn.avia_ajax_form = function (variables) {
    var defaults = { sendPath: "send.php", responseContainer: ".ajaxresponse" };
    var options = $.extend(defaults, variables);
    return this.each(function () {
      var form = $(this),
        form_sent = false,
        send = {
          formElements: form.find(
            "textarea, select, input[type=text], input[type=checkbox], input[type=hidden]"
          ),
          validationError: false,
          button: form.find("input:submit"),
          dataObj: {},
        },
        responseContainer = form.next(options.responseContainer).eq(0);
      send.button.on("click", checkElements);
      if ($.avia_utilities.isMobile) {
        send.formElements.each(function (i) {
          var currentElement = $(this),
            is_email = currentElement.hasClass("is_email");
          if (is_email) currentElement.attr("type", "email");
        });
      }
      function checkElements(e) {
        send.validationError = false;
        send.datastring = "ajax=true";
        send.formElements = form.find(
          "textarea, select, input[type=text], input[type=checkbox], input[type=hidden], input[type=email]"
        );
        send.formElements.each(function (i) {
          var currentElement = $(this),
            surroundingElement = currentElement.parent(),
            value = currentElement.val(),
            name = currentElement.attr("name"),
            classes = currentElement.attr("class"),
            nomatch = true;
          if (currentElement.is(":checkbox")) {
            if (currentElement.is(":checked")) {
              value = true;
            } else {
              value = "";
            }
          }
          send.dataObj[name] = encodeURIComponent(value);
          if (classes && classes.match(/is_empty/)) {
            if (value == "" || value == null) {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("error");
              send.validationError = true;
            } else {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("valid");
            }
            nomatch = false;
          }
          if (classes && classes.match(/is_email/)) {
            if (!value.match(/^[\w|\.|\-]+@\w[\w|\.|\-]*\.[a-zA-Z]{2,20}$/)) {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("error");
              send.validationError = true;
            } else {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("valid");
            }
            nomatch = false;
          }
          if (classes && classes.match(/is_ext_email/)) {
            if (
              !value.match(
                /^[\w\.\-ÄÖÜäöü]+@\w[\w\.\-ÄÖÜäöü]*\.[a-zA-Z]{2,20}$/
              )
            ) {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("error");
              send.validationError = true;
            } else {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("valid");
            }
            nomatch = false;
          }
          if (classes && classes.match(/is_special_email/)) {
            if (
              !value.match(
                /^[a-zA-Z0-9.!#$%&'*+\-\/=?^_`{|}~ÄÖÜäöü]+@\w[\w\.\-ÄÖÜäöü]*\.[a-zA-Z]{2,20}$/
              )
            ) {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("error");
              send.validationError = true;
            } else {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("valid");
            }
            nomatch = false;
          }
          if (classes && classes.match(/is_phone/)) {
            if (
              !value.match(
                /^(\d|\s|\-|\/|\(|\)|\[|\]|e|x|t|ension|\.|\+|\_|\,|\:|\;){3,}$/
              )
            ) {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("error");
              send.validationError = true;
            } else {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("valid");
            }
            nomatch = false;
          }
          if (classes && classes.match(/is_number/)) {
            if (!value.match(/^-?\s*(0|[1-9]\d*)([\.,]\d+)?$/)) {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("error");
              send.validationError = true;
            } else {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("valid");
            }
            nomatch = false;
          }
          if (classes && classes.match(/is_positiv_number/)) {
            if (!av_isNumeric(value) || value == "" || value < 0) {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("error");
              send.validationError = true;
            } else {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("valid");
            }
            nomatch = false;
          }
          if (
            classes &&
            classes.match(/captcha/) &&
            !classes.match(/recaptcha/)
          ) {
            var verifier = form.find("#" + name + "_verifier").val(),
              lastVer = verifier.charAt(verifier.length - 1),
              finalVer = verifier.charAt(lastVer);
            if (value != finalVer) {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("error");
              send.validationError = true;
            } else {
              surroundingElement
                .removeClass("valid error ajax_alert")
                .addClass("valid");
            }
            nomatch = false;
          }
          if (nomatch && value != "") {
            surroundingElement
              .removeClass("valid error ajax_alert")
              .addClass("valid");
          }
        });
        if (send.validationError == false) {
          if (form.data("av-custom-send")) {
            mailchimp_send();
          } else {
            send_ajax_form();
          }
        }
        return false;
      }
      function send_ajax_form() {
        if (form_sent) {
          return false;
        }
        if (send.button.hasClass("avia_button_inactive")) {
          return false;
        }
        form_sent = true;
        send.button.addClass("av-sending-button");
        send.button.val(send.button.data("sending-label"));
        var redirect_to = form.data("avia-redirect") || false,
          action = form.attr("action"),
          label = form.is(".av-form-labels-style");
        if (label) return;
        responseContainer.load(
          action + " " + options.responseContainer,
          send.dataObj,
          function () {
            if (redirect_to && action != redirect_to) {
              form.attr("action", redirect_to);
              location.href = redirect_to;
            } else {
              responseContainer.removeClass("hidden").css({ display: "block" });
              form.slideUp(400, function () {
                responseContainer.slideDown(400, function () {
                  $("body").trigger("av_resize_finished");
                });
                send.formElements.val("");
              });
            }
          }
        );
      }
      function mailchimp_send() {
        if (form_sent) {
          return false;
        }
        form_sent = true;
        var original_label = send.button.val();
        send.button.addClass("av-sending-button");
        send.button.val(send.button.data("sending-label"));
        send.dataObj.ajax_mailchimp = true;
        var redirect_to = form.data("avia-redirect") || false,
          action = form.attr("action"),
          error_msg_container = form.find(".av-form-error-container"),
          form_id = form.data("avia-form-id");
        $.ajax({
          url: action,
          type: "POST",
          data: send.dataObj,
          beforeSend: function () {
            if (error_msg_container.length) {
              error_msg_container.slideUp(400, function () {
                error_msg_container.remove();
                $("body").trigger("av_resize_finished");
              });
            }
          },
          success: function (responseText) {
            var response = jQuery("<div>").append(
                jQuery.parseHTML(responseText)
              ),
              error = response.find(".av-form-error-container");
            if (error.length) {
              form_sent = false;
              form.prepend(error);
              error.css({ display: "none" }).slideDown(400, function () {
                $("body").trigger("av_resize_finished");
              });
              send.button.removeClass("av-sending-button");
              send.button.val(original_label);
            } else {
              if (redirect_to && action != redirect_to) {
                form.attr("action", redirect_to);
                location.href = redirect_to;
              } else {
                var success_text = response.find(
                  options.responseContainer + "_" + form_id
                );
                responseContainer
                  .html(success_text)
                  .removeClass("hidden")
                  .css({ display: "block" });
                form.slideUp(400, function () {
                  responseContainer.slideDown(400, function () {
                    $("body").trigger("av_resize_finished");
                  });
                  send.formElements.val("");
                });
              }
            }
          },
          error: function () {},
          complete: function () {},
        });
      }
      function av_isNumeric(obj) {
        var type = typeof obj;
        return (
          (type === "number" || type === "string") &&
          !isNaN(obj - parseFloat(obj))
        );
      }
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.AviaSlider = function (options, slider) {
    var self = this;
    this.$win = $(window);
    this.$slider = $(slider);
    this.isMobile = $.avia_utilities.isMobile;
    (this.isTouchDevice = $.avia_utilities.isTouchDevice),
      this._prepareSlides(options);
    $.avia_utilities.preload({
      container: this.$slider,
      single_callback: function () {
        self._init(options);
      },
    });
  };
  $.AviaSlider.defaults = {
    interval: 5,
    autoplay: false,
    autoplay_stopper: false,
    loop_autoplay: "once",
    loop_manual: "manual-endless",
    stopinfiniteloop: false,
    noNavigation: false,
    animation: "slide",
    transitionSpeed: 900,
    easing: "easeInOutQuart",
    wrapElement: ">ul",
    slideElement: ">li",
    hoverpause: false,
    bg_slider: false,
    show_slide_delay: 0,
    fullfade: false,
    keep_padding: false,
    carousel: "no",
    carouselSlidesToShow: 3,
    carouselSlidesToScroll: 1,
    carouselResponsive: new Array(),
  };
  $.AviaSlider.prototype = {
    _init: function (options) {
      this.options = this._setOptions(options);
      this.$sliderUl = this.$slider.find(this.options.wrapElement);
      this.$slides = this.$sliderUl.find(this.options.slideElement);
      this.slide_arrows = this.$slider.find(".avia-slideshow-arrows");
      this.gotoButtons = this.$slider.find(".avia-slideshow-dots a");
      this.permaCaption = this.$slider.find(">.av-slideshow-caption");
      this.itemsCount = this.$slides.length;
      this.current = 0;
      this.currentCarousel = 0;
      this.slideWidthCarousel = "240";
      this.loopCount = 0;
      this.isAnimating = false;
      this.browserPrefix = $.avia_utilities.supports("transition");
      this.cssActive = this.browserPrefix !== false ? true : false;
      this.css3DActive =
        document.documentElement.className.indexOf("avia_transform3d") !== -1
          ? true
          : false;
      if (this.options.bg_slider == true) {
        this.imageUrls = [];
        this.loader = $.avia_utilities.loading(this.$slider);
        this._bgPreloadImages();
      } else {
        this._kickOff();
      }
      if (this.options.carousel === "yes") {
        this.options.animation = "carouselslide";
      }
    },
    _setOptions: function (options) {
      var jsonOptions = this.$slider.data("slideshow-options");
      if ("object" == typeof jsonOptions) {
        var newOptions = $.extend(
          {},
          $.AviaSlider.defaults,
          options,
          jsonOptions
        );
        if ("undefined" != typeof newOptions.transition_speed) {
          newOptions.transitionSpeed = newOptions.transition_speed;
        }
        return newOptions;
      }
      var newOptions = $.extend(true, {}, $.AviaSlider.defaults, options),
        htmlData = this.$slider.data();
      for (var i in htmlData) {
        var key = "transition_speed" != i ? i : "transitionSpeed";
        if (
          typeof htmlData[i] === "string" ||
          typeof htmlData[i] === "number" ||
          typeof htmlData[i] === "boolean"
        ) {
          newOptions[key] = htmlData[i];
        }
        if (
          "undefined" != typeof newOptions.autoplay_stopper &&
          newOptions.autoplay_stopper == 1
        ) {
          newOptions.autoplay_stopper = true;
        }
      }
      return newOptions;
    },
    _prepareSlides: function (options) {
      if (this.isMobile) {
        var alter = this.$slider.find(".av-mobile-fallback-image");
        alter.each(function () {
          var current = $(this)
              .removeClass("av-video-slide")
              .data({ avia_video_events: true, "video-ratio": 0 }),
            fallback = current.data("mobile-img"),
            fallback_link = current.data("fallback-link"),
            appendTo = current.find(".avia-slide-wrap");
          current
            .find(".av-click-overlay, .mejs-mediaelement, .mejs-container")
            .remove();
          if (!fallback) {
            $(
              '<p class="av-fallback-message"><span>Please set a mobile device fallback image for this video in your wordpress backend</span></p>'
            ).appendTo(appendTo);
          }
          if (options && options.bg_slider) {
            current.data("img-url", fallback);
            if (fallback_link != "") {
              if (appendTo.is("a")) {
                appendTo.attr("href", fallback_link);
              } else {
                appendTo.find("a").remove();
                appendTo.replaceWith(function () {
                  var cur_slide = $(this);
                  return $("<a>")
                    .attr({
                      "data-rel": cur_slide.data("rel"),
                      class: cur_slide.attr("class"),
                      href: fallback_link,
                    })
                    .append($(this).contents());
                });
                appendTo = current.find(".avia-slide-wrap");
              }
              if ($.fn.avia_activate_lightbox) {
                current.parents("#main").avia_activate_lightbox();
              }
            }
          } else {
            var image = '<img src="' + fallback + '" alt="" title="" />';
            var lightbox = false;
            if (
              "string" == typeof fallback_link &&
              fallback_link.trim() != ""
            ) {
              if (appendTo.is("a")) {
                appendTo.attr("href", fallback_link);
              } else {
                var rel =
                  fallback_link.match(/\.(jpg|jpeg|gif|png)$/i) != null
                    ? ' rel="lightbox" '
                    : "";
                image =
                  '<a href="' +
                  fallback_link.trim() +
                  '"' +
                  rel +
                  ">" +
                  image +
                  "</a>";
              }
              lightbox = true;
            }
            current.find(".avia-slide-wrap").append(image);
            if (lightbox && $.fn.avia_activate_lightbox) {
              current.parents("#main").avia_activate_lightbox();
            }
          }
        });
      }
    },
    _bgPreloadImages: function (callback) {
      this._getImageURLS();
      this._preloadSingle(0, function () {
        this._kickOff();
        this._preloadNext(1);
      });
    },
    _getImageURLS: function () {
      var _self = this;
      this.$slides.each(function (i) {
        _self.imageUrls[i] = [];
        _self.imageUrls[i]["url"] = $(this).data("img-url");
        if (typeof _self.imageUrls[i]["url"] == "string") {
          _self.imageUrls[i]["status"] = false;
        } else {
          _self.imageUrls[i]["status"] = true;
        }
      });
    },
    _preloadSingle: function (key, callback) {
      var _self = this,
        objImage = new Image();
      if (typeof _self.imageUrls[key]["url"] == "string") {
        $(objImage).on("load error", function () {
          _self.imageUrls[key]["status"] = true;
          _self.$slides
            .eq(key)
            .css(
              "background-image",
              "url(" + _self.imageUrls[key]["url"] + ")"
            );
          if (typeof callback == "function") {
            callback.apply(_self, [objImage, key]);
          }
        });
        if (_self.imageUrls[key]["url"] != "") {
          objImage.src = _self.imageUrls[key]["url"];
        } else {
          $(objImage).trigger("error");
        }
      } else {
        if (typeof callback == "function") {
          callback.apply(_self, [objImage, key]);
        }
      }
    },
    _preloadNext: function (key) {
      if (typeof this.imageUrls[key] != "undefined") {
        this._preloadSingle(key, function () {
          this._preloadNext(key + 1);
        });
      }
    },
    _bindEvents: function () {
      var self = this,
        win = $(window);
      this.$slider.on("click", ".next-slide", this.next.bind(this));
      this.$slider.on("click", ".prev-slide", this.previous.bind(this));
      this.$slider.on("click", ".goto-slide", this.go2.bind(this));
      if (this.options.hoverpause) {
        this.$slider.on("mouseenter", this.pause.bind(this));
        this.$slider.on("mouseleave", this.resume.bind(this));
      }
      if (this.permaCaption.length) {
        this.permaCaption.on("click", this._routePermaCaptionClick);
        this.$slider.on(
          "avia_slider_first_slide avia_slider_last_slide avia_slider_navigate_slide",
          this._setPermaCaptionPointer.bind(this)
        );
      }
      if (this.options.stopinfiniteloop && this.options.autoplay) {
        if (this.options.stopinfiniteloop == "last") {
          this.$slider.on(
            "avia_slider_last_slide",
            this._stopSlideshow.bind(this)
          );
        } else if (this.options.stopinfiniteloop == "first") {
          this.$slider.on(
            "avia_slider_first_slide",
            this._stopSlideshow.bind(this)
          );
        }
      }
      if (this.options.carousel === "yes") {
        if (!this.isMobile) {
          win.on("debouncedresize", this._buildCarousel.bind(this));
        }
      } else {
        win.on("debouncedresize.aviaSlider", this._setSize.bind(this));
      }
      if (!this.options.noNavigation) {
        if (!this.isMobile) {
          this.$slider.avia_keyboard_controls();
        }
        if (this.isMobile || this.isTouchDevice) {
          this.$slider.avia_swipe_trigger();
        }
      }
      self._attach_video_events();
    },
    _kickOff: function () {
      var self = this,
        first_slide = self.$slides.eq(0),
        video = first_slide.data("video-ratio");
      self._bindEvents();
      self._set_slide_arrows_visibility();
      this.$slider.removeClass("av-default-height-applied");
      if (video) {
        self._setSize(true);
      } else {
        if (this.options.keep_padding != true) {
          self.$sliderUl.css("padding", 0);
          self.$win.trigger("av-height-change");
        }
      }
      self._setCenter();
      if (this.options.carousel === "no") {
        first_slide.addClass("next-active-slide");
        first_slide
          .css({ visibility: "visible", opacity: 0 })
          .avia_animate({ opacity: 1 }, function () {
            var current = $(this).addClass("active-slide");
            if (self.permaCaption.length) {
              self.permaCaption.addClass("active-slide");
            }
          });
      }
      self.$slider.trigger("avia_slider_first_slide");
      if (self.options.autoplay) {
        self._startSlideshow();
      }
      if (self.options.carousel === "yes") {
        self._buildCarousel();
      }
      self.$slider.trigger("_kickOff");
    },
    _set_slide_arrows_visibility: function () {
      if (this.options.carousel == "yes") {
        if (0 == this.currentCarousel) {
          this.slide_arrows.removeClass("av-visible-prev");
          this.slide_arrows.addClass("av-visible-next");
        } else if (
          this.currentCarousel + this.options.carouselSlidesToShow >=
          this.itemsCount
        ) {
          this.slide_arrows.addClass("av-visible-prev");
          this.slide_arrows.removeClass("av-visible-next");
        } else {
          this.slide_arrows.addClass("av-visible-prev");
          this.slide_arrows.addClass("av-visible-next");
        }
        return;
      }
      if (
        "endless" == this.options.loop_autoplay ||
        "manual-endless" == this.options.loop_manual
      ) {
        this.slide_arrows.addClass("av-visible-prev");
        this.slide_arrows.addClass("av-visible-next");
      } else if (0 == this.current) {
        this.slide_arrows.removeClass("av-visible-prev");
        this.slide_arrows.addClass("av-visible-next");
      } else if (this.current + 1 >= this.itemsCount) {
        this.slide_arrows.addClass("av-visible-prev");
        this.slide_arrows.removeClass("av-visible-next");
      } else {
        this.slide_arrows.addClass("av-visible-prev");
        this.slide_arrows.addClass("av-visible-next");
      }
    },
    _buildCarousel: function () {
      var self = this,
        stageWidth = this.$slider.outerWidth(),
        slidesWidth = parseInt(stageWidth / this.options.carouselSlidesToShow),
        windowWidth = window.innerWidth || $(window).width();
      if (
        this.options.carouselResponsive &&
        this.options.carouselResponsive.length &&
        this.options.carouselResponsive !== null
      ) {
        for (var breakpoint in this.options.carouselResponsive) {
          var breakpointValue =
            this.options.carouselResponsive[breakpoint]["breakpoint"];
          var newSlidesToShow =
            this.options.carouselResponsive[breakpoint]["settings"][
              "carouselSlidesToShow"
            ];
          if (breakpointValue >= windowWidth) {
            slidesWidth = parseInt(stageWidth / newSlidesToShow);
            this.options.carouselSlidesToShow = newSlidesToShow;
          }
        }
      }
      this.slideWidthCarousel = slidesWidth;
      this.$slides.each(function (i) {
        $(this).width(slidesWidth);
      });
      var slideTrackWidth = slidesWidth * this.itemsCount;
      this.$sliderUl.width(slideTrackWidth).css("transform", "translateX(0px)");
      if (this.options.carouselSlidesToShow >= this.itemsCount) {
        this.$slider.find(".av-timeline-nav").hide();
      }
    },
    _navigate: function (dir, pos) {
      if (
        this.isAnimating ||
        this.itemsCount < 2 ||
        !this.$slider.is(":visible")
      ) {
        return false;
      }
      this.isAnimating = true;
      this.prev = this.current;
      if (pos !== undefined) {
        this.current = pos;
        dir = this.current > this.prev ? "next" : "prev";
      } else if (dir === "next") {
        this.current =
          this.current < this.itemsCount - 1 ? this.current + 1 : 0;
        if (
          this.current === 0 &&
          this.options.autoplay_stopper &&
          this.options.autoplay
        ) {
          this.isAnimating = false;
          this.current = this.prev;
          this._stopSlideshow();
          return false;
        }
        if (0 === this.current) {
          if (
            "endless" != this.options.loop_autoplay &&
            "manual-endless" != this.options.loop_manual
          ) {
            this.isAnimating = false;
            this.current = this.prev;
            return false;
          }
        }
      } else if (dir === "prev") {
        this.current =
          this.current > 0 ? this.current - 1 : this.itemsCount - 1;
        if (this.itemsCount - 1 === this.current) {
          if (
            "endless" != this.options.loop_autoplay &&
            "manual-endless" != this.options.loop_manual
          ) {
            this.isAnimating = false;
            this.current = this.prev;
            return false;
          }
        }
      }
      this.gotoButtons
        .removeClass("active")
        .eq(this.current)
        .addClass("active");
      this._set_slide_arrows_visibility();
      if (this.options.carousel === "no") {
        this._setSize();
      }
      if (this.options.bg_slider == true) {
        if (this.imageUrls[this.current]["status"] == true) {
          this["_" + this.options.animation].call(this, dir);
        } else {
          this.loader.show();
          this._preloadSingle(this.current, function () {
            this["_" + this.options.animation].call(this, dir);
            this.loader.hide();
          });
        }
      } else {
        this["_" + this.options.animation].call(this, dir);
      }
      if (this.current == 0) {
        this.loopCount++;
        this.$slider.trigger("avia_slider_first_slide");
      } else if (this.current == this.itemsCount - 1) {
        this.$slider.trigger("avia_slider_last_slide");
      } else {
        this.$slider.trigger("avia_slider_navigate_slide");
      }
    },
    _setSize: function (instant) {
      if (this.options.bg_slider == true) {
        return;
      }
      var self = this,
        slide = this.$slides.eq(this.current),
        img = slide.find("img"),
        current = Math.floor(this.$sliderUl.height()),
        ratio = slide.data("video-ratio"),
        setTo = ratio
          ? this.$sliderUl.width() / ratio
          : Math.floor(slide.height()),
        video_height = slide.data("video-height"),
        video_toppos = slide.data("video-toppos");
      this.$sliderUl.height(current).css("padding", 0);
      if (setTo != current) {
        if (instant == true) {
          this.$sliderUl.css({ height: setTo });
          this.$win.trigger("av-height-change");
        } else {
          this.$sliderUl.avia_animate({ height: setTo }, function () {
            self.$win.trigger("av-height-change");
          });
        }
      }
      this._setCenter();
      if (video_height && video_height != "set") {
        slide
          .find("iframe, embed, video, object, .av_youtube_frame")
          .css({ height: video_height + "%", top: video_toppos + "%" });
        slide.data("video-height", "set");
      }
    },
    _setCenter: function () {
      var slide = this.$slides.eq(this.current),
        img = slide.find("img"),
        min_width = parseInt(img.css("min-width"), 10),
        slide_width = slide.width(),
        caption = slide.find(".av-slideshow-caption"),
        css_left = (slide_width - min_width) / 2;
      if (caption.length) {
        if (caption.is(".caption_left")) {
          css_left = (slide_width - min_width) / 1.5;
        } else if (caption.is(".caption_right")) {
          css_left = (slide_width - min_width) / 2.5;
        }
      }
      if (slide_width >= min_width) {
        css_left = 0;
      }
      img.css({ left: css_left });
    },
    _carouselmove: function () {
      var offset = this.slideWidthCarousel * this.currentCarousel;
      this.$sliderUl.css("transform", "translateX(-" + offset + "px)");
    },
    _carouselslide: function (dir) {
      console.log("_carouselslide:", dir, this.currentCarousel);
      if (dir === "next") {
        if (
          this.options.carouselSlidesToShow + this.currentCarousel <
          this.itemsCount
        ) {
          this.currentCarousel++;
          this._carouselmove();
        }
      } else if (dir === "prev") {
        if (this.currentCarousel > 0) {
          this.currentCarousel--;
          this._carouselmove();
        }
      }
      this._set_slide_arrows_visibility();
      this.isAnimating = false;
    },
    _slide: function (dir) {
      var dynamic = false,
        modifier = dynamic == true ? 2 : 1,
        sliderWidth = this.$slider.width(),
        direction = dir === "next" ? -1 : 1,
        property = this.browserPrefix + "transform",
        reset = {},
        transition = {},
        transition2 = {},
        trans_val = sliderWidth * direction * -1,
        trans_val2 = (sliderWidth * direction) / modifier;
      if (this.cssActive) {
        property = this.browserPrefix + "transform";
        if (this.css3DActive) {
          reset[property] = "translate3d(" + trans_val + "px, 0, 0)";
          transition[property] = "translate3d(" + trans_val2 + "px, 0, 0)";
          transition2[property] = "translate3d(0,0,0)";
        } else {
          reset[property] = "translate(" + trans_val + "px,0)";
          transition[property] = "translate(" + trans_val2 + "px,0)";
          transition2[property] = "translate(0,0)";
        }
      } else {
        reset.left = trans_val;
        transition.left = trans_val2;
        transition2.left = 0;
      }
      if (dynamic) {
        transition["z-index"] = "1";
        transition2["z-index"] = "2";
      }
      this._slide_animate(reset, transition, transition2);
    },
    _slide_up: function (dir) {
      var dynamic = true,
        modifier = dynamic == true ? 2 : 1,
        sliderHeight = this.$slider.height(),
        direction = dir === "next" ? -1 : 1,
        property = this.browserPrefix + "transform",
        reset = {},
        transition = {},
        transition2 = {},
        trans_val = sliderHeight * direction * -1,
        trans_val2 = (sliderHeight * direction) / modifier;
      if (this.cssActive) {
        property = this.browserPrefix + "transform";
        if (this.css3DActive) {
          reset[property] = "translate3d( 0," + trans_val + "px, 0)";
          transition[property] = "translate3d( 0," + trans_val2 + "px, 0)";
          transition2[property] = "translate3d(0,0,0)";
        } else {
          reset[property] = "translate( 0," + trans_val + "px)";
          transition[property] = "translate( 0," + trans_val2 + "px)";
          transition2[property] = "translate(0,0)";
        }
      } else {
        reset.top = trans_val;
        transition.top = trans_val2;
        transition2.top = 0;
      }
      if (dynamic) {
        transition["z-index"] = "1";
        transition2["z-index"] = "2";
      }
      this._slide_animate(reset, transition, transition2);
    },
    _slide_animate: function (reset, transition, transition2) {
      var self = this,
        displaySlide = this.$slides.eq(this.current),
        hideSlide = this.$slides.eq(this.prev);
      hideSlide.trigger("pause");
      if (!displaySlide.data("disableAutoplay")) {
        if (
          displaySlide.hasClass("av-video-lazyload") &&
          !displaySlide.hasClass("av-video-lazyload-complete")
        ) {
          displaySlide.find(".av-click-to-play-overlay").trigger("click");
        } else {
          displaySlide.trigger("play");
        }
      }
      displaySlide.css({
        visibility: "visible",
        zIndex: 4,
        opacity: 1,
        left: 0,
        top: 0,
      });
      displaySlide.css(reset);
      hideSlide.avia_animate(
        transition,
        this.options.transitionSpeed,
        this.options.easing
      );
      var after_slide = function () {
        self.isAnimating = false;
        displaySlide.addClass("active-slide");
        hideSlide
          .css({ visibility: "hidden" })
          .removeClass("active-slide next-active-slide");
        self.$slider.trigger("avia-transition-done");
      };
      if (self.options.show_slide_delay > 0) {
        setTimeout(function () {
          displaySlide.addClass("next-active-slide");
          displaySlide.avia_animate(
            transition2,
            self.options.transitionSpeed,
            self.options.easing,
            after_slide
          );
        }, self.options.show_slide_delay);
      } else {
        displaySlide.addClass("next-active-slide");
        displaySlide.avia_animate(
          transition2,
          self.options.transitionSpeed,
          self.options.easing,
          after_slide
        );
      }
    },
    _fade: function () {
      var self = this,
        displaySlide = this.$slides.eq(this.current),
        hideSlide = this.$slides.eq(this.prev),
        properties = { visibility: "visible", zIndex: 3, opacity: 0 },
        fadeCallback = function () {
          self.isAnimating = false;
          displaySlide.addClass("active-slide");
          hideSlide
            .css({ visibility: "hidden", zIndex: 2 })
            .removeClass("active-slide next-active-slide");
          self.$slider.trigger("avia-transition-done");
        };
      hideSlide.trigger("pause");
      if (!displaySlide.data("disableAutoplay")) {
        if (
          displaySlide.hasClass("av-video-lazyload") &&
          !displaySlide.hasClass("av-video-lazyload-complete")
        ) {
          displaySlide.find(".av-click-to-play-overlay").trigger("click");
        } else {
          displaySlide.trigger("play");
        }
      }
      displaySlide.addClass("next-active-slide");
      if (self.options.fullfade == true) {
        hideSlide.avia_animate({ opacity: 0 }, 200, "linear", function () {
          displaySlide
            .css(properties)
            .avia_animate(
              { opacity: 1 },
              self.options.transitionSpeed,
              "linear",
              fadeCallback
            );
        });
      } else {
        if (self.current === 0) {
          hideSlide.avia_animate(
            { opacity: 0 },
            self.options.transitionSpeed / 2,
            "linear"
          );
          displaySlide
            .css(properties)
            .avia_animate(
              { opacity: 1 },
              self.options.transitionSpeed / 2,
              "linear",
              fadeCallback
            );
        } else {
          displaySlide
            .css(properties)
            .avia_animate(
              { opacity: 1 },
              self.options.transitionSpeed / 2,
              "linear",
              function () {
                hideSlide.avia_animate(
                  { opacity: 0 },
                  200,
                  "linear",
                  fadeCallback
                );
              }
            );
        }
      }
    },
    _attach_video_events: function () {
      var self = this,
        $html = $("html");
      self.$slides.each(function (i) {
        var currentSlide = $(this),
          caption = currentSlide.find(".caption_fullwidth, .av-click-overlay"),
          mejs = currentSlide.find(".mejs-mediaelement"),
          lazyload = currentSlide.hasClass("av-video-lazyload") ? true : false;
        if (currentSlide.data("avia_video_events") != true) {
          currentSlide.data("avia_video_events", true);
          currentSlide.on(
            "av-video-events-bound",
            {
              slide: currentSlide,
              wrap: mejs,
              iteration: i,
              self: self,
              lazyload: lazyload,
            },
            onReady
          );
          currentSlide.on(
            "av-video-ended",
            { slide: currentSlide, self: self },
            onFinish
          );
          currentSlide.on("av-video-play-executed", function () {
            setTimeout(function () {
              self.pause();
            }, 100);
          });
          caption.on("click", { slide: currentSlide }, toggle);
          if (currentSlide.is(".av-video-events-bound")) {
            currentSlide.trigger("av-video-events-bound");
          }
          if (lazyload && i === 0 && !currentSlide.data("disableAutoplay")) {
            currentSlide.find(".av-click-to-play-overlay").trigger("click");
          }
        }
      });
      function onReady(event) {
        if (event.data.iteration === 0) {
          event.data.wrap.css("opacity", 0);
          if (
            !event.data.self.isMobile &&
            !event.data.slide.data("disableAutoplay")
          ) {
            event.data.slide.trigger("play");
          }
          setTimeout(function () {
            event.data.wrap.avia_animate({ opacity: 1 }, 400);
          }, 50);
        } else if (
          $html.is(".avia-msie") &&
          !event.data.slide.is(".av-video-service-html5")
        ) {
          if (!event.data.slide.data("disableAutoplay")) {
            event.data.slide.trigger("play");
          }
        }
        if (
          event.data.slide.is(".av-video-service-html5") &&
          event.data.iteration !== 0
        ) {
          event.data.slide.trigger("pause");
        }
        if (event.data.lazyload) {
          event.data.slide.addClass("av-video-lazyload-complete");
          event.data.slide.trigger("play");
        }
      }
      function onFinish(event) {
        if (
          !event.data.slide.is(".av-single-slide") &&
          !event.data.slide.is(".av-loop-video")
        ) {
          event.data.slide.trigger("reset");
          self._navigate("next");
          self.resume();
        }
        if (
          event.data.slide.is(".av-loop-video") &&
          event.data.slide.is(".av-video-service-html5")
        ) {
          if ($html.is(".avia-safari-8")) {
            setTimeout(function () {
              event.data.slide.trigger("play");
            }, 1);
          }
        }
      }
      function toggle(event) {
        if (event.target.tagName != "A") {
          event.data.slide.trigger("toggle");
        }
      }
    },
    _timer: function (callback, delay, first) {
      var self = this,
        start,
        remaining = delay;
      self.timerId = 0;
      this.pause = function () {
        window.clearTimeout(self.timerId);
        remaining -= new Date() - start;
      };
      this.resume = function () {
        start = new Date();
        self.timerId = window.setTimeout(callback, remaining);
      };
      this.destroy = function () {
        window.clearTimeout(self.timerId);
      };
      this.resume(true);
    },
    _startSlideshow: function () {
      var self = this;
      this.isPlaying = true;
      this.slideshow = new this._timer(function () {
        self._navigate("next");
        if (self.options.autoplay) {
          self._startSlideshow();
        }
      }, this.options.interval * 1000);
    },
    _stopSlideshow: function () {
      if (this.options.autoplay) {
        this.slideshow.destroy();
        this.isPlaying = false;
        this.options.autoplay = false;
      }
      this.options.autoplay = false;
      this.options.loop_autoplay = "once";
      this.$slider
        .removeClass("av-slideshow-autoplay")
        .addClass("av-slideshow-manual");
      this.$slider.removeClass("av-loop-endless").addClass("av-loop-once");
    },
    _setPermaCaptionPointer: function (e) {
      if (!this.permaCaption.length) {
        return;
      }
      var withLink = $(this.$slides[this.current]).find("a").length;
      this.permaCaption.css("cursor", withLink ? "pointer" : "default");
    },
    _routePermaCaptionClick: function (e) {
      e.preventDefault();
      var active_slide_link = $(this)
        .siblings(".avia-slideshow-inner")
        .find(">.active-slide a");
      if (active_slide_link.length) {
        active_slide_link[0].click();
      }
    },
    next: function (e) {
      e.preventDefault();
      this._stopSlideshow();
      this._navigate("next");
    },
    previous: function (e) {
      e.preventDefault();
      this._stopSlideshow();
      this._navigate("prev");
    },
    go2: function (pos) {
      if (isNaN(pos)) {
        pos.preventDefault();
        pos = pos.currentTarget.hash.replace("#", "");
      }
      pos -= 1;
      if (pos === this.current || pos >= this.itemsCount || pos < 0) {
        return false;
      }
      this._stopSlideshow();
      this._navigate(false, pos);
    },
    play: function () {
      if (!this.isPlaying) {
        this.isPlaying = true;
        this._navigate("next");
        this.options.autoplay = true;
        this._startSlideshow();
      }
    },
    pause: function () {
      if (this.isPlaying) {
        this.slideshow.pause();
      }
    },
    resume: function () {
      if (this.isPlaying) {
        this.slideshow.resume();
      }
    },
    destroy: function (callback) {
      this.slideshow.destroy(callback);
    },
  };
  $.fn.aviaSlider = function (options) {
    return this.each(function () {
      var self = $.data(this, "aviaSlider");
      if (!self) {
        self = $.data(this, "aviaSlider", new $.AviaSlider(options, this));
      }
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  var _units = [
      "years",
      "months",
      "weeks",
      "days",
      "hours",
      "minutes",
      "seconds",
    ],
    _second = 1000,
    _minute = _second * 60,
    _hour = _minute * 60,
    _day = _hour * 24,
    _week = _day * 7,
    getDaysInMonth = function (month, year) {
      return new Date(year, month, 0).getDate();
    },
    splitStartDate = function (date) {
      var result = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
      };
      return result;
    },
    getYears = function (start, endDate) {
      var diff = endDate.getFullYear() - start.year;
      if (diff > 0) {
        var check = new Date(
          start.year + diff,
          start.month - 1,
          start.day,
          start.hours,
          start.minutes,
          start.seconds
        );
        if (check > endDate) {
          diff--;
        }
      }
      return diff >= 0 ? diff : 0;
    },
    getMonths = function (start, endDate) {
      var endMonth = endDate.getMonth() + 1;
      var diff = endMonth - start.month;
      if (diff < 0) {
        diff = 12 - start.month + endMonth;
      }
      if (diff > 0) {
        var check = new Date(
          start.year,
          start.month - 1 + diff,
          start.day,
          start.hours,
          start.minutes,
          start.seconds
        );
        if (check > endDate) {
          diff--;
        }
      }
      return diff >= 0 ? diff : 0;
    },
    getDays = function (start, endDate) {
      var endDay = endDate.getDate();
      var diff = endDay - start.day;
      if (diff < 0) {
        diff = getDaysInMonth(start.month, start.year) - start.day + endDay;
      }
      if (diff > 0) {
        var check = new Date(
          start.year,
          start.month - 1,
          start.day + diff,
          start.hours,
          start.minutes,
          start.seconds
        );
        if (check > endDate) {
          diff--;
        }
      }
      return diff >= 0 ? diff : 0;
    },
    getBetween = function (startDate, endDate) {
      var start = splitStartDate(startDate),
        result = { years: 0, year_months: 0, month_months: 0, days: 0 };
      result.years = getYears(start, endDate);
      start.year += result.years;
      result.year_months = getMonths(start, endDate);
      start.month += result.year_months;
      result.days = getDays(start, endDate);
      start.day += result.days;
      result.month_months = result.years * 12 + result.year_months;
      return result;
    },
    ticker = function (_self) {
      var tmLoc = new Date(),
        _now = new Date(tmLoc.getTime() + tmLoc.getTimezoneOffset() * 60000),
        _timestamp = _self.end - _now;
      if (_timestamp <= 0) {
        clearInterval(_self.countdown);
        return;
      }
      _self.time.years = 0;
      _self.time.months = 0;
      _self.time.weeks = Math.floor(_timestamp / _week);
      _self.time.days = Math.floor((_timestamp % _week) / _day);
      _self.time.hours = Math.floor((_timestamp % _day) / _hour);
      _self.time.minutes = Math.floor((_timestamp % _hour) / _minute);
      _self.time.seconds = Math.floor((_timestamp % _minute) / _second);
      var between = getBetween(_now, _self.end);
      switch (_self.data.maximum) {
        case 1:
          _self.time.seconds = Math.floor(_timestamp / _second);
          break;
        case 2:
          _self.time.minutes = Math.floor(_timestamp / _minute);
          break;
        case 3:
          _self.time.hours = Math.floor(_timestamp / _hour);
          break;
        case 4:
          _self.time.days = Math.floor(_timestamp / _day);
          break;
        case 6:
          _self.time.days = between.days;
          _self.time.months = between.month_months;
          break;
        case 7:
          _self.time.days = between.days;
          _self.time.months = between.year_months;
          _self.time.years = between.years;
          break;
      }
      for (var i in _self.time) {
        if (typeof _self.update[i] == "object") {
          if (_self.firstrun || _self.oldtime[i] != _self.time[i]) {
            var labelkey = _self.time[i] === 1 ? "single" : "multi";
            _self.update[i].time_container.text(_self.time[i]);
            _self.update[i].label_container.text(_self.update[i][labelkey]);
          }
        }
      }
      if (_self.firstrun) {
        _self.container.addClass("av-countdown-active");
      }
      _self.oldtime = $.extend({}, _self.time);
      _self.firstrun = false;
    };
  $.fn.aviaCountdown = function (options) {
    if (!this.length) {
      return;
    }
    return this.each(function () {
      var _self = {};
      _self.update = {};
      _self.time = {};
      _self.oldtime = {};
      _self.firstrun = true;
      _self.container = $(this);
      _self.data = _self.container.data();
      _self.end = new Date(
        _self.data.year,
        _self.data.month,
        _self.data.day,
        _self.data.hour,
        _self.data.minute
      );
      if (_self.data.timezone != "0") {
        _self.end = new Date(_self.end.getTime() - _self.data.timezone * 60000);
      }
      for (var i in _units) {
        _self.update[_units[i]] = {
          time_container: _self.container.find(
            ".av-countdown-" + _units[i] + " .av-countdown-time"
          ),
          label_container: _self.container.find(
            ".av-countdown-" + _units[i] + " .av-countdown-time-label"
          ),
        };
        if (_self.update[_units[i]].label_container.length) {
          _self.update[_units[i]].single =
            _self.update[_units[i]].label_container.data("label");
          _self.update[_units[i]].multi =
            _self.update[_units[i]].label_container.data("label-multi");
        }
      }
      ticker(_self);
      _self.countdown = setInterval(function () {
        ticker(_self);
      }, 1000);
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.avia_sc_gallery = function (options) {
    return this.each(function () {
      var gallery = $(this),
        images = gallery.find("img"),
        big_prev = gallery.find(".avia-gallery-big");
      gallery.on("avia_start_animation", function () {
        images.each(function (i) {
          var image = $(this);
          setTimeout(function () {
            image.addClass("avia_start_animation");
          }, i * 110);
        });
      });
      if (gallery.hasClass("deactivate_avia_lazyload")) {
        gallery.trigger("avia_start_animation");
      }
      if (big_prev.length) {
        gallery.on("mouseenter", ".avia-gallery-thumb a", function () {
          var _self = $(this),
            newImgSrc = _self.attr("data-prev-img"),
            oldImg = big_prev.find("img"),
            oldImgSrc = oldImg.attr("src");
          if (newImgSrc == oldImgSrc) {
            return;
          }
          big_prev.height(big_prev.height());
          big_prev.attr("data-onclick", _self.attr("data-onclick"));
          big_prev.attr("href", _self.attr("href"));
          big_prev.attr("title", _self.attr("title"));
          if ("undefined" == typeof _self.data("srcset")) {
            big_prev.removeAttr("data-srcset");
            big_prev.removeData("srcset");
          } else {
            big_prev.data("srcset", _self.data("srcset"));
            big_prev.attr("data-srcset", _self.data("srcset"));
          }
          if ("undefined" == typeof _self.data("sizes")) {
            big_prev.removeAttr("data-sizes");
            big_prev.removeData("sizes");
          } else {
            big_prev.data("sizes", _self.data("sizes"));
            big_prev.attr("data-sizes", _self.data("sizes"));
          }
          var newPrev = _self.find(".big-prev-fake img").clone(true);
          if (newPrev.length == 0) {
            var next_img = new Image();
            next_img.src = newImgSrc;
            newPrev = $(next_img);
          }
          if (big_prev.hasClass("avia-gallery-big-no-crop-thumb")) {
            newPrev.css({ height: big_prev.height(), width: "auto" });
          }
          big_prev.stop().animate({ opacity: 0 }, function () {
            newPrev.insertAfter(oldImg);
            oldImg.remove();
            big_prev.animate({ opacity: 1 });
          });
        });
        big_prev.on("click", function () {
          var imagelink = gallery
            .find(".avia-gallery-thumb a")
            .eq(this.getAttribute("data-onclick") - 1);
          if (imagelink && !imagelink.hasClass("aviaopeninbrowser")) {
            imagelink.trigger("click");
          } else if (imagelink) {
            var imgurl = imagelink.attr("href");
            var secure = imagelink.hasClass("custom_link")
              ? "noopener,noreferrer"
              : "";
            if (imagelink.hasClass("aviablank") && imgurl != "") {
              window.open(imgurl, "_blank", secure);
            } else if (imgurl != "") {
              window.open(imgurl, "_self", secure);
            }
          }
          return false;
        });
        $(window).on("debouncedresize", function () {
          big_prev.height("auto");
        });
      }
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.avia_hor_gallery = function (options) {
    var defaults = {
      slide_container: ".av-horizontal-gallery-inner",
      slide_element: ".av-horizontal-gallery-slider",
      slide_content: ".av-horizontal-gallery-wrap",
      slide_arrows: ".avia-slideshow-arrows",
      slide_dots: ".avia-slideshow-dots",
      active: "av-active-gal-item",
      slide_controls: ".avia-slideshow-controls",
      prev: ".av-horizontal-gallery-prev",
      next: ".av-horizontal-gallery-next",
    };
    var options = $.extend(defaults, options);
    var win = $(window),
      browserPrefix = $.avia_utilities.supports("transition"),
      cssActive = this.browserPrefix !== false ? true : false,
      isMobile = $.avia_utilities.isMobile,
      isTouchDevice = $.avia_utilities.isTouchDevice,
      transform3d =
        document.documentElement.className.indexOf("avia_transform3d") !== -1
          ? true
          : false,
      transition = {};
    return this.each(function () {
      var container = $(this),
        slide_container = container.find(options.slide_container),
        slide_element = container.find(options.slide_element),
        slide_content = container.find(options.slide_content),
        slide_controls = container.find(options.slide_controls),
        slide_arrows = container.find(options.slide_arrows),
        slide_dots_wrap = container.find(options.slide_dots),
        slide_dots = slide_dots_wrap.find("a"),
        prev = container.find(options.prev),
        next = container.find(options.next),
        imgs = container.find("img"),
        all_elements_width = 0,
        currentIndex = false,
        slideshowOptions = {
          animation: "av-tab-slide-transition",
          autoplay: false,
          loop_autoplay: "once",
          interval: 5,
          loop_manual: "manual-endless",
          autoplay_stopper: false,
          noNavigation: false,
          initial: null,
          enlarge: 1,
        },
        slideshowData = container.data("slideshow-data"),
        timeoutIDAutoplay = null;
      if ("undefined" != typeof slideshowData) {
        slideshowOptions = $.extend({}, slideshowOptions, slideshowData);
      }
      var set_up = function () {
          var sl_height =
            (slide_container.width() / 100) * slide_container.data("av-height");
          slide_container.css({ padding: 0 }).height(sl_height);
          imgs.css("display", "inline-block");
          setTimeout(function () {
            imgs.css("display", "block");
          }, 10);
          all_elements_width = 0;
          slide_content.each(function () {
            all_elements_width += $(this).outerWidth(true);
          });
          slide_element.css("min-width", all_elements_width);
          if (currentIndex !== false) {
            change_active(currentIndex);
          }
        },
        change_active = function (index) {
          var current = slide_element.find(options.slide_content).eq(index),
            viewport = slide_container.width(),
            modifier =
              slideshowOptions.enlarge > 1 && currentIndex == index
                ? slideshowOptions.enlarge
                : 1,
            outerWidth = current.outerWidth(true) * modifier,
            margin_right = parseInt(current.css("margin-right"), 10) / 2,
            left_pos =
              viewport < all_elements_width
                ? current.position().left * -1 - outerWidth / 2 + viewport / 2
                : 0;
          left_pos = left_pos + margin_right;
          if (left_pos + all_elements_width < viewport) {
            left_pos =
              (all_elements_width -
                viewport -
                parseInt(current.css("margin-right"), 10)) *
              -1;
          }
          if (left_pos > 0) {
            left_pos = 0;
          }
          if (cssActive) {
            transition["transform"] = transform3d
              ? "translate3d( " + left_pos + "px, 0, 0 )"
              : "translate( " + left_pos + "px, 0 )";
            transition["left"] = "0px";
            slide_element.css(transition);
          } else {
            slide_element.css("left", left_pos);
          }
          slide_container
            .find("." + options.active)
            .removeClass(options.active);
          current.addClass(options.active);
          currentIndex = index;
          set_slide_arrows_visibility();
          set_slide_dots_visibility();
        },
        clearTimeoutAutoplay = function () {
          if (typeof timeoutIDAutoplay === "number") {
            clearTimeout(timeoutIDAutoplay);
          }
          timeoutIDAutoplay = null;
        },
        init_autoplay = function () {
          if (true !== slideshowOptions.autoplay) {
            container
              .removeClass("av-slideshow-autoplay")
              .addClass("av-slideshow-manual");
          }
          if (
            "undefined" == typeof slideshowOptions.loop_autoplay ||
            "endless" != slideshowOptions.loop_autoplay
          ) {
            slideshowOptions.loop_autoplay = "once";
          }
          if ("undefined" == typeof slideshowOptions.interval) {
            slideshowOptions.interval = 5;
          }
          if (
            "undefined" == typeof slideshowOptions.autoplay ||
            true !== slideshowOptions.autoplay
          ) {
            slideshowOptions.autoplay = false;
            container
              .removeClass("av-slideshow-autoplay")
              .addClass("av-slideshow-manual");
            return;
          }
          clearTimeoutAutoplay();
          timeoutIDAutoplay = setTimeout(function () {
            rotate_next_image();
          }, slideshowOptions.interval * 1000);
        },
        rotate_next_image = function () {
          timeoutIDAutoplay = null;
          if ("endless" != slideshowOptions.loop_autoplay) {
            var stop = false;
            if (currentIndex === false) {
              if (slide_content.length == 0) {
                stop = true;
              }
            } else {
              stop = currentIndex + 1 >= slide_content.length;
            }
            if (stop) {
              slideshowOptions.autoplay = false;
              slideshowOptions.loop_autoplay = "manual";
              container
                .removeClass("av-slideshow-autoplay")
                .addClass("av-slideshow-manual");
              container.removeClass("av-loop-endless").addClass("av-loop-once");
              return;
            }
          }
          next.trigger("click");
        },
        set_slide_arrows_visibility = function () {
          if (
            "endless" == slideshowOptions.loop_autoplay ||
            "manual-endless" == slideshowOptions.loop_manual ||
            false === currentIndex
          ) {
            slide_arrows.addClass("av-visible-prev");
            slide_arrows.addClass("av-visible-next");
          } else if (0 == currentIndex) {
            slide_arrows.removeClass("av-visible-prev");
            slide_arrows.addClass("av-visible-next");
          } else if (currentIndex + 1 >= slide_content.length) {
            slide_arrows.addClass("av-visible-prev");
            slide_arrows.removeClass("av-visible-next");
          } else {
            slide_arrows.addClass("av-visible-prev");
            slide_arrows.addClass("av-visible-next");
          }
        },
        set_slide_dots_visibility = function () {
          slide_dots_wrap.find("a").removeClass("active");
          var tmpIndex = false !== currentIndex ? currentIndex : 0;
          slide_dots_wrap.find("a").eq(tmpIndex).addClass("active");
        };
      slide_content.on("click", function (e) {
        var current = $(this);
        var index = slide_content.index(current);
        if (currentIndex === index) {
          return;
        }
        clearTimeoutAutoplay();
        change_active(index);
        init_autoplay();
      });
      prev.on("click", function (e) {
        var nextID = currentIndex !== false ? currentIndex - 1 : 0;
        if (nextID < 0) {
          if (
            "endless" != slideshowOptions.loop_autoplay &&
            "manual-endless" != slideshowOptions.loop_manual
          ) {
            return;
          }
          nextID = slide_content.length - 1;
        }
        clearTimeoutAutoplay();
        change_active(nextID);
        init_autoplay();
      });
      next.on("click", function (e) {
        var nextID = currentIndex !== false ? currentIndex + 1 : 0;
        if (nextID >= slide_content.length) {
          if (
            "endless" != slideshowOptions.loop_autoplay &&
            "manual-endless" != slideshowOptions.loop_manual
          ) {
            return;
          }
          nextID = 0;
        }
        clearTimeoutAutoplay();
        change_active(nextID);
        init_autoplay();
      });
      slide_dots.on("click", function (e) {
        var current = $(this);
        var index = slide_dots.index(current);
        clearTimeoutAutoplay();
        change_active(index);
        init_autoplay();
      });
      $.avia_utilities.preload({
        container: container,
        global_callback: function () {
          set_up();
          if (slideshowOptions.initial) {
            var first = parseInt(slideshowOptions.initial, 10);
            if (isNaN(first) || first < 1) {
              first = 1;
            } else if (first > slide_content.length) {
              first = slide_content.length;
            }
            change_active(first - 1);
          }
          set_slide_arrows_visibility();
          set_slide_dots_visibility();
          init_autoplay();
          setTimeout(function () {
            container.addClass("av-horizontal-gallery-animated");
          }, 10);
          win.on("debouncedresize", set_up);
        },
      });
      if (!container.hasClass("av-control-hidden")) {
        if (!isMobile) {
          container.avia_keyboard_controls({
            37: options.prev,
            39: options.next,
          });
        }
        if (isMobile || isTouchDevice) {
          container.avia_swipe_trigger({
            prev: options.prev,
            next: options.next,
          });
        }
      }
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.AviaTextRotator = function (options, slider) {
    this.$win = $(window);
    this.$slider = $(slider);
    this.$inner = this.$slider.find(".av-rotator-text");
    this.$slides = this.$inner.find(".av-rotator-text-single");
    this.$current = this.$slides.eq(0);
    this.open = 0;
    this.count = this.$slides.length;
    if ($.avia_utilities.supported.transition === undefined) {
      $.avia_utilities.supported.transition =
        $.avia_utilities.supports("transition");
    }
    this.browserPrefix = $.avia_utilities.supported.transition;
    this.cssActive = this.browserPrefix !== false ? true : false;
    (this.property = this.browserPrefix + "transform"), this._init(options);
  };
  $.AviaTextRotator.prototype = {
    _init: function (options) {
      var _self = this;
      if (this.count <= 1) return;
      _self.options = $.extend({}, options, this.$slider.data());
      _self.$inner.addClass("av-rotation-active");
      _self._autoplay();
      if (_self.options.animation == "typewriter") {
        _self.$slider.addClass("av-caret av-blinking-caret");
      }
    },
    _autoplay: function () {
      var _self = this;
      _self.autoplay = setTimeout(function () {
        _self.open = _self.open === false ? 0 : _self.open + 1;
        if (_self.open >= _self.count) _self.open = 0;
        if (_self.options.animation != "typewriter") {
          _self._move({}, _self.open);
          _self._autoplay();
        } else {
          _self._typewriter();
        }
      }, _self.options.interval * 1000);
    },
    _typewriter: function (event) {
      var _self = this;
      _self.$current.css("background-color", _self.$current.css("color"));
      _self.$slider
        .removeClass("av-caret av-blinking-caret")
        .addClass("av-marked-text");
      setTimeout(function () {
        _self.$slider
          .addClass("av-caret av-blinking-caret")
          .removeClass("av-marked-text");
        _self.$current.data("av_typewriter_text", _self.$current.html());
        _self.$current.css("background-color", "transparent");
        _self.$current.html("");
      }, 800);
      setTimeout(function () {
        _self.$slider.removeClass("av-blinking-caret");
        _self.$next = _self.$slides.eq(_self.open);
        var content =
          _self.$next.data("av_typewriter_text") || _self.$next.html();
        content = content.replace(/&amp;/g, "&");
        _self.$current.css({ display: "none" });
        _self.$next.css({ display: "inline" });
        _self.$next.html("");
        var i = 0;
        var speed = 50;
        function typeWriter() {
          if (i < content.length) {
            _self.$next[0].innerHTML += content.charAt(i);
            i++;
            setTimeout(typeWriter, speed + Math.floor(Math.random() * 100));
          } else {
            _self.$slider.addClass("av-caret av-blinking-caret");
            _self.$current = _self.$slides.eq(_self.open);
            _self._autoplay();
          }
        }
        typeWriter();
      }, 1500);
    },
    _move: function (event) {
      var _self = this,
        modifier = 30 * _self.options.animation,
        fade_out = { opacity: 0 },
        fade_start = { display: "inline-block", opacity: 0 },
        fade_in = { opacity: 1 };
      this.$next = _self.$slides.eq(this.open);
      if (this.cssActive) {
        fade_out[_self.property] = "translate(0px," + modifier + "px)";
        fade_start[_self.property] = "translate(0px," + modifier * -1 + "px)";
        fade_in[_self.property] = "translate(0px,0px)";
      } else {
        fade_out["top"] = modifier;
        fade_start["top"] = modifier * -1;
        fade_in["top"] = 0;
      }
      _self.$current.avia_animate(fade_out, function () {
        _self.$current.css({ display: "none" });
        _self.$next.css(fade_start).avia_animate(fade_in, function () {
          _self.$current = _self.$slides.eq(_self.open);
        });
      });
    },
  };
  $.fn.avia_textrotator = function (options) {
    return this.each(function () {
      var active = $.data(this, "AviaTextRotator");
      if (!active) {
        $.data(this, "AviaTextRotator", 1);
        new $.AviaTextRotator(options, this);
      }
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $(window).on("load", function (e) {
    $(".avia-icon-grid-container").avia_sc_icongrid();
  });
  $.fn.avia_sc_icongrid = function (options) {
    return this.each(function () {
      var icongrid_container = $(this),
        icongrid = icongrid_container.find(".avia-icongrid"),
        icongrid_id = "#" + icongrid.attr("id"),
        flipbox = icongrid_container.find(".avia-icongrid-flipbox"),
        flipbox_cards = $(".avia-icongrid-flipbox li"),
        methods = {};
      flipbox_cards.on("touchend", function (e) {
        var current = $(this),
          container = current.closest(".avia-icongrid-flipbox");
        if (current.hasClass("avia-hover")) {
          container.find("li").removeClass("avia-hover");
        } else {
          container.find("li").removeClass("avia-hover");
          current.addClass("avia-hover");
        }
        var links = current.find("a");
        if (links.length > 0) {
          links
            .off("touchend.aviaIconGridLink")
            .on("touchend.aviaIconGridLink", function (e) {
              e.preventDefault();
              e.stopImmediatePropagation();
              var link = $(this);
              link.css("opacity", 0.5);
              window.location.href = link.attr("href");
            });
        }
        e.preventDefault();
        e.stopImmediatePropagation();
      });
      if (flipbox.hasClass("avia_flip_force_close")) {
        $("body").on("touchend", function (e) {
          var flipboxes = $(".avia-icongrid-flipbox.avia_flip_force_close");
          flipboxes.each(function () {
            var flipbox = $(this);
            flipbox.find("li").removeClass("avia-hover");
          });
        });
      }
      methods = {
        buildIconGrid: function () {
          this.setMinHeight($(icongrid_id + " li article"));
          if (icongrid.hasClass("avia-icongrid-flipbox")) {
            this.createFlipBackground($(icongrid_id + " li"));
          }
        },
        setMinHeight: function (els) {
          if (els.length < 2) {
            return;
          }
          var elsHeights = new Array();
          els.css("min-height", "0").each(function (i) {
            var current = icongrid.hasClass("avia-icongrid-flipbox")
              ? $(this)
              : $(this).find(".avia-icongrid-front");
            var currentHeight = current.outerHeight(true);
            elsHeights.push(currentHeight);
          });
          var largest = Math.max.apply(null, elsHeights);
          els.css("min-height", largest);
        },
        createFlipBackground: function (els) {
          els.each(function (index, element) {
            var back = $(this).find(".avia-icongrid-content");
            if (back.length > 0) {
              if ($(this).find(".avia-icongrid-flipback").length <= 0) {
                var flipback = back
                  .clone()
                  .addClass("avia-icongrid-flipback")
                  .removeClass("avia-icongrid-content");
                back.after(flipback);
              }
            }
          });
        },
      };
      methods.buildIconGrid();
      $(window).on("debouncedresize", function () {
        methods.buildIconGrid();
      });
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.avia_sc_iconlist = function (options) {
    return this.each(function () {
      var iconlist = $(this),
        elements = iconlist.find(">li");
      iconlist.on("avia_start_animation", function () {
        elements.each(function (i) {
          var element = $(this);
          setTimeout(function () {
            element.addClass("avia_start_animation");
          }, i * 350);
        });
      });
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.aviaHotspots = function (options) {
    if (!this.length) {
      return;
    }
    return this.each(function () {
      var _self = {};
      _self.container = $(this);
      _self.hotspots = _self.container.find(".av-image-hotspot");
      _self.container.on("avia_start_animation", function () {
        setTimeout(function () {
          _self.hotspots.each(function (i) {
            var current = $(this);
            setTimeout(function () {
              current.addClass("av-display-hotspot");
            }, 300 * i);
          });
        }, 400);
      });
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  var animating = false,
    methods = {
      switchMag: function (clicked, _self) {
        var current = $(clicked);
        if (current.is(".active_sort") || animating) {
          return;
        }
        var filter = current.data("filter"),
          oldContainer = _self.container.filter(":visible"),
          newContainer = _self.container.filter("." + filter);
        animating = true;
        _self.sort_buttons.removeClass("active_sort");
        current.addClass("active_sort");
        _self.magazine.height(_self.magazine.outerHeight());
        oldContainer.avia_animate({ opacity: 0 }, 200, function () {
          oldContainer.css({ display: "none" });
          newContainer
            .css({ opacity: 0, display: "block" })
            .avia_animate({ opacity: 1 }, 150, function () {
              _self.magazine.avia_animate(
                {
                  height:
                    newContainer.outerHeight() + _self.sort_bar.outerHeight(),
                },
                150,
                function () {
                  _self.magazine.height("auto");
                  animating = false;
                }
              );
            });
        });
      },
    };
  $.fn.aviaMagazine = function (options) {
    if (!this.length) {
      return;
    }
    return this.each(function () {
      var _self = {};
      (_self.magazine = $(this)),
        (_self.sort_buttons = _self.magazine.find(".av-magazine-sort a"));
      _self.container = _self.magazine.find(".av-magazine-group");
      _self.sort_bar = _self.magazine.find(".av-magazine-top-bar");
      _self.sort_buttons.each(function (i) {
        var current = $(this),
          filter = current.data("filter"),
          entry = _self.container.filter("." + filter);
        if (entry.length == 0 || entry.html().trim() == "") {
          current.hide();
          current.prev("span.text-sep").hide();
        }
      });
      _self.sort_buttons.on("click", function (e) {
        e.preventDefault();
        methods.switchMag(this, _self);
      });
    });
  };
})(jQuery);
/*!
 * Isotope PACKAGED v3.0.6
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * https://isotope.metafizzy.co
 * Copyright 2010-2018 Metafizzy
 */
!(function (t, e) {
  "function" == typeof define && define.amd
    ? define("jquery-bridget/jquery-bridget", ["jquery"], function (i) {
        return e(t, i);
      })
    : "object" == typeof module && module.exports
    ? (module.exports = e(t, require("jquery")))
    : (t.jQueryBridget = e(t, t.jQuery));
})(window, function (t, e) {
  "use strict";
  function i(i, s, a) {
    function u(t, e, o) {
      var n,
        s = "$()." + i + '("' + e + '")';
      return (
        t.each(function (t, u) {
          var h = a.data(u, i);
          if (!h)
            return void r(
              i + " not initialized. Cannot call methods, i.e. " + s
            );
          var d = h[e];
          if (!d || "_" == e.charAt(0))
            return void r(s + " is not a valid method");
          var l = d.apply(h, o);
          n = void 0 === n ? l : n;
        }),
        void 0 !== n ? n : t
      );
    }
    function h(t, e) {
      t.each(function (t, o) {
        var n = a.data(o, i);
        n ? (n.option(e), n._init()) : ((n = new s(o, e)), a.data(o, i, n));
      });
    }
    (a = a || e || t.jQuery),
      a &&
        (s.prototype.option ||
          (s.prototype.option = function (t) {
            a.isPlainObject(t) &&
              (this.options = a.extend(!0, this.options, t));
          }),
        (a.fn[i] = function (t) {
          if ("string" == typeof t) {
            var e = n.call(arguments, 1);
            return u(this, t, e);
          }
          return h(this, t), this;
        }),
        o(a));
  }
  function o(t) {
    !t || (t && t.bridget) || (t.bridget = i);
  }
  var n = Array.prototype.slice,
    s = t.console,
    r =
      "undefined" == typeof s
        ? function () {}
        : function (t) {
            s.error(t);
          };
  return o(e || t.jQuery), i;
}),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define("ev-emitter/ev-emitter", e)
      : "object" == typeof module && module.exports
      ? (module.exports = e())
      : (t.EvEmitter = e());
  })("undefined" != typeof window ? window : this, function () {
    function t() {}
    var e = t.prototype;
    return (
      (e.on = function (t, e) {
        if (t && e) {
          var i = (this._events = this._events || {}),
            o = (i[t] = i[t] || []);
          return o.indexOf(e) == -1 && o.push(e), this;
        }
      }),
      (e.once = function (t, e) {
        if (t && e) {
          this.on(t, e);
          var i = (this._onceEvents = this._onceEvents || {}),
            o = (i[t] = i[t] || {});
          return (o[e] = !0), this;
        }
      }),
      (e.off = function (t, e) {
        var i = this._events && this._events[t];
        if (i && i.length) {
          var o = i.indexOf(e);
          return o != -1 && i.splice(o, 1), this;
        }
      }),
      (e.emitEvent = function (t, e) {
        var i = this._events && this._events[t];
        if (i && i.length) {
          (i = i.slice(0)), (e = e || []);
          for (
            var o = this._onceEvents && this._onceEvents[t], n = 0;
            n < i.length;
            n++
          ) {
            var s = i[n],
              r = o && o[s];
            r && (this.off(t, s), delete o[s]), s.apply(this, e);
          }
          return this;
        }
      }),
      (e.allOff = function () {
        delete this._events, delete this._onceEvents;
      }),
      t
    );
  }),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define("get-size/get-size", e)
      : "object" == typeof module && module.exports
      ? (module.exports = e())
      : (t.getSize = e());
  })(window, function () {
    "use strict";
    function t(t) {
      var e = parseFloat(t),
        i = t.indexOf("%") == -1 && !isNaN(e);
      return i && e;
    }
    function e() {}
    function i() {
      for (
        var t = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0,
          },
          e = 0;
        e < h;
        e++
      ) {
        var i = u[e];
        t[i] = 0;
      }
      return t;
    }
    function o(t) {
      var e = getComputedStyle(t);
      return (
        e ||
          a(
            "Style returned " +
              e +
              ". Are you running this code in a hidden iframe on Firefox? See https://bit.ly/getsizebug1"
          ),
        e
      );
    }
    function n() {
      if (!d) {
        d = !0;
        var e = document.createElement("div");
        (e.style.width = "200px"),
          (e.style.padding = "1px 2px 3px 4px"),
          (e.style.borderStyle = "solid"),
          (e.style.borderWidth = "1px 2px 3px 4px"),
          (e.style.boxSizing = "border-box");
        var i = document.body || document.documentElement;
        i.appendChild(e);
        var n = o(e);
        (r = 200 == Math.round(t(n.width))),
          (s.isBoxSizeOuter = r),
          i.removeChild(e);
      }
    }
    function s(e) {
      if (
        (n(),
        "string" == typeof e && (e = document.querySelector(e)),
        e && "object" == typeof e && e.nodeType)
      ) {
        var s = o(e);
        if ("none" == s.display) return i();
        var a = {};
        (a.width = e.offsetWidth), (a.height = e.offsetHeight);
        for (
          var d = (a.isBorderBox = "border-box" == s.boxSizing), l = 0;
          l < h;
          l++
        ) {
          var f = u[l],
            c = s[f],
            m = parseFloat(c);
          a[f] = isNaN(m) ? 0 : m;
        }
        var p = a.paddingLeft + a.paddingRight,
          y = a.paddingTop + a.paddingBottom,
          g = a.marginLeft + a.marginRight,
          v = a.marginTop + a.marginBottom,
          _ = a.borderLeftWidth + a.borderRightWidth,
          z = a.borderTopWidth + a.borderBottomWidth,
          I = d && r,
          x = t(s.width);
        x !== !1 && (a.width = x + (I ? 0 : p + _));
        var S = t(s.height);
        return (
          S !== !1 && (a.height = S + (I ? 0 : y + z)),
          (a.innerWidth = a.width - (p + _)),
          (a.innerHeight = a.height - (y + z)),
          (a.outerWidth = a.width + g),
          (a.outerHeight = a.height + v),
          a
        );
      }
    }
    var r,
      a =
        "undefined" == typeof console
          ? e
          : function (t) {
              console.error(t);
            },
      u = [
        "paddingLeft",
        "paddingRight",
        "paddingTop",
        "paddingBottom",
        "marginLeft",
        "marginRight",
        "marginTop",
        "marginBottom",
        "borderLeftWidth",
        "borderRightWidth",
        "borderTopWidth",
        "borderBottomWidth",
      ],
      h = u.length,
      d = !1;
    return s;
  }),
  (function (t, e) {
    "use strict";
    "function" == typeof define && define.amd
      ? define("desandro-matches-selector/matches-selector", e)
      : "object" == typeof module && module.exports
      ? (module.exports = e())
      : (t.matchesSelector = e());
  })(window, function () {
    "use strict";
    var t = (function () {
      var t = window.Element.prototype;
      if (t.matches) return "matches";
      if (t.matchesSelector) return "matchesSelector";
      for (var e = ["webkit", "moz", "ms", "o"], i = 0; i < e.length; i++) {
        var o = e[i],
          n = o + "MatchesSelector";
        if (t[n]) return n;
      }
    })();
    return function (e, i) {
      return e[t](i);
    };
  }),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define(
          "fizzy-ui-utils/utils",
          ["desandro-matches-selector/matches-selector"],
          function (i) {
            return e(t, i);
          }
        )
      : "object" == typeof module && module.exports
      ? (module.exports = e(t, require("desandro-matches-selector")))
      : (t.fizzyUIUtils = e(t, t.matchesSelector));
  })(window, function (t, e) {
    var i = {};
    (i.extend = function (t, e) {
      for (var i in e) t[i] = e[i];
      return t;
    }),
      (i.modulo = function (t, e) {
        return ((t % e) + e) % e;
      });
    var o = Array.prototype.slice;
    (i.makeArray = function (t) {
      if (Array.isArray(t)) return t;
      if (null === t || void 0 === t) return [];
      var e = "object" == typeof t && "number" == typeof t.length;
      return e ? o.call(t) : [t];
    }),
      (i.removeFrom = function (t, e) {
        var i = t.indexOf(e);
        i != -1 && t.splice(i, 1);
      }),
      (i.getParent = function (t, i) {
        for (; t.parentNode && t != document.body; )
          if (((t = t.parentNode), e(t, i))) return t;
      }),
      (i.getQueryElement = function (t) {
        return "string" == typeof t ? document.querySelector(t) : t;
      }),
      (i.handleEvent = function (t) {
        var e = "on" + t.type;
        this[e] && this[e](t);
      }),
      (i.filterFindElements = function (t, o) {
        t = i.makeArray(t);
        var n = [];
        return (
          t.forEach(function (t) {
            if (t instanceof HTMLElement) {
              if (!o) return void n.push(t);
              e(t, o) && n.push(t);
              for (var i = t.querySelectorAll(o), s = 0; s < i.length; s++)
                n.push(i[s]);
            }
          }),
          n
        );
      }),
      (i.debounceMethod = function (t, e, i) {
        i = i || 100;
        var o = t.prototype[e],
          n = e + "Timeout";
        t.prototype[e] = function () {
          var t = this[n];
          clearTimeout(t);
          var e = arguments,
            s = this;
          this[n] = setTimeout(function () {
            o.apply(s, e), delete s[n];
          }, i);
        };
      }),
      (i.docReady = function (t) {
        var e = document.readyState;
        "complete" == e || "interactive" == e
          ? setTimeout(t)
          : document.addEventListener("DOMContentLoaded", t);
      }),
      (i.toDashed = function (t) {
        return t
          .replace(/(.)([A-Z])/g, function (t, e, i) {
            return e + "-" + i;
          })
          .toLowerCase();
      });
    var n = t.console;
    return (
      (i.htmlInit = function (e, o) {
        i.docReady(function () {
          var s = i.toDashed(o),
            r = "data-" + s,
            a = document.querySelectorAll("[" + r + "]"),
            u = document.querySelectorAll(".js-" + s),
            h = i.makeArray(a).concat(i.makeArray(u)),
            d = r + "-options",
            l = t.jQuery;
          h.forEach(function (t) {
            var i,
              s = t.getAttribute(r) || t.getAttribute(d);
            try {
              i = s && JSON.parse(s);
            } catch (a) {
              return void (
                n &&
                n.error("Error parsing " + r + " on " + t.className + ": " + a)
              );
            }
            var u = new e(t, i);
            l && l.data(t, o, u);
          });
        });
      }),
      i
    );
  }),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define(
          "outlayer/item",
          ["ev-emitter/ev-emitter", "get-size/get-size"],
          e
        )
      : "object" == typeof module && module.exports
      ? (module.exports = e(require("ev-emitter"), require("get-size")))
      : ((t.Outlayer = {}), (t.Outlayer.Item = e(t.EvEmitter, t.getSize)));
  })(window, function (t, e) {
    "use strict";
    function i(t) {
      for (var e in t) return !1;
      return (e = null), !0;
    }
    function o(t, e) {
      t &&
        ((this.element = t),
        (this.layout = e),
        (this.position = { x: 0, y: 0 }),
        this._create());
    }
    function n(t) {
      return t.replace(/([A-Z])/g, function (t) {
        return "-" + t.toLowerCase();
      });
    }
    var s = document.documentElement.style,
      r = "string" == typeof s.transition ? "transition" : "WebkitTransition",
      a = "string" == typeof s.transform ? "transform" : "WebkitTransform",
      u = {
        WebkitTransition: "webkitTransitionEnd",
        transition: "transitionend",
      }[r],
      h = {
        transform: a,
        transition: r,
        transitionDuration: r + "Duration",
        transitionProperty: r + "Property",
        transitionDelay: r + "Delay",
      },
      d = (o.prototype = Object.create(t.prototype));
    (d.constructor = o),
      (d._create = function () {
        (this._transn = { ingProperties: {}, clean: {}, onEnd: {} }),
          this.css({ position: "absolute" });
      }),
      (d.handleEvent = function (t) {
        var e = "on" + t.type;
        this[e] && this[e](t);
      }),
      (d.getSize = function () {
        this.size = e(this.element);
      }),
      (d.css = function (t) {
        var e = this.element.style;
        for (var i in t) {
          var o = h[i] || i;
          e[o] = t[i];
        }
      }),
      (d.getPosition = function () {
        var t = getComputedStyle(this.element),
          e = this.layout._getOption("originLeft"),
          i = this.layout._getOption("originTop"),
          o = t[e ? "left" : "right"],
          n = t[i ? "top" : "bottom"],
          s = parseFloat(o),
          r = parseFloat(n),
          a = this.layout.size;
        o.indexOf("%") != -1 && (s = (s / 100) * a.width),
          n.indexOf("%") != -1 && (r = (r / 100) * a.height),
          (s = isNaN(s) ? 0 : s),
          (r = isNaN(r) ? 0 : r),
          (s -= e ? a.paddingLeft : a.paddingRight),
          (r -= i ? a.paddingTop : a.paddingBottom),
          (this.position.x = s),
          (this.position.y = r);
      }),
      (d.layoutPosition = function () {
        var t = this.layout.size,
          e = {},
          i = this.layout._getOption("originLeft"),
          o = this.layout._getOption("originTop"),
          n = i ? "paddingLeft" : "paddingRight",
          s = i ? "left" : "right",
          r = i ? "right" : "left",
          a = this.position.x + t[n];
        (e[s] = this.getXValue(a)), (e[r] = "");
        var u = o ? "paddingTop" : "paddingBottom",
          h = o ? "top" : "bottom",
          d = o ? "bottom" : "top",
          l = this.position.y + t[u];
        (e[h] = this.getYValue(l)),
          (e[d] = ""),
          this.css(e),
          this.emitEvent("layout", [this]);
      }),
      (d.getXValue = function (t) {
        var e = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && !e
          ? (t / this.layout.size.width) * 100 + "%"
          : t + "px";
      }),
      (d.getYValue = function (t) {
        var e = this.layout._getOption("horizontal");
        return this.layout.options.percentPosition && e
          ? (t / this.layout.size.height) * 100 + "%"
          : t + "px";
      }),
      (d._transitionTo = function (t, e) {
        this.getPosition();
        var i = this.position.x,
          o = this.position.y,
          n = t == this.position.x && e == this.position.y;
        if ((this.setPosition(t, e), n && !this.isTransitioning))
          return void this.layoutPosition();
        var s = t - i,
          r = e - o,
          a = {};
        (a.transform = this.getTranslate(s, r)),
          this.transition({
            to: a,
            onTransitionEnd: { transform: this.layoutPosition },
            isCleaning: !0,
          });
      }),
      (d.getTranslate = function (t, e) {
        var i = this.layout._getOption("originLeft"),
          o = this.layout._getOption("originTop");
        return (
          (t = i ? t : -t),
          (e = o ? e : -e),
          "translate3d(" + t + "px, " + e + "px, 0)"
        );
      }),
      (d.goTo = function (t, e) {
        this.setPosition(t, e), this.layoutPosition();
      }),
      (d.moveTo = d._transitionTo),
      (d.setPosition = function (t, e) {
        (this.position.x = parseFloat(t)), (this.position.y = parseFloat(e));
      }),
      (d._nonTransition = function (t) {
        this.css(t.to), t.isCleaning && this._removeStyles(t.to);
        for (var e in t.onTransitionEnd) t.onTransitionEnd[e].call(this);
      }),
      (d.transition = function (t) {
        if (!parseFloat(this.layout.options.transitionDuration))
          return void this._nonTransition(t);
        var e = this._transn;
        for (var i in t.onTransitionEnd) e.onEnd[i] = t.onTransitionEnd[i];
        for (i in t.to)
          (e.ingProperties[i] = !0), t.isCleaning && (e.clean[i] = !0);
        if (t.from) {
          this.css(t.from);
          var o = this.element.offsetHeight;
          o = null;
        }
        this.enableTransition(t.to),
          this.css(t.to),
          (this.isTransitioning = !0);
      });
    var l = "opacity," + n(a);
    (d.enableTransition = function () {
      if (!this.isTransitioning) {
        var t = this.layout.options.transitionDuration;
        (t = "number" == typeof t ? t + "ms" : t),
          this.css({
            transitionProperty: l,
            transitionDuration: t,
            transitionDelay: this.staggerDelay || 0,
          }),
          this.element.addEventListener(u, this, !1);
      }
    }),
      (d.onwebkitTransitionEnd = function (t) {
        this.ontransitionend(t);
      }),
      (d.onotransitionend = function (t) {
        this.ontransitionend(t);
      });
    var f = { "-webkit-transform": "transform" };
    (d.ontransitionend = function (t) {
      if (t.target === this.element) {
        var e = this._transn,
          o = f[t.propertyName] || t.propertyName;
        if (
          (delete e.ingProperties[o],
          i(e.ingProperties) && this.disableTransition(),
          o in e.clean &&
            ((this.element.style[t.propertyName] = ""), delete e.clean[o]),
          o in e.onEnd)
        ) {
          var n = e.onEnd[o];
          n.call(this), delete e.onEnd[o];
        }
        this.emitEvent("transitionEnd", [this]);
      }
    }),
      (d.disableTransition = function () {
        this.removeTransitionStyles(),
          this.element.removeEventListener(u, this, !1),
          (this.isTransitioning = !1);
      }),
      (d._removeStyles = function (t) {
        var e = {};
        for (var i in t) e[i] = "";
        this.css(e);
      });
    var c = {
      transitionProperty: "",
      transitionDuration: "",
      transitionDelay: "",
    };
    return (
      (d.removeTransitionStyles = function () {
        this.css(c);
      }),
      (d.stagger = function (t) {
        (t = isNaN(t) ? 0 : t), (this.staggerDelay = t + "ms");
      }),
      (d.removeElem = function () {
        this.element.parentNode.removeChild(this.element),
          this.css({ display: "" }),
          this.emitEvent("remove", [this]);
      }),
      (d.remove = function () {
        return r && parseFloat(this.layout.options.transitionDuration)
          ? (this.once("transitionEnd", function () {
              this.removeElem();
            }),
            void this.hide())
          : void this.removeElem();
      }),
      (d.reveal = function () {
        delete this.isHidden, this.css({ display: "" });
        var t = this.layout.options,
          e = {},
          i = this.getHideRevealTransitionEndProperty("visibleStyle");
        (e[i] = this.onRevealTransitionEnd),
          this.transition({
            from: t.hiddenStyle,
            to: t.visibleStyle,
            isCleaning: !0,
            onTransitionEnd: e,
          });
      }),
      (d.onRevealTransitionEnd = function () {
        this.isHidden || this.emitEvent("reveal");
      }),
      (d.getHideRevealTransitionEndProperty = function (t) {
        var e = this.layout.options[t];
        if (e.opacity) return "opacity";
        for (var i in e) return i;
      }),
      (d.hide = function () {
        (this.isHidden = !0), this.css({ display: "" });
        var t = this.layout.options,
          e = {},
          i = this.getHideRevealTransitionEndProperty("hiddenStyle");
        (e[i] = this.onHideTransitionEnd),
          this.transition({
            from: t.visibleStyle,
            to: t.hiddenStyle,
            isCleaning: !0,
            onTransitionEnd: e,
          });
      }),
      (d.onHideTransitionEnd = function () {
        this.isHidden &&
          (this.css({ display: "none" }), this.emitEvent("hide"));
      }),
      (d.destroy = function () {
        this.css({
          position: "",
          left: "",
          right: "",
          top: "",
          bottom: "",
          transition: "",
          transform: "",
        });
      }),
      o
    );
  }),
  (function (t, e) {
    "use strict";
    "function" == typeof define && define.amd
      ? define(
          "outlayer/outlayer",
          [
            "ev-emitter/ev-emitter",
            "get-size/get-size",
            "fizzy-ui-utils/utils",
            "./item",
          ],
          function (i, o, n, s) {
            return e(t, i, o, n, s);
          }
        )
      : "object" == typeof module && module.exports
      ? (module.exports = e(
          t,
          require("ev-emitter"),
          require("get-size"),
          require("fizzy-ui-utils"),
          require("./item")
        ))
      : (t.Outlayer = e(
          t,
          t.EvEmitter,
          t.getSize,
          t.fizzyUIUtils,
          t.Outlayer.Item
        ));
  })(window, function (t, e, i, o, n) {
    "use strict";
    function s(t, e) {
      var i = o.getQueryElement(t);
      if (!i)
        return void (
          u &&
          u.error(
            "Bad element for " + this.constructor.namespace + ": " + (i || t)
          )
        );
      (this.element = i),
        h && (this.$element = h(this.element)),
        (this.options = o.extend({}, this.constructor.defaults)),
        this.option(e);
      var n = ++l;
      (this.element.outlayerGUID = n), (f[n] = this), this._create();
      var s = this._getOption("initLayout");
      s && this.layout();
    }
    function r(t) {
      function e() {
        t.apply(this, arguments);
      }
      return (
        (e.prototype = Object.create(t.prototype)),
        (e.prototype.constructor = e),
        e
      );
    }
    function a(t) {
      if ("number" == typeof t) return t;
      var e = t.match(/(^\d*\.?\d*)(\w*)/),
        i = e && e[1],
        o = e && e[2];
      if (!i.length) return 0;
      i = parseFloat(i);
      var n = m[o] || 1;
      return i * n;
    }
    var u = t.console,
      h = t.jQuery,
      d = function () {},
      l = 0,
      f = {};
    (s.namespace = "outlayer"),
      (s.Item = n),
      (s.defaults = {
        containerStyle: { position: "relative" },
        initLayout: !0,
        originLeft: !0,
        originTop: !0,
        resize: !0,
        resizeContainer: !0,
        transitionDuration: "0.4s",
        hiddenStyle: { opacity: 0, transform: "scale(0.001)" },
        visibleStyle: { opacity: 1, transform: "scale(1)" },
      });
    var c = s.prototype;
    o.extend(c, e.prototype),
      (c.option = function (t) {
        o.extend(this.options, t);
      }),
      (c._getOption = function (t) {
        var e = this.constructor.compatOptions[t];
        return e && void 0 !== this.options[e]
          ? this.options[e]
          : this.options[t];
      }),
      (s.compatOptions = {
        initLayout: "isInitLayout",
        horizontal: "isHorizontal",
        layoutInstant: "isLayoutInstant",
        originLeft: "isOriginLeft",
        originTop: "isOriginTop",
        resize: "isResizeBound",
        resizeContainer: "isResizingContainer",
      }),
      (c._create = function () {
        this.reloadItems(),
          (this.stamps = []),
          this.stamp(this.options.stamp),
          o.extend(this.element.style, this.options.containerStyle);
        var t = this._getOption("resize");
        t && this.bindResize();
      }),
      (c.reloadItems = function () {
        this.items = this._itemize(this.element.children);
      }),
      (c._itemize = function (t) {
        for (
          var e = this._filterFindItemElements(t),
            i = this.constructor.Item,
            o = [],
            n = 0;
          n < e.length;
          n++
        ) {
          var s = e[n],
            r = new i(s, this);
          o.push(r);
        }
        return o;
      }),
      (c._filterFindItemElements = function (t) {
        return o.filterFindElements(t, this.options.itemSelector);
      }),
      (c.getItemElements = function () {
        return this.items.map(function (t) {
          return t.element;
        });
      }),
      (c.layout = function () {
        this._resetLayout(), this._manageStamps();
        var t = this._getOption("layoutInstant"),
          e = void 0 !== t ? t : !this._isLayoutInited;
        this.layoutItems(this.items, e), (this._isLayoutInited = !0);
      }),
      (c._init = c.layout),
      (c._resetLayout = function () {
        this.getSize();
      }),
      (c.getSize = function () {
        this.size = i(this.element);
      }),
      (c._getMeasurement = function (t, e) {
        var o,
          n = this.options[t];
        n
          ? ("string" == typeof n
              ? (o = this.element.querySelector(n))
              : n instanceof HTMLElement && (o = n),
            (this[t] = o ? i(o)[e] : n))
          : (this[t] = 0);
      }),
      (c.layoutItems = function (t, e) {
        (t = this._getItemsForLayout(t)),
          this._layoutItems(t, e),
          this._postLayout();
      }),
      (c._getItemsForLayout = function (t) {
        return t.filter(function (t) {
          return !t.isIgnored;
        });
      }),
      (c._layoutItems = function (t, e) {
        if ((this._emitCompleteOnItems("layout", t), t && t.length)) {
          var i = [];
          t.forEach(function (t) {
            var o = this._getItemLayoutPosition(t);
            (o.item = t), (o.isInstant = e || t.isLayoutInstant), i.push(o);
          }, this),
            this._processLayoutQueue(i);
        }
      }),
      (c._getItemLayoutPosition = function () {
        return { x: 0, y: 0 };
      }),
      (c._processLayoutQueue = function (t) {
        this.updateStagger(),
          t.forEach(function (t, e) {
            this._positionItem(t.item, t.x, t.y, t.isInstant, e);
          }, this);
      }),
      (c.updateStagger = function () {
        var t = this.options.stagger;
        return null === t || void 0 === t
          ? void (this.stagger = 0)
          : ((this.stagger = a(t)), this.stagger);
      }),
      (c._positionItem = function (t, e, i, o, n) {
        o ? t.goTo(e, i) : (t.stagger(n * this.stagger), t.moveTo(e, i));
      }),
      (c._postLayout = function () {
        this.resizeContainer();
      }),
      (c.resizeContainer = function () {
        var t = this._getOption("resizeContainer");
        if (t) {
          var e = this._getContainerSize();
          e &&
            (this._setContainerMeasure(e.width, !0),
            this._setContainerMeasure(e.height, !1));
        }
      }),
      (c._getContainerSize = d),
      (c._setContainerMeasure = function (t, e) {
        if (void 0 !== t) {
          var i = this.size;
          i.isBorderBox &&
            (t += e
              ? i.paddingLeft +
                i.paddingRight +
                i.borderLeftWidth +
                i.borderRightWidth
              : i.paddingBottom +
                i.paddingTop +
                i.borderTopWidth +
                i.borderBottomWidth),
            (t = Math.max(t, 0)),
            (this.element.style[e ? "width" : "height"] = t + "px");
        }
      }),
      (c._emitCompleteOnItems = function (t, e) {
        function i() {
          n.dispatchEvent(t + "Complete", null, [e]);
        }
        function o() {
          r++, r == s && i();
        }
        var n = this,
          s = e.length;
        if (!e || !s) return void i();
        var r = 0;
        e.forEach(function (e) {
          e.once(t, o);
        });
      }),
      (c.dispatchEvent = function (t, e, i) {
        var o = e ? [e].concat(i) : i;
        if ((this.emitEvent(t, o), h))
          if (((this.$element = this.$element || h(this.element)), e)) {
            var n = h.Event(e);
            (n.type = t), this.$element.trigger(n, i);
          } else this.$element.trigger(t, i);
      }),
      (c.ignore = function (t) {
        var e = this.getItem(t);
        e && (e.isIgnored = !0);
      }),
      (c.unignore = function (t) {
        var e = this.getItem(t);
        e && delete e.isIgnored;
      }),
      (c.stamp = function (t) {
        (t = this._find(t)),
          t &&
            ((this.stamps = this.stamps.concat(t)),
            t.forEach(this.ignore, this));
      }),
      (c.unstamp = function (t) {
        (t = this._find(t)),
          t &&
            t.forEach(function (t) {
              o.removeFrom(this.stamps, t), this.unignore(t);
            }, this);
      }),
      (c._find = function (t) {
        if (t)
          return (
            "string" == typeof t && (t = this.element.querySelectorAll(t)),
            (t = o.makeArray(t))
          );
      }),
      (c._manageStamps = function () {
        this.stamps &&
          this.stamps.length &&
          (this._getBoundingRect(),
          this.stamps.forEach(this._manageStamp, this));
      }),
      (c._getBoundingRect = function () {
        var t = this.element.getBoundingClientRect(),
          e = this.size;
        this._boundingRect = {
          left: t.left + e.paddingLeft + e.borderLeftWidth,
          top: t.top + e.paddingTop + e.borderTopWidth,
          right: t.right - (e.paddingRight + e.borderRightWidth),
          bottom: t.bottom - (e.paddingBottom + e.borderBottomWidth),
        };
      }),
      (c._manageStamp = d),
      (c._getElementOffset = function (t) {
        var e = t.getBoundingClientRect(),
          o = this._boundingRect,
          n = i(t),
          s = {
            left: e.left - o.left - n.marginLeft,
            top: e.top - o.top - n.marginTop,
            right: o.right - e.right - n.marginRight,
            bottom: o.bottom - e.bottom - n.marginBottom,
          };
        return s;
      }),
      (c.handleEvent = o.handleEvent),
      (c.bindResize = function () {
        t.addEventListener("resize", this), (this.isResizeBound = !0);
      }),
      (c.unbindResize = function () {
        t.removeEventListener("resize", this), (this.isResizeBound = !1);
      }),
      (c.onresize = function () {
        this.resize();
      }),
      o.debounceMethod(s, "onresize", 100),
      (c.resize = function () {
        this.isResizeBound && this.needsResizeLayout() && this.layout();
      }),
      (c.needsResizeLayout = function () {
        var t = i(this.element),
          e = this.size && t;
        return e && t.innerWidth !== this.size.innerWidth;
      }),
      (c.addItems = function (t) {
        var e = this._itemize(t);
        return e.length && (this.items = this.items.concat(e)), e;
      }),
      (c.appended = function (t) {
        var e = this.addItems(t);
        e.length && (this.layoutItems(e, !0), this.reveal(e));
      }),
      (c.prepended = function (t) {
        var e = this._itemize(t);
        if (e.length) {
          var i = this.items.slice(0);
          (this.items = e.concat(i)),
            this._resetLayout(),
            this._manageStamps(),
            this.layoutItems(e, !0),
            this.reveal(e),
            this.layoutItems(i);
        }
      }),
      (c.reveal = function (t) {
        if ((this._emitCompleteOnItems("reveal", t), t && t.length)) {
          var e = this.updateStagger();
          t.forEach(function (t, i) {
            t.stagger(i * e), t.reveal();
          });
        }
      }),
      (c.hide = function (t) {
        if ((this._emitCompleteOnItems("hide", t), t && t.length)) {
          var e = this.updateStagger();
          t.forEach(function (t, i) {
            t.stagger(i * e), t.hide();
          });
        }
      }),
      (c.revealItemElements = function (t) {
        var e = this.getItems(t);
        this.reveal(e);
      }),
      (c.hideItemElements = function (t) {
        var e = this.getItems(t);
        this.hide(e);
      }),
      (c.getItem = function (t) {
        for (var e = 0; e < this.items.length; e++) {
          var i = this.items[e];
          if (i.element == t) return i;
        }
      }),
      (c.getItems = function (t) {
        t = o.makeArray(t);
        var e = [];
        return (
          t.forEach(function (t) {
            var i = this.getItem(t);
            i && e.push(i);
          }, this),
          e
        );
      }),
      (c.remove = function (t) {
        var e = this.getItems(t);
        this._emitCompleteOnItems("remove", e),
          e &&
            e.length &&
            e.forEach(function (t) {
              t.remove(), o.removeFrom(this.items, t);
            }, this);
      }),
      (c.destroy = function () {
        var t = this.element.style;
        (t.height = ""),
          (t.position = ""),
          (t.width = ""),
          this.items.forEach(function (t) {
            t.destroy();
          }),
          this.unbindResize();
        var e = this.element.outlayerGUID;
        delete f[e],
          delete this.element.outlayerGUID,
          h && h.removeData(this.element, this.constructor.namespace);
      }),
      (s.data = function (t) {
        t = o.getQueryElement(t);
        var e = t && t.outlayerGUID;
        return e && f[e];
      }),
      (s.create = function (t, e) {
        var i = r(s);
        return (
          (i.defaults = o.extend({}, s.defaults)),
          o.extend(i.defaults, e),
          (i.compatOptions = o.extend({}, s.compatOptions)),
          (i.namespace = t),
          (i.data = s.data),
          (i.Item = r(n)),
          o.htmlInit(i, t),
          h && h.bridget && h.bridget(t, i),
          i
        );
      });
    var m = { ms: 1, s: 1e3 };
    return (s.Item = n), s;
  }),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define("isotope-layout/js/item", ["outlayer/outlayer"], e)
      : "object" == typeof module && module.exports
      ? (module.exports = e(require("outlayer")))
      : ((t.Isotope = t.Isotope || {}), (t.Isotope.Item = e(t.Outlayer)));
  })(window, function (t) {
    "use strict";
    function e() {
      t.Item.apply(this, arguments);
    }
    var i = (e.prototype = Object.create(t.Item.prototype)),
      o = i._create;
    (i._create = function () {
      (this.id = this.layout.itemGUID++), o.call(this), (this.sortData = {});
    }),
      (i.updateSortData = function () {
        if (!this.isIgnored) {
          (this.sortData.id = this.id),
            (this.sortData["original-order"] = this.id),
            (this.sortData.random = Math.random());
          var t = this.layout.options.getSortData,
            e = this.layout._sorters;
          for (var i in t) {
            var o = e[i];
            this.sortData[i] = o(this.element, this);
          }
        }
      });
    var n = i.destroy;
    return (
      (i.destroy = function () {
        n.apply(this, arguments), this.css({ display: "" });
      }),
      e
    );
  }),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define(
          "isotope-layout/js/layout-mode",
          ["get-size/get-size", "outlayer/outlayer"],
          e
        )
      : "object" == typeof module && module.exports
      ? (module.exports = e(require("get-size"), require("outlayer")))
      : ((t.Isotope = t.Isotope || {}),
        (t.Isotope.LayoutMode = e(t.getSize, t.Outlayer)));
  })(window, function (t, e) {
    "use strict";
    function i(t) {
      (this.isotope = t),
        t &&
          ((this.options = t.options[this.namespace]),
          (this.element = t.element),
          (this.items = t.filteredItems),
          (this.size = t.size));
    }
    var o = i.prototype,
      n = [
        "_resetLayout",
        "_getItemLayoutPosition",
        "_manageStamp",
        "_getContainerSize",
        "_getElementOffset",
        "needsResizeLayout",
        "_getOption",
      ];
    return (
      n.forEach(function (t) {
        o[t] = function () {
          return e.prototype[t].apply(this.isotope, arguments);
        };
      }),
      (o.needsVerticalResizeLayout = function () {
        var e = t(this.isotope.element),
          i = this.isotope.size && e;
        return i && e.innerHeight != this.isotope.size.innerHeight;
      }),
      (o._getMeasurement = function () {
        this.isotope._getMeasurement.apply(this, arguments);
      }),
      (o.getColumnWidth = function () {
        this.getSegmentSize("column", "Width");
      }),
      (o.getRowHeight = function () {
        this.getSegmentSize("row", "Height");
      }),
      (o.getSegmentSize = function (t, e) {
        var i = t + e,
          o = "outer" + e;
        if ((this._getMeasurement(i, o), !this[i])) {
          var n = this.getFirstItemSize();
          this[i] = (n && n[o]) || this.isotope.size["inner" + e];
        }
      }),
      (o.getFirstItemSize = function () {
        var e = this.isotope.filteredItems[0];
        return e && e.element && t(e.element);
      }),
      (o.layout = function () {
        this.isotope.layout.apply(this.isotope, arguments);
      }),
      (o.getSize = function () {
        this.isotope.getSize(), (this.size = this.isotope.size);
      }),
      (i.modes = {}),
      (i.create = function (t, e) {
        function n() {
          i.apply(this, arguments);
        }
        return (
          (n.prototype = Object.create(o)),
          (n.prototype.constructor = n),
          e && (n.options = e),
          (n.prototype.namespace = t),
          (i.modes[t] = n),
          n
        );
      }),
      i
    );
  }),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define(
          "masonry-layout/masonry",
          ["outlayer/outlayer", "get-size/get-size"],
          e
        )
      : "object" == typeof module && module.exports
      ? (module.exports = e(require("outlayer"), require("get-size")))
      : (t.Masonry = e(t.Outlayer, t.getSize));
  })(window, function (t, e) {
    var i = t.create("masonry");
    i.compatOptions.fitWidth = "isFitWidth";
    var o = i.prototype;
    return (
      (o._resetLayout = function () {
        this.getSize(),
          this._getMeasurement("columnWidth", "outerWidth"),
          this._getMeasurement("gutter", "outerWidth"),
          this.measureColumns(),
          (this.colYs = []);
        for (var t = 0; t < this.cols; t++) this.colYs.push(0);
        (this.maxY = 0), (this.horizontalColIndex = 0);
      }),
      (o.measureColumns = function () {
        if ((this.getContainerWidth(), !this.columnWidth)) {
          var t = this.items[0],
            i = t && t.element;
          this.columnWidth = (i && e(i).outerWidth) || this.containerWidth;
        }
        var o = (this.columnWidth += this.gutter),
          n = this.containerWidth + this.gutter,
          s = n / o,
          r = o - (n % o),
          a = r && r < 1 ? "round" : "floor";
        (s = Math[a](s)), (this.cols = Math.max(s, 1));
      }),
      (o.getContainerWidth = function () {
        var t = this._getOption("fitWidth"),
          i = t ? this.element.parentNode : this.element,
          o = e(i);
        this.containerWidth = o && o.innerWidth;
      }),
      (o._getItemLayoutPosition = function (t) {
        t.getSize();
        var e = t.size.outerWidth % this.columnWidth,
          i = e && e < 1 ? "round" : "ceil",
          o = Math[i](t.size.outerWidth / this.columnWidth);
        o = Math.min(o, this.cols);
        for (
          var n = this.options.horizontalOrder
              ? "_getHorizontalColPosition"
              : "_getTopColPosition",
            s = this[n](o, t),
            r = { x: this.columnWidth * s.col, y: s.y },
            a = s.y + t.size.outerHeight,
            u = o + s.col,
            h = s.col;
          h < u;
          h++
        )
          this.colYs[h] = a;
        return r;
      }),
      (o._getTopColPosition = function (t) {
        var e = this._getTopColGroup(t),
          i = Math.min.apply(Math, e);
        return { col: e.indexOf(i), y: i };
      }),
      (o._getTopColGroup = function (t) {
        if (t < 2) return this.colYs;
        for (var e = [], i = this.cols + 1 - t, o = 0; o < i; o++)
          e[o] = this._getColGroupY(o, t);
        return e;
      }),
      (o._getColGroupY = function (t, e) {
        if (e < 2) return this.colYs[t];
        var i = this.colYs.slice(t, t + e);
        return Math.max.apply(Math, i);
      }),
      (o._getHorizontalColPosition = function (t, e) {
        var i = this.horizontalColIndex % this.cols,
          o = t > 1 && i + t > this.cols;
        i = o ? 0 : i;
        var n = e.size.outerWidth && e.size.outerHeight;
        return (
          (this.horizontalColIndex = n ? i + t : this.horizontalColIndex),
          { col: i, y: this._getColGroupY(i, t) }
        );
      }),
      (o._manageStamp = function (t) {
        var i = e(t),
          o = this._getElementOffset(t),
          n = this._getOption("originLeft"),
          s = n ? o.left : o.right,
          r = s + i.outerWidth,
          a = Math.floor(s / this.columnWidth);
        a = Math.max(0, a);
        var u = Math.floor(r / this.columnWidth);
        (u -= r % this.columnWidth ? 0 : 1), (u = Math.min(this.cols - 1, u));
        for (
          var h = this._getOption("originTop"),
            d = (h ? o.top : o.bottom) + i.outerHeight,
            l = a;
          l <= u;
          l++
        )
          this.colYs[l] = Math.max(d, this.colYs[l]);
      }),
      (o._getContainerSize = function () {
        this.maxY = Math.max.apply(Math, this.colYs);
        var t = { height: this.maxY };
        return (
          this._getOption("fitWidth") &&
            (t.width = this._getContainerFitWidth()),
          t
        );
      }),
      (o._getContainerFitWidth = function () {
        for (var t = 0, e = this.cols; --e && 0 === this.colYs[e]; ) t++;
        return (this.cols - t) * this.columnWidth - this.gutter;
      }),
      (o.needsResizeLayout = function () {
        var t = this.containerWidth;
        return this.getContainerWidth(), t != this.containerWidth;
      }),
      i
    );
  }),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define(
          "isotope-layout/js/layout-modes/masonry",
          ["../layout-mode", "masonry-layout/masonry"],
          e
        )
      : "object" == typeof module && module.exports
      ? (module.exports = e(
          require("../layout-mode"),
          require("masonry-layout")
        ))
      : e(t.Isotope.LayoutMode, t.Masonry);
  })(window, function (t, e) {
    "use strict";
    var i = t.create("masonry"),
      o = i.prototype,
      n = { _getElementOffset: !0, layout: !0, _getMeasurement: !0 };
    for (var s in e.prototype) n[s] || (o[s] = e.prototype[s]);
    var r = o.measureColumns;
    o.measureColumns = function () {
      (this.items = this.isotope.filteredItems), r.call(this);
    };
    var a = o._getOption;
    return (
      (o._getOption = function (t) {
        return "fitWidth" == t
          ? void 0 !== this.options.isFitWidth
            ? this.options.isFitWidth
            : this.options.fitWidth
          : a.apply(this.isotope, arguments);
      }),
      i
    );
  }),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define("isotope-layout/js/layout-modes/fit-rows", ["../layout-mode"], e)
      : "object" == typeof exports
      ? (module.exports = e(require("../layout-mode")))
      : e(t.Isotope.LayoutMode);
  })(window, function (t) {
    "use strict";
    var e = t.create("fitRows"),
      i = e.prototype;
    return (
      (i._resetLayout = function () {
        (this.x = 0),
          (this.y = 0),
          (this.maxY = 0),
          this._getMeasurement("gutter", "outerWidth");
      }),
      (i._getItemLayoutPosition = function (t) {
        t.getSize();
        var e = t.size.outerWidth + this.gutter,
          i = this.isotope.size.innerWidth + this.gutter;
        0 !== this.x && e + this.x > i && ((this.x = 0), (this.y = this.maxY));
        var o = { x: this.x, y: this.y };
        return (
          (this.maxY = Math.max(this.maxY, this.y + t.size.outerHeight)),
          (this.x += e),
          o
        );
      }),
      (i._getContainerSize = function () {
        return { height: this.maxY };
      }),
      e
    );
  }),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define("isotope-layout/js/layout-modes/vertical", ["../layout-mode"], e)
      : "object" == typeof module && module.exports
      ? (module.exports = e(require("../layout-mode")))
      : e(t.Isotope.LayoutMode);
  })(window, function (t) {
    "use strict";
    var e = t.create("vertical", { horizontalAlignment: 0 }),
      i = e.prototype;
    return (
      (i._resetLayout = function () {
        this.y = 0;
      }),
      (i._getItemLayoutPosition = function (t) {
        t.getSize();
        var e =
            (this.isotope.size.innerWidth - t.size.outerWidth) *
            this.options.horizontalAlignment,
          i = this.y;
        return (this.y += t.size.outerHeight), { x: e, y: i };
      }),
      (i._getContainerSize = function () {
        return { height: this.y };
      }),
      e
    );
  }),
  (function (t, e) {
    "function" == typeof define && define.amd
      ? define(
          [
            "outlayer/outlayer",
            "get-size/get-size",
            "desandro-matches-selector/matches-selector",
            "fizzy-ui-utils/utils",
            "isotope-layout/js/item",
            "isotope-layout/js/layout-mode",
            "isotope-layout/js/layout-modes/masonry",
            "isotope-layout/js/layout-modes/fit-rows",
            "isotope-layout/js/layout-modes/vertical",
          ],
          function (i, o, n, s, r, a) {
            return e(t, i, o, n, s, r, a);
          }
        )
      : "object" == typeof module && module.exports
      ? (module.exports = e(
          t,
          require("outlayer"),
          require("get-size"),
          require("desandro-matches-selector"),
          require("fizzy-ui-utils"),
          require("isotope-layout/js/item"),
          require("isotope-layout/js/layout-mode"),
          require("isotope-layout/js/layout-modes/masonry"),
          require("isotope-layout/js/layout-modes/fit-rows"),
          require("isotope-layout/js/layout-modes/vertical")
        ))
      : (t.Isotope = e(
          t,
          t.Outlayer,
          t.getSize,
          t.matchesSelector,
          t.fizzyUIUtils,
          t.Isotope.Item,
          t.Isotope.LayoutMode
        ));
  })(window, function (t, e, i, o, n, s, r) {
    function a(t, e) {
      return function (i, o) {
        for (var n = 0; n < t.length; n++) {
          var s = t[n],
            r = i.sortData[s],
            a = o.sortData[s];
          if (r > a || r < a) {
            var u = void 0 !== e[s] ? e[s] : e,
              h = u ? 1 : -1;
            return (r > a ? 1 : -1) * h;
          }
        }
        return 0;
      };
    }
    var u = t.jQuery,
      h = String.prototype.trim
        ? function (t) {
            return t.trim();
          }
        : function (t) {
            return t.replace(/^\s+|\s+$/g, "");
          },
      d = e.create("isotope", {
        layoutMode: "masonry",
        isJQueryFiltering: !0,
        sortAscending: !0,
      });
    (d.Item = s), (d.LayoutMode = r);
    var l = d.prototype;
    (l._create = function () {
      (this.itemGUID = 0),
        (this._sorters = {}),
        this._getSorters(),
        e.prototype._create.call(this),
        (this.modes = {}),
        (this.filteredItems = this.items),
        (this.sortHistory = ["original-order"]);
      for (var t in r.modes) this._initLayoutMode(t);
    }),
      (l.reloadItems = function () {
        (this.itemGUID = 0), e.prototype.reloadItems.call(this);
      }),
      (l._itemize = function () {
        for (
          var t = e.prototype._itemize.apply(this, arguments), i = 0;
          i < t.length;
          i++
        ) {
          var o = t[i];
          o.id = this.itemGUID++;
        }
        return this._updateItemsSortData(t), t;
      }),
      (l._initLayoutMode = function (t) {
        var e = r.modes[t],
          i = this.options[t] || {};
        (this.options[t] = e.options ? n.extend(e.options, i) : i),
          (this.modes[t] = new e(this));
      }),
      (l.layout = function () {
        return !this._isLayoutInited && this._getOption("initLayout")
          ? void this.arrange()
          : void this._layout();
      }),
      (l._layout = function () {
        var t = this._getIsInstant();
        this._resetLayout(),
          this._manageStamps(),
          this.layoutItems(this.filteredItems, t),
          (this._isLayoutInited = !0);
      }),
      (l.arrange = function (t) {
        this.option(t), this._getIsInstant();
        var e = this._filter(this.items);
        (this.filteredItems = e.matches),
          this._bindArrangeComplete(),
          this._isInstant
            ? this._noTransition(this._hideReveal, [e])
            : this._hideReveal(e),
          this._sort(),
          this._layout();
      }),
      (l._init = l.arrange),
      (l._hideReveal = function (t) {
        this.reveal(t.needReveal), this.hide(t.needHide);
      }),
      (l._getIsInstant = function () {
        var t = this._getOption("layoutInstant"),
          e = void 0 !== t ? t : !this._isLayoutInited;
        return (this._isInstant = e), e;
      }),
      (l._bindArrangeComplete = function () {
        function t() {
          e &&
            i &&
            o &&
            n.dispatchEvent("arrangeComplete", null, [n.filteredItems]);
        }
        var e,
          i,
          o,
          n = this;
        this.once("layoutComplete", function () {
          (e = !0), t();
        }),
          this.once("hideComplete", function () {
            (i = !0), t();
          }),
          this.once("revealComplete", function () {
            (o = !0), t();
          });
      }),
      (l._filter = function (t) {
        var e = this.options.filter;
        e = e || "*";
        for (
          var i = [], o = [], n = [], s = this._getFilterTest(e), r = 0;
          r < t.length;
          r++
        ) {
          var a = t[r];
          if (!a.isIgnored) {
            var u = s(a);
            u && i.push(a),
              u && a.isHidden ? o.push(a) : u || a.isHidden || n.push(a);
          }
        }
        return { matches: i, needReveal: o, needHide: n };
      }),
      (l._getFilterTest = function (t) {
        return u && this.options.isJQueryFiltering
          ? function (e) {
              return u(e.element).is(t);
            }
          : "function" == typeof t
          ? function (e) {
              return t(e.element);
            }
          : function (e) {
              return o(e.element, t);
            };
      }),
      (l.updateSortData = function (t) {
        var e;
        t ? ((t = n.makeArray(t)), (e = this.getItems(t))) : (e = this.items),
          this._getSorters(),
          this._updateItemsSortData(e);
      }),
      (l._getSorters = function () {
        var t = this.options.getSortData;
        for (var e in t) {
          var i = t[e];
          this._sorters[e] = f(i);
        }
      }),
      (l._updateItemsSortData = function (t) {
        for (var e = t && t.length, i = 0; e && i < e; i++) {
          var o = t[i];
          o.updateSortData();
        }
      });
    var f = (function () {
      function t(t) {
        if ("string" != typeof t) return t;
        var i = h(t).split(" "),
          o = i[0],
          n = o.match(/^\[(.+)\]$/),
          s = n && n[1],
          r = e(s, o),
          a = d.sortDataParsers[i[1]];
        return (t = a
          ? function (t) {
              return t && a(r(t));
            }
          : function (t) {
              return t && r(t);
            });
      }
      function e(t, e) {
        return t
          ? function (e) {
              return e.getAttribute(t);
            }
          : function (t) {
              var i = t.querySelector(e);
              return i && i.textContent;
            };
      }
      return t;
    })();
    (d.sortDataParsers = {
      parseInt: function (t) {
        return parseInt(t, 10);
      },
      parseFloat: function (t) {
        return parseFloat(t);
      },
    }),
      (l._sort = function () {
        if (this.options.sortBy) {
          var t = n.makeArray(this.options.sortBy);
          this._getIsSameSortBy(t) ||
            (this.sortHistory = t.concat(this.sortHistory));
          var e = a(this.sortHistory, this.options.sortAscending);
          this.filteredItems.sort(e);
        }
      }),
      (l._getIsSameSortBy = function (t) {
        for (var e = 0; e < t.length; e++)
          if (t[e] != this.sortHistory[e]) return !1;
        return !0;
      }),
      (l._mode = function () {
        var t = this.options.layoutMode,
          e = this.modes[t];
        if (!e) throw new Error("No layout mode: " + t);
        return (e.options = this.options[t]), e;
      }),
      (l._resetLayout = function () {
        e.prototype._resetLayout.call(this), this._mode()._resetLayout();
      }),
      (l._getItemLayoutPosition = function (t) {
        return this._mode()._getItemLayoutPosition(t);
      }),
      (l._manageStamp = function (t) {
        this._mode()._manageStamp(t);
      }),
      (l._getContainerSize = function () {
        return this._mode()._getContainerSize();
      }),
      (l.needsResizeLayout = function () {
        return this._mode().needsResizeLayout();
      }),
      (l.appended = function (t) {
        var e = this.addItems(t);
        if (e.length) {
          var i = this._filterRevealAdded(e);
          this.filteredItems = this.filteredItems.concat(i);
        }
      }),
      (l.prepended = function (t) {
        var e = this._itemize(t);
        if (e.length) {
          this._resetLayout(), this._manageStamps();
          var i = this._filterRevealAdded(e);
          this.layoutItems(this.filteredItems),
            (this.filteredItems = i.concat(this.filteredItems)),
            (this.items = e.concat(this.items));
        }
      }),
      (l._filterRevealAdded = function (t) {
        var e = this._filter(t);
        return (
          this.hide(e.needHide),
          this.reveal(e.matches),
          this.layoutItems(e.matches, !0),
          e.matches
        );
      }),
      (l.insert = function (t) {
        var e = this.addItems(t);
        if (e.length) {
          var i,
            o,
            n = e.length;
          for (i = 0; i < n; i++)
            (o = e[i]), this.element.appendChild(o.element);
          var s = this._filter(e).matches;
          for (i = 0; i < n; i++) e[i].isLayoutInstant = !0;
          for (this.arrange(), i = 0; i < n; i++) delete e[i].isLayoutInstant;
          this.reveal(s);
        }
      });
    var c = l.remove;
    return (
      (l.remove = function (t) {
        t = n.makeArray(t);
        var e = this.getItems(t);
        c.call(this, t);
        for (var i = e && e.length, o = 0; i && o < i; o++) {
          var s = e[o];
          n.removeFrom(this.filteredItems, s);
        }
      }),
      (l.shuffle = function () {
        for (var t = 0; t < this.items.length; t++) {
          var e = this.items[t];
          e.sortData.random = Math.random();
        }
        (this.options.sortBy = "random"), this._sort(), this._layout();
      }),
      (l._noTransition = function (t, e) {
        var i = this.options.transitionDuration;
        this.options.transitionDuration = 0;
        var o = t.apply(this, e);
        return (this.options.transitionDuration = i), o;
      }),
      (l.getFilteredItemElements = function () {
        return this.filteredItems.map(function (t) {
          return t.element;
        });
      }),
      d
    );
  });
/*!
 * Packery layout mode PACKAGED v2.0.1
 * sub-classes Packery
 */
!(function (a, b) {
  "function" == typeof define && define.amd
    ? define("packery/js/rect", b)
    : "object" == typeof module && module.exports
    ? (module.exports = b())
    : ((a.Packery = a.Packery || {}), (a.Packery.Rect = b()));
})(window, function () {
  function a(b) {
    for (var c in a.defaults) this[c] = a.defaults[c];
    for (c in b) this[c] = b[c];
  }
  a.defaults = { x: 0, y: 0, width: 0, height: 0 };
  var b = a.prototype;
  return (
    (b.contains = function (a) {
      var b = a.width || 0,
        c = a.height || 0;
      return (
        this.x <= a.x &&
        this.y <= a.y &&
        this.x + this.width >= a.x + b &&
        this.y + this.height >= a.y + c
      );
    }),
    (b.overlaps = function (a) {
      var b = this.x + this.width,
        c = this.y + this.height,
        d = a.x + a.width,
        e = a.y + a.height;
      return this.x < d && b > a.x && this.y < e && c > a.y;
    }),
    (b.getMaximalFreeRects = function (b) {
      if (!this.overlaps(b)) return !1;
      var c,
        d = [],
        e = this.x + this.width,
        f = this.y + this.height,
        g = b.x + b.width,
        h = b.y + b.height;
      return (
        this.y < b.y &&
          ((c = new a({
            x: this.x,
            y: this.y,
            width: this.width,
            height: b.y - this.y,
          })),
          d.push(c)),
        e > g &&
          ((c = new a({ x: g, y: this.y, width: e - g, height: this.height })),
          d.push(c)),
        f > h &&
          ((c = new a({ x: this.x, y: h, width: this.width, height: f - h })),
          d.push(c)),
        this.x < b.x &&
          ((c = new a({
            x: this.x,
            y: this.y,
            width: b.x - this.x,
            height: this.height,
          })),
          d.push(c)),
        d
      );
    }),
    (b.canFit = function (a) {
      return this.width >= a.width && this.height >= a.height;
    }),
    a
  );
}),
  (function (a, b) {
    if ("function" == typeof define && define.amd)
      define("packery/js/packer", ["./rect"], b);
    else if ("object" == typeof module && module.exports)
      module.exports = b(require("./rect"));
    else {
      var c = (a.Packery = a.Packery || {});
      c.Packer = b(c.Rect);
    }
  })(window, function (a) {
    function b(a, b, c) {
      (this.width = a || 0),
        (this.height = b || 0),
        (this.sortDirection = c || "downwardLeftToRight"),
        this.reset();
    }
    var c = b.prototype;
    (c.reset = function () {
      this.spaces = [];
      var b = new a({ x: 0, y: 0, width: this.width, height: this.height });
      this.spaces.push(b),
        (this.sorter = d[this.sortDirection] || d.downwardLeftToRight);
    }),
      (c.pack = function (a) {
        for (var b = 0; b < this.spaces.length; b++) {
          var c = this.spaces[b];
          if (c.canFit(a)) {
            this.placeInSpace(a, c);
            break;
          }
        }
      }),
      (c.columnPack = function (a) {
        for (var b = 0; b < this.spaces.length; b++) {
          var c = this.spaces[b],
            d =
              c.x <= a.x &&
              c.x + c.width >= a.x + a.width &&
              c.height >= a.height - 0.01;
          if (d) {
            (a.y = c.y), this.placed(a);
            break;
          }
        }
      }),
      (c.rowPack = function (a) {
        for (var b = 0; b < this.spaces.length; b++) {
          var c = this.spaces[b],
            d =
              c.y <= a.y &&
              c.y + c.height >= a.y + a.height &&
              c.width >= a.width - 0.01;
          if (d) {
            (a.x = c.x), this.placed(a);
            break;
          }
        }
      }),
      (c.placeInSpace = function (a, b) {
        (a.x = b.x), (a.y = b.y), this.placed(a);
      }),
      (c.placed = function (a) {
        for (var b = [], c = 0; c < this.spaces.length; c++) {
          var d = this.spaces[c],
            e = d.getMaximalFreeRects(a);
          e ? b.push.apply(b, e) : b.push(d);
        }
        (this.spaces = b), this.mergeSortSpaces();
      }),
      (c.mergeSortSpaces = function () {
        b.mergeRects(this.spaces), this.spaces.sort(this.sorter);
      }),
      (c.addSpace = function (a) {
        this.spaces.push(a), this.mergeSortSpaces();
      }),
      (b.mergeRects = function (a) {
        var b = 0,
          c = a[b];
        a: for (; c; ) {
          for (var d = 0, e = a[b + d]; e; ) {
            if (e == c) d++;
            else {
              if (e.contains(c)) {
                a.splice(b, 1), (c = a[b]);
                continue a;
              }
              c.contains(e) ? a.splice(b + d, 1) : d++;
            }
            e = a[b + d];
          }
          b++, (c = a[b]);
        }
        return a;
      });
    var d = {
      downwardLeftToRight: function (a, b) {
        return a.y - b.y || a.x - b.x;
      },
      rightwardTopToBottom: function (a, b) {
        return a.x - b.x || a.y - b.y;
      },
    };
    return b;
  }),
  (function (a, b) {
    "function" == typeof define && define.amd
      ? define("packery/js/item", ["outlayer/outlayer", "./rect"], b)
      : "object" == typeof module && module.exports
      ? (module.exports = b(require("outlayer"), require("./rect")))
      : (a.Packery.Item = b(a.Outlayer, a.Packery.Rect));
  })(window, function (a, b) {
    var c = document.documentElement.style,
      d = "string" == typeof c.transform ? "transform" : "WebkitTransform",
      e = function () {
        a.Item.apply(this, arguments);
      },
      f = (e.prototype = Object.create(a.Item.prototype)),
      g = f._create;
    f._create = function () {
      g.call(this), (this.rect = new b());
    };
    var h = f.moveTo;
    return (
      (f.moveTo = function (a, b) {
        var c = Math.abs(this.position.x - a),
          d = Math.abs(this.position.y - b),
          e =
            this.layout.dragItemCount &&
            !this.isPlacing &&
            !this.isTransitioning &&
            1 > c &&
            1 > d;
        return e ? void this.goTo(a, b) : void h.apply(this, arguments);
      }),
      (f.enablePlacing = function () {
        this.removeTransitionStyles(),
          this.isTransitioning && d && (this.element.style[d] = "none"),
          (this.isTransitioning = !1),
          this.getSize(),
          this.layout._setRectSize(this.element, this.rect),
          (this.isPlacing = !0);
      }),
      (f.disablePlacing = function () {
        this.isPlacing = !1;
      }),
      (f.removeElem = function () {
        this.element.parentNode.removeChild(this.element),
          this.layout.packer.addSpace(this.rect),
          this.emitEvent("remove", [this]);
      }),
      (f.showDropPlaceholder = function () {
        var a = this.dropPlaceholder;
        a ||
          ((a = this.dropPlaceholder = document.createElement("div")),
          (a.className = "packery-drop-placeholder"),
          (a.style.position = "absolute")),
          (a.style.width = this.size.width + "px"),
          (a.style.height = this.size.height + "px"),
          this.positionDropPlaceholder(),
          this.layout.element.appendChild(a);
      }),
      (f.positionDropPlaceholder = function () {
        this.dropPlaceholder.style[d] =
          "translate(" + this.rect.x + "px, " + this.rect.y + "px)";
      }),
      (f.hideDropPlaceholder = function () {
        this.layout.element.removeChild(this.dropPlaceholder);
      }),
      e
    );
  }),
  (function (a, b) {
    "function" == typeof define && define.amd
      ? define(
          "packery/js/packery",
          [
            "get-size/get-size",
            "outlayer/outlayer",
            "./rect",
            "./packer",
            "./item",
          ],
          b
        )
      : "object" == typeof module && module.exports
      ? (module.exports = b(
          require("get-size"),
          require("outlayer"),
          require("./rect"),
          require("./packer"),
          require("./item")
        ))
      : (a.Packery = b(
          a.getSize,
          a.Outlayer,
          a.Packery.Rect,
          a.Packery.Packer,
          a.Packery.Item
        ));
  })(window, function (a, b, c, d, e) {
    function f(a, b) {
      return a.position.y - b.position.y || a.position.x - b.position.x;
    }
    function g(a, b) {
      return a.position.x - b.position.x || a.position.y - b.position.y;
    }
    function h(a, b) {
      var c = b.x - a.x,
        d = b.y - a.y;
      return Math.sqrt(c * c + d * d);
    }
    c.prototype.canFit = function (a) {
      return this.width >= a.width - 1 && this.height >= a.height - 1;
    };
    var i = b.create("packery");
    i.Item = e;
    var j = i.prototype;
    (j._create = function () {
      b.prototype._create.call(this),
        (this.packer = new d()),
        (this.shiftPacker = new d()),
        (this.isEnabled = !0),
        (this.dragItemCount = 0);
      var a = this;
      (this.handleDraggabilly = {
        dragStart: function () {
          a.itemDragStart(this.element);
        },
        dragMove: function () {
          a.itemDragMove(this.element, this.position.x, this.position.y);
        },
        dragEnd: function () {
          a.itemDragEnd(this.element);
        },
      }),
        (this.handleUIDraggable = {
          start: function (b, c) {
            c && a.itemDragStart(b.currentTarget);
          },
          drag: function (b, c) {
            c &&
              a.itemDragMove(b.currentTarget, c.position.left, c.position.top);
          },
          stop: function (b, c) {
            c && a.itemDragEnd(b.currentTarget);
          },
        });
    }),
      (j._resetLayout = function () {
        this.getSize(), this._getMeasurements();
        var a, b, c;
        this._getOption("horizontal")
          ? ((a = 1 / 0),
            (b = this.size.innerHeight + this.gutter),
            (c = "rightwardTopToBottom"))
          : ((a = this.size.innerWidth + this.gutter),
            (b = 1 / 0),
            (c = "downwardLeftToRight")),
          (this.packer.width = this.shiftPacker.width = a),
          (this.packer.height = this.shiftPacker.height = b),
          (this.packer.sortDirection = this.shiftPacker.sortDirection = c),
          this.packer.reset(),
          (this.maxY = 0),
          (this.maxX = 0);
      }),
      (j._getMeasurements = function () {
        this._getMeasurement("columnWidth", "width"),
          this._getMeasurement("rowHeight", "height"),
          this._getMeasurement("gutter", "width");
      }),
      (j._getItemLayoutPosition = function (a) {
        if (
          (this._setRectSize(a.element, a.rect),
          this.isShifting || this.dragItemCount > 0)
        ) {
          var b = this._getPackMethod();
          this.packer[b](a.rect);
        } else this.packer.pack(a.rect);
        return this._setMaxXY(a.rect), a.rect;
      }),
      (j.shiftLayout = function () {
        (this.isShifting = !0), this.layout(), delete this.isShifting;
      }),
      (j._getPackMethod = function () {
        return this._getOption("horizontal") ? "rowPack" : "columnPack";
      }),
      (j._setMaxXY = function (a) {
        (this.maxX = Math.max(a.x + a.width, this.maxX)),
          (this.maxY = Math.max(a.y + a.height, this.maxY));
      }),
      (j._setRectSize = function (b, c) {
        var d = a(b),
          e = d.outerWidth,
          f = d.outerHeight;
        (e || f) &&
          ((e = this._applyGridGutter(e, this.columnWidth)),
          (f = this._applyGridGutter(f, this.rowHeight))),
          (c.width = Math.min(e, this.packer.width)),
          (c.height = Math.min(f, this.packer.height));
      }),
      (j._applyGridGutter = function (a, b) {
        if (!b) return a + this.gutter;
        b += this.gutter;
        var c = a % b,
          d = c && 1 > c ? "round" : "ceil";
        return (a = Math[d](a / b) * b);
      }),
      (j._getContainerSize = function () {
        return this._getOption("horizontal")
          ? { width: this.maxX - this.gutter }
          : { height: this.maxY - this.gutter };
      }),
      (j._manageStamp = function (a) {
        var b,
          d = this.getItem(a);
        if (d && d.isPlacing) b = d.rect;
        else {
          var e = this._getElementOffset(a);
          b = new c({
            x: this._getOption("originLeft") ? e.left : e.right,
            y: this._getOption("originTop") ? e.top : e.bottom,
          });
        }
        this._setRectSize(a, b), this.packer.placed(b), this._setMaxXY(b);
      }),
      (j.sortItemsByPosition = function () {
        var a = this._getOption("horizontal") ? g : f;
        this.items.sort(a);
      }),
      (j.fit = function (a, b, c) {
        var d = this.getItem(a);
        d &&
          (this.stamp(d.element),
          d.enablePlacing(),
          this.updateShiftTargets(d),
          (b = void 0 === b ? d.rect.x : b),
          (c = void 0 === c ? d.rect.y : c),
          this.shift(d, b, c),
          this._bindFitEvents(d),
          d.moveTo(d.rect.x, d.rect.y),
          this.shiftLayout(),
          this.unstamp(d.element),
          this.sortItemsByPosition(),
          d.disablePlacing());
      }),
      (j._bindFitEvents = function (a) {
        function b() {
          d++, 2 == d && c.dispatchEvent("fitComplete", null, [a]);
        }
        var c = this,
          d = 0;
        a.once("layout", b), this.once("layoutComplete", b);
      }),
      (j.resize = function () {
        this.isResizeBound &&
          this.needsResizeLayout() &&
          (this.options.shiftPercentResize
            ? this.resizeShiftPercentLayout()
            : this.layout());
      }),
      (j.needsResizeLayout = function () {
        var b = a(this.element),
          c = this._getOption("horizontal") ? "innerHeight" : "innerWidth";
        return b[c] != this.size[c];
      }),
      (j.resizeShiftPercentLayout = function () {
        var b = this._getItemsForLayout(this.items),
          c = this._getOption("horizontal"),
          d = c ? "y" : "x",
          e = c ? "height" : "width",
          f = c ? "rowHeight" : "columnWidth",
          g = c ? "innerHeight" : "innerWidth",
          h = this[f];
        if ((h = h && h + this.gutter)) {
          this._getMeasurements();
          var i = this[f] + this.gutter;
          b.forEach(function (a) {
            var b = Math.round(a.rect[d] / h);
            a.rect[d] = b * i;
          });
        } else {
          var j = a(this.element)[g] + this.gutter,
            k = this.packer[e];
          b.forEach(function (a) {
            a.rect[d] = (a.rect[d] / k) * j;
          });
        }
        this.shiftLayout();
      }),
      (j.itemDragStart = function (a) {
        if (this.isEnabled) {
          this.stamp(a);
          var b = this.getItem(a);
          b &&
            (b.enablePlacing(),
            b.showDropPlaceholder(),
            this.dragItemCount++,
            this.updateShiftTargets(b));
        }
      }),
      (j.updateShiftTargets = function (a) {
        this.shiftPacker.reset(), this._getBoundingRect();
        var b = this._getOption("originLeft"),
          d = this._getOption("originTop");
        this.stamps.forEach(function (a) {
          var e = this.getItem(a);
          if (!e || !e.isPlacing) {
            var f = this._getElementOffset(a),
              g = new c({ x: b ? f.left : f.right, y: d ? f.top : f.bottom });
            this._setRectSize(a, g), this.shiftPacker.placed(g);
          }
        }, this);
        var e = this._getOption("horizontal"),
          f = e ? "rowHeight" : "columnWidth",
          g = e ? "height" : "width";
        (this.shiftTargetKeys = []), (this.shiftTargets = []);
        var h,
          i = this[f];
        if ((i = i && i + this.gutter)) {
          var j = Math.ceil(a.rect[g] / i),
            k = Math.floor((this.shiftPacker[g] + this.gutter) / i);
          h = (k - j) * i;
          for (var l = 0; k > l; l++) this._addShiftTarget(l * i, 0, h);
        } else
          (h = this.shiftPacker[g] + this.gutter - a.rect[g]),
            this._addShiftTarget(0, 0, h);
        var m = this._getItemsForLayout(this.items),
          n = this._getPackMethod();
        m.forEach(function (a) {
          var b = a.rect;
          this._setRectSize(a.element, b),
            this.shiftPacker[n](b),
            this._addShiftTarget(b.x, b.y, h);
          var c = e ? b.x + b.width : b.x,
            d = e ? b.y : b.y + b.height;
          if ((this._addShiftTarget(c, d, h), i))
            for (var f = Math.round(b[g] / i), j = 1; f > j; j++) {
              var k = e ? c : b.x + i * j,
                l = e ? b.y + i * j : d;
              this._addShiftTarget(k, l, h);
            }
        }, this);
      }),
      (j._addShiftTarget = function (a, b, c) {
        var d = this._getOption("horizontal") ? b : a;
        if (!(0 !== d && d > c)) {
          var e = a + "," + b,
            f = -1 != this.shiftTargetKeys.indexOf(e);
          f ||
            (this.shiftTargetKeys.push(e),
            this.shiftTargets.push({ x: a, y: b }));
        }
      }),
      (j.shift = function (a, b, c) {
        var d,
          e = 1 / 0,
          f = { x: b, y: c };
        this.shiftTargets.forEach(function (a) {
          var b = h(a, f);
          e > b && ((d = a), (e = b));
        }),
          (a.rect.x = d.x),
          (a.rect.y = d.y);
      });
    var k = 120;
    (j.itemDragMove = function (a, b, c) {
      function d() {
        f.shift(e, b, c), e.positionDropPlaceholder(), f.layout();
      }
      var e = this.isEnabled && this.getItem(a);
      if (e) {
        (b -= this.size.paddingLeft), (c -= this.size.paddingTop);
        var f = this,
          g = new Date();
        this._itemDragTime && g - this._itemDragTime < k
          ? (clearTimeout(this.dragTimeout),
            (this.dragTimeout = setTimeout(d, k)))
          : (d(), (this._itemDragTime = g));
      }
    }),
      (j.itemDragEnd = function (a) {
        function b() {
          d++,
            2 == d &&
              (c.element.classList.remove("is-positioning-post-drag"),
              c.hideDropPlaceholder(),
              e.dispatchEvent("dragItemPositioned", null, [c]));
        }
        var c = this.isEnabled && this.getItem(a);
        if (c) {
          clearTimeout(this.dragTimeout),
            c.element.classList.add("is-positioning-post-drag");
          var d = 0,
            e = this;
          c.once("layout", b),
            this.once("layoutComplete", b),
            c.moveTo(c.rect.x, c.rect.y),
            this.layout(),
            (this.dragItemCount = Math.max(0, this.dragItemCount - 1)),
            this.sortItemsByPosition(),
            c.disablePlacing(),
            this.unstamp(c.element);
        }
      }),
      (j.bindDraggabillyEvents = function (a) {
        this._bindDraggabillyEvents(a, "on");
      }),
      (j.unbindDraggabillyEvents = function (a) {
        this._bindDraggabillyEvents(a, "off");
      }),
      (j._bindDraggabillyEvents = function (a, b) {
        var c = this.handleDraggabilly;
        a[b]("dragStart", c.dragStart),
          a[b]("dragMove", c.dragMove),
          a[b]("dragEnd", c.dragEnd);
      }),
      (j.bindUIDraggableEvents = function (a) {
        this._bindUIDraggableEvents(a, "on");
      }),
      (j.unbindUIDraggableEvents = function (a) {
        this._bindUIDraggableEvents(a, "off");
      }),
      (j._bindUIDraggableEvents = function (a, b) {
        var c = this.handleUIDraggable;
        a[b]("dragstart", c.start)[b]("drag", c.drag)[b]("dragstop", c.stop);
      });
    var l = j.destroy;
    return (
      (j.destroy = function () {
        l.apply(this, arguments), (this.isEnabled = !1);
      }),
      (i.Rect = c),
      (i.Packer = d),
      i
    );
  }),
  (function (a, b) {
    "function" == typeof define && define.amd
      ? define(["isotope-layout/js/layout-mode", "packery/js/packery"], b)
      : "object" == typeof module && module.exports
      ? (module.exports = b(
          require("isotope-layout/js/layout-mode"),
          require("packery")
        ))
      : b(a.Isotope.LayoutMode, a.Packery);
  })(window, function (a, b) {
    var c = a.create("packery"),
      d = c.prototype,
      e = { _getElementOffset: !0, _getMeasurement: !0 };
    for (var f in b.prototype) e[f] || (d[f] = b.prototype[f]);
    var g = d._resetLayout;
    d._resetLayout = function () {
      (this.packer = this.packer || new b.Packer()),
        (this.shiftPacker = this.shiftPacker || new b.Packer()),
        g.apply(this, arguments);
    };
    var h = d._getItemLayoutPosition;
    d._getItemLayoutPosition = function (a) {
      return (a.rect = a.rect || new b.Rect()), h.call(this, a);
    };
    var i = d.needsResizeLayout;
    d.needsResizeLayout = function () {
      return this._getOption("horizontal")
        ? this.needsVerticalResizeLayout()
        : i.call(this);
    };
    var j = d._getOption;
    return (
      (d._getOption = function (a) {
        return "horizontal" == a
          ? void 0 !== this.options.isHorizontal
            ? this.options.isHorizontal
            : this.options.horizontal
          : j.apply(this.isotope, arguments);
      }),
      c
    );
  });
(function ($) {
  "use strict";
  $.fn.avia_masonry = function (options) {
    if (!this.length) {
      return this;
    }
    var the_body = $("body"),
      the_win = $(window),
      isMobile = $.avia_utilities.isMobile,
      isTouchDevice = $.avia_utilities.isTouchDevice,
      mobile_no_animation = the_body.hasClass("avia-mobile-no-animations"),
      loading = false,
      methods = {
        masonry_filter: function () {
          var current = $(this),
            linktext = current.html(),
            selector = current.data("filter"),
            masonry = current.parents(".av-masonry").eq(0),
            container = masonry.find(".av-masonry-container").eq(0),
            links = masonry.find(".av-masonry-sort a"),
            activeCat = masonry.find(".av-current-sort-title");
          links.removeClass("active_sort");
          current.addClass("active_sort");
          container.attr("id", "masonry_id_" + selector);
          if (activeCat.length) {
            activeCat.html(linktext);
          }
          methods.applyMasonry(container, selector, function () {
            container.css({ overflow: "visible" });
          });
          setTimeout(function () {
            the_win.trigger("debouncedresize");
          }, 500);
          return false;
        },
        applyMasonry: function (container, selector, callback) {
          var filters = selector ? { filter: "." + selector } : {};
          filters["layoutMode"] = "packery";
          filters["packery"] = { gutter: 0 };
          filters["percentPosition"] = true;
          filters["itemSelector"] = "a.isotope-item, div.isotope-item";
          filters["originLeft"] = $("body").hasClass("rtl") ? false : true;
          container.isotope(filters, function () {
            the_win.trigger("av-height-change");
          });
          if (typeof callback === "function") {
            setTimeout(callback, 0);
          }
        },
        show_bricks: function (bricks, callback) {
          var browserPrefix = $.avia_utilities.supports("transition"),
            multiplier = isMobile && mobile_no_animation ? 0 : 100;
          bricks.each(function (i) {
            var currentLink = $(this);
            var reveal = currentLink.find(".avia-curtain-reveal-overlay");
            if (reveal.length > 0) {
              multiplier = 500;
              reveal.on("animationstart", function (e) {
                currentLink.css({ visibility: "visible" });
              });
              reveal.on("animationend", function (e) {
                $(this).remove();
              });
            }
            setTimeout(function () {
              if (browserPrefix === false) {
                currentLink
                  .css({ visibility: "visible", opacity: 0 })
                  .animate({ opacity: 1 }, 1500);
              } else {
                currentLink.addClass("av-masonry-item-loaded");
                reveal.addClass("avia_start_delayed_animation");
              }
              if (i == bricks.length - 1 && typeof callback == "function") {
                callback.call();
                the_win.trigger("av-height-change");
              }
            }, multiplier * i);
          });
        },
        loadMore: function (e) {
          e.preventDefault();
          if (loading) {
            return false;
          }
          loading = true;
          var current = $(this),
            data = current.data(),
            masonry = current.parents(".av-masonry").eq(0),
            container = masonry.find(".av-masonry-container"),
            items = masonry.find(".av-masonry-entry"),
            loader = $.avia_utilities.loading(),
            finished = function () {
              loading = false;
              loader.hide();
              the_body.trigger("av_resize_finished");
            };
          if (!data.offset) {
            data.offset = 0;
          }
          data.offset += data.items;
          data.action = "avia_ajax_masonry_more";
          data.loaded = [];
          items.each(function () {
            var item_id = $(this).data("av-masonry-item");
            if (item_id) {
              data.loaded.push(item_id);
            }
          });
          $.ajax({
            url: avia_framework_globals.ajaxurl,
            type: "POST",
            data: data,
            beforeSend: function () {
              loader.show();
            },
            success: function (response) {
              if (response.indexOf("{av-masonry-loaded}") !== -1) {
                var response = response.split("{av-masonry-loaded}"),
                  new_items = $(response.pop()).filter(".isotope-item");
                if (new_items.length > data.items) {
                  new_items = new_items.not(new_items.last());
                } else {
                  current.addClass("av-masonry-no-more-items");
                }
                new_items
                  .find(".avia-animate-admin-preview")
                  .removeClass("avia-animate-admin-preview");
                if (new_items.find(".avia-curtain-reveal-overlay").length > 0) {
                  new_items.css({ visibility: "hidden" });
                }
                var load_container = $(
                  '<div class="loadcontainer"></div>'
                ).append(new_items);
                $.avia_utilities.preload({
                  container: load_container,
                  single_callback: function () {
                    var links = masonry.find(".av-masonry-sort a"),
                      filter_container = masonry.find(".av-sort-by-term"),
                      allowed_filters =
                        filter_container.data("av-allowed-sort");
                    filter_container.hide();
                    loader.hide();
                    container.isotope("insert", new_items);
                    $.avia_utilities.avia_ajax_call(masonry);
                    setTimeout(function () {
                      methods.show_bricks(new_items, finished);
                    }, 150);
                    setTimeout(function () {
                      the_win.trigger("av-height-change");
                    }, 550);
                    if (links) {
                      $(links).each(function (filterlinkindex) {
                        var filterlink = $(this),
                          sort = filterlink.data("filter");
                        if (new_items) {
                          $(new_items).each(function (itemindex) {
                            var item = $(this);
                            if (
                              item.hasClass(sort) &&
                              allowed_filters.indexOf(sort) !== -1
                            ) {
                              var term_count = filterlink
                                .find(".avia-term-count")
                                .text();
                              filterlink
                                .find(".avia-term-count")
                                .text(" " + (parseInt(term_count) + 1) + " ");
                              if (filterlink.hasClass("avia_hide_sort")) {
                                filterlink
                                  .removeClass("avia_hide_sort")
                                  .addClass("avia_show_sort");
                                masonry
                                  .find(".av-masonry-sort ." + sort + "_sep")
                                  .removeClass("avia_hide_sort")
                                  .addClass("avia_show_sort");
                                masonry
                                  .find(".av-masonry-sort .av-sort-by-term")
                                  .removeClass("hidden");
                              }
                            }
                          });
                        }
                      });
                    }
                    filter_container.fadeIn();
                  },
                });
              } else {
                finished();
              }
            },
            error: finished,
            complete: function () {
              setTimeout(function () {
                the_win.trigger("debouncedresize");
              }, 500);
            },
          });
        },
      };
    return this.each(function () {
      var masonry = $(this),
        container = masonry.find(".av-masonry-container"),
        bricks = masonry.find(".isotope-item"),
        filter = masonry
          .find(".av-masonry-sort")
          .css({ visibility: "visible", opacity: 0 })
          .on("click", "a", methods.masonry_filter),
        load_more = masonry
          .find(".av-masonry-load-more")
          .css({ visibility: "visible", opacity: 0 });
      if (bricks.find(".avia-curtain-reveal-overlay").length > 0) {
        bricks.css({ visibility: "hidden" });
      }
      $.avia_utilities.preload({
        container: container,
        single_callback: function () {
          var start_animation = function () {
            filter.animate({ opacity: 1 }, 400);
            if (
              container.outerHeight() +
                container.offset().top +
                $("#footer").outerHeight() >
              $(window).height()
            ) {
              $("html").css({ "overflow-y": "scroll" });
            }
            methods.applyMasonry(container, false, function () {
              masonry.addClass("avia_sortable_active");
              container.removeClass("av-js-disabled");
            });
            methods.show_bricks(bricks, function () {
              load_more.css({ opacity: 1 }).on("click", methods.loadMore);
            });
          };
          if (isMobile && mobile_no_animation) {
            start_animation();
          } else {
            masonry.waypoint(start_animation, { offset: "80%" });
          }
          $(window).on("debouncedresize", function () {
            methods.applyMasonry(container, false, function () {
              masonry.addClass("avia_sortable_active");
            });
          });
        },
      });
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.avia_utilities = $.avia_utilities || {};
  $(function () {
    $.avia_utilities = $.avia_utilities || {};
    if ($.avia_utilities.avia_sticky_submenu) {
      $.avia_utilities.avia_sticky_submenu();
    }
  });
  $.avia_utilities.avia_sticky_submenu = function () {
    var win = $(window),
      html = $("html").first(),
      header = $(".html_header_top.html_header_sticky #header"),
      html_margin = parseInt($("html").first().css("margin-top"), 10),
      setWitdth = $(".html_header_sidebar #main, .boxed #main"),
      menus = $(".av-submenu-container"),
      bordermod = html.is(".html_minimal_header") ? 0 : 1,
      fixed_frame = $(".av-frame-top").height(),
      burger_menu = $(".av-burger-menu-main"),
      calc_margin = function () {
        html_margin = parseInt(html.css("margin-top"), 10);
        if (!$(".mobile_menu_toggle:visible").length) {
          $(".av-open-submenu").removeClass("av-open-submenu");
        }
        menus.filter(".av-sticky-submenu").each(function () {
          $(this).next(".sticky_placeholder").height($(this).height());
        });
      },
      calc_values = function () {
        var content_width = setWitdth.width();
        html_margin = parseInt(html.css("margin-top"), 10);
        menus.width(content_width);
      },
      check = function (placeholder, no_timeout) {
        var menu_pos = this.offset().top,
          top_pos = placeholder.offset().top,
          scrolled = win.scrollTop(),
          modifier = html_margin,
          fixed = false;
        if (burger_menu.is(":visible")) {
          this.css({ top: "auto", position: "absolute" });
          fixed = false;
          return;
        }
        if (header.length) {
          modifier +=
            header.outerHeight() + parseInt(header.css("margin-top"), 10);
        }
        if (fixed_frame) {
          modifier += fixed_frame;
        }
        if (scrolled + modifier > top_pos) {
          if (!fixed) {
            this.css({ top: modifier - bordermod, position: "fixed" });
            fixed = true;
          }
        } else {
          this.css({ top: "auto", position: "absolute" });
          fixed = false;
        }
      },
      toggle = function (e) {
        e.preventDefault();
        var clicked = $(this),
          menu = clicked.siblings(".av-subnav-menu");
        if (menu.hasClass("av-open-submenu")) {
          menu.removeClass("av-open-submenu");
        } else {
          menu.addClass("av-open-submenu");
        }
      };
    win.on("debouncedresize av-height-change", calc_margin);
    calc_margin();
    if (setWitdth.length) {
      win.on("debouncedresize av-height-change", calc_values);
      calc_values();
    }
    menus.each(function () {
      var menu = $(this),
        sticky = menu.filter(".av-sticky-submenu"),
        placeholder = menu.next(".sticky_placeholder"),
        mobile_button = menu.find(".mobile_menu_toggle");
      if (sticky.length) {
        win.on("scroll debouncedresize", function () {
          window.requestAnimationFrame(check.bind(sticky, placeholder));
        });
      }
      if (mobile_button.length) {
        mobile_button.on("click", toggle);
      }
    });
    html.on("click", ".av-submenu-hidden .av-open-submenu li a", function () {
      var current = $(this);
      var list_item = current.siblings("ul, .avia_mega_div");
      if (list_item.length) {
        if (list_item.hasClass("av-visible-sublist")) {
          list_item.removeClass("av-visible-sublist");
        } else {
          list_item.addClass("av-visible-sublist");
        }
        return false;
      }
    });
    $(".avia_mobile").on("click", ".av-menu-mobile-disabled li a", function () {
      var current = $(this);
      var list_item = current.siblings("ul");
      if (list_item.length) {
        if (list_item.hasClass("av-visible-mobile-sublist")) {
        } else {
          $(".av-visible-mobile-sublist").removeClass(
            "av-visible-mobile-sublist"
          );
          list_item.addClass("av-visible-mobile-sublist");
          return false;
        }
      }
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.avia_sc_messagebox = function (options) {
    "use strict";
    return this.each(function () {
      var container = $(this),
        close_btn = container.find(".av_message_close"),
        mbox_ID = container.attr("id"),
        aviaSetCookie = function (CookieName, CookieValue, CookieDays) {
          var expires = "";
          if (CookieDays) {
            var date = new Date();
            date.setTime(date.getTime() + CookieDays * 24 * 60 * 60 * 1000);
            expires = "; expires=" + date.toGMTString();
          }
          document.cookie =
            CookieName +
            "=" +
            CookieValue +
            expires +
            "; path=/; samesite=strict";
        },
        aviaGetCookie = function (CookieName) {
          var docCookiesStr = CookieName + "=";
          var docCookiesArr = document.cookie.split(";");
          for (var i = 0; i < docCookiesArr.length; i++) {
            var thisCookie = docCookiesArr[i];
            while (thisCookie.charAt(0) == " ") {
              thisCookie = thisCookie.substring(1, thisCookie.length);
            }
            if (thisCookie.indexOf(docCookiesStr) == 0) {
              var cookieContents = container.attr("data-contents");
              var savedContents = thisCookie.substring(
                docCookiesStr.length,
                thisCookie.length
              );
              if (savedContents == cookieContents) {
                return savedContents;
              }
            }
          }
          return null;
        };
      if (!aviaGetCookie(mbox_ID)) {
        container.removeClass("messagebox-hidden");
      }
      close_btn.on("click", function () {
        var cookieContents = container.attr("data-contents");
        var cookieLifetime = "";
        if (container.hasClass("messagebox-session_cookie")) {
          cookieLifetime = "";
        } else if (container.hasClass("messagebox-custom_cookie")) {
          cookieLifetime = parseInt(container.attr("data-cookielifetime"));
        }
        aviaSetCookie(mbox_ID, cookieContents, cookieLifetime);
        container.addClass("messagebox-hidden");
      });
    });
  };
  $(".avia_message_box").avia_sc_messagebox();
})(jQuery);
(function ($) {
  $.fn.avia_sc_animated_number = function (options) {
    if (!this.length) return;
    if (this.is(".avia_sc_animated_number_active")) return;
    this.addClass("avia_sc_animated_number_active");
    var simple_upcount = options && options.simple_up ? true : false,
      start_timer = options && options.start_timer ? options.start_timer : 300,
      format_number = function (number, number_format, final_number) {
        var prepend = "",
          addZeros = final_number.toString().length - number.toString().length;
        for (var i = addZeros; i > 0; i--) {
          prepend += "0";
        }
        number = simple_upcount
          ? number.toString()
          : prepend + number.toString();
        if ("" == number_format) {
          return number;
        }
        return number.split(/(?=(?:...)*$)/).join(number_format);
      },
      start_count = function (
        element,
        countTo,
        increment,
        current,
        fakeCountTo,
        number_format
      ) {
        var newCount = current + increment,
          final = "";
        if (newCount >= fakeCountTo) {
          final = format_number(countTo, number_format, countTo);
          element.text(final);
        } else {
          final = format_number(newCount, number_format, countTo);
          element.text(final);
          window.requestAnimationFrame(function () {
            start_count(
              element,
              countTo,
              increment,
              newCount,
              fakeCountTo,
              number_format
            );
          });
        }
      };
    return this.each(function () {
      var number_container = $(this),
        elements = number_container.find(".__av-single-number"),
        countTimer = number_container.data("timer") || 3000;
      elements.each(function (i) {
        var element = $(this),
          text = element.text();
        if (window.addEventListener) element.text(text.replace(/./g, "0"));
      });
      number_container
        .addClass("number_prepared")
        .on("avia_start_animation", function () {
          if (number_container.is(".avia_animation_done")) return;
          number_container.addClass("avia_animation_done");
          elements.each(function (i) {
            var element = $(this),
              countTo = element.data("number"),
              fakeCountTo = countTo,
              current = parseInt(element.text(), 10),
              zeroOnly = /^0+$/.test(countTo),
              increment = 0,
              number_format = "";
            if ("undefined" != typeof element.data("start_from")) {
              current = element.data("start_from");
            }
            if ("undefined" != typeof element.data("number_format")) {
              number_format = element.data("number_format");
            }
            if (zeroOnly && countTo !== 0) {
              fakeCountTo = countTo.replace(/0/g, "9");
            }
            increment = Math.round((fakeCountTo * 32) / countTimer);
            if (increment == 0 || increment % 10 == 0) increment += 1;
            setTimeout(function () {
              start_count(
                element,
                countTo,
                increment,
                current,
                fakeCountTo,
                number_format
              );
            }, start_timer);
          });
        });
      if (options && options.instant_start == true) {
        number_container.trigger("avia_start_animation");
      }
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.avia_utilities = $.avia_utilities || {};
  $.fn.avia_iso_sort = function (options) {
    return this.each(function () {
      var the_body = $("body"),
        container = $(this),
        portfolio_id = container.data("portfolio-id"),
        parentContainer = container.closest(
          ".av-portfolio-grid-sorting-container, .entry-content-wrapper, .avia-fullwidth-portfolio"
        ),
        filter = parentContainer
          .find(
            '.sort_width_container[data-portfolio-id="' + portfolio_id + '"]'
          )
          .find("#js_sort_items")
          .css({ visibility: "visible", opacity: 0 }),
        links = filter.find("a"),
        imgParent = container.find(".grid-image"),
        isoActive = false,
        items = $(".post-entry", container),
        is_originLeft = the_body.hasClass("rtl") ? false : true;
      function applyIso() {
        container
          .addClass("isotope_activated")
          .isotope({
            layoutMode: "fitRows",
            itemSelector: ".flex_column",
            originLeft: is_originLeft,
          });
        container.isotope("on", "layoutComplete", function () {
          container.css({ overflow: "visible" });
          the_body.trigger("av_resize_finished");
        });
        isoActive = true;
        setTimeout(function () {
          parentContainer.addClass("avia_sortable_active");
        }, 0);
      }
      links.on("click", function () {
        var current = $(this),
          selector = current.data("filter"),
          linktext = current.html(),
          activeCat = parentContainer.find(".av-current-sort-title");
        if (activeCat.length) activeCat.html(linktext);
        links.removeClass("active_sort");
        current.addClass("active_sort");
        container.attr("id", "grid_id_" + selector);
        parentContainer
          .find(".open_container .ajax_controlls .avia_close")
          .trigger("click");
        container.isotope({
          layoutMode: "fitRows",
          itemSelector: ".flex_column",
          filter: "." + selector,
          originLeft: is_originLeft,
        });
        return false;
      });
      $(window).on("debouncedresize", function () {
        applyIso();
      });
      $.avia_utilities.preload({
        container: container,
        single_callback: function () {
          filter.animate({ opacity: 1 }, 400);
          applyIso();
          setTimeout(function () {
            applyIso();
          });
          imgParent.css({ height: "auto" }).each(function (i) {
            var currentLink = $(this);
            setTimeout(function () {
              currentLink.animate({ opacity: 1 }, 1500);
            }, 100 * i);
          });
        },
      });
    });
  };
  $.fn.avia_portfolio_preview = function (passed_options) {
    var win = $(window),
      the_body = $("body"),
      isMobile = $.avia_utilities.isMobile,
      defaults = {
        open_in: ".portfolio-details-inner",
        easing: "easeOutQuint",
        timing: 800,
        transition: "slide",
      },
      options = $.extend({}, defaults, passed_options);
    return this.each(function () {
      var container = $(this),
        portfolio_id = container.data("portfolio-id"),
        target_wrap = $(
          '.portfolio_preview_container[data-portfolio-id="' +
            portfolio_id +
            '"]'
        ),
        target_container = target_wrap.find(options.open_in),
        items = container.find(".grid-entry"),
        content_retrieved = {},
        is_open = false,
        animating = false,
        index_open = false,
        ajax_call = false,
        methods,
        controls,
        loader = $.avia_utilities.loading();
      methods = {
        load_item: function (e) {
          e.preventDefault();
          var link = $(this),
            post_container = link.parents(".post-entry").eq(0),
            post_id = "ID_" + post_container.data("ajax-id"),
            clickedIndex = items.index(post_container);
          if (post_id === is_open || animating == true) {
            return false;
          }
          animating = true;
          container
            .find(".active_portfolio_item")
            .removeClass("active_portfolio_item");
          post_container.addClass("active_portfolio_item");
          loader.show();
          methods.ajax_get_contents(post_id, clickedIndex);
        },
        scroll_top: function () {
          setTimeout(function () {
            var target_offset = target_wrap.offset().top - 175,
              window_offset = win.scrollTop();
            if (
              window_offset > target_offset ||
              target_offset - window_offset > 100
            ) {
              $("html:not(:animated),body:not(:animated)").animate(
                { scrollTop: target_offset },
                options.timing,
                options.easing
              );
            }
          }, 10);
        },
        attach_item: function (post_id) {
          content_retrieved[post_id] = $(content_retrieved[post_id]).appendTo(
            target_container
          );
          ajax_call = true;
        },
        remove_video: function () {
          var del = target_wrap
            .find("iframe, .avia-video")
            .parents(".ajax_slide:not(.open_slide)");
          if (del.length > 0) {
            del.remove();
            content_retrieved["ID_" + del.data("slideId")] = undefined;
          }
        },
        show_item: function (post_id, clickedIndex) {
          if (post_id === is_open) {
            return false;
          }
          animating = true;
          loader.hide();
          if (false === is_open) {
            target_wrap.addClass("open_container");
            content_retrieved[post_id].addClass("open_slide");
            methods.scroll_top();
            target_wrap
              .css({ display: "none" })
              .slideDown(options.timing, options.easing, function () {
                if (ajax_call) {
                  $.avia_utilities.activate_shortcode_scripts(
                    content_retrieved[post_id]
                  );
                  $.avia_utilities.avia_ajax_call(content_retrieved[post_id]);
                  the_body.trigger("av_resize_finished");
                  ajax_call = false;
                }
                methods.remove_video();
                the_body.trigger("av_resize_finished");
              });
            index_open = clickedIndex;
            is_open = post_id;
            animating = false;
          } else {
            methods.scroll_top();
            var initCSS = { zIndex: 3 },
              easing = options.easing;
            if (index_open > clickedIndex) {
              initCSS.left = "-110%";
            }
            if (options.transition === "fade") {
              initCSS.left = "0%";
              initCSS.opacity = 0;
              easing = "easeOutQuad";
            }
            target_container.height(target_container.height());
            content_retrieved[post_id]
              .css(initCSS)
              .avia_animate({ left: "0%", opacity: 1 }, options.timing, easing);
            content_retrieved[is_open].avia_animate(
              { opacity: 0 },
              options.timing,
              easing,
              function () {
                content_retrieved[is_open]
                  .attr({ style: "" })
                  .removeClass("open_slide");
                content_retrieved[post_id].addClass("open_slide");
                target_container.avia_animate(
                  { height: content_retrieved[post_id].outerHeight() + 2 },
                  options.timing / 2,
                  options.easing,
                  function () {
                    target_container.attr({ style: "" });
                    is_open = post_id;
                    index_open = clickedIndex;
                    animating = false;
                    methods.remove_video();
                    if (ajax_call) {
                      the_body.trigger("av_resize_finished");
                      $.avia_utilities.activate_shortcode_scripts(
                        content_retrieved[post_id]
                      );
                      $.avia_utilities.avia_ajax_call(
                        content_retrieved[post_id]
                      );
                      ajax_call = false;
                    }
                  }
                );
              }
            );
          }
        },
        ajax_get_contents: function (post_id, clickedIndex) {
          if (content_retrieved[post_id] !== undefined) {
            methods.show_item(post_id, clickedIndex);
            return;
          }
          var template = $(
            "#avia-tmpl-portfolio-preview-" + post_id.replace(/ID_/, "")
          );
          if (template.length == 0) {
            setTimeout(function () {
              methods.ajax_get_contents(post_id, clickedIndex);
              return;
            }, 500);
          }
          content_retrieved[post_id] = template.html();
          content_retrieved[post_id] = content_retrieved[post_id]
            .replace("/*<![CDATA[*/", "")
            .replace("*]]>", "");
          methods.attach_item(post_id);
          $.avia_utilities.preload({
            container: content_retrieved[post_id],
            single_callback: function () {
              methods.show_item(post_id, clickedIndex);
            },
          });
        },
        add_controls: function () {
          controls = target_wrap.find(".ajax_controlls");
          target_wrap.avia_keyboard_controls({
            27: ".avia_close",
            37: ".ajax_previous",
            39: ".ajax_next",
          });
          items.each(function () {
            var current = $(this),
              overlay;
            current.addClass("no_combo").on("click", function (event) {
              overlay = current.find(".slideshow_overlay");
              if (overlay.length) {
                event.stopPropagation();
                methods.load_item.apply(current.find("a").eq(0));
                return false;
              }
            });
          });
        },
        control_click: function () {
          var showItem,
            activeID = container.find(".active_portfolio_item").data("ajax-id"),
            active = container.find(".post-entry-" + activeID);
          switch (this.hash) {
            case "#next":
              showItem = active
                .nextAll(".post-entry:visible")
                .eq(0)
                .find("a")
                .eq(0);
              if (!showItem.length) {
                showItem = $(".post-entry:visible", container)
                  .eq(0)
                  .find("a")
                  .eq(0);
              }
              showItem.trigger("click");
              break;
            case "#prev":
              showItem = active
                .prevAll(".post-entry:visible")
                .eq(0)
                .find("a")
                .eq(0);
              if (!showItem.length) {
                showItem = $(".post-entry:visible", container)
                  .last()
                  .find("a")
                  .eq(0);
              }
              showItem.trigger("click");
              break;
            case "#close":
              animating = true;
              target_wrap.slideUp(options.timing, options.easing, function () {
                container
                  .find(".active_portfolio_item")
                  .removeClass("active_portfolio_item");
                content_retrieved[is_open]
                  .attr({ style: "" })
                  .removeClass("open_slide");
                target_wrap.removeClass("open_container");
                animating = is_open = index_open = false;
                methods.remove_video();
                the_body.trigger("av_resize_finished");
              });
              break;
          }
          return false;
        },
        resize_reset: function () {
          if (is_open === false) {
            target_container.html("");
            content_retrieved = [];
          }
        },
      };
      methods.add_controls();
      container.on("click", "a", methods.load_item);
      controls.on("click", "a", methods.control_click);
      win.on("debouncedresize", methods.resize_reset);
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.avia_sc_progressbar = function (options) {
    return this.each(function () {
      var container = $(this),
        elements = container.find(".avia-progress-bar");
      container.on("avia_start_animation", function () {
        elements.each(function (i) {
          var element = $(this);
          setTimeout(function () {
            element.find(".progress").addClass("avia_start_animation");
            element
              .find(".progressbar-percent")
              .avia_sc_animated_number({
                instant_start: true,
                simple_up: true,
                start_timer: 10,
              });
          }, i * 250);
        });
      });
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.AviaVideoAPI = function (options, video, option_container) {
    this.videoElement = video;
    this.$video = $(video);
    this.$option_container = option_container
      ? $(option_container)
      : this.$video;
    this.load_btn = this.$option_container.find(".av-click-to-play-overlay");
    this.video_wrapper = this.$video.parents("ul").eq(0);
    this.lazy_load = this.video_wrapper.hasClass("av-show-video-on-click")
      ? true
      : false;
    this.isMobile = $.avia_utilities.isMobile;
    this.fallback = this.isMobile
      ? this.$option_container.is(".av-mobile-fallback-image")
      : false;
    if (this.fallback) {
      return;
    }
    this._init(options);
  };
  $.AviaVideoAPI.defaults = {
    loop: false,
    mute: false,
    controls: false,
    events: "play pause mute unmute loop toggle reset unload",
  };
  $.AviaVideoAPI.apiFiles = {
    youtube: { loaded: false, src: "https://www.youtube.com/iframe_api" },
  };
  $.AviaVideoAPI.players = {};
  $.AviaVideoAPI.prototype = {
    _init: function (options) {
      this.options = this._setOptions(options);
      this.type = this._getPlayerType();
      this.player = false;
      this._bind_player();
      this.eventsBound = false;
      this.playing = false;
      this.$option_container.addClass("av-video-paused");
      this.pp = $.avia_utilities.playpause(this.$option_container);
    },
    _setOptions: function (options) {
      var newOptions = $.extend(true, {}, $.AviaVideoAPI.defaults, options),
        htmlData = this.$option_container.data(),
        i = "";
      for (i in htmlData) {
        if (
          htmlData.hasOwnProperty(i) &&
          (typeof htmlData[i] === "string" ||
            typeof htmlData[i] === "number" ||
            typeof htmlData[i] === "boolean")
        ) {
          newOptions[i] = htmlData[i];
        }
      }
      return newOptions;
    },
    _getPlayerType: function () {
      var vid_src = this.$video.get(0).src || this.$video.data("src");
      if (this.$video.is("video")) {
        return "html5";
      }
      if (this.$video.is(".av_youtube_frame")) {
        return "youtube";
      }
      if (vid_src.indexOf("vimeo.com") != -1) {
        return "vimeo";
      }
      if (vid_src.indexOf("youtube.com") != -1) {
        return "youtube";
      }
    },
    _bind_player: function () {
      var _self = this;
      var cookie_check =
        $("html").hasClass("av-cookies-needs-opt-in") ||
        $("html").hasClass("av-cookies-can-opt-out");
      var allow_continue = true;
      var silent_accept_cookie = $("html").hasClass(
        "av-cookies-user-silent-accept"
      );
      var self_hosted = "html5" == this.type;
      if (cookie_check && !silent_accept_cookie && !self_hosted) {
        if (
          !document.cookie.match(/aviaCookieConsent/) ||
          $("html").hasClass("av-cookies-session-refused")
        ) {
          allow_continue = false;
        } else {
          if (!document.cookie.match(/aviaPrivacyRefuseCookiesHideBar/)) {
            allow_continue = false;
          } else if (
            !document.cookie.match(/aviaPrivacyEssentialCookiesEnabled/)
          ) {
            allow_continue = false;
          } else if (document.cookie.match(/aviaPrivacyVideoEmbedsDisabled/)) {
            allow_continue = false;
          }
        }
      }
      if (!allow_continue) {
        this._use_external_link();
        return;
      }
      if (this.lazy_load && this.load_btn.length && this.type != "html5") {
        this.$option_container.addClass("av-video-lazyload");
        this.load_btn.on("click", function () {
          _self.load_btn.remove();
          _self._setPlayer();
        });
      } else {
        this.lazy_load = false;
        this._setPlayer();
      }
    },
    _use_external_link: function () {
      this.$option_container.addClass("av-video-lazyload");
      this.load_btn.on("click", function (e) {
        if (e.originalEvent === undefined) return;
        var src_url = $(this)
          .parents(".avia-slide-wrap")
          .find("div[data-original_url]")
          .data("original_url");
        if (src_url) window.open(src_url, "_blank");
      });
    },
    _setPlayer: function () {
      var _self = this;
      switch (this.type) {
        case "html5":
          this.player = this.$video.data("mediaelementplayer");
          if (!this.player) {
            this.$video.data(
              "mediaelementplayer",
              $.AviaVideoAPI.players[
                this.$video.attr("id").replace(/_html5/, "")
              ]
            );
            this.player = this.$video.data("mediaelementplayer");
          }
          this._playerReady();
          break;
        case "vimeo":
          var ifrm = document.createElement("iframe");
          var $ifrm = $(ifrm);
          ifrm.onload = function () {
            _self.player = Froogaloop(ifrm);
            _self._playerReady();
            _self.$option_container.trigger("av-video-loaded");
          };
          ifrm.setAttribute("src", this.$video.data("src"));
          $ifrm.insertAfter(this.$video);
          this.$video.remove();
          this.$video = ifrm;
          break;
        case "youtube":
          this._getAPI(this.type);
          $("body").on("av-youtube-iframe-api-loaded", function () {
            _self._playerReady();
          });
          break;
      }
    },
    _getAPI: function (api) {
      if ($.AviaVideoAPI.apiFiles[api].loaded === false) {
        $.AviaVideoAPI.apiFiles[api].loaded = true;
        var tag = document.createElement("script"),
          first = document.getElementsByTagName("script")[0];
        tag.src = $.AviaVideoAPI.apiFiles[api].src;
        first.parentNode.insertBefore(tag, first);
      }
    },
    _playerReady: function () {
      var _self = this;
      this.$option_container.on("av-video-loaded", function () {
        _self._bindEvents();
      });
      switch (this.type) {
        case "html5":
          this.$video.on("av-mediajs-loaded", function () {
            _self.$option_container.trigger("av-video-loaded");
          });
          this.$video.on("av-mediajs-ended", function () {
            _self.$option_container.trigger("av-video-ended");
          });
          break;
        case "vimeo":
          _self.player.addEvent("ready", function () {
            _self.$option_container.trigger("av-video-loaded");
            _self.player.addEvent("finish", function () {
              _self.$option_container.trigger("av-video-ended");
            });
          });
          break;
        case "youtube":
          var params = _self.$video.data();
          if (_self._supports_video()) {
            params.html5 = 1;
          }
          _self.player = new YT.Player(_self.$video.attr("id"), {
            videoId: params.videoid,
            height: _self.$video.attr("height"),
            width: _self.$video.attr("width"),
            playerVars: params,
            events: {
              onReady: function () {
                _self.$option_container.trigger("av-video-loaded");
              },
              onError: function (player) {
                $.avia_utilities.log("YOUTUBE ERROR:", "error", player);
              },
              onStateChange: function (event) {
                if (event.data === YT.PlayerState.ENDED) {
                  var command =
                    _self.options.loop != false ? "loop" : "av-video-ended";
                  _self.$option_container.trigger(command);
                }
              },
            },
          });
          break;
      }
      setTimeout(function () {
        if (
          _self.eventsBound == true ||
          typeof _self.eventsBound == "undefined" ||
          _self.type == "youtube"
        ) {
          return;
        }
        $.avia_utilities.log(
          'Fallback Video Trigger "' + _self.type + '":',
          "log",
          _self
        );
        _self.$option_container.trigger("av-video-loaded");
      }, 2000);
    },
    _bindEvents: function () {
      if (this.eventsBound == true || typeof this.eventsBound == "undefined") {
        return;
      }
      var _self = this,
        volume = "unmute";
      this.eventsBound = true;
      this.$option_container.on(this.options.events, function (e) {
        _self.api(e.type);
      });
      if (!_self.isMobile) {
        if (this.options.mute != false) {
          volume = "mute";
        }
        if (this.options.loop != false) {
          _self.api("loop");
        }
        _self.api(volume);
      }
      setTimeout(function () {
        _self.$option_container
          .trigger("av-video-events-bound")
          .addClass("av-video-events-bound");
      }, 50);
    },
    _supports_video: function () {
      return !!document.createElement("video").canPlayType;
    },
    api: function (action) {
      if (this.isMobile && !this.was_started()) return;
      if (this.options.events.indexOf(action) === -1) return;
      this.$option_container.trigger("av-video-" + action + "-executed");
      if (typeof this["_" + this.type + "_" + action] == "function") {
        this["_" + this.type + "_" + action].call(this);
      }
      if (typeof this["_" + action] == "function") {
        this["_" + action].call(this);
      }
    },
    was_started: function () {
      if (!this.player) return false;
      switch (this.type) {
        case "html5":
          if (this.player.getCurrentTime() > 0) {
            return true;
          }
          break;
        case "vimeo":
          if (this.player.api("getCurrentTime") > 0) {
            return true;
          }
          break;
        case "youtube":
          if (this.player.getPlayerState() !== -1) {
            return true;
          }
          break;
      }
      return false;
    },
    _play: function () {
      this.playing = true;
      this.$option_container
        .addClass("av-video-playing")
        .removeClass("av-video-paused");
    },
    _pause: function () {
      this.playing = false;
      this.$option_container
        .removeClass("av-video-playing")
        .addClass("av-video-paused");
    },
    _loop: function () {
      this.options.loop = true;
    },
    _toggle: function () {
      var command = this.playing == true ? "pause" : "play";
      this.api(command);
      this.pp.set(command);
    },
    _vimeo_play: function () {
      this.player.api("play");
    },
    _vimeo_pause: function () {
      this.player.api("pause");
    },
    _vimeo_mute: function () {
      this.player.api("setVolume", 0);
    },
    _vimeo_unmute: function () {
      this.player.api("setVolume", 0.7);
    },
    _vimeo_loop: function () {},
    _vimeo_reset: function () {
      this.player.api("seekTo", 0);
    },
    _vimeo_unload: function () {
      this.player.api("unload");
    },
    _youtube_play: function () {
      this.player.playVideo();
    },
    _youtube_pause: function () {
      this.player.pauseVideo();
    },
    _youtube_mute: function () {
      this.player.mute();
    },
    _youtube_unmute: function () {
      this.player.unMute();
    },
    _youtube_loop: function () {
      if (this.playing == true) this.player.seekTo(0);
    },
    _youtube_reset: function () {
      this.player.stopVideo();
    },
    _youtube_unload: function () {
      this.player.clearVideo();
    },
    _html5_play: function () {
      if (this.player) {
        this.player.options.pauseOtherPlayers = false;
        this.player.play();
      }
    },
    _html5_pause: function () {
      if (this.player) this.player.pause();
    },
    _html5_mute: function () {
      if (this.player) this.player.setMuted(true);
    },
    _html5_unmute: function () {
      if (this.player) this.player.setVolume(0.7);
    },
    _html5_loop: function () {
      if (this.player) this.player.options.loop = true;
    },
    _html5_reset: function () {
      if (this.player) this.player.setCurrentTime(0);
    },
    _html5_unload: function () {
      this._html5_pause();
      this._html5_reset();
    },
  };
  $.fn.aviaVideoApi = function (options, apply_to_parent) {
    return this.each(function () {
      var applyTo = this;
      if (apply_to_parent) {
        applyTo = $(this).parents(apply_to_parent).get(0);
      }
      var self = $.data(applyTo, "aviaVideoApi");
      if (!self) {
        self = $.data(
          applyTo,
          "aviaVideoApi",
          new $.AviaVideoAPI(options, this, applyTo)
        );
      }
    });
  };
})(jQuery);
window.onYouTubeIframeAPIReady = function () {
  jQuery("body").trigger("av-youtube-iframe-api-loaded");
};
var Froogaloop = (function () {
  function Froogaloop(iframe) {
    return new Froogaloop.fn.init(iframe);
  }
  var eventCallbacks = {},
    hasWindowEvent = false,
    isReady = false,
    slice = Array.prototype.slice,
    playerOrigin = "*";
  Froogaloop.fn = Froogaloop.prototype = {
    element: null,
    init: function (iframe) {
      if (typeof iframe === "string") {
        iframe = document.getElementById(iframe);
      }
      this.element = iframe;
      return this;
    },
    api: function (method, valueOrCallback) {
      if (!this.element || !method) {
        return false;
      }
      var self = this,
        element = self.element,
        target_id = element.id !== "" ? element.id : null,
        params = !isFunction(valueOrCallback) ? valueOrCallback : null,
        callback = isFunction(valueOrCallback) ? valueOrCallback : null;
      if (callback) {
        storeCallback(method, callback, target_id);
      }
      postMessage(method, params, element);
      return self;
    },
    addEvent: function (eventName, callback) {
      if (!this.element) {
        return false;
      }
      var self = this,
        element = self.element,
        target_id = element.id !== "" ? element.id : null;
      storeCallback(eventName, callback, target_id);
      if (eventName != "ready") {
        postMessage("addEventListener", eventName, element);
      } else if (eventName == "ready" && isReady) {
        callback.call(null, target_id);
      }
      return self;
    },
    removeEvent: function (eventName) {
      if (!this.element) {
        return false;
      }
      var self = this,
        element = self.element,
        target_id = element.id !== "" ? element.id : null,
        removed = removeCallback(eventName, target_id);
      if (eventName != "ready" && removed) {
        postMessage("removeEventListener", eventName, element);
      }
    },
  };
  function postMessage(method, params, target) {
    if (!target.contentWindow.postMessage) {
      return false;
    }
    var data = JSON.stringify({ method: method, value: params });
    target.contentWindow.postMessage(data, playerOrigin);
  }
  function onMessageReceived(event) {
    var data, method;
    try {
      data = JSON.parse(event.data);
      method = data.event || data.method;
    } catch (e) {}
    if (method == "ready" && !isReady) {
      isReady = true;
    }
    if (!/^https?:\/\/player.vimeo.com/.test(event.origin)) {
      return false;
    }
    if (playerOrigin === "*") {
      playerOrigin = event.origin;
    }
    var value = data.value,
      eventData = data.data,
      target_id = target_id === "" ? null : data.player_id,
      callback = getCallback(method, target_id),
      params = [];
    if (!callback) {
      return false;
    }
    if (value !== undefined) {
      params.push(value);
    }
    if (eventData) {
      params.push(eventData);
    }
    if (target_id) {
      params.push(target_id);
    }
    return params.length > 0 ? callback.apply(null, params) : callback.call();
  }
  function storeCallback(eventName, callback, target_id) {
    if (target_id) {
      if (!eventCallbacks[target_id]) {
        eventCallbacks[target_id] = {};
      }
      eventCallbacks[target_id][eventName] = callback;
    } else {
      eventCallbacks[eventName] = callback;
    }
  }
  function getCallback(eventName, target_id) {
    if (
      target_id &&
      eventCallbacks[target_id] &&
      eventCallbacks[target_id][eventName]
    ) {
      return eventCallbacks[target_id][eventName];
    } else {
      return eventCallbacks[eventName];
    }
  }
  function removeCallback(eventName, target_id) {
    if (target_id && eventCallbacks[target_id]) {
      if (!eventCallbacks[target_id][eventName]) {
        return false;
      }
      eventCallbacks[target_id][eventName] = null;
    } else {
      if (!eventCallbacks[eventName]) {
        return false;
      }
      eventCallbacks[eventName] = null;
    }
    return true;
  }
  function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  }
  function isArray(obj) {
    return toString.call(obj) === "[object Array]";
  }
  Froogaloop.fn.init.prototype = Froogaloop.fn;
  if (window.addEventListener) {
    window.addEventListener("message", onMessageReceived, false);
  } else {
    window.attachEvent("onmessage", onMessageReceived);
  }
  return (window.Froogaloop = window.$f = Froogaloop);
})();
(function ($) {
  "use strict";
  $.AviaccordionSlider = function (options, slider) {
    this.$slider = $(slider);
    this.$inner = this.$slider.find(".aviaccordion-inner");
    this.$slides = this.$inner.find(".aviaccordion-slide");
    this.$images = this.$inner.find(".aviaccordion-image");
    this.$last = this.$slides.last();
    this.$titles = this.$slider.find(".aviaccordion-preview");
    this.$titlePos = this.$slider.find(".aviaccordion-preview-title-pos");
    this.$titleWrap = this.$slider.find(".aviaccordion-preview-title-wrap");
    this.$win = $(window);
    if ($.avia_utilities.supported.transition === undefined) {
      $.avia_utilities.supported.transition =
        $.avia_utilities.supports("transition");
    }
    this.options = {};
    this.browserPrefix = $.avia_utilities.supported.transition;
    this.cssActive = this.browserPrefix !== false ? true : false;
    this.transform3d =
      document.documentElement.className.indexOf("avia_transform3d") !== -1
        ? true
        : false;
    this.isMobile = $.avia_utilities.isMobile;
    this.isTouchDevice = $.avia_utilities.isTouchDevice;
    this.property = this.browserPrefix + "transform";
    this.count = this.$slides.length;
    this.open = false;
    this.autoplay = false;
    this.increaseTitle = this.$slider.is(".aviaccordion-title-on-hover");
    this._init(options);
  };
  $.AviaccordionSlider.defaults = {
    interval: 5,
    autoplay: true,
    loop_autoplay: "endless",
  };
  $.AviaccordionSlider.prototype = {
    _init: function (options) {
      var _self = this;
      this.options = this._setOptions(options);
      $.avia_utilities.preload({
        container: this.$slider,
        single_callback: function () {
          _self._kickOff();
        },
      });
    },
    _setOptions: function (options) {
      var jsonOptions = this.$slider.data("slideshow-options");
      if ("object" == typeof jsonOptions) {
        var newOptions = $.extend(
          {},
          $.AviaccordionSlider.defaults,
          options,
          jsonOptions
        );
        return newOptions;
      }
      var newOptions = $.extend(
        {},
        $.AviaccordionSlider.defaults,
        options,
        this.$slider.data()
      );
      return newOptions;
    },
    _kickOff: function () {
      var _self = this;
      _self._calcMovement();
      _self._bindEvents();
      _self._showImages();
      _self._autoplay();
    },
    _autoplay: function () {
      var _self = this;
      if (_self.options.autoplay) {
        _self.autoplay = setInterval(function () {
          _self.open = _self.open === false ? 0 : _self.open + 1;
          if (_self.open >= _self.count) {
            if (_self.options.loop_autoplay == "once") {
              clearInterval(_self.autoplay);
              _self.options.autoplay = false;
              _self.autoplay = false;
              return;
            }
            _self.open = 0;
          }
          _self._move({}, _self.open);
        }, _self.options.interval * 1000);
      }
    },
    _showImages: function () {
      var _self = this,
        counter = 0,
        delay = 300,
        title_delay = this.count * delay;
      if (this.cssActive) {
        setTimeout(function () {
          _self.$slider.addClass("av-animation-active");
        }, 10);
      }
      this.$images.each(function (i) {
        var current = $(this),
          timer = delay * (i + 1);
        setTimeout(function () {
          current.avia_animate({ opacity: 1 }, 400, function () {
            current.css(
              $.avia_utilities.supported.transition + "transform",
              "none"
            );
          });
        }, timer);
      });
      if (_self.increaseTitle) {
        title_delay = 0;
      }
      this.$titlePos.each(function (i) {
        var current = $(this),
          new_timer = title_delay + 100 * (i + 1);
        setTimeout(function () {
          current.avia_animate({ opacity: 1 }, 200, function () {
            current.css(
              $.avia_utilities.supported.transition + "transform",
              "none"
            );
          });
        }, new_timer);
      });
    },
    _bindEvents: function () {
      var trigger = this.isMobile ? "click" : "mouseenter";
      this.$slider.on(trigger, ".aviaccordion-slide", this._move.bind(this));
      this.$slider.on(
        "mouseleave",
        ".aviaccordion-inner",
        this._move.bind(this)
      );
      this.$win.on("debouncedresize", this._calcMovement.bind(this));
      this.$slider.on("av-prev av-next", this._moveTo.bind(this));
      if (this.isMobile || this.isTouchDevice) {
        this.$slider.avia_swipe_trigger({
          next: this.$slider,
          prev: this.$slider,
          event: { prev: "av-prev", next: "av-next" },
        });
      }
    },
    _titleHeight: function () {
      var th = 0;
      this.$titleWrap
        .css({ height: "auto" })
        .each(function () {
          var new_h = $(this).outerHeight();
          if (new_h > th) {
            th = new_h;
          }
        })
        .css({ height: th + 2 });
    },
    _calcMovement: function (event, allow_repeat) {
      var _self = this,
        containerWidth = this.$slider.width(),
        defaultPos = this.$last.data("av-left"),
        imgWidth = this.$images.last().width() || containerWidth,
        imgWidthPercent = Math.floor((100 / containerWidth) * imgWidth),
        allImageWidth = imgWidthPercent * _self.count,
        modifier = 3,
        tempMinLeft = 100 - imgWidthPercent,
        minLeft = tempMinLeft > defaultPos / modifier ? tempMinLeft : 0,
        oneLeft = minLeft / (_self.count - 1),
        titleWidth = imgWidth;
      if (allImageWidth < 110 && allow_repeat !== false) {
        var slideHeight = this.$slider.height(),
          maxHeight = (slideHeight / allImageWidth) * 110;
        this.$slider.css({ "max-height": maxHeight });
        _self._calcMovement(event, false);
        return;
      }
      if (oneLeft < 2) {
        minLeft = 0;
      }
      this.$slides.each(function (i) {
        var current = $(this),
          newLeft = 0,
          newRight = 0,
          defaultLeft = current.data("av-left");
        if (minLeft !== 0) {
          newLeft = oneLeft * i;
          newRight = imgWidthPercent + newLeft - oneLeft;
        } else {
          newLeft = defaultLeft / Math.abs(modifier);
          newRight = 100 - (newLeft / i) * (_self.count - i);
        }
        if (i == 1 && _self.increaseTitle) {
          titleWidth = newRight + 1;
        }
        if (_self.cssActive) {
          newLeft = newLeft - defaultLeft;
          newRight = newRight - defaultLeft;
          defaultLeft = 0;
        }
        current.data("av-calc-default", defaultLeft);
        current.data("av-calc-left", newLeft);
        current.data("av-calc-right", newRight);
      });
      if (_self.increaseTitle) {
        _self.$titles.css({ width: titleWidth + "%" });
      }
    },
    _moveTo: function (event) {
      var direction = event.type == "av-next" ? 1 : -1,
        nextSlide = this.open === false ? 0 : this.open + direction;
      if (nextSlide >= 0 && nextSlide < this.$slides.length) {
        this._move(event, nextSlide);
      }
    },
    _move: function (event, direct_open) {
      var _self = this,
        slide = event.currentTarget,
        itemNo =
          typeof direct_open != "undefined"
            ? direct_open
            : this.$slides.index(slide);
      this.open = itemNo;
      if (_self.autoplay && typeof slide != "undefined") {
        clearInterval(_self.autoplay);
        _self.autoplay = false;
      }
      this.$slides.removeClass("aviaccordion-active-slide").each(function (i) {
        var current = $(this),
          dataSet = current.data(),
          trans_val = i <= itemNo ? dataSet.avCalcLeft : dataSet.avCalcRight,
          transition = {},
          reset = event.type == "mouseleave" ? 1 : 0,
          active = itemNo === i ? _self.$titleWrap.eq(i) : false;
        if (active) {
          current.addClass("aviaccordion-active-slide");
        }
        if (reset) {
          trans_val = dataSet.avCalcDefault;
          this.open = false;
        }
        if (_self.cssActive) {
          transition[_self.property] = _self.transform3d
            ? "translate3d(" + trans_val + "%, 0, 0)"
            : "translate(" + trans_val + "%,0)";
          current.css(transition);
        } else {
          transition.left = trans_val + "%";
          current.stop().animate(transition, 700, "easeOutQuint");
        }
      });
    },
  };
  $.fn.aviaccordion = function (options) {
    return this.each(function () {
      var active = $.data(this, "AviaccordionSlider");
      if (!active) {
        $.data(this, "AviaccordionSlider", 1);
        new $.AviaccordionSlider(options, this);
      }
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.AviaFullscreenSlider = function (options, slider) {
    this.$slider = $(slider);
    this.$inner = this.$slider.find(".avia-slideshow-inner");
    this.$innerLi = this.$inner.find(">li");
    this.$caption = this.$inner.find(".avia-slide-wrap .caption_container");
    this.$win = $(window);
    this.isMobile = $.avia_utilities.isMobile;
    this.isTouchDevice = $.avia_utilities.isTouchDevice;
    this.mobile_no_animation = $("body").hasClass("avia-mobile-no-animations");
    this.options = {};
    this.property = {};
    this.scrollPos = "0";
    this.transform3d =
      document.documentElement.className.indexOf("avia_transform3d") !== -1
        ? true
        : false;
    this.ticking = false;
    if ($.avia_utilities.supported.transition === undefined) {
      $.avia_utilities.supported.transition =
        $.avia_utilities.supports("transition");
    }
    this._init(options);
  };
  $.AviaFullscreenSlider.defaults = {
    height: 100,
    subtract: "#wpadminbar, #header, #main>.title_container",
    image_attachment: "scroll",
    parallax_enabled: true,
  };
  $.AviaFullscreenSlider.prototype = {
    _init: function (options) {
      var _self = this,
        slideshow_options = this.$slider.data("slideshow-options");
      this.options = $.extend(
        true,
        {},
        $.AviaFullscreenSlider.defaults,
        options
      );
      if ("object" == typeof slideshow_options) {
        this.options.height =
          "undefined" != typeof slideshow_options.slide_height
            ? slideshow_options.slide_height
            : this.options.height;
        this.options.image_attachment =
          "undefined" != typeof slideshow_options.image_attachment
            ? slideshow_options.image_attachment
            : this.options.image_attachment;
      } else {
        if (this.$slider.data("slide_height")) {
          this.options.height = this.$slider.data("slide_height");
        }
        if (this.$slider.data("image_attachment")) {
          this.options.image_attachment = this.$slider.data("image_attachment");
        }
      }
      this.options.parallax_enabled =
        this.options.image_attachment == "" ? true : false;
      this.$subtract = $(this.options.subtract);
      this._setSize();
      this.$win.on("debouncedresize", this._setSize.bind(this));
      setTimeout(function () {
        if (_self.options.parallax_enabled) {
          if (
            !_self.isMobile ||
            (_self.isMobile && !this.mobile_no_animation)
          ) {
            _self.$win.on("scroll", _self._on_scroll.bind(_self));
          }
        }
      }, 100);
      this.$slider.aviaSlider({ bg_slider: true });
    },
    _on_scroll: function (e) {
      var _self = this;
      if (!_self.ticking) {
        _self.ticking = true;
        window.requestAnimationFrame(_self._parallaxRequest.bind(_self));
      }
    },
    _fetch_properties: function (slide_height) {
      this.property.offset = this.$slider.offset().top;
      this.property.wh = this.$win.height();
      this.property.height = slide_height || this.$slider.outerHeight();
      this._parallax_scroll();
    },
    _setSize: function () {
      if (!$.fn.avia_browser_height) {
        var viewport = this.$win.height(),
          slide_height = Math.ceil((viewport / 100) * this.options.height);
        if (this.$subtract.length && this.options.height == 100) {
          this.$subtract.each(function () {
            slide_height -= this.offsetHeight - 0.5;
          });
        } else {
          slide_height -= 1;
        }
        this.$slider
          .height(slide_height)
          .removeClass("av-default-height-applied");
        this.$inner.css("padding", 0);
      }
      this._fetch_properties(slide_height);
    },
    _parallaxRequest: function (e) {
      var _self = this;
      setTimeout(_self._parallax_scroll.bind(_self), 0);
    },
    _parallax_scroll: function (e) {
      if (!this.options.parallax_enabled) {
        return;
      }
      if (this.isMobile && this.mobile_no_animation) {
        return;
      }
      var winTop = this.$win.scrollTop(),
        winBottom = winTop + this.property.wh,
        scrollPos = "0",
        prop = {};
      if (
        this.property.offset < winTop &&
        winTop <= this.property.offset + this.property.height
      ) {
        scrollPos = Math.round((winTop - this.property.offset) * 0.3);
      }
      if (this.scrollPos != scrollPos) {
        this.scrollPos = scrollPos;
        if (this.transform3d) {
          prop[$.avia_utilities.supported.transition + "transform"] =
            "translate3d(0px," + scrollPos + "px,0px)";
        } else {
          prop[$.avia_utilities.supported.transition + "transform"] =
            "translate(0px," + scrollPos + "px)";
        }
        this.$inner.css(prop);
      }
      this.ticking = false;
    },
  };
  $.fn.aviaFullscreenSlider = function (options) {
    return this.each(function () {
      var active = $.data(this, "aviaFullscreenSlider");
      if (!active) {
        $.data(this, "aviaFullscreenSlider", 1);
        new $.AviaFullscreenSlider(options, this);
      }
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.layer_slider_height_helper = function (options) {
    return this.each(function () {
      var container = $(this),
        first_div = container.find(">div").first(),
        timeout = false,
        counter = 0,
        reset_size = function () {
          if (first_div.height() > 0 || counter > 5) {
            container.height("auto");
          } else {
            timeout = setTimeout(reset_size, 500);
            counter++;
          }
        };
      if (!first_div.length) {
        return;
      }
      timeout = setTimeout(reset_size, 0);
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.avia_sc_tab_section = function () {
    var win = $(window),
      browserPrefix = $.avia_utilities.supports("transition"),
      cssActive = this.browserPrefix !== false ? true : false,
      isMobile = $.avia_utilities.isMobile,
      isTouchDevice = $.avia_utilities.isTouchDevice,
      mobile_no_animation = $("body").hasClass("avia-mobile-no-animations"),
      transform3d =
        document.documentElement.className.indexOf("avia_transform3d") !== -1
          ? true
          : false,
      transition = {},
      animations = [
        "avia_animate_when_visible",
        "avia_animate_when_almost_visible",
        "av-animated-generic",
        "av-animated-when-visible",
        "av-animated-when-almost-visible",
        "av-animated-when-visible-95",
      ];
    return this.each(function () {
      var container = $(this),
        tabs = container.find(".av-section-tab-title"),
        tab_outer = container.find(".av-tab-section-outer-container"),
        tab_wrap = container.find(".av-tab-section-tab-title-container"),
        tab_nav = container.find(".av_tab_navigation"),
        arrows_wrap = container.find(".av-tabsection-arrow"),
        arrows = arrows_wrap.find(".av-tab-section-slide"),
        slides_wrap = container.find(".av-slide-section-container-wrap"),
        slide_arrows_wrap = container.find(".av-tabsection-slides-arrow"),
        slide_arrows = slide_arrows_wrap.find(".av-tab-section-slide-content"),
        slide_dots_wrap = container.find(".av-tabsection-slides-dots"),
        slide_dots = slide_dots_wrap.find(".goto-slide"),
        content_wrap = container.find(".av-tab-section-inner-container"),
        single_tabs = container.find(".av-animation-delay-container"),
        layout_tab_wrap = container.find(".av-layout-tab"),
        inner_content = container.find(".av-layout-tab-inner"),
        flexible = container.is(".av-tab-content-auto"),
        minimumBrowserHeight = container.hasClass("av-minimum-height"),
        current_content = null,
        current_tab_id = "1",
        current_iTab_id = 1,
        min_width = 0,
        transition_action = "none",
        slideshowOptions = {
          animation: "av-tab-slide-transition",
          autoplay: false,
          loop_autoplay: "once",
          interval: 5,
          loop_manual: "manual-endless",
          autoplay_stopper: false,
          noNavigation: false,
        },
        slideshowData = tab_outer.data("slideshow-data"),
        deepLinksToTabs = {},
        timeoutIDAutoplay = null;
      if ("undefined" != typeof slideshowData) {
        slideshowOptions = $.extend({}, slideshowOptions, slideshowData);
      }
      layout_tab_wrap.each(function () {
        var tab = $(this),
          link = tab.data("av-deeplink-tabs"),
          id = tab.data("av-tab-section-content");
        if (link) {
          deepLinksToTabs[link.toLowerCase()] = id;
        }
      });
      current_tab_id = container
        .find(".av-active-tab-title")
        .data("av-tab-section-title");
      current_tab_id =
        "undefined" != typeof current_tab_id ? current_tab_id : "1";
      current_iTab_id = parseInt(current_tab_id, 10);
      current_content = container.find(
        '[data-av-tab-section-content="' + current_tab_id + '"]'
      );
      current_content.addClass("__av_init_open av-active-tab-content");
      if ("av-tab-slide-transition" == slideshowOptions.animation) {
        transition_action = "slide_sidewards";
      } else if ("av-tab-slide-up-transition" == slideshowOptions.animation) {
        transition_action = "slide_up";
      } else if ("av-tab-fade-transition" == slideshowOptions.animation) {
        transition_action = "fade";
      }
      if ("slide_up" == transition_action) {
        $.each(animations, function (index, value) {
          inner_content
            .find("." + value)
            .addClass("avia_start_animation_when_active");
        });
      }
      var change_tab = function (e, prevent_hash) {
          e.preventDefault();
          if (
            container.hasClass("av-is-slideshow") &&
            e.originalEvent !== undefined
          ) {
            return;
          }
          var current_tab = $(e.currentTarget),
            tab_nr = current_tab.data("av-tab-section-title"),
            iTab_nr = parseInt(tab_nr, 10),
            prev_content = current_content;
          tabs.removeClass("av-active-tab-title");
          prev_content.removeClass("av-active-tab-content");
          current_tab.removeClass("no-scroll");
          current_content = container.find(
            '[data-av-tab-section-content="' + tab_nr + '"]'
          );
          current_tab_id = tab_nr;
          current_iTab_id = iTab_nr;
          current_tab.addClass("av-active-tab-title");
          current_content.addClass("av-active-tab-content");
          var new_pos = (iTab_nr - 1) * -100;
          if ($("body").hasClass("rtl")) {
            new_pos = (iTab_nr - 1) * 100;
          }
          set_slide_height();
          if (["none", "slide_sidewards"].indexOf(transition_action) >= 0) {
            if (cssActive) {
              new_pos = new_pos / tabs.length;
              transition["transform"] = transform3d
                ? "translate3d(" + new_pos + "%, 0, 0)"
                : "translate(" + new_pos + "%,0)";
              transition["left"] = "0%";
              content_wrap.css(transition);
            } else {
              content_wrap.css("left", new_pos + "%");
            }
          } else if ("slide_up" == transition_action) {
            layout_tab_wrap.css("opacity", 1);
            if (cssActive) {
              var top = current_content.data("slide-top");
              if ("undefined" == typeof top) {
                top = 0;
              }
              transition["transform"] = transform3d
                ? "translate3d(0, -" + top + "px, 0)"
                : "translate(0, -" + top + "px ,0)";
              transition["left"] = "0";
              content_wrap.css(transition);
            } else {
              content_wrap.css("top", "-" + new_pos + "px");
            }
            layout_tab_wrap
              .filter(":not(.av-active-tab-content)")
              .css("opacity", 0);
          }
          set_tab_title_pos();
          set_slide_arrows_visibility(iTab_nr);
          set_slide_dots_visibility(iTab_nr);
          if (!(prevent_hash || slideshowOptions.autoplay)) {
            var newHash = current_tab.attr("href"),
              deepLink = current_content.data("av-deeplink-tabs");
            if ("undefined" != typeof deepLink && "" != deepLink) {
              newHash = deepLink;
            }
            location.hash = newHash;
          }
          setTimeout(function () {
            current_content.trigger(
              "avia_start_animation_if_current_slide_is_active"
            );
            if (!isMobile || (isMobile && !mobile_no_animation)) {
              single_tabs.not(current_content).trigger("avia_remove_animation");
            }
          }, 600);
        },
        set_min_width = function () {
          min_width = 0;
          tabs.each(function () {
            min_width += $(this).outerWidth();
          });
          tab_wrap.css("min-width", min_width);
        },
        set_slide_height = function () {
          var tab_wrap_height = container.hasClass("av-hide-tabs")
              ? 0
              : tab_wrap.height(),
            tab_wrap_add = tab_wrap_height ? tab_wrap.outerHeight() : 0,
            min_el_height = 0,
            cell_padding = 0,
            same_slide_height = 0,
            same_table_cell_height = 0,
            calc_el_height = 0;
          if (minimumBrowserHeight) {
            var css_height = container.hasClass("av-minimum-height-custom")
              ? container.data("av_minimum_height_px")
              : container.css("min-height");
            css_height = parseInt(css_height, 10);
            if (!isNaN(css_height)) {
              min_el_height = css_height;
            }
            if (!min_el_height) {
              minimumBrowserHeight = false;
            }
          }
          if (!flexible) {
            inner_content.css("height", "");
            content_wrap.css("min-height", "");
            var first = layout_tab_wrap.first();
            cell_padding = first.outerHeight() - first.height();
            layout_tab_wrap.each(function () {
              var content = $(this),
                inner = content.find(".av-layout-tab-inner");
              same_slide_height = Math.max(same_slide_height, inner.height());
            });
            same_table_cell_height = same_slide_height + cell_padding;
            calc_el_height = same_table_cell_height + tab_wrap_add;
            if (minimumBrowserHeight) {
              if (calc_el_height < min_el_height) {
                same_table_cell_height = min_el_height - tab_wrap_add;
                calc_el_height = min_el_height;
              }
            }
            content_wrap.css("min-height", same_table_cell_height);
            content_wrap.css("height", same_table_cell_height);
          } else if (flexible && minimumBrowserHeight) {
            same_table_cell_height = min_el_height - tab_wrap_add;
            calc_el_height = min_el_height;
            content_wrap.css("min-height", same_table_cell_height);
            content_wrap.css("height", same_table_cell_height);
          }
          if (
            ["none", "slide_sidewards", "fade"].indexOf(transition_action) >= 0
          ) {
            if (!current_content.length) {
              return;
            }
            if (flexible) {
              inner_content.height("auto");
              var content_height = current_content
                  .find(".av-layout-tab-inner")
                  .height(),
                height = current_content.outerHeight(),
                outer_height = height + tab_wrap_height + 100;
              tab_outer.css("max-height", outer_height);
              inner_content.height(content_height);
              inner_content.css("overflow", "hidden");
            }
            setTimeout(function () {
              win.trigger("av-height-change");
            }, 600);
            return;
          }
          var top = 0;
          layout_tab_wrap.each(function () {
            var content = $(this),
              inner = content.find(".av-layout-tab-inner"),
              layout_tab_nr = content.data("av-tab-section-content"),
              layout_iTab_nr = parseInt(layout_tab_nr, 10),
              outerHeight = content.outerHeight();
            content.data("slide-top", top);
            top += outerHeight;
            if (flexible && layout_iTab_nr == current_iTab_id) {
              tab_outer.css("max-height", outerHeight + tab_wrap_add);
              inner.css("overflow", "hidden");
            }
          });
        },
        set_tab_title_pos = function () {
          var current_tab = container.find(".av-active-tab-title"),
            viewport = container.width(),
            left_pos =
              current_tab.position().left * -1 -
              current_tab.outerWidth() / 2 +
              viewport / 2;
          if (!$("body").hasClass("rtl")) {
            if (viewport >= min_width) {
              left_pos = 0;
            }
            if (left_pos + min_width < viewport) {
              left_pos = (min_width - viewport) * -1;
            }
            if (left_pos > 0) {
              left_pos = 0;
            }
            tab_wrap.css("left", left_pos);
            var show_prev = left_pos !== 0;
            var show_next = left_pos + min_width > viewport;
            set_arrows_visibility(show_prev, show_next);
          } else {
            var right_pos = 0;
            if (viewport < min_width) {
              if (left_pos + min_width > viewport) {
                if (left_pos > 0) {
                  left_pos = 0;
                }
                right_pos = (left_pos + min_width - viewport) * -1;
              }
            }
            tab_wrap.css("left", "auto");
            tab_wrap.css("right", right_pos);
            var show_prev = right_pos + min_width > viewport;
            var show_next = right_pos !== 0;
            set_arrows_visibility(show_prev, show_next);
          }
        },
        set_arrows_visibility = function (show_prev, show_next) {
          if (show_prev) {
            arrows_wrap.addClass("av-visible-prev");
          } else {
            arrows_wrap.removeClass("av-visible-prev");
          }
          if (show_next) {
            arrows_wrap.addClass("av-visible-next");
          } else {
            arrows_wrap.removeClass("av-visible-next");
          }
        },
        set_slide_arrows_visibility = function (current_tab) {
          if (current_tab > 1) {
            slide_arrows_wrap.addClass("av-visible-prev");
          } else {
            slide_arrows_wrap.removeClass("av-visible-prev");
          }
          if (current_tab < tabs.length) {
            slide_arrows_wrap.addClass("av-visible-next");
          } else {
            slide_arrows_wrap.removeClass("av-visible-next");
          }
        },
        set_slide_dots_visibility = function (current_tab) {
          slide_dots_wrap.find("a").removeClass("active");
          slide_dots_wrap
            .find("a")
            .eq(current_tab - 1)
            .addClass("active");
        },
        swipe_to_next_prev = function (e) {
          if (slideshowOptions.noNavigation) {
            return;
          }
          switch_to_next_prev(e);
        },
        switch_to_next_prev = function (e) {
          e.preventDefault();
          var clicked = $(e.currentTarget),
            current_tab = container.find(".av-active-tab-title");
          if (container.hasClass("av-slideshow-section")) {
            if (clicked.hasClass("av_prev_tab_section")) {
              slide_arrows_wrap.find(".av_prev_tab_section").trigger("click");
            } else {
              slide_arrows_wrap.find(".av_next_tab_section").trigger("click");
            }
            return;
          }
          if (clicked.is(".av_prev_tab_section")) {
            if (!$("body").hasClass("rtl")) {
              current_tab.prev(".av-section-tab-title").trigger("click");
            } else {
              current_tab.next(".av-section-tab-title").trigger("click");
            }
          } else {
            if (!$("body").hasClass("rtl")) {
              current_tab.next(".av-section-tab-title").trigger("click");
            } else {
              current_tab.prev(".av-section-tab-title").trigger("click");
            }
          }
        },
        slide_arrows_next_prev = function (e) {
          e.preventDefault();
          if (slideshowOptions.noNavigation && e.originalEvent !== undefined) {
            return;
          }
          var clicked = $(e.currentTarget),
            current_tab = container.find(".av-active-tab-title"),
            tab_nr = current_tab.data("av-tab-section-title"),
            iTab_nr = parseInt(tab_nr, 10),
            next = 0;
          if (clicked.hasClass("av_prev_tab_section")) {
            next = !$("body").hasClass("rtl") ? -1 : 1;
          } else {
            next = !$("body").hasClass("rtl") ? 1 : -1;
          }
          var pos = iTab_nr + next;
          if (pos <= 0 || pos > tabs.length) {
            if (
              "endless" != slideshowOptions.loop_autoplay &&
              "manual-endless" != slideshowOptions.loop_manual
            ) {
              return;
            }
            pos = pos <= 0 ? tabs.length : 1;
          }
          clearTimeoutAutoplay();
          tabs.eq(pos - 1).trigger("click");
          init_autoplay();
        },
        slide_dots_change_tab = function (e) {
          e.preventDefault();
          var clicked = $(e.currentTarget);
          if (clicked.hasClass("active")) {
            return;
          }
          var tab_nr = clicked.attr("href").replace("#", ""),
            iTab_nr = parseInt(tab_nr, 10);
          if (iTab_nr > tabs.length) {
            return;
          }
          clearTimeoutAutoplay();
          tabs.eq(iTab_nr - 1).trigger("click");
          init_autoplay();
        },
        get_init_open = function () {
          var hash = window.location.hash ? window.location.hash : "",
            deepHash = hash.toLowerCase().replace("#", ""),
            open = null;
          if (
            "undefined" != typeof deepLinksToTabs[deepHash] &&
            "" != deepLinksToTabs[deepHash]
          ) {
            var hashID = deepLinksToTabs[deepHash];
            open = tabs.filter('[data-av-tab-section-title="' + hashID + '"]');
          } else {
            open = tabs.filter('[href="' + hash + '"]');
          }
          if (open.length) {
            if (!open.is(".active_tab")) {
              open.trigger("click");
            }
          } else {
            container.find(".av-active-tab-title").trigger("click", true);
          }
        },
        clearTimeoutAutoplay = function () {
          if (typeof timeoutIDAutoplay === "number") {
            clearTimeout(timeoutIDAutoplay);
          }
          timeoutIDAutoplay = null;
        },
        init_autoplay = function () {
          if (!container.hasClass("av-slideshow-section")) {
            return;
          }
          if (true !== slideshowOptions.autoplay) {
            tab_outer
              .removeClass("av-slideshow-autoplay")
              .addClass("av-slideshow-manual");
          }
          if (
            "undefined" == typeof slideshowOptions.loop_autoplay ||
            "endless" != slideshowOptions.loop_autoplay
          ) {
            slideshowOptions.loop_autoplay = "once";
          }
          if ("undefined" == typeof slideshowOptions.interval) {
            slideshowOptions.interval = 5;
          }
          if (
            "undefined" == typeof slideshowOptions.autoplay ||
            true !== slideshowOptions.autoplay
          ) {
            slideshowOptions.autoplay = false;
            tab_outer
              .removeClass("av-slideshow-autoplay")
              .addClass("av-slideshow-manual");
            return;
          }
          clearTimeoutAutoplay();
          timeoutIDAutoplay = setTimeout(function () {
            rotate_next_slide();
          }, slideshowOptions.interval * 1000);
        },
        rotate_next_slide = function () {
          var current_tab = container.find(".av-active-tab-title"),
            tab_nr = current_tab.data("av-tab-section-title"),
            iTab_nr = parseInt(tab_nr, 10),
            stop = false,
            next = 0;
          timeoutIDAutoplay = null;
          if ("endless" == slideshowOptions.loop_autoplay) {
            if (!$("body").hasClass("rtl")) {
              next = iTab_nr < tabs.length ? iTab_nr + 1 : 1;
            } else {
              next = iTab_nr > 1 ? iTab_nr - 1 : tabs.length;
            }
          } else {
            if (!$("body").hasClass("rtl")) {
              stop = iTab_nr == tabs.length;
              next = iTab_nr + 1;
            } else {
              stop = iTab_nr == 1;
              next = iTab_nr - 1;
            }
            if (stop) {
              slideshowOptions.autoplay = false;
              slideshowOptions.loop_autoplay = "manual";
              tab_outer
                .removeClass("av-slideshow-autoplay")
                .addClass("av-slideshow-manual");
              tab_outer.removeClass("av-loop-endless").addClass("av-loop-once");
              return;
            }
          }
          tabs.eq(next - 1).trigger("click");
          timeoutIDAutoplay = setTimeout(function () {
            rotate_next_slide();
          }, slideshowOptions.interval * 1000);
        };
      $.avia_utilities.preload({
        container: current_content,
        single_callback: function () {
          tabs.on("click", change_tab);
          arrows.on("click", switch_to_next_prev);
          slide_arrows.on("click", slide_arrows_next_prev);
          slide_dots.on("click", slide_dots_change_tab);
          if (isMobile || isTouchDevice) {
            tab_nav.on("click", swipe_to_next_prev);
          }
          win.on("debouncedresize", set_tab_title_pos);
          win.on("hashchange", get_init_open);
          win.on(
            "debouncedresize av-content-el-height-changed",
            set_slide_height
          );
          set_min_width();
          set_slide_height();
          get_init_open();
          init_autoplay();
        },
      });
      if (isMobile || isTouchDevice) {
        if (!slideshowOptions.noNavigation) {
          content_wrap.avia_swipe_trigger({
            prev: ".av_prev_tab_section",
            next: ".av_next_tab_section",
          });
        }
      }
      set_slide_height();
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.avia_sc_tabs = function (options) {
    var defaults = {
      heading: ".tab",
      content: ".tab_content",
      active: "active_tab",
      sidebar: false,
    };
    var win = $(window),
      options = $.extend(defaults, options);
    return this.each(function () {
      var container = $(this),
        tab_titles = $('<div class="tab_titles"></div>').prependTo(container),
        tabs = $(options.heading, container),
        content = $(options.content, container),
        newtabs = false,
        oldtabs = false;
      newtabs = tabs.clone();
      oldtabs = tabs.addClass("fullsize-tab").attr("aria-hidden", true);
      tabs = newtabs;
      tabs.prependTo(tab_titles).each(function (i) {
        var tab = $(this),
          the_oldtab = false;
        if (newtabs) {
          the_oldtab = oldtabs.eq(i);
        }
        tab.addClass("tab_counter_" + i).on("click", function () {
          open_content(tab, i, the_oldtab);
          return false;
        });
        tab.on("keydown", function (objEvent) {
          if (objEvent.keyCode === 13) {
            tab.trigger("click");
          }
        });
        if (newtabs) {
          the_oldtab.on("click", function () {
            open_content(the_oldtab, i, tab);
            return false;
          });
          the_oldtab.on("keydown", function (objEvent) {
            if (objEvent.keyCode === 13) {
              the_oldtab.trigger("click");
            }
          });
        }
      });
      set_size();
      trigger_default_open(false);
      win.on("debouncedresize", set_size);
      $("a").on("click", function () {
        var hash = $(this).attr("href");
        if (typeof hash != "undefined" && hash) {
          hash = hash.replace(/^.*?#/, "");
          trigger_default_open("#" + hash);
        }
      });
      function set_size() {
        if (!options.sidebar) {
          return;
        }
        content.css({ "min-height": tab_titles.outerHeight() + 1 });
      }
      function open_content(tab, i, alternate_tab) {
        if (!tab.is("." + options.active)) {
          $("." + options.active, container).removeClass(options.active);
          $("." + options.active + "_content", container)
            .attr("aria-hidden", true)
            .removeClass(options.active + "_content");
          tab.addClass(options.active);
          var new_loc = tab.data("fake-id");
          if (typeof new_loc == "string") {
            window.location.replace(new_loc);
          }
          if (alternate_tab) {
            alternate_tab.addClass(options.active);
          }
          var active_c = content
            .eq(i)
            .addClass(options.active + "_content")
            .attr("aria-hidden", false);
          if (typeof click_container != "undefined" && click_container.length) {
            sidebar_shadow.height(active_c.outerHeight());
          }
          var el_offset = active_c.offset().top,
            scoll_target =
              el_offset - 50 - parseInt($("html").css("margin-top"), 10);
          if (win.scrollTop() > el_offset) {
            $("html:not(:animated),body:not(:animated)").scrollTop(
              scoll_target
            );
          }
        }
        win.trigger("av-content-el-height-changed", tab);
      }
      function trigger_default_open(hash) {
        if (!hash && window.location.hash) {
          hash = window.location.hash;
        }
        if (!hash) {
          return;
        }
        var open = tabs.filter('[data-fake-id="' + hash + '"]');
        if (open.length) {
          if (!open.is(".active_tab")) {
            open.trigger("click");
          }
          window.scrollTo(0, container.offset().top - 70);
        }
      }
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.avia_sc_testimonial = function (options) {
    return this.each(function () {
      var container = $(this),
        elements = container.find(".avia-testimonial");
      container.on("avia_start_animation", function () {
        elements.each(function (i) {
          var element = $(this);
          setTimeout(function () {
            element.addClass("avia_start_animation");
          }, i * 150);
        });
      });
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $(window).on("load", function (e) {
    if ($.AviaSlider) {
      $(".avia-timeline-container").avia_sc_timeline();
    }
  });
  $.fn.avia_sc_timeline = function (options) {
    return this.each(function () {
      var container = this,
        timeline_id = "#" + $(this).attr("id"),
        timeline = $(timeline_id),
        methods;
      methods = {
        matchHeights: function () {
          this.setMinHeight(
            $(timeline_id + " .av-milestone-placement-top .av-milestone-date"),
            true
          );
          this.setMinHeight(
            $(
              timeline_id +
                " .av-milestone-placement-bottom .av-milestone-content-wrap"
            ),
            true
          );
          this.setMinHeight(
            $(
              timeline_id +
                " .av-milestone-placement-bottom.avia-timeline-boxshadow .av-milestone-contentbox"
            ),
            false
          );
          this.setMinHeight(
            $(
              timeline_id +
                " .av-milestone-placement-top.avia-timeline-boxshadow .av-milestone-contentbox"
            ),
            false
          );
          this.setMinHeight(
            $(
              timeline_id +
                " .avia-timeline-horizontal.av-milestone-placement-alternate li >:first-child"
            ),
            true
          );
        },
        setMinHeight: function (els, setNav) {
          if (els.length < 2) {
            return;
          }
          var elsHeights = new Array();
          els.css("min-height", "0").each(function (i) {
            var current = $(this);
            var currentHeight = current.outerHeight(true);
            elsHeights.push(currentHeight);
          });
          var largest = Math.max.apply(null, elsHeights);
          els.css("min-height", largest);
          if (setNav) {
            var $firstElement = els.first(),
              $parent = $firstElement.closest(".avia-timeline-container"),
              $pos = $firstElement.height();
            $parent.find(".av-timeline-nav").css("top", $pos);
          }
        },
        createCarousel: function (e) {
          var self = this,
            slider = $(timeline_id + ".avia-slideshow-carousel"),
            slides_num = 3,
            slides_num_small = 1;
          if (timeline.attr("avia-data-slides")) {
            slides_num = parseInt(timeline.attr("avia-data-slides"));
          }
          if (slides_num >= 2) {
            slides_num_small = 2;
          }
          var sliderOptions = {
            carousel: "yes",
            keep_padding: true,
            carouselSlidesToShow: slides_num,
            carouselSlidesToScroll: 3,
            carouselResponsive: [
              {
                breakpoint: 989,
                settings: {
                  carouselSlidesToShow: slides_num_small,
                  carouselSlidesToScroll: slides_num_small,
                },
              },
              {
                breakpoint: 767,
                settings: {
                  carouselSlidesToShow: 1,
                  carouselSlidesToScroll: 1,
                },
              },
            ],
          };
          slider.aviaSlider(sliderOptions);
          slider.on("_kickOff", function () {
            self.matchHeights();
          });
          $(window).on("resize", function () {
            self.matchHeights();
          });
        },
        layoutHelpers: function (e) {
          $(timeline_id + " .avia-timeline-vertical li").each(function (
            index,
            element
          ) {
            var $length = $(this).parents("ul").find("li").length;
            var $icon_wrap = $(this).find(".av-milestone-icon-wrap");
            var $icon_wrap_height = $icon_wrap.outerHeight(true);
            var $icon_wrap_height_half = parseInt($icon_wrap_height / 2);
            if (index === $length - 1) {
              $icon_wrap.css({ height: $icon_wrap_height_half });
            } else {
              $icon_wrap.css({ height: $icon_wrap_height });
            }
          });
        },
        fireAnimations: function (e) {
          if ($(timeline_id + " > ul").hasClass("avia-timeline-vertical")) {
            var milestone = timeline.find(".av-milestone");
            timeline.on("avia_start_animation", function () {
              milestone.each(function (i) {
                var element = $(this);
                setTimeout(function () {
                  element.addClass("avia_start_animation");
                }, i * 350);
              });
            });
          }
        },
      };
      methods.createCarousel();
      methods.layoutHelpers();
      methods.fireAnimations();
      methods.matchHeights();
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $.fn.avia_sc_toggle = function (options) {
    var defaults = {
      single: ".single_toggle",
      heading: ".toggler",
      content: ".toggle_wrap",
      sortContainer: ".taglist",
    };
    var win = $(window),
      options = $.extend(defaults, options);
    return this.each(function () {
      var container = $(this).addClass("enable_toggles"),
        toggles = $(options.single, container),
        heading = $(options.heading, container),
        allContent = $(options.content, container),
        sortLinks = $(options.sortContainer + " a", container),
        preview = $("#av-admin-preview");
      var activeStyle = "",
        headingStyle = "";
      heading.each(function (i) {
        var thisheading = $(this),
          content = thisheading.next(options.content, container);
        function scroll_to_viewport() {
          var el_offset = content.offset().top,
            scoll_target =
              el_offset - 50 - parseInt($("html").css("margin-top"), 10);
          if (win.scrollTop() > el_offset) {
            $("html:not(:animated),body:not(:animated)").animate(
              { scrollTop: scoll_target },
              200
            );
          }
        }
        if (content.css("visibility") != "hidden") {
          thisheading.addClass("activeTitle").attr("style", activeStyle);
        }
        thisheading.on("keydown", function (objEvent) {
          if (objEvent.keyCode === 13) {
            thisheading.trigger("click");
          }
        });
        thisheading.on("click", function () {
          if (content.css("visibility") != "hidden") {
            content.slideUp(200, function () {
              content.removeClass("active_tc").attr({ style: "" });
              win.trigger("av-height-change");
              win.trigger("av-content-el-height-changed", this);
              if (preview.length == 0) {
                location.replace(thisheading.data("fake-id") + "-closed");
              }
            });
            thisheading.removeClass("activeTitle").attr("style", headingStyle);
          } else {
            if (container.is(".toggle_close_all")) {
              allContent.not(content).slideUp(200, function () {
                $(this).removeClass("active_tc").attr({ style: "" });
                scroll_to_viewport();
              });
              heading.removeClass("activeTitle").attr("style", headingStyle);
            }
            content.addClass("active_tc");
            setTimeout(function () {
              content.slideDown(200, function () {
                if (!container.is(".toggle_close_all")) {
                  scroll_to_viewport();
                }
                win.trigger("av-height-change");
                win.trigger("av-content-el-height-changed", this);
              });
            }, 1);
            thisheading.addClass("activeTitle").attr("style", activeStyle);
            if (preview.length == 0) {
              location.replace(thisheading.data("fake-id"));
            }
          }
        });
      });
      sortLinks.on("click", function (e) {
        e.preventDefault();
        var show = toggles.filter('[data-tags~="' + $(this).data("tag") + '"]'),
          hide = toggles.not('[data-tags~="' + $(this).data("tag") + '"]');
        sortLinks.removeClass("activeFilter");
        $(this).addClass("activeFilter");
        heading.filter(".activeTitle").trigger("click");
        show.slideDown();
        hide.slideUp();
      });
      function trigger_default_open(hash) {
        if (!hash && window.location.hash) {
          hash = window.location.hash;
        }
        if (!hash) {
          return;
        }
        var open = heading.filter('[data-fake-id="' + hash + '"]');
        if (open.length) {
          if (!open.is(".activeTitle")) {
            open.trigger("click");
          }
          window.scrollTo(0, container.offset().top - 70);
        }
      }
      trigger_default_open(false);
      $("a").on("click", function () {
        var hash = $(this).attr("href");
        if (typeof hash != "undefined" && hash) {
          hash = hash.replace(/^.*?#/, "");
          trigger_default_open("#" + hash);
        }
      });
    });
  };
})(jQuery);
(function ($) {
  "use strict";
  $("body").on(
    "click",
    ".av-lazyload-video-embed .av-click-to-play-overlay",
    function (e) {
      var clicked = $(this);
      var cookie_check =
        $("html").hasClass("av-cookies-needs-opt-in") ||
        $("html").hasClass("av-cookies-can-opt-out");
      var allow_continue = true;
      var silent_accept_cookie = $("html").hasClass(
        "av-cookies-user-silent-accept"
      );
      if (cookie_check && !silent_accept_cookie) {
        if (
          !document.cookie.match(/aviaCookieConsent/) ||
          $("html").hasClass("av-cookies-session-refused")
        ) {
          allow_continue = false;
        } else {
          if (!document.cookie.match(/aviaPrivacyRefuseCookiesHideBar/)) {
            allow_continue = false;
          } else if (
            !document.cookie.match(/aviaPrivacyEssentialCookiesEnabled/)
          ) {
            allow_continue = false;
          } else if (document.cookie.match(/aviaPrivacyVideoEmbedsDisabled/)) {
            allow_continue = false;
          }
        }
      }
      var container = clicked.parents(".av-lazyload-video-embed");
      if (
        container.hasClass("avia-video-lightbox") &&
        container.hasClass("avia-video-standard-html")
      ) {
        allow_continue = true;
      }
      if (!allow_continue) {
        if (typeof e.originalEvent == "undefined") {
          return;
        }
        var src_url = container.data("original_url");
        if (src_url) window.open(src_url, "_blank", "noreferrer noopener");
        return;
      }
      var video = container.find(".av-video-tmpl").html();
      var link = "";
      if (container.hasClass("avia-video-lightbox")) {
        link = container.find("a.lightbox-link");
        if (link.length == 0) {
          container.append(video);
          setTimeout(function () {
            link = container.find("a.lightbox-link");
            if ($("html").hasClass("av-default-lightbox")) {
              link
                .addClass("lightbox-added")
                .magnificPopup($.avia_utilities.av_popup);
              link.trigger("click");
            } else {
              link.trigger("avia-open-video-in-lightbox");
            }
          }, 100);
        } else {
          link.trigger("click");
        }
      } else {
        container.html(video);
      }
    }
  );
  $(".av-lazyload-immediate .av-click-to-play-overlay").trigger("click");
})(jQuery);
(function ($) {
  "use strict";
  $(function () {
    $.avia_utilities = $.avia_utilities || {};
    if ("undefined" == typeof $.avia_utilities.isMobile) {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) &&
        "ontouchstart" in document.documentElement
      ) {
        $.avia_utilities.isMobile = true;
      } else {
        $.avia_utilities.isMobile = false;
      }
    }
    avia_hamburger_menu();
    $(window).trigger("resize");
  });
  $.avia_utilities = $.avia_utilities || {};
  function avia_hamburger_menu() {
    var header = $("#header"),
      header_main = $("#main .av-logo-container"),
      menu = $("#avia-menu"),
      burger_wrap = $(".av-burger-menu-main a"),
      htmlEL = $("html").eq(0),
      overlay = $('<div class="av-burger-overlay"></div>'),
      overlay_scroll = $(
        '<div class="av-burger-overlay-scroll"></div>'
      ).appendTo(overlay),
      inner_overlay = $('<div class="av-burger-overlay-inner"></div>').appendTo(
        overlay_scroll
      ),
      bgColor = $('<div class="av-burger-overlay-bg"></div>').appendTo(overlay),
      animating = false,
      first_level = {},
      logo_container = $(".av-logo-container .inner-container"),
      menu_in_logo_container = logo_container.find(".main_menu"),
      cloneFirst = htmlEL.is(
        ".html_av-submenu-display-click.html_av-submenu-clone, .html_av-submenu-display-hover.html_av-submenu-clone"
      ),
      menu_generated = false,
      cloned_menu_cnt = 0;
    var alternate = $("#avia_alternate_menu");
    if (alternate.length > 0) {
      menu = alternate;
    }
    var set_list_container_height = function () {
        if ($.avia_utilities.isMobile) {
          overlay_scroll.outerHeight(window.innerHeight);
        }
      },
      create_list = function (items, append_to) {
        if (!items) return;
        var list,
          link,
          current,
          subitems,
          megacolumns,
          sub_current,
          sub_current_list,
          new_li,
          new_ul;
        items.each(function () {
          current = $(this);
          subitems = current.find(" > .sub-menu > li");
          if (subitems.length == 0) {
            subitems = current.find(" > .children > li");
          }
          megacolumns = current.find(
            ".avia_mega_div > .sub-menu > li.menu-item"
          );
          var cur_menu = current.find(">a");
          var clone_events = true;
          if (cur_menu.length) {
            if (
              cur_menu.get(0).hash == "#" ||
              "undefined" == typeof cur_menu.attr("href") ||
              cur_menu.attr("href") == "#"
            ) {
              if (subitems.length > 0 || megacolumns.length > 0) {
                clone_events = false;
              }
            }
          }
          link = cur_menu.clone(clone_events).attr("style", "");
          if ("undefined" == typeof cur_menu.attr("href")) {
            link.attr("href", "#");
          }
          new_li = $("<li>").append(link);
          var cls = [];
          if ("undefined" != typeof current.attr("class")) {
            cls = current.attr("class").split(/\s+/);
            $.each(cls, function (index, value) {
              if (
                value.indexOf("menu-item") != 0 &&
                value.indexOf("page-item") < 0 &&
                value.indexOf("page_item") != 0 &&
                value.indexOf("dropdown_ul") < 0
              ) {
                new_li.addClass(value);
              }
              return true;
            });
          }
          if (
            "undefined" != typeof current.attr("id") &&
            "" != current.attr("id")
          ) {
            new_li.addClass(current.attr("id"));
          } else {
            $.each(cls, function (index, value) {
              if (value.indexOf("page-item-") >= 0) {
                new_li.addClass(value);
                return false;
              }
            });
          }
          append_to.append(new_li);
          if (subitems.length) {
            new_ul = $('<ul class="sub-menu">').appendTo(new_li);
            if (
              cloneFirst &&
              link.get(0).hash != "#" &&
              link.attr("href") != "#"
            ) {
              new_li.clone(true).prependTo(new_ul);
            }
            new_li
              .addClass("av-width-submenu")
              .find(">a")
              .append('<span class="av-submenu-indicator">');
            create_list(subitems, new_ul);
          } else if (megacolumns.length) {
            new_ul = $('<ul class="sub-menu">').appendTo(new_li);
            if (
              cloneFirst &&
              link.get(0).hash != "#" &&
              link.attr("href") != "#"
            ) {
              new_li.clone(true).prependTo(new_ul);
            }
            megacolumns.each(function (iteration) {
              var megacolumn = $(this),
                mega_current = megacolumn.find("> .sub-menu"),
                mega_title = megacolumn.find("> .mega_menu_title"),
                mega_title_link = mega_title.find("a").attr("href") || "#",
                current_megas =
                  mega_current.length > 0 ? mega_current.find(">li") : null,
                mega_title_set = false,
                mega_link = new_li.find(">a"),
                hide_enty = "";
              if (current_megas === null || current_megas.length == 0) {
                if (mega_title_link == "#") {
                  hide_enty = ' style="display: none;"';
                }
              }
              if (iteration == 0)
                new_li
                  .addClass("av-width-submenu")
                  .find(">a")
                  .append('<span class="av-submenu-indicator">');
              if (mega_title.length && mega_title.text() != "") {
                mega_title_set = true;
                if (iteration > 0) {
                  var check_li = new_li.parents("li").eq(0);
                  if (check_li.length) new_li = check_li;
                  new_ul = $('<ul class="sub-menu">').appendTo(new_li);
                }
                new_li = $("<li" + hide_enty + ">").appendTo(new_ul);
                new_ul = $('<ul class="sub-menu">').appendTo(new_li);
                $(
                  '<a href="' +
                    mega_title_link +
                    '"><span class="avia-bullet"></span><span class="avia-menu-text">' +
                    mega_title.text() +
                    "</span></a>"
                ).insertBefore(new_ul);
                mega_link = new_li.find(">a");
                if (
                  cloneFirst &&
                  mega_current.length > 0 &&
                  mega_link.length &&
                  mega_link.get(0).hash != "#" &&
                  mega_link.attr("href") != "#"
                ) {
                  new_li
                    .clone(true)
                    .addClass("av-cloned-title")
                    .prependTo(new_ul);
                }
              }
              if (mega_title_set && mega_current.length > 0)
                new_li
                  .addClass("av-width-submenu")
                  .find(">a")
                  .append('<span class="av-submenu-indicator">');
              create_list(current_megas, new_ul);
            });
          }
        });
        burger_wrap.trigger("avia_burger_list_created");
        return list;
      };
    var burger_ul, burger;
    $("body").on(
      "mousewheel DOMMouseScroll touchmove",
      ".av-burger-overlay-scroll",
      function (e) {
        var height = this.offsetHeight,
          scrollHeight = this.scrollHeight,
          direction = e.originalEvent.wheelDelta;
        if (scrollHeight != this.clientHeight) {
          if (
            (this.scrollTop >= scrollHeight - height && direction < 0) ||
            (this.scrollTop <= 0 && direction > 0)
          ) {
            e.preventDefault();
          }
        } else {
          e.preventDefault();
        }
      }
    );
    $(document).on(
      "mousewheel DOMMouseScroll touchmove",
      ".av-burger-overlay-bg, .av-burger-overlay-active .av-burger-menu-main",
      function (e) {
        e.preventDefault();
      }
    );
    var touchPos = {};
    $(document).on("touchstart", ".av-burger-overlay-scroll", function (e) {
      touchPos.Y = e.originalEvent.touches[0].clientY;
    });
    $(document).on("touchend", ".av-burger-overlay-scroll", function (e) {
      touchPos = {};
    });
    $(document).on("touchmove", ".av-burger-overlay-scroll", function (e) {
      if (!touchPos.Y) {
        touchPos.Y = e.originalEvent.touches[0].clientY;
      }
      var differenceY = e.originalEvent.touches[0].clientY - touchPos.Y,
        element = this,
        top = element.scrollTop,
        totalScroll = element.scrollHeight,
        currentScroll = top + element.offsetHeight,
        direction = differenceY > 0 ? "up" : "down";
      $("body").get(0).scrollTop = touchPos.body;
      if (top <= 0) {
        if (direction == "up") {
          e.preventDefault();
        }
      } else if (currentScroll >= totalScroll) {
        if (direction == "down") {
          e.preventDefault();
        }
      }
    });
    $(window).on("debouncedresize", function (e) {
      var close = true;
      if (
        $.avia_utilities.isMobile &&
        htmlEL.hasClass("av-mobile-menu-switch-portrait") &&
        htmlEL.hasClass("html_text_menu_active")
      ) {
        var height = $(window).height();
        var width = $(window).width();
        if (width <= height) {
          htmlEL.removeClass("html_burger_menu");
        } else {
          var switch_width = htmlEL.hasClass("html_mobile_menu_phone")
            ? 768
            : 990;
          if (height < switch_width) {
            htmlEL.addClass("html_burger_menu");
            close = false;
          } else {
            htmlEL.removeClass("html_burger_menu");
          }
        }
      }
      if (close && burger && burger.length) {
        if (!burger_wrap.is(":visible")) {
          burger.filter(".is-active").parents("a").eq(0).trigger("click");
        }
      }
      set_list_container_height();
    });
    $(".html_av-overlay-side").on(
      "click",
      ".av-burger-overlay-bg",
      function (e) {
        e.preventDefault();
        burger.parents("a").eq(0).trigger("click");
      }
    );
    $(window).on("avia_smooth_scroll_start", function () {
      if (burger && burger.length) {
        burger.filter(".is-active").parents("a").eq(0).trigger("click");
      }
    });
    $(".html_av-submenu-display-hover").on(
      "mouseenter",
      ".av-width-submenu",
      function (e) {
        $(this).children("ul.sub-menu").slideDown("fast");
      }
    );
    $(".html_av-submenu-display-hover").on(
      "mouseleave",
      ".av-width-submenu",
      function (e) {
        $(this).children("ul.sub-menu").slideUp("fast");
      }
    );
    $(".html_av-submenu-display-hover").on(
      "click",
      ".av-width-submenu > a",
      function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    );
    $(".html_av-submenu-display-hover").on(
      "touchstart",
      ".av-width-submenu > a",
      function (e) {
        var menu = $(this);
        toggle_submenu(menu, e);
      }
    );
    $(".html_av-submenu-display-click").on(
      "click",
      ".av-width-submenu > a",
      function (e) {
        var menu = $(this);
        toggle_submenu(menu, e);
      }
    );
    $(".html_av-submenu-display-click").on(
      "click",
      ".av-burger-overlay a",
      function (e) {
        var loc = window.location.href.match(/(^[^#]*)/)[0];
        var cur = $(this)
          .attr("href")
          .match(/(^[^#]*)/)[0];
        if (cur == loc) {
          e.preventDefault();
          e.stopImmediatePropagation();
          burger.parents("a").eq(0).trigger("click");
          return false;
        }
        return true;
      }
    );
    function toggle_submenu(menu, e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var parent = menu.parents("li").eq(0);
      parent.toggleClass("av-show-submenu");
      if (parent.is(".av-show-submenu")) {
        parent.children("ul.sub-menu").slideDown("fast");
      } else {
        parent.children("ul.sub-menu").slideUp("fast");
      }
    }
    (function normalize_layout() {
      if (menu_in_logo_container.length) {
        return;
      }
      var menu2 = $("#header .main_menu").clone(true),
        ul = menu2.find("ul.av-main-nav"),
        id = ul.attr("id");
      if ("string" == typeof id && "" != id.trim()) {
        ul.attr("id", id + "-" + cloned_menu_cnt++);
      }
      menu2.find(".menu-item:not(.menu-item-avia-special)").remove();
      menu2.insertAfter(logo_container.find(".logo").first());
      var social = $("#header .social_bookmarks").clone(true);
      if (!social.length) {
        social = $(".av-logo-container .social_bookmarks").clone(true);
      }
      if (social.length) {
        menu2.find(".avia-menu").addClass("av_menu_icon_beside");
        menu2.append(social);
      }
      burger_wrap = $(".av-burger-menu-main a");
    })();
    burger_wrap.on("click", function (e) {
      if (animating) {
        return;
      }
      (burger = $(this).find(".av-hamburger")), (animating = true);
      if (!menu_generated) {
        menu_generated = true;
        burger.addClass("av-inserted-main-menu");
        burger_ul = $("<ul>").attr({ id: "av-burger-menu-ul", class: "" });
        var first_level_items = menu.find("> li:not(.menu-item-avia-special)");
        var list = create_list(first_level_items, burger_ul);
        burger_ul.find(".noMobile").remove();
        burger_ul.appendTo(inner_overlay);
        first_level = inner_overlay.find("#av-burger-menu-ul > li");
        if ($.fn.avia_smoothscroll) {
          $('a[href*="#"]', overlay).avia_smoothscroll(overlay);
        }
      }
      if (burger.is(".is-active")) {
        burger.removeClass("is-active");
        htmlEL.removeClass("av-burger-overlay-active-delayed");
        overlay.animate({ opacity: 0 }, function () {
          overlay.css({ display: "none" });
          htmlEL.removeClass("av-burger-overlay-active");
          animating = false;
        });
      } else {
        set_list_container_height();
        var offsetTop = header_main.length
          ? header_main.outerHeight() + header_main.position().top
          : header.outerHeight() + header.position().top;
        overlay.appendTo($(e.target).parents(".avia-menu"));
        burger_ul.css({ padding: offsetTop + "px 0px" });
        first_level.removeClass("av-active-burger-items");
        burger.addClass("is-active");
        htmlEL.addClass("av-burger-overlay-active");
        overlay.css({ display: "block" }).animate({ opacity: 1 }, function () {
          animating = false;
        });
        setTimeout(function () {
          htmlEL.addClass("av-burger-overlay-active-delayed");
        }, 100);
        first_level.each(function (i) {
          var _self = $(this);
          setTimeout(function () {
            _self.addClass("av-active-burger-items");
          }, (i + 1) * 125);
        });
      }
      e.preventDefault();
    });
  }
})(jQuery);
("use strict");
var avia = window.avia || {};
avia.parallax = function () {
  if (avia.parallax.instance) {
    return avia.parallax.instance;
  }
  avia.parallax.instance = this;
  this.MediaQueryOptions = {
    "av-mini-": "(max-width: 479px)",
    "av-small-": "(min-width: 480px) and (max-width: 767px)",
    "av-medium-": "(min-width: 768px) and (max-width: 989px)",
  };
  this.elements = [];
  this.bindEvents();
  return this;
};
avia.parallax.instance = false;
avia.parallax.prototype = {
  element: function (node, _self) {
    this.dom = node;
    this.config = node.dataset;
    this.scrollspeed = parseFloat(
      this.config.parallax_speed || this.config.aviaParallaxRatio || 0
    );
    this.translate = { x: 0, y: 0, z: 0 };
    this.prev = { top: 0, left: 0 };
    this.rect = {};
    this.css = (styles) => Object.assign(this.dom.style, styles);
    this.inViewport = () => {
      this.rect = this.dom.getBoundingClientRect();
      this.translate = this.getTranslateValues();
      return (
        this.rect.bottom - this.translate.y >= 0 &&
        this.rect.right >= 0 &&
        this.rect.top <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        this.rect.left <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    };
    this.update = (force = false) => {
      if (!this.scrollspeed) return;
      _self.do(function (el) {
        if (!el.inViewport() && !force) return;
        var style = {};
        var newLeft = 0;
        var offsetTop = window.scrollY + el.rect.top - el.translate.y;
        var newTop = window.scrollY * -1 * el.scrollspeed;
        if (offsetTop > window.innerHeight) {
          newTop = parseFloat(
            (el.rect.top - window.innerHeight - el.translate.y) * el.scrollspeed
          );
        }
        console.log(window.innerHeight + el.rect.height);
        if (Math.abs(newTop) > window.innerHeight + el.rect.height) return;
        if (newTop != el.translate.y) {
          style.transform =
            "translate3d( " + newLeft + "px," + newTop + "px, 0px )";
          el.css(style);
        }
      }, this);
    };
    this.getTranslateValues = () => {
      const matrix = window.getComputedStyle(this.dom).transform;
      if (matrix === "none" || typeof matrix === "undefined")
        return { x: 0, y: 0, z: 0 };
      const matrixType = matrix.includes("3d") ? "3d" : "2d";
      const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(", ");
      if (matrixType === "2d") {
        return { x: matrixValues[4], y: matrixValues[5], z: 0 };
      }
      if (matrixType === "3d") {
        return {
          x: matrixValues[12],
          y: matrixValues[13],
          z: matrixValues[14],
        };
      }
    };
    this.update();
    _self.showElement(() => this.dom.classList.add("active-parallax"));
    return this;
  },
  bindEvents: function () {
    this.addListener(window, ["scroll"], this.updateElements);
    this.addListener(
      window,
      ["resize", "orientationchange", "load", "av-height-change"],
      this.updateElements
    );
    this.addListener(
      document.body,
      ["av_resize_finished"],
      this.updateElements,
      true
    );
  },
  addListener: function (target, events, func, args = false) {
    for (var i = 0, ev; (ev = events[i]); i++) {
      target.addEventListener(ev, func.bind(this, args), { passive: true });
    }
  },
  showElement: function (func) {
    if (document.readyState === "complete") {
      func();
    } else {
      window.addEventListener("load", func);
    }
  },
  addElements: function (selector) {
    for (
      var i = 0, item;
      (item = document.querySelectorAll(selector)[i]);
      i++
    ) {
      this.elements.push(new this.element(item, this));
    }
  },
  updateElements: function (force, e) {
    for (var i = 0, element; (element = this.elements[i]); i++) {
      element.update(force);
    }
  },
  do: function (callback, args, delay = 0) {
    requestAnimationFrame(() => {
      setTimeout(() => callback.call(this, args), delay);
    });
  },
};
(function ($) {
  if (!window.location.search.includes("new-parallax")) {
    return;
  }
  var parallax = new avia.parallax();
  parallax.addElements(".av-parallax-object");
})(jQuery);
(function ($) {
  "use strict";
  $.avia_utilities = $.avia_utilities || {};
  $(function () {
    if ($.fn.avia_parallax) {
      $(".av-parallax,.av-parallax-object").avia_parallax();
    }
  });
  var AviaObjectParallaxElement = function (options, element) {
    if (!(this.transform || this.transform3d)) {
      return;
    }
    this.options = $.extend({}, options);
    this.win = $(window);
    this.body = $("body");
    (this.isMobile = $.avia_utilities.isMobile),
      (this.winHeight = this.win.height());
    this.winWidth = this.win.width();
    this.el = $(element).addClass("active-parallax");
    this.objectType = this.el.hasClass("av-parallax-object")
      ? "object"
      : "background-image";
    this.elInner = this.el;
    this.elBackgroundParent = this.el.parent();
    this.elParallax = this.el.data("parallax") || {};
    this.direction = "";
    this.speed = 0.5;
    this.elProperty = {};
    (this.ticking = false), (this.isTransformed = false);
    if ($.avia_utilities.supported.transition === undefined) {
      $.avia_utilities.supported.transition =
        $.avia_utilities.supports("transition");
    }
    this._init(options);
  };
  AviaObjectParallaxElement.prototype = {
    mediaQueries: {
      "av-mini-": "(max-width: 479px)",
      "av-small-": "(min-width: 480px) and (max-width: 767px)",
      "av-medium-": "(min-width: 768px) and (max-width: 989px)",
    },
    transform:
      document.documentElement.className.indexOf("avia_transform") !== -1,
    transform3d:
      document.documentElement.className.indexOf("avia_transform3d") !== -1,
    mobileNoAnimation: $("body").hasClass("avia-mobile-no-animations"),
    defaultSpeed: 0.5,
    defaultDirections: [
      "bottom_top",
      "left_right",
      "right_left",
      "no_parallax",
    ],
    transformCSSProps: [
      "transform",
      "-webkit-transform",
      "-moz-transform",
      "-ms-transform",
      "-o-transform",
    ],
    matrixDef: [1, 0, 0, 1, 0, 0],
    matrix3dDef: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    _init: function () {
      var _self = this;
      if (
        typeof this.el.data("parallax-selector") != "undefined" &&
        this.el.data("parallax-selector") !== ""
      ) {
        this.elInner = this.el.find(this.el.data("parallax-selector"));
        if (this.elInner.length == 0) {
          this.elInner = this.el;
        }
      }
      if ("background-image" == this.objectType) {
        if (this.isMobile && this.mobileNoAnimation) {
          return;
        }
        this.elParallax.parallax = "bottom_top";
        this.elParallax.parallax_speed =
          parseFloat(this.el.data("avia-parallax-ratio")) || 0.5;
      }
      setTimeout(function () {
        _self._fetchProperties();
      }, 30);
      this.win.on(
        "debouncedresize av-height-change",
        _self._fetchProperties.bind(_self)
      );
      this.body.on("av_resize_finished", _self._fetchProperties.bind(_self));
      setTimeout(function () {
        _self.win.on("scroll", _self._onScroll.bind(_self));
      }, 100);
    },
    _setParallaxProps: function () {
      if ("background-image" == this.objectType) {
        this.direction = this.elParallax.parallax;
        this.speed = this.elParallax.parallax_speed;
        return;
      }
      var all_direction = this.elParallax.parallax || "",
        all_speed = this.elParallax.parallax_speed || "",
        resp_direction = "",
        resp_speed = "",
        media = "all";
      if (this.defaultDirections.indexOf(all_direction) < 0) {
        all_direction = "no_parallax";
      }
      if (typeof window.matchMedia == "function") {
        $.each(this.mediaQueries, function (key, query) {
          var mql = window.matchMedia(query);
          if (mql.matches) {
            media = key;
            return false;
          }
        });
      }
      if ("all" == media) {
        this.direction = all_direction;
        this.speed =
          "" == all_speed ? this.defaultSpeed : parseFloat(all_speed) / 100.0;
        return;
      }
      resp_direction = this.elParallax[media + "parallax"] || "";
      resp_speed = this.elParallax[media + "parallax_speed"] || "";
      if ("inherit" == resp_direction) {
        resp_direction = all_direction;
        resp_speed = all_speed;
      }
      if (this.defaultDirections.indexOf(resp_direction) < 0) {
        resp_direction = "no_parallax";
      }
      this.direction = resp_direction;
      this.speed =
        "" == resp_speed ? this.defaultSpeed : parseFloat(resp_speed) / 100.0;
    },
    _getTranslateObject: function (element) {
      var translate = { type: "", matrix: [], x: 0, y: 0, z: 0 };
      $.each(this.transformCSSProps, function (i, prop) {
        var found = element.css(prop);
        if ("string" != typeof found || "none" == found) {
          return;
        }
        if (found.indexOf("matrix") >= 0) {
          var matrixValues = found.match(/matrix.*\((.+)\)/)[1].split(", ");
          if (found.indexOf("matrix3d") >= 0) {
            translate.type = "3d";
            translate.matrix = matrixValues;
            translate.x = matrixValues[12];
            translate.y = matrixValues[13];
            translate.z = matrixValues[14];
          } else {
            translate.type = "2d";
            translate.matrix = matrixValues;
            translate.x = matrixValues[4];
            translate.y = matrixValues[5];
          }
          return false;
        } else {
          translate.type = "";
          var matchX = found.match(/translateX\((-?\d+\.?\d*px)\)/);
          if (matchX) {
            translate.x = parseInt(matchX[1], 10);
          }
          var matchY = found.match(/translateY\((-?\d+\.?\d*px)\)/);
          if (matchY) {
            translate.y = parseInt(matchY[1], 10);
          }
        }
      });
      return translate;
    },
    _getTranslateMatrix: function (translateObj, changes) {
      var matrix = "";
      $.each(changes, function (key, value) {
        translateObj[key] = value;
      });
      if (this.transform3d) {
        var matrix3d = this.matrix3dDef.slice(0);
        switch (translateObj.type) {
          case "2d":
            matrix3d[0] = translateObj.matrix[0];
            matrix3d[1] = translateObj.matrix[1];
            matrix3d[4] = translateObj.matrix[2];
            matrix3d[5] = translateObj.matrix[3];
            matrix3d[12] = translateObj.x;
            matrix3d[13] = translateObj.y;
            break;
          case "3d":
            matrix3d = translateObj.matrix.slice(0);
            matrix3d[12] = translateObj.x;
            matrix3d[13] = translateObj.y;
            matrix3d[14] = translateObj.z;
            break;
          default:
            matrix3d[12] = translateObj.x;
            matrix3d[13] = translateObj.y;
            break;
        }
        matrix = "matrix3d(" + matrix3d.join(", ") + ")";
      } else if (this.transform) {
        var matrix2d = this.matrixDef.slice(0);
        switch (translateObj.type) {
          case "2d":
            matrix2d = translateObj.matrix.slice(0);
            matrix2d[4] = translateObj.x;
            matrix2d[5] = translateObj.y;
            break;
          case "3d":
            matrix2d[0] = translateObj.matrix[0];
            matrix2d[1] = translateObj.matrix[1];
            matrix2d[2] = translateObj.matrix[4];
            matrix2d[3] = translateObj.matrix[5];
            matrix2d[4] = translateObj.x;
            matrix2d[5] = translateObj.y;
            break;
          default:
            matrix2d[4] = translateObj.x;
            matrix2d[5] = translateObj.y;
            break;
        }
        matrix = "matrix(" + matrix2d.join(", ") + ")";
      }
      return matrix;
    },
    _fetchProperties: function () {
      this._setParallaxProps();
      this.el.css($.avia_utilities.supported.transition + "transform", "");
      this.winHeight = this.win.height();
      this.winWidth = this.win.width();
      if ("background-image" == this.objectType) {
        this.elProperty.top = this.elBackgroundParent.offset().top;
        this.elProperty.height = this.elBackgroundParent.outerHeight();
        this.el.height(
          Math.ceil(
            this.winHeight * Math.abs(this.speed) + this.elProperty.height
          )
        );
      } else {
        this.elProperty.top = this.elInner.offset().top;
        this.elProperty.left = this.elInner.offset().left;
        this.elProperty.height = this.elInner.outerHeight();
        this.elProperty.width = this.elInner.outerWidth();
        this.elProperty.bottom = this.elProperty.top + this.elProperty.height;
        this.elProperty.right = this.elProperty.left + this.elProperty.width;
        this.elProperty.distanceLeft = this.elProperty.right;
        this.elProperty.distanceRight = this.winWidth - this.elProperty.left;
      }
      this.elProperty.translateObj = this._getTranslateObject(this.el);
      this._parallaxScroll();
    },
    _onScroll: function (e) {
      var _self = this;
      if (!_self.ticking) {
        _self.ticking = true;
        window.requestAnimationFrame(_self._parallaxRequest.bind(_self));
      }
    },
    _inViewport: function (
      elTop,
      elRight,
      elBottom,
      elLeft,
      winTop,
      winBottom,
      winLeft,
      winRight
    ) {
      return !(
        elTop > winBottom + 10 ||
        elBottom < winTop - 10 ||
        elLeft > winRight + 10 ||
        elRight < winLeft - 10
      );
    },
    _parallaxRequest: function (e) {
      var _self = this;
      setTimeout(_self._parallaxScroll.bind(_self), 0);
    },
    _parallaxScroll: function (e) {
      if (
        ("no_parallax" == this.direction || "" == this.direction) &&
        !this.isTransformed
      ) {
        this.ticking = false;
        return;
      }
      var winTop = this.win.scrollTop(),
        winLeft = this.win.scrollLeft(),
        winRight = winLeft + this.winWidth,
        winBottom = winTop + this.winHeight,
        scrollPos = 0,
        matrix = "";
      if ("background-image" == this.objectType) {
        if (
          this.elProperty.top < winBottom &&
          winTop <= this.elProperty.top + this.elProperty.height
        ) {
          scrollPos = Math.ceil((winBottom - this.elProperty.top) * this.speed);
          matrix = this._getTranslateMatrix(this.elProperty.translateObj, {
            y: scrollPos,
          });
          this.el.css(
            $.avia_utilities.supported.transition + "transform",
            matrix
          );
        }
        this.ticking = false;
        return;
      }
      if ("no_parallax" == this.direction || "" == this.direction) {
        matrix = this._getTranslateMatrix(this.elProperty.translateObj, {
          x: 0,
          y: 0,
        });
        this.el.css(
          $.avia_utilities.supported.transition + "transform",
          matrix
        );
        this.ticking = false;
        this.isTransformed = false;
        return;
      }
      var scroll_px_toTop = Math.ceil(this.elProperty.top - winTop),
        scroll_px_el = Math.ceil(winBottom - this.elProperty.top),
        scrolled_pc_toTop = 0,
        reduceDistanceX = 0,
        transform = { x: 0, y: 0 };
      if (this.elProperty.top < this.winHeight) {
        reduceDistanceX = Math.ceil(this.winHeight - this.elProperty.top);
      }
      if (this.elProperty.top > winBottom) {
        scrolled_pc_toTop = 0;
        scroll_px_el = 0;
      } else {
        scrolled_pc_toTop =
          1 - (scroll_px_toTop + reduceDistanceX) / this.winHeight;
      }
      switch (this.direction) {
        case "bottom_top":
          scrollPos = Math.ceil((scroll_px_el - reduceDistanceX) * this.speed);
          transform.y = -scrollPos;
          matrix = this._getTranslateMatrix(this.elProperty.translateObj, {
            y: -scrollPos,
          });
          break;
        case "left_right":
          scrollPos = Math.ceil(
            this.elProperty.distanceRight * scrolled_pc_toTop * this.speed
          );
          transform.x = scrollPos;
          matrix = this._getTranslateMatrix(this.elProperty.translateObj, {
            x: scrollPos,
          });
          break;
        case "right_left":
          scrollPos = Math.ceil(
            this.elProperty.distanceLeft * scrolled_pc_toTop * this.speed
          );
          transform.x = -scrollPos;
          matrix = this._getTranslateMatrix(this.elProperty.translateObj, {
            x: -scrollPos,
          });
          break;
        default:
          break;
      }
      var elInViewport = this._inViewport(
          this.elProperty.top,
          this.elProperty.right,
          this.elProperty.bottom,
          this.elProperty.left,
          winTop,
          winBottom,
          winLeft,
          winRight
        ),
        transformedInViewport = this._inViewport(
          this.elProperty.top + transform.y,
          this.elProperty.right + transform.x,
          this.elProperty.bottom + transform.y,
          this.elProperty.left + transform.x,
          winTop,
          winBottom,
          winLeft,
          winRight
        );
      if (elInViewport || transformedInViewport) {
        this.el.css(
          $.avia_utilities.supported.transition + "transform",
          matrix
        );
      }
      this.ticking = false;
      this.isTransformed = true;
    },
  };
  $.fn.avia_parallax = function (options) {
    return this.each(function () {
      var obj = $(this);
      var self = obj.data("aviaParallax");
      if (!self) {
        self = obj.data(
          "aviaParallax",
          new AviaObjectParallaxElement(options, this)
        );
      }
    });
  };
})(jQuery);
/*! Magnific Popup - v1.2.2 - 2022-04-11
 * http://dimsemenov.com/plugins/magnific-popup/
 * Copyright (c) 2016 Dmitry Semenov; */
!(function (e) {
  "function" == typeof define && define.amd
    ? define(["jquery"], e)
    : "object" == typeof exports
    ? e(require("jquery"))
    : e(window.jQuery || window.Zepto);
})(function (e) {
  var t,
    i,
    n,
    o,
    r,
    a,
    s = "Close",
    l = "BeforeClose",
    c = "MarkupParse",
    d = "Open",
    p = "Change",
    u = "mfp",
    f = ".mfp",
    m = "mfp-ready",
    g = "mfp-removing",
    v = "mfp-prevent-close",
    h = function () {},
    y = !!window.jQuery,
    C = e(window),
    b = function (e, i) {
      t.ev.on(u + e + f, i);
    },
    w = function (t, i, n, o) {
      var r = document.createElement("div");
      return (
        (r.className = "mfp-" + t),
        n && (r.innerHTML = n),
        o ? i && i.appendChild(r) : ((r = e(r)), i && r.appendTo(i)),
        r
      );
    },
    I = function (e, i) {
      t.ev.triggerHandler(u + e, i),
        t.st.callbacks &&
          ((e = e.charAt(0).toLowerCase() + e.slice(1)),
          t.st.callbacks[e] &&
            t.st.callbacks[e].apply(t, Array.isArray(i) ? i : [i]));
    },
    x = function (i) {
      return (
        (i === a && t.currTemplate.closeBtn) ||
          ((t.currTemplate.closeBtn = e(
            t.st.closeMarkup.replace("%title%", t.st.tClose)
          )),
          (a = i)),
        t.currTemplate.closeBtn
      );
    },
    k = function () {
      e.magnificPopup.instance ||
        ((t = new h()).init(), (e.magnificPopup.instance = t));
    };
  (h.prototype = {
    constructor: h,
    init: function () {
      var i = navigator.appVersion;
      (t.isLowIE = t.isIE8 = document.all && !document.addEventListener),
        (t.isAndroid = /android/gi.test(i)),
        (t.isIOS = /iphone|ipad|ipod/gi.test(i)),
        (t.supportsTransition = (function () {
          var e = document.createElement("p").style,
            t = ["ms", "O", "Moz", "Webkit"];
          if (void 0 !== e.transition) return !0;
          for (; t.length; ) if (t.pop() + "Transition" in e) return !0;
          return !1;
        })()),
        (t.probablyMobile =
          t.isAndroid ||
          t.isIOS ||
          /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(
            navigator.userAgent
          )),
        (n = e(document)),
        (t.popupsCache = {});
    },
    open: function (i) {
      var o;
      if (!1 === i.isObj) {
        (t.items = i.items.toArray()), (t.index = 0);
        var a,
          s = i.items;
        for (o = 0; o < s.length; o++)
          if (((a = s[o]).parsed && (a = a.el[0]), a === i.el[0])) {
            t.index = o;
            break;
          }
      } else
        (t.items = Array.isArray(i.items) ? i.items : [i.items]),
          (t.index = i.index || 0);
      if (!t.isOpen) {
        (t.types = []),
          (r = ""),
          i.mainEl && i.mainEl.length ? (t.ev = i.mainEl.eq(0)) : (t.ev = n),
          i.key
            ? (t.popupsCache[i.key] || (t.popupsCache[i.key] = {}),
              (t.currTemplate = t.popupsCache[i.key]))
            : (t.currTemplate = {}),
          (t.st = e.extend(!0, {}, e.magnificPopup.defaults, i)),
          (t.fixedContentPos =
            "auto" === t.st.fixedContentPos
              ? !t.probablyMobile
              : t.st.fixedContentPos),
          t.st.modal &&
            ((t.st.closeOnContentClick = !1),
            (t.st.closeOnBgClick = !1),
            (t.st.showCloseBtn = !1),
            (t.st.enableEscapeKey = !1)),
          t.bgOverlay ||
            ((t.bgOverlay = w("bg").on("click.mfp", function () {
              t.close();
            })),
            (t.wrap = w("wrap")
              .attr("tabindex", -1)
              .on("click.mfp", function (e) {
                t._checkIfClose(e.target) && t.close();
              })),
            (t.container = w("container", t.wrap))),
          (t.contentContainer = w("content")),
          t.st.preloader &&
            (t.preloader = w("preloader", t.container, t.st.tLoading));
        var l = e.magnificPopup.modules;
        for (o = 0; o < l.length; o++) {
          var p = l[o];
          (p = p.charAt(0).toUpperCase() + p.slice(1)), t["init" + p].call(t);
        }
        I("BeforeOpen"),
          t.st.showCloseBtn &&
            (t.st.closeBtnInside
              ? (b(c, function (e, t, i, n) {
                  i.close_replaceWith = x(n.type);
                }),
                (r += " mfp-close-btn-in"))
              : t.wrap.append(x())),
          t.st.alignTop && (r += " mfp-align-top"),
          t.fixedContentPos
            ? t.wrap.css({
                overflow: t.st.overflowY,
                overflowX: "hidden",
                overflowY: t.st.overflowY,
              })
            : t.wrap.css({ top: C.scrollTop(), position: "absolute" }),
          (!1 === t.st.fixedBgPos ||
            ("auto" === t.st.fixedBgPos && !t.fixedContentPos)) &&
            t.bgOverlay.css({ height: n.height(), position: "absolute" }),
          t.st.enableEscapeKey &&
            n.on("keyup.mfp", function (e) {
              27 === e.keyCode && t.close();
            }),
          C.on("resize.mfp", function () {
            t.updateSize();
          }),
          t.st.closeOnContentClick || (r += " mfp-auto-cursor"),
          r && t.wrap.addClass(r);
        var u = (t.wH = C.height()),
          f = {};
        if (t.fixedContentPos && t._hasScrollBar(u)) {
          var g = t._getScrollbarSize();
          g && (f.marginRight = g);
        }
        t.fixedContentPos &&
          (t.isIE7
            ? e("body, html").css("overflow", "hidden")
            : (f.overflow = "hidden"));
        var v = t.st.mainClass;
        return (
          t.isIE7 && (v += " mfp-ie7"),
          v && t._addClassToMFP(v),
          t.updateItemHTML(),
          I("BuildControls"),
          e("html").css(f),
          t.bgOverlay.add(t.wrap).prependTo(t.st.prependTo || e(document.body)),
          (t._lastFocusedEl = document.activeElement),
          setTimeout(function () {
            t.content
              ? (t._addClassToMFP(m), t._setFocus())
              : t.bgOverlay.addClass(m),
              n.on("focusin.mfp", t._onFocusIn);
          }, 16),
          (t.isOpen = !0),
          t.updateSize(u),
          I(d),
          i
        );
      }
      t.updateItemHTML();
    },
    close: function () {
      t.isOpen &&
        (I(l),
        (t.isOpen = !1),
        t.st.removalDelay && !t.isLowIE && t.supportsTransition
          ? (t._addClassToMFP(g),
            setTimeout(function () {
              t._close();
            }, t.st.removalDelay))
          : t._close());
    },
    _close: function () {
      I(s);
      var i = "mfp-removing mfp-ready ";
      if (
        (t.bgOverlay.detach(),
        t.wrap.detach(),
        t.container.empty(),
        t.st.mainClass && (i += t.st.mainClass + " "),
        t._removeClassFromMFP(i),
        t.fixedContentPos)
      ) {
        var o = { marginRight: "" };
        t.isIE7 ? e("body, html").css("overflow", "") : (o.overflow = ""),
          e("html").css(o);
      }
      n.off("keyup.mfp focusin.mfp"),
        t.ev.off(f),
        t.wrap.attr("class", "mfp-wrap").removeAttr("style"),
        t.bgOverlay.attr("class", "mfp-bg"),
        t.container.attr("class", "mfp-container"),
        !t.st.showCloseBtn ||
          (t.st.closeBtnInside && !0 !== t.currTemplate[t.currItem.type]) ||
          (t.currTemplate.closeBtn && t.currTemplate.closeBtn.detach()),
        t.st.autoFocusLast &&
          t._lastFocusedEl &&
          e(t._lastFocusedEl).trigger("focus"),
        (t.currItem = null),
        (t.content = null),
        (t.currTemplate = null),
        (t.prevHeight = 0),
        I("AfterClose");
    },
    updateSize: function (e) {
      if (t.isIOS) {
        var i = document.documentElement.clientWidth / window.innerWidth,
          n = window.innerHeight * i;
        t.wrap.css("height", n), (t.wH = n);
      } else t.wH = e || C.height();
      t.fixedContentPos || t.wrap.css("height", t.wH), I("Resize");
    },
    updateItemHTML: function () {
      var i = t.items[t.index];
      t.contentContainer.detach(),
        t.content && t.content.detach(),
        i.parsed || (i = t.parseEl(t.index));
      var n = i.type;
      if (
        (I("BeforeChange", [t.currItem ? t.currItem.type : "", n]),
        (t.currItem = i),
        !t.currTemplate[n])
      ) {
        var r = !!t.st[n] && t.st[n].markup;
        I("FirstMarkupParse", r), (t.currTemplate[n] = !r || e(r));
      }
      o && o !== i.type && t.container.removeClass("mfp-" + o + "-holder");
      var a = t["get" + n.charAt(0).toUpperCase() + n.slice(1)](
        i,
        t.currTemplate[n]
      );
      t.appendContent(a, n),
        (i.preloaded = !0),
        I(p, i),
        (o = i.type),
        t.container.prepend(t.contentContainer),
        I("AfterChange");
    },
    appendContent: function (e, i) {
      (t.content = e),
        e
          ? t.st.showCloseBtn && t.st.closeBtnInside && !0 === t.currTemplate[i]
            ? t.content.find(".mfp-close").length || t.content.append(x())
            : (t.content = e)
          : (t.content = ""),
        I("BeforeAppend"),
        t.container.addClass("mfp-" + i + "-holder"),
        t.contentContainer.append(t.content);
    },
    parseEl: function (i) {
      var n,
        o = t.items[i];
      if (
        (o.tagName
          ? (o = { el: e(o) })
          : ((n = o.type), (o = { data: o, src: o.src })),
        o.el)
      ) {
        for (var r = t.types, a = 0; a < r.length; a++)
          if (o.el.hasClass("mfp-" + r[a])) {
            n = r[a];
            break;
          }
        (o.src = o.el.attr("data-mfp-src")),
          o.src || (o.src = o.el.attr("href"));
      }
      return (
        (o.type = n || t.st.type || "inline"),
        (o.index = i),
        (o.parsed = !0),
        (t.items[i] = o),
        I("ElementParse", o),
        t.items[i]
      );
    },
    addGroup: function (e, i) {
      var n = function (n) {
        (n.mfpEl = this), t._openClick(n, e, i);
      };
      i || (i = {});
      var o = "click.magnificPopup";
      (i.mainEl = e),
        i.items
          ? ((i.isObj = !0), e.off(o).on(o, n))
          : ((i.isObj = !1),
            i.delegate
              ? e.off(o).on(o, i.delegate, n)
              : ((i.items = e), e.off(o).on(o, n)));
    },
    _openClick: function (i, n, o) {
      if (
        (void 0 !== o.midClick
          ? o.midClick
          : e.magnificPopup.defaults.midClick) ||
        !(2 === i.which || i.ctrlKey || i.metaKey || i.altKey || i.shiftKey)
      ) {
        var r =
          void 0 !== o.disableOn
            ? o.disableOn
            : e.magnificPopup.defaults.disableOn;
        if (r)
          if ("function" == typeof r) {
            if (!r.call(t)) return !0;
          } else if (C.width() < r) return !0;
        i.type && (i.preventDefault(), t.isOpen && i.stopPropagation()),
          (o.el = e(i.mfpEl)),
          o.delegate && (o.items = n.find(o.delegate)),
          t.open(o);
      }
    },
    updateStatus: function (e, n) {
      if (t.preloader) {
        i !== e && t.container.removeClass("mfp-s-" + i),
          n || "loading" !== e || (n = t.st.tLoading);
        var o = { status: e, text: n };
        I("UpdateStatus", o),
          (e = o.status),
          (n = o.text),
          t.preloader.html(n),
          t.preloader.find("a").on("click", function (e) {
            e.stopImmediatePropagation();
          }),
          t.container.addClass("mfp-s-" + e),
          (i = e);
      }
    },
    _checkIfClose: function (i) {
      if (!e(i).hasClass(v)) {
        var n = t.st.closeOnContentClick,
          o = t.st.closeOnBgClick;
        if (n && o) return !0;
        if (
          !t.content ||
          e(i).hasClass("mfp-close") ||
          (t.preloader && i === t.preloader[0])
        )
          return !0;
        if (i === t.content[0] || e.contains(t.content[0], i)) {
          if (n) return !0;
        } else if (o && e.contains(document, i)) return !0;
        return !1;
      }
    },
    _addClassToMFP: function (e) {
      t.bgOverlay.addClass(e), t.wrap.addClass(e);
    },
    _removeClassFromMFP: function (e) {
      this.bgOverlay.removeClass(e), t.wrap.removeClass(e);
    },
    _hasScrollBar: function (e) {
      return (
        (t.isIE7 ? n.height() : document.body.scrollHeight) > (e || C.height())
      );
    },
    _setFocus: function () {
      (t.st.focus ? t.content.find(t.st.focus).eq(0) : t.wrap).trigger("focus");
    },
    _onFocusIn: function (i) {
      if (i.target !== t.wrap[0] && !e.contains(t.wrap[0], i.target))
        return t._setFocus(), !1;
    },
    _parseMarkup: function (t, i, n) {
      var o;
      n.data && (i = e.extend(n.data, i)),
        I(c, [t, i, n]),
        e.each(i, function (i, n) {
          if (void 0 === n || !1 === n) return !0;
          if ((o = i.split("_")).length > 1) {
            var r = t.find(".mfp-" + o[0]);
            if (r.length > 0) {
              var a = o[1];
              "replaceWith" === a
                ? r[0] !== n[0] && r.replaceWith(n)
                : "img" === a
                ? r.is("img")
                  ? r.attr("src", n)
                  : r.replaceWith(
                      e("<img>").attr("src", n).attr("class", r.attr("class"))
                    )
                : r.attr(o[1], n);
            }
          } else t.find(".mfp-" + i).html(n);
        });
    },
    _getScrollbarSize: function () {
      if (void 0 === t.scrollbarSize) {
        var e = document.createElement("div");
        (e.style.cssText =
          "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;"),
          document.body.appendChild(e),
          (t.scrollbarSize = e.offsetWidth - e.clientWidth),
          document.body.removeChild(e);
      }
      return t.scrollbarSize;
    },
  }),
    (e.magnificPopup = {
      instance: null,
      proto: h.prototype,
      modules: [],
      open: function (t, i) {
        return (
          k(),
          ((t = t ? e.extend(!0, {}, t) : {}).isObj = !0),
          (t.index = i || 0),
          this.instance.open(t)
        );
      },
      close: function () {
        return e.magnificPopup.instance && e.magnificPopup.instance.close();
      },
      registerModule: function (t, i) {
        i.options && (e.magnificPopup.defaults[t] = i.options),
          e.extend(this.proto, i.proto),
          this.modules.push(t);
      },
      defaults: {
        disableOn: 0,
        key: null,
        midClick: !1,
        mainClass: "",
        preloader: !0,
        focus: "",
        closeOnContentClick: !1,
        closeOnBgClick: !0,
        closeBtnInside: !0,
        showCloseBtn: !0,
        enableEscapeKey: !0,
        modal: !1,
        alignTop: !1,
        removalDelay: 0,
        prependTo: null,
        fixedContentPos: "auto",
        fixedBgPos: "auto",
        overflowY: "auto",
        closeMarkup:
          '<button title="%title%" type="button" class="mfp-close">&#215;</button>',
        tClose: "Close (Esc)",
        tLoading: "Loading...",
        autoFocusLast: !0,
      },
    }),
    (e.fn.magnificPopup = function (i) {
      k();
      var n = e(this);
      if ("string" == typeof i)
        if ("open" === i) {
          var o,
            r = y ? n.data("magnificPopup") : n[0].magnificPopup,
            a = parseInt(arguments[1], 10) || 0;
          r.items
            ? (o = r.items[a])
            : ((o = n), r.delegate && (o = o.find(r.delegate)), (o = o.eq(a))),
            t._openClick({ mfpEl: o }, n, r);
        } else
          t.isOpen && t[i].apply(t, Array.prototype.slice.call(arguments, 1));
      else
        (i = e.extend(!0, {}, i)),
          y ? n.data("magnificPopup", i) : (n[0].magnificPopup = i),
          t.addGroup(n, i);
      return n;
    });
  var T,
    _,
    z,
    P = "inline",
    S = function () {
      z && (_.after(z.addClass(T)).detach(), (z = null));
    };
  e.magnificPopup.registerModule(P, {
    options: {
      hiddenClass: "hide",
      markup: "",
      tNotFound: "Content not found",
    },
    proto: {
      initInline: function () {
        t.types.push(P),
          b("Close.inline", function () {
            S();
          });
      },
      getInline: function (i, n) {
        if ((S(), i.src)) {
          var o = t.st.inline,
            r = e(i.src);
          if (r.length) {
            var a = r[0].parentNode;
            a &&
              a.tagName &&
              (_ || ((T = o.hiddenClass), (_ = w(T)), (T = "mfp-" + T)),
              (z = r.after(_).detach().removeClass(T))),
              t.updateStatus("ready");
          } else t.updateStatus("error", o.tNotFound), (r = e("<div>"));
          return (i.inlineElement = r), r;
        }
        return t.updateStatus("ready"), t._parseMarkup(n, {}, i), n;
      },
    },
  });
  var E,
    O = "ajax",
    M = function () {
      E && e(document.body).removeClass(E);
    },
    B = function () {
      M(), t.req && t.req.abort();
    };
  e.magnificPopup.registerModule(O, {
    options: {
      settings: null,
      cursor: "mfp-ajax-cur",
      tError: '<a href="%url%">The content</a> could not be loaded.',
    },
    proto: {
      initAjax: function () {
        t.types.push(O),
          (E = t.st.ajax.cursor),
          b("Close.ajax", B),
          b("BeforeChange.ajax", B);
      },
      getAjax: function (i) {
        E && e(document.body).addClass(E), t.updateStatus("loading");
        var n = e.extend(
          {
            url: i.src,
            success: function (n, o, r) {
              var a = { data: n, xhr: r };
              I("ParseAjax", a),
                t.appendContent(e(a.data), O),
                (i.finished = !0),
                M(),
                t._setFocus(),
                setTimeout(function () {
                  t.wrap.addClass(m);
                }, 16),
                t.updateStatus("ready"),
                I("AjaxContentAdded");
            },
            error: function () {
              M(),
                (i.finished = i.loadError = !0),
                t.updateStatus(
                  "error",
                  t.st.ajax.tError.replace("%url%", i.src)
                );
            },
          },
          t.st.ajax.settings
        );
        return (t.req = e.ajax(n)), "";
      },
    },
  });
  var A,
    L = function (e) {
      if (e.data && void 0 !== e.data.title) return e.data.title;
      var i = t.st.image.titleSrc;
      if (i) {
        if ("function" == typeof i) return i.call(t, e);
        if (e.el) return e.el.attr(i) || "";
      }
      return "";
    };
  e.magnificPopup.registerModule("image", {
    options: {
      markup:
        '<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',
      cursor: "mfp-zoom-out-cur",
      titleSrc: "title",
      verticalFit: !0,
      tError: '<a href="%url%">The image</a> could not be loaded.',
    },
    proto: {
      initImage: function () {
        var i = t.st.image,
          n = ".image";
        t.types.push("image"),
          b("Open.image", function () {
            "image" === t.currItem.type &&
              i.cursor &&
              e(document.body).addClass(i.cursor);
          }),
          b("Close.image", function () {
            i.cursor && e(document.body).removeClass(i.cursor),
              C.off("resize.mfp");
          }),
          b("Resize" + n, t.resizeImage),
          t.isLowIE && b("AfterChange", t.resizeImage);
      },
      resizeImage: function () {
        var e = t.currItem;
        if (e && e.img && t.st.image.verticalFit) {
          var i = 0;
          t.isLowIE &&
            (i =
              parseInt(e.img.css("padding-top"), 10) +
              parseInt(e.img.css("padding-bottom"), 10)),
            e.img.css("max-height", t.wH - i);
        }
      },
      _onImageHasSize: function (e) {
        e.img &&
          ((e.hasSize = !0),
          A && clearInterval(A),
          (e.isCheckingImgSize = !1),
          I("ImageHasSize", e),
          e.imgHidden &&
            (t.content && t.content.removeClass("mfp-loading"),
            (e.imgHidden = !1)));
      },
      findImageSize: function (e) {
        var i = 0,
          n = e.img[0],
          o = function (r) {
            A && clearInterval(A),
              (A = setInterval(function () {
                n.naturalWidth > 0
                  ? t._onImageHasSize(e)
                  : (i > 200 && clearInterval(A),
                    3 === ++i ? o(10) : 40 === i ? o(50) : 100 === i && o(500));
              }, r));
          };
        o(1);
      },
      getImage: function (i, n) {
        var o = 0,
          r = function () {
            i &&
              (i.img[0].complete
                ? (i.img.off(".mfploader"),
                  i === t.currItem &&
                    (t._onImageHasSize(i), t.updateStatus("ready")),
                  (i.hasSize = !0),
                  (i.loaded = !0),
                  I("ImageLoadComplete"))
                : ++o < 200
                ? setTimeout(r, 100)
                : a());
          },
          a = function () {
            i &&
              (i.img.off(".mfploader"),
              i === t.currItem &&
                (t._onImageHasSize(i),
                t.updateStatus("error", s.tError.replace("%url%", i.src))),
              (i.hasSize = !0),
              (i.loaded = !0),
              (i.loadError = !0));
          },
          s = t.st.image,
          l = n.find(".mfp-img");
        if (l.length) {
          var c = document.createElement("img");
          if (
            ((c.className = "mfp-img"),
            i.el &&
              i.el.find("img").length &&
              (c.alt = i.el.find("img").attr("alt")),
            (i.img = e(c).on("load.mfploader", r).on("error.mfploader", a)),
            (c.src = i.src),
            e("body").hasClass("responsive-images-lightbox-support"))
          ) {
            var d = i.el.data("srcset"),
              p = i.el.data("sizes");
            void 0 !== d
              ? ((c.srcset = d), void 0 !== p && (c.sizes = p))
              : (void 0 !== (d = i.el.find("img").attr("srcset")) &&
                  (c.srcset = d),
                void 0 !== (p = i.el.find("img").attr("sizes")) &&
                  (c.sizes = p));
          }
          l.is("img") && (i.img = i.img.clone()),
            (c = i.img[0]).naturalWidth > 0
              ? (i.hasSize = !0)
              : c.width || (i.hasSize = !1);
        }
        return (
          t._parseMarkup(n, { title: L(i), img_replaceWith: i.img }, i),
          t.resizeImage(),
          i.hasSize
            ? (A && clearInterval(A),
              i.loadError
                ? (n.addClass("mfp-loading"),
                  t.updateStatus("error", s.tError.replace("%url%", i.src)))
                : (n.removeClass("mfp-loading"), t.updateStatus("ready")),
              n)
            : (t.updateStatus("loading"),
              (i.loading = !0),
              i.hasSize ||
                ((i.imgHidden = !0),
                n.addClass("mfp-loading"),
                t.findImageSize(i)),
              n)
        );
      },
    },
  });
  var H;
  e.magnificPopup.registerModule("zoom", {
    options: {
      enabled: !1,
      easing: "ease-in-out",
      duration: 300,
      opener: function (e) {
        return e.is("img") ? e : e.find("img");
      },
    },
    proto: {
      initZoom: function () {
        var e,
          i = t.st.zoom,
          n = ".zoom";
        if (i.enabled && t.supportsTransition) {
          var o,
            r,
            a = i.duration,
            s = function (e) {
              var t = e
                  .clone()
                  .removeAttr("style")
                  .removeAttr("class")
                  .addClass("mfp-animated-image"),
                n = "all " + i.duration / 1e3 + "s " + i.easing,
                o = {
                  position: "fixed",
                  zIndex: 9999,
                  left: 0,
                  top: 0,
                  "-webkit-backface-visibility": "hidden",
                },
                r = "transition";
              return (
                (o["-webkit-" + r] = o["-moz-" + r] = o["-o-" + r] = o[r] = n),
                t.css(o),
                t
              );
            },
            l = function () {
              t.content.css("visibility", "visible");
            };
          b("BuildControls" + n, function () {
            if (t._allowZoom()) {
              if (
                (clearTimeout(o),
                t.content.css("visibility", "hidden"),
                !(e = t._getItemToZoom()))
              )
                return void l();
              (r = s(e)).css(t._getOffset()),
                t.wrap.append(r),
                (o = setTimeout(function () {
                  r.css(t._getOffset(!0)),
                    (o = setTimeout(function () {
                      l(),
                        setTimeout(function () {
                          r.remove(), (e = r = null), I("ZoomAnimationEnded");
                        }, 16);
                    }, a));
                }, 16));
            }
          }),
            b("BeforeClose.zoom", function () {
              if (t._allowZoom()) {
                if ((clearTimeout(o), (t.st.removalDelay = a), !e)) {
                  if (!(e = t._getItemToZoom())) return;
                  r = s(e);
                }
                r.css(t._getOffset(!0)),
                  t.wrap.append(r),
                  t.content.css("visibility", "hidden"),
                  setTimeout(function () {
                    r.css(t._getOffset());
                  }, 16);
              }
            }),
            b("Close.zoom", function () {
              t._allowZoom() && (l(), r && r.remove(), (e = null));
            });
        }
      },
      _allowZoom: function () {
        return "image" === t.currItem.type;
      },
      _getItemToZoom: function () {
        return !!t.currItem.hasSize && t.currItem.img;
      },
      _getOffset: function (i) {
        var n,
          o = (n = i
            ? t.currItem.img
            : t.st.zoom.opener(t.currItem.el || t.currItem)).offset(),
          r = parseInt(n.css("padding-top"), 10),
          a = parseInt(n.css("padding-bottom"), 10);
        o.top -= e(window).scrollTop() - r;
        var s = {
          width: n.width(),
          height: (y ? n.innerHeight() : n[0].offsetHeight) - a - r,
        };
        return (
          void 0 === H &&
            (H = void 0 !== document.createElement("p").style.MozTransform),
          H
            ? (s["-moz-transform"] = s.transform =
                "translate(" + o.left + "px," + o.top + "px)")
            : ((s.left = o.left), (s.top = o.top)),
          s
        );
      },
    },
  });
  var F = "iframe",
    j = function (e) {
      if (t.currTemplate.iframe) {
        var i = t.currTemplate.iframe.find("iframe");
        i.length &&
          (e || (i[0].src = "//about:blank"),
          t.isIE8 && i.css("display", e ? "block" : "none"));
      }
    };
  e.magnificPopup.registerModule(F, {
    options: {
      markup:
        '<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>',
      srcAction: "iframe_src",
      patterns: {
        youtube: {
          index: "youtube.com",
          id: "v=",
          src: "//www.youtube.com/embed/%id%?autoplay=1",
        },
        vimeo: {
          index: "vimeo.com/",
          id: "/",
          src: "//player.vimeo.com/video/%id%?autoplay=1",
        },
        gmaps: { index: "//maps.google.", src: "%id%&output=embed" },
      },
    },
    proto: {
      initIframe: function () {
        t.types.push(F),
          b("BeforeChange", function (e, t, i) {
            t !== i && (t === F ? j() : i === F && j(!0));
          }),
          b("Close.iframe", function () {
            j();
          });
      },
      getIframe: function (i, n) {
        var o = i.src,
          r = t.st.iframe;
        e.each(r.patterns, function () {
          if (o.indexOf(this.index) > -1)
            return (
              this.id &&
                (o =
                  "string" == typeof this.id
                    ? o.substr(
                        o.lastIndexOf(this.id) + this.id.length,
                        o.length
                      )
                    : this.id.call(this, o)),
              (o = this.src.replace("%id%", o)),
              !1
            );
        });
        var a = {};
        return (
          r.srcAction && (a[r.srcAction] = o),
          t._parseMarkup(n, a, i),
          t.updateStatus("ready"),
          n
        );
      },
    },
  });
  var N = function (e) {
      var i = t.items.length;
      return e > i - 1 ? e - i : e < 0 ? i + e : e;
    },
    W = function (e, t, i) {
      return e.replace(/%curr%/gi, t + 1).replace(/%total%/gi, i);
    };
  e.magnificPopup.registerModule("gallery", {
    options: {
      enabled: !1,
      arrowMarkup:
        '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
      preload: [0, 2],
      navigateByImgClick: !0,
      arrows: !0,
      tPrev: "Previous (Left arrow key)",
      tNext: "Next (Right arrow key)",
      tCounter: "%curr% of %total%",
    },
    proto: {
      initGallery: function () {
        var i = t.st.gallery,
          o = ".mfp-gallery";
        if (((t.direction = !0), !i || !i.enabled)) return !1;
        (r += " mfp-gallery"),
          b(d + o, function () {
            i.navigateByImgClick &&
              t.wrap.on("click" + o, ".mfp-img", function () {
                if (t.items.length > 1) return t.next(), !1;
              }),
              n.on("keydown" + o, function (e) {
                37 === e.keyCode ? t.prev() : 39 === e.keyCode && t.next();
              });
          }),
          b("UpdateStatus" + o, function (e, i) {
            i.text && (i.text = W(i.text, t.currItem.index, t.items.length));
          }),
          b(c + o, function (e, n, o, r) {
            var a = t.items.length;
            o.counter = a > 1 ? W(i.tCounter, r.index, a) : "";
          }),
          b("BuildControls" + o, function () {
            if (t.items.length > 1 && i.arrows && !t.arrowLeft) {
              var n = i.arrowMarkup,
                o = (t.arrowLeft = e(
                  n.replace(/%title%/gi, i.tPrev).replace(/%dir%/gi, "left")
                ).addClass(v)),
                r = (t.arrowRight = e(
                  n.replace(/%title%/gi, i.tNext).replace(/%dir%/gi, "right")
                ).addClass(v));
              o.on("click", function () {
                t.prev();
              }),
                r.on("click", function () {
                  t.next();
                }),
                t.container.append(o.add(r));
            }
          }),
          b(p + o, function () {
            t._preloadTimeout && clearTimeout(t._preloadTimeout),
              (t._preloadTimeout = setTimeout(function () {
                t.preloadNearbyImages(), (t._preloadTimeout = null);
              }, 16));
          }),
          b(s + o, function () {
            n.off(o),
              t.wrap.off("click" + o),
              (t.arrowRight = t.arrowLeft = null);
          });
      },
      next: function () {
        (t.direction = !0), (t.index = N(t.index + 1)), t.updateItemHTML();
      },
      prev: function () {
        (t.direction = !1), (t.index = N(t.index - 1)), t.updateItemHTML();
      },
      goTo: function (e) {
        (t.direction = e >= t.index), (t.index = e), t.updateItemHTML();
      },
      preloadNearbyImages: function () {
        var e,
          i = t.st.gallery.preload,
          n = Math.min(i[0], t.items.length),
          o = Math.min(i[1], t.items.length);
        for (e = 1; e <= (t.direction ? o : n); e++)
          t._preloadItem(t.index + e);
        for (e = 1; e <= (t.direction ? n : o); e++)
          t._preloadItem(t.index - e);
      },
      _preloadItem: function (i) {
        if (((i = N(i)), !t.items[i].preloaded)) {
          var n = t.items[i];
          if (
            (n.parsed || (n = t.parseEl(i)),
            I("LazyLoad", n),
            "image" === n.type &&
              ((n.img = e('<img class="mfp-img" />')
                .on("load.mfploader", function () {
                  n.hasSize = !0;
                })
                .on("error.mfploader", function () {
                  (n.hasSize = !0), (n.loadError = !0), I("LazyLoadError", n);
                })
                .attr("src", n.src)),
              e("body").hasClass("responsive-images-lightbox-support") &&
                n.el.length > 0))
          ) {
            var o = e(n.el[0]),
              r = o.data("srcset"),
              a = o.data("sizes");
            if (void 0 !== r)
              n.img.attr("srcset", r), void 0 !== a && n.img.attr("sizes", a);
            else {
              var s = e(n.el[0]).find("img");
              void 0 !== (r = s.attr("srcset")) && n.img.attr("srcset", r),
                void 0 !== (a = s.attr("sizes")) && n.img.attr("sizes", a);
            }
          }
          n.preloaded = !0;
        }
      },
    },
  });
  var Z = "retina";
  e.magnificPopup.registerModule(Z, {
    options: {
      replaceSrc: function (e) {
        return e.src.replace(/\.\w+$/, function (e) {
          return "@2x" + e;
        });
      },
      ratio: 1,
    },
    proto: {
      initRetina: function () {
        if (window.devicePixelRatio > 1) {
          var e = t.st.retina,
            i = e.ratio;
          (i = isNaN(i) ? i() : i) > 1 &&
            (b("ImageHasSize.retina", function (e, t) {
              t.img.css({
                "max-width": t.img[0].naturalWidth / i,
                width: "100%",
              });
            }),
            b("ElementParse.retina", function (t, n) {
              n.src = e.replaceSrc(n, i);
            }));
        }
      },
    },
  }),
    k();
});

(function ($) {
  "use strict";
  $.avia_utilities = $.avia_utilities || {};
  ($.avia_utilities.av_popup = {
    type: "image",
    mainClass: "avia-popup mfp-zoom-in",
    tLoading: "",
    tClose: "",
    removalDelay: 300,
    closeBtnInside: true,
    closeOnContentClick: false,
    midClick: true,
    autoFocusLast: false,
    fixedContentPos: false,
    iframe: {
      patterns: {
        youtube: {
          index: "youtube.com/watch",
          id: function (url) {
            var m = url.match(/[\\?\\&]v=([^\\?\\&]+)/),
              id,
              params;
            if (!m || !m[1]) return null;
            id = m[1];
            params = url.split("/watch");
            params = params[1];
            return id + params;
          },
          src: "//www.youtube.com/embed/%id%",
        },
        vimeo: {
          index: "vimeo.com/",
          id: function (url) {
            var m = url.match(
                /(https?:\/\/)?(www.)?(player.)?vimeo.com\/([a-z]*\/)*([0-9]{6,11})[?]?.*/
              ),
              id,
              params;
            if (!m || !m[5]) return null;
            id = m[5];
            params = url.split("?");
            params = params[1];
            return id + "?" + params;
          },
          src: "//player.vimeo.com/video/%id%",
        },
      },
    },
    image: {
      titleSrc: function (item) {
        var title = item.el.attr("title");
        if (!title) {
          title = item.el.find("img").attr("title");
        }
        if (!title) {
          title = item.el.parent().next(".wp-caption-text").html();
        }
        if (typeof title != "undefined") {
          return title;
        }
        if (!$("body").hasClass("avia-mfp-show-alt-text")) {
          return "";
        }
        var alt = item.el.attr("alt");
        if (typeof alt != "undefined") {
          return alt;
        }
        alt = item.el.find("img").attr("alt");
        if (typeof alt != "undefined") {
          return alt;
        }
        return "";
      },
    },
    gallery: {
      tPrev: "",
      tNext: "",
      tCounter: "%curr% / %total%",
      enabled: true,
      preload: [1, 1],
    },
    callbacks: {
      beforeOpen: function () {
        if (this.st.el && this.st.el.data("fixed-content")) {
          this.fixedContentPos = true;
        }
      },
      open: function () {
        $.magnificPopup.instance.next = function () {
          var self = this;
          self.wrap.removeClass("mfp-image-loaded");
          setTimeout(function () {
            $.magnificPopup.proto.next.call(self);
          }, 120);
        };
        $.magnificPopup.instance.prev = function () {
          var self = this;
          self.wrap.removeClass("mfp-image-loaded");
          setTimeout(function () {
            $.magnificPopup.proto.prev.call(self);
          }, 120);
        };
        if (this.st.el && this.st.el.data("av-extra-class")) {
          this.wrap.addClass(this.currItem.el.data("av-extra-class"));
        }
      },
      markupParse: function (template, values, item) {
        if (
          typeof values.img_replaceWith == "undefined" ||
          typeof values.img_replaceWith.length == "undefined" ||
          values.img_replaceWith.length == 0
        ) {
          return;
        }
        var img = $(values.img_replaceWith[0]);
        if (typeof img.attr("alt") != "undefined") {
          return;
        }
        var alt = item.el.attr("alt");
        if (typeof alt == "undefined") {
          alt = item.el.find("img").attr("alt");
        }
        if (typeof alt != "undefined") {
          img.attr("alt", alt);
        }
        return;
      },
      imageLoadComplete: function () {
        var self = this;
        setTimeout(function () {
          self.wrap.addClass("mfp-image-loaded");
        }, 16);
      },
      change: function () {
        if (this.currItem.el) {
          var current = this.currItem.el;
          this.content
            .find(".av-extra-modal-content, .av-extra-modal-markup")
            .remove();
          if (current.data("av-extra-content")) {
            var extra = current.data("av-extra-content");
            this.content.append(
              "<div class='av-extra-modal-content'>" + extra + "</div>"
            );
          }
          if (current.data("av-extra-markup")) {
            var markup = current.data("av-extra-markup");
            this.wrap.append(
              "<div class='av-extra-modal-markup'>" + markup + "</div>"
            );
          }
        }
      },
    },
  }),
    ($.fn.avia_activate_lightbox = function (variables) {
      var defaults = {
          groups: [
            ".avia-slideshow",
            ".avia-gallery",
            ".av-horizontal-gallery",
            ".av-instagram-pics",
            ".portfolio-preview-image",
            ".portfolio-preview-content",
            ".isotope",
            ".post-entry",
            ".sidebar",
            "#main",
            ".main_menu",
            ".woocommerce-product-gallery",
          ],
          autolinkElements:
            'a.lightbox, a[rel^="prettyPhoto"], a[rel^="lightbox"], a[href$=jpg], a[href$=webp], a[href$=png], a[href$=gif], a[href$=jpeg], a[href*=".jpg?"], a[href*=".png?"], a[href*=".gif?"], a[href*=".jpeg?"], a[href$=".mov"] , a[href$=".swf"] , a:regex(href, .vimeo.com/[0-9]) , a[href*="youtube.com/watch"] , a[href*="screenr.com"], a[href*="iframe=true"]',
          videoElements:
            'a[href$=".mov"] , a[href$=".swf"] , a:regex(href, .vimeo.com/[0-9]) , a[href*="youtube.com/watch"] , a[href*="screenr.com"], a[href*="iframe=true"]',
          exclude:
            '.noLightbox, .noLightbox a, .fakeLightbox, .lightbox-added, a[href*="dropbox.com"]',
        },
        options = $.extend({}, defaults, variables),
        active = !$("html").is(".av-custom-lightbox");
      if (!active) return this;
      return this.each(function () {
        var container = $(this),
          videos = $(options.videoElements, this)
            .not(options.exclude)
            .addClass("mfp-iframe"),
          ajaxed = !container.is("body") && !container.is(".ajax_slide");
        for (var i = 0; i < options.groups.length; i++) {
          container.find(options.groups[i]).each(function () {
            var links = $(options.autolinkElements, this);
            if (ajaxed) links.removeClass("lightbox-added");
            links
              .not(options.exclude)
              .addClass("lightbox-added")
              .magnificPopup($.avia_utilities.av_popup);
          });
        }
      });
    });
})(jQuery);
(function ($) {
  "use strict";
  $(function () {
    avia_header_size();
  });
  function av_change_class($element, change_method, class_name) {
    if ($element[0].classList) {
      if (change_method == "add") {
        $element[0].classList.add(class_name);
      } else {
        $element[0].classList.remove(class_name);
      }
    } else {
      if (change_method == "add") {
        $element.addClass(class_name);
      } else {
        $element.removeClass(class_name);
      }
    }
  }
  function avia_header_size() {
    var win = $(window),
      header = $(".html_header_top.html_header_sticky #header"),
      unsticktop = $(".av_header_unstick_top");
    if (!header.length && !unsticktop.length) {
      return;
    }
    var logo = $(
        "#header_main .container .logo img, #header_main .container .logo svg, #header_main .container .logo a"
      ),
      elements = $(
        "#header_main .container:not(#header_main_alternate>.container), #header_main .main_menu ul:first-child > li > a:not(.avia_mega_div a, #header_main_alternate a), #header_main #menu-item-shop .cart_dropdown_link"
      ),
      el_height = $(elements).first().height(),
      isMobile = $.avia_utilities.isMobile,
      scroll_top = $("#scroll-top-link"),
      transparent = header.is(".av_header_transparency"),
      shrinking = header.is(".av_header_shrinking"),
      header_meta = header.find("#header_meta"),
      topbar_height = header_meta.length ? header_meta.outerHeight() : 0,
      set_height = function () {
        var st = win.scrollTop(),
          newH = 0,
          st_real = st;
        if (unsticktop) {
          st -= topbar_height;
        }
        if (st < 0) {
          st = 0;
        }
        if (shrinking && !isMobile) {
          if (st < el_height / 2) {
            newH = el_height - st;
            if (st <= 0) {
              newH = el_height;
            }
            av_change_class(header, "remove", "header-scrolled");
          } else {
            newH = el_height / 2;
            av_change_class(header, "add", "header-scrolled");
          }
          if (st - 30 < el_height) {
            av_change_class(header, "remove", "header-scrolled-full");
          } else {
            av_change_class(header, "add", "header-scrolled-full");
          }
          elements.css({ height: newH + "px", lineHeight: newH + "px" });
          logo.css({ maxHeight: newH + "px" });
        }
        if (unsticktop.length) {
          if (st <= 0) {
            if (st_real <= 0) {
              st_real = 0;
            }
            unsticktop.css({ "margin-top": "-" + st_real + "px" });
          } else {
            unsticktop.css({ "margin-top": "-" + topbar_height + "px" });
          }
        }
        if (transparent) {
          if (st > 50) {
            av_change_class(header, "remove", "av_header_transparency");
          } else {
            av_change_class(header, "add", "av_header_transparency");
          }
        }
      };
    if ($("body").is(".avia_deactivate_menu_resize")) {
      shrinking = false;
    }
    if (!transparent && !shrinking && !unsticktop.length) {
      return;
    }
    win.on("debouncedresize", function () {
      el_height = $(elements).attr("style", "").first().height();
      set_height();
    });
    win.on("scroll", function () {
      window.requestAnimationFrame(set_height);
    });
    set_height();
  }
})(jQuery);
(function ($) {
  "use strict";
  var win = null,
    body = null,
    placeholder = null,
    footer = null,
    max_height = null;
  $(function () {
    win = $(window);
    body = $("body");
    if (body.hasClass("av-curtain-footer")) {
      aviaFooterCurtain();
      return;
    }
    return;
  });
  function aviaFooterCurtain() {
    footer = body.find(".av-curtain-footer-container");
    if (footer.length == 0) {
      body.removeClass(
        "av-curtain-footer av-curtain-activated av-curtain-numeric av-curtain-screen"
      );
      return;
    }
    placeholder = $('<div id="av-curtain-footer-placeholder"></div>');
    footer.before(placeholder);
    if (body.hasClass("av-curtain-numeric")) {
      max_height = footer.data("footer_max_height");
      if ("undefined" == typeof max_height) {
        max_height = 70;
      } else {
        max_height = parseInt(max_height, 10);
        if (isNaN(max_height)) {
          max_height = 70;
        }
      }
    }
    aviaCurtainEffects();
    win.on("debouncedresize", aviaCurtainEffects);
  }
  function aviaCurtainEffects() {
    var height = Math.floor(footer.outerHeight()),
      viewportHeight = win.innerHeight();
    if (null == max_height) {
      placeholder.css({ height: height + "px" });
    } else {
      var limit = Math.floor(viewportHeight * (max_height / 100.0));
      if (height > limit) {
        body.removeClass("av-curtain-activated");
        placeholder.css({ height: "" });
      } else {
        body.addClass("av-curtain-activated");
        placeholder.css({ height: height + "px" });
      }
    }
  }
})(jQuery);
(function ($) {
  "use strict";
  $(window).on("pageshow", function (event) {
    if (event.originalEvent.persisted) {
      avia_site_preloader();
    }
  });
  $(function () {
    avia_site_preloader();
  });
  function avia_site_preloader() {
    var win = $(window),
      preloader_active = $("html.av-preloader-active"),
      pre_wrap;
    if (preloader_active.length) {
      var hide = function () {
        pre_wrap.avia_animate({ opacity: 0 }, function () {
          preloader_active.removeClass("av-preloader-active");
        });
      };
      pre_wrap = $(".av-siteloader-wrap");
      setTimeout(function () {
        $.avia_utilities.preload({
          container: preloader_active,
          global_callback: hide,
        });
        setTimeout(function () {
          if (preloader_active.is(".av-preloader-active")) {
            hide();
            $.avia_utilities.log("Hide Preloader (Fallback)");
          }
        }, 4000);
        if (pre_wrap.is(".av-transition-enabled")) {
          var comp = new RegExp(location.host),
            exclude =
              " .no-transition, .mfp-iframe, .lightbox-added, a.avianolink, .grid-links-ajax a, #menu-item-search a, .wp-playlist-caption";
          preloader_active.on("click", "a:not(" + exclude + ")", function (e) {
            if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
              var link = this;
              if (
                comp.test(link.href) &&
                link.href.split("#")[0] != location.href.split("#")[0] &&
                link.target == ""
              ) {
                if (
                  link.href.indexOf("mailto:") == -1 &&
                  link.href.indexOf("add-to-cart=") == -1
                ) {
                  e.preventDefault();
                  preloader_active.addClass(
                    "av-preloader-active av-preloader-reactive"
                  );
                  pre_wrap.avia_animate({ opacity: 1 }, function () {
                    window.location = link.href;
                  });
                }
              }
            }
          });
        }
      }, 500);
    }
  }
})(jQuery);
(function ($) {
  "use strict";
  $(function () {
    $(".avia_auto_toc").each(function () {
      var $toc_section = $(this).attr("id");
      var $levels = "h1";
      var $levelslist = new Array();
      var $excludeclass = "";
      var $toc_container = $(this).find(".avia-toc-container");
      if ($toc_container.length) {
        var $levels_attr = $toc_container.attr("data-level");
        var $excludeclass_attr = $toc_container.attr("data-exclude");
        if (typeof $levels_attr != "undefined") {
          $levels = $levels_attr;
        }
        if (typeof $excludeclass_attr != "undefined") {
          $excludeclass = $excludeclass_attr.trim();
        }
      }
      $levelslist = $levels.split(",");
      $(".entry-content-wrapper")
        .find($levels)
        .each(function () {
          var headline = $(this);
          if (headline.hasClass("av-no-toc")) {
            return;
          }
          if (
            $excludeclass != "" &&
            (headline.hasClass($excludeclass) ||
              headline.parent().hasClass($excludeclass))
          ) {
            return;
          }
          var $h_id = headline.attr("id");
          var $tagname = headline.prop("tagName").toLowerCase();
          var $txt = headline.text();
          var $pos = $levelslist.indexOf($tagname);
          if (typeof $h_id == "undefined") {
            var $new_id = av_pretty_url($txt);
            headline.attr("id", $new_id);
            $h_id = $new_id;
          }
          var $list_tag =
            '<a href="#' +
            $h_id +
            '" class="avia-toc-link avia-toc-level-' +
            $pos +
            '"><span>' +
            $txt +
            "</span></a>";
          $toc_container.append($list_tag);
        });
      $(".avia-toc-smoothscroll .avia-toc-link").on("click", function (e) {
        e.preventDefault();
        var $target = $(this).attr("href");
        var $offset = 50;
        var $sticky_header = $(".html_header_top.html_header_sticky #header");
        if ($sticky_header.length) {
          $offset = $sticky_header.outerHeight() + 50;
        }
        $("html,body").animate({
          scrollTop: $($target).offset().top - $offset,
        });
      });
    });
  });
  function av_pretty_url(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "-")
      .replace(/^-+|-+$/g, "");
  }
})(jQuery);
(function ($) {
  "use strict";
  var elements = $(".has-background, .has-text-color");
  elements.each(function (i) {
    var element = $(this);
    if (
      !(
        element.hasClass("has-background") || element.hasClass("has-text-color")
      )
    ) {
      return;
    }
    var classList = element.attr("class").split(/\s+/);
    var color = "";
    var style = "";
    if (element.hasClass("has-background")) {
      $.each(classList, function (index, item) {
        item = item.trim().toLowerCase();
        if (
          0 == item.indexOf("has-col-") &&
          -1 != item.indexOf("-background-color")
        ) {
          color = item.replace("has-col-", "");
          color = color.replace("-background-color", "");
          color = color.replace(/-|[^0-9a-fA-F]/g, "");
          if (color.length == 3 || color.length == 6) {
            element.css({ "background-color": "", "border-color": "" });
            style =
              "undefined" != typeof element.attr("style")
                ? element.attr("style") + ";"
                : "";
            element.attr(
              "style",
              style +
                " background-color: #" +
                color +
                "; border-color: #" +
                color +
                ";"
            );
          }
        }
      });
    }
    if (element.hasClass("has-text-color")) {
      $.each(classList, function (index, item) {
        item = item.trim().toLowerCase();
        if (
          0 == item.indexOf("has-col-") &&
          -1 == item.indexOf("-background-color") &&
          -1 != item.indexOf("-color")
        ) {
          var color = item.replace("has-col-", "");
          color = color.replace("-color", "");
          color = color.replace(/-|[^0-9a-fA-F]/g, "");
          if (color.length == 3 || color.length == 6) {
            element.css("color", "");
            style =
              "undefined" != typeof element.attr("style")
                ? element.attr("style") + ";"
                : "";
            element.attr("style", style + " color: #" + color + ";");
          }
        }
      });
    }
  });
  elements = $('[class^="has-fs-"], [class$="-font-size"]');
  elements.each(function (i) {
    var element = $(this);
    var classList = element.attr("class").split(/\s+/);
    $.each(classList, function (index, item) {
      item = item.trim().toLowerCase();
      if (0 == item.indexOf("has-fs-") && -1 != item.indexOf("-font-size")) {
        item = item.replace("has-fs-", "");
        item = item.replace("-font-size", "");
        item = item.split("-");
        if (item.length != 2) {
          return;
        }
        var style =
          "undefined" != typeof element.attr("style")
            ? element.attr("style") + ";"
            : "";
        element.attr("style", style + " font-size:" + item[0] + item[1] + ";");
      }
    });
  });
})(jQuery);
("use strict");
(function ($) {
  var objAviaGoogleMaps = null;
  var AviaGoogleMaps = function () {
    if (
      "undefined" == typeof window.av_google_map ||
      "undefined" == typeof avia_framework_globals
    ) {
      return;
    }
    if (objAviaGoogleMaps != null) {
      return;
    }
    objAviaGoogleMaps = this;
    this.document = $(document);
    this.script_loading = false;
    this.script_loaded = false;
    this.script_source = avia_framework_globals.gmap_avia_api;
    this.maps = {};
    this.loading_icon_html =
      '<div class="ajax_load"><span class="ajax_load_inner"></span></div>';
    this.LoadAviaMapsAPIScript();
  };
  AviaGoogleMaps.prototype = {
    LoadAviaMapsAPIScript: function () {
      this.maps = $("body").find(".avia-google-map-container");
      if (this.maps.length == 0) {
        return;
      }
      var needToLoad = false;
      this.maps.each(function (index) {
        var container = $(this);
        if (
          container.hasClass("av_gmaps_show_unconditionally") ||
          container.hasClass("av_gmaps_show_delayed")
        ) {
          needToLoad = true;
          return false;
        }
      });
      if (!needToLoad) {
        return;
      }
      var cookie_check =
        $("html").hasClass("av-cookies-needs-opt-in") ||
        $("html").hasClass("av-cookies-can-opt-out");
      var allow_continue = true;
      var silent_accept_cookie = $("html").hasClass(
        "av-cookies-user-silent-accept"
      );
      if (cookie_check && !silent_accept_cookie) {
        if (
          !document.cookie.match(/aviaCookieConsent/) ||
          $("html").hasClass("av-cookies-session-refused")
        ) {
          allow_continue = false;
        } else {
          if (!document.cookie.match(/aviaPrivacyRefuseCookiesHideBar/)) {
            allow_continue = false;
          } else if (
            !document.cookie.match(/aviaPrivacyEssentialCookiesEnabled/)
          ) {
            allow_continue = false;
          } else if (document.cookie.match(/aviaPrivacyGoogleMapsDisabled/)) {
            allow_continue = false;
          }
        }
      }
      if (!allow_continue) {
        $(".av_gmaps_main_wrap").addClass("av-maps-user-disabled");
        return;
      }
      if (typeof $.AviaMapsAPI != "undefined") {
        this.AviaMapsScriptLoaded();
        return;
      }
      $("body").on(
        "avia-google-maps-api-script-loaded",
        this.AviaMapsScriptLoaded.bind(this)
      );
      this.script_loading = true;
      var script = document.createElement("script");
      script.id = "avia-gmaps-api-script";
      script.type = "text/javascript";
      script.src = this.script_source;
      document.body.appendChild(script);
    },
    AviaMapsScriptLoaded: function () {
      this.script_loading = false;
      this.script_loaded = true;
      var object = this;
      this.maps.each(function (index) {
        var container = $(this);
        if (container.hasClass("av_gmaps_show_page_only")) {
          return;
        }
        var mapid = container.data("mapid");
        if ("undefined" == typeof window.av_google_map[mapid]) {
          console.log("Map cannot be displayed because no info: " + mapid);
          return;
        }
        if (container.hasClass("av_gmaps_show_unconditionally")) {
          container.aviaMaps();
        } else if (container.hasClass("av_gmaps_show_delayed")) {
          var wrap = container.closest(".av_gmaps_main_wrap");
          var confirm = wrap.find("a.av_text_confirm_link");
          confirm.on("click", object.AviaMapsLoadConfirmed);
        } else {
          console.log(
            "Map cannot be displayed because missing display class: " + mapid
          );
        }
      });
    },
    AviaMapsLoadConfirmed: function (event) {
      event.preventDefault();
      var confirm = $(this);
      var container = confirm
        .closest(".av_gmaps_main_wrap")
        .find(".avia-google-map-container");
      container.aviaMaps();
    },
  };
  $(function () {
    new AviaGoogleMaps();
  });
})(jQuery);
