# 基于Lerna管理packages的Monorepo项目最佳实践
  [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)



## 背景

最近在工作中接触到一个项目，这个项目是维护一套CLI，发到NPM上供开发者使用。先看一张图：

![](./docs/current.png)

项目仓库中的根目录上就三个子模块的文件夹，分别对应三个package，在熟悉了构建和发布流程后，有点傻了。工作流程如图中所示：

1. 使用webpack、babel和uglifyjs把pkg-a的src编译到dist
2. 使用webpack、babel和uglifyjs把pkg-b的src编译到dist
3. 使用webpack、babel和uglifyjs把pkg-main的src编译到dist
4. 最后使用copy文件的方式，把pkg-main、pkg-a、pkg-b中编译后的文件组装到pkg-npm中，最终用于发布到npm上去。

**痛点**

1. **不好调试**。因为最终的包是通过文件拷贝的方式组装到一起的，并且都是压缩过的，无法组建一个自上到下的调试流程（实际工作中只能加log，然后重新把包编译组装一遍看效果）

2. **包的依赖关系不清晰**。pkg-a、pkg-b索性没有版本管理，更像是源码级别的，但逻辑又比较独立。pkg-main中的package.json最终会拷贝到pkg-npm中，但又依赖pkg-a、pkg-b中的某些包，所以要把pkg-a、pkg-b中的依赖合并到pkg-main中。pkg-main和pkg-npm的package.json耦合在一起，导致一些本来是工程的开发依赖也会发布到npm上去，变成pkg-npm的依赖包。

3. **依赖的包冗余**。可以看到，pkg-a、pkg-b、pkg-main要分别编译，都依赖了babel、webpack等，要分别cd到各个目录安装依赖。

4. **发布需要手动修改版本号**。 因为最终只发布了一个包，但实际逻辑要求这个包即要全局安装又要本地安装，业务没有拆开，导致要安装两遍。耦合一起，即便使用`npm link`也会导致调试困难，

5. **发版没有`CHANGELOG.md`**。 因为pkg-a、pkg-b都没有真正管理版本，所以也没有完善的CHANGELOG来记录自上个版本发布已来的变动。

整个项目像是一个没有被管理起来的Monorepo。那什么又是Monorepo呢？

## Monorepo vs Multirepo



## Lerna

### Lerna是什么

### Lerna能帮我们做什么

### 开始使用

## Lerna的最佳实践

### standardjs

### 自动生成日志

### 最佳实践背后的工作流