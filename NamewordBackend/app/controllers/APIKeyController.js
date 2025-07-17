const User = require('../models/User');
const APIKey = require('../models/APIKey');
const cryptr = require('../services/cryptr');
const { generateApiKey } = require('generate-api-key');
const { hmacHash } = require('../utils/common');
const NotFoundError = require('../errors/NotFoundError');


class APIKeyController{

    async store(req, res){
        const { name} = req.body;
        const user = await User.findById(req.user.id).populate('apiKeys');
        let key = generateApiKey({ method: 'uuidv4', dashes: false });

        const apiKey = new APIKey({
            name: name,
            tokenHash:hmacHash(key),
            token:cryptr.encrypt(key),
            user: user._id  // Associate the APIKey with the User
        });
        await apiKey.save();
        await user.apiKeys.push(apiKey);
        await user.save();

        return res.status(200).json({data:apiKey.toJSON({virtuals:true})});
    }

    async list(req, res){
        let user = await User.findById(req.user.id).populate('apiKeys');

        if(!user){
            throw new NotFoundError('User not found!');
        }
        const apiKeysJson = user.apiKeys.map(apiKey => apiKey.toJSON({virtuals:true}));
        return res.status(200).json({data : apiKeysJson});
    }

    async destroy(req, res){
        let apiKey = await APIKey.findById(req.params.id);

        if(!apiKey){
            throw new NotFoundError('API key not found!');
        }

        await apiKey.deleteOne();

        return res.status(204).json();
    }


}

module.exports = new APIKeyController();