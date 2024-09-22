<template>
	<div class="option">
		<div class="label">{{ label }}</div>
		<div class="controls">
			<button @click="decrement">➖</button>
			<div class="wrapper-slider">
				<Slider
					v-model="value"
					v-bind="options"
					tooltipPosition="bottom"
					:lazy="false"
					ref="sliderEl"
				/>
			</div>
			<button @click="increment">➕</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Slider from '@vueform/slider'

interface IProps {
	modelValue: number;
	options: {
		min: number;
		max: number;
		step: number;
	};
	label: string;
}

const sliderEl = ref(null)

const props = defineProps<IProps>()
const emit = defineEmits(['update:modelValue'])

const value = computed({
	get: () => props.modelValue,
	set: (value) => {
		emit('update:modelValue', value)
	}
})

const decrement = () => {
	if(value.value === props.options.min) {
		return
	}
	value.value -= props.options.step
}

const increment = () => {
	if(value.value === props.options.max) {
		return
	}
	value.value += props.options.step
}

const refreshSlider = () => {
	sliderEl.value.refresh(value.value)
}

defineExpose({
	refreshSlider
})

</script>

<style scoped>
.option {
	width: 100%;
	padding: 0 0 50px;
}
.label {
	font-size: 16px;
}
.controls {
	display: flex;
	width: 100%;
	align-items: center;
	gap: 12px;
}
.wrapper-slider {
	width: 100%;
}

</style>
