import { request } from '@/utils'

export default {
  saveRule: (data) => request.post('/main/v1/policy/rule', data),
  getPolicyRule: (code, isPreAuth) => request.get(`/main/v1/policy/rule/findRuleByCode/${code}/${isPreAuth}`),
}