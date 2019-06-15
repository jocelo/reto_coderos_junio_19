<style>
  .form-container {
    display: inline-block;
    width: 50%;
  }

  .back-of-card {
    display: flex;
    flex-direction: row;
  }

  .form-field {
    margin: 10px;
  }

  .form-field > input {
    width: 100%;
    margin: 0;
  }

  .form-actions {
    text-align: center;
  }

  .form-actions button {
    background-color: green;
    color: white;
    padding: 10px 20px;
    cursor: pointer;
  }

  .form-field.back-of-card > input {
    margin: 0;
  }

  .form-field.back-of-card > input.small-width {
    width: 60px;
  }

  .form-field.back-of-card > input.mid-width {
    width: 70px;
  }

  .error-msg {
    color: orangered;
    font-size: 10px;
    padding: 0;
    padding-top: 5px;
    margin: 0;
    display: none;
  }

  .error-msg.invalid {
    display: block;
  }

  input.invalid {
    box-shadow: 0 0 0 1px orangered;
  }
</style>

<script>
  import { storeCardNumber, storeCardName } from './store';
  
  let invalidForm = false,
    cardNumber = '',
    cardHolder = '';
  
  function formSubmit() {
    invalidForm = true;
  }

  $: {
    console.log('something changed!!', cardNumber);
    storeCardNumber.set(cardNumber);
    storeCardName.set(cardHolder);
  }
</script>

<div class="form-container">
  <form class="front-of-card">

    <div class="form-field">
      <input type="text" 
        name="card-number" 
        placeholder="Numero de tarjeta" 
        class="{invalidForm ? 'invalid' : ''}" 
        bind:value={cardNumber} 
        maxlength="16" />
      <div class="error-msg {invalidForm ? 'invalid' : ''}">Missing</div>
    </div>
  
    <div class="form-field">
      <input type="text" 
        name="card-name" 
        placeholder="Nombre de tarjetahabiente"
        class="{invalidForm ? 'invalid' : ''}"
        bind:value={cardHolder} />
      <div class="error-msg">Missing</div>
    </div>
    
    <div class="form-field back-of-card">
      <input type="number" name="exp-month" placeholder="MM" class="small-width" min="1" max="12" />
      <input type="number" name="exp-year" placeholder="AAAA" class="mid-width" min="2010" max="2050" />
      <input type="number" name="ccv" placeholder="CVV" class="mid-width" min="100" max="999" />
    </div>

    <div class="form-actions">
      <button type="button" on:click={formSubmit}>agregar metodo de pago</button>
    </div>

  </form>
</div>