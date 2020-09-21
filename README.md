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
createApp 通过  ensureRenderer().createApp 生成app 
ensureRenderer ----  createRenderer{} ----  createAppAPI(render, hydrate)  ---  app.mount  --- render() --- patch() ----   

app.mount                   index.ts           此app是createApp返回的 里面有个自己的mount方法, 渲染器也返回一个app 里面也有个针对平台的mount方法
mount                       apiCreateApp.ts    mount 会 调用 传进来的render方法 
render                      renderer.ts:2090   render内没有太多复杂的逻辑  调用了patch
patch                       renderer.ts:462    patch 根据不同的节点类型 做不同的process加工处理操作
processComponent            renderer.ts:1101   初始化时 执行时这个 按组件处理 触发mountComponent
mountComponent              renderer.ts:1172   创建组件实例、 设置组件实例
setupComponent
setupRenderEffect           renderer.ts:1233   instance.update = effect()       patch()      
effect                      effect.ts:63       相当于2.0的watch track trigger 分别负责依赖收集 依赖更新 
reactiveEffect              effect.ts:94       高阶函数
componentEffect             renderer.ts:1234   具名函数 effect的入参


reactive({
  // 调用 createReactiveObject 创建响应式对象  new Proxy() 拦截get、set 不区分数组、对象 取值时track 设置值时 trigger
})