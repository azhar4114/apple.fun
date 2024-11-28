function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/"
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null
}

function checkKeyValidation() {
    const key = getCookie('activationKey');
    if (window.location.pathname === "/brochure.html")
        return;
    getUserIP(function(ip) {
        console.log(ip, key, "click");
        if (ip) {
            validateKeyWithRateLimit(key, ip, )
        } else {
            console.log('Could not fetch IP address.')
        }
    })
}

function isAndroidWebViewOrSmartTV() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isWebView = /(wv|webview)/.test(userAgent);
    const isSmartTV = /smart-tv|smarttv|appletv|googletv|hbbtv|netcast|viera|tizen|webos|sonydtv|firetv/.test(userAgent);
    const isMobile = /android|iphone|ipad|ipod|blackberry|bb|playbook|silk|opera mini|windows phone|iemobile/.test(userAgent);
    const isLaptopOrPC = !isMobile && !isSmartTV && !isAndroid && !isWebView;
    if (isAndroid && isWebView) {
        return 'Android WebView'
    } else if (isSmartTV) {
        return 'Smart TV'
    } else if (isMobile) {
        return 'Mobile Device'
    } else if (isLaptopOrPC) {
        return 'Laptop or PC'
    } else {
        return 'Other'
    }
}
const deviceType = isAndroidWebViewOrSmartTV();
window.onload = function() {
    if (deviceType === 'Android WebView') {
        console.log("Content is being rendered on Android WebView.")
		checkKeyValidation()
    } else {
        console.log("Content is being rendered on ", deviceType);
        checkKeyValidation()
    }
    initializeSettings();
}

function getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = 'device-' + Math.random().toString(36).substr(2, 16);
        localStorage.setItem('deviceId', deviceId)
    }
    return deviceId
}

function changeBackground(backgroundImages) {
            // Generate a random index
            const randomIndex = Math.floor(Math.random() * backgroundImages.length);

            // Set the background image
            if(settings.backgroundEnabled)
            document.body.style.backgroundImage = 'url("images/'+backgroundImages[randomIndex]+'")' ;
}
		
const cacheTTL = 19 * 60 * 60 * 1000;

function validateKeyWithRateLimit(key, ipAddress) {
    const data = new URLSearchParams();
    data.append('key', key);
    data.append('action', "validate");
    data.append('deviceId', getDeviceId());
    data.append('ip', ipAddress);
    data.append('url', window.location.href);
	var k = window.location.href.match(/\/([\w-]+)(?:\.html)/),ky,cd;
	if(k==null)
	  ky="index";
	else if (k!=null && k[1]!=null)
	  ky = k[1];
    console.log("sending request", data);
	const cachedData = localStorage.getItem(ky);
	if(cachedData)
		cd = JSON.parse(cachedData)
    
	const now = new Date().getTime();
    
	    // Check if data exists and hasn't expired
	if (cachedData && cd.cacheExpiry && now < parseInt(cd.cacheExpiry, 10)) {
	     console.log('Using cached data');
	     passData(JSON.parse(cachedData));
	} else {
	        console.log('Fetching new data from the server');
    sendReq(data, function(resp) {
        console.log(resp);
        if (resp && resp.status === "success") {
            if (window.location.pathname === "/brochure.html")
                window.location.pathname = "/"
			resp.cacheExpiry = now + cacheTTL;
			localStorage.setItem(ky, JSON.stringify(resp));
			passData(resp);
			
        } else {
            if (window.location.pathname !== "/brochure.html") {
                document.body.remove();
                window.location.href = "/brochure.html"
            }
        }
    })
}
}

function passData(resp){
	if(resp.data!=null){
	var s =angular.element("#controller").scope();
	s.$apply(function(){
		s.initiate(resp.data);
	});
	if(resp.data.bg && resp.data.bg.length>0)
		changeBackground(resp.data.bg);
	setTimeout(attachListeners,500);
    }
}

function sendReq(req, callback) {
    const url = 'https://script.google.com/macros/s/AKfycbzCva51LDrstiplGk68iIy-ETx4OCoBo2bzqrRyGzndH4V3ypZz8av46bT5pxlXEHz7/exec';
    var date = new Date();
    req.append('TS', date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + "." + ("0" + date.getMinutes()).slice(-2) + "." + ("0" + date.getSeconds()).slice(-2));
    console.log("sending request", req);
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: req
    }).then(response => response.json()).then(data => {
        callback(data)
    }).catch(error => {
        console.error('Error:', error)
    })
}

function getUserIP(callback) {
    fetch('https://api.ipify.org?format=json').then(response => response.json()).then(data => {
        callback(data.ip)
    }).catch(error => {
        console.error('Error fetching IP:', error);
        callback(null)
    })
}

// Store the settings in localStorage
const settings = {
    backgroundEnabled: false,
    animationsEnabled: false
  };
  
  // Initialize settings from localStorage
  function initializeSettings() {
    const storedSettings = JSON.parse(localStorage.getItem('siteSettings'));
    if (storedSettings) {
      settings.backgroundEnabled = storedSettings.backgroundEnabled;
      settings.animationsEnabled = storedSettings.animationsEnabled;
    }
    if(location.pathname=="/" || location.pathname=="/index.html"){
        document.getElementById('toggle-background').checked = settings.backgroundEnabled;
        document.getElementById('toggle-animations').checked = settings.animationsEnabled;
    }
    applySettings();
  }
  
  // Toggle settings popup visibility
  function toggleSettingsPopup() {
    document.getElementById('settings-popup').classList.toggle('hidden');
  }
  
  // Close settings popup
  function closeSettingsPopup() {
    document.getElementById('settings-popup').classList.add('hidden');
  }
  
  // Toggle background image
  function toggleBackground() {
    settings.backgroundEnabled = document.getElementById('toggle-background').checked;
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    applySettings();
    location.reload();
  }
  
  // Toggle animations
  function toggleAnimations() {
    settings.animationsEnabled = document.getElementById('toggle-animations').checked;
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    applySettings();
  }

  function toggleConfetti() {
    settings.confettiEnabled = document.getElementById('toggle-confetti').checked;
    localStorage.setItem('siteSettings', JSON.stringify(settings));
  }

  function toggletoggleBgAnimations() {
    settings.bgAnimationEnabled = document.getElementById('toggle-bg-motion').checked;
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    applySettings();
  }
  
  // Apply settings dynamically
  function applySettings() {
    if (settings.backgroundEnabled) {
      //document.body.style.backgroundImage = 'url("background.jpg")'; // Replace with your image path
      //location.reload();
    } else {
      document.body.style.backgroundImage = 'none';
    }
  
    if (!settings.animationsEnabled) {
      document.body.classList.add('no-animations'); // Add an animation class
    } else {
      document.body.classList.remove('no-animations');
    }

    if (!settings.bgAnimationEnabled) {
        document.body.classList.add('no-bg-animations'); // Add an animation class
      } else {
        document.body.classList.remove('no-bg-animations');
      }
  }
  
  
  