export interface Guest {
  id: string;
  name: string;
}

export interface Table {
  id: number;
  guests: (Guest | null)[];
}