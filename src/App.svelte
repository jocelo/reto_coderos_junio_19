<style>
	p {
		color: purple;
		font-family: 'Comic Sans MS';
		font-size: 2em;
	}

	.container {
		width: 50%;
		margin: auto;
	}
</style>
<script>
	import Nested from './Nested.svelte';
	import Card from './Card.svelte';
	import AddForm from './AddForm.svelte';

	const name = 'fff';
	const src='https://homepages.cae.wisc.edu/~ece533/images/airplane.png';
	let count = 0;
	let doubled = 0;
	$: {
		console.log(`the count is: ${count}`);
		doubled = count * 2;
	}

	$: if (count == 9) {
		alert('wachaoffffut !!');
	}

	function handleClick() {
		count ++;
	}
</script>

<div class="container">
	<h2>Agregar Nuevo Metodo de Pago</h2>
	<Card />
	<AddForm />
</div>