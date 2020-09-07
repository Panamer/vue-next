import { setDevtoolsHook } from '@vue/runtime-dom'
import { getGlobalThis } from '@vue/shared'

export function initDev() {
  // 这个方法会返回global  也是window
  const target = getGlobalThis()
  // target就是window
  target.__VUE__ = true
  // 设置devtools
  setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__)
  // Global compile-time constants  全局常量
  // 在浏览器中给的提示
  if (__BROWSER__) {
    console.info(
      `You are running a development build of Vue.\n` +
        `Make sure to use the production build (*.prod.js) when deploying for production.`
    )
  }
}
