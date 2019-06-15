<style>
  .card-container{
    display: inline-block;
    width: 49%;
    vertical-align: top;
  }

  .card {
    display: inline-block;
    width: 350px;
    height: 220px;
    background-color: rgba(255,0,0, 0.2);
  }

  .visa {
    background-color:blue;
  }

  .master-card {
    background-color:red;
  }

  .amex {
    background-color: green;
  }

</style>

<script>
  import { storeCardNumber, storeCardName } from './store.js';

  let classs = '',
    cardNumber = '';

  const unsubscribe = storeCardNumber.subscribe(value=>{
    cardNumber = value.split('').splice(0,4).join('') + ' ' + 
      value.split('').splice(4,4).join('') + ' ' +
      value.split('').splice(8,4).join('') + ' ' +
      value.split('').splice(12,4).join('');

    if (value.length === 0) {
      classs = '';
      return;
    }

    if (value.length === 4 && value >= '2221' && value <= '2720') {
      classs = 'master-card';
      return;
    }

    if (value.length === 2 && value === '34' || value === '37') {
      classs = 'amex';
      return;
    }

    if (value.length === 1 && value === '4') {
      classs = 'visa';
      return;
    } 
    // Getting IIN details from: 
    // https://en.wikipedia.org/wiki/Payment_card_number#Structure
  });
</script>

<div class="card-container">
  <div class="card {classs}">
    <div class="">image</div>
    <div class=""> <img src="http://creditcardimagelogos.com/wp-content/themes/e838pqefv3ejmkevzirye533556/files/logos/new/cdn_subdomain/visa_logo_8.gif" alt="Visa logo-67*42.gif"/></div>
    <div class="">1234 1234 1234 1234</div>
    <div class="">Jose Alfredo Alonso Esquivel</div>
  </div>
</div>