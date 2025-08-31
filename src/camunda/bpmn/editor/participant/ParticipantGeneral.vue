<script setup>
import {
	NForm, NFormItem, NInput, NCheckbox, NText, NPopover
} from "naive-ui";
import { ref, reactive, onMounted } from 'vue'

const props = defineProps({
	element: Object,
	bpmnModeler: Object
})

const emit = defineEmits(['update-name'])

const modeling = props.bpmnModeler.get('modeling')
const moddle = props.bpmnModeler.get('moddle')
const elementRegistry = props.bpmnModeler.get('elementRegistry')

const currentElement = elementRegistry.get(props.element.id)
const bo = currentElement.businessObject
// 表单数据
const formData = reactive({
	participantName: '',
	participantId: '',
	processId: '',
	processName: '',
	versionTag: '',
	executable: true,
	startableInTasklist: true,
	elementDocumentation: '',
	processDocumentation: '',
	timeTolive: '',
	startable: true,
})

function updateDocumentation(val, element) {
	if (val) {
		const newDocumentation = moddle.create('bpmn:Documentation', {
			text: val
		});

		// 使用 modeling 更新元素的 documentation
		modeling.updateProperties(element, {
			documentation: [newDocumentation]
		});
	} else {
		// 使用 modeling 删除元素的 documentation
		modeling.updateProperties(element, {
			documentation: []
		});
	}
}

function updateElementDocumentation(val) {
	if (val) {
		const newDocumentation = moddle.create('bpmn:Documentation', {
			text: val
		});

		// 使用 modeling 更新元素的 documentation
		modeling.updateProperties(props.element, {
			documentation: [newDocumentation]
		});
	} else {
		// 使用 modeling 删除元素的 documentation
		modeling.updateProperties(props.element, {
			documentation: []
		});
	}
}

function updateProcessDocumentation(val) {
	if (val) {
		const newDocumentation = moddle.create('bpmn:Documentation', {
			text: val
		});

		// 使用 modeling 更新元素的 documentation

		bo.processRef.documentation = [newDocumentation];
	} else {
		// 使用 modeling 删除元素的 documentation
		bo.processRef.documentation = []
	}
}

function updateName(val) {
	modeling.updateLabel(props.element, val);
	formData.name = val
	emit('update-name', val)
}

function updateParticipantName(name) {
	modeling.updateLabel(props.element, name);
	emit('update-name', name)
}

function updateProcessName(name) {
	bo.processRef.name = name
}

function updateTimeToLive(timeToLive) {
	bo.processRef.historyTimeToLive = timeToLive
}

function updateVersionTag(version) {
	bo.processRef.versionTag = version
}

function updateExecutable(executable) {
	bo.processRef.isExecutable = executable
}

function updateStartableInTasklist(startable) {
	bo.processRef.isStartableInTasklist = startable
}

function updateParticipantId(val) {
	const commandStack = props.bpmnModeler.get('commandStack');

	commandStack.execute('element.updateProperties', {
		element: props.element,
		properties: { id: val }
	});
}

const initializeData = () => {
	formData.participantId = bo.id
	formData.processId = bo.processRef.id	|| ''
	formData.participantName = bo.name
	formData.processName = bo.processRef.name
	formData.versionTag = bo.processRef.versionTag
	formData.executable = bo.processRef.isExecutable
	formData.startableInTasklist = bo.processRef.isStartableInTasklist
	formData.elementDocumentation = bo.documentation?.[0]?.text
	formData.processDocumentation = bo.processRef.documentation?.[0]?.text
}


initializeData()

</script>

<template>
	<n-form size="small" :model="formData">
		<n-form-item label="参与者名称" path="participantName">
			<n-input id="name" type="textarea" :rows="1" v-model:value="formData.participantName" size="small" @update:value="updateParticipantName" />
		</n-form-item>

		<n-form-item label="参与者ID" path="participantId">
			<n-input id="id" v-model:value="formData.participantId" size="small" @update:value="updateParticipantId" />
		</n-form-item>

		<n-form-item label="流程ID" path="processId">
			<n-input id="id" :value="formData.processId" size="small" disabled />
		</n-form-item>

		<n-form-item label="流程名称" path="processName">
			<n-input id="name" type="textarea" :rows="1" v-model:value="formData.processName" size="small" @update:value="updateProcessName" />
		</n-form-item>

		<n-form-item path="versionTag" label="版本标签">
			<n-input size="small" v-model:value="formData.versionTag" @update:value="updateVersionTag"/>
		</n-form-item>

		<n-form-item path="timeTolive" label="历史数据保留策略">
			<template #label>
				<n-popover trigger="hover" placement="left">
					<template #trigger>
						<span style="border-bottom: 1px dotted black;">历史数据保留策略</span>
					</template>
					<template #header>
						<n-text strong depth="1">
							在此资源被清理之前的天数
						</n-text>
					</template>
					如果指定了该值，它将优先于引擎的配置
				</n-popover>
			</template>
			<n-input size="small" v-model:value="formData.timeTolive" @update:value="updateTimeToLive"/>
		</n-form-item>

		<n-form-item label="元素文档" path="elementDocumentation">
			<n-input type="textarea" v-model:value="formData.elementDocumentation" @blur="updateElementDocumentation(formData.elementDocumentation)"
				size="small" />
		</n-form-item>

		<n-form-item label="流程文档" path="processDocumentation">
			<n-input type="textarea" v-model:value="formData.processDocumentation" @blur="updateProcessDocumentation(formData.processDocumentation)"
				size="small" />
		</n-form-item>

		<n-form-item>
			<n-checkbox v-model:checked="formData.executable" @update:checked="updateExecutable" style="margin-right: 12px">
				可执行
			</n-checkbox>

			<n-checkbox v-model:checked="formData.startableInTasklist" @update:checked="updateStartableInTasklist"  style="margin-right: 12px">
				任务列表可启动
			</n-checkbox>
		</n-form-item>
	</n-form>
</template>