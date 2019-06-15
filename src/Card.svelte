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

  .chip-card {
    width: 60px;
    background-color: #FFFFCC;
    border-radius: 10px;
  }

  .upper-section {
    height: 50%;
    text-align: bottom;
    position: relative;
  }

  .upper-section .chip {
    height: 55%;
    position: absolute;
    bottom: 0;
    left: 0;
  }

  .upper-section .brand-icon {
    height: 45%;
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .card-number {
    font-size: 33px;
    text-align: center;
  }

  .card-name {
    font-size: 25px;
    margin-left: 20px;
  }
</style>

<script>
  import { storeCardNumber, storeCardName } from './store.js';

  let classs = '',
    cardNumber = '',
    cardName = '',
    chipImage = 'https://cdn.iconscout.com/icon/free/png-512/credit-card-chip-1537934-1302066.png';

  const unsubscribeNumber = storeCardNumber.subscribe(value=>{
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

  const unsubscribeName = storeCardName.subscribe(value=>{
    cardName = value;
  });
</script>

<div class="card-container">
  <div class="card {classs}">
    <div class="upper-section">
      <div class="chip"> <img src={chipImage} alt='default chip image' class="chip-card"> </div>
      <div class="brand-icon"> <img alt="Loading main image" src="http://creditcardimagelogos.com/wp-content/themes/e838pqefv3ejmkevzirye533556/files/logos/new/cdn_subdomain/visa_logo_8.gif" class="chip-card"> </div>
    </div>
    <div class="bottom-section">
      <div class="card-number">{cardNumber}</div>
      <div class="card-name">{cardName}</div>    
    </div>


  </div>
</div>