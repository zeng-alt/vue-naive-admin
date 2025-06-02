<template>
  <div class="flex flex-col w-full h-full">
    <template v-if="currentTenant">
      <div class="flex justify-between mb-4">
        <h3 class="mb-12">
          租户数据源
        </h3>
        <NButton size="small" type="primary" @click="handleEdit(currentTenant)">
          <i class="i-material-symbols:edit-outline mr-4 text-14" />
          编辑
        </NButton>
      </div>
      <n-descriptions label-style="width: 120px" label-placement="left" bordered :column="3">
        <n-descriptions-item label="编码">
          {{ currentTenant.tenantKey }}
        </n-descriptions-item>
        <n-descriptions-item label="企业名称">
          {{ currentTenant.companyName }}
        </n-descriptions-item>
        <n-descriptions-item label="社会信用代码">
          {{ currentTenant.licenseNumber ?? '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="联系人">
          {{ currentTenant.contactUserName ?? '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="联系电话">
          {{ currentTenant.contactPhone ?? '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="过期时间">
          {{ currentTenant.expireTime ?? '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="用户数量">
          {{ currentTenant.accountCount ?? '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="租户状态">
          {{ currentTenant.status ?? '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="地址">
          {{ currentTenant.address ?? '--' }}
        </n-descriptions-item>
        <n-descriptions-item label="企业简介">
          {{ currentTenant.intro ?? '--' }}
        </n-descriptions-item>
      </n-descriptions>
    </template>
    <div v-else class="w-full h-450 flex justify-center">
      <n-empty size="large" description="请选择租户查看详情" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentTenant: {
    type: Object,
    default: () => null,
  },
})

</script>

<style scoped>


</style>
