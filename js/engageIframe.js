/* 
this script is in the bundle and gets loaded by iframe.html
it acts as a bridge between the extension javascript and the actual remote iframe 
we want to load
*/
function main(fromGmail) {
  var iframe = document.createElement('iframe');
  iframe.id = 'embedded-engage';
  iframe.src = 'https://apps.devsecure.eloquacorp.com/salesTools/engage/compose?fromGmail=true'; //set the url of the remote iframe here
  iframe.scrolling = "yes";
  iframe.style.cssText = "border:0; width:400px; height:500px";
  iframe.onload = function() {
    iframe.contentWindow.postMessage("greeting", 'https://apps.devsecure.eloquacorp.com/salesTools/engage');
  };

  window.addEventListener('message', function(event) {
    //verify message is from an origin we trust
    if (event.data === 'close' && event.origin === 'https://apps.devsecure.eloquacorp.com/salesTools/engage') {
      // The remote iframe said to close, so relay that upwards.
      window.parent.postMessage('close', parentOrigin);
    }
    else if (event.data.email) {
      window.parent.postMessage({email : event.data.email, subject : event.data.subject}, parentOrigin);
    }
  }, false);
  //console.log(currentEmailAddress);
  

  document.body.appendChild(iframe);
  debugger;
}

var parentOrigin;

window.addEventListener('message', function greetingHandler(event) {
  // This iframe only allows a gmail page to talk to it. Note that other pages
  // on the internet could create an iframe with a url to this page and work for
  // people with this extension installed, so this check is still important.
  if (event.data && event.data.fromGmail && event.origin.match(/^https:\/\/\w+\.google\.com$/)) {
    window.removeEventListener('message', greetingHandler, false);
    parentOrigin = event.origin;
    main(event.data.fromGmail);
  }
}, false);