
import { defineStore } from 'pinia'
import { SpelExpressionEvaluator } from 'spel2js';


export const usePolicyRuleStore = defineStore('policyRule', {
  state: () => ({
    // key -> compiled SpEL expression
    policyRules: new Map()
  }),
  actions: {
    /**
     * 设置策略规则数组
     * @param {Array<{ key: string, condition: string }>} policyRules
     */
    async setPolicyRules(policyRules) {
      const compiledRules = new Map()
      await Promise.all(policyRules.map(item => {
        return new Promise(resolve => {
          try {
            const compiled = SpelExpressionEvaluator.compile(item.condition)
            compiledRules.set(item.key, compiled)
          } catch (e) {
            console.error(`❌ 解析失败: ${item.key}`, e)
          }
          resolve()
        })
      }))

      this.policyRules = compiledRules
    },

    getPolicyRule(key) {
      return this.policyRules.get(key)
    },

    resetPolicyRules() {
      this.$reset()
    },
  },
})
