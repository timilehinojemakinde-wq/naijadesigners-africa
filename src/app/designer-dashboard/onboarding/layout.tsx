"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";

export type OnboardingData = {
    businessType: string;
    yearsExperience: string;
    location: string;
    brandName: string;
    slug: string;
    bio: string;
    instagram: string;
};

type ContextType = {
    data: OnboardingData;
    setData: Dispatch<SetStateAction<OnboardingData>>;
};

const OnboardingContext = createContext<ContextType | null>(null);

export function useOnboarding() {
    const ctx = useContext(OnboardingContext);
    if (!ctx) throw new Error("useOnboarding must be used inside onboarding layout");
    return ctx;
}

const defaultData: OnboardingData = {
    businessType: "",
    yearsExperience: "",
    location: "",
    brandName: "",
    slug: "",
    bio: "",
    instagram: "",
};

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    const [data, setData] = useState<OnboardingData>(defaultData);

    return (
        <OnboardingContext.Provider value={{ data, setData }}>
            {children}
        </OnboardingContext.Provider>
    );
}