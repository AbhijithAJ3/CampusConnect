from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ListingViewSet,
    current_user,
    register_user,
    upload_listing_images,
    toggle_saved_listing,
    create_listing_interest,
    update_listing_interest,
    get_listing_interests,
    get_seller_contact,
    mark_listing_sold,
    get_saved_listings,
    change_password,          # Change password API
    delete_listing_image
)

router = DefaultRouter()

router.register("listings", ListingViewSet)

urlpatterns = [
    # Profile
    path("me/", current_user),

    # Change password
    path("me/password/", change_password),

    # Authentication
    path("register/", register_user),

    # Listing images
    path(
        "listings/<int:listing_id>/images/",
        upload_listing_images,
    ),

    # Save / unsave listing
    path(
        "listings/<int:listing_id>/save/",
        toggle_saved_listing,
    ),

    # Buyer interest
    path(
        "listings/<int:listing_id>/interest/",
        create_listing_interest,
    ),

    # Seller accepts/rejects interest
    path(
        "interests/<int:interest_id>/",
        update_listing_interest,
    ),

    # Seller views interests
    path(
        "listings/<int:listing_id>/interests/",
        get_listing_interests,
    ),

    # Buyer gets seller contact
    path(
        "interests/<int:interest_id>/contact/",
        get_seller_contact,
    ),

    # Seller marks listing as sold
    path(
        "listings/<int:listing_id>/sold/",
        mark_listing_sold,
    ),

    # Saved listings
    path(
        "saved/",
        get_saved_listings,
    ),

    
    path(
        "listing-images/<int:image_id>/",
        delete_listing_image,
    ),

]

urlpatterns += router.urls