var mongoose 			=	require('mongoose'),
	Schema 				=	mongoose.Schema,
	GallerySchema 		=	new Schema({
	   gambar 		: { type : String},
	   gambar2		: { type : String},
	   nama   		: { type : String},
	   kategori		: { type : String},
	   keterangan	: { type : String},
	   displayed    : Boolean,
	   like			: { type: Number, default: 0 },
	   dislike		: { type: Number, default: 0 },
	   latitude		: Object,
	   longitude	: Object,
	   date 		: { type: Date, default: Date.now }
	});
module.exports = mongoose.model('foto', GallerySchema);
