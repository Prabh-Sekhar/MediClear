import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for auth changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                // Fetch profile in the background without blocking the UI
                fetchProfile(firebaseUser.uid);
            } else {
                setProfile(null);
            }
            // Always unlock the UI immediately
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const docRef = doc(db, 'profiles', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setProfile({ id: userId, ...docSnap.data() });
            } else {
                setProfile(null);
            }
        } catch (err) {
            console.warn('Profile fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email, password, fullName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        // Create profile document
        const profileData = {
            full_name: fullName,
            created_at: new Date().toISOString()
        };

        await setDoc(doc(db, 'profiles', newUser.uid), profileData);
        setProfile({ id: newUser.uid, ...profileData });

        return newUser;
    };

    const signIn = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
        setProfile(null);
    };

    const updateProfile = async (updates) => {
        if (!user) return;
        const profileRef = doc(db, 'profiles', user.uid);
        await updateDoc(profileRef, updates);

        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        return newProfile;
    };

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile: () => user && fetchProfile(user.uid),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
