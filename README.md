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

整个项目像是一个没有被管理起来的 Monorepo。那什么又是 Monorepo 呢？

## Monorepo vs Multirepo

Monorepo 的全称是 monolithic repository，即单体式仓库，与之对应的是 Multirepo(multiple repository)，这里的“单”和“多”是指每个仓库中所管理的模块数量。

Multirepo 是比较传统的做法，即每一个 package 都单独用一个仓库来进行管理。例如：Rollup, ...

Monorep 是把所有相关的 package 都放在一个仓库里进行管理，**每个 package 独立发布**。 例如：React, Angular, Babel, Jest, Umijs, Vue ...

一图胜千言：

![](./docs/multirepo&monorepo.png)

当然到底哪一种管理方式更好，仁者见仁，智者见智。前者允许多元化发展（各项目可以有自己的构建工具、依赖管理策略、单元测试方法），后者希望集中管理，减少项目间的差异带来的沟通成本。

虽然拆分子仓库、拆分子 NPM 包是进行项目隔离的天然方案，但当仓库内容出现关联时，没有任何一种调试方式比源码放在一起更高效。

结合我们项目的实际场景和业务需要，天然的 MonoRepo ! 因为工程化的最终目的是让业务开发可以 100% 聚焦在业务逻辑上，那么这不仅仅是脚手架、框架需要从自动化、设计上解决的问题，这涉及到仓库管理的设计。

一个理想的开发环境可以抽象成这样：

“**只关心业务代码，可以直接跨业务复用而不关心复用方式，调试时所有代码都在源码中。**”

在前端开发环境中，多 Git Repo，多 Npm 则是这个理想的阻力，它们导致复用要关心版本号，调试需要 Npm Link。而这些是 MonoRepo 最大的优势。

上图中提到的利用相关工具就是今天的主角 Lerna ! Lerna是业界知名度最高的 Monorepo 管理工具，功能完整。

## Lerna

### Lerna是什么

> A tool for managing JavaScript projects with multiple packages.

> Lerna is a tool that optimizes the workflow around managing multi-package repositories with git and npm.

Lerna 是一个管理多个 npm 模块的工具，是 Babel 自己用来维护自己的 Monorepo 并开源出的一个项目。优化维护多包的工作流，解决多个包互相依赖，且发布需要手动维护多个包的问题。

Lerna 现在已经被很多著名的项目组织使用，如：Babel, React, Vue, Angular, Ember, Meteor, Jest 。

一个基本的 Lerna 管理的仓库结构如下：

```
lerna-repo/
    ┣━ packages/
    ┃     ┣━ package-a/
    ┃     ┃      ┣━ ...
    ┃     ┃      ┗━ package.json
    ┃     ┗━ package-b/
    ┃            ┣━ ...
    ┃            ┗━ package.json
    ┣━ ...
    ┣━ lerna.json
    ┗━ package.json
```

### 开始使用

#### 安装

> 推荐全局安装，因为会经常用到 lerna 命令

```
npm i -g lerna
```

#### 项目构建

1. 初始化

```
lerna init
```
> init 命令详情 请参考 [lerna init](https://github.com/lerna/lerna/blob/master/commands/init/README.md)

![](./docs/lerna_init.png)


2. 增加两个 packages

```
lerna create @mo-demo/cli
lerna create @mo-demo/cli-shared-utils
```
> create 命令详情 请参考 [lerna create](https://github.com/lerna/lerna/blob/master/commands/create/README.md)

![](./docs/lerna_create.png)

3. 分别给相应的 package 增加依赖模块

```
lerna add chalk                                           // 为所有 package 增加 chalk 模块
lerna add semver --scope @mo-demo/cli-shared-utils        // 为 @mo-demo/cli-shared-utils 增加 semver 模块
lerna add @mo-demo/cli-shared-utils --scope @mo-demo/cli  // 增加内部模块之间的依赖

```

> add 命令详情 请参考 [lerna add](https://github.com/lerna/lerna/blob/master/commands/add/README.md)

![](./docs/lerna_add.png)

4. 发布

```
lerna publish
```
> publish 命令详情 请参考 [lerna publish](https://github.com/lerna/lerna/blob/master/commands/publish/README.md)

![](./docs/lerna_publish.png)

如下是发布的情况，lerna会让你选择要发布的版本号，我发了@0.0.1-alpha.0 的版本。

> **发布 npm 包需要登陆 npm 账号**

![](./docs/lerna_publish_1.png)

![](./docs/lerna_publish_2.png)

## Lerna的最佳实践

### standardjs

### 自动生成日志

### 最佳实践背后的工作流

##  参考文献

[手摸手教你玩转 Lerna](http://www.uedlinker.com/2018/08/17/lerna-trainning/)

[精读《Monorepo 的优势》](https://mp.weixin.qq.com/s/f2ehHTNK9rx8jNBUyhSwAA)

[使用lerna优雅地管理多个package](https://zhuanlan.zhihu.com/p/35237759)