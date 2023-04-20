(function () {
    var html = document.getElementsByTagName('html')[0];
    var cookie_check = html.className.indexOf('av-cookies-needs-opt-in') >= 0 || html.className.indexOf('av-cookies-can-opt-out') >= 0;
    var allow_continue = true;
    var silent_accept_cookie = html.className.indexOf('av-cookies-user-silent-accept') >= 0;
    if (cookie_check && !silent_accept_cookie) {
        if (!document.cookie.match(/aviaCookieConsent/) || html.className.indexOf('av-cookies-session-refused') >= 0) {
            allow_continue = false;
        }
        else {
            if (!document.cookie.match(/aviaPrivacyRefuseCookiesHideBar/)) {
                allow_continue = false;
            }
            else if (!document.cookie.match(/aviaPrivacyEssentialCookiesEnabled/)) {
                allow_continue = false;
            }
            else if (document.cookie.match(/aviaPrivacyGoogleWebfontsDisabled/)) {
                allow_continue = false;
            }
        }
    }
    if (allow_continue) {
        var f = document.createElement('link');

        f.type = 'text/css';
        f.rel = 'stylesheet';
        f.href = '//fonts.googleapis.com/css?family=Lora%7COpen+Sans:400,600&display=auto';
        f.id = 'avia-google-webfont';

        document.getElementsByTagName('head')[0].appendChild(f);
    }
})();