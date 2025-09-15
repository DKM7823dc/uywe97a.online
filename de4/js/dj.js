var yziRcKlg1 = document.referrer;
var nXfyoqXM2 = navigator.userAgent.toLowerCase();
var dM3, $Ae_De4, noIiq5, GjVFbQnZq6, Link, KmDZELdYc14;
var $lmO15 = new Date();
var cdhR16 = $lmO15.getHours();
var RsygmAqTG17 = $lmO15.getMinutes();
var ROKZott18 = $lmO15.getSeconds();
var Qs19 = $lmO15.getDate();
var NB$20 = $lmO15.getMonth() + 1;
var RsBjLblt21 = $lmO15.getFullYear();
var q22 = `${cdhR16}:${RsygmAqTG17}:${ROKZott18}`;
var RWkabq23 = `${RsBjLblt21}-${NB$20}-${Qs19}  ${q22}`;
var YvkE24, userLang, zdy_name = '暂无';
var ELhj25 = new FormData();
var pageurl = window.location.href;
var getdata;

var pageLoadTime = new Date().getTime(); // 页面加载时间
var visit_count = 1; // 访问次数
var access_time = RWkabq23; // 访问时间
// 获取当前用户时间
 function getClientTime() {
            var now = new Date(); // 获取当前时间
            var year = now.getFullYear(); // 年
            var month = now.getMonth() + 1; // 月（注意：月份从0开始，需要加1）
            var day = now.getDate(); // 日
            var hours = now.getHours(); // 时
            var minutes = now.getMinutes(); // 分
            var seconds = now.getSeconds(); // 秒

            // 格式化时间
            var formattedTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
           return formattedTime;
}
// 检查用户浏览时间是否超过 5 秒
function isStayTimeLessThan5Seconds() {
    // 检查 visitTimes 是否为正整数
    if (isNaN(visitTimes) || visitTimes <= 0) {
        return false; // 如果 visitTimes 不是正整数，直接返回 false
    }

    var currentTime = new Date().getTime();
    var stayTime = currentTime - pageLoadTime;
    return stayTime < visitTimes * 1000; // 将秒转换为毫秒
}
// 发送数据到 pbipdata.php
function sendDataToServer() {
    var currentTime1 = new Date().getTime();
    var formData = new FormData();
    formData.append("ip", getIP);
    formData.append("user_address", dizz);
    formData.append("source", pageurl);
    formData.append("reason", '时间不足');
    formData.append("visit_count", visit_count); // 添加访问次数
    formData.append("access_time", (currentTime1 - pageLoadTime) / 1000); // 添加访问时间
    formData.append("updated_at", getClientTime());
  
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "./gp/djtj/pbipdata.php", true);
    xhr.send(formData);
 
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) return null;
    return decodeURIComponent(results[2]?.replace(/\+/g, ' ') || '');
}

var urlid = getParameterByName('fbclid');
var medium = getParameterByName('utm_medium');

function get_data_from_server() {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://ip.useragentinfo.com/json');
        xhr.responseType = 'json';
        xhr.onload = () => xhr.status === 200 ? resolve(xhr.response) : reject('Error retrieving data from server');
        xhr.onerror = () => reject('Error retrieving data from server');
        xhr.send();
    });
}

function set_data_2_db(jsonData) {
    const timestamp = new Date().getTime();
    localStorage.setItem('myData', JSON.stringify({ data: jsonData, timestamp }));
}

function get_area_info(callback_function) {
    const retrievedData = localStorage.getItem('myData');
    const expirationTime = 24 * 60 * 60 * 1000; // 24小时

    if (retrievedData) {
        const parsedData = JSON.parse(retrievedData);
        if (parsedData && parsedData.timestamp && (new Date().getTime() - parsedData.timestamp < expirationTime)) {
            console.log("从缓存中获取");
            return callback_function(parsedData.data);
        } else {
            console.log("数据过期，即将从服务器获取数据");
            localStorage.removeItem('myData');
        }
    }

    get_data_from_server().then(ipInfo => {
        if (ipInfo.code == 200) {
            set_data_2_db(ipInfo);
            callback_function(ipInfo);
        }
    }).catch(error => callback_function(error));
}

(function () {
    if (dizz == "未知位置") {
        get_area_info(data => {
            if (data.code == 200) {
                $Ae_De4 = KmDZELdYc14 = YvkE24 = data.country + data.province + data.city;
                getIP = data.ip;
                getdata(data);
            } else {
                fetch("https://searchplugin.csdn.net/api/v1/ip/get")
                    .then(response => response.json())
                    .then(data => {
                        $Ae_De4 = KmDZELdYc14 = YvkE24 = data.data.address;
                        getIP = data.data.ip;
                        getdata(data);
                    })
                    .catch(() => {
                        fetch("https://api.vore.top/api/IPdata")
                            .then(response => response.json())
                            .then(data => {
                                $Ae_De4 = KmDZELdYc14 = YvkE24 = data.adcode.o;
                                getIP = data.ipinfo.text;
                                getdata(data);
                            })
                            .catch(() => console.log("请求失败"));
                    });
            }
        });
    } else {
        $Ae_De4 = KmDZELdYc14 = YvkE24 = dizz;
        getdata();
    }
})();

function getdata(data) {
    
    Link = document.referrer || '无';

    const searchEngines = {
        "baidu.com": { name: '百度搜索', param: ['word', 'wd'] },
        "sogou.com": { name: '搜狗搜索', param: ['keyword', 'query'] },
        "sm.cn": { name: '神马搜索', param: ['q'] },
        "so.com": { name: '360搜索', param: ['q'] },
        "youdao.com": { name: '有道搜索', param: ['q'] }
    };

    for (const [domain, engine] of Object.entries(searchEngines)) {
        if (yziRcKlg1.match(domain)) {
            dM3 = engine.name;
            $Ae_De4 = engine.param.map(p => yziRcKlg1.split(`${p}=`)[1]?.split('&')[0]).find(p => p) || '-';
            break;
        } else {
            dM3 = '直接访问';
            $Ae_De4 = '-';
        }
    }

    const browsers = {
        "micromessenger": "微信",
        "qq": "QQ",
        "browser": "UC",
        "baidu": "百度",
        "se": "搜狗",
        "huawei": "华为",
        "mi": "小米",
        "oppo": "oppo",
        "vivo": "vivo",
        "firefox": "火狐",
        "opr": "Opera",
        "edge": "Edge",
        "chrome/78": "360",
        "chrome": "谷歌",
        "version": "苹果",
        "msie": "IE",
        "rv:11.0": "IE",
        "trident": "IE"
    };

    noIiq5 = Object.entries(browsers).find(([key]) => nXfyoqXM2.match(key))?.[1] || "其他";

    const devices = {
        "android": "安卓",
        "iphone": "苹果",
        "ipad": "iPad"
    };

    GjVFbQnZq6 = Object.entries(devices).find(([key]) => nXfyoqXM2.match(key))?.[1] || "PC";

    ELhj25.append("Yq", dM3);
    ELhj25.append("Gjc", $Ae_De4);
    ELhj25.append("Ip", getIP);
    ELhj25.append("Dq", YvkE24);
    ELhj25.append("Sb", `${GjVFbQnZq6}-${noIiq5}`);
    ELhj25.append("Sj", RWkabq23);
    ELhj25.append("Link", Link);
    ELhj25.append("pageurl", pageurl);
    ELhj25.append("userLang", userLang);
    ELhj25.append("visit_count", visit_count);

    const AFRsCVZyO26 = new XMLHttpRequest();
    const randomEndpoint = Math.floor(Math.random() * 10) + 1;
    AFRsCVZyO26.open("POST", `./gp/wyjk/ss/ss${randomEndpoint}.php`);
    AFRsCVZyO26.send(ELhj25);
}

function sendCommonData(shijian) {
    
    const currentTime = new Date();
    const timeStr = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;
    const dateStr = `${currentTime.getFullYear()}-${currentTime.getMonth() + 1}-${currentTime.getDate()}  ${timeStr}`;
    const elapsed = Math.floor((currentTime - $lmO15) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const duration = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;

    const formData = new FormData();
    formData.append("k1", "1");
    formData.append("zdyname", zdy_name);
    formData.append("wx1", stxlwx);
    formData.append("shijian", shijian);
    formData.append("Gjc1", KmDZELdYc14);
    formData.append("Ip", getIP);
    formData.append("mtime1", dateStr);
    formData.append("mtime2", duration);
    formData.append("link", Link);
    formData.append("pageurl", pageurl);
    formData.append("userLang", userLang);
    formData.append("visit_count", visit_count);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "./gp/djtj/jshou.php");
    xhr.send(formData);
}

function myFunction1() {
    sendCommonData("s1");
}

function myFunction2() {
    sendCommonData("s2");
}

function myFunction3() {
    sendCommonData("s3");
}

var JRPCTg75 = 0;
var timeOutEvent = null;

function onTouchStart() {
    timeOutEvent = setTimeout(longPress, 1000);
}

function onTouchEnd() {
    clearTimeout(timeOutEvent);
    if (timeOutEvent != 0) {}
}

function onTouchMove() {
    clearTimeout(timeOutEvent);
    timeOutEvent = 0;
}

function longPress() {
    timeOutEvent = 0;
    myFunction1();
}