安装依赖
yarn --ignore-scripts
dev: node scripts/dev.js --sourcemap

Vue3.0 源码解析
入口文件: entryFile = /runtime$/.test(format) ? src/runtime.ts : src/index.ts

export * from '@vue/runtime-dom' 内容来自于runtime-dom

packages/runtime-dom/src/index.ts

定义ensureRenderer

如果 renderer 不存在就调用 createRenderer 创建 renderer

createRenderer来自于 @vue/runtime-core

packages/runtime-core/src/index.ts

又发现 createRenderer 来源于 renderer.ts 文件

createRenderer函数接受两个通用参数, HostNode and HostElement

return baseCreateRenderer

baseCreateRenderer 函数重载 with? hydration

return { render, hydrate, createApp: createAppAPI(render, hydrate) }

拿到render createApp

packages/runtime-core/src/apiCreateApp.ts

输出use/mixin/component 这些API在2.0中都是直接挂在Vue上面的,而在 3.0中 则是挂在我们创建的app上面了 这么做的好处是: 1、一方面是对于测试的时候不同的测试用例之间可能会相互修改全局配置。另一方面如果我们在一个页面中存在着两个不同的 vue 应用，那么很可能因为他们需要的全局配置不同而导致一系列问题

patchFlags 和它的名字一样,它就是一系列标志的集合,来标示一个节点应该怎么更新



初始化流程分析:
app.mount                   index.ts
mount                       apiCreateApp.ts
render                      renderer.ts:2090
patch                       renderer.ts:462
processComponent            renderer.ts:1101
mountComponent              renderer.ts:1172
setupRenderEffect           renderer.ts:1233
effect                      effect.ts:63
reactiveEffect              effect.ts:94
componentEffect             renderer.ts:1234


