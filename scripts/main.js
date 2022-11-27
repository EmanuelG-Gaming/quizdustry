// Example quiz (in main.js):
/*
  // Including the header file (make sure you have this library as a dependency for your mod) 
  const Quizzes = require("quiz/Quizzes");
 
  Events.on(ClientLoadEvent, () => {
      let exampleQuiz = new Quizzes.Quiz("Example quiz");
      exampleQuiz.description = "An example quiz.";
 
      // Add the first entry that has two answers, with the second being the correct answer
      exampleQuiz.addEntry("Example entry 1");
      exampleQuiz.addAnswers(0, ["A", "B"], [false, true]);
 
      // Add the second entry that is multiple-choice
      exampleQuiz.addEntry("Example entry 2");
      exampleQuiz.addAnswers(1, ["C", "D", "E", "F"], [false, false, true, true]);
      // Set up the dialog that is used to list your quiz
      let dialog = new Quizzes.QuizListDialog();
 
      // Show the dialog, along with your quiz
      dialog.showOnce(exampleQuiz);
  });
*/