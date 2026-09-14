import React, { createContext, useContext, useState } from 'react';

export type ReadingLayout = 'large' | 'small' | 'compact';

type ReadingModeContextType = {
  layout: ReadingLayout;
  simpleMode: boolean;
  setLayout: (layout: ReadingLayout) => void;
  setSimpleMode: (val: boolean) => void;
};

const ReadingModeContext = createContext<ReadingModeContextType>({
  layout: 'large',
  simpleMode: false,
  setLayout: () => {},
  setSimpleMode: () => {},
});

export function ReadingModeProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<ReadingLayout>('large');
  const [simpleMode, setSimpleMode] = useState<boolean>(false);

  const value = {
    layout,
    simpleMode,
    setLayout,
    setSimpleMode,
  };

  return <ReadingModeContext.Provider value={value}>{children}</ReadingModeContext.Provider>;
}

export function useReadingMode() {
  return useContext(ReadingModeContext);
}
