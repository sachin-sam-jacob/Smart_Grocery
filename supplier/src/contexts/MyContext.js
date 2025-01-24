import { createContext } from 'react';

export const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
    // Add any shared state or functions here
    const contextValue = {
        // Add your context values here
    };

    return (
        <MyContext.Provider value={contextValue}>
            {children}
        </MyContext.Provider>
    );
}; 