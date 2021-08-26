if (!String.prototype.padStart) {
	String.prototype.padStart = function padStart(targetLength, padString) {
			targetLength = targetLength >> 0; //truncate if number, or convert non-number to 0;
			padString = String(typeof padString !== 'undefined' ? padString : ' ');
			if (this.length >= targetLength) {
					return String(this);
			} else {
					targetLength = targetLength - this.length;
					if (targetLength > padString.length) {
							padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
					}
					return padString.slice(0, targetLength) + String(this);
			}
	};
}
module.exports = class Helpers
{
	static str2date(str)
	{
		str = str.split(/[\s\/:]+/);
		
		if (str[3] === undefined)
		{
			str[3] = 0;
			str[4] = 0;
			str[5] = 0;
		}
		
		// Data em GMT-3
		//let dtStr = `${str[2]}-${str[1]}-${str[0]}T${str[3].toString().padStart(2,'0')}:${str[4].toString().padStart(2,'0')}:${str[5].toString().padStart(2,'0')}-03:00`;
		
		// Data em UTC
		let dtStr = `${str[2]}-${str[1]}-${str[0]}T${str[3].toString().padStart(2,'0')}:${str[4].toString().padStart(2,'0')}:${str[5].toString().padStart(2,'0')}Z`;
		let dt = new Date(dtStr);
		return dt;
	}
}