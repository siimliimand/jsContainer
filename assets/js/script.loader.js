function ScriptLoader() {
    this.configs = {
        css: {
            location: document.body,
            attributes: {
                rel: 'stylesheet',
                href: '#',
                type: 'text/css'
            },
            urlAttribute: 'href',
            tagName: 'link'
        },
        css2: {
            location: document.body,
            attributes: {
                rel: 'stylesheet',
                href: '#',
                type: 'text/css'
            },
            urlAttribute: false,
            tagName: 'style'
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
    if(urlAttribute) {
        attributes[urlAttribute] = url;
    }
    attributes.onload = function() {
        self.callback(onload);
        if(type === 'js') {
            //element.parentNode.removeChild(element);
        }
    };
    attributes.onerror = function() {
        console.log('Error loading: ' + url);
    };
    for (var key in attributes) {
        element[key] = attributes[key];
    }
    
    if(type === 'css2') {
        this.load(url, function(responseText) {
            element.innerHTML = responseText;
            location.appendChild(element);
        });
    } else {
        location.appendChild(element);
    }
};
ScriptLoader.prototype.load = function(file, done) {
    var client = new XMLHttpRequest();
    client.open('GET', file);
    client.onreadystatechange = function() {
        done(this.responseText);
    };
    client.send();
};
ScriptLoader.prototype.callback = function(callback) {
    if(typeof callback === 'function') {
        callback();
    }
};