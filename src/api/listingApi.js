import api from "./axiosInstance";

 

export async function getListings(mine = false) {
    const url = mine
        ? "/listings/?mine=true"
        : "/listings/";

    const response = await api.get(url);

    return response.data;
}

// Get one specific listing
export async function getListing(id) {
    const response = await api.get(
        `/listings/${id}/`
    );

    return response.data;
}
// Create a new listing
export async function createListing(listingData) {
    const response = await api.post(
        "/listings/",
        listingData
    );

    return response.data;
}

// Update an existing listing
export async function updateListing(id, listingData) {
    const response = await api.patch(
        `/listings/${id}/`,
        listingData
    );

    return response.data;
}

// Delete an existing listing
export async function deleteListing(id) {
    const response = await api.delete(
        `/listings/${id}/`
    );

    return response.data;
}

// Upload images for an existing listing
export async function uploadListingImages(listingId, images) {
    const formData = new FormData();

    // Add each selected image to the request
    images.forEach((image) => {
        formData.append("images", image);
    });

    const response = await api.post(
        `/listings/${listingId}/images/`,
        formData
    );


    return response.data;
}

// Save or unsave a listing
export async function toggleSavedListing(listingId) {
    const response = await api.post(
        `/listings/${listingId}/save/`
    );

    return response.data;
}

// Send an "I'm Interested" request for a listing
export async function createListingInterest(listingId) {
    const response = await api.post(
        `/listings/${listingId}/interest/`
    );

    return response.data;
}

// Get interest requests for a listing
export async function getListingInterests(listingId) {
    const response = await api.get(
        `/listings/${listingId}/interests/`
    );

    return response.data;
}

// Accept or reject an interest request
export async function updateListingInterest(interestId, status) {
    const response = await api.patch(
        `/interests/${interestId}/`,
        {
            status: status,
        }
    );

    return response.data;
}

// Get seller contact after an interest request is accepted
export async function getSellerContact(interestId) {
    const response = await api.get(
        `/interests/${interestId}/contact/`
    );

    return response.data;
}

// Get the current status of an interest request
export async function getListingInterest(interestId) {
    const response = await api.get(
        `/interests/${interestId}/`
    );

    return response.data;
}

export async function markListingSold(listingId) {
    const response = await api.patch(
        `/listings/${listingId}/sold/`
    );

    return response.data;
}

export async function getMyListingInterest(listingId) {
    const response = await api.get(
        `/listings/${listingId}/interest/`
    );

    return response.data;
}

// Get all listings saved by the current user
export async function getSavedListings() {
    const response = await api.get("/saved/");
    return response.data;
}


export async function deleteListingImage(imageId) {
  const response = await api.delete(
    `/listing-images/${imageId}/`
  );

  return response.data;
}
