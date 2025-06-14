import api from '@/api'
import { basePermissions } from '@/settings'

export async function getUserInfo() {
  const res = await api.getUser()
  return res || {}
}

export async function getPermissions() {
  let asyncPermissions = []
  try {
    const res = await api.getRolePermissions()
    asyncPermissions = res || []
  }
  catch (error) {
    console.error(error)
  }
  return basePermissions.concat(asyncPermissions)
}

export async function getPolicyRules() {
  return [
    {key: 'GetMenuTree', condition: 'true'},
    {key: 'GetUser', condition: 'true'},
    {key: 'TestDataSource', condition: "#dataSource?.db == 'db1'"},
    // {key: 'TestDataSource', condition: "false"},
  ]
}
