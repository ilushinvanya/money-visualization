<template>
	<aside :class="{ minimize, dragging }">
		<div class="header">
			<h2>Настройки:</h2>
			<div class="minimize-btn" @click="minimize = !minimize">
				<span v-if="minimize">Показать</span>
				<span v-else>Скрыть</span>
			</div>
		</div>
		<div class="content">
			<label>
				<span>Валюта</span>
				<select v-model="currency">
					<option value="rub" label="Рубль"/>
					<option value="usd" label="Доллар"/>
				</select>
			</label>
			<Option
				ref="amountEl"
				v-model="packs"
				v-model:drag="dragging"
				label="Сумма"
				:options="amountOptions"
				:text="totalAmountText"
			/>
			<Option
				v-model="packs"
				v-model:drag="dragging"
				label="Всего пачек"
				:options="packsOptions"
			/>
			<Option
				v-model="rows"
				v-model:drag="dragging"
				label="Пачек в колонке"
				:options="rowsOptions"
			/>
			<Option
				v-model="gap"
				v-model:drag="dragging"
				label="Промежуток между пачек"
				:options="gapOptions"
			/>
			<hr/>
			<div class="info">ℹ️ В одной пачке 100 купюр</div>
			<a href="https://github.com/ilushinvanya/money-visualization" target="_blank" class="github flex flex-center">
				<div class="image">
					<img class="dark-img" src="/static/github-mark.svg"/>
					<img class="light-img" src="/static/github-mark-white.svg"/>
				</div>
				<span>github проекта</span>
			</a>
		</div>

	</aside>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { Currency, isMobile } from '../types'
import Option from './Option.vue'
import { useRouter, useRoute, type LocationQueryRaw } from 'vue-router'

interface IProps {
	packs: number;
	rows: number;
	gap: number;
	currency: Currency;
}

const amountEl = ref(null)

const route = useRoute()
const router = useRouter()

const AMOUNT_IN_ONE_PACK_RUB = 500000
const AMOUNT_IN_ONE_PACK_USD = 10000
const amountInOnePack = (cy: Currency) => {
	return cy === Currency.Rub ? AMOUNT_IN_ONE_PACK_RUB : AMOUNT_IN_ONE_PACK_USD
}

const minimize = ref(isMobile())
const dragging = ref(false)

const props = defineProps<IProps>()
const emit = defineEmits(['update:packs', 'update:rows', 'update:gap', 'update:currency'])

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
	amountEl.value.refreshSlider()
})

const defaultSettings = {
	// amount: totalAmount.value,
	// currency: currency.value,
	gap: gap.value,
	rows: rows.value,
}

interface IRouteQuery extends LocationQueryRaw {
	amount?: string;
	currency?: string;
	gap?: string;
	rows?: string;
}

onMounted(() => {
	const query = route.query as IRouteQuery

	const currencyQuery = query.currency as Currency
	if(/rub|usd/.test(currencyQuery)) {
		currency.value = currencyQuery

		if(query.amount) {
			const parseAmount = parseInt(query.amount);
			if(!isNaN(parseAmount)) {
				if(
					parseAmount <= packsOptions.max * amountInOnePack(currencyQuery) ||
					parseAmount >= packsOptions.min * amountInOnePack(currencyQuery)
				) {
					packs.value = parseAmount / amountInOnePack(currencyQuery)
				}
			}
		}
	}

	if(query.gap) {
		const parseGap = parseFloat(query.gap);
		if(!isNaN(parseGap) && (parseGap <= gapOptions.max || parseGap >= gapOptions.min)) {
			gap.value = parseGap
		}
	}

	if(query.rows) {
		const parseRows = parseInt(query.rows);
		if(!isNaN(parseRows) && (parseRows <= rowsOptions.max || parseRows >= rowsOptions.min)) {
			rows.value = parseRows
		}
	}

})

const allSettings = computed(() => {
	return {
		amount: totalAmount.value,
		currency: currency.value,
		gap: gap.value,
		rows: rows.value,
	}
})
watch(allSettings, () => {

	let query = {} as IRouteQuery
	if(defaultSettings.gap !== gap.value) query.gap = gap.value.toString()
	if(defaultSettings.rows !== rows.value) query.rows = rows.value.toString()
	query.amount = totalAmount.value.toString()
	query.currency = currency.value
	router.replace({ query })

	document.title = `Как выглядит ${totalAmountText.value} ${currency.value === 'rub' ? 'рублей' : 'долларов'}`
}, {
	immediate: true
})

</script>

<style scoped>
aside {
	border-radius: 10px;
	background-color: #ffffff;
	width: 400px;
	z-index: 999;
	position: absolute;
	left: 0;
	top: 0;
	padding: 0 30px;
	border: 1px #383838 solid;
	transition: background-color .4s ease-out .8s;
}
aside.dragging {
	background-color: rgba(255, 255, 255, 0.4);
	transition: background-color .1s ease-in 0s;
}
@media (max-width: 400px) {
	aside {
		width: 100%;
	}
}

.header {
	padding: 10px 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
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

.minimize-btn {
	border-radius: 8px;
	border: 1px solid black;
	padding: 8px;
	font-weight: 500;
	cursor: pointer;
	user-select: none;
	line-height: 16px;
}

select {
	font-size: 16px;
	padding: 10px;
	width: 100%;
	margin-bottom: 15px;
	border-radius: 5px;
}

.github, .info {
	margin: 6px 0;
}

.github .image {
	margin-right: 8px;
}
.github .image img {
	width: 20px;
}
@media (prefers-color-scheme: light) {
	.github .light-img {
		display: none;
	}
	.github .dark-img {
		display: block;
	}
}
@media (prefers-color-scheme: dark) {
	.github .light-img {
		display: block;
	}
	.github .dark-img {
		display: none;
	}
}
</style>
