const axios = require('axios');
const VpsPlan = require('../../models/VPSPlan');
const VPSBillingCycleDiscount = require('../../models/VPSBillingCycleDiscount');
const CPanelPlan = require('../../models/CpanelPlan');
const OperatingSystem = require('../../models/OperatingSystem');
const VPSDisk = require('../../models/VPSDisk');
const { fetchVPSPlansWithCosts } = require('../../helpers/computeEngineHelper');
require('dotenv').config();

const baseUrl = process.env.DYNO_PAY_BASE_URL;
const apiKey = process.env.DYNO_PAY_API_KEY;
const walletToken = process.env.DYNO_PAY_WALLET_TOKEN;

const headers = {
  accept: 'application/json',
  'content-type': 'application/json',
  'x-api-key': apiKey,
  'Authorization': `Bearer ${walletToken}`
};

// To fetch supported currencies
const fetchSupportedCryptoCurrency = async (req, res) => {
    try {
        const response = await axios.get(`${baseUrl}/getSupportedCurrency`, { headers });
        return res.status(200).json({ success: true, data: response.data.data });
    } catch (error) {
        console.error('Error in Fetching Supported Crypto Currencies:', error?.response?.data?.message);
        return res.status(500).json({ success: false, message: error?.response?.data?.message || "Internal Server Error" });
    }
};

// const getVPSCryptoAddress = async (req, res) => {
//   try {
//       const { amount, currency, redirect_uri, meta_data } = req.body;

//       // Validate required fields
//       if (!amount || !currency || !redirect_uri) {
//           return res.status(400).json({ success: false, message: "Missing required fields: amount, currency, redirect_uri" });
//       }

//       const options = {
//           method: 'POST',
//           url: `${baseUrl}/user/cryptoPayment`,
//           headers: headers,
//           data: {
//               amount,
//               currency,
//               redirect_uri,
//               meta_data
//           }
//       };

//       const response = await axios.request(options);

//       return res.status(200).json({ success: true, data: response?.data?.data });

//   } catch (error) {
//       console.error('Error in getting Crypto address:', error?.response?.data?.message || error?.message);
//       return res.status(500).json({ success: false, message: error?.response?.data?.message || "Internal Server Error" });
//   }
// };

const getVPSCryptoAddress = async (req, res) => {
  try {
      const { planId, billingCycleId, cPanelPlanId, osId, diskTypeId, redirect_uri, meta_data, currency } = req.body;

      // Fetch required details
      const plan = await VpsPlan.findById(planId);
      const billingCycle = await VPSBillingCycleDiscount.findById(billingCycleId);
      const cPanelPlan = await CPanelPlan.findById(cPanelPlanId);
      const osDetail = await OperatingSystem.findById(osId);
      const diskDetails = await VPSDisk.findById(diskTypeId);

      if (!plan || !billingCycle || !cPanelPlan || !osDetail || !diskDetails) {
          return res.status(404).json({ success: false, message: "Invalid Plan, Billing Cycle, OS, or Disk Type" });
      }

      // Get billing cycle type (Monthly, Hourly, etc.)
      const billingCycleType = billingCycle.type;

      // Fetch all VPS plans with costs based on user location, region, disk type, etc.
      const userId = req.user._id;
      const region = req?.query?.region || "us-central1";
      const diskType = diskDetails.type;
      const preemptible = req?.query?.preemptible || false;

      const vpsPlansWithCosts = await fetchVPSPlansWithCosts({ userId, region, diskType, preemptible });

      const selectedVPSPlans = vpsPlansWithCosts.find((vpsPlan) => vpsPlan._id.toString() === plan._id.toString());

      console.log("##selectedVPSPlans",selectedVPSPlans, plan._id, vpsPlansWithCosts[0]._id);

      // Find the selected plan with correct pricing
      if (!selectedVPSPlans) {
        return res.status(404).json({ success: false, message: "Selected VPS plan not found" });
      }
      
      // Find correct billing cycle price
      const selectedBillingCycle = selectedVPSPlans.billingCycles.find(cycle => cycle.type === billingCycleType);
      if (!selectedBillingCycle) {
        return res.status(400).json({ success: false, message: "Selected plan does not have a valid billing cycle" });
      }
      
      // Calculate total price including OS & cPanel
      const osPrice = osDetail.price || 0;
      const cPanelPrice = cPanelPlan.price || 0;
      const totalPrice = parseFloat(selectedBillingCycle.finalPrice) + osPrice + cPanelPrice;
      
      // Request Crypto Payment Address from DynoPay
      const options = {
          method: 'POST',
          url: `${baseUrl}/user/cryptoPayment`,
          headers,
          data: {
              amount: totalPrice,
              currency, 
              redirect_uri,
              meta_data
          }
      };

      const response = await axios.request(options);
      const paymentData = response?.data?.data;

      if (!paymentData || !paymentData.address) {
          return res.status(500).json({ success: false, message: "Failed to generate crypto payment address." });
      }

      // // Store Crypto Payment Info in DB
      // const paymentRecord = new VPSCryptoPayment({
      //     userId,
      //     vpsId,
      //     address: paymentData.address,
      //     amount: totalPrice,
      //     currency: "USDT",
      //     status: "Pending"
      // });

      // await paymentRecord.save();

      return res.status(200).json({
          success: true,
          message: "Crypto payment address generated successfully.",
          data: {
              response: response?.data?.data,
              paymentAddress: paymentData.address,
              totalAmount: totalPrice,
              billingCycleType,
              plan: selectedVPSPlans.name
          }
      });

  } catch (error) {
      console.error('Error in generating Crypto address:', error?.response?.data?.message || error?.message);
      return res.status(500).json({ success: false, message: error?.response?.data?.message || "Internal Server Error" });
  }
};

const getVPSCryptoPaymentStatus = async (req, res) => {
  const { address } = req.params;
  
  if (!address) {
    return res.status(400).json({ success: false, message: 'Wallet address is required' });
  }
  
  const options = {
    method: 'GET',
    url: `${baseUrl}/user/getCryptoTransaction/${address}`,
    headers: headers
  };
  
  try {
    const response = await axios.request(options);
    return res.status(200).json({ success: true, data: response.data.data });
  } catch (error) {
    console.error('Error in Fetching Crypto Currency', error?.response?.data?.message);
    return res.status(500).json({ success: false, message: error?.response?.data?.message || error?.message});
  }
};

const getVPSTransaction = async (req, res) => {
  const { id } = req.params;

    try {
        const response = await axios.get(`${baseUrl}/user/getSingleTransaction/${id}`, { headers });

        return res.status(200).json({ success: true, data: response.data.data });

    } catch (error) {
        console.error('Error in Fetching VPS Payment Transaction:', error?.response?.data?.message);
        return res.status(500).json({ success: false, message: error?.response?.data?.message || "Internal Server Error" });
    }
};


module.exports = { fetchSupportedCryptoCurrency, getVPSCryptoAddress, getVPSCryptoPaymentStatus, getVPSTransaction };
