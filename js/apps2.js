let web3 ;
let default_account;
let my_contract;

const contract_address = "0x112b370fa7a94e8b6032e3ecd44da16d7a8134a5";
const contract_abi = [{"inputs":[{"internalType":"address","name":"_token_address","type":"address"},{"internalType":"uint256","name":"_airdrop_reward","type":"uint256"},{"internalType":"uint256","name":"_referral_reward","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_address","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"AirdropClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_new_owner","type":"address"}],"name":"OwnershipChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"TokensReceived","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"Claimed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"airdrop_reward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"change_owner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"change_state","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"referral_address","type":"address"}],"name":"claim_airdrop","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"get_balance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"is_active","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"referral_reward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_airdrop_reward","type":"uint256"},{"internalType":"uint256","name":"_referral_reward","type":"uint256"}],"name":"set_rewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"token_address","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"withdraw_token","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]

const loadweb3 = async () => {
  // Modern dapp browsers...
  if (window.ethereum) {
      web3 = new Web3(ethereum);
      try {
          // Request account access if needed
          await ethereum.enable();

          web3.eth.getAccounts(function(err, accounts){ 
            if(!err){
              default_account = accounts[0];
              console.log('Metamask account is: ' + accounts[0]);
            }           
          })

      } catch (error) {
          // User denied account access...
      }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
      web3 = new Web3(web3.currentProvider);

      web3.eth.getAccounts(function(err, accounts){ 
        console.log(err,accounts);
        default_account = accounts[0];
        if(!err){
          console.log('Your Metamask account is: ' + accounts[0]);
        }           
      })
  }
  // Non-dapp browsers...
  else {
     Swal.fire(
  'Connect Alert',
  'Please connect to Wallet: Metamask, Trustwallet...',
  'error'
) 
  }
};

const getAirdrop = async () => {
  await loadweb3();
  const chainId = await web3.eth.getChainId();
  
  if (chainId !== 97) {
   Swal.fire(
  'Connect Alert',
  'Please connect on Binance Smart Chain network',
  'error'
)  
    return
  } else {
    console.log (' Right Network')
  }
	
  contract = new web3.eth.Contract(contract_abi,contract_address);
  
  let referral_address = new URL(window.location.href).searchParams.get('r');
  try {
    if (referral_address) {
      console.log( `referred by : ${referral_address}` )
      referral_address = web3.utils.toChecksumAddress(referral_address);
    } else {
      referral_address = '0x112b370fa7a94e8b6032e3ecd44da16d7a8134a5'
    }
  } catch (error){
    console.log(error.message);
    Swal.fire(
  'Referral Alert',
  'Referral address is not valid',
  'error'
)
  }	
  const haveclaim = await contract.methods.Claimed(default_account).call({from : default_account}, function(error, result){
    console.log(result);
});
    if(haveclaim == true){
       console.log ('Airdrop already claimed!')
      Swal.fire(
  'Claim Alert',
  'Airdrop already claimed!',
  'error'
)
    return
  } 
  txn = contract.methods.claim_airdrop(referral_address).send({from : default_account});
  txn.on('receipt', function(receipt) {
    if (receipt.status == true){
    Swal.fire(
  'Jadeite Airdrop',
  'Successful claim',
  'success'
)
    }
  })
  txn.on('error', function(error){ 
    if (error.code == 4001) {
      Swal.fire(
  'Error',
  `${error.message}`,
  'error'
)
      return
    }
    console.log(error);
      Swal.fire(
  'Error',
  `Transaction has been reverted by the EVM`,
  'error'
)
  })

};

function getreflink() {
  let link = window.location.href;
  addr = document.getElementById('refaddress').value
  if(!/^(0x){1}[0-9a-fA-F]{40}$/i.test(addr)){
     Swal.fire(
  'Referral Alert',
  'Please Enter Your BEP20 Address',
  'error'
)
    return
  } 
  ref_link = 'https://jadeite.site/airdrop' + '?r=' + addr
  console.log(ref_link);
  document.getElementById('refaddress').value = ref_link;
}

function copyToClipboard(id) {
    var text = document.getElementById(id).value; //getting the text from that particular Row
    //window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);
              Swal.fire({
           icon: 'success',
           showCloseButton: true,
           showDenyButton: true,
           showCancelButton: true,
           confirmButtonColor: '#3085d6',
           denyButtonColor: '#3085d6',
           cancelButtonColor: '#3085d6',
           title: 'Copied Successfully',
           html:
                'Share your <b>referral</b> ' +
                '<a href=' + textarea.value + '>link</a> ' +
                'on',
           confirmButtonText:
                '<a href="https://www.facebook.com/sharer/sharer.php?u=' + textarea.value + '" target="_blank" + class="share-popup" >Facebook</a> ',
           denyButtonText:
                '<a href="https://www.twitter.com/intent/tweet?url=' + textarea.value + '&via=JadeiteToken"' + 'target="_blank" class="share-popup">Twitter</a>',
           cancelButtonText:
                '<a href="https://telegram.me/share/url?url=' + textarea.value + '" target="_blank" class="share-popup">Telegram</a>',
                       
          })
    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
              Swal.fire({
           icon: 'success',
           showCloseButton: true,
           showDenyButton: true,
           showCancelButton: true,
           confirmButtonColor: '#3085d6',
           denyButtonColor: '#3085d6',
           cancelButtonColor: '#3085d6',
           title: 'Copied Successfully',
           html:
                'Share your <b>referral</b> ' +
                '<a href=' + textarea.value + '>link</a> ' +
                'on',
           confirmButtonText:
                '<a href="https://www.facebook.com/sharer/sharer.php?u=' + textarea.value + '" target="_blank" + class="share-popup" >Facebook</a> ',
           denyButtonText:
                '<a href="https://www.twitter.com/intent/tweet?url=' + textarea.value + '&via=JadeiteToken"' + 'target="_blank" class="share-popup">Twitter</a>',
           cancelButtonText:
                '<a href="https://telegram.me/share/url?url=' + textarea.value + '" target="_blank" class="share-popup">Telegram</a>',
                       
          })
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
              Swal.fire({
           icon: 'success',
           showCloseButton: true,
           showDenyButton: true,
           showCancelButton: true,
           confirmButtonColor: '#3085d6',
           denyButtonColor: '#3085d6',
           cancelButtonColor: '#3085d6',
           title: 'Copied Successfully',
           html:
                'Share your <b>referral</b> ' +
                '<a href=' + textarea.value + '>link</a> ' +
                'on',
           confirmButtonText:
                '<a href="https://www.facebook.com/sharer/sharer.php?u=' + textarea.value + '" target="_blank" + class="share-popup" >Facebook</a> ',
           denyButtonText:
                '<a href="https://www.twitter.com/intent/tweet?url=' + textarea.value + '&via=JadeiteToken"' + 'target="_blank" class="share-popup">Twitter</a>',
           cancelButtonText:
                '<a href="https://telegram.me/share/url?url=' + textarea.value + '" target="_blank" class="share-popup">Telegram</a>',
                       
          })
        }
    }
  }
