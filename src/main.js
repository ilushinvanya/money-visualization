import { createApp } from 'vue'
import '@vueform/slider/themes/default.css'
import './style.css'
import App from './components/App.vue'
import Scene from './components/Scene.vue'
import 'aframe';
import 'aframe-orbit-controls';
import { createWebHashHistory, createRouter } from 'vue-router'

const routes = [
	{ path: '/', component: Scene },
]

const router = createRouter({
	history: createWebHashHistory(),
	routes,
})

createApp(App)
	.use(router)
	.mount('#app')
