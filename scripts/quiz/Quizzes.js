const Quiz = require("quiz/type/structures/Quiz"),
      QuizEntry = require("quiz/type/structures/QuizEntry"),
      Answer = require("quiz/type/structures/Answer"),
      QuizStats = require("quiz/type/QuizStats");

function QuizWinDialog(answers) {
	this.answers = answers;
	return {
		answers: this.answers,
		show(correctAnswers) {
			 let dialog = new BaseDialog("Quiz finished");
			
			 dialog.cont.table(Styles.none, t => {
				 t.add(Core.bundle.format("ui.quiz-pages", correctAnswers, this.answers.length)).color(Color.lightGray);
				 t.add("answers").padLeft(8);
			 }).row();
			 dialog.cont.button("@back", Icon.left, () => dialog.hide()).size(120, 50).margin(12).padTop(20);
			
			 dialog.show();
		},
	};
};

function QuizDialog(quiz) {
	this.quiz = quiz;
	return {
		quiz: this.quiz,
		stats: new QuizStats(),
		currentIndex: 0,
		correctAnswersTotal: 0,
		answered: [],
		answersChecked: [],
		currentEntry: null,
		dialog: null,
		show() {
			this.start();
			
			let dialog = new BaseDialog(quiz.name);
			let tab = dialog.cont.table(Styles.none, t => {
			    this.rebuild(t);
			}).padBottom(20).get();
            dialog.cont.row();
			
			dialog.cont.table(Styles.none, t => {
				t.defaults().pad(8);
			    if (quiz.entries.length > 1) {
				    t.button(Icon.left, () => {
			            this.setIndex(this.currentIndex - 1);
					    this.rebuild(tab);
                    }).size(50);
                    
                    t.add("").update(l => l.setText(Core.bundle.format("ui.quiz-pages", this.currentIndex + 1, quiz.entries.length)));
                    
				    t.button(Icon.right, () => {    
                        this.setIndex(this.currentIndex + 1);
			            this.rebuild(tab);
                    }).size(50);
                }
            });
            
            dialog.titleTable.row();
			dialog.titleTable.table(Styles.none, t => {
				t.add("").update(l => {
					let answered = this.stats.correctAnswers;
                    l.setText(Core.bundle.format("ui.quiz-number", answered));
                });
                t.image(Icon.ok).size(40).padLeft(8);
			}).padTop(16).padRight(60).right();
			
			dialog.addCloseButton();
			this.dialog = dialog;
			
			dialog.show();
		},
		rebuild(table) {
			let entry = this.currentEntry;
			
			this.answersChecked = [];
			table.clear();
			table.table(Styles.none, t => {
				 t.add(entry != null ? entry.title : "<None>").padBottom(8);
				 t.row();
				 t.image(Core.atlas.find("whiteui")).color(Pal.gray).size(1000, 3.50).padBottom(30).row();
                 if (entry != null) {
                 let correctAnswers = 0;
				 entry.answers.each(a => {
					if (a.isCorrect) correctAnswers++;
			     });
			
				 t.table(Styles.none, t2 => {
				     let r = 0;
				     entry.answers.each(a => {
					     t2.table(Styles.none, t3 => {
						     let image = t3.image(Core.atlas.find("clear")).size(40).get();
					         let button = t3.button(a.name, () => {
						         this.answersChecked.push(a);
						         if (this.answersChecked.length >= correctAnswers) {
							         this.answersChecked.forEach((ans, i) => {
								         this.answered.push(ans);
								         this.stats.correctAnswers = this.correctAnswersDone();
								         Time.run(40 * i, run(() => {
						                     if (ans.isCorrect) {
                                                 Sounds.unlock.play();
                                             }
                                             else {
                                                 Sounds.shootBig.play();
                                             }
                                         }));
                                     });
						             entry.answered = true;
						             this.answersChecked = [];
					             }
					             if (this.answered.length >= this.correctAnswersTotal) {  
						             Time.run(120 + 30, run(() => {
							             let winDialog = new QuizWinDialog(this.answered);
						                 if (this.dialog.isShown()) {
							                 this.dialog.hide();
							             }
							             let correct = this.stats.correctAnswers;
						                 winDialog.show(correct);
					                 }));
						         }
                             }).size(200, 60).padLeft(4).get();
                             
                             image.update(() => {
                             	if (entry.answered) {
                             	    let icon = a.isCorrect ? Icon.ok : Icon.cancel;
                                     image.setDrawable(icon);
                                 }
                             });
                             button.update(() => {
                             	if (entry.answered) {
                             	    button.touchable = Touchable.disabled;
                             	}
                             });
                         }).pad(8);
					     if (++r % 2 == 0) t2.row();
					 });
				 }).padBottom(8).row();
			     
			     if (correctAnswers > 1) {
				     t.add(Core.bundle.format("ui.quiz-entryMultiple", correctAnswers)).color(Color.lightGray).row();
				 }
				 }
			});
		},
		start() {
			if (quiz.entries.length > 0) {
                this.currentEntry = quiz.entries[0];
                let result = 0;
                for (let entry of quiz.entries) {
                	entry.answered = false;
                    entry.answers.each(a => {
					     if (a.isCorrect) result++;
			        });
                }
                this.correctAnswersTotal = result;
            }
            this.currentIndex = 0;
            this.stats.correctAnswers = 0;
            this.answersChecked = [];
		},
		correctAnswersDone() {
			let result = 0;
			this.answered.forEach(a => {
		        if (a.isCorrect) {
					 result++;
			    }
			});
			return result;
		},
		setIndex(number) {
			this.currentIndex = number;
		    this.clampIndex();
	        this.currentEntry = quiz.entries[this.currentIndex];
        },
		clampIndex() {
			if (quiz.entries.length <= 0) return;
			
		    this.currentIndex = Mathf.clamp(this.currentIndex, 0, quiz.entries.length - 1);
		},
	};
};

function QuizListDialog() {
   return {
       show(list) {
           let dialog = new BaseDialog("Quiz list");
           
           let r = 0;
           dialog.cont.table(Styles.none, t => {   
               list.each(quiz => {
                   t.table(Tex.button, t2 => {
                   	 t2.table(Styles.none, tg => {
                            tg.add(quiz.name).padBottom(8);
                            tg.button("?", Styles.flatBordert, () => {
                             	let descriptionDialog = new BaseDialog("");
                                 descriptionDialog.cont.table(Styles.none, t3 => {
                                 	t3.table(Styles.none, th => {
                                      	th.add("Name:");
                                          th.add(quiz.name).color(Color.lightGray).padLeft(8);
                                     }).padBottom(8).left().row();
                                 
                                 	t3.add("Description:").padBottom(8).left().row();
                            
                                     t3.pane(Styles.defaultPane, t4 => {
                                      	t4.labelWrap(quiz.description).color(Color.lightGray).size(300, 250).top().left();
                                     }).size(400, 250).padBottom(10).row();
                                
                                     t3.image(Core.atlas.find("whiteui")).color(Pal.gray).size(400, 3.50).row();
                                 });
                                 descriptionDialog.addCloseButton();
                            
                                 descriptionDialog.show();
                            }).size(40).padLeft(8);
                        });
                        t2.row();
                        
                        t2.button(Icon.play, Styles.cleari, () => {
                        	let q = new QuizDialog(quiz);
                            
                            q.show();
                        }).size(40); 
                   }).margin(12).pad(4);
                   if (++r % 2 == 0) t.row();
               });
           });
           
           dialog.addCloseButton();
           
           dialog.show();
       },
       showOnce(quiz) {
       	let quizzes = new Seq().add(quiz);
           
       	this.show(quizzes);
       },
   };
};

function QuizNewDialog() {
   return {
   	quiz: null,
   	name: null,
       description: "",
       show(list) {
       	this.quiz = new Quiz("");
           let dialog = new BaseDialog("New quiz");
           dialog.cont.table(Styles.none, t => {
           	 t.defaults().padBottom(8);
            	t.add("Overview").row();
            	t.table(Styles.none, t2 => {             
                	t2.add("Name:");
               	 t2.field(this.name != null ? this.name : "<None>", text => {
   	                 if (text.empty) return;
                        let out = text.trim();
           	         this.name = out;
                    }).width(250).padLeft(4);
                }).row();
                
                t.add("Description:").left();
                t.row();
                t.area(this.description, Styles.areaField, text => {
                	this.description = text;
                }).size(250, 100);
           });
           let entryTable = dialog.cont.table(Styles.none, t => {
           	 this.rebuildEntryTable(t);
           }).get();
           
           dialog.addCloseButton();
           dialog.buttons.button("@add", Icon.add, () => {
               let add = new BaseDialog("@add");
               add.cont.table(Styles.none, t => {
               	t.defaults().margin(12).pad(8);
               
               	t.button("Entry", Icon.book, t2 => {
               	    this.quiz.addEntry("entry");
                       this.rebuildEntryTable(entryTable);
                       add.hide();
                   }).size(200, 60);
                   
                   t.button("Answer", Icon.info, t2 => {
               	    let add2 = new BaseDialog("");
                       add2.cont.add("Add to what entry?").padBottom(16).row();
                       
                       add2.cont.pane(Styles.defaultPane, t3 => {
                       	let r = 0;
                           for (let g of this.quiz.entries) {
                           	let entry = this.quiz.entries[r];
                           	t3.button(entry.title, Icon.book, t4 => {
               	                 entry.answers.add(new Answer("answer"));
                                    add2.hide();
                               }).size(200, 60).margin(12).pad(8);
                               if (++r % 3 == 0) t3.row();
                           }
                       }).size(600, 400);
                       add2.addCloseButton();
                       
                       add2.show();
                   }).size(200, 60); 
               });
               add.addCloseButton();
               
               add.show();
           });
           dialog.buttons.button("@ok", Icon.ok, () => {
               if (this.name != null) {
                   this.quiz.name = this.name;
                   this.quiz.description = this.description;
                   //quiz.entries.push(new QuizEntry(""));
                   
                   list.add(this.quiz);
               }
               dialog.hide();
           });
           
           dialog.show();
       },
       rebuildEntryTable(table) {
	       table.clear();
	
	       table.defaults().padBottom(8);
       	table.add("Entries:").row();
           table.pane(Styles.defaultPane, t => {
           	let r = 0;
               for (let g of this.quiz.entries) {
                	let entry = this.quiz.entries[r];
                    t.table(Tex.button, t2 => {
                    	t2.button("?", Styles.cleart, () => {
               	        Log.info("Clicked on an entry.");
               
                           let dialog = new BaseDialog("");
                           dialog.cont.table(Styles.none, t => {
                           	let d = 0;
				               entry.answers.each(a => {    
					              t.table(Tex.button, t2 => {
						              let ch = a.isCorrect;
					                  t2.check("", ch, bool => {
						                  Log.info("Clicked on a response.");
						                  a.isCorrect = bool;
						              });
						
					                  t2.field(a.name, text => {
   	                                   if (text.empty) return;
                                          let o = text.trim();
                                          a.name = o;
                                      }).width(120).padLeft(4); 
                                  }).pad(8); 
                                  
					              if (++d % 2 == 0) t.row();
					           });
                           });
                           dialog.addCloseButton();
                           
                           dialog.show();
                        }).size(40);
                        
                        t2.field(entry.title, text => {
   	                     if (text.empty) return;
                            let o = text.trim();
                            
                            entry.title = o;
                        }).width(120).padLeft(4);
                    }).margin(12).pad(8);
                    if (++r % 3 == 0) t.row();
               }
           }).size(350, 200);
       },
   };
};

module.exports = {
	Quiz: Quiz,
	QuizEntry: QuizEntry,
	Answer: Answer,
	QuizStats: QuizStats,
	
	QuizWinDialog: QuizWinDialog,
	QuizDialog: QuizDialog,
	QuizListDialog: QuizListDialog,
	QuizNewDialog: QuizNewDialog,
};