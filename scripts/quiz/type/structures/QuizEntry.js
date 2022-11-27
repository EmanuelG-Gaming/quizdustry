module.exports = function(title) {
	this.title = title;
    return {
       title: this.title,
       answers: new Seq(),
       answered: false,
    };
};