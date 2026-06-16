"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

export type MediaItem = {
    id: string;
    file: File;
    preview: string;
    type: "image" | "video";
    status: "uploading" | "done" | "error";
    url?: string;
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

type ContextType = {
    draft: ProductDraft | null;
    setDraft: Dispatch<SetStateAction<ProductDraft | null>>;
};

const ProductDraftContext = createContext<ContextType | null>(null);

export function useProductDraft() {
    const ctx = useContext(ProductDraftContext);
    if (!ctx) {
        throw new Error("useProductDraft must be used inside add-product layout");
    }
    return ctx;
}

export default function AddProductLayout({ children }: { children: ReactNode }) {
    const [draft, setDraft] = useState<ProductDraft | null>(null);

    return (
        <ProductDraftContext.Provider value={{ draft, setDraft }}>
            {children}
        </ProductDraftContext.Provider>
    );
}