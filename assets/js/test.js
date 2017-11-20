function Test() {
    this.name = "Test";
}

Test.prototype.getName = function() {
    return this.name;
};

window.Test = Test;