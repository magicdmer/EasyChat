<script setup lang="ts">
import { NButton, NTag } from 'naive-ui'
import { SvgIcon } from '@/components/common'

const repositoryUrl = 'https://github.com/magicdmer/EasyChat'
const issuesUrl = `${repositoryUrl}/issues`
const appVersion = __APP_VERSION__
</script>

<template>
  <section class="about-page" :aria-label="$t('setting.about')">
    <div class="about-card">
      <img class="about-logo" src="/favicon.svg" alt="EasyChat">

      <div class="about-heading">
        <h2>{{ $t('common.appName') }}</h2>
        <p>{{ $t('setting.aboutTagline') }}</p>
      </div>

      <NTag round :bordered="false" class="version-tag">
        {{ $t('setting.version') }} {{ appVersion }}
      </NTag>

      <p class="about-description">
        {{ $t('setting.aboutDescription') }}
      </p>

      <div class="about-actions">
        <NButton
          tag="a"
          :href="repositoryUrl"
          target="_blank"
          rel="noopener noreferrer"
          type="primary"
        >
          <template #icon>
            <SvgIcon icon="ri:github-fill" />
          </template>
          {{ $t('setting.aboutGithub') }}
        </NButton>
        <NButton
          tag="a"
          :href="issuesUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <template #icon>
            <SvgIcon icon="ri:question-answer-line" />
          </template>
          {{ $t('setting.aboutIssues') }}
        </NButton>
      </div>

      <p class="about-hint">
        {{ $t('setting.aboutIssueHint') }}
      </p>

      <a
        class="license-link"
        href="https://github.com/magicdmer/EasyChat/blob/main/LICENSE"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ $t('setting.aboutLicense') }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.about-page {
  display: flex;
  justify-content: center;
  padding: 48px 20px;
}

.about-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, 560px);
  padding: 40px 32px;
  text-align: center;
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.about-logo {
  width: 72px;
  height: 72px;
  margin-bottom: 20px;
  border-radius: 20px;
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.2);
}

.about-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.about-heading p {
  margin: 8px 0 0;
  color: var(--text-muted);
  font-size: 14px;
}

.version-tag {
  margin-top: 18px;
  color: var(--brand-primary);
  background: var(--surface-hover);
  font-variant-numeric: tabular-nums;
}

.about-description {
  max-width: 440px;
  margin: 24px 0 0;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.75;
}

.about-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

.about-hint {
  margin: 22px 0 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.license-link {
  margin-top: 16px;
  color: var(--text-muted);
  font-size: 12px;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.license-link:hover,
.license-link:focus-visible {
  color: var(--brand-primary);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .about-page {
    padding: 28px 0;
  }

  .about-card {
    padding: 32px 20px;
  }

  .about-logo {
    width: 64px;
    height: 64px;
  }

  .about-heading h2 {
    font-size: 24px;
  }
}
</style>
