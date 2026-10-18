/**
 * qr.js — مولّد رمز QR (مدمج، بلا مكتبات خارجية) لبطاقة المعتمر.
 * مبني على «QRCode for JavaScript» © 2009 Kazuhiko Arase — ترخيص MIT (http://www.opensource.org/licenses/mit-license.php).
 * «QR Code» علامة مسجّلة لشركة DENSO WAVE INCORPORATED.
 * الاستخدام: RmQR.canvas(textASCII, { size: 256, margin: 4, ecc: 'M' }) ← عنصر canvas.
 */
(function (global) {
  var defs = {}, cache = {};
  function req(name) {
    name = name.replace(/^\.\//, '');
    if (cache[name]) return cache[name].exports;
    var m = cache[name] = { exports: {} };
    defs[name](m, m.exports, req);
    return m.exports;
  }
  defs['QR8bitByte'] = function (module, exports, require) {
var QRMode = require('./QRMode');

function QR8bitByte(data) {
	this.mode = QRMode.MODE_8BIT_BYTE;
	this.data = data;
}

QR8bitByte.prototype = {

	getLength : function() {
		return this.data.length;
	},
	
	write : function(buffer) {
		for (var i = 0; i < this.data.length; i++) {
			// not JIS ...
			buffer.put(this.data.charCodeAt(i), 8);
		}
	}
};

module.exports = QR8bitByte;

  };
  defs['QRBitBuffer'] = function (module, exports, require) {
function QRBitBuffer() {
	this.buffer = [];
	this.length = 0;
}

QRBitBuffer.prototype = {

	get : function(index) {
		var bufIndex = Math.floor(index / 8);
		return ( (this.buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
	},
	
	put : function(num, length) {
		for (var i = 0; i < length; i++) {
			this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
		}
	},
	
	getLengthInBits : function() {
		return this.length;
	},
	
	putBit : function(bit) {
	
		var bufIndex = Math.floor(this.length / 8);
		if (this.buffer.length <= bufIndex) {
			this.buffer.push(0);
		}
	
		if (bit) {
			this.buffer[bufIndex] |= (0x80 >>> (this.length % 8) );
		}
	
		this.length++;
	}
};

module.exports = QRBitBuffer;

  };
  defs['QRErrorCorrectLevel'] = function (module, exports, require) {
module.exports = {
	L : 1,
	M : 0,
	Q : 3,
	H : 2
};


  };
  defs['QRMaskPattern'] = function (module, exports, require) {
module.exports = {
	PATTERN000 : 0,
	PATTERN001 : 1,
	PATTERN010 : 2,
	PATTERN011 : 3,
	PATTERN100 : 4,
	PATTERN101 : 5,
	PATTERN110 : 6,
	PATTERN111 : 7
};

  };
  defs['QRMath'] = function (module, exports, require) {
var QRMath = {

	glog : function(n) {
	
		if (n < 1) {
			throw new Error("glog(" + n + ")");
		}
		
		return QRMath.LOG_TABLE[n];
	},
	
	gexp : function(n) {
	
		while (n < 0) {
			n += 255;
		}
	
		while (n >= 256) {
			n -= 255;
		}
	
		return QRMath.EXP_TABLE[n];
	},
	
	EXP_TABLE : new Array(256),
	
	LOG_TABLE : new Array(256)

};
	
for (var i = 0; i < 8; i++) {
	QRMath.EXP_TABLE[i] = 1 << i;
}
for (var i = 8; i < 256; i++) {
	QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4]
		^ QRMath.EXP_TABLE[i - 5]
		^ QRMath.EXP_TABLE[i - 6]
		^ QRMath.EXP_TABLE[i - 8];
}
for (var i = 0; i < 255; i++) {
	QRMath.LOG_TABLE[QRMath.EXP_TABLE[i] ] = i;
}

module.exports = QRMath;

  };
  defs['QRMode'] = function (module, exports, require) {
module.exports = {
    MODE_NUMBER :       1 << 0,
    MODE_ALPHA_NUM :    1 << 1,
    MODE_8BIT_BYTE :    1 << 2,
    MODE_KANJI :        1 << 3
};

  };
  defs['QRPolynomial'] = function (module, exports, require) {
var QRMath = require('./QRMath');

function QRPolynomial(num, shift) {
	if (num.length === undefined) {
		throw new Error(num.length + "/" + shift);
	}

	var offset = 0;

	while (offset < num.length && num[offset] === 0) {
		offset++;
	}

	this.num = new Array(num.length - offset + shift);
	for (var i = 0; i < num.length - offset; i++) {
		this.num[i] = num[i + offset];
	}
}

QRPolynomial.prototype = {

	get : function(index) {
		return this.num[index];
	},
	
	getLength : function() {
		return this.num.length;
	},
	
	multiply : function(e) {
	
		var num = new Array(this.getLength() + e.getLength() - 1);
	
		for (var i = 0; i < this.getLength(); i++) {
			for (var j = 0; j < e.getLength(); j++) {
				num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i) ) + QRMath.glog(e.get(j) ) );
			}
		}
	
		return new QRPolynomial(num, 0);
	},
	
	mod : function(e) {
	
		if (this.getLength() - e.getLength() < 0) {
			return this;
		}
	
		var ratio = QRMath.glog(this.get(0) ) - QRMath.glog(e.get(0) );
	
		var num = new Array(this.getLength() );
		
		for (var i = 0; i < this.getLength(); i++) {
			num[i] = this.get(i);
		}
		
		for (var x = 0; x < e.getLength(); x++) {
			num[x] ^= QRMath.gexp(QRMath.glog(e.get(x) ) + ratio);
		}
	
		// recursive call
		return new QRPolynomial(num, 0).mod(e);
	}
};

module.exports = QRPolynomial;

  };
  defs['QRRSBlock'] = function (module, exports, require) {
var QRErrorCorrectLevel = require('./QRErrorCorrectLevel');

function QRRSBlock(totalCount, dataCount) {
	this.totalCount = totalCount;
	this.dataCount  = dataCount;
}

QRRSBlock.RS_BLOCK_TABLE = [

	// L
	// M
	// Q
	// H

	// 1
	[1, 26, 19],
	[1, 26, 16],
	[1, 26, 13],
	[1, 26, 9],
	
	// 2
	[1, 44, 34],
	[1, 44, 28],
	[1, 44, 22],
	[1, 44, 16],

	// 3
	[1, 70, 55],
	[1, 70, 44],
	[2, 35, 17],
	[2, 35, 13],

	// 4		
	[1, 100, 80],
	[2, 50, 32],
	[2, 50, 24],
	[4, 25, 9],
	
	// 5
	[1, 134, 108],
	[2, 67, 43],
	[2, 33, 15, 2, 34, 16],
	[2, 33, 11, 2, 34, 12],
	
	// 6
	[2, 86, 68],
	[4, 43, 27],
	[4, 43, 19],
	[4, 43, 15],
	
	// 7		
	[2, 98, 78],
	[4, 49, 31],
	[2, 32, 14, 4, 33, 15],
	[4, 39, 13, 1, 40, 14],
	
	// 8
	[2, 121, 97],
	[2, 60, 38, 2, 61, 39],
	[4, 40, 18, 2, 41, 19],
	[4, 40, 14, 2, 41, 15],
	
	// 9
	[2, 146, 116],
	[3, 58, 36, 2, 59, 37],
	[4, 36, 16, 4, 37, 17],
	[4, 36, 12, 4, 37, 13],
	
	// 10		
	[2, 86, 68, 2, 87, 69],
	[4, 69, 43, 1, 70, 44],
	[6, 43, 19, 2, 44, 20],
	[6, 43, 15, 2, 44, 16],

	// 11
	[4, 101, 81],
	[1, 80, 50, 4, 81, 51],
	[4, 50, 22, 4, 51, 23],
	[3, 36, 12, 8, 37, 13],

	// 12
	[2, 116, 92, 2, 117, 93],
	[6, 58, 36, 2, 59, 37],
	[4, 46, 20, 6, 47, 21],
	[7, 42, 14, 4, 43, 15],

	// 13
	[4, 133, 107],
	[8, 59, 37, 1, 60, 38],
	[8, 44, 20, 4, 45, 21],
	[12, 33, 11, 4, 34, 12],

	// 14
	[3, 145, 115, 1, 146, 116],
	[4, 64, 40, 5, 65, 41],
	[11, 36, 16, 5, 37, 17],
	[11, 36, 12, 5, 37, 13],

	// 15
	[5, 109, 87, 1, 110, 88],
	[5, 65, 41, 5, 66, 42],
	[5, 54, 24, 7, 55, 25],
	[11, 36, 12],

	// 16
	[5, 122, 98, 1, 123, 99],
	[7, 73, 45, 3, 74, 46],
	[15, 43, 19, 2, 44, 20],
	[3, 45, 15, 13, 46, 16],

	// 17
	[1, 135, 107, 5, 136, 108],
	[10, 74, 46, 1, 75, 47],
	[1, 50, 22, 15, 51, 23],
	[2, 42, 14, 17, 43, 15],

	// 18
	[5, 150, 120, 1, 151, 121],
	[9, 69, 43, 4, 70, 44],
	[17, 50, 22, 1, 51, 23],
	[2, 42, 14, 19, 43, 15],

	// 19
	[3, 141, 113, 4, 142, 114],
	[3, 70, 44, 11, 71, 45],
	[17, 47, 21, 4, 48, 22],
	[9, 39, 13, 16, 40, 14],

	// 20
	[3, 135, 107, 5, 136, 108],
	[3, 67, 41, 13, 68, 42],
	[15, 54, 24, 5, 55, 25],
	[15, 43, 15, 10, 44, 16],

	// 21
	[4, 144, 116, 4, 145, 117],
	[17, 68, 42],
	[17, 50, 22, 6, 51, 23],
	[19, 46, 16, 6, 47, 17],

	// 22
	[2, 139, 111, 7, 140, 112],
	[17, 74, 46],
	[7, 54, 24, 16, 55, 25],
	[34, 37, 13],

	// 23
	[4, 151, 121, 5, 152, 122],
	[4, 75, 47, 14, 76, 48],
	[11, 54, 24, 14, 55, 25],
	[16, 45, 15, 14, 46, 16],

	// 24
	[6, 147, 117, 4, 148, 118],
	[6, 73, 45, 14, 74, 46],
	[11, 54, 24, 16, 55, 25],
	[30, 46, 16, 2, 47, 17],

	// 25
	[8, 132, 106, 4, 133, 107],
	[8, 75, 47, 13, 76, 48],
	[7, 54, 24, 22, 55, 25],
	[22, 45, 15, 13, 46, 16],

	// 26
	[10, 142, 114, 2, 143, 115],
	[19, 74, 46, 4, 75, 47],
	[28, 50, 22, 6, 51, 23],
	[33, 46, 16, 4, 47, 17],

	// 27
	[8, 152, 122, 4, 153, 123],
	[22, 73, 45, 3, 74, 46],
	[8, 53, 23, 26, 54, 24],
	[12, 45, 15, 28, 46, 16],

	// 28
	[3, 147, 117, 10, 148, 118],
	[3, 73, 45, 23, 74, 46],
	[4, 54, 24, 31, 55, 25],
	[11, 45, 15, 31, 46, 16],

	// 29
	[7, 146, 116, 7, 147, 117],
	[21, 73, 45, 7, 74, 46],
	[1, 53, 23, 37, 54, 24],
	[19, 45, 15, 26, 46, 16],

	// 30
	[5, 145, 115, 10, 146, 116],
	[19, 75, 47, 10, 76, 48],
	[15, 54, 24, 25, 55, 25],
	[23, 45, 15, 25, 46, 16],

	// 31
	[13, 145, 115, 3, 146, 116],
	[2, 74, 46, 29, 75, 47],
	[42, 54, 24, 1, 55, 25],
	[23, 45, 15, 28, 46, 16],

	// 32
	[17, 145, 115],
	[10, 74, 46, 23, 75, 47],
	[10, 54, 24, 35, 55, 25],
	[19, 45, 15, 35, 46, 16],

	// 33
	[17, 145, 115, 1, 146, 116],
	[14, 74, 46, 21, 75, 47],
	[29, 54, 24, 19, 55, 25],
	[11, 45, 15, 46, 46, 16],

	// 34
	[13, 145, 115, 6, 146, 116],
	[14, 74, 46, 23, 75, 47],
	[44, 54, 24, 7, 55, 25],
	[59, 46, 16, 1, 47, 17],

	// 35
	[12, 151, 121, 7, 152, 122],
	[12, 75, 47, 26, 76, 48],
	[39, 54, 24, 14, 55, 25],
	[22, 45, 15, 41, 46, 16],

	// 36
	[6, 151, 121, 14, 152, 122],
	[6, 75, 47, 34, 76, 48],
	[46, 54, 24, 10, 55, 25],
	[2, 45, 15, 64, 46, 16],

	// 37
	[17, 152, 122, 4, 153, 123],
	[29, 74, 46, 14, 75, 47],
	[49, 54, 24, 10, 55, 25],
	[24, 45, 15, 46, 46, 16],

	// 38
	[4, 152, 122, 18, 153, 123],
	[13, 74, 46, 32, 75, 47],
	[48, 54, 24, 14, 55, 25],
	[42, 45, 15, 32, 46, 16],

	// 39
	[20, 147, 117, 4, 148, 118],
	[40, 75, 47, 7, 76, 48],
	[43, 54, 24, 22, 55, 25],
	[10, 45, 15, 67, 46, 16],

	// 40
	[19, 148, 118, 6, 149, 119],
	[18, 75, 47, 31, 76, 48],
	[34, 54, 24, 34, 55, 25],
	[20, 45, 15, 61, 46, 16]
];

QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
	
	var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
	
	if (rsBlock === undefined) {
		throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
	}

	var length = rsBlock.length / 3;
	
	var list = [];
	
	for (var i = 0; i < length; i++) {

		var count = rsBlock[i * 3 + 0];
		var totalCount = rsBlock[i * 3 + 1];
		var dataCount  = rsBlock[i * 3 + 2];

		for (var j = 0; j < count; j++) {
			list.push(new QRRSBlock(totalCount, dataCount) );	
		}
	}
	
	return list;
};

QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {

	switch(errorCorrectLevel) {
	case QRErrorCorrectLevel.L :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
	case QRErrorCorrectLevel.M :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
	case QRErrorCorrectLevel.Q :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
	case QRErrorCorrectLevel.H :
		return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
	default :
		return undefined;
	}
};

module.exports = QRRSBlock;

  };
  defs['QRUtil'] = function (module, exports, require) {
var QRMode = require('./QRMode');
var QRPolynomial = require('./QRPolynomial');
var QRMath = require('./QRMath');
var QRMaskPattern = require('./QRMaskPattern');

var QRUtil = {

    PATTERN_POSITION_TABLE : [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],        
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
    ],

    G15 : (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
    G18 : (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
    G15_MASK : (1 << 14) | (1 << 12) | (1 << 10)    | (1 << 4) | (1 << 1),

    getBCHTypeInfo : function(data) {
        var d = data << 10;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
            d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) ) );    
        }
        return ( (data << 10) | d) ^ QRUtil.G15_MASK;
    },

    getBCHTypeNumber : function(data) {
        var d = data << 12;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
            d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) ) );    
        }
        return (data << 12) | d;
    },

    getBCHDigit : function(data) {

        var digit = 0;

        while (data !== 0) {
            digit++;
            data >>>= 1;
        }

        return digit;
    },

    getPatternPosition : function(typeNumber) {
        return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },

    getMask : function(maskPattern, i, j) {
        
        switch (maskPattern) {
            
        case QRMaskPattern.PATTERN000 : return (i + j) % 2 === 0;
        case QRMaskPattern.PATTERN001 : return i % 2 === 0;
        case QRMaskPattern.PATTERN010 : return j % 3 === 0;
        case QRMaskPattern.PATTERN011 : return (i + j) % 3 === 0;
        case QRMaskPattern.PATTERN100 : return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 === 0;
        case QRMaskPattern.PATTERN101 : return (i * j) % 2 + (i * j) % 3 === 0;
        case QRMaskPattern.PATTERN110 : return ( (i * j) % 2 + (i * j) % 3) % 2 === 0;
        case QRMaskPattern.PATTERN111 : return ( (i * j) % 3 + (i + j) % 2) % 2 === 0;

        default :
            throw new Error("bad maskPattern:" + maskPattern);
        }
    },

    getErrorCorrectPolynomial : function(errorCorrectLength) {

        var a = new QRPolynomial([1], 0);

        for (var i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0) );
        }

        return a;
    },

    getLengthInBits : function(mode, type) {

        if (1 <= type && type < 10) {

            // 1 - 9

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 10;
            case QRMode.MODE_ALPHA_NUM  : return 9;
            case QRMode.MODE_8BIT_BYTE  : return 8;
            case QRMode.MODE_KANJI      : return 8;
            default :
                throw new Error("mode:" + mode);
            }

        } else if (type < 27) {

            // 10 - 26

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 12;
            case QRMode.MODE_ALPHA_NUM  : return 11;
            case QRMode.MODE_8BIT_BYTE  : return 16;
            case QRMode.MODE_KANJI      : return 10;
            default :
                throw new Error("mode:" + mode);
            }

        } else if (type < 41) {

            // 27 - 40

            switch(mode) {
            case QRMode.MODE_NUMBER     : return 14;
            case QRMode.MODE_ALPHA_NUM  : return 13;
            case QRMode.MODE_8BIT_BYTE  : return 16;
            case QRMode.MODE_KANJI      : return 12;
            default :
                throw new Error("mode:" + mode);
            }

        } else {
            throw new Error("type:" + type);
        }
    },

    getLostPoint : function(qrCode) {
        
        var moduleCount = qrCode.getModuleCount();
        var lostPoint = 0;
        var row = 0; 
        var col = 0;

        
        // LEVEL1
        
        for (row = 0; row < moduleCount; row++) {

            for (col = 0; col < moduleCount; col++) {

                var sameCount = 0;
                var dark = qrCode.isDark(row, col);

                for (var r = -1; r <= 1; r++) {

                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }

                    for (var c = -1; c <= 1; c++) {

                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }

                        if (r === 0 && c === 0) {
                            continue;
                        }

                        if (dark === qrCode.isDark(row + r, col + c) ) {
                            sameCount++;
                        }
                    }
                }

                if (sameCount > 5) {
                    lostPoint += (3 + sameCount - 5);
                }
            }
        }

        // LEVEL2

        for (row = 0; row < moduleCount - 1; row++) {
            for (col = 0; col < moduleCount - 1; col++) {
                var count = 0;
                if (qrCode.isDark(row,     col    ) ) count++;
                if (qrCode.isDark(row + 1, col    ) ) count++;
                if (qrCode.isDark(row,     col + 1) ) count++;
                if (qrCode.isDark(row + 1, col + 1) ) count++;
                if (count === 0 || count === 4) {
                    lostPoint += 3;
                }
            }
        }

        // LEVEL3

        for (row = 0; row < moduleCount; row++) {
            for (col = 0; col < moduleCount - 6; col++) {
                if (qrCode.isDark(row, col) && 
                        !qrCode.isDark(row, col + 1) && 
                         qrCode.isDark(row, col + 2) && 
                         qrCode.isDark(row, col + 3) && 
                         qrCode.isDark(row, col + 4) && 
                        !qrCode.isDark(row, col + 5) && 
                         qrCode.isDark(row, col + 6) ) {
                    lostPoint += 40;
                }
            }
        }

        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount - 6; row++) {
                if (qrCode.isDark(row, col) &&
                        !qrCode.isDark(row + 1, col) &&
                         qrCode.isDark(row + 2, col) &&
                         qrCode.isDark(row + 3, col) &&
                         qrCode.isDark(row + 4, col) &&
                        !qrCode.isDark(row + 5, col) &&
                         qrCode.isDark(row + 6, col) ) {
                    lostPoint += 40;
                }
            }
        }

        // LEVEL4
        
        var darkCount = 0;

        for (col = 0; col < moduleCount; col++) {
            for (row = 0; row < moduleCount; row++) {
                if (qrCode.isDark(row, col) ) {
                    darkCount++;
                }
            }
        }
        
        var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;

        return lostPoint;       
    }

};

module.exports = QRUtil;

  };
  defs['index'] = function (module, exports, require) {
//---------------------------------------------------------------------
// QRCode for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
// The word "QR Code" is registered trademark of 
// DENSO WAVE INCORPORATED
//   http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------
// Modified to work in node for this project (and some refactoring)
//---------------------------------------------------------------------

var QR8bitByte = require('./QR8bitByte');
var QRUtil = require('./QRUtil');
var QRPolynomial = require('./QRPolynomial');
var QRRSBlock = require('./QRRSBlock');
var QRBitBuffer = require('./QRBitBuffer');

function QRCode(typeNumber, errorCorrectLevel) {
	this.typeNumber = typeNumber;
	this.errorCorrectLevel = errorCorrectLevel;
	this.modules = null;
	this.moduleCount = 0;
	this.dataCache = null;
	this.dataList = [];
}

QRCode.prototype = {
	
	addData : function(data) {
		var newData = new QR8bitByte(data);
		this.dataList.push(newData);
		this.dataCache = null;
	},
	
	isDark : function(row, col) {
		if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
			throw new Error(row + "," + col);
		}
		return this.modules[row][col];
	},

	getModuleCount : function() {
		return this.moduleCount;
	},
	
	make : function() {
		// Calculate automatically typeNumber if provided is < 1
		if (this.typeNumber < 1 ){
			var typeNumber = 1;
			for (typeNumber = 1; typeNumber < 40; typeNumber++) {
				var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectLevel);

				var buffer = new QRBitBuffer();
				var totalDataCount = 0;
				for (var i = 0; i < rsBlocks.length; i++) {
					totalDataCount += rsBlocks[i].dataCount;
				}

				for (var x = 0; x < this.dataList.length; x++) {
					var data = this.dataList[x];
					buffer.put(data.mode, 4);
					buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
					data.write(buffer);
				}
				if (buffer.getLengthInBits() <= totalDataCount * 8)
					break;
			}
			this.typeNumber = typeNumber;
		}
		this.makeImpl(false, this.getBestMaskPattern() );
	},
	
	makeImpl : function(test, maskPattern) {
		
		this.moduleCount = this.typeNumber * 4 + 17;
		this.modules = new Array(this.moduleCount);
		
		for (var row = 0; row < this.moduleCount; row++) {
			
			this.modules[row] = new Array(this.moduleCount);
			
			for (var col = 0; col < this.moduleCount; col++) {
				this.modules[row][col] = null;//(col + row) % 3;
			}
		}
	
		this.setupPositionProbePattern(0, 0);
		this.setupPositionProbePattern(this.moduleCount - 7, 0);
		this.setupPositionProbePattern(0, this.moduleCount - 7);
		this.setupPositionAdjustPattern();
		this.setupTimingPattern();
		this.setupTypeInfo(test, maskPattern);
		
		if (this.typeNumber >= 7) {
			this.setupTypeNumber(test);
		}
	
		if (this.dataCache === null) {
			this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
		}
	
		this.mapData(this.dataCache, maskPattern);
	},

	setupPositionProbePattern : function(row, col)  {
		
		for (var r = -1; r <= 7; r++) {
			
			if (row + r <= -1 || this.moduleCount <= row + r) continue;
			
			for (var c = -1; c <= 7; c++) {
				
				if (col + c <= -1 || this.moduleCount <= col + c) continue;
				
				if ( (0 <= r && r <= 6 && (c === 0 || c === 6) ) || 
                     (0 <= c && c <= 6 && (r === 0 || r === 6) ) || 
                     (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
					this.modules[row + r][col + c] = true;
				} else {
					this.modules[row + r][col + c] = false;
				}
			}		
		}		
	},
	
	getBestMaskPattern : function() {
	
		var minLostPoint = 0;
		var pattern = 0;
	
		for (var i = 0; i < 8; i++) {
			
			this.makeImpl(true, i);
	
			var lostPoint = QRUtil.getLostPoint(this);
	
			if (i === 0 || minLostPoint >  lostPoint) {
				minLostPoint = lostPoint;
				pattern = i;
			}
		}
	
		return pattern;
	},
	
	createMovieClip : function(target_mc, instance_name, depth) {
	
		var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
		var cs = 1;
	
		this.make();

		for (var row = 0; row < this.modules.length; row++) {
			
			var y = row * cs;
			
			for (var col = 0; col < this.modules[row].length; col++) {
	
				var x = col * cs;
				var dark = this.modules[row][col];
			
				if (dark) {
					qr_mc.beginFill(0, 100);
					qr_mc.moveTo(x, y);
					qr_mc.lineTo(x + cs, y);
					qr_mc.lineTo(x + cs, y + cs);
					qr_mc.lineTo(x, y + cs);
					qr_mc.endFill();
				}
			}
		}
		
		return qr_mc;
	},

	setupTimingPattern : function() {
		
		for (var r = 8; r < this.moduleCount - 8; r++) {
			if (this.modules[r][6] !== null) {
				continue;
			}
			this.modules[r][6] = (r % 2 === 0);
		}
	
		for (var c = 8; c < this.moduleCount - 8; c++) {
			if (this.modules[6][c] !== null) {
				continue;
			}
			this.modules[6][c] = (c % 2 === 0);
		}
	},
	
	setupPositionAdjustPattern : function() {
	
		var pos = QRUtil.getPatternPosition(this.typeNumber);
		
		for (var i = 0; i < pos.length; i++) {
		
			for (var j = 0; j < pos.length; j++) {
			
				var row = pos[i];
				var col = pos[j];
				
				if (this.modules[row][col] !== null) {
					continue;
				}
				
				for (var r = -2; r <= 2; r++) {
				
					for (var c = -2; c <= 2; c++) {
					
						if (Math.abs(r) === 2 || 
                            Math.abs(c) === 2 ||
                            (r === 0 && c === 0) ) {
							this.modules[row + r][col + c] = true;
						} else {
							this.modules[row + r][col + c] = false;
						}
					}
				}
			}
		}
	},
	
	setupTypeNumber : function(test) {
	
		var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
        var mod;
	
		for (var i = 0; i < 18; i++) {
			mod = (!test && ( (bits >> i) & 1) === 1);
			this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
		}
	
		for (var x = 0; x < 18; x++) {
			mod = (!test && ( (bits >> x) & 1) === 1);
			this.modules[x % 3 + this.moduleCount - 8 - 3][Math.floor(x / 3)] = mod;
		}
	},
	
	setupTypeInfo : function(test, maskPattern) {
	
		var data = (this.errorCorrectLevel << 3) | maskPattern;
		var bits = QRUtil.getBCHTypeInfo(data);
        var mod;
	
		// vertical		
		for (var v = 0; v < 15; v++) {
	
			mod = (!test && ( (bits >> v) & 1) === 1);
	
			if (v < 6) {
				this.modules[v][8] = mod;
			} else if (v < 8) {
				this.modules[v + 1][8] = mod;
			} else {
				this.modules[this.moduleCount - 15 + v][8] = mod;
			}
		}
	
		// horizontal
		for (var h = 0; h < 15; h++) {
	
			mod = (!test && ( (bits >> h) & 1) === 1);
			
			if (h < 8) {
				this.modules[8][this.moduleCount - h - 1] = mod;
			} else if (h < 9) {
				this.modules[8][15 - h - 1 + 1] = mod;
			} else {
				this.modules[8][15 - h - 1] = mod;
			}
		}
	
		// fixed module
		this.modules[this.moduleCount - 8][8] = (!test);
	
	},
	
	mapData : function(data, maskPattern) {
		
		var inc = -1;
		var row = this.moduleCount - 1;
		var bitIndex = 7;
		var byteIndex = 0;
		
		for (var col = this.moduleCount - 1; col > 0; col -= 2) {
	
			if (col === 6) col--;
	
			while (true) {
	
				for (var c = 0; c < 2; c++) {
					
					if (this.modules[row][col - c] === null) {
						
						var dark = false;
	
						if (byteIndex < data.length) {
							dark = ( ( (data[byteIndex] >>> bitIndex) & 1) === 1);
						}
	
						var mask = QRUtil.getMask(maskPattern, row, col - c);
	
						if (mask) {
							dark = !dark;
						}
						
						this.modules[row][col - c] = dark;
						bitIndex--;
	
						if (bitIndex === -1) {
							byteIndex++;
							bitIndex = 7;
						}
					}
				}
								
				row += inc;
	
				if (row < 0 || this.moduleCount <= row) {
					row -= inc;
					inc = -inc;
					break;
				}
			}
		}
		
	}

};

QRCode.PAD0 = 0xEC;
QRCode.PAD1 = 0x11;

QRCode.createData = function(typeNumber, errorCorrectLevel, dataList) {
	
	var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
	
	var buffer = new QRBitBuffer();
	
	for (var i = 0; i < dataList.length; i++) {
		var data = dataList[i];
		buffer.put(data.mode, 4);
		buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber) );
		data.write(buffer);
	}

	// calc num max data.
	var totalDataCount = 0;
	for (var x = 0; x < rsBlocks.length; x++) {
		totalDataCount += rsBlocks[x].dataCount;
	}

	if (buffer.getLengthInBits() > totalDataCount * 8) {
		throw new Error("code length overflow. (" + 
            buffer.getLengthInBits() + 
            ">" +  
            totalDataCount * 8 + 
            ")");
	}

	// end code
	if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
		buffer.put(0, 4);
	}

	// padding
	while (buffer.getLengthInBits() % 8 !== 0) {
		buffer.putBit(false);
	}

	// padding
	while (true) {
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD0, 8);
		
		if (buffer.getLengthInBits() >= totalDataCount * 8) {
			break;
		}
		buffer.put(QRCode.PAD1, 8);
	}

	return QRCode.createBytes(buffer, rsBlocks);
};

QRCode.createBytes = function(buffer, rsBlocks) {

	var offset = 0;
	
	var maxDcCount = 0;
	var maxEcCount = 0;
	
	var dcdata = new Array(rsBlocks.length);
	var ecdata = new Array(rsBlocks.length);
	
	for (var r = 0; r < rsBlocks.length; r++) {

		var dcCount = rsBlocks[r].dataCount;
		var ecCount = rsBlocks[r].totalCount - dcCount;

		maxDcCount = Math.max(maxDcCount, dcCount);
		maxEcCount = Math.max(maxEcCount, ecCount);
		
		dcdata[r] = new Array(dcCount);
		
		for (var i = 0; i < dcdata[r].length; i++) {
			dcdata[r][i] = 0xff & buffer.buffer[i + offset];
		}
		offset += dcCount;
		
		var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
		var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);

		var modPoly = rawPoly.mod(rsPoly);
		ecdata[r] = new Array(rsPoly.getLength() - 1);
		for (var x = 0; x < ecdata[r].length; x++) {
            var modIndex = x + modPoly.getLength() - ecdata[r].length;
			ecdata[r][x] = (modIndex >= 0)? modPoly.get(modIndex) : 0;
		}

	}
	
	var totalCodeCount = 0;
	for (var y = 0; y < rsBlocks.length; y++) {
		totalCodeCount += rsBlocks[y].totalCount;
	}

	var data = new Array(totalCodeCount);
	var index = 0;

	for (var z = 0; z < maxDcCount; z++) {
		for (var s = 0; s < rsBlocks.length; s++) {
			if (z < dcdata[s].length) {
				data[index++] = dcdata[s][z];
			}
		}
	}

	for (var xx = 0; xx < maxEcCount; xx++) {
		for (var t = 0; t < rsBlocks.length; t++) {
			if (xx < ecdata[t].length) {
				data[index++] = ecdata[t][xx];
			}
		}
	}

	return data;

};

module.exports = QRCode;

  };

  var QRCode = req('index');
  var ECC = req('QRErrorCorrectLevel');
  function matrix(text, ecc) {
    var level = ECC[ecc || 'M'] !== undefined ? ECC[ecc || 'M'] : ECC.M;
    var q = new QRCode(-1, level);
    q.addData(unescape(encodeURIComponent(String(text)))); // UTF-8 بايتات (يدعم العربية)
    q.make();
    var n = q.getModuleCount(), rows = [];
    for (var r = 0; r < n; r++) { var row = []; for (var c = 0; c < n; c++) row.push(q.isDark(r, c)); rows.push(row); }
    return rows;
  }
  function canvas(text, opts) {
    opts = opts || {};
    var m = matrix(text, opts.ecc), n = m.length, margin = opts.margin == null ? 4 : opts.margin;
    var size = opts.size || 256, cell = Math.max(1, Math.floor(size / (n + margin * 2)));
    var px = cell * (n + margin * 2), cv = document.createElement('canvas');
    cv.width = cv.height = px;
    var g = cv.getContext('2d');
    g.fillStyle = opts.light || '#ffffff'; g.fillRect(0, 0, px, px);
    g.fillStyle = opts.dark || '#000000';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (m[r][c]) g.fillRect((c + margin) * cell, (r + margin) * cell, cell, cell);
    return cv;
  }
  global.RmQR = { matrix: matrix, canvas: canvas };
})(typeof window !== 'undefined' ? window : globalThis);

/** portal.js — بوابة المعتمر: رحلتي، البرنامج، الإعلانات، طلب مساعدة، التقييم. المعتمر يرى بياناته فقط. */
(function () {
  var A = window.App, esc = A.esc, Fmt = A.Fmt;
  A.Pages.portal = async function (ctx) {
    var root = ctx.shell('portal', 'رحلتي', '');
    var tabs = [['home', 'رحلتي'], ['card', 'بطاقتي'], ['sched', 'البرنامج'], ['ann', 'الإعلانات'], ['help', 'المساعدة']];
    var cur = 'home', timer;
    root.innerHTML = '<div class="container-narrow mx-auto" style="max-width:760px"><ul class="nav nav-pills nav-fill rm-tabs mb-3" role="tablist">' + tabs.map(function (t) { return '<li class="nav-item"><button class="nav-link' + (t[0] === cur ? ' active' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button></li>'; }).join('') + '</ul><div id="pt-body"></div></div>';
    var body = A.$('#pt-body'), O;

    /* ---- نداء طارئ: «أنا تائه» / «سأتأخر عن الباص» ---- */
    function sosHtml() {
      return '<div class="rm-card mb-3" id="sos"><div class="rm-card-head"><h2>نداء طارئ</h2></div>' +
        '<p class="small text-secondary mb-2">يصل ندائك فوراً للمشرفين، ويُرسَل موقعك إن سمحت للمتصفح بذلك.</p>' +
        '<div class="row g-2"><div class="col-6"><button type="button" class="btn btn-danger w-100 h-100 py-3" data-sos="lost">🚨 أنا تائه</button></div>' +
        '<div class="col-6"><button type="button" class="btn btn-warning w-100 h-100 py-3" data-sos="late">⏰ سأتأخر عن الباص</button></div></div>' +
        '<div id="sos-m" class="mt-2" aria-live="polite"></div></div>';
    }
    var sosArm = {};
    function sosPos() {
      return new Promise(function (res) {
        if (!navigator.geolocation) { res(null); return; }
        var done = false, t = setTimeout(function () { if (!done) { done = true; res(null); } }, 7000);
        navigator.geolocation.getCurrentPosition(function (p) {
          if (done) return; done = true; clearTimeout(t);
          res({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy });
        }, function () { if (done) return; done = true; clearTimeout(t); res(null); }, { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 });
      });
    }
    body.addEventListener('click', async function (ev) {
      var b = ev.target.closest('[data-sos]'); if (!b) return;
      var kind = b.getAttribute('data-sos');
      if (!sosArm[kind]) { /* الضغطة الأولى تُجهّز والثانية ترسل، لتفادي الضغط بالخطأ */
        sosArm[kind] = true; b.setAttribute('data-label', b.textContent); b.textContent = 'اضغط مرة أخرى للتأكيد';
        setTimeout(function () { sosArm[kind] = false; if (b.isConnected && b.getAttribute('data-label')) b.textContent = b.getAttribute('data-label'); }, 4000);
        return;
      }
      sosArm[kind] = false; if (b.getAttribute('data-label')) b.textContent = b.getAttribute('data-label');
      var all = A.$$('[data-sos]'), msg = A.$('#sos-m');
      all.forEach(function (x) { x.disabled = true; });
      if (msg) msg.innerHTML = '<div class="alert alert-info py-2">جارٍ إرسال ندائك…</div>';
      try {
        var pos = await sosPos();
        var r = await Api.call('me.alerts.create', { kind: kind, lat: pos ? pos.lat : null, lng: pos ? pos.lng : null, acc: pos ? pos.acc : null });
        msg = A.$('#sos-m');
        if (msg) msg.innerHTML = '<div class="alert alert-success py-2">تم إرسال ندائك، وسيتواصل معك المشرف قريباً.' + (r && r.duplicate ? ' (أُرسل قبل قليل)' : '') + '</div>';
      } catch (e) {
        msg = A.$('#sos-m');
        if (msg) msg.innerHTML = '<div class="alert alert-danger py-2">تعذر إرسال النداء: ' + esc(Api.describe ? Api.describe(e) : (e.message || 'حاول مرة أخرى')) + '. اتصل بمشرفك مباشرة.</div>';
      }
      all.forEach(function (x) { x.disabled = false; });
    });
    root.addEventListener('click', function (ev) { var b = ev.target.closest('[data-tab]'); if (!b) return; cur = b.getAttribute('data-tab'); A.$$('[data-tab]', root).forEach(function (x) { x.classList.toggle('active', x === b); }); draw(); });
    function act(s) { return '<li><div class="flex-grow-1"><div class="fw-bold">' + esc(s.Title) + '</div><div class="small text-secondary">' + esc(A.enumLabel('schedule', 'Category', s.Category)) + (s.Location ? ' · ' + esc(s.Location) : '') + '</div>' + (s.Notes ? '<div class="small mt-1">' + esc(s.Notes) + '</div>' : '') + '</div><div class="text-end"><div class="num small">' + Fmt.time(s.Date_Time) + (s.End_Time ? '–' + Fmt.time(s.End_Time) : '') + '</div>' + A.liveBadge(s.live_state) + '</div></li>'; }

    async function home() {
      body.innerHTML = A.skeleton(3);
      try { O = await Api.call('me.overview', {}); } catch (e) { body.innerHTML = A.errBox(e); return; }
      var p = O.profile || {}, c = O.campaign;
      body.innerHTML = sosHtml() + '<div class="rm-card mb-3"><div class="rm-rule"><i></i></div><h2 class="fs-4 mb-1">السلام عليكم ' + esc(p.Full_Name || '') + '</h2><p class="text-secondary mb-0">' + esc(O.welcome || ('أهلاً بك في ' + O.company.name)) + '</p></div>' +
        (c ? '<div class="rm-card mb-3"><div class="rm-card-head"><h2>حملتي</h2></div><dl class="rm-kv mb-0"><dt>الحملة</dt><dd>' + esc(c.Campaign_Name) + '</dd><dt>الفترة</dt><dd class="num">' + Fmt.date(c.Start_Date) + ' ← ' + Fmt.date(c.End_Date) + '</dd><dt>الانطلاق من</dt><dd>' + esc(c.Departure_City || '—') + '</dd></dl></div>' : '') +
        '<div class="rm-card mb-3"><div class="rm-card-head"><h2>جارٍ الآن</h2><span class="rm-live"></span></div>' + (O.live_now.length ? '<ul class="rm-list">' + O.live_now.map(act).join('') + '</ul>' : A.emptyBox('لا نشاط جارياً الآن', '')) + '</div>' +
        '<div class="rm-card mb-3"><div class="rm-card-head"><h2>الموعد القادم</h2></div>' + (O.next_activity ? '<ul class="rm-list">' + act(O.next_activity) + '</ul>' : A.emptyBox('لا مواعيد قادمة', '')) + '</div>' +
        '<div class="rm-card"><div class="rm-card-head"><h2>التواصل مع الشركة</h2></div><p class="mb-1">' + esc(O.company.name) + '</p>' + (O.company.phone ? '<p class="mb-1 num" dir="ltr" style="text-align:start"><a href="tel:' + esc(O.company.phone) + '">' + esc(O.company.phone) + '</a></p>' : '') + (O.company.email ? '<p class="mb-0 small" dir="ltr" style="text-align:start">' + esc(O.company.email) + '</p>' : '') + '</div>' +
        (O.can_edit_contact ? '<div class="rm-card mt-3"><div class="rm-card-head"><h2>بيانات التواصل الخاصة بي</h2></div><form id="ct"><div class="row g-2"><div class="col-sm-6"><label class="form-label" for="ct-p">هاتفي</label><input id="ct-p" class="form-control" dir="ltr" value="' + esc(p.Phone || '') + '"></div><div class="col-sm-6"><label class="form-label" for="ct-e">هاتف جهة طوارئ</label><input id="ct-e" class="form-control" dir="ltr" value="' + esc(p.Emergency_Phone || '') + '"></div></div><div id="ct-m" class="mt-2"></div><button class="btn btn-ghost mt-2" type="submit">حفظ</button></form></div>' : '');
      var f = A.$('#ct'); if (f) f.addEventListener('submit', async function (ev) { ev.preventDefault(); var m = A.$('#ct-m'); try { await Api.call('me.updateContact', { Phone: A.$('#ct-p').value, Emergency_Phone: A.$('#ct-e').value }); m.innerHTML = '<div class="alert alert-success py-2 mb-0">تم الحفظ</div>'; } catch (e) { m.innerHTML = '<div class="alert alert-danger py-2 mb-0">' + esc(Api.describe(e)) + '</div>'; } });
    }

    /* ---- بطاقة المعتمر (QR) ---- */
    function loadImg(src) {
      return new Promise(function (res) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = src; });
    }
    function rrect(g, x, y, w, h, r) {
      g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
      g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
    }
    async function drawCard(p, c, co, code) {
      var W = 680, Hh = 960, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
      var g = cv.getContext('2d'), F = 'Tajawal, Cairo, Tahoma, sans-serif', GOLD = '#edcea0';
      g.fillStyle = '#21211d'; g.fillRect(0, 0, W, Hh);
      rrect(g, 18, 18, W - 36, Hh - 36, 34); g.strokeStyle = GOLD; g.lineWidth = 3; g.stroke();
      rrect(g, 30, 30, W - 60, Hh - 60, 26); g.strokeStyle = 'rgba(237,206,160,.35)'; g.lineWidth = 1.5; g.stroke();
      g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      var logo = await loadImg('assets/images/logo.png'), y = 70;
      if (logo) { g.drawImage(logo, W / 2 - 70, y, 140, 140); y += 165; } else { y += 30; }
      g.fillStyle = GOLD; g.font = '700 40px ' + F; g.fillText(co.name || 'رفيق المعتمر', W / 2, y + 30);
      g.fillStyle = '#d3d3c7'; g.font = '400 26px ' + F; g.fillText('بطاقة معتمر' + (c && c.Campaign_Name ? ' — ' + c.Campaign_Name : ''), W / 2, y + 74);
      var qs = 340, qx = (W - qs) / 2, qy = y + 110;
      g.fillStyle = '#ffffff'; rrect(g, qx - 22, qy - 22, qs + 44, qs + 44, 22); g.fill();
      var q = RmQR.canvas('RM1:' + code, { size: qs, margin: 0, ecc: 'M' });
      g.imageSmoothingEnabled = false; g.drawImage(q, qx + (qs - q.width) / 2, qy + (qs - q.height) / 2);
      var ty = qy + qs + 100;
      g.fillStyle = '#f8f9fa'; g.font = '700 44px ' + F; g.fillText(p.Full_Name || '', W / 2, ty, W - 100);
      g.fillStyle = GOLD; g.font = '700 36px ' + F; g.direction = 'ltr'; g.fillText(code, W / 2, ty + 56);
      g.direction = 'rtl'; g.fillStyle = '#a3a396'; g.font = '400 22px ' + F; g.fillText('أظهر هذه البطاقة للمشرف عند الصعود للباص', W / 2, Hh - 70);
      return cv.toDataURL('image/png');
    }
    async function card() {
      body.innerHTML = A.skeleton(2);
      try { O = O || await Api.call('me.overview', {}); } catch (e) { body.innerHTML = A.errBox(e); return; }
      var p = O.profile || {}, code = p.Pilgrim_Code || '';
      if (!code) { body.innerHTML = A.emptyBox('بطاقتك غير جاهزة بعد', 'تواصل مع الشركة'); return; }
      body.innerHTML = '<div class="rm-card text-center"><p class="small text-secondary mb-3">أظهر هذه البطاقة للمشرف عند الصعود للباص أو تسجيل الحضور.</p>' +
        '<img id="cd-img" alt="بطاقة المعتمر" width="340" style="max-width:100%;height:auto;border-radius:16px;display:block;margin:0 auto" hidden>' +
        '<div id="cd-load" class="text-secondary py-5">جارٍ تجهيز البطاقة…</div>' +
        '<div class="d-grid gap-2 mt-3"><a id="cd-save" class="btn btn-gold" download="بطاقة-' + esc(code) + '.png" hidden>حفظ البطاقة كصورة</a>' +
        '<button type="button" id="cd-share" class="btn btn-ghost" hidden>مشاركة البطاقة</button></div></div>';
      try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { /* تجاهل */ }
      var url;
      try { url = await drawCard(p, O.campaign, O.company || {}, code); } catch (e) { A.$('#cd-load').textContent = 'تعذر تجهيز البطاقة'; return; }
      var im = A.$('#cd-img'), sv = A.$('#cd-save'); if (!im) return;
      im.src = url; im.hidden = false; sv.href = url; sv.hidden = false; A.$('#cd-load').hidden = true;
      if (navigator.canShare && navigator.share) {
        var sh = A.$('#cd-share'); sh.hidden = false;
        sh.addEventListener('click', async function () {
          try { var blob = await (await fetch(url)).blob(), f = new File([blob], 'بطاقة-' + code + '.png', { type: 'image/png' }); if (navigator.canShare({ files: [f] })) await navigator.share({ files: [f] }); } catch (e) { /* أُلغيت المشاركة */ }
        });
      }
    }
    async function sched() {
      body.innerHTML = '<div class="d-flex gap-2 mb-3"><input type="date" id="sd" class="form-control" aria-label="اليوم"><button class="btn btn-ghost" id="sd-all">كل الأيام</button></div><div class="rm-card" id="sl">' + A.skeleton(3) + '</div>';
      async function load() {
        var box = A.$('#sl'); if (!box) return;
        try { var r = await Api.call('me.schedule', { date: A.$('#sd').value || undefined }); box.innerHTML = r.items.length ? '<ul class="rm-list">' + r.items.map(function (s) { return '<li class="flex-column align-items-stretch"><div class="small text-secondary num">' + Fmt.date(String(Fmt.toInput(s.Date_Time)).substring(0, 10)) + '</div><ul class="rm-list m-0">' + act(s) + '</ul></li>'; }).join('') + '</ul>' : A.emptyBox('لا مواعيد', 'لم تُضف أنشطة لهذا اليوم بعد.'); } catch (e) { box.innerHTML = A.errBox(e); }
      }
      load(); A.$('#sd').addEventListener('change', load); A.$('#sd-all').addEventListener('click', function () { A.$('#sd').value = ''; load(); });
      timer = setInterval(function () { if (!document.hidden && cur === 'sched') load(); }, 60000);
    }
    async function ann() {
      body.innerHTML = A.skeleton(3);
      try { var r = await Api.call('me.announcements', {}); body.innerHTML = r.items.length ? r.items.map(function (a) { return '<div class="rm-card mb-3"><div class="d-flex justify-content-between gap-2"><h3 class="fs-5">' + esc(a.Title) + '</h3>' + A.badge('announcements', 'Priority', a.Priority) + '</div><p class="mb-1" style="white-space:pre-line">' + esc(a.Message) + '</p><div class="small text-secondary num">' + Fmt.dateTime(a.Created_At) + '</div></div>'; }).join('') : '<div class="rm-card">' + A.emptyBox('لا إعلانات', 'ستظهر إعلانات حملتك هنا.') + '</div>'; } catch (e) { body.innerHTML = A.errBox(e); }
    }
    async function help() {
      body.innerHTML = sosHtml() + '<div class="rm-card mb-3"><form id="hf"><label class="form-label" for="h-m">اكتب طلبك</label><textarea id="h-m" class="form-control" rows="4" maxlength="1000" required></textarea><div class="form-text">لا ترسل كلمات مرور أو أرقام بطاقات أو بيانات جواز هنا.</div><div id="h-e" class="mt-2"></div><button class="btn btn-gold mt-2" type="submit">إرسال</button></form></div><div id="hl">' + A.skeleton(2) + '</div><div id="rt"></div>';
      async function load() { var box = A.$('#hl'); try { var r = await Api.call('me.inquiries.list', {}); box.innerHTML = r.items.length ? r.items.map(function (i) { return '<div class="rm-card mb-2"><div class="d-flex justify-content-between"><span class="num small text-secondary">' + Fmt.dateTime(i.Created_At) + '</span>' + A.badge('inquiries', 'Status', i.Status) + '</div><p class="mb-1 mt-1">' + esc(i.Message) + '</p>' + (i.Response ? '<div class="p-2 rounded" style="background:var(--rm-surface-2);border-inline-start:3px solid var(--rm-gold)"><b>رد الشركة:</b> ' + esc(i.Response) + '</div>' : '') + '</div>'; }).join('') : ''; } catch (e) { box.innerHTML = A.errBox(e); } }
      load();
      A.$('#hf').addEventListener('submit', async function (ev) {
        ev.preventDefault(); var b = this.querySelector('button'), er = A.$('#h-e'); b.disabled = true; er.innerHTML = '';
        try { await Api.call('me.inquiries.create', { Message: A.$('#h-m').value }); A.$('#h-m').value = ''; A.toast('أُرسل طلبك', 'ok'); load(); } catch (e) { er.innerHTML = '<div class="alert alert-danger py-2 mb-0">' + esc(Api.describe(e)) + '</div>'; }
        b.disabled = false;
      });
      try {
        var s = await Api.call('me.rating.get', {}), rt = A.$('#rt');
        if (s.eligible) {
          rt.innerHTML = '<div class="rm-card"><h3 class="fs-5">قيّم حملتك</h3><form id="rf"><div class="d-flex gap-2 mb-2" role="radiogroup" aria-label="التقييم">' + [1, 2, 3, 4, 5].map(function (n) { return '<label class="btn btn-ghost px-3"><input type="radio" name="rate" value="' + n + '" class="visually-hidden"> ' + n + ' ★</label>'; }).join('') + '</div><textarea id="r-c" class="form-control mb-2" rows="2" maxlength="500" placeholder="تعليق (اختياري)"></textarea><div id="r-e"></div><button class="btn btn-gold" type="submit">إرسال التقييم</button></form></div>';
          A.$$('#rf label').forEach(function (l) { l.addEventListener('click', function () { setTimeout(function () { A.$$('#rf label').forEach(function (x) { x.classList.toggle('btn-gold', x.querySelector('input').checked); x.classList.toggle('btn-ghost', !x.querySelector('input').checked); }); }, 0); }); });
          A.$('#rf').addEventListener('submit', async function (ev) { ev.preventDefault(); var sel = A.$('#rf input:checked'); if (!sel) { A.$('#r-e').innerHTML = '<div class="alert alert-danger py-2">اختر عدد النجوم</div>'; return; } try { await Api.call('me.rating.create', { Rating: Number(sel.value), Comment: A.$('#r-c').value }); rt.innerHTML = '<div class="rm-card">شكراً لتقييمك.</div>'; } catch (e) { A.$('#r-e').innerHTML = '<div class="alert alert-danger py-2">' + esc(Api.describe(e)) + '</div>'; } });
        } else if (s.rated) rt.innerHTML = '<div class="rm-card">شكراً، سبق أن قيّمت حملتك.</div>';
      } catch (e) { /* التقييم اختياري */ }
    }
    function draw() { clearInterval(timer); ({ home: home, card: card, sched: sched, ann: ann, help: help })[cur](); }
    draw();
  };
})();
