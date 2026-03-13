// useDict.js
import { reactive, ref } from 'vue'
import { fetchDictData } from '@/apollo'
import { useDictStore } from '@/store'

export function useDict(...keys) {
  const result = reactive({})

  keys.forEach((key) => {
    const dictRef = ref([])
    result[key] = dictRef

    const store = useDictStore()
    const localData = store.getDict(key)

    if (localData && localData.length > 0) {
      dictRef.value = localData
    }
    else {
      fetchDictData(key).then(({ data }) => {
        if (!data.queryDictData || data.queryDictData.length === 0) {
          console.error(`${key} 字典数据为空`)
        }
        const dictData = data.queryDictData.map(item => ({
          label: item.dictLabel,
          value: item.dictValue,
          isDefault: item.isDefault,
          listClass: item.listClass,
          disabled: !item.status,
        }))
        store.setDict(key, dictData)
        dictRef.value = dictData
      })
    }
  })

  return result
}
