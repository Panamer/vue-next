## Vue3.0 源码解析


 * 入口文件: entryFile = /runtime$/.test(format) ? `src/runtime.ts` : `src/index.ts`

 * 定义ensureRenderer
 * 如果 renderer 不存在就调用 createRenderer 创建 renderer
 * createRenderer来自于 @vue/runtime-core

 * 又发现 createRenderer 来源于 renderer.ts 文件
 * createRenderer函数接受两个通用参数, HostNode and HostElement
 * return baseCreateRenderer
 * baseCreateRenderer 函数重载  with? hydration
 * return {
      render,
      hydrate,
      createApp: createAppAPI(render, hydrate)
    }
 * 拿到render createApp