import Lara from '@primevue/themes/lara';

export default defineNuxtConfig({
    modules: [
        '@primevue/nuxt-module',
        
    ],
    primevue: {
        options: {
            theme: {
                preset: Lara,
                options: {
                    cssLayer: {
                        name: 'primevue',
                        order: 'primevue,tailwind-base, tailwind-utilities'
                    }
                }
            }
            
        }
    }
})





