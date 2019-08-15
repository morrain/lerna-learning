module.exports = function (api) {
  api.cache(true)

  const presets = [
    [
      '@babel/env',
      {
        targets: {
          node: '8.9'
        }
      }
    ]
  ]

  // 非本地调试模式才压缩代码，不然调试看不到实际变量名
  if (!process.env['LOCAL_DEBUG']) {
    presets.push([
      'minify'
    ])
  }

  const plugins = [
    [
      '@babel/plugin-transform-runtime', // 新增加babel-runtime插件，解决polyfill
      {
        corejs: 2
      }
    ]
  ]

  return {
    presets,
    plugins,
    ignore: ['node_modules']
  }
}
