import { useState } from "react";
import {
  createListing,
  uploadListingImages,
} from "../api/listingApi";
import { useNavigate } from "react-router-dom";

function SellItem() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");

  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");

  const [negotiable, setNegotiable] = useState(false);
  const [reason, setReason] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Create the listing and upload its selected images.
  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);

      const listingData = {
        title: title.trim(),
        description: description.trim(),
        price,
        category: Number(category),
        condition,
        location: location.trim(),
        negotiable,
        reason: reason.trim(),
      };

      // First create the listing in Django.
      const result = await createListing(listingData);

      // Upload images after the listing is created.
      if (images.length > 0) {
        await uploadListingImages(result.id, images);
      }

      // Return to the marketplace after successful submission.
      navigate("/");
    } catch (error) {
      console.error("STATUS:", error.response?.status);
      console.error("BACKEND ERROR:", error.response?.data);

      alert(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Failed to create listing. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Shared styling for text inputs and dropdowns.
  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-[#1c1c1c] px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

  // Shared styling for field labels.
  const labelClass =
    "mb-2 block text-sm font-medium text-zinc-300";

  return (
    <div className="min-h-screen bg-[#111111] px-4 py-8 text-white sm:px-8 sm:py-10">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl"
      >
        {/* Page heading */}
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Sell an Item
        </h1>

        <p className="mt-2 text-zinc-400">
          List your item and connect with students on your campus.
        </p>

        {/* Product title */}
        <div className="mt-8">
          <label className={labelClass}>
            Product Title
          </label>

          <input
            type="text"
            placeholder="Add item name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {/* Product description */}
        <div className="mt-6">
          <label className={labelClass}>
            Description
          </label>

          <textarea
            rows="5"
            placeholder="Describe the condition, usage, features, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass} resize-none`}
            required
          />
        </div>

        {/* Price */}
        <div className="mt-6">
          <label className={labelClass}>
            Price (₹)
          </label>

          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {/* Category */}
        <div className="mt-6">
          <label className={labelClass}>
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
            required
          >
            <option value="" className="bg-[#1c1c1c]">
              Select a category
            </option>
            <option value="1" className="bg-[#1c1c1c]">
              Electronics
            </option>
            <option value="2" className="bg-[#1c1c1c]">
              Books
            </option>
            <option value="3" className="bg-[#1c1c1c]">
              Study Materials
            </option>
            <option value="4" className="bg-[#1c1c1c]">
              Project Materials
            </option>
            <option value="5" className="bg-[#1c1c1c]">
              College Essentials
            </option>
            <option value="6" className="bg-[#1c1c1c]">
              Others
            </option>
          </select>
        </div>

        {/* Item condition */}
        <div className="mt-6">
          <label className={labelClass}>
            Condition
          </label>

          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className={inputClass}
            required
          >
            <option value="" className="bg-[#1c1c1c]">
              Select condition
            </option>
            <option value="Like New" className="bg-[#1c1c1c]">
              Like New
            </option>
            <option value="Good" className="bg-[#1c1c1c]">
              Good
            </option>
            <option value="Fair" className="bg-[#1c1c1c]">
              Fair
            </option>
            <option value="Used" className="bg-[#1c1c1c]">
              Used
            </option>
          </select>
        </div>

        {/* Campus location */}
        <div className="mt-6">
          <label className={labelClass}>
            Location
          </label>

          <input
            type="text"
            placeholder="e.g. Department, Hostel, Classroom"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {/* Negotiable price option */}
        <div className="mt-6">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={negotiable}
              onChange={(e) => setNegotiable(e.target.checked)}
              className="h-5 w-5 accent-orange-500"
            />

            <span className="font-medium text-zinc-300">
              Price is negotiable
            </span>
          </label>
        </div>

        {/* Product image upload */}
        <div className="mt-6">
          <label className={labelClass}>
            Product Images
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className={`${inputClass} file:mr-4 file:rounded-md file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:font-medium file:text-white hover:file:bg-orange-600`}
          />

          <p className="mt-2 text-sm text-zinc-500">
            You can select multiple images.
          </p>

          {/* Display selected image filenames */}
          {images.length > 0 && (
            <ul className="mt-3 space-y-2">
              {images.map((image, index) => (
                <li
                  key={`${image.name}-${index}`}
                  className="rounded-lg border border-zinc-800 bg-[#1c1c1c] px-3 py-2 text-sm text-zinc-300"
                >
                  {image.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reason for selling */}
        <div className="mt-6">
          <label className={labelClass}>
            Reason for Selling
          </label>

          <textarea
            rows="3"
            placeholder="e.g. No longer needed, upgrading to a new one..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Submit button */}
        <div className="mt-8 pb-8">
          <button
            type="submit"
            disabled={submitting}
            className="w-full cursor-pointer rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Publishing..." : "List Item"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SellItem;
