import api from '@/api'
import { basePermissions } from '@/settings'

export async function getUserInfo() {
  const res = await api.getUser()
  return res.data || {}
  // const { id, username, avatar, nickName, gender, address, email, roles, currentRole } = res.data || {}
  // return {
  //   id,
  //   username,
  //   avatar,
  //   nickName,
  //   gender,
  //   address,
  //   email,
  //   roles,
  //   currentRole,
  // }
}

export async function getPermissions() {
  let asyncPermissions = []
  try {
    const res = await api.getRolePermissions()
    asyncPermissions = res?.data || []
  }
  catch (error) {
    console.error(error)
  }
  return basePermissions.concat(asyncPermissions)
}
