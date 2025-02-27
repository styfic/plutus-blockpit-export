async function getStatements() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + localStorage['id_token']);
    myHeaders.append("Content-Type", "application/json");

    var raw = "{\"operationName\":\"transactions_view\",\"variables\":{\"offset\":0,\"limit\":null,\"from\":null,\"to\":null},\"query\":\"query transactions_view($offset: Int, $limit: Int, $from: timestamptz, $to: timestamptz) {\\n  transactions_view_aggregate(\\n    where: {_and: [{date: {_gte: $from}}, {date: {_lte: $to}}]}\\n  ) {\\n    aggregate {\\n      totalCount: count\\n      __typename\\n    }\\n    __typename\\n  }\\n  transactions_view(\\n    order_by: {date: desc}\\n    limit: $limit\\n    offset: $offset\\n    where: {_and: [{date: {_gte: $from}}, {date: {_lte: $to}}]}\\n  ) {\\n    id\\n    model\\n    user_id\\n    currency\\n    amount\\n    date\\n    type\\n    is_debit\\n    description\\n    __typename\\n  }\\n}\\n\"}";

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    return await fetch("https://hasura.plutus.it/v1alpha1/graphql", requestOptions)
        .then(response => response.json())
        .then(jsonResponse => { return jsonResponse.data.transactions_view; })
        .catch(err => console.warn(err));
}

async function getRewards() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + localStorage['id_token']);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return await fetch("https://api.plutus.it/platform/transactions/pluton", requestOptions)
        .then(response => response.json())
        .then(jsonResponse => { return jsonResponse; })
        .catch(err => console.warn(err));
}

async function getOrders() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + localStorage['id_token']);
    myHeaders.append("Content-Type", "application/json");

    var raw = "{\"variables\":{},\"extensions\":{},\"operationName\":null,\"query\":\"query { crypto_orders_view(\\n    order_by: {created_at: desc}\\n) {\\n    id\\n    model\\n    wallet\\n    status\\n    crypto_amount\\n    crypto_currency\\n    fiat_amount\\n    fiat_currency\\n    created_at\\n    updated_at\\n    __typename\\n  }\\n}\\n\"}";

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    return await fetch("https://hasura.plutus.it/v1alpha1/graphql", requestOptions)
        .then(response => response.json())
        .then(jsonResponse => { return jsonResponse.data.crypto_orders_view; })
        .catch(err => console.warn(err));
}

async function getWithdrawals() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + localStorage['id_token']);
    myHeaders.append("Content-Type", "application/json");

    var raw = "{\"operationName\":\"withdrawals\",\"variables\":{},\"query\":\"query withdrawals($status: enum_pluton_withdraw_requests_status) {\\n  pluton_withdraw_requests(\\n    order_by: {created_at: desc}\\n    where: {status: {_eq: $status}}\\n  ) {\\n    id\\n    address\\n    amount\\n    status\\n    payout_destination_type\\n    created_at\\n    clear_junction_transfer {\\n      amount\\n      currency\\n      __typename\\n    }\\n    card_transfer {\\n      amount\\n      currency\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}";

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    return await fetch("https://hasura.plutus.it/v1alpha1/graphql", requestOptions)
        .then(response => response.json())
        .then(jsonResponse => { return jsonResponse.data.pluton_withdraw_requests; })
        .catch(err => console.warn(err));
}

async function getTransactions() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + localStorage['id_token']);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return await fetch("https://api.plutus.it/platform/transactions/contis", requestOptions)
        .then(response => response.json())
        .then(jsonResponse => { return jsonResponse; })
        .catch(err => console.warn(err));
}

function fixStatements(json) {
    json.forEach(function(record) {
        switch (record.type) {
            case "0":
                record.type = "PENDING";
                break;
            case "5":
                record.type = "DECLINED_POS_CHARGE";
                break;
            case "29":
                record.type = "CARD_DEPOSIT";
                break;
            case "31":
                record.type = "PURCHASE";
                break;
            case "45":
                record.type = "REFUND";
                break;
        }
    });
    return json
}

function flattenJson(json) {
    // Source: https://stackoverflow.com/a/61602592
    const flatten = (obj, roots = [], sep = '.') => Object.keys(obj).reduce((memo, prop) => Object.assign({}, memo, Object.prototype.toString.call(obj[prop]) === '[object Object]' ? flatten(obj[prop], roots.concat([prop]), sep) : {
        [roots.concat([prop]).join(sep)]: obj[prop]
    }), {})
    resultJson = []
    json.forEach(function(record) {
        var flatRecord = flatten(record);
        resultJson.push(flatRecord);
    });
    return resultJson
}

function jsonToCsv(json) {
    var fields = []
    for (let i = 0; i < json.length; i++) {
        let new_fields = Object.keys(json[i])
        new_fields.forEach(item => {
            if (fields.indexOf(item) === -1) {
                if (json[i][item] !== null) {
                    fields.push(item);
                }
            }
        });
    }

    // Source: https://stackoverflow.com/a/31536517
    var replacer = function(key, value) { return value === null ? '' : value }
    var csv = json.map(function(row) {
        return fields.map(function(fieldName) {
            return JSON.stringify(row[fieldName], replacer)
        }).join(',')
    })
    csv.unshift(fields.join(','))
    csv = csv.join('\r\n');
    return csv
}

function downloadCSV(csv, filename) {
    // Source: https://www.javatpoint.com/javascript-create-and-download-csv-file
    var downloadLink = document.createElement('a');
    downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    downloadLink.target = '_blank';

    downloadLink.download = filename + '.csv';
    downloadLink.click();
}

function blockpitDate(string) {
    let date = new Date(string);
    let dd = ('0' + date.getUTCDate()).slice(-2);
    let mm = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    let yyyy = date.getUTCFullYear();
    let hh = ('0' + date.getUTCHours()).slice(-2);
    let min = ('0' + date.getUTCMinutes()).slice(-2);
    let ss = ('0' + date.getUTCSeconds()).slice(-2);
    let blockpitDate = `${dd}.${mm}.${yyyy} ${hh}:${min}:${ss}`
    return blockpitDate;
}

function convertForBlockpit(arr) {
    return arr.reduce(
        (transactions, transaction, index) => {
            const row = getBlockpitTemplate(transaction, index)
            if (typeof row !== 'undefined') transactions.push(row)
            return transactions
        }, []
    )
}

function getBlockpitTemplate(element, index) {

    // Case Rewards
    if (typeof element.reason !== 'undefined' && element.reason !== "Rejected by admin" && element.available === true) {

        let template = {
            id: index,
            exchange_name: 'Plutus DEX',
            depot_name: 'Plutus',
            transaction_date: blockpitDate(element.updatedAt),
            buy_asset: 'PLU',
            buy_amount: element.amount,
            sell_asset: '',
            sell_amount: '',
            fee_asset: '',
            fee_amount: '',
            transaction_type: 'Cashback',
            note: `${Number(element.rebate_rate) === 0 ? 'Manual or perk' : (element.fiat_amount_rewarded*Number(element.rebate_rate)/10000).toFixed(2) + ' €'} cashback as ${Number(element.amount).toFixed(2)} PLU for spending ${element.fiat_amount_rewarded/100} € at ${element.fiat_transaction?.card_transactions?.description || element.contis_transaction?.description}. Approval notice: ${element.reason}`,
            linked_transaction: ''
        }
        return template
    }

    // Case Withdrawal to Card
    else if (element.payout_destination_type === "plutus_card" && element.status === "COMPLETED") {
        let template = {
            id: index,
            exchange_name: 'Plutus DEX',
            depot_name: 'Plutus',
            transaction_date: blockpitDate(element.created_at),
            buy_asset: 'EUR',
            buy_amount: element.card_transfer.amount,
            sell_asset: 'PLU',
            sell_amount: element.amount,
            fee_asset: '',
            fee_amount: '',
            transaction_type: 'Trade',
            note: element.payout_destination_type,
            linked_transaction: ''
        }
        return template
    }

    // Case Withdrawal to Wallet
    else if (element.payout_destination_type === "crypto_wallet" && element.status === "COMPLETED") {
        let template = {
            id: index,
            exchange_name: 'Plutus DEX',
            depot_name: 'Plutus',
            transaction_date: blockpitDate(element.created_at),
            buy_asset: '',
            buy_amount: '',
            sell_asset: 'PLU',
            sell_amount: element.amount,
            fee_asset: '',
            fee_amount: '',
            transaction_type: 'Withdrawal',
            note: element.payout_destination_type,
            linked_transaction: ''
        }
        return template
    }

    // Case Buy order
    else if (element.__typename === "crypto_orders_view" && element.model === "BuyOrder" && element.status === "FULFILLED") {
        let template = {
            id: index,
            exchange_name: 'Plutus DEX',
            depot_name: 'Plutus',
            transaction_date: blockpitDate(element.created_at),
            buy_asset: 'PLU',
            buy_amount: element.crypto_amount,
            sell_asset: 'EUR',
            sell_amount: element.fiat_amount,
            fee_asset: '',
            fee_amount: '',
            transaction_type: 'Trade',
            note: '',
            linked_transaction: ''
        }
        return template
    }

}

// Rewards Export
getRewards().then(response => convertForBlockpit(response)).then(response => flattenJson(response)).then(result => jsonToCsv(result)).then(csv => downloadCSV(csv, "blockpit_rewards"));
// Orders Export
getOrders().then(response => convertForBlockpit(response)).then(response => flattenJson(response)).then(result => jsonToCsv(result)).then(csv => downloadCSV(csv, "blockpit_orders"));
// Withdrawals Export
getWithdrawals().then(response => convertForBlockpit(response)).then(response => flattenJson(response)).then(result => jsonToCsv(result)).then(csv => downloadCSV(csv, "blockpit_withdrawals"));