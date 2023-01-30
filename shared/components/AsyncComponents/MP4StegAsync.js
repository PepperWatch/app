import { defineAsyncComponent } from 'vue';

// Async component with options
const component = defineAsyncComponent({
  loader: () => import('./MP4Steg.vue'),
  delay: 200,
  timeout: 3000,
});


window._newMP4StegPromiseResolver = null;
window._newMP4StegPromise = new Promise((res)=>{
	window._newMP4StegPromiseResolver = res;
});

window.newMP4Steg = async()=>{
	await window._newMP4StegPromise;
	return window.newMP4StegFunc();
};

export default component;
