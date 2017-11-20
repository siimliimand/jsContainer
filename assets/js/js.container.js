function JsContainer() {
    this.options = {
        files: {
            css: {},
            js: {}
        },
        urls: {
            home: "/"
        }
    };
    this.instances = {};
    this.autoLoadList = [];
	this.loadingList = [];
    
    this.init();
};

JsContainer.prototype.init = function() {
    this.mergeOptions();
    this.loadFiles();
	this.autoLoad();
};
JsContainer.prototype.get = function(instanceName) {
    var instances = this.instances;
    if(typeof instances[instanceName] !== 'undefined') {
        return instances[instanceName];
    }
    
    var instance = this.createInstance(instanceName);
    if(typeof instance === 'undefined' || instance === false) {
        return false;
    }
    
    return instance;
};
JsContainer.prototype.createInstance = function(instanceName) {
    if(typeof window[instanceName] === 'undefined') {
        return false;
    }
    
    var jsOptions = this.options.files.js[instanceName];
    if(typeof jsOptions === 'undefined') {
        return false;
    }
    
    var arguments = [];
    var jsArguments = jsOptions.arguments;
    if(typeof jsArguments !== 'undefined') {
        for(var key in jsArguments) {
            var value = jsArguments[key];
            if(typeof value === 'function') {
                value = jsArguments[key]();
            }
            arguments.push(value);
        }
    }
    
    var instance = false;
    try {
        instance = window[instanceName].construct(arguments);
    } catch(e) {
        
    }
    
    return instance;
};
JsContainer.prototype.autoLoad = function() {
    var self = this;
	if(this.isAllLoaded() === false) {
		setTimeout(function() {
			self.autoLoad();
		}, 50);
		
		return false;
	}
	
	var list = this.autoLoadList;
	for(var key in list) {
		this.get(list[key]);
	}
};
JsContainer.prototype.isAllLoaded = function() {
	var length = this.loadingList.length;
	
	return length === 0;
};
JsContainer.prototype.isLoaded = function(instanceName) {
	var found = false;
	for(var index in this.loadingList) {
		var value = this.loadingList[index];
		if(value === instanceName) {
			found = true;
			break;
		}
	}
	
	return found === false;
};
JsContainer.prototype.addToAutoloadList = function(instanceName) {
	if(typeof instanceName === 'undefined') {
        return false;
    }
	this.autoLoadList.push(instanceName);
};
JsContainer.prototype.loadFiles = function() {
    this.loadCssFiles();
    this.loadJsFiles();
};
JsContainer.prototype.loadCssFiles = function() {
    var files = this.options.files.css;
    for(var key in files) {
        var url = files[key];
        this.loadCssFile(url);
    }
};
JsContainer.prototype.loadJsFiles = function() {
    var files = this.options.files.js;
    for(var key in files) {
        var params = files[key];
        var url = params.url;
		if(typeof url === 'undefined') {
			continue;
		}
        this.loadJsFile(params);
		this.addToLoadingList(key);
		this.markLoaded(key);
		if(typeof params.autoLoad !== 'undefined' && params.autoLoad === true) {
            this.addToAutoloadList(key);
        }
    }
};
JsContainer.prototype.addToLoadingList = function(instanceName) {
	if(typeof instanceName === 'undefined') {
        return false;
    }
	this.loadingList.push(instanceName);
};
JsContainer.prototype.markLoaded = function(instanceName) {
	var self = this;
	if(typeof window[instanceName] === 'undefined') {
		setTimeout(function(){
			self.markLoaded(instanceName);
		}, 50);
		
		return false;
	}
	
	for(var index in this.loadingList) {
		var key = this.loadingList[index];
		if(key === instanceName) {
			this.loadingList.splice(index, 1);
			break;
		}
	}
};
JsContainer.prototype.loadCssFile = function(url) {
    var tagName = 'link';
    var containerTagName = 'head';
    var attributes = {
        rel: 'stylesheet',
        href: url,
        type: 'text/css'
    };
    this.loadFile(tagName, containerTagName, attributes);
};
JsContainer.prototype.loadJsFile = function(params) {
	var url = params.url;
    var tagName = 'script';
    var containerTagName = 'body';
    var attributes = {
        async: true,
        src: url,
        type: 'text/javascript',
        charset: 'UTF-8'
    };
	if(typeof params.required !== 'undefined') {
		this.waitRequiredFiles(params, tagName, containerTagName, attributes);
	} else {
		this.loadFile(tagName, containerTagName, attributes);
	}
};
JsContainer.prototype.waitRequiredFiles = function(params, tagName, containerTagName, attributes) {
	var self = this;
	var found = false;
	for(var index in params.required) {
		var value = params.required[index];
		if(this.isLoaded(value) === false) {
			found = true;
			break;
		}
	}
	if(found === true) {
		setTimeout(function(){
			self.waitRequiredFiles(params, tagName, containerTagName, attributes);
		}, 50);
	} else {
		this.loadFile(tagName, containerTagName, attributes);
	}
};
JsContainer.prototype.loadFile = function(tagName, containerTagName, attributes) {
    var element = document.createElement(tagName);
    var containers = document.getElementsByTagName(containerTagName);
    var container = containers[0];
    for(var key in attributes) {
        element[key] = attributes[key];
    }
    container.appendChild(element);
};
JsContainer.prototype.mergeOptions = function() {
    var options = window.JsContainerOptions;
    if(typeof options === 'undefined') {
        return false;
    }
    if(typeof options.files !== 'undefined') {
        if(typeof options.files.css !== 'undefined') {
            for(var key in options.files.css) {
                var url = options.files.css[key];
                this.options.files.css[key] = url;
            }
        }
        if(typeof options.files.js !== 'undefined') {
            for(var key in options.files.js) {
                var url = options.files.js[key];
                this.options.files.js[key] = url;
            }
        }
    }
    if(typeof options.urls !== 'undefined') {
        for(var key in options.urls) {
            var url = options.urls[key];
            this.options.urls[key] = url;
        }
    }
};


Function.prototype.construct = function (aArgs) {
    var fNewConstr = new Function("");
    fNewConstr.prototype = this.prototype;
    var oNew = new fNewConstr();
    this.apply(oNew, aArgs);
    return oNew;
};

window.JsContainer = new JsContainer();