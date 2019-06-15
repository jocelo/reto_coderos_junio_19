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
    background-color: rgba(123, 123, 123, 0.2);
    border-radius: 15px;
  }

  .visa {
    background: linear-gradient(to right, #5DADE2 0%, #AED6F1 100%);
    
  }

  .master-card {
    background:linear-gradient(to right, #EC7063 0%, #F5B7B1 100%);    
  }

  .amex {
    background: linear-gradient(to right, #45B39D 0%, #A2D9CE 100%);
  }

  .chip-card {
    width: 55px;
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
    left: 10px;
  }

  .upper-section .brand-icon {
    height: 45%;
    position: absolute;
    top: 10px;
    right: 10px;
  }

  .bottom-section {
    position: relative;
    height: 50%;
  }

  .card-number {
    font-size: 30px;
    text-align: center;
  }

  .card-dates {
    text-align: right;
    font-size: 11px;
    margin: 5px 30px;
  }

  .card-dates > div {
    font-weight: bold;
  }

  .card-name {
    font-size: 20px;
    margin: 10px 20px 0;
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
    bottom: 10px;
    position: absolute;
    width: 90%;
  }
</style>

<script>
  import { storeCardNumber, storeCardName, storeCardDates} from './store.js';

  const card = {
    type: '',
    name: '',
    number: '',
    dates: '',
    imageSrc: ''
  },
  chipImage = 'https://cdn.iconscout.com/icon/free/png-512/credit-card-chip-1537934-1302066.png';

  const unsubscribeNumber = storeCardNumber.subscribe(value=>{
    const cardPieces = value;
    card.number = cardPieces.split('').splice(0,4).join('') + ' ' + 
      cardPieces.split('').splice(4,4).join('') + ' ' +
      cardPieces.split('').splice(8,4).join('') + ' ' +
      cardPieces.split('').splice(12,4).join('');

    // IIN details from: 
    // https://en.wikipedia.org/wiki/Payment_card_number#Structure

    if (value.length === 0) {
      card.type = '';
      card.imageSrc = '';
      return;
    }

    if (value.length === 4 && value >= '2221' && value <= '2720') {
      card.type = 'master-card';
      card.imageSrc = 'http://creditcardimagelogos.com/wp-content/themes/e838pqefv3ejmkevzirye533556/files/logos/cdn_subdomain/mastercard_64.png';
      return;
    }

    if (value.length === 2 && value === '34' || value === '37') {
      card.type = 'amex';
      card.imageSrc = 'http://creditcardimagelogos.com/wp-content/themes/e838pqefv3ejmkevzirye533556/files/logos/new/cdn_subdomain/american_express_logo_5.gif';
      return;
    }

    if (value.length === 1 && value === '4') {
      card.type = 'visa';
      card.imageSrc = 'http://creditcardimagelogos.com/wp-content/themes/e838pqefv3ejmkevzirye533556/files/logos/new/cdn_subdomain/visa_logo_8.gif'
      return;
    }
  });

  const unsubscribeName = storeCardName.subscribe(value=>card.name=value);
  const unsubscribeDates = storeCardDates.subscribe(value=>card.dates=value);
</script>

<div class="card-container">
  <div class="card {card.type}">
    <div class="upper-section">
      <div class="chip"> <img src={chipImage} alt='default chip image' class="chip-card"> </div>
      { #if card.imageSrc !== '' }
      <div class="brand-icon"> 
        <img alt="Loading main image" src={card.imageSrc} class=""> 
      </div>
      { /if }
    </div>
    <div class="bottom-section">
      <div class="card-number">{card.number}</div>
      { #if card.dates !== '' }
      <div class="card-dates">Good through: <div>{card.dates}</div> </div>
      { /if }
      <div class="card-name">{card.name}</div>
    </div>

  </div>
</div>