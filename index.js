const { deployFungibleToken, deployZilswap } = require('./scripts/deploy.js')

deployZilswap(process.env.PRIVATE_KEY, {})
