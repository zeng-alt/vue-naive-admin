import { ref } from 'vue'
import { usePolicyRuleStore } from '@/store'
import api from '@/api'

export function usePolicyRule(key) {
  const result = ref(null)

  const store = usePolicyRuleStore()
  const localData = store.getPolicyRule(key)

  if (localData) {
    result.value = localData
  } else {
    api.getPolicyRule(key, true).then((data) => {
      if (data) {
        store.setPolicyRules(key, data.condition)
        result.value = store.getPolicyRule(key)
      } else {
        console.warn(key + ' 权限规则数据为空')
        result.value = SpelExpressionEvaluator.compile(true)
        // throw new Error(key + ' 获取权限规则数据为空')
      }
    })
  }

  return result
}
