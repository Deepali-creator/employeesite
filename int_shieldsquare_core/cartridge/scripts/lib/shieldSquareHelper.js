/* eslint-disable no-underscore-dangle */
/* eslint-disable no-prototype-builtins */
/**
 * Shield Square Helper method
 */
// System Define Library
var Site = require('dw/system/Site').getCurrent();
var Cookie = require('dw/web/Cookie');
var System = require('dw/system/System');
var MessageDigest = require('dw/crypto/MessageDigest');
var Bytes = require('dw/util/Bytes');
var Encoding = require('dw/crypto/Encoding');
var BigInteger = require('dw/util/BigInteger');
var StringUtils = require('dw/util/StringUtils');

// Custom Define classes
var shieldSquareAdvanceConfig = JSON.parse(Site.getCustomPreferenceValue('shieldSquareAdvanceConfig')).data;
var ssLogger = require('dw/system/Logger').getLogger('ShieldSquare', 'shieldsquare');

exports.buildRequestObject = function () {
    var shieldSquareConfig = Site.getCustomPreferenceValue('shieldSquareConfig');

    var requestObj = {
        // eslint-disable-next-line no-unneeded-ternary
        '_zpsbd0': shieldSquareAdvanceConfig._mode === 'Active' ? true : false,
        '_zpsbd1': Site.getCustomPreferenceValue('shieldSquareSubscriberID'),
        '_zpsbd2': generate_pid(),
        '_zpsbd3': request.httpReferer,
        '_zpsbd4': request.httpURL.toString(),
        '_zpsbd5': getSessionCookie(),
        '_zpsbd6': request.httpRemoteAddress,
        '_zpsbd7': request.httpUserAgent,
        '_zpsbd8': shieldSquareAdvanceConfig._calltype ? shieldSquareAdvanceConfig._calltype : 1,
        '_zpsbd9': customer.authenticated ? customer.ID : '',
        '_zpsbda': (System.getCalendar().getTime() / 1000).toFixed(0),
        '_zpsbdt': 'SFCC 1.0.0',
        '_zpsbdp': 70000,
        '_zpsbdpa': request.getHttpHeaders().hasOwnProperty('Proxy-Authorization') ? request.getHttpHeaders().get('Proxy-Authorization') : '',
        '_zpsbdm': request.getHttpMethod(),
        '_zpsbdxrw': request.getHttpHeaders().hasOwnProperty('X-Requested_with') ? request.getHttpHeaders().get('X-Requested_with') : '',
        'idn': JSON.parse(shieldSquareConfig).deployment_number
    };


    var updatedObj = validateCookies(requestObj),
        requestObjHeader = addHeaders(updatedObj);

    ssLogger.info('Sheildsquare Request : {0}', JSON.stringify(requestObjHeader));

    return requestObjHeader;
};
/*
 * This function is used to generate redirect URL when response code is 2 or 3
 */
exports.generateRedirectUrl = function (responseCode) {
    var redirectDomainD = shieldSquareAdvanceConfig._d_redirect_domain,
        redirectDomainC = shieldSquareAdvanceConfig._redirect_domain,
        customresp = redirectDomainD.equals(redirectDomainC),
        page = (responseCode === 2) ? '/captcha?' : '/block?',
        subId = Site.getCustomPreferenceValue('shieldSquareSubscriberID');

    if (customresp) {
        var ssa = encodeURI(request.httpURL.toString()),
            fullString = subId + request.httpURL.toString();
        // eslint-disable-next-line no-unused-expressions
        messageDigest = new MessageDigest(MessageDigest.DIGEST_SHA_256),
            paramsStrBytes = new Bytes(fullString);

        // convert parameter strings to SHA1 string
        // using message digest and convert returned bytes to string using Encoding.toHex

        var ssb = Encoding.toHex(messageDigest.digestBytes(paramsStrBytes)),
            subscribeId = subId.split('');

        subscribeId.reverse();

        var reverseSubscribeId = subscribeId.join(''),
            ssc = StringUtils.encodeBase64(reverseSubscribeId),
            url = page + 'ssa=' + ssa + '&ssb=' + ssb + '&ssc=' + ssc;

        return url;
    }

    /* eslint-disable */
    // generate new query string
    var uzmc_sequence = checkCookie('__uzmc') ? checkCookie('__uzmc').value : getpageSession(),
        uzmc_a = 5,
        uzmc_b = 10;

    uzmc_sequence = uzmc_sequence.substr(uzmc_a, uzmc_sequence.length - uzmc_b);

    var ssa = generateUUID4(),
        ssc = encodeURI(request.httpURL.toString()),
        ssi = generate_pid(),
        ssk = shieldSquareAdvanceConfig._support_email,
        digits = '0123456789';
    ssm = generate_string(8, digits) + responseCode + generate_string(8, digits) + uzmc_sequence.toString() + generate_string(13, digits),
        inputDigest = subId + getSessionCookie() + decodeURI(request.httpURL.toString()) + uzmc_sequence.toString() + generate_pid() + request.httpUserAgent + ssk + request.httpRemoteAddress.toString();

    var messageDigest = new MessageDigest(MessageDigest.DIGEST_SHA_256),
        paramsStrBytes = new Bytes(inputDigest);

    // convert parameter strings to SHA1 string
    // using message digest and convert returned bytes to string using Encoding.toHex

    var digest = Encoding.toHex(messageDigest.digestBytes(paramsStrBytes)),
        uzma = checkCookie('__uzma') ? checkCookie('__uzma').value : gettimestampCookie(),
        uzmb = checkCookie('__uzmb') ? checkCookie('__uzmb').value : getfirstRequestTimeCookie(),
        uzmd = checkCookie('__uzmd') ? checkCookie('__uzmd').value : getRequestTimeCookie(),
        first_part_uzma, second_part_uzma;

    if (uzma.length <= 20) {
        first_part_uzma = uzma;
        second_part_uzma = '';
    } else {
        first_part_uzma = uzma.substr(0, 20);
        second_part_uzma = uzma.substr(20, uzma.length);
    }
    // generate ss attributes based on documentation
    var ssn = generate_string(8, digits) + digest.substr(1, 20) + generate_string(8, digits) + first_part_uzma + generate_string(5, digits),
        sso = generate_string(5, digits) + second_part_uzma + generate_string(8, digits) + digest.substr(21, 40) + generate_string(8, digits),
        ssp = generate_string(10, digits) + parseInt(uzmb).toString().substr(0, 5) + generate_string(5, digits) + parseInt(uzmd).toString().substr(0, 5) + generate_string(10, digits),
        ssq = generate_string(7, digits) + parseInt(uzmd).toString().substr(-5) + generate_string(9, digits) + parseInt(uzmb).toString().substr(-5) + generate_string(15, digits),
        sst = request.httpUserAgent,
        ssr = StringUtils.encodeBase64(request.httpRemoteAddress),
        ssv, ssw;


    var zpsbd9 = customer.authenticated ? customer.ID : '';
    if (!empty(zpsbd9)) {
        ssv = StringUtils.encodeBase64(zpsbd9);
    } else {
        ssv = zpsbd9;
    }
    ssw = getSessionCookie();

    // concat the all above attributes and return the query string
    return '/?ssa=' + ssa + '&ssc=' + ssc + '&ssi=' + ssi + '&ssk=' + ssk + '&ssm=' + ssm + '&ssn=' + ssn + '&sso=' + sso + '&ssp=' + ssp + '&ssq=' + ssq + '&ssr=' + ssr + '&sst=' + sst + '&ssv=' + ssv + '&ssw=' + ssw;
};
/*
 * This function is used to skip shield square request if current URL is exist in skip list
 */
exports.skipurlfilter = function () {
    var skipUrlString = shieldSquareAdvanceConfig._skip_url_list,
        skipUrlList;
    if (!empty(skipUrlString)) {
        skipUrlList = skipUrlString.split(',');
    }
    var skipenabled = shieldSquareAdvanceConfig._skip_url == 'True' ? true : false;
    if (skipenabled && !empty(skipUrlList)) {
        for (var i = 0; i < skipUrlList.length; i++) {
            var skipURL = dw.util.StringUtils.trim(skipUrlList[i]);

            if (new RegExp(skipURL).test(request.httpURL.toString())) {
                ssLogger.info('Request not processed as it added in skip list : {0}', request.httpURL.toString());
                return true;
            }
        }
    }
    return false;
};
/*
 * This function is used to skip shield square request if current URL is exist in request list
 */
exports.extensionfilter = function () {
    if (shieldSquareAdvanceConfig._content_filter == 'True') {
        var extensions = shieldSquareAdvanceConfig._content_list;
        if (!empty(extensions) && new RegExp('/.(' + extensions + ')$/').test(request.httpURL.toString())) {
            ssLogger.info('Request not processed as it added in request list : {0}', request.httpURL.toString());
            return true;
        }
    }
    return false;
};

/**
 * This function is spilt IP Address and retrun the spilt IP
 */
function checkiSplitIp(zpsbd6) {
    var reqIp = zpsbd6,
        splitIp = reqIp.split(','),
        ipIndex = shieldSquareAdvanceConfig._ip_index,
        iSplitIP = '';

    if (ipIndex >= 0) {
        var start_index = (ipIndex == 0) ? 0 : ipIndex - 1;
        for (var i = start_index; i < splitIp.length; i++) {
            var curIp = splitIp[i].replace('^ ', '');

            if (isValidIp(curIp)) {
                iSplitIP = curIp;
                break;
            }
        }
    } else {
        for (var i = splitIp.length + ipIndex; i >= 0; i--) {
            var curIp = splitIp[i].replace('^ ', '');

            if (isValidIp(curIp)) {
                iSplitIP = curIp;
                break;
            }
        }
    }
    var cntColon = checkCount(iSplitIP.toString(), ':');
    if (cntColon == 1) {
        iSplitIP = iSplitIP.split(':');
        iSplitIP = iSplitIP[0];
    }
    return iSplitIP;
}
/*
 * This function is used to if given IP address is valid or not
 */

function isValidIp(ipToValidate) {
    if (!empty(ipToValidate)) {
        var ctnColon = checkCount(ipToValidate.toString(), ':'),
            ctnPeriod = checkCount(ipToValidate.toString(), '.');
        if (!(ctnColon > 1 || ctnPeriod == 3)) {
            return false;
        }
        // checking IP address values
        if (ctnColon > 1) {
            if (ipToValidate == '::1' || ipToValidate == '0:0:0:0:0:0:0:0' || ipToValidate == '::' ||
                ipToValidate == '::/128' || ipToValidate == '0:0:0:0:0:0:0:1' || ipToValidate == '::1/128') {
                return false;
            } else if (new RegExp('/^fd/').test(ipToValidate) == 1) {
                return false;
            }
        } else if (ctnPeriod == 3) {
            if (ctnColon == 1) {
                ipToValidate = ipToValidate.split(':');
                ipToValidate = ipToValidate[0];
            }
            var ipToValidateLong = ip2Long(ipToValidate),
                ip2LongValues = setIp2LongValue(),
                checkIP = CheckIPRange(ipToValidateLong, 1, ip2LongValues);
            if (checkIP) {
                return false;
            }
        }
    } else {
        ssLogger.info('IP Address is not set', ipToValidate);
        return false;
    }
    return true;
}

/*
 *This function is used to check given IP range
 */
function CheckIPRange(ipToValidateLong, i, ip2LongValues) {
    if (Math.round((ip2LongValues.length / 2) + 1) == i) {
        return false;
    } else {
        var isValid = false;
        if (!empty(ip2LongValues['minIP' + i]) && !empty(ip2LongValues['minIP' + i])) {
            isValid = ((ipToValidateLong >= ip2LongValues['minIP' + i]) && (ipToValidateLong <= ip2LongValues['maxIP' + i]));
        }
        return isValid || CheckIPRange(ipToValidateLong, i + 1, ip2LongValues);
    }
}


/*
 * This function is return valid Long IP address values
 */
function setIp2LongValue() {
    var ip2LongVal = Array(),
        validIpRanges = {
            'minIP1': '10.0.0.0',
            'maxIP1': '10.255.255.255',
            'minIP2': '172.16.0.0',
            'maxIP2': '172.31.255.255',
            'minIP3': '192.168.0.0',
            'maxIP3': '192.168.255.255',
            'minIP4': '127.0.0.0',
            'maxIP4': '127.255.255.255',
            'minIP5': '198.18.0.0',
            'maxIP5': '198.19.255.255',
            'minIP6': '100.64.0.0',
            'maxIP6': '100.127.255.255',
            'minIP7': '192.0.0.0',
            'maxIP7': '192.0.0.255',
            'min8': ip2Long('0.0.0.0'),
            'max8': ip2Long('0.255.255.255')
        };
    for (var i in validIpRanges) {
        ip2LongVal[i] = ip2Long(validIpRanges[i]);
    }

    return ip2LongVal;
}

/**
 * Converts a string containing an (IPv4) Internet Protocol dotted address into a proper address
 */
function ip2Long(argIP) {
    var i = 0;
    var pattern = new RegExp([
        '^([1-9]\\d*|0[0-7]*|0x[\\da-f]+)',
        '(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?',
        '(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?',
        '(?:\\.([1-9]\\d*|0[0-7]*|0x[\\da-f]+))?$'
    ].join(''), 'i');

    argIP = argIP.match(pattern); // Verify argIP format.
    if (!argIP) {
        // Invalid format.
        return false;
    }
    // Reuse argIP variable for component counter.
    argIP[0] = 0;
    for (i = 1; i < 5; i += 1) {
        argIP[0] += !!((argIP[i] || '').length);
        argIP[i] = parseInt(argIP[i]) || 0;
    }
    // Continue to use argIP for overflow values.
    argIP.push(256, 256, 256, 256);
    // Recalculate overflow of last component supplied to make up for missing components.
    argIP[4 + argIP[0]] *= Math.pow(256, 4 - argIP[0]);
    if (argIP[1] >= argIP[5] ||
        argIP[2] >= argIP[6] ||
        argIP[3] >= argIP[7] ||
        argIP[4] >= argIP[8]) {
        return false;
    }

    return BigInteger(argIP[1] * (argIP[0] === 1 || 16777216) +
        argIP[2] * (argIP[0] <= 2 || 65536) +
        argIP[3] * (argIP[0] <= 3 || 256) +
        argIP[4] * 1);
}

/**
 * This function is used to check count of substring in given string
 */
function checkCount(str, substring) {
    var c = 0;
    for (var i = 0; i < str.length; i++) {
        if (substring == str.substr(i, substring.length)) {
            c++;
        }
    }
    return c;
}

/*
 * This function is used to generated random string based on given length
 */

function generate_string(len, char) {
    var str = '';
    for (i = 0; i < len; i++) {
        str = str + char[randomNumber(0, char.length)];
        trace(char.length);
    }
    return str;
}


/*
 * This function is used to validate all _uzm related cookie.
 * This will validate cookie based on configuration and it's value
 */

function validateCookies(requestObj) {
    var uzmcLength = 12,
        uuidLength = 36,
        timeLength = 10,
        uzmc_a = 5,
        uzmc_b = 10,
        uzmc_c = 7,
        uzmc_d = 3,
        uzmc_e = 1,
        uzma = checkCookie('__uzma'),
        uzmb = checkCookie('__uzmb'),
        uzmc = checkCookie('__uzmc'),
        uzmd = checkCookie('__uzmd'),
        _uzma, _uzmb, _uzmc, _uzmd;

    if (uzma && uzmb && uzmc && uzmd) {
        var uzmcCounter = uzmc.value.substr(uzmc_a, uzmc.value.length - uzmc_b),
            sheildSquareCounter = (uzmcCounter - uzmc_c) / uzmc_d + uzmc_e;

        var checkUzmb_c = false,
            checkUzmc_b_d = false,
            is_Cookie_tampered = false;

        if (isNaN(uzmb.value) || isNaN(uzmc.value)) {
            checkUzmb_c = true;
        }
        if (uzmc.value.length < uzmcLength || parseInt(uzmb.value).toString().length != timeLength || parseInt(uzmd.value).toString().length != timeLength) {
            checkUzmc_b_d = true;
        }
        if (uzma.value.length != uuidLength || checkUzmb_c || checkUzmc_b_d || sheildSquareCounter < uzmc_e || sheildSquareCounter != Math.floor(sheildSquareCounter)) {
            is_Cookie_tampered = true;
        }
        _uzma = uzma.value;
        _uzmb = uzmb.value;
        _uzmc = getpageSession();
        _uzmd = getRequestTimeCookie();

        if (is_Cookie_tampered) {
            ssLogger.info('Cookie has been tempared  _uzma : {0}, _uzmb : {1} ,_uzmc : {2},_uzmd : {3}', uzma.value, uzmb.value, uzmc.value, uzmd.value);
        }
    } else {
        // We have created new values as one of the cookie is not exist
        _uzma = gettimestampCookie();
        _uzmb = getfirstRequestTimeCookie();
        _uzmc = getpageSession();
        _uzmd = getRequestTimeCookie();
    }
    var cookieObj = {
        '__uzma': _uzma,
        '__uzmb': _uzmb,
        '__uzmc': _uzmc,
        '__uzmd': _uzmd
    };
    for (var i in cookieObj) {
        requestObj[i] = cookieObj[i];
    }
    return requestObj;
}

/*
 * This function is adding additional headers in request object if it is exist in upcoming request 
 */
function addHeaders(requestObj) {
    var configHeader = {
        'REMOTE_ADDR': 'i0',
        'X-Forwarded-For': 'i1',
        'HTTP_CLIENT_IP': 'i2',
        'HTTP_X_FORWARDED_FOR': 'i3',
        'x-real-ip': 'i4',
        'HTTP_X_FORWARDED': 'i5',
        'Proxy-Client-IP': 'i6',
        'WL-Proxy-Client-IP': 'i7',
        'True-Client-IP': 'i8',
        'HTTP_X_CLUSTER_CLIENT_IP': 'i9',
        'HTTP_FORWARDED_FOR': 'i10',
        'HTTP_FORWARDED': 'i11',
        'HTTP_VIA': 'i12',
        'X-True-Client-IP': 'i13'
    };
    for (var header in request.getHttpHeaders().keySet()) {
        var headerOne = request.getHttpHeaders().keySet()[header];
        for (var i in configHeader) {
            if (headerOne.indexOf(i.toLowerCase()) > -1) {
                requestObj[configHeader[i]] = request.getHttpHeaders().get(headerOne);
            }
        }
    }
    return requestObj;
}
/*
 * This function is used to generate Random number 
 */
function randomNumber(min, max) {
    return parseInt(Math.floor(Math.random() * (max - min) + min));
}



/*
 * This function is used to check current request time from Cookie.
 */
function getRequestTimeCookie() {
    var cookie = new Cookie('__uzmd', parseInt((new Date().getTime()) / 1000));
    cookie.setMaxAge(315360000);
    cookie.setPath('/');
    if (shieldSquareAdvanceConfig._is_secure != 'False') {
        cookie.setSecure(true);
    }
    cookie.setHttpOnly(true);
    response.addHttpCookie(cookie);
    return cookie.value;
}

/*
 * This function converting given number to hexadecimal 
 */
function toHex(randomnumber) {
    var rem,
        hexVal = '',
        hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

    while (randomnumber > 0) {
        rem = randomnumber % 16;
        hexVal = hex[rem] + hexVal;
        randomnumber = parseInt(randomnumber / 16);
    }
    return hexVal;
}

/*
 * This function is used to generate unique identifier value.
 */
function generate_pid() {
    var min = 10000,
        max = 65000,
        random1 = randomNumber(min, max),
        hexrandom1 = toHex(random1).toString(),
        random2 = randomNumber(min, max),
        hexrandom2 = toHex(random2).toString();

    var hexvalue = hexrandom1 + hexrandom2;

    //subscription Id
    var s_id = Site.getCustomPreferenceValue('shieldSquareSubscriberID'),
        subscription_id = s_id.split('-')[3],
        currentDate = new Date().getTime(),
        seconds = parseInt(currentDate / 1000).toString(),
        hexrandom = toHex(seconds).toString();

    var last = hexrandom.substring(4, 8),
        array = last.split('');

    array.reverse();

    var random_digit = array.join('');

    //One random number
    var random_num = randomNumber(min, max),
        random_hex = toHex(random_num).toString();

    // three random number
    var random_1 = randomNumber(min, max),
        hexrandom_1 = toHex(random_1).toString(),
        random_2 = randomNumber(min, max),
        hexrandom_2 = toHex(random_2).toString(),
        random_3 = randomNumber(min, max),
        hexrandom_3 = toHex(random_3).toString();

    var threehexvalue = hexrandom_1 + hexrandom_2 + hexrandom_3,
        PID = hexvalue + '-' + subscription_id + '-' + random_digit + '-' + random_hex + '-' + threehexvalue,
        _zpsbd2 = PID.toLowerCase();

    return _zpsbd2;
}


/*
 * This function is used to check current request time from Cookie.
 */
function getfirstRequestTimeCookie() {
    var cookie = new Cookie('__uzmb', parseInt((new Date().getTime()) / 1000));
    cookie.setMaxAge(315360000);
    cookie.setPath('/');
    if (shieldSquareAdvanceConfig._is_secure != 'False') {
        cookie.setSecure(true);
    }
    cookie.setHttpOnly(true);
    response.addHttpCookie(cookie);
    return cookie.value;
}
/*
 * This function is generating UUID4
 */
function generateUUID4() {
    var dt = new Date().getTime(),
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    return uuid;
}

/*
 * This function is used for identifying the number of pages accessed in the session.
 */
function gettimestampCookie() {
    var uuid = generateUUID4();

    var cookie = new Cookie('__uzma', uuid);
    cookie.setMaxAge(15778800);
    cookie.setPath('/');
    if (shieldSquareAdvanceConfig._is_secure != 'False') {
        cookie.setSecure(true);
    }
    cookie.setHttpOnly(true);
    response.addHttpCookie(cookie);
    return cookie.value;
}
/**
 * This function is used to get session Id. First it will check if session id exist in cookie or not.
 * If not It will create session cookie
 */
function getSessionCookie() {
    var result = checkCookie('_sessid');
    if (!empty(result)) {
        return result.value;
    } else {
        var sessID = shieldSquareAdvanceConfig._sessid ? shieldSquareAdvanceConfig._sessid : '';
        var cookie = new Cookie('_sessid', sessID);
        cookie.setPath('/');
        if (shieldSquareAdvanceConfig._is_secure != 'False') {
            cookie.setSecure(true);
        } else {
            cookie.setSecure(false);
        }
        cookie.setHttpOnly(true);
        response.addHttpCookie(cookie);
        return cookie.value;
    }
}


/**
 * This function is used to used for identifying the number of pages accessed in the session.
 */
function getpageSession() {
    var result = checkCookie('__uzmc'),
        number;

    var min = 10000,
        max = 99999,
        const1 = 3,
        const2 = 1,
        const3 = 7,
        res = (const1 * const2 + const3).toString(),
        random1 = randomNumber(min, max).toString(),
        random2 = randomNumber(min, max).toString(),
        cookieVal;

    number = random1 + res + random2;

    if (!empty(result)) {
        cookieVal = result.value;
    } else {
        var cookie = cookie = new Cookie('__uzmc', number);
        cookie.setMaxAge(15778800);
        cookie.setPath('/');
        if (shieldSquareAdvanceConfig._is_secure != 'False') {
            cookie.setSecure(true);
        }
        cookie.setHttpOnly(true);
        response.addHttpCookie(cookie);
        return cookie.value;
    }


    var currentval = cookieVal.toString();

    currentval = currentval.substr(5);
    currentval = currentval.substring(0, currentval.length - 5);
    currentNum = new Number(currentval);

    var seqNum = (currentNum - 7) / 3;

    seqNum = (3 * (seqNum + 1) + 7);

    var finalResult = random1 + seqNum.toString() + random2;

    var cookie = cookie = new Cookie('__uzmc', finalResult);
    cookie.setMaxAge(15778800);
    cookie.setPath('/');
    if (shieldSquareAdvanceConfig._is_secure != 'False') {
        cookie.setSecure(true);
    }
    cookie.setHttpOnly(true);
    response.addHttpCookie(cookie);

    return finalResult;
}


/*
 * This function is check the given cookie in current request. If it is exist it will return that cookie.
 */
function checkCookie(name) {
    var cookies = request.getHttpCookies();
    for (var cookie in cookies) {
        if (cookies[cookie].name == name) {
            return cookies[cookie];
        }
    }
    return null;
}
