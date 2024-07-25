/*---------------------------------------------------------------------------
	File Name:	AppContext.js
	Author:		Aswin Sreeraj
	Date:		20/06/2024
	Modified:	Aswin Sreeraj & 15/07/2024
	© Fanshawe College, 2024

	Description: For providing app context for global data
---------------------------------------------------------------------------*/
import React, { createContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [tempPref, setTempPref] = useState(true);
    const [serverIP, setServerIP] = useState(''); // Include serverIP and its setter

    return (
        <AppContext.Provider value={{
            tempPref,
            setTempPref,
            serverIP,
            setServerIP  // Now available to consuming components
        }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;

//===========================================================================
