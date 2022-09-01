<template>
  <Html>
    <Body>
      <NuxtLayout :name="layoutName">
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>

<script lang="ts" setup>
const layoutName = useState('layoutName', () => 'default')
</script>
