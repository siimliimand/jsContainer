function Test2(test, testBool) {
    this.name = "Test2";
    this.test = test;
    this.testBool = testBool;
};

Test2.prototype.getName = function() {
    return this.name;
};
Test2.prototype.getTestName = function() {
    if(typeof this.test === 'undefined') {
        return false;
    }
    if(this.testBool === 'undefined' || this.testBool !== true) {
        return false;
    }
    
    if(typeof this.test === 'undefined' || this.test === false) {
        return false;
    }
    
    return this.test.getName();
};

window.Test2 = Test2;