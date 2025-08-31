<template>
  <div
    class="camunda-forms-editor"
    style="height: 100vh; padding: 20px; background: #f5f5f5"
  >
    <div
      style="
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        height: 100%;
      "
    >
      <!-- 头部 -->
      <div style="padding: 20px; border-bottom: 1px solid #e8e8e8">
        <h2 style="margin: 0; color: #333">Camunda Forms 编辑器</h2>
        <div style="display: flex; gap: 16px; margin-top: 16px">
          <n-input
            v-model:value="formConfig.formKey"
            placeholder="表单Key"
            style="width: 200px"
            prefix="🔑"
          />
          <n-input
            v-model:value="formConfig.title"
            placeholder="表单标题"
            style="width: 300px"
          />
        </div>
      </div>

      <!-- 标签页 -->
      <n-tabs v-model:value="activeTab" type="line" style="padding: 0 20px">
        <n-tab-pane name="design" tab="设计" style="padding: 20px 0">
          <div style="display: flex; gap: 20px; height: 60vh">
            <!-- 左侧字段列表 -->
            <div
              style="
                flex: 1;
                border: 1px solid #e8e8e8;
                border-radius: 6px;
                padding: 16px;
              "
            >
              <div
                style="
                  display: flex;
                  justify-content: between;
                  align-items: center;
                  margin-bottom: 16px;
                "
              >
                <h3 style="margin: 0">表单字段</h3>
                <n-button
                  type="primary"
                  size="small"
                  @click="openFieldEditor()"
                >
                  <template #icon>
                    <span>➕</span>
                  </template>
                  添加字段
                </n-button>
              </div>

              <n-empty
                v-if="formConfig.fields.length === 0"
                description="暂无字段，点击添加字段开始设计"
              />

              <div
                v-for="(field, index) in formConfig.fields"
                :key="index"
                style="
                  border: 1px solid #e8e8e8;
                  border-radius: 6px;
                  padding: 12px;
                  margin-bottom: 8px;
                  background: #fafafa;
                "
              >
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  "
                >
                  <div>
                    <div style="font-weight: 500">{{ field.label }}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px">
                      ID: {{ field.id }} | 类型:
                      {{
                        fieldTypes.find((t) => t.value === field.type)?.label
                      }}
                      <span v-if="field.required" style="color: #f56565">
                        *必填</span
                      >
                    </div>
                  </div>
                  <div style="display: flex; gap: 4px">
                    <n-button
                      size="tiny"
                      @click="moveField(index, 'up')"
                      :disabled="index === 0"
                      >↑</n-button
                    >
                    <n-button
                      size="tiny"
                      @click="moveField(index, 'down')"
                      :disabled="index === formConfig.fields.length - 1"
                      >↓</n-button
                    >
                    <n-button
                      size="tiny"
                      type="info"
                      @click="openFieldEditor(index)"
                      >编辑</n-button
                    >
                    <n-button
                      size="tiny"
                      type="error"
                      @click="deleteField(index)"
                      >删除</n-button
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧预览 -->
            <div
              style="
                flex: 1;
                border: 1px solid #e8e8e8;
                border-radius: 6px;
                padding: 16px;
              "
            >
              <h3 style="margin: 0 0 16px 0">表单预览</h3>
              <div
                v-if="formConfig.fields.length === 0"
                style="text-align: center; color: #999; padding: 40px"
              >
                添加字段后可在此预览
              </div>
              <n-form v-else>
                <n-form-item
                  v-for="field in formConfig.fields"
                  :key="field.id"
                  :label="field.label + (field.required ? ' *' : '')"
                  style="margin-bottom: 16px"
                >
                  <component :is="renderPreviewField(field)" />
                </n-form-item>
              </n-form>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="json" tab="JSON配置" style="padding: 20px 0">
          <n-input
            type="textarea"
            :value="generateFormJson()"
            placeholder="表单JSON配置"
            :rows="20"
            @blur="importFromJson($event.target.value)"
          />
          <div style="margin-top: 12px; font-size: 14px; color: #666">
            💡 提示：可以直接编辑JSON配置，失焦后自动同步到设计视图
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- 字段编辑弹窗 -->
    <n-modal
      v-model:show="showFieldModal"
      preset="card"
      title="编辑字段"
      style="width: 600px"
    >
      <n-form :model="currentField" label-placement="left" label-width="100px">
        <n-form-item label="字段ID" required>
          <n-input v-model:value="currentField.id" placeholder="字段唯一标识" />
        </n-form-item>

        <n-form-item label="字段标签" required>
          <n-input v-model:value="currentField.label" placeholder="显示名称" />
        </n-form-item>

        <n-form-item label="字段类型">
          <n-select v-model:value="currentField.type" :options="fieldTypes" />
        </n-form-item>

        <n-form-item label="是否必填">
          <n-switch v-model:value="currentField.required" />
        </n-form-item>

        <n-form-item label="默认值">
          <n-input
            v-model:value="currentField.defaultValue"
            placeholder="默认值"
          />
        </n-form-item>

        <n-form-item label="占位符">
          <n-input
            v-model:value="currentField.placeholder"
            placeholder="输入提示"
          />
        </n-form-item>

        <!-- 下拉选择类型的选项配置 -->
        <template v-if="currentField.type === 'enum'">
          <n-form-item label="选项配置">
            <div style="width: 100%">
              <div
                v-for="(option, index) in currentField.options"
                :key="index"
                style="display: flex; gap: 8px; margin-bottom: 8px"
              >
                <n-input v-model:value="option.label" placeholder="显示文本" />
                <n-input v-model:value="option.value" placeholder="选项值" />
                <n-button size="small" type="error" @click="removeOption(index)"
                  >删除</n-button
                >
              </div>
              <n-button size="small" @click="addOption" style="width: 100%"
                >添加选项</n-button
              >
            </div>
          </n-form-item>
        </template>

        <!-- 验证规则 -->
        <template v-if="['string', 'text'].includes(currentField.type)">
          <n-form-item label="最小长度">
            <n-input-number
              v-model:value="currentField.validation.minLength"
              :min="0"
              placeholder="最小长度"
            />
          </n-form-item>
          <n-form-item label="最大长度">
            <n-input-number
              v-model:value="currentField.validation.maxLength"
              :min="0"
              placeholder="最大长度"
            />
          </n-form-item>
          <n-form-item label="验证规则">
            <n-input
              v-model:value="currentField.validation.pattern"
              placeholder="正则表达式"
            />
          </n-form-item>
        </template>
      </n-form>

      <template #footer>
        <div style="display: flex; gap: 8px; justify-content: flex-end">
          <n-button @click="showFieldModal = false">取消</n-button>
          <n-button type="primary" @click="saveField">保存</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script lang="js" setup>
</script>

<style scoped></style>
