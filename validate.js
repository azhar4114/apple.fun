// Function to set a cookie
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 60 * 60 * 1000)); // Cookie expiration time
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/"; // Cookie accessible across all pages
}

// Function to get a cookie by name
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to check if the key has already been validated
function checkKeyValidation() {
    
    const key = getCookie('activationKey');
    if(window.location.pathname === "/brochure.html")
	return;
     
    
  	getUserIP(function(ip) {
  	console.log(ip,key,"click");
	    if (ip) {
	        validateKeyWithRateLimit(key,ip,);
	    } else {
	        console.log('Could not fetch IP address.');
	    }
	});
}

function detectDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();

    // Check for Android WebView
    const isAndroid = /android/.test(userAgent);
    const isWebView = /(wv|webview)/.test(userAgent);

    // Check for Smart TV
    const isSmartTV = /smart-tv|smarttv|appletv|googletv|hbbtv|netcast|viera|tizen|webos|sonydtv|firetv/.test(userAgent);

    // Check for Mobile Device
    const isMobile = /android|iphone|ipad|ipod|blackberry|bb|playbook|silk|opera mini|windows phone|iemobile/.test(userAgent);

    // Check for Laptop or PC
    const isLaptopOrPC = !isMobile && !isSmartTV && !isAndroid && !isWebView;

    if (isAndroid && isWebView) {
        return 'Android WebView';
    } else if (isSmartTV) {
        return 'Smart TV';
    } else if (isMobile) {
        return 'Mobile Device';
    } else if (isLaptopOrPC) {
        return 'Laptop or PC';
    } else {
        return 'Other';
    }
}

const deviceType = isAndroidWebViewOrSmartTV();






window.onload = function() {

   if (deviceType === 'Android WebView') {
       console.log("Content is being rendered on Android WebView.");
       
   } else {
       console.log("Content is being rendered on ", deviceType);
       checkKeyValidation();
   } 
  
}


function getDeviceId() {
  // Example: Use localStorage to generate/store a unique ID for the device
  
  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    deviceId = 'device-' + Math.random().toString(36).substr(2, 16); // Example of generating a unique ID
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}


// Modified validation function to accept IP
function validateKeyWithRateLimit(key, ipAddress) {
    const data = new URLSearchParams();
    data.append('key', key);
	data.append('action', "validate");
	data.append('deviceId',getDeviceId());
    data.append('ip', ipAddress); 
	console.log("sending request",data);
    sendReq(data,function(resp){
	   console.log(resp);
	   if(resp && resp.status ==="success"){ 
	   if(window.location.pathname === "/brochure.html")
	       window.location.pathname = "/";
         
     else{
	    document.body.remove(); 
	if(window.location.pathname !== "/brochure.html")
	         window.location.href = "/brochure.html";
	   
     }
	});
}

function sendReq(req, callback) {
    const url = 'https://script.google.com/macros/s/AKfycbzCva51LDrstiplGk68iIy-ETx4OCoBo2bzqrRyGzndH4V3ypZz8av46bT5pxlXEHz7/exec';
    
	console.log("sending request",req);
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: req
    })
    .then(response => response.json())
    .then(data => {
        callback(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getUserIP(callback) {
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            callback(data.ip);
        })
        .catch(error => {
            console.error('Error fetching IP:', error);
            callback(null);
        });
}

