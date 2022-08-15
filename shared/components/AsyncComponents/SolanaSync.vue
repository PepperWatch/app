<template>

	<div></div>

</template>


<script>
// import { initWallet, useWallet } from 'solana-wallets-vue';
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"

// import {
//   PhantomWalletAdapter,
//   SlopeWalletAdapter,
//   SolflareWalletAdapter,
// } from '@solana/wallet-adapter-wallets';

// import { WalletMultiButton } from 'solana-wallets-vue';

// // import { Connection, clusterApiUrl, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
// import { Connection, clusterApiUrl, SystemProgram, Transaction } from '@solana/web3.js';

import Phantom from 'shared/classes/Phantom.js';


export default {
	name: 'SolanaSync',
	data() {
		return {
			initialized: false,
			wallet: null,
			readyState: null,
			connectedAddress: null,
			chainType: null,

			isReady: false,

			metaplexRequested: false,
			metaplexReady: false,
		}
	},
	emits: ['connect', 'connected', 'loaded', 'disconnected', 'error'],
	components: {
		// WalletMultiButton,
	},
	watch: {
		metaplexReady: function() {
			this.$emit('metaplex', this.metaplexReady);
		},
	},
	methods: {
		async importMetaplex(exportData) {
			if (this.wallet) {
				await this.wallet.importMetaplex(exportData);
			} else {
				this.metaplexExportData = exportData;
			}
			this.metaplexReady = this.wallet.isMetaplexReady;
		},
		async connect(chainType = 'devnet') {
			this.$emit('connect');

			const phantom = Phantom.getSingleton(chainType);
			await phantom.init();
			this.wallet = phantom;

			this.connectedAddress = this.wallet.connectedAddress;
			this.chainType = this.wallet.chainType;
			this.metaplexReady = this.wallet.isMetaplexReady;

			this.$emit('connected', this.wallet);

			if (this.metaplexExportData) {
				await this.wallet.importMetaplex(this.metaplexExportData);
			}
			this.metaplexReady = this.wallet.isMetaplexReady;
		},
		async disconnect() {
			await this.wallet.disconnect();
			this.metaplexReady = this.wallet.isMetaplexReady;
			this.$emit('disconnected');
		},
		metaplexLoaded(exportData) {
			this.wallet.importMetaplex(exportData);
			this.metaplexReady = this.wallet.isMetaplexReady;
		},
		async uploadFile(file) {
			return await this.wallet.uploadFile(file);
		},
		async test() {
			await this.wallet.uploadFile();
		}
		// async test() {
		// 	const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
		// 	const { publicKey, signTransaction } = useWallet();
		// 	if (!publicKey.value) return;


		// 	console.error(signTransaction);

		// 	// let airdropSignature = await connection.requestAirdrop(
		// 	// 	publicKey.value,
		// 	// 	LAMPORTS_PER_SOL,
		// 	// );

		// 	// const resp = await connection.confirmTransaction(airdropSignature);

		// 	// console.error('got airdrop', resp);

		// 	// console.error(publicKey.value, Keypair.generate().publicKey)

		// 	let transaction = new Transaction().add(
		// 	SystemProgram.transfer({
		// 	fromPubkey: publicKey.value,
		// 	toPubkey: publicKey.value,
		// 	lamports: 100,
		// 	})
		// 	);

		// 	let { blockhash } = await connection.getRecentBlockhash();
		// 	transaction.recentBlockhash = blockhash;
		// 	transaction.feePayer = publicKey.value;
		// 	let signed = await signTransaction(transaction);
		// 	let txid = await connection.sendRawTransaction(signed.serialize());
		// 	await connection.confirmTransaction(txid);

		// 	// Alternatively, manually construct the transaction
		// 	// let recentBlockhash = await connection.getRecentBlockhash();
		// 	// let manualTransaction = new Transaction({
		// 	// 	recentBlockhash: recentBlockhash.blockhash,
		// 	// 	feePayer: publicKey.value,
		// 	// });
		// 	// manualTransaction.add(SystemProgram.transfer({
		// 	// 	fromPubkey: publicKey.value,
		// 	// 	toPubkey: Keypair.generate().publicKey,
		// 	// 	lamports: 1,
		// 	// }));

		// 	// const s = await sendTransaction(transaction, connection);
		// 	// console.error(s);
		// 	// await connection.getSignatureStatus(signature);

		// 	// const signature2 = await sendTransaction(signature, connection);

		// 	// console.error(signature2)

		// 	// await connection.confirmTransaction(signature, 'processed');
		// },
		// readyStateChanged() {
		// 	// let isReady = false;
		// 	if (this.wallet.ready && !this.wallet.connecting && !this.wallet.disconnecting) {
		// 		const { publicKey } = useWallet();
		// 		if (publicKey && publicKey.value) {
		// 			// isReady = true;
		// 			if (!this.isReady) {
		// 				this.connectedAddress = ''+publicKey.value.toBase58();

		// 				console.error(this.connectedAddress)
		// 				this.isReady = true;
		// 				this.connectedNetName = 'solana';
		// 				this.$emit('connected');

		// 				console.error('connected');

		// 				return true;
		// 			}
		// 		}
		// 	}

		// 	if (this.isReady) {
		// 		this.isReady = false;
		// 		this.connectedAddress = null;
		// 		console.error('disconnected');
		// 	}



		// 	// console.error(this.wallet.connecting, this.wallet.disconnecting, this.wallet.ready, this.wallet);
		// 	// if (this.wallet.connecting || this.wallet.disconnecting) {
		// 	// 	return false;
		// 	// }

		// 	// // NotDetected
		// 	// // Unsupported
		// 	// // Installed
		// 	// if (this.readyState == 'Installed') {
		// 	// 	const { publicKey } = useWallet();
		// 	// 	this.connectedAddress = null;
		// 	// 	if (publicKey && publicKey.value) {
		// 	// 		this.connectedAddress = ''+publicKey.value.toBase58();
		// 	// 	}
		// 	// 	this.connectedNetName = 'solana';
		// 	// 	console.error(this.connectedAddress, 'connected');

		// 	// 	this.$emit('connected');
		// 	// } else if (this.readyState == 'NotDetected') {
		// 	// 	this.$emit('disconnected');

		// 	// 	console.error(this.connectedAddress, 'disconnected');
		// 	// } else {
		// 	// 	this.$emit('error');
		// 	// }
		// },
		// async initialize() {
		// 	const walletOptions = {
		// 		wallets: [
		// 			new PhantomWalletAdapter(),
		// 			new SlopeWalletAdapter(),
		// 			new SolflareWalletAdapter({ network: WalletAdapterNetwork.Devnet }),
		// 		],
		// 		autoConnect: true,
		// 	}
		// 	initWallet(walletOptions);

		// 	this.wallet = useWallet();
		// 	this.readyState = this.wallet.readyState;
		// 	this.readyStateChanged();
		// 	// console.error(this.readyState);

		// 	this.$watch('wallet.readyState', ()=>{
		// 		this.readyState = ''+this.wallet.readyState;
		// 		this.readyStateChanged();
		// 	});
		// 	this.$watch('wallet.connecting', ()=>{
		// 		this.readyState = ''+this.wallet.readyState;
		// 		this.readyStateChanged();
		// 	});

		// 	this.initialized = true;
		// 	// alert(success)

		// 	// const wallet = useWallet();
		// 	// console.error(wallet);
		// }
	},
	mounted: function() {
		this.$emit('loaded');
		this.$emit('icon', Phantom.icon());
		// this.initialize();
	},
	computed: {
	}
}
</script>


<style>

	:root {
	/* Buttons. */
	--swv-button-background-color: #4f46e5;
	--swv-button-text-color: white;
	--swv-button-outline-color: #3730a3;
	--swv-button-hover-background-color: #4338ca;
	--swv-button-disabled-background-color: #475569;
	--swv-button-disabled-text-color: #94a3b8;

	/* Modal. */
	--swv-overlay-background-color: rgba(200, 200, 200, 0.8);
	--swv-modal-background-color: white;
	--swv-modal-text-color: #1f2937;
	--swv-modal-close-button-background-color: #f3f4f6;
	--swv-modal-close-button-text-color: #9ca3af;
	--swv-modal-close-button-hover-text-color: #374151;
	--swv-modal-button-text-color: #1f2937;
	--swv-modal-button-hover-background-color: #f3f4f6;
	--swv-modal-button-outline-color: var(--swv-button-outline-color);

	/* Dropdown. */
	--swv-dropdown-background-color: white;
	--swv-dropdown-item-hover-background-color: #f3f4f6;
	--swv-dropdown-text-color: #1f2937;

	/* Shadows. */
	--swm-modal-shadow: 0 25px 25px rgb(0 0 0 / 0.15);
	--swm-dropdown-shadow: 0px 10px 20px rgba(0, 0, 0, 0.3);

	/* Radius. */
	--swv-button-radius: 2px;
	--swv-modal-radius: 4px;
	--swv-dropdown-radius: 4px;
	--swv-dropdown-item-radius: 2px;
	}

	.swv-dark {
	/* Modal. */
	--swv-overlay-background-color: rgba(0, 0, 0, 0.7);
	--swv-modal-background-color: #1e293b;
	--swv-modal-text-color: white;
	--swv-modal-close-button-background-color: #0f172a;
	--swv-modal-close-button-text-color: #64748b;
	--swv-modal-close-button-hover-text-color: white;
	--swv-modal-button-text-color: white;
	--swv-modal-button-hover-background-color: #0f172a;
	--swv-modal-button-outline-color: white;

	/* Dropdown. */
	--swv-dropdown-background-color: #1e293b;
	--swv-dropdown-item-hover-background-color: #334155;
	--swv-dropdown-text-color: white;

	/* Shadows. */
	--swm-modal-shadow: 0px 8px 20px rgba(0, 0, 0, 0.6);
	}

	.swv-button {
	background-color: transparent;
	border: none;
	color: var(--swv-button-text-color);
	cursor: pointer;
	display: flex;
	align-items: center;
	font-family: 'DM Sans', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
	font-size: 16px;
	font-weight: 600;
	height: 38px;
	line-height: 38px;
	padding: 0 24px;
	border-radius: var(--swv-button-radius);
	}

	.swv-button p {
		margin: 0;
	}

	.swv-button > * + * {
	margin-left: 12px;
	}

	.swv-button-trigger {
	background-color: var(--swv-button-background-color);
	}

	.swv-button:not([disabled]):focus-visible {
	outline-color: var(--swv-button-outline-color);
	}

	.swv-button:not([disabled]):hover {
	background-color: var(--swv-button-hover-background-color);
	}

	.swv-button[disabled] {
	background: var(--swv-button-disabled-background-color);
	color: var(--swv-button-disabled-text-color);
	cursor: not-allowed;
	}

	.swv-button-icon,
	.swv-button-icon img {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	}

	.swv-dropdown {
	position: relative;
	display: inline-block;
	}

	.swv-dropdown-list {
	position: absolute;
	z-index: 99;
	display: grid;
	grid-template-rows: 1fr;
	grid-row-gap: 10px;
	padding: 10px;
	top: 100%;
	right: 0;
	margin: 0;
	list-style: none;
	background: var(--swv-dropdown-background-color);
	color: var(--swv-dropdown-text-color);
	border-radius: var(--swv-dropdown-radius);
	box-shadow: var(--swm-dropdown-shadow);
	opacity: 0;
	visibility: hidden;
	transition: opacity 200ms ease, transform 200ms ease, visibility 200ms;
	font-family: 'DM Sans', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
	}

	.swv-dropdown-list-active {
	opacity: 1;
	visibility: visible;
	transform: translateY(10px);
	}

	.swv-dropdown-list-item {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	border: none;
	outline: none;
	cursor: pointer;
	white-space: nowrap;
	box-sizing: border-box;
	padding: 0 20px;
	width: 100%;
	border-radius: var(--swv-dropdown-item-radius);
	font-size: 14px;
	font-weight: 500;
	height: 37px;
	}

	.swv-dropdown-list-item:not([disabled]):hover {
	background-color: var(--swv-dropdown-item-hover-background-color);
	}

	.swv-modal-collapse-button {
	justify-content: space-between;
	border-radius: 0px 0px var(--swv-modal-radius) var(--swv-modal-radius);
	}

	.swv-modal-collapse-button svg {
	transition: transform ease-in 150ms;
	align-self: center;
	fill: #999;
	}

	.swv-modal-collapse-button.swv-modal-collapse-button-active svg {
	transform: rotate(180deg);
	}

	.swv-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	opacity: 1;
	transition: opacity linear 150ms;
	z-index: 1040;
	overflow-y: auto;
	}

	.swv-modal-logo-wrapper {
	padding: 60px;
	padding-bottom: 0px;
	}

	.swv-modal-logo {
	max-width: 100%;
	max-height: 100px;
	}

	.swv-modal-button-close {
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 18px;
	right: 18px;
	padding: 12px;
	cursor: pointer;
	background: var(--swv-modal-close-button-background-color);
	color: var(--swv-modal-close-button-text-color);
	border: none;
	border-radius: 50%;
	}

	.swv-modal-button-close:hover {
	color: var(--swv-modal-close-button-hover-text-color);
	}

	.swv-modal-button-close:focus-visible {
	outline-color: var(--swv-modal-button-outline-color);
	}

	.swv-modal-button-close svg {
	fill: currentColor;
	transition: fill 200ms ease 0s;
	}

	.swv-modal-overlay {
	background: var(--swv-overlay-background-color);
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	}

	.swv-modal-container {
	display: flex;
	margin: 3rem;
	min-height: calc(100vh - 6rem); /* 100vh - 2 * margin */
	align-items: center;
	justify-content: center;
	}

	@media (max-width: 480px) {
	.swv-modal-container {
	margin: 1rem;
	min-height: calc(100vh - 2rem); /* 100vh - 2 * margin */
	}
	}

	.swv-modal-wrapper {
	box-sizing: border-box;
	position: relative;
	display: flex;
	align-items: center;
	flex-direction: column;
	z-index: 1050;
	max-width: 400px;
	border-radius: var(--swv-modal-radius);
	background: var(--swv-modal-background-color);
	color: var(--swv-modal-text-color);
	box-shadow: var(--swm-modal-shadow);
	font-family: 'DM Sans', 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
	flex: 1;
	}

	.swv-modal-wrapper .swv-button {
	width: 100%;
	color: var(--swv-modal-button-text-color);
	}

	.swv-modal-wrapper .swv-button:not([disabled]):hover {
	background: var(--swv-modal-button-hover-background-color);
	}

	.swv-modal-wrapper .swv-button:not([disabled]):focus-visible {
	outline-color: var(--swv-modal-button-outline-color);
	}

	.swv-modal-title {
	font-weight: 500;
	font-size: 24px;
	line-height: 36px;
	margin: 0;
	padding: 30px 60px;
	text-align: center;
	}

	@media (max-width: 374px) {
	.swv-modal-title {
	font-size: 18px;
	}
	}

	.swv-modal-list {
	margin: 0 0 12px 0;
	padding: 0;
	width: 100%;
	list-style: none;
	}

	.swv-modal-list .swv-button {
	font-weight: 400;
	border-radius: 0;
	font-size: 18px;
	justify-content: space-between;
	}

	.swv-modal-list .swv-button-icon,
	.swv-modal-list .swv-button-icon img {
	width: 28px;
	height: 28px;
	}

</style>