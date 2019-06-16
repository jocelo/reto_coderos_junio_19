<style>
  .form-container {
    display: inline-block;
    width: 50%;
  }

  .back-of-card {
    display: flex;
    flex-direction: row;
    position: relative;
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
    background-color: #27AE60;
    color: white;
    padding: 10px 20px;
    cursor: pointer;
  }

  .form-field.back-of-card > input {
    margin: 0;
  }

  .form-field.back-of-card input.margin-left {
    margin: 0 10px;
  }

.form-field.back-of-card > input:last-child {
    background-color: purple;
  }

  .form-field.back-of-card > input.small-width {
    width: 60px;
  }

  .form-field.back-of-card > input.mid-width {
    width: 70px;
  }

  .form-field.back-of-card > .pull-right {
    position: absolute;
    right: 0;
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

  .submit-success {
    text-align: center;
  }

  .submit-success .submit-icon {
    background-color: #27AE60;
    border-radius: 50px;
    width: 100px;
    height: 100px;
    display: inline-block;
  }

  .submit-success .submit-icon::before {
    color: white;
    content: '\2713';
    font-size: 80px;
  }

  .submit-success p {
    font-size: 20px;
    margin: 20px;
    color: #27AE60;
  }
</style>

<script>
  import { storeCardNumber, storeCardName, storeCardDates } from './store';
  
  let invalidName = false,
    invalidNumber = false,
    invalidDates = false,
    formDone = false,
    cardData = {
      cardNumber: '',
      cardHolder: '',
      expMonth: '',
      expYear: '',
      ccv: ''
    };
  
  function onFormSubmit() {
    invalidName = false;
    invalidNumber = false;
    invalidDates = false;
    if (cardData.cardNumber.trim().length < 16) {
      invalidNumber = true;
    }
    if (cardData.cardHolder.trim().length === 0) {
      invalidName = true;
    }
    if (!cardData.expMonth ||
      !cardData.expYear ||
      !cardData.ccv ) {
        invalidDates = true;
    }

    formDone = !invalidNumber && !invalidName && !invalidDates;
  }

  $: {
    storeCardNumber.set(cardData.cardNumber);
    storeCardName.set(cardData.cardHolder);
    storeCardDates.set('');
    if (cardData.expMonth && cardData.expYear) {
      storeCardDates.set(cardData.expMonth+'/'+cardData.expYear);
    }
  }
</script>

<div class="form-container">
{ #if formDone }
  <div class="submit-success">
    <div class="submit-icon"></div>
    <p>El metodo de Pago se agrego exitosamente!</p>
  </div>
{ :else }
  <form class="front-of-card">

    <div class="form-field">
      <input type="text" 
        name="card-number" 
        placeholder="Numero de tarjeta" 
        class="{invalidNumber ? 'invalid' : ''}" 
        bind:value={cardData.cardNumber} 
        maxlength="16" />
      <div class="error-msg {invalidNumber ? 'invalid' : ''}">el numero esta incompleto</div>
    </div>
  
    <div class="form-field">
      <input type="text" 
        name="card-name" 
        placeholder="Nombre de tarjetahabiente"
        class="{invalidName ? 'invalid' : ''}"
        bind:value={cardData.cardHolder} />
      <div class="error-msg {invalidName ? 'invalid' : ''}">el nombre es necesario</div>
    </div>
    
    <div class="form-field back-of-card">
      <input type="number" 
        name="exp-month" 
        placeholder="MM" 
        class="small-width {invalidDates ? 'invalid' : ''}" 
        min="1" max="12"
        bind:value={cardData.expMonth} />
      <input type="number" 
        name="exp-year" 
        placeholder="AAAA" 
        class="mid-width margin-left {invalidDates ? 'invalid' : ''}" 
        min="2010" max="2050"
        bind:value={cardData.expYear} />
      <input type="number" 
        name="ccv" 
        placeholder="CVV" 
        class="mid-width pull-right {invalidDates ? 'invalid' : ''}" 
        min="100" max="999"
        bind:value={cardData.ccv} />
      <div class="error-msg {invalidDates ? 'invalid' : ''}">fechas necesarias</div>
    </div>

    <div class="form-actions">
      <button type="button" on:click={onFormSubmit}>agregar metodo de pago</button>
    </div>

  </form>
{ /if }

</div>