<template>
    <div>
      <FileUpload
        mode="basic"
        name="image"
        accept="image/*"
        choose-label="Select Image"
        @select="onFileSelect"
      />
  
      <div v-if="imageUrl" class="crop-container">
        <img ref="imageElement" :src="imageUrl" alt="Crop Preview" />
      </div>
  
      <div v-if="imageUrl" class="button-container">
        <button class="p-button p-button-success mt-2" @click="cropImage">Crop Image</button>
        <button class="p-button p-button-secondary mt-2" @click="saveImage">Save Locally</button>
      </div>
  
      <div v-if="compressedImage">
        <h3>Processed Image:</h3>
        <img :src="compressedImage" alt="Compressed Result" />
        <p>Size: {{ compressedImageSize }} KB</p>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, nextTick } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import FileUpload from 'primevue/fileupload';

// Props for customization
const props = defineProps({
  cropWidth: { type: Number, default: 400 },
  cropHeight: { type: Number, default: 400 },
  quality: { type: Number, default: 0.8 },
});

// Emit event for the cropped image
defineEmits(['image-cropped']);

const imageUrl = ref(null);
const compressedImage = ref(null);
const compressedImageSize = ref(null);
const imageElement = ref(null);
let cropper = null;

const onFileSelect = async (event) => {
  const file = event.files[0];
  if (file) {
    imageUrl.value = URL.createObjectURL(file);
    await nextTick();
    if (cropper) {
      cropper.destroy();
    }
    cropper = new Cropper(imageElement.value, {
      aspectRatio: 1,
      viewMode: 2,
    });
  }
};

const cropImage = async () => {
  if (cropper) {
    const canvas = cropper.getCroppedCanvas({
      width: props.cropWidth, // Access cropWidth from props
      height: props.cropHeight, // Access cropHeight from props
    });
    const dataUrl = canvas.toDataURL('image/jpeg', props.quality); // Use quality from props
    await compressImage(dataUrl);
    cropper.destroy();
    cropper = null;

    // Emit the cropped image data
    emit('image-cropped', compressedImage.value);
  }
};

const compressImage = async (dataUrl) => {
  const blob = await fetch(dataUrl).then((res) => res.blob());
  if (blob.size > 1024 * 1024) {
    const compressedBlob = await resizeImage(blob, props.quality);
    compressedImage.value = URL.createObjectURL(compressedBlob);
    compressedImageSize.value = (compressedBlob.size / 1024).toFixed(2);
  } else {
    compressedImage.value = dataUrl;
    compressedImageSize.value = (blob.size / 1024).toFixed(2);
  }
};

const resizeImage = (blob, quality) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = props.cropWidth;
        canvas.height = props.cropHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(blob);
  });

const saveImage = () => {
  if (compressedImage.value) {
    const link = document.createElement('a');
    link.href = compressedImage.value;
    link.download = 'cropped-image.jpg';
    link.click();
  } else {
    alert('Please crop and compress the image first!');
  }
};
</script>

  
  <style>
  .crop-container {
    max-width: 100%;
    max-height: 400px;
    margin-bottom: 20px;
    overflow: hidden;
  }
  
  .button-container {
    display: flex;
    gap: 10px;
  }
  </style>
  