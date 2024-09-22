<template>
	<Options
		v-model:packs="packs"
		v-model:rows="rows"
		v-model:gap="gap"
		v-model:currency="currency"
	/>

	<a-scene>
		<a-box
			v-for="pack in packs"
			:key="pack"
			rotation="0 0 0"
			:position="getPosition(pack)"
			:width="actualPackSize[0]"
			:depth="actualPackSize[1]"
			:height="actualPackSize[2]"
			:textures="`currency: ${currency}`"
		></a-box>

		<a-plane
			position="0 -0.01 -4"
			rotation="-90 0 0"
			width="5"
			height="5"
			color="#7BC8A4"
			static-body
		></a-plane>
		<a-plane
			position="0 -0.02 -4"
			rotation="90 0 0"
			width="5"
			height="5"
			color="#7BC8A4"
			static-body
		></a-plane>
		<a-entity camera
				  wasd-controls
				  look-controls="enabled: false"
				  orbit-controls="target: 0 0 -4;
				  minDistance: 2;
				  maxDistance: 20;
				  initialPosition: 0 3 -2;
				  rotateSpeed: 0.5"></a-entity>

	</a-scene>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { THREE } from 'aframe';
import Options from './Options.vue';
import { Currency } from '../types'
import {Texture} from "three";

const PACK_SIZE_RUB: number[] = [1.57, 0.69, 0.1]
const PACK_SIZE_USD: number[] = [1.56, 0.662, 0.1]

const actualPackSize = computed(() => {
	return currency.value === Currency.Rub ? PACK_SIZE_RUB : PACK_SIZE_USD
})

const packs = ref(2)
const rows = ref(5)
const gap = ref(0.02)
const currency = ref<Currency>(Currency.Rub)

const SIDES_OF_BANKNOTE = ['right', 'left', 'top', 'bottom', 'front', 'back']
const getTextures = (cy: Currency) => {
	return SIDES_OF_BANKNOTE.map(side => {
		if(['right', 'left', 'front', 'back'].includes(side) && cy === Currency.Usd) {
			return new THREE.TextureLoader().load(`./static/${Currency.Usd}/side.jpg`)
		}
		return new THREE.TextureLoader().load(`./static/${cy}/${side}.jpg`)
	})
}
const TEXTURES = {
	rub: getTextures(Currency.Rub),
	usd: getTextures(Currency.Usd)
}

AFRAME.registerComponent('textures', {
	schema: {
		currency: {type: 'string', default: 'rub'}
	},
	update: function() {
		// this.el.addEventListener('loaded', async () => {});

		const mesh = this.el.getObject3D('mesh');

		// const oldMaterial = mesh.material;
		mesh.material = TEXTURES[this.data.currency].map((texture: Texture) => {
			return new THREE.MeshBasicMaterial({map: texture})
		});
		// oldMaterial.dispose()
	},
})

const matrix = computed(() => {
	const visibleColumns = Math.ceil(packs.value / rows.value)
	let multiply = visibleColumns
	let finish = true
	let result = [1,1]
	while(finish) {
		let first_multiplier = result[0]
		let second_multiplier = result[1]

		let composition = first_multiplier * second_multiplier
		if(composition === multiply) {
			finish = false
			break
		}
		second_multiplier -= 1
		composition = first_multiplier * second_multiplier
		if(composition === multiply) {
			finish = false
			result[1] = second_multiplier
			break
		}
		if(composition > multiply) {
			multiply++
			result = [1,1]
			continue
		}
		result[0]++
		result[1]++
	}
	// 6 on 6 =>
	return result
})

const getPosition = (index: number): string => {

	const currentColumn = Math.ceil(index / rows.value)
	const xCountLength = matrix.value[0]
	const zCountLength = matrix.value[1]

	let xIndex = 0
	let zIndex = 0

	const rowLength = xCountLength;
	for(let z = 1; z <= zCountLength; z++) {

		const from = (z - 1) * rowLength + 1
		const to = rowLength * z

		for(let x = from; x <= to; x++) {
			if(x === currentColumn) {
				zIndex = z
				xIndex = x - (from - 1)
			}
		}
	}

	const firstK = -1/2 * (rowLength - 1)
	const x = (actualPackSize.value[0] + gap.value) * (firstK + (xIndex - 1))


	const banknoteDepthWithGap = actualPackSize.value[2]
	const y = (banknoteDepthWithGap + gap.value) * (index - (rows.value * (currentColumn - 1))) - (banknoteDepthWithGap / 2 + gap.value)

	const banknoteHeightWithGap = actualPackSize.value[1] + gap.value
	const z = banknoteHeightWithGap * (zIndex) - 4 - (zCountLength / 2) * banknoteHeightWithGap - banknoteHeightWithGap  / 2


	return `${x} ${y} ${z}`
};

</script>
