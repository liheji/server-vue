const dateFormat = function (date, fmt) {
    date = new Date(date);
    if (typeof fmt !== "string") fmt = "yyyy-MM-dd hh:mm:ss.S";
    const o = {
        "M+": date.getMonth() + 1,                 //月份
        "d+": date.getDate(),                    //日
        "h+": date.getHours(),                   //小时
        "m+": date.getMinutes(),                 //分
        "s+": date.getSeconds(),                 //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

const fileFormat = function (num, precision) {
    var fileSize = Number(num);
    const flag = fileSize < 0;
    fileSize = Math.abs(fileSize);
    const unit = ["", "K", "M", "G", "T", "P", "E", "Z"];
    if (precision === undefined || precision === null || typeof precision != "number") {
        precision = 2;
    }
    for (var i = 0; i < unit.length; i++) {
        if (fileSize < 1024.0) {
            const tmp = Math.pow(10, precision);
            const tmp_size = Math.round(fileSize * tmp) / tmp;

            return (flag ? "-" : "") + tmp_size.toFixed(precision) + unit[i] + "B";
        }
        fileSize /= 1024.0;
    }
    return num;
};


const routeHandler = function (to, from, next) {
    if (to.meta.title) {
        document.title = to.meta.title;
    }
    next();
}

const isMobile = function isMobile() {
    const userAgentInfo = navigator.userAgent;
    const mobileAgents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];

    //根据userAgent判断是否是手机
    var v = 0;
    for (; v < mobileAgents.length; v++) {
        if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
            return true;
        }
    }

    //根据屏幕分辨率判断是否是手机
    if (v >= mobileAgents.length) {
        const screen_width = window.screen.width;
        const screen_height = window.screen.height;

        if (screen_height / screen_width > 1) {
            return true;
        }
    }

    return false;
}

const copyText = function (element) {
    // 非IE浏览器
    const selection = window.getSelection();
    selection.removeAllRanges();
    // 返回新创建的 Range 对象，两个边界点都被设置为文档的开头
    const range = document.createRange();
    // 把范围边界设置为一个节点的子节点
    range.selectNodeContents(element);
    // 将一个区域（Range）对象加入选区
    selection.addRange(range);
    // 复制文字
    document.execCommand("copy");
}

function queryLocationSearch(key) {
    const reg = new RegExp(`(^|\\?|&)${key}=([^&]*)(\\s|&|$)`, "i");
    if (reg.test(location.search)) return unescape(RegExp.$2.replace(/\+/g, " "));
    return "";
}

function genRandomString(len) {
    const _charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';

    var _str = '', length = _charStr.length - 1;
    if (len === undefined || len <= 0 || len > length) {
        len = 6;
    }
    len = len || 15;
    for (var i = 0; i < len; i++) {
        _str += _charStr[Math.floor(Math.random() * length)];
    }
    return _str;
}

function camelName(name, trimFirst) {
    var i = 0;
    if (trimFirst) i++;
    const strs = name.split("_");
    var _str = "";
    for (; i < strs.length; i++) {
        _str += strs[i][0].toUpperCase() + strs[i].substring(1);
    }
    return _str;
}

export {fileFormat, dateFormat, routeHandler, isMobile, copyText, queryLocationSearch, genRandomString, camelName}
