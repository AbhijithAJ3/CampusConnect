import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    getListing,
    toggleSavedListing,
    createListingInterest,
    getSellerContact,
    getListingInterest,
    getMyListingInterest,
} from "../api/listingApi";

import { Heart } from "lucide-react";
function ProductDetails() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [error, setError] = useState("");

    const [saved, setSaved] = useState(false);
    const [interested, setInterested] = useState(false);
    const [interestId, setInterestId] = useState(null);
    const [interestStatus, setInterestStatus] = useState(null);

    const [sellerContact, setSellerContact] = useState(null);

    // Load the selected product from the backend
    useEffect(() => {
        async function loadProduct() {
            try {
                const data = await getListing(id);

                setProduct(data);
                setSaved(data.saved);

                // Check whether the current buyer has already
                // shown interest in this listing
                try {
                    const interest = await getMyListingInterest(id);

                    if (interest.interested) {
                        setInterested(true);
                        setInterestId(interest.interest_id);
                        setInterestStatus(interest.status);
                    }
                } catch (error) {
                    console.error(
                        "Failed to load interest status:",
                        error.response?.data || error
                    );
                }
            } catch (error) {
                console.error(error);
                setError("Failed to load this listing.");
            }
        }

        loadProduct();
    }, [id]);

    // Check the latest status of the buyer's interest
    async function checkInterestStatus() {
        try {
            const data = await getListingInterest(interestId);
            setInterestStatus(data.status);
        } catch (error) {
            console.error(
                "Failed to check interest status:",
                error.response?.data || error
            );
        }
    }

    // Save / unsave listing
    async function handleSave() {
        try {
            const result = await toggleSavedListing(product.id);
            setSaved(result.saved);
        } catch (error) {
            console.error("Failed to save listing:", error);
        }
    }

    // Send interest to seller
    async function handleInterest() {
        try {
            const result = await createListingInterest(product.id);

            if (result.status === "PENDING") {
                setInterested(true);
                setInterestId(result.interest_id);
                setInterestStatus(result.status);
            }
        } catch (error) {
            console.error(
                "Failed to send interest:",
                error.response?.data || error
            );
        }
    }

    // Get seller contact after interest is accepted
    async function handleContactSeller() {
        try {
            const data = await getSellerContact(interestId);
            setSellerContact(data);
        } catch (error) {
            console.error(
                "Failed to get seller contact:",
                error.response?.data || error
            );
        }
    }

    // Open WhatsApp with a pre-filled message
    function handleWhatsApp() {
        const phone = sellerContact.seller_phone.replace(/\D/g, "");

        const message = encodeURIComponent(
            `Hi ${sellerContact.seller_name}, I'm interested in your listing "${product.title}".`
        );

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;

        window.open(whatsappUrl, "_blank");
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 px-6 py-12">
                <div className="mx-auto max-w-4xl rounded-2xl border border-red-900 bg-zinc-900 p-8">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950">
                <p className="text-zinc-400">Loading listing...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* Page layout */}
                <div className="grid gap-8 lg:grid-cols-2">

                    {/* ================= IMAGE SECTION ================= */}
                    <div>
                        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                            {product.images && product.images.length > 0 ? (
                                <div className="grid gap-3 p-3 sm:grid-cols-2">
                                    {product.images.map((image) => (
                                        <img
                                            key={image.id}
                                            src={image.image}
                                            alt={product.title}
                                            className="h-72 w-full rounded-xl object-cover transition duration-300 hover:scale-[1.02]"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-96 items-center justify-center text-zinc-500">
                                    No images available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ================= PRODUCT INFO ================= */}
                    <div className="flex flex-col">

                        {/* Category */}
                        <div className="mb-3">
                            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-400">
                                {product.category_name}
                            </span>
                        </div>

                         {/* Title + Save Button */}
                            <div className="flex items-start justify-between gap-4">

                                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    {product.title}
                                </h1>

                                {/* Save listing */}
                                <button
                                    onClick={handleSave}
                                    title={saved ? "Remove from saved" : "Save listing"}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition hover:border-orange-500 hover:text-orange-400"
                                >
                                    <Heart
                                        size={24}
                                        strokeWidth={2}
                                        className={
                                            saved
                                                ? "fill-red-500 text-red-500"
                                                : "text-zinc-300"
                                        }
                                    />
                                </button>

                            </div>

                        {/* Price */}
                        <div className="mt-4 flex items-center gap-3">
                            <p className="text-3xl font-bold text-orange-500">
                                ₹{product.price}
                            </p>

                            {product.negotiable && (
                                <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400">
                                    Negotiable
                                </span>
                            )}
                        </div>

                        {/* Quick details */}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                                <p className="text-xs uppercase tracking-wide text-zinc-500">
                                    Condition
                                </p>
                                <p className="mt-1 font-medium text-white">
                                    {product.condition}
                                </p>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                                <p className="text-xs uppercase tracking-wide text-zinc-500">
                                    Location
                                </p>
                                <p className="mt-1 font-medium text-white">
                                    {product.location}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-8 border-t border-zinc-800 pt-6">
                            <h2 className="text-lg font-semibold text-white">
                                Description
                            </h2>

                            <p className="mt-3 leading-7 text-zinc-400">
                                {product.description}
                            </p>
                        </div>

                        {/* Reason */}
                        {product.reason && (
                            <div className="mt-6">
                                <h2 className="text-lg font-semibold text-white">
                                    Reason for selling
                                </h2>

                                <p className="mt-2 text-zinc-400">
                                    {product.reason}
                                </p>
                            </div>
                        )}

                        {/* ================= ACTIONS ================= */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                           

                            {/* Interest */}
                            <button
                                onClick={handleInterest}
                                disabled={interested}
                                className="flex-1 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {interested
                                    ? "✓ Interest Sent"
                                    : "🤝 I'm Interested"}
                            </button>
                        </div>

                        {/* ================= INTEREST STATUS ================= */}
                        {interested && (
                            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

                                <h2 className="font-semibold text-white">
                                    Interest Status
                                </h2>

                                {/* Pending */}
                                {interestStatus === "PENDING" && (
                                    <div className="mt-4">
                                        <div className="flex items-center gap-3">
                                            <span className="h-3 w-3 rounded-full bg-yellow-400" />

                                            <p className="text-yellow-400">
                                                Waiting for seller response
                                            </p>
                                        </div>

                                        <button
                                            onClick={checkInterestStatus}
                                            className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
                                        >
                                            🔄 Check Status
                                        </button>
                                    </div>
                                )}

                                {/* Accepted */}
                                {interestStatus === "ACCEPTED" && (
                                    <div className="mt-4">
                                        <p className="font-medium text-green-400">
                                            ✓ Seller accepted your interest!
                                        </p>

                                        <button
                                            onClick={handleContactSeller}
                                            className="mt-4 rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white transition hover:bg-orange-600"
                                        >
                                            📞 Contact Seller
                                        </button>
                                    </div>
                                )}

                                {/* Rejected */}
                                {interestStatus === "REJECTED" && (
                                    <p className="mt-4 font-medium text-red-400">
                                        ✕ Seller rejected your interest.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ================= SELLER CONTACT ================= */}
                        {sellerContact && (
                            <div className="mt-6 rounded-2xl border border-green-900/50 bg-green-950/20 p-5">

                                <h2 className="text-lg font-semibold text-white">
                                    Seller Contact
                                </h2>

                                <div className="mt-4 space-y-3 text-sm">
                                    <p className="text-zinc-300">
                                        <span className="text-zinc-500">
                                            Name:
                                        </span>{" "}
                                        {sellerContact.seller_name}
                                    </p>

                                    <p className="text-zinc-300">
                                        <span className="text-zinc-500">
                                            Admission Number:
                                        </span>{" "}
                                        {sellerContact.seller_admission_number}
                                    </p>

                                    <p className="text-zinc-300">
                                        <span className="text-zinc-500">
                                            Phone:
                                        </span>{" "}
                                        {sellerContact.seller_phone}
                                    </p>
                                </div>

                                <button
                                    onClick={handleWhatsApp}
                                    className="mt-5 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                                >
                                    💬 Open WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;