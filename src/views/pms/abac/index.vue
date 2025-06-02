
 <template>
  <CommonPage>
    <div class="flex">
      <n-spin size="small" :show="treeLoading">
        <n-collapse-transition :show="show">
          <AbacList></AbacList>
        </n-collapse-transition>
      </n-spin>

      <div class="ml-40 w-0 flex-1">
        <div class="flex justify-between">
          <NButton v-if="show" size="small" type="primary" >
            <i class="i-fe:chevron-right" />
          </NButton>
          <NButton v-else size="small" type="primary" >
            <i class="i-fe:chevron-left" />
          </NButton>
          <NButton size="small" type="primary" >
            <i class="i-material-symbols:edit-outline mr-4 text-14" />
            编辑
          </NButton>
        </div>
        <n-empty class="h-450 f-c-c" size="large" description="请选择权限查看详情" />
      </div>
    </div>
  </CommonPage>
</template>

<script setup>
import { useModal } from '@/composables'
import { MeModal, GraphqlCrud } from '@/components'
import { NButton, NSwitch } from 'naive-ui'
import { ref } from 'vue'
import AbacList from './components/AbacList.vue'

defineOptions({ name: 'AbacMgt' })

const [httpModalRef, okLoading] = useModal()

const show = ref(true)
const treeLoading = ref(false)


</script>
