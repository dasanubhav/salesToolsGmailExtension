/* this file is the "app" file that loads the sdk and brings up the iframe */

function log() {
	console.log.apply(console, ['iframe-test'].concat(Array.prototype.slice.call(arguments)));
}

var currentEmailAddress;
var sideBarPanels = new Map();
var moleViewPanels = new Map();
var composeEmailAddress;
var enableTracking = false;
var XSRF_TOKEN;

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

function renderProfilerInThreadView(emailAddress, threadView) {
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
			iconUrl: chrome.extension.getURL("img/App_Icon_128.png"),
			appIconUrl: chrome.extension.getURL("img/App_Icon_128.png"),
			el: iframe
		});
		sideBarPanels.set(emailAddress, sideBarPanel);
	}
}

function renderProfilerInComposeView(emailAddress, sdk, composeView) {
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
		var moleViewPanel = sdk.Widgets.showMoleView({
			el: iframe,
			title: 'Oracle Sales Tools Profiler'
		});
		moleViewPanels.set(emailAddress, moleViewPanel);
	}
	
}

function renderEngage(sdk) {
	var iframe = document.createElement('iframe');
	iframe.id = 'engage';
	iframe.src = chrome.runtime.getURL('engage.html'); //load the iframe.html that is in the extension bundle
	iframe.scrolling = "yes";
	iframe.style.cssText = "border:0; width:500px; height:500px";
	iframe.onload = function() {
		iframe.contentWindow.postMessage({showEngage : true}, "*");
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
	var modal = sdk.Modal.show({
		el: iframe
	});
}

function renderProfiler(sdk) {
	var iframe = document.createElement('iframe');
	iframe.id = 'profiler';
	iframe.src = chrome.runtime.getURL('profiler.html'); //load the iframe.html that is in the extension bundle
	iframe.scrolling = "yes";
	iframe.style.cssText = "border:0; width:400px; height:500px";
	iframe.onload = function() {
		iframe.contentWindow.postMessage({showProfiler : true}, "*");
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
	var modal = sdk.Modal.show({
		el: iframe
	});
}

function renderTemplateChooser(sdk, composeView) {
	composeView.insertHTMLIntoBodyAtCursor('');
	var modal;
	var iframe = document.createElement('iframe');
	iframe.id = 'engage';
	iframe.src = chrome.runtime.getURL('engageIframe.html'); //load the iframe.html that is in the extension bundle
	iframe.scrolling = "yes";
	iframe.style.cssText = "border:0; width:600px; height:600px";
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
					composeView.setBodyHTML(event.data.email);
					composeView.setSubject(event.data.subject);
					XSRF_TOKEN = event.data.xsrfToken;
				}
			}
		}
	}
	window.addEventListener('message', modalMessageHandler, false);
	modal = sdk.Modal.show({
		el: iframe,
		title: 'Oracle Sales Tools Engage'
	});
		/*var drawerPanel = sdk.Widgets.showDrawerView({
			el: iframe,
			composeView: composeView,
			closeWithCompose: true
		});*/
}

function getActivityFeed() {
	var messages = [];
	var url = 'https://devsecure.eloquacorp.com/API/REST/2.0/assets/email/deployments/inlinereports?depth=partial&orderBy=endAtCreatedAt' + ' DESC&extensions=e10'; 
	$.ajax({
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		url: url + '&xsrfToken=' + XSRF_TOKEN,
		success: function(response, status, jqxhr) {
			if (response && response.elements && response.elements.length > 0) {
				for (var i=0; i < response.elements.length; i++) {
					var email = response.elements[i];
					if (email.id) {
						$.ajax({
							type: 'GET',
							dataType: 'json',
							contentType: 'application/json',
							url: 'https://devsecure.eloquacorp.com/API/REST/2.0/assets/email/deployment/' + email.id + '?&extensions=e10&xsrfToken=' + XSRF_TOKEN,
							success: function(response, status, jqxhr) {
								if (response && response.statistics && response.statistics.length > 0) {
									for (var j=0; j < response.statistics.length; j++) {
										if (response.statistics[j].lastOpen) {
											this.messages.push('<p>' + response.statistics[j].emailAddress + ' opened ' + response.name + ' at ' + response.statistics[j].lastOpen + '</p>');
										}
										if (response.statistics[j].lastClickThrough) {
											this.messages.push('<p>' + response.statistics[j].emailAddress + ' clicked ' + response.name + ' at ' + response.statistics[j].lastClickThrough + '</p>');
										}
									}
								}
							}.bind(this),
							error: function(jqxhr) {
							}.bind(this)
						})
					}
				}
			}
		}.bind(this),
		error: function(jqxhr) {
		}.bind(this)
	});
}

function populateExternalEmailPayload(emailAddresses, fromEmailAddress, subject, emailContent) {
	return {
		name: "External Email",
		SenderEmail: "anubhav.das@oracle.com",
		RecipientEmails: emailAddresses,
		HtmlContent: {
			type: "RawHtmlContent",
			docType: "<!DOCTYPE html>",
			Html: emailContent
		},
		SubjectLine: subject
	};
}

InboxSDK.load(1, 'sdk_GMAIL_PLUGIN_V1_7da9174976', {sidebarBeta:true}).then(function(sdk) {
	var link = document.createElement("link");
	var html = '<!DOCTYPE html><html><body><span class=eloquaemail>Address21</span><span class=eloquaemail>Company1</span><p> Sample HTML </p><img src="https://www.gstatic.com/webp/gallery3/1.png"></body></html>';
	link.href = chrome.extension.getURL("styles/gmail.css");
	link.type = "text/css";
	link.rel = "stylesheet";
	document.getElementsByTagName("head")[0].appendChild(link);
	var contentPanel;
	sdk.Toolbars.addToolbarButtonForApp({
        title: 'Engage',
        iconUrl: chrome.extension.getURL("img/App_Icon_128.png"),
        onClick: function(e) {
        	renderEngage(sdk);
        }
    });
    sdk.Toolbars.addToolbarButtonForApp({
        title: 'Profiler',
        iconUrl: chrome.extension.getURL("img/App_Icon_128.png"),
        onClick: function(e) {
        	renderProfiler(sdk);
        }
    });
	sdk.Conversations.registerMessageViewHandler(function(messageView) {
		var threadView = messageView.getThreadView();
		messageView.on('contactHover', function(event) {
			renderProfilerInThreadView(event.contact.emailAddress, threadView)
		});
	});
	sdk.Conversations.registerThreadViewHandler(function(threadView) {
		threadView.on('contactHover', function(event) {
			renderProfilerInThreadView(event.contact.emailAddress, threadView)
		});
	});
	sdk.Compose.registerComposeViewHandler(function(composeView) {
		enableTracking = false;
		composeView.addButton({
			title: "Browse Template",
			iconUrl: chrome.extension.getURL("img/App_Icon_128.png"),
			onClick: function(event) {
				renderTemplateChooser(sdk, composeView);
			},
			hasDropdown: false,
			type: "MODIFIER",
			orderHint: 0
		});
		composeView.addButton({
			title: "Enable Tracking",
			iconUrl: chrome.extension.getURL("img/App_Icon_128.png"),
			onClick: function(menu) {
				menu.dropdown.el.innerHTML = ' <br> <input class="button1" type="checkbox" value="enabled" name="enableTracking"> Enable Tracking </input> <br>';
				const button1 = menu.dropdown.el.querySelector('.button1');
				button1.addEventListener('click', function(e) {
					if (e.target.checked) {
						enableTracking = true;
					}
				});
			},
			hasDropdown: true,
			type: "MODIFIER",
			orderHint: 0
		});
		composeView.on('recipientsChanged', function(event) {
			$('.inboxsdk__compose').find('[email]').hover(function(evt) {
				if (evt.type === 'mouseenter') {
					if (evt.target.nodeName === 'SPAN') {
						if (evt.target.attributes && evt.target.attributes.email) {
							renderProfilerInComposeView(evt.target.attributes.email.value, sdk, composeView);
						}
					}
				}
			});
		});
		composeView.on('toContactAdded', function(contact) {
			if (contact) {
				$.ajax({
					type: 'GET',
					dataType: 'json',
					contentType: 'application/json',
					url: "https://devsecure.eloquacorp.com/API/data/1.0/contacts?search='C_EmailAddress=" + contact.contact.emailAddress + "*'&" + 'xsrfToken=' + XSRF_TOKEN,
					success: function(response, status, jqxhr) {
						if (response && response.elements && response.elements.length == 1) {
							$('.inboxsdk__compose').find("[email" + "=" + "'" + contact.contact.emailAddress + "'" + "]").css('background-color', '#00FF7F');
						} else {
							$('.inboxsdk__compose').find("[email" + "=" + "'" + contact.contact.emailAddress + "'" + "]").css('background-color', '#FF4500');
						}
					},
					error: function(jqxhr) {
					}
				});
			}
		});
		composeView.on('presending', function(event) {
			if (enableTracking) {
				var subj = composeView.getSubject();
				var html = composeView.getHTMLContent();
				var fromContact = composeView.getFromContact();
				var toContacts = composeView.getToRecipients();
				var bccContacts = composeView.getBccRecipients();
				var ccContacts = composeView.getCcRecipients();
				var url = 'https://devsecure.eloquacorp.com/API/REST/2.0/assets/email/external'; 
				var emailAddresses = [];
				for (var i=0; i < toContacts.length; i++) {
					emailAddresses.push(toContacts[i].emailAddress);
				}
				for (var j=0; j < bccContacts.length; j++) {
					emailAddresses.push(bccContacts[j].emailAddress);
				}
				for (var k=0; k < ccContacts.length; k++) {
					emailAddresses.push(ccContacts[k].emailAddress);
				}
				emailAddresses.join(",");
				var externalEmailData = populateExternalEmailPayload(emailAddresses, fromContact.emailAddress, subj, html);
				$.ajax({
					type: 'POST',
					data: JSON.stringify(externalEmailData),
					dataType: 'json',
					contentType: 'application/json',
					url: url + '?xsrfToken=' + XSRF_TOKEN,
					success: function(response, status, jqxhr) {
						composeView.setBodyHTML(response.HtmlContent.html);
						debugger;
						console.log('Created external email successfully');
					},
					error: function(jqxhr) {
						console.log('Error creating external email');
					}
				});
			}
			
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