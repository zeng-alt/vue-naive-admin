<template>
  <div>
    <n-space vertical :size="12">
      <div class="flex justify-between items-center">
        <h3>菜单</h3>
        <div class="flex gap-2">
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button type="primary"  quaternary>
                <i class="i-material-symbols:person-check mr-4 text-14" />
              </n-button>
            </template>
            分配菜单
          </n-tooltip>
        </div>
      </div>
      <div class="flex">
        <n-input  placeholder="搜索" clearable />
        <NButton class="ml-12" type="primary" >
          <i class="i-material-symbols:add mr-4 text-14" />
          新增
        </NButton>
      </div>

      <!-- <n-tree
        :show-irrelevant-nodes="false"
        :pattern="pattern"
        :data="treeData"
        :selected-keys="[currentMenu?.code]"
        :render-prefix="renderPrefix"
        :render-suffix="renderSuffix"
        :on-update:selected-keys="onSelect"
        key-field="code"
        label-field="name"

        block-line default-expand-all
      /> -->
    </n-space>
  </div>
</template>

<script setup>

</script>