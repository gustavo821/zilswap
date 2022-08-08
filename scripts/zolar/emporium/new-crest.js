
const { Transaction, TxStatus } = require('@zilliqa-js/account')
const { bytes, BN, Long } = require('@zilliqa-js/zilliqa')
const { default: BigNumber } = require('bignumber.js')
const { zilliqa, VERSION } = require('../../zilliqa')

async function setNewItem() {
  const key = process.env.PRIVATE_KEY
  if (!key) throw new Error('PRIVATE_KEY env var missing!')

  const contract = zilliqa.contracts.at(process.env.HUNY_STALL_CONTRACT_HASH);

  const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice()
  const params = {
    version: VERSION,
    amount: new BN(0),
    gasPrice: new BN(minGasPrice.result),
    gasLimit: Long.fromNumber(20000),
  };

  const stallAddr = contract.address.toLowerCase();
  const txList = [new Transaction({
    ...params,
    toAddr: contract.address,
    data: JSON.stringify({
      _tag: "AddItem",
      params: [{
        vname: 'item_name',
        type: 'String',
        value: "guild_crest",
      }, {
        vname: 'pricing',
        type: `${stallAddr}.PriceScale`,
        value: {
          constructor: `${stallAddr}.BoundedPrice`,
          argtypes: [],
          arguments: [
            {
              constructor: `${stallAddr}.SupplyScaledPrice`,
              argtypes: [],
              arguments: ["300", {
                constructor: `${stallAddr}.SupplyScaledInflation`,
                argtypes: [],
                arguments: ["100"],
              }]
            },
            {
              constructor: `${stallAddr}.NumericPrice`,
              argtypes: [],
              arguments: [new BigNumber(250_000).shiftedBy(12).toString(10), {
                constructor: `${stallAddr}.NoInflation`,
                argtypes: [],
                arguments: [],
              }],
            },
            {
              constructor: `${stallAddr}.SupplyScaledPrice`,
              argtypes: [],
              arguments: ["1500", {
                constructor: `${stallAddr}.NoInflation`,
                argtypes: [],
                arguments: [],
              }],
            },
          ]
        },
      }],
    }),
  },
    zilliqa.provider,
    TxStatus.Initialised,
    true,
  )];

  console.log("tx", txList[0].hash)

  zilliqa.wallet.addByPrivateKey(key);
  const signedTxList = await zilliqa.wallet.signBatch(txList);

  // send batch transaction
  await zilliqa.blockchain.createBatchTransaction(signedTxList);
}

setNewItem().then(() => console.log('done.'))
