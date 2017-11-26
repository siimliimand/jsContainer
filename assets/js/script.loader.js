function ScriptLoader() {
    this.configs = {
        css: {
            location: document.head,
            attributes: {
                rel: 'stylesheet',
                href: '#',
                type: 'text/css'
            },
            urlAttribute: 'href',
            tagName: 'link'
        },
        js: {
            location: document.body,
            attributes: {
                async: true,
                src: '#',
                type: 'text/javascript',
                charset: 'UTF-8'
            },
            urlAttribute: 'src',
            tagName: 'script'
        }
    };
};
ScriptLoader.prototype.addScript = function (type, url, onload) {
    var config = this.configs[type];
    if(typeof config === 'undefined' || typeof url === 'undefined') {
        return false;
    }
    
    var self = this;    
    var tagName = config.tagName;
    var element = document.createElement(tagName);
    var location = config.location;
    var attributes = config.attributes;
    var urlAttribute = config.urlAttribute;
    attributes[urlAttribute] = url;
    attributes.onload = function() {
        self.callback(onload);
        if(type === 'js') {
            element.parentNode.removeChild(element);
        }
    };
    attributes.onerror = function() {
        console.log('Error loading: ' + url);
    };
    for (var key in attributes) {
        element[key] = attributes[key];
    }
    location.appendChild(element);
};
ScriptLoader.prototype.callback = function(callback) {
    if(typeof callback === 'function') {
        callback();
    }
};