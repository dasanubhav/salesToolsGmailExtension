/* this file is the "app" file that loads the sdk and brings up the iframe */

function log() {
	console.log.apply(console, ['iframe-test'].concat(Array.prototype.slice.call(arguments)));
}

var currentEmailAddress;
InboxSDK.load(1, 'sdk_GMAIL_PLUGIN_V1_7da9174976', {sidebarBeta:true}).then(function(sdk) {
	var link = document.createElement("link");
	link.href = chrome.extension.getURL("styles/gmail.css");
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
	var contentPanel;
	sdk.Conversations.registerMessageViewHandler(function(messageView) {
		var threadView = messageView.getThreadView();
		messageView.on('contactHover', function(event) {
			if (contentPanel) {
				contentPanel.remove();
			}
			console.log('Called from messageView: ' + event);
			if (event.contact.emailAddress) {
				currentEmailAddress = event.contact.emailAddress;
				var iframe = document.createElement('iframe');
				iframe.id = 'profiler';
				iframe.src = chrome.runtime.getURL('iframe.html'); //load the iframe.html that is in the extension bundle
				iframe.scrolling = "yes";
				iframe.style.cssText = "border:0; width:320px; height:500px";
				iframe.onload = function() {
					iframe.contentWindow.postMessage({emailAddress : event.contact.emailAddress}, "*");
				};
				function modalMessageHandler(event) {
					if (event.origin.match(/^chrome-extension:\/\//)) {
					//make sure that the message is coming from an extension and you can get more strict that the
					//extension id is the same as your public extension id
					    if (event.data === 'close') {
					    	console.log('got close event from iframe');
					    	//modal.close();
					    }
					}
				}
				window.addEventListener('message', modalMessageHandler, false);
				var el = document.createElement("div");
				el.innerHTML = iframe;
				contentPanel = threadView.addSidebarContentPanel({
					id: 'sample sidebar',
					title: 'Oracle Sales Tools Profiler',
					el: iframe
				});
			}
		});
	});
	/*sdk.Compose.registerComposeViewHandler(function(composeView) {
		composeView.addButton({
			title: "iframe test",
			type: 'MODIFIER',
			onClick: function() {
				var iframe = document.createElement('iframe');
				iframe.onload = function() {
					iframe.contentWindow.postMessage("greeting", "*");
				};
				function modalMessageHandler(event) {
					if (event.origin.match(/^chrome-extension:\/\//)) {
					  //make sure that the message is coming from an extension and you can get more strict that the
					  //extension id is the same as your public extension id
						if (event.data === 'close') {
							console.log('got close event from iframe');
							//modal.close();
						}
					}
				}
				window.addEventListener('message', modalMessageHandler, false);
				iframe.src = chrome.runtime.getURL('iframe.html'); //load the iframe.html that is in the extension bundle
				iframe.style.width = "660px"; //other iframe options
				iframe.style.height = "600px";

				var modal = sdk.Modal.show({
					el: iframe
				});
				modal.on('destroy', function() {
					window.removeEventListener('message', modalMessageHandler, false);
				});
			}
		});
	});*/
});