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
    
    this.init();
};

JsContainer.prototype.init = function() {
    this.mergeOptions();
    this.loadFiles();
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
JsContainer.prototype.autoLoad = function(instanceName) {
    var self = this;
    if(typeof instanceName === 'undefined') {
        return false;
    }
    var length = this.autoLoadList.length;
    this.autoLoadList.push(instanceName);
    
    if(length === 0) {
        setTimeout(function() {
            var list = self.autoLoadList;
            for(var key in list) {
                self.get(list[key]);
            }
        }, 200);
    }
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
        this.loadJsFile(url);
        var autoLoad = typeof params.autoLoad === 'undefined' ? false : params.autoLoad;
        if(autoLoad === true) {
            this.autoLoad(key);
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
JsContainer.prototype.loadJsFile = function(url) {
    var tagName = 'script';
    var containerTagName = 'body';
    var attributes = {
        async: true,
        src: url,
        type: 'text/javascript',
        charset: 'UTF-8'
    };
    this.loadFile(tagName, containerTagName, attributes);
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