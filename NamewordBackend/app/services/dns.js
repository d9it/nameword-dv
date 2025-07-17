const apiClient = require('../utils/apiclient');

const viewRecord = async (id) => {

    try {
        const response = await apiClient.request('ViewDNSRecord', { WebsiteId: id });
        return response;
    } catch (error) {
        throw error
    }
};


module.exports = {
    viewRecord
}
