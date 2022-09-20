<script lang="ts">
	import Router from 'svelte-spa-router';
	import routes from './routes';

	let title = 'damon@localhost ';
	const scrollingText = () => {
		title = title.substring(1, title.length) + title.substring(0, 1);
		document.title = title;
		setTimeout(scrollingText, 1000);
	}
	document.addEventListener('DOMContentLoaded', scrollingText);

</script>

<main>
	<nav id="nav">
		<a href="/">.home()</a>
		<a href="#/projects">.projects()</a>
	</nav>
	<Router {routes}/>
</main>

<style>
	#nav {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		font-weight: bold;
		font-size: 24px;
	}

	#nav a {
		margin: 0 10px;
	}


	/** center text vertically with spaces on mobile */
	@media (max-width: 600px) {
		#nav {
			align-items: center;
			flex-direction: column;
			margin: 10px 0;
			font-size: 22px;

		}
	}

	@media (max-width: 600px) {
		#nav a {
			margin-top: 2px;
		}
	}

	main {
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

</style>
