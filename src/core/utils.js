'use strict'

const debug = require('debug')('core:utils')
const fs = require('fs')
const path = require('path')
const logFileStr = path.resolve(process.cwd(), './logs/' + new Date().toString().replace(/\s+/g, '.') + '.log')

async function log (logStr, logFile = logFileStr) {
  debug('log is called')
  await dirExists(path.dirname(logFile))
  let fd = fs.openSync(logFile, 'a')
  const now = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  let str = now + ' : \n' + logStr + '\n'
  fs.appendFileSync(fd, str, 'utf8')
  fs.closeSync(fd)
  return true
}

/**
 * 读取路径信息
 * @param {string} path 路径
 */
function getStat (path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        resolve(false)
      } else {
        resolve(stats)
      }
    })
  })
}

/**
 * 创建路径
 * @param {string} dir 路径
 */
function mkdir (dir) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, err => {
      if (err) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

/**
 * 路径是否存在，不存在则创建
 * @param {string} dir 路径
 */
async function dirExists (dir) {
  let isExists = await getStat(dir)
  // 如果该路径且不是文件，返回true
  if (isExists && isExists.isDirectory()) {
    return true
  } else if (isExists) { // 如果该路径存在但是文件，返回false
    return false
  }
  // 如果该路径不存在
  let tempDir = path.parse(dir).dir // 拿到上级路径
  // 递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
  let status = await dirExists(tempDir)
  let mkdirStatus
  if (status) {
    mkdirStatus = await mkdir(dir)
  }
  return mkdirStatus
}

module.exports.log = log
