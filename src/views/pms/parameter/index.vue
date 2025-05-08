<template>
  <GraphqlCrud
    title="角色管理"
    :gql-operations="roleGql"
    :columns="roleColumns"
    :form-preset="roleFormPreset"
    row-key="id"
    :get-extra-query-variables="getRoleFilters"
  >
    <!-- Optional: Customize Action Button Area -->
    <!-- <template #action> -->
    <!-- <NButton type="warning" @click="customAction">Custom Button</NButton> -->
    <!-- </template> -->

    <!-- Define Form Items using the provided slot scope -->
    <template #form-items="{ form, rules }">
      <NFormItem label="角色名称" path="name" :rule="rules.name">
        <NInput v-model:value="form.name" placeholder="请输入角色名称" />
      </NFormItem>
      <NFormItem label="角色编码" path="code" :rule="rules.code">
        <NInput v-model:value="form.code" placeholder="请输入角色编码 (例如 ROLE_ADMIN)" />
      </NFormItem>
      <NFormItem label="描述" path="description">
        <NInput v-model:value="form.description" type="textarea" placeholder="请输入角色描述" />
      </NFormItem>
      <NFormItem label="状态" path="status" :rule="rules.status">
        <NRadioGroup v-model:value="form.status">
          <NSpace>
            <NRadio value="active">
              启用
            </NRadio>
            <NRadio value="inactive">
              禁用
            </NRadio>
          </NSpace>
        </NRadioGroup>
      </NFormItem>
    </template>
  </GraphqlCrud>
</template>

<script setup>
import { GraphqlCrud, MeCrud, MeModal, MeQueryItem } from '@/components'
import gql from 'graphql-tag'
import { NFormItem, NInput, NRadio, NRadioGroup, NSpace } from 'naive-ui'
import { reactive, ref } from 'vue'

// 1. Define GraphQL Operations
const roleGql = {
  queryKey: 'roles', // Key in the query result containing { items, total }
  query: gql`
    query GetRoles($page: Int!, $limit: Int!, $filter: RoleFilterInput) {
      roles(page: $page, limit: $limit, filter: $filter) {
        items {
          id
          name
          code
          description
          status
        }
        total
      }
    }
  `,
  createKey: 'createRole',
  create: gql`
    mutation CreateRole($name: String!, $code: String!, $description: String, $status: String!) {
      createRole(input: { name: $name, code: $code, description: $description, status: $status }) {
        id # Must return at least the id
        name
      }
    }
  `,
  updateKey: 'updateRole',
  update: gql`
    mutation UpdateRole($id: ID!, $name: String, $code: String, $description: String, $status: String) {
      updateRole(id: $id, input: { name: $name, code: $code, description: $description, status: $status }) {
        id # Must return at least the id
        name
      }
    }
  `,
  deleteKey: 'deleteRole', // Can be null if mutation just returns boolean/status
  delete: gql`
    mutation DeleteRole($id: ID!) {
      deleteRole(id: $id) # Or return boolean/status
    }
  `,
}

// 2. Define Table Columns
const roleColumns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '角色名称', key: 'name' },
  { title: '角色编码', key: 'code' },
  { title: '状态', key: 'status', render: row => row.status === 'active' ? '启用' : '禁用' },
  // Action column is added automatically by GraphqlCrud unless overridden
]

// 3. Define Form Preset (Initial values and validation rules)
const roleFormPreset = {
  fields: {
    // id: null, // Handled automatically by rowKey prop
    name: '',
    code: '',
    description: '',
    status: 'active', // Default value
  },
  rules: {
    name: { required: true, message: '请输入角色名称', trigger: ['input', 'blur'] },
    code: { required: true, message: '请输入角色编码', trigger: ['input', 'blur'] },
    status: { required: true, message: '请选择状态', trigger: 'change' },
  },
}

// 4. Optional: Define Filter Logic
const roleFilters = reactive({
  // Example filter structure, adjust based on your GQL schema
  // search: '',
  // status: null,
})
function getRoleFilters() {
  // Return only non-empty filters
  const activeFilters = {}
  // if (roleFilters.search) activeFilters.name_contains = roleFilters.search;
  // if (roleFilters.status) activeFilters.status_eq = roleFilters.status;
  // return activeFilters;
  return null // Return null or {} if no filters
}
</script>
