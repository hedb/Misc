


if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}



  // Client ID and API key from the Developer Console
  var CLIENT_ID = '762002553531-vcte9ok5tgbhrt9v53626o20rovi5e1u.apps.googleusercontent.com';
  var API_KEY = 'AIzaSyB2pSwubu0w8pk2OJPCkseRFJAhhIiue_I';

  // Array of API discovery doc URLs for APIs used by the quickstart
  var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  var SCOPES = "https://www.googleapis.com/auth/spreadsheets";



inner_page_context_script = function() {
	s1 = "x";
	s2 = "y";
	alert ( s1 + gapi.toString() + s2 );
}


function loading_script_to_page_context() {

	var script = document.createElement('script');
	script.type= 'text/javascript';
	function_str = "f1 = " + inner_page_context_script.toString() + "; f1(); "
	script.innerHTML = function_str
	document.head.appendChild(script); //or something of the likes

}


  function load_G_API(continueFunc) {
	console.log("[load_G_API]");

// Issue :
//	https://stackoverflow.com/questions/29433744/gapi-is-not-defined
//	https://stackoverflow.com/questions/41012489/using-gmail-api-in-chrome-extension-in-content-scripts

	var script = document.createElement('script');
	script.onload = function () {
			console.log("[api.js script.onload]");

			loading_script_to_page_context()

			try {
				//debugger
					gapi.load('client:auth2',
							{
								'callback' : function(obj) {
						//debugger
									try {
										initClient(continueFunc);
									}
									catch (err) {
										console.log(err)
									}
								},
							'onerror': function(obj) {
						debugger
								console.log(obj)
							}
						}
					);
				}
				catch (err) {
					console.log(err);
		}
	};
	script.src = 'https://apis.google.com/js/api.js';
	document.head.appendChild(script); //or something of the likes




  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient(continueFunc) {
	console.log("[initClient]");

	gapi.client.init({
	  apiKey: API_KEY,
	  clientId: CLIENT_ID,
	  discoveryDocs: DISCOVERY_DOCS,
	  scope: SCOPES
	}).then(function () {
	  // Listen for sign-in state changes.
	  gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

	  // Handle the initial sign-in state.
	  updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

	  continueFunc();

	}, function(error) {
	  console.log(JSON.stringify(error, null, 2));
	});
  }



  function updateSigninStatus(isSignedIn) {
	console.log("[updateSigninStatus] isSignedIn=" + isSignedIn);

	if (isSignedIn) {
	} else {
		console.log("[updateSigninStatus] Signing In");
		gapi.auth2.getAuthInstance().signIn();
	}
  }







function get_next_link() {
	var ret = null;
	//debugger

	if (document.getElementsByClassName("blogbody")[1]) {
		var link_list = document.getElementsByClassName("blogbody")[1].getElementsByTagName('a');
		var candidate_link = link_list[link_list.length-1]
		if (candidate_link.href.startsWith('https://searchdns.netcraft.com/?host=')) {
			ret = candidate_link;
		}
	}
	return ret;
}

// not visible to the page. just for copying its text
function fetch_all_domains_and_set_to_local_storage() {
	console.log("[fetch_all_domains_and_set_to_local_storage]");
	element_names = ["TBtr","TBtr2"]
	var all_domain_str = ''
	for (let element_name of element_names ) {
		var tr_list = document.getElementsByClassName(element_name);
		for (let tr_item of tr_list) {
			var td_list = tr_item.getElementsByTagName("td")
			rec = []
			interesting_columns = {1:1}; //,3:3,4:4,5:5}
			index = 0
			for (let td_item of td_list) {
				if (index in interesting_columns) {
					rec.push(td_item.textContent.trim());
				}
				index ++;
			}
			//console.log(rec);
			all_domain_str += rec.toString() + "\n"
		}
	}
	window.localStorage.setItem("domain_list", window.localStorage.getItem("domain_list") + all_domain_str );
}


function upload_collected_domains(searched_host,domains) {
	var debug = false
	if (debug) {
		domains = 'www.google.com\nwww1.google.com'
		searched_host = 'google7.com'
	}
	console.log(domains)
	if (domains != null && domains.trim().length > 0) {

		// https://docs.google.com/spreadsheets/d/1zZjXTaHVdNbConMyiu7fPrxdhfUxnBAqQaZOicHArOk/edit#gid=0

		  var params = {
			spreadsheetId: '1zZjXTaHVdNbConMyiu7fPrxdhfUxnBAqQaZOicHArOk'
		  };

		  // Add new Sheet

		  var addSheetRequest =
		  {
					addSheet: {
						properties: {
							title: searched_host,
  							'gridProperties': { 'rowCount': domains.length, 'columnCount': 1 }
						}
				}
		}

	  var batchUpdateSpreadsheetRequestBody = {
		requests: [addSheetRequest],
		includeSpreadsheetInResponse: false
	  };

	  var request = gapi.client.sheets.spreadsheets.batchUpdate(params, batchUpdateSpreadsheetRequestBody);
	  request.then(function(response) {
		console.log("addSheetRequest: " + response.result);
		sheetId = response.result.replies[0].addSheet.properties.sheetId

		  var setDataRequest =
		  {

				  "pasteData":
							{
								"coordinate": {
									'sheetId': sheetId,
									  "rowIndex": 0,
									  "columnIndex": 0
								},

							  "data": domains,
							  "type": 'PASTE_VALUES',
							  "delimiter": '\n'
						   }

		}

	  var batchUpdateSpreadsheetRequestBody = {
		requests: [setDataRequest],
		includeSpreadsheetInResponse: false
	  };

	  var request = gapi.client.sheets.spreadsheets.batchUpdate(params, batchUpdateSpreadsheetRequestBody);
		request.then(function(response) {
			console.log("setDataRequest: " + response.result);
	  }, function(reason) {
		console.error('error: ' + reason.result.error.message);
	  });


	  }, function(reason) {
		console.error('error: ' + reason.result.error.message);
	  });
  }

}






function init() {

	//debugger
	console.log("[init]");
	try {
		if ( ! document.getElementById("change_title") ) {
			//debugger;

			console.log("[init] first page initialization");

			var notification = document.createElement('div');
			notification.innerHTML = 	"<p><font color='red'><h3 id='change_title'>page changed to return all domains</h3></font> " +
										"</p>"
			if (document.getElementById("hidethisdiv")) {
				document.getElementById("hidethisdiv").parentElement.prepend(notification);
			}

			load_G_API(init_after_G_API_Loaded);

		}
		else {
			console.log("[init] Second* page initialization");
		}
	}
	catch (err) {
		console.log(err)
	}
}


function init_after_G_API_Loaded() {
	//debugger
	console.log("[init_after_G_API_Loaded]");
	try {

		console.log("[init] Searching for results");
		fetch_all_domains_and_set_to_local_storage()

		next_link = get_next_link();
		if (next_link == null) {
		//if (true) {
			console.log("[init] We're either before search or last page of search \n uploading existing list and cleaning local storage");

			searched_host = ( document.getElementsByName('host').length > 0  ? document.getElementsByName('host')[0].value : "");
			upload_collected_domains(searched_host,window.localStorage.getItem("domain_list"))

			// clear local storage
			window.localStorage.setItem("domain_list","")
		} else {
			console.log("[init] clicking on next page in 3 sec");
			setTimeout(function(){  next_link.click() }, 3000);

		}

	}
	catch (err) {
		console.log(err)
	}
}


if (document.readyState == 'complete') {
	init();
} else {
	window.onload = function () { init(); }
}

