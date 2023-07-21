import App from './App.svelte';

const app = new App({
	//target: document.body,
	target: document.querySelector('#poll_maincontent'),
	props: {
		siteURL: (document.querySelector('#poll_maincontent') || false) ? decodeURIComponent(document.querySelector('#poll_maincontent').getAttribute('data-siteurl')) : '',
		imgURL: (document.querySelector('#poll_maincontent') || false) ? decodeURIComponent(document.querySelector('#poll_maincontent').getAttribute('data-imgurl')) : '',
		downloadResNonce: (document.querySelector('#poll_maincontent') || false) ? decodeURIComponent(document.querySelector('#poll_maincontent').getAttribute('data-downloadresponsesnonce')) : '',
		adminEmail: (document.querySelector('#poll_maincontent') || false) ? decodeURIComponent(document.querySelector('#poll_maincontent').getAttribute('data-email')) : '',
		adminFirstName: (document.querySelector('#poll_maincontent') || false) ? decodeURIComponent(document.querySelector('#poll_maincontent').getAttribute('data-fn')) : '',
		adminLastName: (document.querySelector('#poll_maincontent') || false) ? decodeURIComponent(document.querySelector('#poll_maincontent').getAttribute('data-ln')) : '',
	}
});

export default app;