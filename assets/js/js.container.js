Function.prototype.construct = function (aArgs) {
    var fNewConstr = new Function("");
    fNewConstr.prototype = this.prototype;
    var oNew = new fNewConstr();
    this.apply(oNew, aArgs);
    return oNew;
};



/**
 * JsContainer
 * 
 * @param ScriptLoader scriptLoader
 * @returns {JsContainer}
 */
function JsContainer(scriptLoader) {
    this.private = new __PrivateJsContainer(this, scriptLoader);
    this.autoLoadList = [];
    this.loadingList = [];

    this.private.init();
}
;

JsContainer.prototype.has = function (scriptName) {
    return typeof window[scriptName] !== 'undefined';
};
JsContainer.prototype.get = function (scriptName, onload) {
    var self = this;
    if(this.has(scriptName) === false) {
        this.private.loadScript({
            type: 'js',
            name: scriptName
        }, onload);
    } else if(typeof this.private.instances[scriptName] === 'undefined') {
        self.private.createInstance(scriptName, function(instance) {
            if(instance === false) {
                onload();
            } else {
                self.get(scriptName, onload);
            }
        });
    } else if(typeof onload !== 'undefined') {
        onload(this.private.instances[scriptName]);
    } else {
        return this.private.instances[scriptName];
    }
    
    return false;
};




/**
 * Private JsContainer
 * 
 * @param JsContainer container
 * @param ScriptLoader scriptLoader
 * @returns {__PrivateJsContainer}
 */
function __PrivateJsContainer(container, scriptLoader) {
    this.container = container;
    this.scriptLoader = scriptLoader;
    this.instances = {};
    this.options = {
        files: {
            css: {},
            js: {}
        },
        urls: {
            home: "/"
        }
    };
};

__PrivateJsContainer.prototype.init = function () {
    this.mergeOptions();
    this.autoLoad(function() {
        //console.log('All script are loaded.')
    });
};
__PrivateJsContainer.prototype.getContainer = function () {
    return this.container;
};
__PrivateJsContainer.prototype.mergeOptions = function () {
    if (typeof window.JsContainerOptions === 'undefined') {
        return false;
    }

    for (var key in window.JsContainerOptions) {
        var value = window.JsContainerOptions[key];
        this.addOption(this.options, key, value);
    }
};
__PrivateJsContainer.prototype.addOption = function (options, key, value) {
    if (typeof value === 'object') {
        if (typeof options[key] === 'undefined') {
            options[key] = value;
        } else {
            for (var k in value) {
                var v = value[k];
                this.addOption(options[key], k, v);
            }
        }
    } else {
        options[key] = value;
    }
};
__PrivateJsContainer.prototype.autoLoad = function (done) {
    var files = this.options.files;
    var scriptNames = [];
    for (var type in files) {
        var scripts = files[type];
        for (var scriptName in scripts) {
            if(type === 'css') {
                this.loadScript({
                    type: type,
                    name: scriptName
                }, function() {});
                continue;
            }
            
            var params = scripts[scriptName];
            if(params.autoload !== 'undefined' && params.autoload === false) {
                continue;
            }
            scriptNames.push({
                type: type,
                name: scriptName
            });
        }
    }
    this.loadScripts(scriptNames, done, 0);
};
__PrivateJsContainer.prototype.loadScripts = function(scriptNames, done) {
    var self = this;
    var scriptName = this.getNextNotLoadedScriptName(scriptNames);
    
    if(scriptName === false) {
        done();
    } else {
        this.loadScript(scriptName, function() {
            self.loadScripts(scriptNames, done);
        });
    }
};
__PrivateJsContainer.prototype.getNextNotLoadedScriptName = function(scriptNames) {
    for(var index in scriptNames) {
        if(this.getContainer().has(scriptNames[index].name) === false) {
            return scriptNames[index];
        }
    }
    
    return false;
};
__PrivateJsContainer.prototype.loadScript = function(scriptName, done) {
    var params = this.getScriptParams(scriptName);
    
    if (typeof params.required === 'undefined') {
        this.loadNotRequiredScripts(scriptName, params, done);
    } else {
        this.loadRequiredScripts(scriptName, params, done);
    }
};
__PrivateJsContainer.prototype.loadNotRequiredScripts = function(scriptName, params, done) {
    var self = this;
    this.scriptLoader.addScript(scriptName.type, params.url, function() {
        if(scriptName.type === 'css') {
            done();
        } else {
            self.getContainer().get(scriptName.name, done);
        }
    });
};
__PrivateJsContainer.prototype.loadRequiredScripts = function(scriptName, params, done) {
    var self = this;
    var scriptNames = this.getNotLoadedScriptNames(scriptName, params);
     
    if(scriptNames.length <= 0) {
        this.scriptLoader.addScript(scriptName.type, params.url, function() {
            self.getContainer().get(scriptName.name, done);
        });
    } else {
        this.loadScripts(scriptNames, done);
    }
};
__PrivateJsContainer.prototype.getNotLoadedScriptNames = function(scriptName, params) {
    var scriptNames = [];
    for(var index in params.required) {
        if(this.getContainer().has(params.required[index]) === false) {
            scriptNames.push({
                type: scriptName.type,
                name: params.required[index]
            });
        }
    }
    
    return scriptNames;
};
__PrivateJsContainer.prototype.getScriptParams = function (scriptName) {
    var scripts = this.options.files[scriptName.type];
    if (typeof scripts === 'undefined') {
        return {};
    }
    var params = scripts[scriptName.name];
    if (typeof params === 'undefined') {
        return {};
    }

    return params;
};
__PrivateJsContainer.prototype.createInstance = function (instanceName, done) {
    var jsOptions = this.options.files.js[instanceName];
    if (typeof jsOptions === 'undefined') {
        done(false);
        return false;
    }

    var arguments = this.getInstanceArguments(jsOptions);
    var instance = false;
    try {
        instance = window[instanceName].construct(arguments);
        this.instances[instanceName] = instance;
        done(instance);
    } catch (e) {
        //console.log(e);
        done(false);
    }
};
__PrivateJsContainer.prototype.getInstanceArguments = function(jsOptions) {
    var arguments = [];
    var jsArguments = jsOptions.arguments;
    if (typeof jsArguments !== 'undefined') {
        for (var key in jsArguments) {
            var value = jsArguments[key];
            if (typeof value === 'function') {
                value = jsArguments[key]();
            }
            arguments.push(value);
        }
    }
    return arguments;
};