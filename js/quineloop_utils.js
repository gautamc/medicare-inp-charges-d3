var quineloop_utils = (function(){

    var browser_isie_p = function(){
	if( /MSIE/.test(navigator.userAgent) ) {
	    return true
	}
	return false
    }

    return { browser_isie_p: browser_isie_p }

})()
