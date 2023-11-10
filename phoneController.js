const crypto =  require('crypto');
const axios = require('axios');
function generateTransactionId(){
const timeStamp=Date.now()
const randomNumber =Math.floor(Math.random()=100000);
const merchantPrefix='1'
const transactionId = `${merchantPrefix}${timeStamp}${randomNumber}`
return transactionId
}
exports.newPayment = async(req,res)=>{
    try {
        const {name,number,amount,merchantTransactionId} = req.body
        const data ={
            merchantId: "PGTESTPAYUAT",
            merchantTransactionId: merchantTransactionId,
            merchantUserId: "MUID123",
            name:name,
            amount: amount*100,
            redirectUrl: "https://webhook.site/redirect-url",
            redirectMode: "REDIRECT",
            callbackUrl: "https://webhook.site/callback-url",
            mobileNumber: number,
            paymentInstrument: {
              type: "PAY_PAGE"
            }
          }   
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;
        const URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
        const options = {
            method: 'POST',
            url: URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };
        
        axios.request(options).then(function (response) {
            //    return console.log(response.data.data.instrumentResponse.redirectInfo.url)
            return res.send(response.data.data.instrumentResponse.redirectInfo.url)
        })
        .catch(function (error) {
            console.error(error);
        });
        
    } catch (error) {
        console.log(error);
    }
}

exports.checkStatus = async(req, res) => {
    const merchantTransactionId = res.req.body.transactionId
    const merchantId = res.req.body.merchantId
    const keyIndex = 1;
    const salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;
    const options = {
        method: 'GET',
        url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };
    axios.request(options).then(async(response) => {
        // return console.log(response)
        if (response.data.success === true) {
            const url = `http://localhost:3000/success`
            return res.send(url)
        } else {
            const url = `http://localhost:3000/failure`
            return res.send(url)
        }
    })
    .catch((error) => {
        console.error(error);
    });
};

exports.recurring = async(req,res)=>{
    try {
        const {number,amount} = req.body
        const data ={
            merchantId: "MID12345",
            merchantSubscriptionId: "MSUB123456789012345",
            merchantUserId: "MU123456789",
            authWorkflowType: "PENNY_DROP",				
            amountType: "FIXED",		
            amount: 39900,
            frequency: "MONTHLY",
            recurringCount: 12,
            mobileNumber: "9xxxxxxxxx",
            subMerchantId: "DemoMerchant",
            deviceContext: {
            phonePeVersionCode: 400922
            }
          }
        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const salt_key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
        const string = `/pg/v1/status/${data.merchantId}/${data.subMerchantId}` + salt_key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        console.log(sha256)
        const checksum = sha256 + "/v3/recurring/subscription/create" +salt_key+"###"+ keyIndex;
        const options = {
            method: 'POST',
            url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v3/recurring/subscription/create',
            headers: {accept: 'application/json', 
            'content-type': 'application/json', 
            'X-VERIFY': checksum                               
            },
            data: {
                request: payloadMain
            }
            // request: payloadMain  
        }
        axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.error(error);
        });
    } catch (error) {
        console.log(error);
    }
}