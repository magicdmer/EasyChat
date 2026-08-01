<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NModal, NTabPane, NTabs } from 'naive-ui'
import General from './General.vue'
import Advanced from './Advanced.vue'
import Statistics from './Statistics.vue'
import BaseConfig from './About.vue'
import ProjectAbout from './ProjectAbout.vue'
import Site from './Site.vue'
import Mail from './Mail.vue'
import User from './User.vue'
import Key from './Keys.vue'
import Plugin from './Plugin.vue'
import { SvgIcon } from '@/components/common'
import { useUserStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const userStore = useUserStore()
const { isMobile } = useBasicLayout()

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const active = ref('General')

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})
</script>

<template>
  <NModal
    v-model:show="show"
    :auto-focus="false"
    preset="card"
    class="setting-modal"
    :content-style="{ display: 'flex', minHeight: 0, overflow: 'hidden' }"
    :style="{
      width: '1120px',
      maxWidth: `calc(100vw - ${isMobile ? 16 : 32}px)`,
      height: `min(800px, calc(100dvh - ${isMobile ? 16 : 32}px))`,
      overflow: 'hidden',
    }"
  >
    <div class="setting-modal-content">
      <NTabs v-model:value="active" type="line" :animated="false" class="setting-tabs">
        <NTabPane name="General" tab="General">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:file-user-line" />
            <span class="ml-2">{{ $t('setting.general') }}</span>
          </template>
          <div class="min-h-[100px]">
            <General />
          </div>
        </NTabPane>
        <NTabPane name="Advanced" tab="Advanced">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:equalizer-line" />
            <span class="ml-2">{{ $t('setting.advanced') }}</span>
          </template>
          <div class="min-h-[100px]">
            <Advanced />
          </div>
        </NTabPane>
        <NTabPane name="Statistics" tab="Statistics">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:bar-chart-box-line" />
            <span class="ml-2">{{ $t('setting.statistics') }}</span>
          </template>
          <div>
            <Statistics />
          </div>
        </NTabPane>
        <NTabPane name="Plugins" tab="Plugins">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:plug-line" />
            <span class="ml-2">{{ $t('setting.plugins') }}</span>
          </template>
          <div class="min-h-[100px]">
            <Plugin v-if="active === 'Plugins'" />
          </div>
        </NTabPane>
        <NTabPane v-if="userStore.userInfo.root" name="Config" tab="Config">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:list-settings-line" />
            <span class="ml-2">{{ $t('setting.config') }}</span>
          </template>
          <BaseConfig />
        </NTabPane>
        <NTabPane v-if="userStore.userInfo.root" name="SiteConfig" tab="SiteConfig">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:settings-line" />
            <span class="ml-2">{{ $t('setting.siteConfig') }}</span>
          </template>
          <Site />
        </NTabPane>
        <NTabPane v-if="userStore.userInfo.root" name="MailConfig" tab="MailConfig">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:mail-line" />
            <span class="ml-2">{{ $t('setting.mailConfig') }}</span>
          </template>
          <Mail />
        </NTabPane>
        <NTabPane v-if="userStore.userInfo.root" name="UserConfig" tab="UserConfig">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri-user-5-line" />
            <span class="ml-2">{{ $t('setting.userConfig') }}</span>
          </template>
          <User />
        </NTabPane>
        <NTabPane v-if="userStore.userInfo.root" name="KeysConfig" tab="KeysConfig">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri-key-2-line" />
            <span class="ml-2">{{ $t('setting.keysConfig') }}</span>
          </template>
          <Key />
        </NTabPane>
        <NTabPane name="About" tab="About">
          <template #tab>
            <SvgIcon class="text-lg" icon="ri:information-line" />
            <span class="ml-2">{{ $t('setting.about') }}</span>
          </template>
          <ProjectAbout />
        </NTabPane>
      </NTabs>
    </div>
  </NModal>
</template>

<style scoped>
.setting-modal {
  overflow: hidden;
}

.setting-modal-content {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.setting-tabs {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.setting-tabs :deep(.n-tab-pane) {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
