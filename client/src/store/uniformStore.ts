import { create } from 'zustand';

interface UniformState {
  schoolId: string | null;
  gender: string | null;
  classRange: string | null;
  
  setSchoolId: (id: string) => void;
  setGender: (gender: string) => void;
  setClassRange: (classRange: string) => void;
  resetUniformFlow: () => void;
}

const initialState = {
  schoolId: null,
  gender: null,
  classRange: null,
};

export const useUniformStore = create<UniformState>((set) => ({
  ...initialState,

  setSchoolId: (schoolId) => set({ schoolId }),
  
  setGender: (gender) => set({ gender }),
  
  setClassRange: (classRange) => set({ classRange }),
  
  resetUniformFlow: () => set(initialState),
}));
