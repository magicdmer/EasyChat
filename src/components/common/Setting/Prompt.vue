<script lang="ts" setup>
import { computed, ref } from 'vue'
import { NButton, NInput, NModal, NSpace, useMessage } from 'naive-ui'
import { t } from '@/locales'
import { fetchUpdateChatRoomPrompt } from '@/api'
import { useChatStore } from '@/store'

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const chatStore = useChatStore()
const currentChatHistory = computed(() => chatStore.getChatHistoryByCurrentActive)
const ms = useMessage()
const testing = ref(false)
const title = computed(() => {
  const chatTitle = currentChatHistory.value?.title
  return chatTitle ? `${t('chat.roomPrompt')} · ${chatTitle}` : t('chat.roomPrompt')
})

interface Props {
  visible: boolean
  roomId: string
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})

async function handleSaveChatRoomPrompt() {
  if (!currentChatHistory.value)
    return

  testing.value = true
  try {
    const { message } = await fetchUpdateChatRoomPrompt(currentChatHistory.value.prompt ?? '', +props.roomId) as { status: string; message: string }
    ms.success(message)
    show.value = false
  }
  catch (error: any) {
    ms.error(error.message)
  }
  testing.value = false
}
</script>

<template>
  <NModal
    v-model:show="show"
    :auto-focus="false"
    class="custom-card"
    preset="card"
    :style="{
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100dvh - 32px)',
      overflow: 'hidden',
    }"
    :content-style="{ minHeight: 0, overflowY: 'auto' }"
    :title="title"
    size="huge"
    :bordered="false"
  >
    <NInput
      :value="currentChatHistory && currentChatHistory.prompt"
      type="textarea"
      :autosize="{ minRows: 5, maxRows: 10 }"
      placeholder="Prompt for this room, If empty will use Settings -> Advanced -> Role"
      @input="(val) => { if (currentChatHistory) currentChatHistory.prompt = val }"
    />
    <template #footer>
      <NSpace justify="end">
        <NButton :loading="testing" type="primary" @click="handleSaveChatRoomPrompt">
          {{ t('common.save') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
