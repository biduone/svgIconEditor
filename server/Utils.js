
/**
* 工具类方法说明
 基本类型判断
    isArray
    isBoolean
    isDate
    isFunction
    isNaN
    isNumber
    isObject
    isRegExp
    isString
    isUndefined
    isNumber
    isPlainObject

 对象合并方法
> **assign** *使用与jQuery.extend一致。*&nbsp;&nbsp; >[jQery API](http://api.jquery.com/jQuery.extend/)
 */
const proxy = (a) => { };
let Types = {
    isArray: proxy,
    isBoolean: proxy,
    isDate: proxy,
    isFunction: proxy,
    isNaN: proxy,
    isNumber: proxy,
    isObject: proxy,
    isRegExp: proxy,
    isString: proxy,
    isDefined: proxy,
    isUndefined: proxy,
    isPlainObject: proxy,
    defer: defer
};

'Array Boolean Date Function NaN Number Object RegExp String Undefined'.split(' ').forEach(function (a) {
    Types['is' + a] = function (b) {
        return b !== b ? a === 'NaN' ? !0 : !1 : RegExp(a).test(Object.prototype.toString.call(b));
    };
});


Types['isDefined'] = function (value) { return typeof value !== 'undefined'; }

Types['isPlainObject'] = function (obj) {
    var proto,
        Ctor,
        OwnProp = Object.hasOwnProperty,
        OwnString = OwnProp.toString,
        ProtoOf = Object.getPrototypeOf;

    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if (!obj || Object.prototype.toString.call(obj) !== "[object Object]") {
        return false;
    }

    proto = ProtoOf(obj);

    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if (!proto) {
        return true;
    }

    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = OwnProp.call(proto, "constructor") && proto.constructor;
    return typeof Ctor === "function" && OwnString.call(Ctor) === OwnString.call(Object);
};


/**创建一个defer*/
function defer() {
    function PromiseMaker() {
        let resolver,
            rejecter,
            promise = new Promise(function (resolve, reject) {
                resolver = resolve;
                rejecter = reject;
            });

        this.promise = promise;
        this.resolve = (result) => {
            resolver(result);
        };
        this.reject = (reason) => {
            rejecter(reason);
        };

        /**catch warn */
        promise.then(() => { }, () => { });
        return this;
    }
    const PM = new PromiseMaker();
    return PM;
}


module.exports = Types;