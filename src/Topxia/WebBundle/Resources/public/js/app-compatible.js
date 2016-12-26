define(function(require, exports, module) {
    window.$ = window.jQuery = require('jquery');
    require('bootstrap');
    require('common/bootstrap-modal-hack2');
    require("placeholder");
    require('./util/card');
    var Swiper = require('swiper');
    var Cookie = require('cookie');

    exports.load = function(name) {
        if (window.app.jsPaths[name.split('/', 1)[0]] == undefined) {
            name = window.app.basePath + '/bundles/topxiaweb/js/controller/' + name;
        }

        seajs.use(name, function(module) {
            if ($.isFunction(module.run)) {
                module.run();
            }
        });

    };

    exports.loadScript = function(scripts) {
        for (var index in scripts) {
            exports.load(scripts[index]);
        }

    }

    window.app.load = exports.load;
    
    if (app.themeGlobalScript) {
        exports.load(app.themeGlobalScript);
    }

    if (app.controller) {
        exports.load(app.controller);
    }

    if (app.scripts) {
        exports.loadScript(app.scripts);
    }

    $(document).ajaxError(function(event, jqxhr, settings, exception) {
        if (jqxhr.responseText === 'LoginLimit') {
            location.href = '/login';
        }
        var json = jQuery.parseJSON(jqxhr.responseText);
        error = json.error;
        if (!error) {
            return;
        }

        if (error.name == 'Unlogin') {
            var ua = navigator.userAgent.toLowerCase();
            if (ua.match(/MicroMessenger/i) == "micromessenger" && $('meta[name=is-open]').attr('content') != 0) {
                window.location.href = '/login/bind/weixinmob?_target_path='+location.href;
            } else {
                var $loginModal = $("#login-modal");
                $('.modal').modal('hide');
                $loginModal.modal('show');
                $.get($loginModal.data('url'), function(html){
                    $loginModal.html(html);
                });
            }
        }
    });

    if ($('html').hasClass('lt-ie8')) {
        var message = '<div class="alert alert-warning" style="margin-bottom:0;text-align:center;">';
        message += Translator.trans('由于您的浏览器版本太低，将无法正常使用本站点，请使用最新的');
        message += '<a href="http://windows.microsoft.com/zh-CN/internet-explorer/downloads/ie" target="_blank">'+Translator.trans('IE浏览器')+'</a>、';
        message += '<a href="http://www.baidu.com/s?wd=%E8%B0%B7%E6%AD%8C%E6%B5%8F%E8%A7%88%E5%99%A8" target="_blank">'+Translator.trans('谷歌浏览器')+'</a>'+'<strong>'+'('+Translator.trans('推荐')+')'+'</strong>、';
        message += '<a href="http://firefox.com.cn/download/" target="_blank">'+Translator.trans('Firefox浏览器')+'</a>'+'，'+Translator.trans('访问本站。');
        message += '</div>';

        $('body').prepend(message);
    }

    $(document).ajaxSend(function(a, b, c) {
        if (c.type == 'POST') {
            b.setRequestHeader('X-CSRF-Token', $('meta[name=csrf-token]').attr('content'));
        }
    });

    if (app.scheduleCrontab) {
        $.post(app.scheduleCrontab);
    }

    $("i.hover-spin").mouseenter(function() {
        $(this).addClass("md-spin");
    }).mouseleave(function() {
        $(this).removeClass("md-spin");
    });

    if ($(".set-email-alert").length > 0) {
        $(".set-email-alert .close").click(function() {
            Cookie.set("close_set_email_alert", 'true');
        });
    }

    if ($(".announcements-alert").length > 0) {

        if ($('.announcements-alert .swiper-container .swiper-wrapper').children().length > 1) {
            var noticeSwiper = new Swiper('.alert-notice .swiper-container', {
                speed: 300,
                loop: true,
                mode: 'vertical',
                autoplay: 5000,
                calculateHeight: true
            });
        }

        $(".announcements-alert .close").click(function() {
            Cookie.set("close_announcements_alert", 'true', {
                path: '/'
            });
        });
    }

   	if(!navigator.userAgent.match(/(iPhone|iPod|Android|ios|iPad)/i)){
	    $("li.nav-hover").mouseenter(function(event) {
	        $(this).addClass("open");
	    }).mouseleave(function(event) {
	        $(this).removeClass("open");
	    });

	} else {
        $("li.nav-hover >a").attr("data-toggle","dropdown");
	}

    if ($('.es-wrap [data-toggle="tooltip"]').length > 0) {
        $('.es-wrap [data-toggle="tooltip"]').tooltip({
            container: 'body'
        });
    }

    $(".js-search").focus(function() {
        $(this).prop("placeholder", "").addClass("active");
    }).blur(function() {
        $(this).prop("placeholder", Translator.trans('搜索')).removeClass("active");
    });

    if ($(".nav.nav-tabs").length > 0 && !navigator.userAgent.match(/(iPhone|iPod|Android|ios|iPad)/i)) {
        require('jquery.lavalamp');
        $(".nav.nav-tabs").lavaLamp();
    }

    $("select[name='language']").change(function() {
        Cookie.set("locale", $('select[name=language]').val(),{'path':'/'});
        $("select[name='language']").parents('form').trigger('submit');
    });

});
