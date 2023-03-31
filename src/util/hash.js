import CryptoJS from "crypto-js";

/**
 * 计算文件的HASH值
 *
 * @param file 文件
 * @param algorithm 算法，可多选，最后会按照顺序拼接为一个字符串
 * @param callback 回调函数，参数1：文件大小，参数2：已计算大小，返回值（true/false）决定是否继续计算
 * @returns {Promise<String>} MD5
 */
const calculateHash = (file, algorithm, callback) => {
    return new Promise((resolve, reject) => {
        if (typeof algorithm === "string") {
            algorithm = [algorithm];
        }

        var cryptos = [];
        for (const alg of algorithm) {
            switch (alg.toLowerCase()) {
                case "md5":
                    cryptos.push(CryptoJS.algo.MD5.create());
                    break;
                case "sha1":
                    cryptos.push(CryptoJS.algo.SHA1.create());
                    break;
                case "sha256":
                    cryptos.push(CryptoJS.algo.SHA256.create());
                    break;
                case "sha512":
                    cryptos.push(CryptoJS.algo.SHA512.create());
                    break;
                case "ripemd160":
                    cryptos.push(CryptoJS.algo.RIPEMD160.create());
                    break;
                default:
                    return reject(`不支持的算法 ${alg}`);
            }
        }

        var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
            chunkSize = 2097152, // Read in chunks of 2MB
            chunks = Math.ceil(file.size / chunkSize), currentChunk = 0, fileReader = new FileReader();

        fileReader.onload = function (e) {
            const res = CryptoJS.lib.WordArray.create(e.target.result);
            for (const crypto of cryptos) {
                crypto.update(res)
            }
            currentChunk++;

            const fileSize = (currentChunk >= chunks) ? file.size : (currentChunk * chunkSize);
            if (typeof callback == 'function' &&
                callback(fileSize, file.size) === false) {
                return reject("计算终止")
            }

            if (currentChunk < chunks) {
                loadNext();
            } else {
                var ret = "";
                for (const cry of cryptos) {
                    ret += cry.finalize().toString();
                }
                return resolve(ret.toUpperCase());
            }
        };

        fileReader.onerror = function (err) {
            return reject(err.toString());
        };

        function loadNext() {
            const start = currentChunk * chunkSize,
                end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }

        loadNext();
    });
}

/**
 * 将base64字符串解析为对象
 *
 * @param str
 * @returns {any}
 */
const base64Decode = (str) => {
    return JSON.parse(CryptoJS.enc.Base64.parse(str).toString(CryptoJS.enc.Utf8))
}

/**
 * 将字符串进行 base64 编码
 *
 * @param str
 * @returns {string}
 */
const base64Encode = (str) => {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str))
}

export {
    calculateHash,
    base64Decode,
    base64Encode
}
