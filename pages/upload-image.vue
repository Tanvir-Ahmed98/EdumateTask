<template>
  <div>
    <ImageCropper
      :cropWidth="400"
      :cropHeight="400"
      :quality="0.8"
      @image-cropped="handleCroppedImage"
    />
  </div>
</template>

<script setup>
import ImageCropper from '~/pages/components/ImageCropper.vue';

const handleCroppedImage = (image) => {
  console.log('Cropped Image:', image);
};
</script>
