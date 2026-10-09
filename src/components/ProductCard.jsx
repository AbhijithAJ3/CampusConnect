 import { Link } from "react-router-dom";

function ProductCard(props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#1c1c1c] shadow-md transition duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl">

      {/* Product image area */}
      <div className="flex h-56 w-full items-center justify-center bg-[#242424]">
        {props.image ? (
          <img
            src={props.image}
            alt={props.title}
            className="h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-sm text-zinc-500">
            No image available
          </div>
        )}
      </div>

      {/* Product information */}
      <div className="p-5">

        {/* Product condition */}
        <p className="text-sm text-zinc-400">
          {props.condition}
        </p>

        {/* Product name */}
        <h3 className="mt-1 text-xl font-semibold text-white">
          {props.title}
        </h3>

        {/* Product price */}
        <p className="mt-3 text-2xl font-bold text-orange-500">
          ₹{props.price}
        </p>

        {/* Navigate to the product details page */}
        <Link
          to={`/product/${props.id}`}
          className="mt-4 block w-full rounded-lg bg-zinc-800 px-4 py-3 text-center font-medium text-white transition hover:bg-orange-500"
        >
          View Details
        </Link>

      </div>
    </div>
  );
}

export default ProductCard;
