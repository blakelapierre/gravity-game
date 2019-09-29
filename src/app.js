import { h, render } from 'preact-cycle';
import bch from 'bitcore-lib-cash';
import lzs from 'lz-string';


if (!localStorage) alert('Warning! Cannot store private key in local storage!');

function getKey () {
  const savedKey = localStorage.getItem('key');

  if (savedKey) {
    return new bch.PrivateKey.fromWIF(lzs.decompressFromUTF16(savedKey));
  }

  const key = new bch.PrivateKey();
  localStorage.setItem('key', lzs.compressToUTF16(key.toWIF()));

  return key;
}

function getAddressDataFromBlockchair (address) {
  return fetch(`https://api.blockchair.com/bitcoin-cash/dashboards/address/${address.toString()}`)
    .then(result => result.json())
    .catch(error => console.log('get address data error', error));
}

function runEvery (time, fn) {
  fn();
  return setInterval(fn, time);
}

const {
  INIT,

  CHECK_ADDRESS_BALANCE,

  UPDATE_ADDRESS_BALANCE
} = {
  INIT (_, mutation) {
    _.inited = true;
    _.mutation = mutation;

    _.key = getKey();
    _.addressString = _.key.toAddress().toString();

    runEvery(30 * 1000, mutation(CHECK_ADDRESS_BALANCE));
    
    return _;
  },

  CHECK_ADDRESS_BALANCE ({mutation, addressString}) {
    getAddressDataFromBlockchair (addressString)
      .then(({data}) => {
        const {address, transactions, utxo} = data[addressString];
        mutation(UPDATE_ADDRESS_BALANCE)(address, transactions, utxo);
      });
  },

  UPDATE_ADDRESS_BALANCE (_, address, transactions, utxo) {
    _.balance = address.balance;
  }
};

const INIT_GUI = ({}, {inited, mutation}) => inited ? <GUI /> : mutation(INIT)(mutation);

const Waiting = () => (
  <waiting>
waiting
  </waiting>
);

const NoBalance = ({}, {addressString}) => (
  <no-balance>
    Please Send BCH to {addressString}
  </no-balance>
);

const Game = () => (
  <game>
game
  </game>
);

const GUI = ({}, {balance}) => (
  <gui>
    {balance === undefined ? <Waiting /> : (balance === 0 ? <NoBalance /> : <Game />)}
  </gui>
);

render(
  INIT_GUI, {
  }, document.body
);
