if (process.env.LOCAL_DEBUG) {
  module.exports = require('./src/index') // 如果是调试模式，加载src中的源码
} else {
  module.exports = require('./dist/index') // dist会发到npm
}
