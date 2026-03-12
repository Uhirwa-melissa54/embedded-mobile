// Global type definitions for EdgeWallet

interface User {
  username: string;
  password: string;
  role: 'agent' | 'sales';
  name: string;
}

declare global {
  var currentUser: User | null;
}

export {};
