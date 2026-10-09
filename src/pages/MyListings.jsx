import { useEffect, useState } from "react";

import {
    getListings,
    deleteListing,
    updateListing,
    getListingInterests,
    updateListingInterest,
    markListingSold,
    uploadListingImages,
     deleteListingImage, // Deletes one existing image
} from "../api/listingApi";

import { getCurrentUser } from "../api/authApi";

function MyListings() {
    const [currentUser, setCurrentUser] = useState(null);
    const [listings, setListings] = useState([]);

    // Controls which tab is currently visible
    const [activeTab, setActiveTab] = useState("listings");

    // Stores interested buyers grouped by listing ID
    const [interests, setInterests] = useState({});

    // Which listing is currently being edited
    const [editingId, setEditingId] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [deleteListingId, setDeleteListingId] = useState(null);

    const [showSoldPopup, setShowSoldPopup] = useState(false);
    const [selectedListingId, setSelectedListingId] = useState(null);
    // New images selected during editing
     
    // Edit form state
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "",
        location: "",
        negotiable: false,
        reason: "",
    });

    // New images selected during editing
    const [newImages, setNewImages] = useState([]);

    // Existing images attached to the listing being edited
    const [existingImages, setExistingImages] = useState([]);

    // Prevent repeated clicks while an image is being deleted
    const [deletingImageId, setDeletingImageId] = useState(null);

    // Loading state
    const [loading, setLoading] = useState(true);

    // Error message
    const [error, setError] = useState("");

    // --------------------------------------------------
    // LOAD CURRENT USER + MY LISTINGS
    // --------------------------------------------------

    useEffect(() => {
        async function loadListings() {
            try {
                setLoading(true);

                // Get all listings
                const data = await getListings(true);

                // Get logged-in user
                const user = await getCurrentUser();

                setCurrentUser(user);

                // Keep only listings created by this user
                const myListings = data.filter(
                    (listing) => listing.seller === user.id
                );

                // Put AVAILABLE listings first and SOLD listings after them
                const sortedListings = [...myListings].sort((a, b) => {
                    if (a.status === "AVAILABLE" && b.status === "SOLD") {
                        return -1;
                    }

                    if (a.status === "SOLD" && b.status === "AVAILABLE") {
                        return 1;
                    }

                    return 0;
                });

                setListings(sortedListings);
            } catch (error) {
                console.error(error);
                setError("Failed to load your listings.");
            } finally {
                setLoading(false);
            }
        }

        loadListings();
    }, []);

    // --------------------------------------------------
    // LOAD INTERESTED BUYERS
    // --------------------------------------------------

    async function loadAllInterests() {
        try {
            const result = {};

            // Load interests for every listing owned by the seller
            for (const listing of listings) {
                 const data = await getListingInterests(listing.id);

                // Newest interest requests first
                const sortedInterests = [...data].sort(
                    (a, b) =>
                        new Date(b.created_at) - new Date(a.created_at)
                );

                result[listing.id] = sortedInterests;
            }

            setInterests(result);
        } catch (error) {
            console.error("Failed to load interests:", error);
        }
    }

    // --------------------------------------------------
    // EDIT LISTING
    // --------------------------------------------------

    function startEditing(listing) {
    setEditingId(listing.id);

    // Keep the existing images available in the edit form
    setExistingImages(listing.images || []);

    setEditForm({
        title: listing.title || "",
        description: listing.description || "",
        price: listing.price || "",
        category: listing.category || "",
        condition: listing.condition || "",
        location: listing.location || "",
        negotiable: listing.negotiable || false,
        reason: listing.reason || "",
    });

    setNewImages([]);
}

    function handleEditChange(event) {
        const { name, value, type, checked } = event.target;

        setEditForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function saveEditedListing(listingId) {
        try {
            // Update normal listing information
            const updatedListing = await updateListing(
                listingId,
                editForm
            );

            // If new images were selected, upload them
            if (newImages.length > 0) {
                await uploadListingImages(listingId, newImages);
            }

            // Update the listing in React state
            setListings((currentListings) =>
                currentListings.map((item) =>
                    item.id === listingId
                        ? {
                              ...item,
                              ...updatedListing,
                          }
                        : item
                )
            );

             setEditingId(null);
            setNewImages([]);
            setExistingImages([]); // Clear existing image state after saving

             
        } catch (error) {
            console.error(
                "Failed to update listing:",
                error.response?.data || error
            );

            alert("Failed to update listing.");
        }
    }
    async function handleDeleteImage(imageId) {
    try {
        setDeletingImageId(imageId);

        // Delete the image through the Django API
        await deleteListingImage(imageId);

        // Remove it from the edit form after success
        setExistingImages((currentImages) =>
            currentImages.filter((image) => image.id !== imageId)
        );

        // Also update the listing card's image data
        setListings((currentListings) =>
            currentListings.map((listing) => ({
                ...listing,
                images:
                    listing.id === editingId
                        ? (listing.images || []).filter(
                              (image) => image.id !== imageId
                          )
                        : listing.images,
            }))
        );
    } catch (error) {
        console.error(
            "Failed to delete image:",
            error.response?.data || error
        );

        alert("Failed to delete image. Please try again.");
    } finally {
        setDeletingImageId(null);
    }
}
    // --------------------------------------------------
    // DELETE LISTING
    // --------------------------------------------------

async function handleDelete() {
    try {
        await deleteListing(deleteListingId);

        // Remove the deleted listing from the UI
        setListings((currentListings) =>
            currentListings.filter(
                (listing) => listing.id !== deleteListingId
            )
        );

        // Remove its interests from state
        setInterests((current) => {
            const updated = { ...current };
            delete updated[deleteListingId];
            return updated;
        });

        // Close popup
        setShowDeletePopup(false);
        setDeleteListingId(null);

    } catch (error) {
        console.error(
            "Failed to delete listing:",
            error.response?.data || error
        );

        alert("Failed to delete listing.");
    }
}

    // --------------------------------------------------
    // MARK LISTING SOLD
    // --------------------------------------------------

    async function handleMarkSold() {
    try {
        const result = await markListingSold(selectedListingId);

        setListings((currentListings) =>
            currentListings.map((item) =>
                item.id === selectedListingId
                    ? {
                          ...item,
                          status: result.status,
                      }
                    : item
            )
        );

        // Close the popup after successfully marking as sold
        setShowSoldPopup(false);
        setSelectedListingId(null);

    } catch (error) {
        console.error(
            "Failed to mark listing as sold:",
            error.response?.data || error
        );

        alert("Failed to mark listing as sold.");
    }
}

    // --------------------------------------------------
    // ACCEPT / REJECT INTEREST
    // --------------------------------------------------

    async function handleInterestStatus(
        listingId,
        interestId,
        status
    ) {
        try {
            const result = await updateListingInterest(
                interestId,
                status
            );

            // Update only that buyer's interest
            setInterests((current) => ({
                ...current,
                [listingId]: current[listingId].map((interest) =>
                    interest.id === interestId
                        ? {
                              ...interest,
                              status: result.status,
                          }
                        : interest
                ),
            }));
        } catch (error) {
            console.error(
                "Failed to update interest:",
                error.response?.data || error
            );

            alert("Failed to update buyer interest.");
        }
    }

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 px-6 py-12">
                <div className="mx-auto max-w-6xl">
                    <p className="text-zinc-400">
                        Loading your listings...
                    </p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 px-6 py-12">
                <div className="mx-auto max-w-6xl rounded-2xl border border-red-900 bg-zinc-900 p-6">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // PAGE
    // --------------------------------------------------

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* ================= HEADER ================= */}

                <div className="mb-8">
                    <p className="text-sm font-medium text-orange-500">
                        SELLER DASHBOARD
                    </p>

                    <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
                        My Listings
                    </h1>

                    <p className="mt-2 text-zinc-400">
                        Manage your products and respond to buyer
                        requests.
                    </p>
                </div>

                {/* ================= TABS ================= */}

                <div className="mb-8 flex overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">

                    <button
                        onClick={() => setActiveTab("listings")}
                        className={`flex-1 px-5 py-4 text-sm font-semibold transition ${
                            activeTab === "listings"
                                ? "bg-orange-500 text-white"
                                : "text-zinc-400 hover:text-white"
                        }`}
                    >
                        📦 My Listings
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab("buyers");
                            loadAllInterests();
                        }}
                        className={`flex-1 px-5 py-4 text-sm font-semibold transition ${
                            activeTab === "buyers"
                                ? "bg-orange-500 text-white"
                                : "text-zinc-400 hover:text-white"
                        }`}
                    >
                        👥 Interested Buyers
                    </button>
                </div>

                {/* ================================================= */}
                {/* TAB 1 — MY LISTINGS */}
                {/* ================================================= */}

                {activeTab === "listings" && (
                    <div>

                        {listings.length === 0 ? (
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
                                <p className="text-4xl">📦</p>

                                <h2 className="mt-4 text-xl font-semibold text-white">
                                    No listings yet
                                </h2>

                                <p className="mt-2 text-zinc-400">
                                    Your products will appear here
                                    once you list something.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 lg:grid-cols-2">

                                {listings.map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                                    >

                                        {/* PRODUCT IMAGE */}

                                        {listing.images?.length > 0 ? (
                                            <img
                                                src={
                                                    listing.images[0].image
                                                }
                                                alt={listing.title}
                                                className="h-56 w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-56 items-center justify-center bg-zinc-800 text-zinc-500">
                                                No image
                                            </div>
                                        )}

                                        <div className="p-5">

                                            {/* TITLE + STATUS */}

                                            <div className="flex items-start justify-between gap-4">

                                                <div>
                                                    <h2 className="text-xl font-bold text-white">
                                                        {listing.title}
                                                    </h2>

                                                    <p className="mt-1 text-xl font-bold text-orange-500">
                                                        ₹{listing.price}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        listing.status ===
                                                        "SOLD"
                                                            ? "bg-red-500/10 text-red-400"
                                                            : "bg-green-500/10 text-green-400"
                                                    }`}
                                                >
                                                    {listing.status ===
                                                    "SOLD"
                                                        ? "🔴 SOLD"
                                                        : "🟢 AVAILABLE"}
                                                </span>
                                            </div>

                                            {/* DETAILS */}

                                            <div className="mt-4 flex flex-wrap gap-2 text-xs">

                                                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                                                    {listing.category_name}
                                                </span>

                                                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                                                    {listing.condition}
                                                </span>

                                                <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                                                    📍 {listing.location}
                                                </span>

                                            </div>

                                            {/* ACTIONS */}

                                            <div className="mt-5 grid grid-cols-2 gap-2">

                                                {listing.status === "AVAILABLE" && (
                                                    <button
                                                        onClick={() => startEditing(listing)}
                                                        className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-white transition hover:border-orange-500 hover:text-orange-400"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                )}                                                       

                                                <button
                                                            onClick={() => {
                                                                setDeleteListingId(listing.id);
                                                                setShowDeletePopup(true);
                                                            }}
                                                            className={`rounded-lg border border-red-900/50 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 ${
                                                                listing.status === "SOLD" ? "col-span-2" : ""
                                                            }`}
                                                        >
                                                            🗑 Delete
                                                        </button>

                                                {listing.status ===
                                                    "AVAILABLE" && (
                                                    <button
                                                         onClick={() => {
                                                            setSelectedListingId(listing.id);
                                                            setShowSoldPopup(true);
                                                        }}
                                                        className="col-span-2 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
                                                    >
                                                        ✓ Mark as Sold
                                                    </button>
                                                )}
                                            </div>

                                            {/* ================= EDIT FORM ================= */}

                                            {editingId ===
                                                listing.id && (
                                                <div className="mt-6 rounded-xl border border-orange-500/30 bg-zinc-950 p-5">

                                                    <h3 className="text-lg font-semibold text-white">
                                                        Edit Listing
                                                    </h3>

                                                    <div className="mt-5 space-y-4">

                                                        {/* TITLE */}

                                                        <div>
                                                            <label className="mb-1 block text-sm text-zinc-400">
                                                                Title
                                                            </label>

                                                            <input
                                                                name="title"
                                                                value={
                                                                    editForm.title
                                                                }
                                                                onChange={
                                                                    handleEditChange
                                                                }
                                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                                                            />
                                                        </div>

                                                        {/* DESCRIPTION */}

                                                        <div>
                                                            <label className="mb-1 block text-sm text-zinc-400">
                                                                Description
                                                            </label>

                                                            <textarea
                                                                name="description"
                                                                value={
                                                                    editForm.description
                                                                }
                                                                onChange={
                                                                    handleEditChange
                                                                }
                                                                rows="4"
                                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                                                            />
                                                        </div>

                                                        {/* PRICE */}

                                                        <div>
                                                            <label className="mb-1 block text-sm text-zinc-400">
                                                                Price
                                                            </label>

                                                            <input
                                                                name="price"
                                                                type="number"
                                                                value={
                                                                    editForm.price
                                                                }
                                                                onChange={
                                                                    handleEditChange
                                                                }
                                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                                                            />
                                                        </div>

                                                        {/* CATEGORY */}

                                                        <div>
                                                            <label className="mb-1 block text-sm text-zinc-400">
                                                                Category
                                                            </label>

                                                            <select
                                                                name="category"
                                                                value={
                                                                    editForm.category
                                                                }
                                                                onChange={
                                                                    handleEditChange
                                                                }
                                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                                                            >
                                                                <option value="">
                                                                    Select category
                                                                </option>
                                                                <option value="1">
                                                                    Electronics
                                                                </option>
                                                                <option value="2">
                                                                    Books
                                                                </option>
                                                                <option value="3">
                                                                    Study Materials
                                                                </option>
                                                                <option value="4">
                                                                    Project Materials
                                                                </option>
                                                                <option value="5">
                                                                    College Essentials
                                                                </option>
                                                                <option value="6">
                                                                    Others
                                                                </option>
                                                            </select>
                                                        </div>

                                                        {/* CONDITION */}

                                                        <div>
                                                            <label className="mb-1 block text-sm text-zinc-400">
                                                                Condition
                                                            </label>

                                                            <select
                                                                name="condition"
                                                                value={
                                                                    editForm.condition
                                                                }
                                                                onChange={
                                                                    handleEditChange
                                                                }
                                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                                                            >
                                                                <option value="">
                                                                    Select condition
                                                                </option>
                                                                <option value="Like New">
                                                                    Like New
                                                                </option>
                                                                <option value="Good">
                                                                    Good
                                                                </option>
                                                                <option value="Fair">
                                                                    Fair
                                                                </option>
                                                                <option value="Used">
                                                                    Used
                                                                </option>
                                                            </select>
                                                        </div>

                                                        {/* LOCATION */}

                                                        <div>
                                                            <label className="mb-1 block text-sm text-zinc-400">
                                                                Location
                                                            </label>

                                                            <input
                                                                name="location"
                                                                value={
                                                                    editForm.location
                                                                }
                                                                onChange={
                                                                    handleEditChange
                                                                }
                                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                                                            />
                                                        </div>

                                                        {/* NEGOTIABLE */}

                                                        <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
                                                            <input
                                                                name="negotiable"
                                                                type="checkbox"
                                                                checked={
                                                                    editForm.negotiable
                                                                }
                                                                onChange={
                                                                    handleEditChange
                                                                }
                                                                className="h-4 w-4 accent-orange-500"
                                                            />

                                                            Price is negotiable
                                                        </label>

                                                        {/* REASON */}

                                                        <div>
                                                            <label className="mb-1 block text-sm text-zinc-400">
                                                                Reason for selling
                                                            </label>

                                                            <textarea
                                                                name="reason"
                                                                value={
                                                                    editForm.reason
                                                                }
                                                                onChange={
                                                                    handleEditChange
                                                                }
                                                                rows="3"
                                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500"
                                                            />
                                                        </div>
                                                        
{/* EXISTING IMAGES */}
<div>
    <label className="mb-2 block text-sm text-zinc-400">
        Current images
    </label>

    {existingImages.length === 0 ? (
        <p className="text-sm text-zinc-500">
            No existing images.
        </p>
    ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {existingImages.map((image) => (
                <div
                    key={image.id}
                    className="overflow-hidden rounded-lg border border-zinc-800"
                >
                    <img
                        src={image.image}
                        alt="Listing"
                        className="h-28 w-full object-cover"
                    />

                    <button
                        type="button"
                        disabled={deletingImageId === image.id}
                        onClick={() => handleDeleteImage(image.id)}
                        className="w-full bg-red-600 px-2 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {deletingImageId === image.id
                            ? "Removing..."
                            : "Remove image"}
                    </button>
                </div>
            ))}
        </div>
    )}
</div>


                                                        {/* NEW IMAGES */}

                                                        <div>
                                                            <label className="mb-1 block text-sm text-zinc-400">
                                                                Add new images
                                                            </label>

                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                multiple
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    setNewImages(
                                                                        Array.from(
                                                                            event
                                                                                .target
                                                                                .files
                                                                        )
                                                                    )
                                                                }
                                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-400"
                                                            />

                                                            {newImages.length >
                                                                0 && (
                                                                <p className="mt-2 text-sm text-orange-400">
                                                                    {
                                                                        newImages.length
                                                                    }{" "}
                                                                    new image(s)
                                                                    selected
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* EDIT ACTIONS */}

                                                        <div className="flex gap-3 pt-2">

                                                            <button
                                                                onClick={() =>
                                                                    saveEditedListing(
                                                                        listing.id
                                                                    )
                                                                }
                                                                className="flex-1 rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
                                                            >
                                                                💾 Save Changes
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setEditingId(
                                                                        null
                                                                    );
                                                                    setNewImages(
                                                                        []
                                                                    );
                                                                     
                                                                     setExistingImages([]);
                                                                }}
                                                                className="rounded-lg border border-zinc-700 px-5 py-3 font-medium text-zinc-300 transition hover:bg-zinc-800"
                                                            >
                                                                Cancel
                                                            </button>

                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ================================================= */}
                {/* TAB 2 — INTERESTED BUYERS */}
                {/* ================================================= */}
{activeTab === "buyers" && (
    <div className="space-y-6">

        {(() => {
            // Only keep listings that have at least one interested buyer
            const listingsWithInterests = listings.filter(
                (listing) =>
                    interests[listing.id] &&
                    interests[listing.id].length > 0
            );

            // If no buyer has shown interest in any listing
            if (listingsWithInterests.length === 0) {
                return (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
                        <p className="text-4xl">👥</p>

                        <h2 className="mt-4 text-xl font-semibold text-white">
                            No Interested Buyers
                        </h2>

                        <p className="mt-2 text-zinc-400">
                            No buyers have shown interest in your listings yet.
                        </p>
                    </div>
                );
            }

            // Show ONLY listings that have interested buyers
            return listingsWithInterests.map((listing) => {
                const listingInterests = interests[listing.id];

                return (
                    <div
                        key={listing.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                    >

                        {/* Product Header */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-orange-500">
                                    Product
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-white">
                                    {listing.title}
                                </h2>

                                <p className="mt-1 text-orange-500">
                                    ₹{listing.price}
                                </p>
                            </div>

                            <span
                                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                    listing.status === "SOLD"
                                        ? "bg-red-500/10 text-red-400"
                                        : "bg-green-500/10 text-green-400"
                                }`}
                            >
                                {listing.status === "SOLD"
                                    ? "🔴 SOLD"
                                    : "🟢 AVAILABLE"}
                            </span>
                        </div>

                        {/* Interested Buyers */}
                        <div className="mt-6 space-y-3">

                            {listingInterests.map((interest) => (
                                <div
                                    key={interest.id}
                                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                                >

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                        {/* Buyer Information */}
                                        <div>
                                            <p className="font-semibold text-white">
                                                👤 {interest.name}
                                            </p>

                                            <p className="mt-1 text-sm text-zinc-500">
                                                Admission:{" "}
                                                {interest.admission_number}
                                            </p>
                                        </div>

                                        {/* Interest Status */}
                                        <span
                                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                                interest.status ===
                                                "ACCEPTED"
                                                    ? "bg-green-500/10 text-green-400"
                                                    : interest.status ===
                                                      "REJECTED"
                                                    ? "bg-red-500/10 text-red-400"
                                                    : "bg-yellow-500/10 text-yellow-400"
                                            }`}
                                        >
                                            {interest.status === "ACCEPTED"
                                                ? "✓ ACCEPTED"
                                                : interest.status === "REJECTED"
                                                ? "✕ REJECTED"
                                                : "🟡 PENDING"}
                                        </span>
                                    </div>

                                    {/* Accept / Reject buttons */}
                                    {interest.status === "PENDING" && (
                                        <div className="mt-4 flex gap-2">

                                            <button
                                                onClick={() =>
                                                    handleInterestStatus(
                                                        listing.id,
                                                        interest.id,
                                                        "ACCEPTED"
                                                    )
                                                }
                                                className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                                            >
                                                ✓ Accept
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleInterestStatus(
                                                        listing.id,
                                                        interest.id,
                                                        "REJECTED"
                                                    )
                                                }
                                                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                                            >
                                                ✕ Reject
                                            </button>

                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            });
        })()}

    </div>
)}
            </div>
            {/* ================= SOLD CONFIRMATION POPUP ================= */}

{showSoldPopup && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

        {/* Popup box */}
        <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">

            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10 text-2xl">
                ⚠️
            </div>

            {/* Title */}
            <h2 className="mt-4 text-center text-xl font-bold text-white">
                Mark item as sold?
            </h2>

            {/* Message */}
            <p className="mt-3 text-center text-sm leading-6 text-zinc-400">
                Are you sure you want to mark this item as sold?
                <br />
                Once sold, you will not be able to edit its details.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">

                {/* Cancel */}
                <button
                    onClick={() => {
                        setShowSoldPopup(false);
                        setSelectedListingId(null);
                    }}
                    className="flex-1 rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
                >
                    Cancel
                </button>

                {/* Confirm */}
                <button
                    onClick={handleMarkSold}
                    className="flex-1 rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                    Yes, Mark as Sold
                </button>

            </div>
        </div>
    </div>
)}
{/* ================= DELETE CONFIRMATION POPUP ================= */}

{showDeletePopup && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

        {/* Popup box */}
        <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">

            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
                🗑️
            </div>

            {/* Title */}
            <h2 className="mt-4 text-center text-xl font-bold text-white">
                Delete listing?
            </h2>

            {/* Message */}
            <p className="mt-3 text-center text-sm leading-6 text-zinc-400">
                Are you sure you want to delete this listing?
                <br />
                This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">

                {/* Cancel */}
                <button
                    onClick={() => {
                        setShowDeletePopup(false);
                        setDeleteListingId(null);
                    }}
                    className="flex-1 rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
                >
                    Cancel
                </button>

                {/* Confirm */}
                <button
                    onClick={handleDelete}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                    Yes, Delete
                </button>

            </div>
        </div>
    </div>
)}
        </div>
    );
}

export default MyListings;