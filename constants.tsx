
import { Question, QuestionType } from './types';

export const INITIAL_QUESTIONS: Question[] = [
  {
    "id": "q_1_1",
    "type": "spelling_correction",
    "question": "Listen and spell out the word: 美食廣場 (f___ c___)",
    "options": null,
    "answer": "food court",
    "category": "Vocabulary",
    "original_text": "1. food court 美食廣場",
    "explanation": "Food court means a place with many small restaurants."
  },
  {
    "id": "q_1_2",
    "type": "MCQ",
    "question": "She ____ to the park every Sunday.",
    "options": ["go", "goes", "going"],
    "answer": "goes",
    "category": "Grammar",
    "explanation": "Present simple third person singular uses 'goes'."
  },
  {
    "id": "q_1_3",
    "type": "spelling_correction",
    "question": "Spell the word for a place where you watch movies: (c___m___)",
    "options": null,
    "answer": "cinema",
    "category": "Vocabulary",
    "original_text": "cinema 電影院",
    "explanation": "Cinema is where you go to see the latest movies on a big screen."
  },
  {
    "id": "q_1_4",
    "type": "MCQ",
    "question": "We ____ playing football right now.",
    "options": ["is", "am", "are"],
    "answer": "are",
    "category": "Grammar",
    "explanation": "We use 'are' with plural subjects in present continuous."
  },
  {
    "id": "q_1_5",
    "type": "spelling_correction",
    "question": "You use this to eat soup: (s___n)",
    "options": null,
    "answer": "spoon",
    "category": "Vocabulary",
    "explanation": "A spoon is a common kitchen utensil used for liquids."
  }
];
