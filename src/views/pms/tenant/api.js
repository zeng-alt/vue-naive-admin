import { request } from '@/utils'

export default {
  testDataSource: id => request.get(`/tenant/source/test/${id}`),
}
