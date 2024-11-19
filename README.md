# Plutus Blockpit Export

This tool exports your Plutus rewards, orders and withdrawals to a Blockpit-compatible CSV file.

## Usage
1. Log into your Plutus account on https://dex.plutus.it
2. Open browser console (F12 in most browsers)
3. Copy and paste the code snippet from [here](blockpit-rewards.js) into the console and press Enter
4. Three differenz CSV files should get downloaded: blockpit_rewards.csv contains your rewards, blockpit_orders.csv contains your order from old DEX (if any) and blockpit_withdrawals.csv contains your successful withdrawal requests

## Remarks for reward export
- Only actually available Rewards are exported (i.e. no longer pending)
- Transaction date is the date when the rewards became available
- Rewards are exported as transaction type "Cashback"

## Limitations
- So far I was only able to test this with my own transactions, so consider this to be in alpha state. But please feel free to report any issues in this GitHub repo

## Support

If you like this work and want to support me, you can buy your Blockpit license using my reflink: https://blockpit.cello.so/uo3QOOjANGZ . If you want to join Plutus, my reflink is 
