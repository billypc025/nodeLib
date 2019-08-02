/**
 * Created by billy on 2017/2/20.
 */
require("./utils/utils");

global.log = require("./utils/log"); //控制台输出
exports.readline = require('./utils/readLine'); //输入流
exports.path = require("path"); //node原生path
exports.fs = require("fs"); //node原生fs
exports.file = require("./utils/FileUtil"); //fileSystem工具
exports.data = require("./data/DataPool");  //数据池

exports.mark = require("./utils/mark"); //markdown工具
exports.localHost = require("./utils/localhost"); //本地网络模块

//加密,解密
exports.md5 = require("md5");
exports.aes = require("./utils/aes");

//日志
var LogManager = require("./manager/LogManager");
exports.log = new LogManager({name: "system"});
exports.LogManager = LogManager;

//sql工具
var {where, getWhere, getSql, sql}= require("./utils/SqlTool");
exports.where = where;
exports.getWhere = getWhere;
exports.getSql = getSql;
global.sql = sql;

global.g = exports;