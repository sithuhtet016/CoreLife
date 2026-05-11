export type SummarySection = {
  overview: string;
  mainIdea: string;
  keyIdeas: string[];
  actionSteps: string[];
  whoShouldRead: string;
  commentary: string;
  finalTakeaway: string;
  readingTime: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  status: "published" | "draft";
  createdAt: string;
  summary: SummarySection;
};

export type BookRequest = {
  id: string;
  name: string;
  email: string;
  bookTitle: string;
  author?: string;
  note?: string;
  createdAt: string;
};
