import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { getListings } from "../api/listingApi"; 
function Home(){
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [condition, setCondition] = useState("All");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showFilters, setShowFilters] = useState(false);
        // Get listings when the Home page loads
    useEffect(() => {
    async function loadListings() {
        try {
            setLoading(true);

            // Get listings from Django
            const data = await getListings();
            setProducts(data);
        } catch (error) {
            // Something went wrong while contacting Django
            console.error(error);
            setError("Failed to load listings.");
        } finally {
            // Runs whether the request succeeds or fails
            setLoading(false);
        }
    }

    loadListings();
}, []);
if (loading) {
    return <p className="p-6">Loading listings...</p>;
}

if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
}

const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    // Search through title, description, and category
    const matchesSearch =
        product.title.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText) ||
        product.category_name.toLowerCase().includes(searchText);

    // Apply category filter
    const matchesCategory =
        category === "All" || product.category_name === category;

    const matchesCondition =
         condition === "All" || product.condition === condition;

    return matchesSearch && matchesCategory && matchesCondition;
});
    
return (
  <div className="min-h-screen bg-[#111111] px-4 py-8 text-white sm:px-8">
    <div className="mx-auto max-w-6xl">

      {/* Page heading */}
      <h1 className="text-3xl font-bold text-white sm:text-4xl">
        CampusConnect Marketplace
      </h1>

      <p className="mt-2 text-zinc-400">
        Buy and sell products within your campus.
      </p>

      {/* Search bar and Filter button */}
      <div className="relative mt-6 flex max-w-2xl gap-3">

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-[#1c1c1c] px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-4 py-3 font-medium text-white transition hover:bg-orange-600"
        >
          {/* Filter icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16M7 12h10m-7 5h4" />
          </svg>
          Filter
        </button>

        {/* Compact filter dropdown */}
        {showFilters && (
          <div className="absolute right-0 top-full z-20 mt-2 w-full max-w-sm rounded-xl border border-zinc-700 bg-[#1c1c1c] p-5 shadow-2xl">

            {/* Category filter */}
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Category
            </label>

            <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mb-5 w-full rounded-lg border border-zinc-700 bg-[#111111] px-3 py-2.5 text-white outline-none focus:border-orange-500"
                    >
                    <option value="All">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="Study Materials">Study Materials</option>
                    <option value="Project Materials">Project Materials</option>
                    <option value="College Essentials">College Essentials</option>
                    <option value="Others">Others</option>
            </select>

            {/* Condition filter */}
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Condition
            </label>

            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-[#111111] px-3 py-2.5 text-white outline-none focus:border-orange-500"
            >
              <option value="All">All Conditions</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Used">Used</option>
            </select>

            {/* Reset and close buttons */}
            <div className="mt-5 flex justify-between gap-3">
              <button
                onClick={() => {
                  setCategory("All");
                  setCondition("All");
                }}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
              >
                Clear filters
              </button>

              <button
                onClick={() => setShowFilters(false)}
                className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active filter summary */}
      {(category !== "All" || condition !== "All") && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          <span>Filters:</span>

          {category !== "All" && (
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-orange-400">
              {category}
            </span>
          )}

          {condition !== "All" && (
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-orange-400">
              {condition}
            </span>
          )}
        </div>
      )}

      {/* Product grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              id={product.id}
              key={product.id}
              title={product.title}
              price={product.price}
              condition={product.condition}
              image={product.images?.[0]?.image}
            />
          ))
        ) : (
          <p className="col-span-full py-12 text-center text-zinc-400">
            No products found. Try changing your search or filters.
          </p>
        )}
      </div>

    </div>
  </div>
);
 

}

export default Home;