"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type MediaItem = {
    id: string;
    file: File;
    preview: string;
    url?: string;
    type: "image" | "video";
    status: "uploading" | "done" | "error";
    error?: string;
};

export type ProductDraft = {
    media: MediaItem[];
    name: string;
    description: string;
    category: string;
    productType: string;
    currency: string;
    price: string;
};

type ProductDraftContextValue = {
    draft: ProductDraft | null;
    setDraft: (draft: ProductDraft) => void;
    clearDraft: () => void;
};

const ProductDraftContext = createContext<ProductDraftContextValue | null>(null);

export function useProductDraft() {
    const ctx = useContext(ProductDraftContext);
    if (!ctx) {
        throw new Error("useProductDraft must be used within the add-product section");
    }
    return ctx;
}

export default function AddProductLayout({ children }: { children: ReactNode }) {
    const [draft, setDraftState] = useState<ProductDraft | null>(null);

    return (
        <ProductDraftContext.Provider
            value={{
                draft,
                setDraft: (d) => setDraftState(d),
                clearDraft: () => setDraftState(null),
            }}
        >
            {children}
        </ProductDraftContext.Provider>
    );
}
