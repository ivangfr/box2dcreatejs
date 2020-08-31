//Namespace
this.MyGameBuilder = this.MyGameBuilder || {};

(function () {

	MyGameBuilder.BrowserOSHandler = BrowserOSHandler;
	
	//Constructor
	function BrowserOSHandler() {
		initialize(this);
	}
	
	function initialize(browserOSHandler) {
		var browser, os, version,
		ua = window.navigator.userAgent,
		platform = window.navigator.platform;
	
		if ( /MSIE/.test(ua) ) {
			browser = 'Internet Explorer';
			if ( /IEMobile/.test(ua) ) {
				browser += ' Mobile';
			}
			version = /MSIE \d+[.]\d+/.exec(ua)[0].split(' ')[1];
		} else if ( /Chrome/.test(ua) ) {
			browser = 'Chrome';
			version = /Chrome\/[\d\.]+/.exec(ua)[0].split('/')[1];
		} else if ( /Opera/.test(ua) ) {
			browser = 'Opera';
			if ( /mini/.test(ua) ) {
				browser += ' Mini';
			} else if ( /Mobile/.test(ua) ) {
				browser += ' Mobile';
			}
		} else if ( /Android/.test(ua) ) {
			browser = 'Android Webkit Browser';
			mobile = true;
			os = /Android\s[\.\d]+/.exec(ua);
		} else if ( /Firefox/.test(ua) ) {
			browser = 'Firefox';
			if ( /Fennec/.test(ua) ) {
				browser += ' Mobile';
			}
			version = /Firefox\/[\.\d]+/.exec(ua)[0].split('/')[1];
		} else if ( /Safari/.test(ua) ) {
			browser = 'Safari';
			if ( (/iPhone/.test(ua)) || (/iPad/.test(ua)) || (/iPod/.test(ua)) ) {
				os = 'iOS';
			}
		}
		if ( !version ) {
			version = /Version\/[\.\d]+/.exec(ua);
			if (version) {
				version = version[0].split('/')[1];
			} else {
				version = /Opera\/[\.\d]+/.exec(ua)[0].split('/')[1]
			}
		}
		if ( platform === 'MacIntel' || platform === 'MacPPC' ) {
			os = 'Mac OS X ' + /10[\.\_\d]+/.exec(ua)[0];
			if ( /[\_]/.test(os) ) {
				os = os.split('_').join('.');
			}
		} else if ( platform === 'Win32' ) {
			os = 'Windows 32 bit';
		} else if ( platform == 'Win64' ) {
			os = 'Windows 64 bit';
		} else if ( !os && /Linux/.test(platform) ) {
			os = 'Linux';
		} else if ( !os && /Windows/.test(ua) ) {
			os = 'Windows';
		}
		
		browserOSHandler.getBrowserName = function() {
			return browser;
		}
		
		browserOSHandler.getBrowserVersion = function() {
			return version;
		}
		
		browserOSHandler.getOS = function() {
			return os;
		}
	}
	
}());