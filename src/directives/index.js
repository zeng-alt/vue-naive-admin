/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:23:01
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { router } from '@/router'
import { useEvaluationContext } from '@/composables'
import { useUserStore, usePolicyRuleStore } from '@/store'
import { withDirectives } from 'vue'


const permission = {
  mounted(el, binding) {
    const currentRoute = unref(router.currentRoute)
    const btns = currentRoute.meta?.btns?.map(item => item.code) || []
    const { username } = useUserStore()
    const isSuperAdmin = username === 'superAdmin'

    if (!isSuperAdmin && !btns.includes(binding.value)) {
      el.remove()
    }
  },
}

const policyRule = {
  mounted(el, binding) {
    evaluatePolicyRule(el, binding)
  },
  updated(el, binding) {
    evaluatePolicyRule(el, binding)
  }
}

function evaluatePolicyRule(el, binding) {
  const { username } = useUserStore()
  // if (username === 'superAdmin') {
  //   return
  // }

  let key, variables

  // 兼容数组形式：['key', [context]]
  if (Array.isArray(binding.value)) {
    key = binding.value[0]
    variables = binding.value[1] || []
  } else if (typeof binding.value === 'object' && binding.value !== null) {
    key = binding.value.key
    variables = binding.value.variables || []
  }

  if (!key) {
    console.warn(`v-policy-rule requires a ${key} field`)
    return
  }

  const policyRulesStore = usePolicyRuleStore()
  const rule = policyRulesStore.getPolicyRule(key)

  if (!rule) {
    console.warn(`策略 ${key} 不存在或未编译`)
    el.style.display = 'none'
    return
  }

  const { context } = useEvaluationContext()
  if (!rule.eval(context.value, variables)) {
    el.remove()
  }
}


export function setupDirectives(app) {
  app.directive('permission', permission)
  app.directive('policyRule', policyRule)
}

/**
 * 用于h函数使用自定义权限指令
 *
 * @param {*} vnode 虚拟节点
 * @param {*} code 权限码
 * @returns 返回一个包含权限指令的vnode
 *
 * 使用示例：withPermission(h('button', {class: 'text-red-500'}, '删除'), 'user:delete')
 *
 */
export function withPermission(vnode, code) {
  return withDirectives(vnode, [[permission, code]])
}

/**
 * 用于h函数使用自定义权限指令
 *
 * @param {*} vnode 虚拟节点
 * @param {*} value 指令绑定值
 * @returns 返回一个包含权限指令的vnode
 *
 * withPolicyRule(h('button', {class: 'text-red-500'}, '删除'), '{key: "user:delete", variables: [{name: "", value: {}}]}')
 *
 */
export function withPolicyRule(vnode, value) {
  return withDirectives(vnode, [[policyRule, value]])
}
