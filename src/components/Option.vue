<template>
	<div class="option">
		<div class="label">{{ label }}: {{ text || value }}</div>
		<div class="controls">
			<button @click="decrement">➖</button>
			<div class="wrapper-slider">
				<Slider
					v-model="value"
					v-bind="options"
					showTooltip="drag"
					tooltipPosition="top"
					:lazy="false"
					ref="sliderEl"
					@start="ondragstart"
					@end="ondragend"
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
	drag: boolean;
	text?: string | null;
}

const sliderEl = ref(null)

const props = defineProps<IProps>()
const emit = defineEmits(['update:modelValue', 'update:drag'])

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

const ondragstart = () => { emit('update:drag', true) }
const ondragend = () => { emit('update:drag', false) }

</script>

<style scoped>
.option {
	width: 100%;
	padding: 0 0 25px;
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
