$(document).ready(()=>{

  // console.log("scripts.js loaded!");

  var msg = getUrlParameter('msg');
  // Only interested in loginSuccess....
  // User doesn't need to Register or Login once logged in
  if (msg == 'loginSuccess') {
    console.log('OK...take action on loginSuccess');
    sessionStorage.setItem('isLoggedIn', 'true');
  };

  if (sessionStorage.getItem('isLoggedIn') == 'true') {
    $('#register').remove();
    $('#login').remove();
  };

}); // docment.ready

// thanks to David Walsh for this function!
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
