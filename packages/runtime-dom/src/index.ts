import {
  createRenderer,
  createHydrationRenderer,
  warn,
  RootRenderFunction,
  CreateAppFunction,
  Renderer,
  HydrationRenderer,
  App,
  RootHydrateFunction
} from '@vue/runtime-core'
import { nodeOps } from './nodeOps'
import { patchProp, forcePatchProp } from './patchProp'
// Importing from the compiler, will be tree-shaken in prod
import { isFunction, isString, isHTMLTag, isSVGTag, extend } from '@vue/shared'

declare module '@vue/reactivity' {
  export interface RefUnwrapBailTypes {
    // Note: if updating this, also update `types/refBail.d.ts`.
    runtimeDOMBailTypes: Node | Window
  }
}

/**
 * gyw
 * export const extend = Object.assign
 * rendererOptions 看上去很费解 其实是合并对象 返回一个object
 * nodeOps 是什么呢? 一个DOM API操作的上层封装, 在vue的生态中 我们称之为平台特性
 * 未来想在其他平台上
 */
const rendererOptions = extend({ patchProp, forcePatchProp }, nodeOps)

// lazy create the renderer - this makes core renderer logic tree-shakable
// in case the user only imports reactivity utilities from Vue.
let renderer: Renderer<Element> | HydrationRenderer

let enabledHydration = false

/**
 * 定义ensureRenderer 获取一个渲染器
 * 如果 renderer 不存在就调用 createRenderer 创建 renderer
 * createRenderer来自于 @vue/runtime-core
 * 单例模式
 */
function ensureRenderer() {
  return renderer || (renderer = createRenderer<Node, Element>(rendererOptions))
}

function ensureHydrationRenderer() {
  renderer = enabledHydration
    ? renderer
    : createHydrationRenderer(rendererOptions)
  enabledHydration = true
  return renderer as HydrationRenderer
}

// use explicit type casts here to avoid import() calls in rolled-up d.ts
export const render = ((...args) => {
  ensureRenderer().render(...args)
}) as RootRenderFunction<Element>

export const hydrate = ((...args) => {
  ensureHydrationRenderer().hydrate(...args)
}) as RootHydrateFunction

/**
 *  入口文件 定义createApp方法
 *  调用ensureRenderer方法 返回值中的createApp
 *  创建vue实例的工厂函数
 */
export const createApp = ((...args) => {
  // 渲染器 renderer 创建实例
  const app = ensureRenderer().createApp(...args)

  if (__DEV__) {
    injectNativeTagCheck(app)
  }
  /**
   * gyw 这里并不是重新实现了mount 而是提取了一些平台相关的逻辑出来
   * 比如读取内部html作为模版 runtime-core并不知道平台特性
   * 但是核心代码代码还是在core目录下
   */
  const { mount } = app
  app.mount = (containerOrSelector: Element | string): any => {
    // 初始化容器 container 可能是元素选择器 或者是 开发者传入的内容
    const container = normalizeContainer(containerOrSelector)
    if (!container) return
    const component = app._component
    // 如果component不是函数式组件 没有render函数 也没有template默认 默认会取标签内的内容
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML
    }
    // clear content before mounting
    container.innerHTML = ''
    const proxy = mount(container)
    container.removeAttribute('v-cloak')
    container.setAttribute('data-v-app', '')
    return proxy
  }

  return app
}) as CreateAppFunction<Element>

export const createSSRApp = ((...args) => {
  const app = ensureHydrationRenderer().createApp(...args)

  if (__DEV__) {
    injectNativeTagCheck(app)
  }

  const { mount } = app
  app.mount = (containerOrSelector: Element | string): any => {
    const container = normalizeContainer(containerOrSelector)
    if (container) {
      return mount(container, true)
    }
  }

  return app
}) as CreateAppFunction<Element>

function injectNativeTagCheck(app: App) {
  // Inject `isNativeTag`
  // this is used for component name validation (dev only)
  Object.defineProperty(app.config, 'isNativeTag', {
    value: (tag: string) => isHTMLTag(tag) || isSVGTag(tag),
    writable: false
  })
}

function normalizeContainer(container: Element | string): Element | null {
  if (isString(container)) {
    const res = document.querySelector(container)
    if (__DEV__ && !res) {
      warn(`Failed to mount app: mount target selector returned null.`)
    }
    return res
  }
  return container
}

// SFC CSS utilities
export { useCssModule } from './helpers/useCssModule'
export { useCssVars } from './helpers/useCssVars'

// DOM-only components
export { Transition, TransitionProps } from './components/Transition'
export {
  TransitionGroup,
  TransitionGroupProps
} from './components/TransitionGroup'

// **Internal** DOM-only runtime directive helpers
export {
  vModelText,
  vModelCheckbox,
  vModelRadio,
  vModelSelect,
  vModelDynamic
} from './directives/vModel'
export { withModifiers, withKeys } from './directives/vOn'
export { vShow } from './directives/vShow'

// re-export everything from core
// h, Component, reactivity API, nextTick, flags & types
export * from '@vue/runtime-core'
