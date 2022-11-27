module.exports = function(name) {
	this.name = name;
    return {
       name: this.name,
       isCorrect: false,
    };
};