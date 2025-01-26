export interface Session {
  id: number;
  title: string;
  is_acepting_questions: boolean;
}

export interface SessionsResponse {
  results: Session[];
}

export interface RunningSession {
  id: number;
  session: {
    id: number;
    title: string;
    is_acepting_questions: boolean;
  };
}

export interface RunningSessionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RunningSession[];
}
