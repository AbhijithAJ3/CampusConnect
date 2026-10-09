import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getSavedListings,
    toggleSavedListing,
} from "../api/listingApi";

function SavedItems() {
    const [savedItems, setSavedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Load all saved listings when the page opens
    useEffect(() => {
        async function loadSavedItems() {
            try {
                const data = await getSavedListings();

                setSavedItems(data);
            } catch (error) {
                console.error(
                    "Failed to load saved items:",
                    error.response?.data || error
                );

                setError("Failed to load saved items.");
            } finally {
                setLoading(false);
            }
        }

        loadSavedItems();
    }, []);

    // Remove a listing from Saved Items
    async function handleRemoveSaved(listingId) {
        try {
            // toggleSavedListing removes the saved record
            await toggleSavedListing(listingId);

            // Remove the card immediately from the UI
            setSavedItems((currentItems) =>
                currentItems.filter(
                    (item) => item.id !== listingId
                )
            );
        } catch (error) {
            console.error(
                "Failed to remove saved item:",
                error.response?.data || error
            );
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 px-6 py-12">
                <div className="mx-auto max-w-6xl">
                    <p className="text-zinc-400">
                        Loading saved items...
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 px-6 py-12">
                <div className="mx-auto max-w-6xl rounded-2xl border border-red-900 bg-zinc-900 p-6">
                    <p className="text-red-400">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* ================= HEADER ================= */}

                <div className="mb-8">
                    <p className="text-sm font-medium text-orange-500">
                        MARKETPLACE
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
                        Saved Items
                    </h1>

                    <p className="mt-2 text-zinc-400">
                        Items you've saved for later.
                    </p>
                </div>

                {/* ================= EMPTY STATE ================= */}

                {savedItems.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

                        <p className="text-5xl">
                            ♡
                        </p>

                        <h2 className="mt-4 text-xl font-semibold text-white">
                            No saved items
                        </h2>

                        <p className="mt-2 text-zinc-400">
                            Listings you save will appear here.
                        </p>

                    </div>
                ) : (

                    /* ================= SAVED ITEMS ================= */

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {savedItems.map((item) => (

                            <div
                                key={item.id}
                                onClick={() => navigate(`/product/${item.id}`)}
                                className="cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition duration-200 hover:border-orange-500/50"
                            >

                                {/* ================= PRODUCT IMAGE ================= */}

                                {item.images?.length > 0 ? (
                                    <img
                                        src={item.images[0].image}
                                        alt={item.title}
                                        className="h-52 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-52 items-center justify-center bg-zinc-800 text-zinc-500">
                                        No image
                                    </div>
                                )}

                                {/* ================= PRODUCT INFO ================= */}

                                <div className="p-5">

                                    {/* Title + Price + Status */}

                                    <div className="flex items-start justify-between gap-3">

                                        <div>
                                            <h2 className="font-bold text-white">
                                                {item.title}
                                            </h2>

                                            <p className="mt-1 text-xl font-bold text-orange-500">
                                                ₹{item.price}
                                            </p>
                                        </div>

                                        {/* Status */}

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                item.status === "SOLD"
                                                    ? "bg-red-500/10 text-red-400"
                                                    : "bg-green-500/10 text-green-400"
                                            }`}
                                        >
                                            {item.status === "SOLD"
                                                ? "🔴 SOLD"
                                                : "🟢 AVAILABLE"}
                                        </span>

                                    </div>

                                    {/* ================= DETAILS ================= */}

                                    <div className="mt-4 flex flex-wrap gap-2 text-xs">

                                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                                            {item.category_name}
                                        </span>

                                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                                            {item.condition}
                                        </span>

                                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                                            📍 {item.location}
                                        </span>

                                    </div>

                                    {/* ================= REMOVE BUTTON ================= */}

                                    <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleRemoveSaved(item.id);
                                            }}
                                        className="mt-5 w-full rounded-lg border border-red-900/50 px-4 py-2.5 text-sm font-medium text-red-400 transition duration-200 hover:bg-red-500/10"
                                    >
                                        ♡ Remove from Saved
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}

export default SavedItems;