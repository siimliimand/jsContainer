function App() {
    
    this.init();
};
App.prototype.init = function() {
    this.getTestName();
};
App.prototype.getTestName = function() {
    var test2 = window.JsContainer.get('Test2');
    var testName = "Viga";
    var test2Name = "Viga2";

    if(typeof test2 !== 'undefined') {
        testName = test2.getTestName();
        test2Name = test2.getName();
    }

    console.log('TestName: ' + testName);
    console.log('Test2Name:' + test2Name);
};

window.App = App;