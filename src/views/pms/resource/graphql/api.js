import { request } from '@/utils'

export default {
  serviceAuthorize: data => request.post('/main/v1/role/service/authorize', data),
  functionAuthorize: data => request.post('/main/v1/role/function/authorize', data),
  serviceCancelAuthorize: data => request.post('/main/v1/role/service/cancel/authorize', data),
  functionCancelAuthorize: data => request.post('/main/v1/role/function/cancel/authorize', data),
}
