<template>
	<aside :class="{ minimize }">
		<div class="header">
			<h2>Опции:</h2>
			<button class="minimize" @click="minimize = !minimize">−</button>
		</div>
		<div class="content">
			<Option
				ref="amountEl"
				v-model="packs"
				label="Сумма"
				:options="amountOptions"
			/>
			<Option
				ref="packsEl"
				v-model="packs"
				label="Всего пачек"
				:options="packsOptions"
			/>
			<Option
				v-model="rows"
				label="Пачек в колонке"
				:options="rowsOptions"
			/>
			<Option
				v-model="gap"
				label="Промежуток между пачек"
				:options="gapOptions"
			/>
			<label>
				<span>Валюта</span>
				<select v-model="currency">
					<option value="rub" label="Рубль"/>
					<option value="usd" label="Доллар"/>
				</select>
			</label>
		</div>
	</aside>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { Currency } from '../types'
import Option from './Option.vue'

interface IProps {
	packs: number;
	rows: number;
	gap: number;
	currency: Currency;
}

const packsEl = ref(null)
const amountEl = ref(null)

const AMOUNT_IN_ONE_PACK_RUB = 500000
const AMOUNT_IN_ONE_PACK_USD = 10000
const amountInOnePack = (cy: Currency) => {
	return cy === Currency.Rub ? AMOUNT_IN_ONE_PACK_RUB : AMOUNT_IN_ONE_PACK_USD
}

const minimize = ref(false)

const props = defineProps<IProps>()
const emit = defineEmits(['update:packs', 'update:rows', 'update:gap', 'update:currency'])
const setHashNTitle = () => {
	location.hash = `${totalAmount.value}${currency.value}`
	document.title = `Как выглядит ${totalAmountText.value} ${currency.value === 'rub' ? 'рублей' : 'долларов'}`
}

const packs = computed({
	get: () => props.packs,
	set: (value) => {
		emit('update:packs', value)
	}
})
const packsOptions = {
	min: 1,
	max: 2000,
	step: 1,
}
const amountOptions = {
	...packsOptions,
	format: () => totalAmountText.value
}

const totalAmount = computed(() => Math.ceil(packs.value * amountInOnePack(currency.value)))
const totalAmountText = computed(() => {
	let sumText: string;
	if(totalAmount.value < 1000000) {
		sumText = (totalAmount.value / 1000).toFixed(2) + ' тыс.'
	}
	if(totalAmount.value >= 1000000 && totalAmount.value <= 1000000000) {
		sumText = (totalAmount.value / 1000000).toFixed(2) + ' млн.'
	}
	if(totalAmount.value >= 1000000000) {
		sumText = (totalAmount.value / 1000000000).toFixed(2) + ' млрд.'
	}
	return sumText
})

watch(packs, setHashNTitle)

const rows = computed({
	get: () => props.rows,
	set: (value) => {
		emit('update:rows', value)
	}
})
const rowsOptions = {
	min: 1,
	max: 100,
	step: 1,
}

const gap = computed({
	get: () => props.gap,
	set: (value) => {
		emit('update:gap', value)
	}
})
const gapOptions = {
	min: 0,
	max: 1,
	step: 0.01,
	format: {
		decimals: 2
	}
}

const currency = computed({
	get: () => props.currency,
	set: (value) => {
		emit('update:currency', value)
	}
})
watch(currency, () => {
	setHashNTitle()
	amountEl.value.refreshSlider()
})

onMounted(() => {
	if(!location.hash) return

	const match = location.hash.match(/(\d*)(rub|usd)$/);
	if(!match) return

	const currencyHash = match[2] as Currency
	if(currencyHash) {
		currency.value = currencyHash
	}

	const amountHash = match[1]
	if(amountHash) {
		const parseAmount = parseInt(amountHash);
		if(!isNaN(parseAmount)) {
			if(
				parseAmount <= packsOptions.max * amountInOnePack(currencyHash) ||
				parseAmount >= packsOptions.min * amountInOnePack(currencyHash)
			) {
				packs.value = parseAmount / amountInOnePack(currencyHash)
			}
		}
	}
})

</script>

<style scoped>
aside {
	border-radius: 10px;
	background: #ffffff;
	width: 400px;
	z-index: 999;
	position: absolute;
	left: 0;
	top: 0;
	padding: 0 30px;
	border: 1px #383838 solid;
}

.header {
	padding: 10px 0;
	display: flex;
	justify-content: space-between;
	border-bottom: 1px #181818 solid;
}
h2 {
	margin: 0;
	padding: 0;
}
.content {
	padding-top: 10px;
}
aside.minimize .content {
	display: none;
}

aside.minimize .header {
	border-bottom: 1px #ffffff solid;
}

@media (prefers-color-scheme: dark) {
	aside {
		background: #181818;
	}
	aside .header {
		border-bottom: 1px #ffffff solid;
	}
	aside.minimize .header {
		border-bottom: 1px #181818 solid;
	}
}

select {
	font-size: 16px;
	padding: 10px;
	width: 100%;
	margin-bottom: 30px;
	border-radius: 5px;
}
</style>
