/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:29:27
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from '@/utils'

export default {
  save: data => request.post('/main/v1/role', data),
  create: data => request.post('/role', data),
  read: (params = {}) => request.get('/role/page', { params }),
  update: data => request.patch(`/role/${data.id}`, data),
  delete: id => request.delete(`/role/${id}`),

  getAllPermissionTree: () => request.get('/main/v1/menu/resource/tree/all'),
  getAllUsers: (params = {}) => request.get('/user', { params }),
  addRoleUsers: (roleId, data) => request.patch(`/main/v1/user/add/role/${roleId}`, data),
  removeRoleUsers: (roleId, data) => request.patch(`/main/v1/user/remove/role/${roleId}`, data),
}
