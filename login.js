function handleCredentialResponse(response) {
  const responsePayload = decodeJwtResponse(response.credential);

  // Show user information
  document.getElementById('signout-button').classList.remove('hidden');
  document.getElementById('avatar').classList.remove('hidden');
  document.getElementById('avatar').src = responsePayload.picture;
  
  // Hide the sign-in button
  document.querySelector('.g_id_signin').classList.add('hidden');

  localStorage.setItem('profile', JSON.stringify(responsePayload));
  localStorage.setItem('id_token', response.credential);
}

function handleCredentialResponseAndroid(response) {
    const responsePayload = response.profile;
    
    // Show user information
    document.getElementById('signout-button').classList.remove('hidden');
    document.getElementById('avatar').classList.remove('hidden');
    document.getElementById('avatar').src = responsePayload.picture;

    // Hide the sign-in button
    document.querySelector('.g_id_signin').classList.add('hidden');

    localStorage.setItem('profile', JSON.stringify(responsePayload));
    localStorage.setItem('id_token', response.credential);
  }

function decodeJwtResponse(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

function signInAndroid(){
	Android.signIn();
}


function signOut() {
  // Hide user information
  document.getElementById('signout-button').classList.add('hidden');
  document.getElementById('avatar').classList.add('hidden');
  document.getElementById('avatar').src = '';
  
  // Show the sign-in button
  document.querySelector('.g_id_signin').classList.remove('hidden');
  localStorage.removeItem('profile');
  localStorage.removeItem('id_token');
  if (isWebView()) {
	Android.signOut();  
  }
}

// Listen for the Google Sign-In button to render
window.onload = function() {
	
      const profile = JSON.parse(localStorage.getItem('profile'));

      if (profile) {
	      console.log("logged in ");
        // User is logged in
        document.getElementById('signout-button').classList.remove('hidden');
        document.getElementById('avatar').classList.remove('hidden');
        document.getElementById('avatar').src = profile.picture;

        // Hide the sign-in button
        document.querySelector('.g_id_signin').classList.add('hidden');
      } else if (!isWebView()) {
        // User is not logged in, initialize Google One Tap
	       console.log("not logged in ");
        google.accounts.id.initialize({
          client_id: '1064268900675-peshhtvvlhnhqlbcmf1vqk57a37h8elm.apps.googleusercontent.com',
          callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
          document.querySelector('.g_id_signin'),
          { theme: 'outline', size: 'large' }  // customization attributes
        );
        google.accounts.id.prompt(); // Display the One Tap prompt
      }
      else{
	     document.getElementById('android-sign-in').classList.remove('hidden'); 
	     document.querySelector('.g_id_signin').classList.add('hidden');
      }
}

function isWebView() {
  // Check if the user agent indicates a webview
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isAndroidWebView = /wv/.test(userAgent);
  const isIOSWebView = /iPhone|iPod|iPad.*AppleWebKit(?!.*Safari)/i.test(userAgent);

  // Check for additional webview-specific features
  const isAndroidWebViewFeature = window.navigator.platform === 'Linux armv8l' || window.navigator.platform === 'Linux aarch64';
  const isIOSWebViewFeature = window.webkit && window.webkit.messageHandlers;

  return isAndroidWebView || isIOSWebView || isAndroidWebViewFeature || isIOSWebViewFeature;
}

