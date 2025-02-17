import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext(undefined);

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession deve essere utilizzato all\'interno di un SessionProvider');
    }
    return context;
}

export function SessionProvider({ children }) {
    const [token, setToken] = useState(() => sessionStorage.getItem('token'));
    const [clusterIdPrivate, setClusterIdPrivate] = useState(() => sessionStorage.getItem('cluster_id_private'));
    const [clusterIdPublic, setClusterIdPublic] = useState(() => sessionStorage.getItem('cluster_id_public'));
    const [lastLogin, setLastLogin] = useState(() => sessionStorage.getItem('last_login'))
    const [role, setRole] = useState(() => sessionStorage.getItem('role'))
    const [urlAvatar, setUrlAvatar] = useState(() => sessionStorage.getItem('url_avatar'))
    const [email, setEmail] = useState(() => sessionStorage.getItem('email'))


    const login = (newToken, newClusterIdPrivate, newClusterIdPublic, lastLogin, role, urlAvatar, email) => {
        setToken(newToken);
        setClusterIdPrivate(newClusterIdPrivate);
        setClusterIdPublic(newClusterIdPublic);
        sessionStorage.setItem('token', newToken);
        sessionStorage.setItem('cluster_id_private', newClusterIdPrivate);
        sessionStorage.setItem('cluster_id_public', newClusterIdPublic);

        setLastLogin(lastLogin)
        setRole(role)
        setUrlAvatar(urlAvatar)
        sessionStorage.setItem('last_login', lastLogin);
        sessionStorage.setItem('role', role);
        sessionStorage.setItem('url_avatar', urlAvatar);

        setEmail(email)
        sessionStorage.setItem('email', email);


    };

    const logout = () => {
        setToken(null);
        setClusterIdPrivate(null);
        setClusterIdPublic(null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('cluster_id_private');
        sessionStorage.removeItem('cluster_id_public');

        setLastLogin(null)
        setRole(null)
        setUrlAvatar(null)
        sessionStorage.removeItem('last_login');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('url_avatar');

        setEmail(null)
        sessionStorage.removeItem("email")
    };

    const isAuthenticated = !!token;

    return (
        <SessionContext.Provider value={{ token, clusterIdPrivate, clusterIdPublic, login, logout, isAuthenticated, lastLogin, role, urlAvatar, email }}>
            {children}
        </SessionContext.Provider>
    );
}
