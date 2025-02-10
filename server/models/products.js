const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    oldPrice: {
        type: Number,
        default: function() {
            return this.price;
        }
    },
    catName:{
        type:String,
        default:''
    },
    catId:{
        type:String,
        default:''
    },
    subCatId:{
        type:String,
        default:''
    },
    subCat:{
        type:String,
        default:''
    },
    category: {
        type: String,
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0
    },
    rating: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    discount: {
        type: Number,
        default: 0
    },
    productRam: [
        {
            type: String,
            default: null,
        }
    ],
    size: [
        {
            type: String,
            default: null,
        }
    ],
    productWeight: [
        {
            type: String,
            default: null,
        }
    ],
    location: {
        type: String,
        required: true,
        default: 'All'  // 'All' means available in all locations
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    basePrice: {
        type: Number,
        default: function() {
            return this.price;
        }
    },
})

productSchema.pre('save', function(next) {
    if (this.isNew) {
        this.basePrice = this.price;
        this.oldPrice = this.price;
        this.discount = 0;
    }
    next();
});

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});

exports.Product = mongoose.model('Product', productSchema);
