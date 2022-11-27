const QuizEntry = require("quiz/type/structures/QuizEntry"),
      Answer = require("quiz/type/structures/Answer"); 

module.exports = function(name) {
	this.name = name;
    return {
       name: this.name,
       description: "",
       entries: [],
       addEntry(name) {
       	this.entries.push(new QuizEntry(name));
       },
       addAnswer(entryIndex, name, correct) {
       	let a = new Answer(name);
           a.isCorrect = correct;
           
       	this.entries[entryIndex].answers.add(a);
       },
       addAnswers(entryIndex, names, answerCorrect) {
       	let answers = [];
           names.forEach((name, index) => {
           	let answer = new Answer(name);
               answer.isCorrect = answerCorrect[index];
               answers.push(answer);
       	});
       
       	this.entries[entryIndex].answers.addAll(answers);
       },
    };
};