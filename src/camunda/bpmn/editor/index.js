import BoundaryEvent from './event/BoundaryEvent.vue'
import EndEvent from './event/EndEvent.vue'
import IntermediateCatchEvent from './event/IntermediateCatchEvent.vue'
import IntermediateThrowEvent from './event/IntermediateThrowEvent.vue'
import StartEditor from './event/StartEditor.vue'
import Association from './flow/Association.vue'
import DataInputAssociation from './flow/DataInputAssociation.vue'
import SequenceFlow from './flow/SequenceFlow.vue'
import TextAnnotation from './flow/TextAnnotation.vue'
import ComplexGateway from './gateway/ComplexGateway.vue'
import EventBasedGateway from './gateway/EventBasedGateway.vue'
import ExclusiveGateway from './gateway/ExclusiveGateway.vue'
import InclusiveGateway from './gateway/InclusiveGateway.vue'
import ParallelGateway from './gateway/ParallelGateway.vue'
import DataStoreEditor from './panel/DataStoreEditor.vue'
import { componentRegistry } from './panel/EditorComponentRegistry'
import Group from './panel/Group.vue'
import ObjectStoreEditor from './panel/ObjectStoreEditor.vue'
import ProcessEditor from './panel/ProcessEditor.vue'
import Collaboration from './participant/Collaboration.vue'
import Lane from './participant/Lane.vue'
import Participant from './participant/Participant.vue'
import AdHocSubProcess from './sub/AdHocSubProcess.vue'
import CallActivity from './sub/CallActivity.vue'
import SubProcess from './sub/SubProcess.vue'
import TransactionalSubProcess from './sub/TransactionalSubProcess.vue'
import ManualTask from './task/ManualTask.vue'
import ReceiveTask from './task/ReceiveTask.vue'
import SendTask from './task/SendTask.vue'
import ServiceTask from './task/ServiceTask.vue'
import TaskEditor from './task/TaskEditor.vue'
import UserTask from './task/UserTask.vue'

componentRegistry.registerBatch({
  'bpmn:EndEvent': EndEvent,
  'bpmn:StartEvent': StartEditor,
  'bpmn:Process': ProcessEditor,
  'bpmn:Task': TaskEditor,
  'bpmn:ExclusiveGateway': ExclusiveGateway,
  'bpmn:DataStoreReference': DataStoreEditor,
  'bpmn:DataObjectReference': ObjectStoreEditor,
  'bpmn:ParallelGateway': ParallelGateway,
  'bpmn:InclusiveGateway': InclusiveGateway,
  'bpmn:ComplexGateway': ComplexGateway,
  'bpmn:EventBasedGateway': EventBasedGateway,
  'bpmn:IntermediateThrowEvent': IntermediateThrowEvent,
  'bpmn:UserTask': UserTask,
  'bpmn:SubProcess': SubProcess,
  'bpmn:Transaction': TransactionalSubProcess,
  'bpmn:ServiceTask': ServiceTask,
  'bpmn:SendTask': SendTask,
  'bpmn:ReceiveTask': ReceiveTask,
  'bpmn:ManualTask': ManualTask,
  'bpmn:IntermediateCatchEvent': IntermediateCatchEvent,
  'bpmn:AdHocSubProcess': AdHocSubProcess,
  'bpmn:BoundaryEvent': BoundaryEvent,
  'bpmn:SequenceFlow': SequenceFlow,
  'bpmn:DataInputAssociation': DataInputAssociation,
  'bpmn:Association': Association,
  'bpmn:TextAnnotation': TextAnnotation,
  'bpmn:Group': Group,
  'bpmn:Lane': Lane,
  'bpmn:Participant': Participant,
  'bpmn:Collaboration': Collaboration,
  'bpmn:CallActivity': CallActivity,
})
