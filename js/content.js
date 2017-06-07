/* this file is the "app" file that loads the sdk and brings up the iframe */

function log() {
	console.log.apply(console, ['iframe-test'].concat(Array.prototype.slice.call(arguments)));
}

var currentEmailAddress;
var sideBarPanels = new Map();
var moleViewPanels = new Map();
var composeEmailAddress;

function _checkIfViewExists(views, emailAddress) {
	var view;
	if (views && views.size > 0) {
		if (views.has(emailAddress)) {
			return true;
		} else {
			view = views.values().next().value;
			var lastEmailAddress = views.keys().next().value;
			if (view) {
				if (view.remove) {
					view.remove();
				} else if (view.close) {
					view.close();
				}
			}
			views.delete(lastEmailAddress);
		}
	}
	return false;
}

function renderProfiler(emailAddress, threadView) {
	if (!_checkIfViewExists(sideBarPanels, emailAddress)) {
		var iframe = document.createElement('iframe');
		iframe.id = 'profiler';
		iframe.src = chrome.runtime.getURL('profilerIframe.html'); //load the iframe.html that is in the extension bundle
		iframe.scrolling = "yes";
		iframe.style.cssText = "border:0; width:400px; height:500px";
		iframe.onload = function() {
			iframe.contentWindow.postMessage({emailAddress : emailAddress}, "*");
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
		var sideBarPanel = threadView.addSidebarContentPanel({
			id: 'sample sidebar',
			title: 'Oracle Sales Tools Profiler',
			el: iframe
		});
		sideBarPanels.set(emailAddress, sideBarPanel);
	}
}

function renderModal(emailAddress, sdk, composeView) {
	if (!_checkIfViewExists(moleViewPanels, emailAddress)) {
		var iframe = document.createElement('iframe');
		iframe.id = 'profiler';
		iframe.src = chrome.runtime.getURL('profilerIframe.html'); //load the iframe.html that is in the extension bundle
		iframe.scrolling = "yes";
		iframe.style.cssText = "border:0; width:400px; height:500px";
		iframe.onload = function() {
			iframe.contentWindow.postMessage({emailAddress : emailAddress}, "*");
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
		/*var modal = sdk.Modal.show({
			el: iframe
		});*/
		/*var drawerPanel = sdk.Widgets.showDrawerView({
			el: iframe,
			composeView: composeView,
			closeWithCompose: true
		});*/
		var moleViewPanel = sdk.Widgets.showMoleView({
			el: iframe
		});
		moleViewPanels.set(emailAddress, moleViewPanel);
	}
	
}

function renderTemplateChooser(sdk, composeView) {
	composeView.insertHTMLIntoBodyAtCursor('');
	var modal;
	var iframe = document.createElement('iframe');
	iframe.id = 'engage';
	iframe.src = chrome.runtime.getURL('engageIframe.html'); //load the iframe.html that is in the extension bundle
	iframe.scrolling = "yes";
	iframe.style.cssText = "border:0; width:400px; height:500px";
	iframe.onload = function() {
		iframe.contentWindow.postMessage({fromGmail : true}, "*");
	};
	function modalMessageHandler(event) {
		if (event.origin.match(/^chrome-extension:\/\//)) {
			//make sure that the message is coming from an extension and you can get more strict that the
			//extension id is the same as your public extension id
			if (event.data === 'close') {
			    console.log('got close event from iframe');
			    	//modal.close();
			} else if (event.data.email) {
				if (modal) {
					modal.close();
					composeView.insertHTMLIntoBodyAtCursor(event.data.email);
					composeView.setSubject(event.data.subject);
				}
			}
		}
	}
	window.addEventListener('message', modalMessageHandler, false);
	modal = sdk.Modal.show({
		el: iframe
	});
		/*var drawerPanel = sdk.Widgets.showDrawerView({
			el: iframe,
			composeView: composeView,
			closeWithCompose: true
		});*/
}

InboxSDK.load(1, 'sdk_GMAIL_PLUGIN_V1_7da9174976', {sidebarBeta:true}).then(function(sdk) {
	var link = document.createElement("link");
	var html = '<!DOCTYPE html><html><body><span class=eloquaemail>Address21</span><span class=eloquaemail>Company1</span><p> Sample HTML </p><img src="https://www.gstatic.com/webp/gallery3/1.png"></body></html>';
	link.href = chrome.extension.getURL("styles/gmail.css");
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
	var contentPanel;
	sdk.Conversations.registerMessageViewHandler(function(messageView) {
		var threadView = messageView.getThreadView();
		messageView.on('contactHover', function(event) {
			renderProfiler(event.contact.emailAddress, threadView)
		});
	});
	sdk.Conversations.registerThreadViewHandler(function(threadView) {
		threadView.on('contactHover', function(event) {
			renderProfiler(event.contact.emailAddress, threadView)
		});
	});
	sdk.Compose.registerComposeViewHandler(function(composeView) {
		composeView.addButton({
			title: "Browse Template",
			iconUrl: 'https://example.com/foo.png',
			onClick: function(event) {
				renderTemplateChooser(sdk, composeView);
			},
			hasDropdown: false,
			type: "MODIFIER",
			orderHint: 0
		});
		composeView.on('recipientsChanged', function(event) {
			$('.inboxsdk__compose').find('[email]').hover(function(evt) {
				if (evt.type === 'mouseenter') {
					if (evt.target.nodeName === 'SPAN') {
						if (evt.target.attributes && evt.target.attributes.email) {
							console.log(evt.target.attributes.email.value);
							renderModal(evt.target.attributes.email.value, sdk, composeView);
						}
					}
				}
			});
		});
		/*composeView.addButton({
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
		});*/
	});
});