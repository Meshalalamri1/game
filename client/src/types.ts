
export interface Team {
  id: number;
  name: string;
  score: number;
}

export interface Topic {
  id: number;
  name: string;
}

export interface Question {
  id: number;
  topicId: number;
  points: number;
  text: string;
  used: boolean;
}
