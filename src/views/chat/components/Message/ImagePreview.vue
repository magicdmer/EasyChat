<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { SvgIcon } from '@/components/common'
import { t } from '@/locales'

interface Props {
  visible: boolean
  src: string
  alt?: string
}

interface Point {
  x: number
  y: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ (event: 'close'): void }>()
const stageRef = ref<HTMLElement>()
const imageWidth = ref(0)
const imageHeight = ref(0)
const scale = ref(1)
const fitScale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const loading = ref(true)
const loadFailed = ref(false)
const dragging = ref(false)
const pointers = new Map<number, Point>()
let previousBodyOverflow = ''
let dragStart: (Point & { offsetX: number; offsetY: number }) | null = null
let pinchStart: { distance: number; midpoint: Point; scale: number; offsetX: number; offsetY: number } | null = null

const scaleText = computed(() => `${Math.round(scale.value * 100)}%`)
const imageStyle = computed(() => ({
  width: `${imageWidth.value}px`,
  height: `${imageHeight.value}px`,
  transform: `translate(-50%, -50%) translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
}))

function clampScale(value: number) {
  return Math.min(10, Math.max(Math.min(0.05, fitScale.value), value))
}

function getStageCenter(): Point {
  const rect = stageRef.value?.getBoundingClientRect()
  return { x: (rect?.width ?? window.innerWidth) / 2, y: (rect?.height ?? window.innerHeight) / 2 }
}

function calculateFitScale() {
  if (!imageWidth.value || !imageHeight.value)
    return 1
  const width = stageRef.value?.clientWidth ?? window.innerWidth
  const height = stageRef.value?.clientHeight ?? window.innerHeight
  return Math.min((width - 32) / imageWidth.value, (height - 112) / imageHeight.value, 1)
}

function fitToScreen() {
  fitScale.value = calculateFitScale()
  scale.value = fitScale.value
  offsetX.value = 0
  offsetY.value = 0
}

function showActualSize() {
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
}

function setScaleAround(nextScale: number, point?: Point) {
  const clampedScale = clampScale(nextScale)
  const center = getStageCenter()
  const anchor = point ?? center
  const imageX = (anchor.x - center.x - offsetX.value) / scale.value
  const imageY = (anchor.y - center.y - offsetY.value) / scale.value
  offsetX.value = anchor.x - center.x - imageX * clampedScale
  offsetY.value = anchor.y - center.y - imageY * clampedScale
  scale.value = clampedScale
}

function zoomIn() {
  setScaleAround(scale.value * 1.2)
}

function zoomOut() {
  setScaleAround(scale.value / 1.2)
}

function handleWheel(event: WheelEvent) {
  setScaleAround(scale.value * Math.exp(-event.deltaY * 0.0015), { x: event.clientX, y: event.clientY })
}

function handleImageLoad(event: Event) {
  const image = event.target as HTMLImageElement
  imageWidth.value = image.naturalWidth
  imageHeight.value = image.naturalHeight
  loading.value = false
  loadFailed.value = false
  fitToScreen()
}

function handleImageError() {
  loading.value = false
  loadFailed.value = true
}

function getDistance(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y)
}

function getMidpoint(first: Point, second: Point): Point {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
}

function beginPinch() {
  const points = Array.from(pointers.values())
  if (points.length < 2)
    return
  pinchStart = {
    distance: Math.max(getDistance(points[0], points[1]), 1),
    midpoint: getMidpoint(points[0], points[1]),
    scale: scale.value,
    offsetX: offsetX.value,
    offsetY: offsetY.value,
  }
  dragStart = null
}

function handlePointerDown(event: PointerEvent) {
  if (event.button !== 0 && event.pointerType === 'mouse')
    return
  stageRef.value?.setPointerCapture(event.pointerId)
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  dragging.value = true
  if (pointers.size === 1)
    dragStart = { x: event.clientX, y: event.clientY, offsetX: offsetX.value, offsetY: offsetY.value }

  else
    beginPinch()
}

function handlePointerMove(event: PointerEvent) {
  if (!pointers.has(event.pointerId))
    return
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  if (pointers.size >= 2 && pinchStart) {
    const points = Array.from(pointers.values())
    const currentMidpoint = getMidpoint(points[0], points[1])
    const nextScale = clampScale(pinchStart.scale * getDistance(points[0], points[1]) / pinchStart.distance)
    const center = getStageCenter()
    const imageX = (pinchStart.midpoint.x - center.x - pinchStart.offsetX) / pinchStart.scale
    const imageY = (pinchStart.midpoint.y - center.y - pinchStart.offsetY) / pinchStart.scale
    offsetX.value = currentMidpoint.x - center.x - imageX * nextScale
    offsetY.value = currentMidpoint.y - center.y - imageY * nextScale
    scale.value = nextScale
    return
  }
  if (dragStart) {
    offsetX.value = dragStart.offsetX + event.clientX - dragStart.x
    offsetY.value = dragStart.offsetY + event.clientY - dragStart.y
  }
}

function handlePointerUp(event: PointerEvent) {
  pointers.delete(event.pointerId)
  if (stageRef.value?.hasPointerCapture(event.pointerId))
    stageRef.value.releasePointerCapture(event.pointerId)
  pinchStart = null
  const remainingPoint = Array.from(pointers.values())[0]
  if (remainingPoint) {
    dragStart = { ...remainingPoint, offsetX: offsetX.value, offsetY: offsetY.value }
  }
  else {
    dragStart = null
    dragging.value = false
  }
}

function handleDoubleClick() {
  if (Math.abs(scale.value - fitScale.value) < 0.01)
    showActualSize()
  else
    fitToScreen()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape')
    emit('close')
  else if (event.key === '+' || event.key === '=')
    zoomIn()
  else if (event.key === '-')
    zoomOut()
  else if (event.key === '0')
    fitToScreen()
  else if (event.key === '1')
    showActualSize()
}

function downloadImage() {
  const link = document.createElement('a')
  link.href = props.src
  link.download = props.alt?.trim() || 'image'
  link.target = '_blank'
  link.rel = 'noopener'
  link.click()
}

function handleResize() {
  if (!props.visible)
    return
  const wasFitted = Math.abs(scale.value - fitScale.value) < 0.01
  fitScale.value = calculateFitScale()
  if (wasFitted)
    fitToScreen()
}

function resetPreview() {
  imageWidth.value = 0
  imageHeight.value = 0
  scale.value = 1
  fitScale.value = 1
  offsetX.value = 0
  offsetY.value = 0
  loading.value = true
  loadFailed.value = false
  dragging.value = false
  pointers.clear()
}

watch(() => props.visible, async (visible) => {
  if (visible) {
    resetPreview()
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    stageRef.value?.focus()
  }
  else {
    document.body.style.overflow = previousBodyOverflow
  }
}, { immediate: true })

watch(() => props.src, () => {
  if (props.visible)
    resetPreview()
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="stageRef"
      class="image-preview"
      :class="{ 'image-preview--dragging': dragging }"
      role="dialog"
      aria-modal="true"
      :aria-label="t('chat.imagePreview')"
      tabindex="-1"
      @wheel.prevent="handleWheel"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
      @dblclick="handleDoubleClick"
    >
      <div class="image-preview__toolbar" @pointerdown.stop @dblclick.stop>
        <button type="button" :aria-label="t('chat.zoomOut')" :title="t('chat.zoomOut')" @click="zoomOut">
          <SvgIcon icon="ri:subtract-line" />
        </button>
        <span class="image-preview__scale">{{ scaleText }}</span>
        <button type="button" :aria-label="t('chat.zoomIn')" :title="t('chat.zoomIn')" @click="zoomIn">
          <SvgIcon icon="ri:add-line" />
        </button>
        <span class="image-preview__divider" />
        <button type="button" :aria-label="t('chat.fitScreen')" :title="t('chat.fitScreen')" @click="fitToScreen">
          <SvgIcon icon="ri:fullscreen-line" />
        </button>
        <button type="button" :aria-label="t('chat.actualSize')" :title="t('chat.actualSize')" @click="showActualSize">
          <span class="image-preview__actual-size">1:1</span>
        </button>
        <button type="button" :aria-label="t('chat.downloadImage')" :title="t('chat.downloadImage')" @click="downloadImage">
          <SvgIcon icon="ri:download-2-line" />
        </button>
      </div>
      <button type="button" class="image-preview__close" :aria-label="t('chat.closePreview')" :title="t('chat.closePreview')" @pointerdown.stop @dblclick.stop @click="emit('close')">
        <SvgIcon icon="ri:close-line" />
      </button>
      <div v-if="loading" class="image-preview__status">
        <SvgIcon class="image-preview__spinner" icon="ri:loader-4-line" />
      </div>
      <div v-if="loadFailed" class="image-preview__status image-preview__status--error">
        <SvgIcon icon="ri:image-off-line" /><span>{{ t('chat.imageLoadFailed') }}</span>
      </div>
      <img v-show="!loadFailed" class="image-preview__image" :src="src" :alt="alt || t('chat.imagePreview')" :style="imageStyle" draggable="false" @load="handleImageLoad" @error="handleImageError">
    </div>
  </Teleport>
</template>

<style scoped>
.image-preview {
  position: fixed;
  inset: 0;
  z-index: 10000;
  overflow: hidden;
  background: rgba(8, 10, 15, 0.94);
  cursor: grab;
  touch-action: none;
  overscroll-behavior: contain;
  user-select: none;
}

.image-preview--dragging { cursor: grabbing; }

.image-preview__image {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: none;
  max-height: none;
  object-fit: contain;
  pointer-events: none;
  transform-origin: center;
  will-change: transform;
  -webkit-user-drag: none;
}

.image-preview__toolbar {
  position: absolute;
  top: max(16px, env(safe-area-inset-top));
  left: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  background: rgba(28, 30, 38, 0.88);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transform: translateX(-50%);
  backdrop-filter: blur(12px);
}

.image-preview__toolbar button,
.image-preview__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}

.image-preview__toolbar button:hover,
.image-preview__toolbar button:focus-visible,
.image-preview__close:hover,
.image-preview__close:focus-visible {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  outline: none;
}

.image-preview__toolbar button:focus-visible,
.image-preview__close:focus-visible { box-shadow: 0 0 0 2px #818cf8; }
.image-preview__toolbar svg,
.image-preview__close svg { width: 22px; height: 22px; }
.image-preview__scale { width: 52px; color: rgba(255, 255, 255, 0.86); font-size: 12px; font-variant-numeric: tabular-nums; text-align: center; }
.image-preview__actual-size { font-size: 12px; font-weight: 600; }
.image-preview__divider { width: 1px; height: 22px; background: rgba(255, 255, 255, 0.16); }

.image-preview__close {
  position: absolute;
  top: max(16px, env(safe-area-inset-top));
  right: max(16px, env(safe-area-inset-right));
  z-index: 3;
  background: rgba(28, 30, 38, 0.88);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.24);
}

.image-preview__status {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  transform: translate(-50%, -50%);
}

.image-preview__status svg { width: 28px; height: 28px; }
.image-preview__status--error { flex-direction: column; }
.image-preview__spinner { animation: image-preview-spin 800ms linear infinite; }
@keyframes image-preview-spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .image-preview__toolbar { top: auto; bottom: max(16px, env(safe-area-inset-bottom)); gap: 4px; max-width: calc(100vw - 24px); }
  .image-preview__toolbar button { width: 44px; height: 44px; }
  .image-preview__divider { display: none; }
  .image-preview__scale { width: 42px; }
}

@media (prefers-reduced-motion: reduce) {
  .image-preview__toolbar button,
  .image-preview__close { transition: none; }
}
</style>
