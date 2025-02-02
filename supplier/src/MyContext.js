import { createContext } from 'react';

export const MyContext = createContext({
    setProgress: () => {},
    setAlertBox: () => {},
    progress: 0,
    alertBox: {
        open: false,
        error: false,
        msg: ''
    }
}); 