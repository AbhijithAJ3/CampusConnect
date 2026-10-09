from rest_framework import viewsets
from rest_framework.permissions import (
    BasePermission,
    SAFE_METHODS,
    IsAuthenticated,
)
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.response import Response

from .models import (
    Listing,
    ListingImage,
    SavedListing,
    ListingInterest,
)
from .serializers import (
    ListingSerializer,
    RegisterSerializer,
)

from django.db.models import Q
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import StudentRegistry


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def current_user(request):

    user = request.user

    student = StudentRegistry.objects.filter(
        admission_number=user.admission_number,
        college=user.college
    ).first()

    # =========================
    # GET PROFILE
    # =========================

    if request.method == "GET":

        phone_number = user.phone_number

        if not phone_number and student:
            phone_number = student.phone_number

        return Response({
            "id": user.id,
            "name": user.first_name,
            "admission_number": user.admission_number,
            "phone_number": phone_number,
            "department": student.department if student else "",
            "college": user.college.name,
        })

    # =========================
    # UPDATE PROFILE
    # =========================

    
    phone_number = request.data.get("phone_number")

     

    if phone_number is not None:
        user.phone_number = phone_number

    user.save()

    # Return the COMPLETE profile after updating
    return Response({
        "id": user.id,
        "name": user.first_name,
        "admission_number": user.admission_number,
        "phone_number": user.phone_number,
        "department": student.department if student else "",
        "college": user.college.name,
    })
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def change_password(request):

    user = request.user

    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    # Check that both passwords were provided
    if not current_password or not new_password:
        return Response(
            {
                "error": "Current password and new password are required."
            },
            status=400
        )

    # Check the user's current password
    if not user.check_password(current_password):
        return Response(
            {
                "error": "Current password is incorrect."
            },
            status=400
        )

    # Validate the new password
    try:
        validate_password(new_password, user)

    except ValidationError as error:
        return Response(
            {
                "error": error.messages
            },
            status=400
        )

    # Securely save the new password
    user.set_password(new_password)
    user.save()

    return Response({
        "message": "Password changed successfully."
    })

class IsOwnerOrReadOnly(BasePermission):
    """
    Anyone can view listings.
    Only authenticated users can create listings.
    Only the owner can edit or delete a listing.
    """

    def has_permission(self, request, view):

        # Anyone can view listings
        if request.method in SAFE_METHODS:
            return True

        # Login is required for creating/editing/deleting
        return request.user and request.user.is_authenticated
    def has_object_permission(self, request, view, obj):

        # Anyone can view an existing listing
        if request.method in SAFE_METHODS:
            return True

        # Only the seller can modify/delete it
        if obj.seller != request.user:
            return False

        # SOLD listings cannot be edited
        # DELETE is still allowed for SOLD listings
        if obj.status == "SOLD" and request.method != "DELETE":
            return False

        return True

@api_view(["POST"])
def register_user(request):

    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        return Response(
            {
                "message": "Registration successful.",
                "user_id": user.id,
                "admission_number": user.admission_number,
            },
            status=201,
        )

    return Response(
        serializer.errors,
        status=400,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_listing_images(request, listing_id):
    # Find the listing
    listing = Listing.objects.get(id=listing_id)

    # Only the owner can upload images to their listing
    if listing.seller != request.user:
        return Response(
            {"error": "You can only upload images to your own listing."},
            status=403,
        )

    # Get all uploaded images
    images = request.FILES.getlist("images")

    # Save each image
    for image in images:
        ListingImage.objects.create(
            listing=listing,
            image=image,
        )

    return Response(
        {
            "message": "Images uploaded successfully.",
            "count": len(images),
        },
        status=201,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_listing_image(request, image_id):
    # Find the image and its associated listing.
    try:
        image = ListingImage.objects.select_related(
            "listing"
        ).get(id=image_id)
    except ListingImage.DoesNotExist:
        return Response(
            {"error": "Image not found."},
            status=404,
        )

    # Only the listing's owner can remove its images.
    if image.listing.seller != request.user:
        return Response(
            {"error": "You cannot delete this image."},
            status=403,
        )

    # Delete the image record and its associated file.
    image.image.delete(save=False)
    image.delete()

    return Response(status=204)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_saved_listing(request, listing_id):
    # Find the listing the user wants to save
    listing = Listing.objects.get(id=listing_id)

    # Check whether this user already saved it
    saved_listing = SavedListing.objects.filter(
        user=request.user,
        listing=listing
    ).first()

    if saved_listing:
        # Already saved → remove it
        saved_listing.delete()

        return Response({
            "saved": False,
            "message": "Listing removed from saved items."
        })

    # Not saved yet → save it
    SavedListing.objects.create(
        user=request.user,
        listing=listing
    )

    return Response({
        "saved": True,
        "message": "Listing saved successfully."
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_saved_listings(request):

    # Get all saved listings belonging to the logged-in user
    saved_listings = SavedListing.objects.filter(
        user=request.user
    ).select_related(
        "listing",
        "listing__category",
        "listing__seller",
    ).prefetch_related(
        "listing__images"
    )

    # Extract the actual listings
    listings = [saved.listing for saved in saved_listings]

    # Serialize the listings
    serializer = ListingSerializer(
        listings,
        many=True,
        context={"request": request}
    )

    return Response(serializer.data)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def create_listing_interest(request, listing_id):

    # Find the listing
    try:
        listing = Listing.objects.get(id=listing_id)
    except Listing.DoesNotExist:
        return Response(
            {"error": "Listing not found."},
            status=404,
        )

    # -----------------------------------------
    # GET → Check the current buyer's interest
    # -----------------------------------------
    if request.method == "GET":

        interest = ListingInterest.objects.filter(
            user=request.user,
            listing=listing,
        ).first()

        # Buyer has never shown interest
        if not interest:
            return Response({
                "interested": False,
            })

        # Buyer already has an interest request
        return Response({
            "interested": True,
            "interest_id": interest.id,
            "status": interest.status,
        })

    # -----------------------------------------
    # POST → Create a new interest request
    # -----------------------------------------
    # Buyers cannot show interest in sold listings
    if listing.status == "SOLD":
        return Response(
            {
            "error": "This listing has already been sold."
        },
        status=400,
    )
    # Seller cannot show interest in their own listing
    if listing.seller == request.user:
        return Response(
            {
                "error": "You cannot show interest in your own listing."
            },
            status=400,
        )

    # Check if this buyer already sent an interest request
    existing_interest = ListingInterest.objects.filter(
        user=request.user,
        listing=listing,
    ).first()

    if existing_interest:
        return Response(
            {
                "error": "You have already shown interest in this listing.",
                "status": existing_interest.status,
                "interest_id": existing_interest.id,
            },
            status=400,
        )

    # Create a new interest request
    interest = ListingInterest.objects.create(
        user=request.user,
        listing=listing,
    )

    return Response(
        {
            "message": "Interest sent successfully.",
            "interest_id": interest.id,
            "status": interest.status,
        },
        status=201,
    )

     
@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def update_listing_interest(request, interest_id):
    # Find the interest request
    try:
        interest = ListingInterest.objects.get(id=interest_id)
    except ListingInterest.DoesNotExist:
        return Response(
            {"error": "Interest request not found."},
            status=404,
        )
    # Buyer can check their own interest status
    if request.method == "GET":
        if interest.user != request.user:
            return Response(
                {"error": "You can only view your own interest request."},
                status=403,
            )

        return Response({
            "interest_id": interest.id,
            "listing_id": interest.listing.id,
            "status": interest.status,
        })
        
    # Only the seller of the listing can accept/reject
    if interest.listing.seller != request.user:
        return Response(
            {"error": "You can only manage interest requests for your own listings."},
            status=403,
        )

    # Get the requested status
    new_status = request.data.get("status")

    # Only these two actions are allowed for now
    if new_status not in ["ACCEPTED", "REJECTED"]:
        return Response(
            {"error": "Status must be ACCEPTED or REJECTED."},
            status=400,
        )

    interest.status = new_status
    interest.save()

    return Response({
        "message": f"Interest request {new_status.lower()}.",
        "interest_id": interest.id,
        "status": interest.status,
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_listing_interests(request, listing_id):
    # Find the listing
    try:
        listing = Listing.objects.get(id=listing_id)
    except Listing.DoesNotExist:
        return Response(
            {"error": "Listing not found."},
            status=404,
        )

    # Only the seller can see interest requests
    if listing.seller != request.user:
        return Response(
            {"error": "You can only view interests for your own listing."},
            status=403,
        )

    interests = ListingInterest.objects.filter(
        listing=listing
    ).select_related("user")

    data = []

    for interest in interests:
        data.append({
            "id": interest.id,
            "buyer_id": interest.user.id,
            "admission_number": interest.user.admission_number,
            "name": interest.user.first_name,
            "status": interest.status,
            "created_at": interest.created_at,
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_seller_contact(request, interest_id):
    # Find the interest request
    try:
        interest = ListingInterest.objects.select_related(
            "listing",
            "listing__seller",
        ).get(id=interest_id)
    except ListingInterest.DoesNotExist:
        return Response(
            {"error": "Interest request not found."},
            status=404,
        )

    # Only the buyer who sent the interest can see the contact
    if interest.user != request.user:
        return Response(
            {"error": "You can only view contact information for your own interest request."},
            status=403,
        )

    # Contact is available only after the seller accepts
    if interest.status != "ACCEPTED":
        return Response(
            {"error": "The seller has not accepted your interest yet."},
            status=403,
        )

    seller = interest.listing.seller

    return Response({
    "seller_name": seller.first_name,
    "seller_admission_number": seller.admission_number,
    "seller_phone": seller.phone_number,
})

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_listing_sold(request, listing_id):
    try:
        listing = Listing.objects.get(id=listing_id)
    except Listing.DoesNotExist:
        return Response(
            {"error": "Listing not found."},
            status=404,
        )

    # Only the seller who owns the listing can mark it as sold
    if listing.seller != request.user:
        return Response(
            {"error": "You can only mark your own listing as sold."},
            status=403,
        )

    listing.status = "SOLD"
    listing.save()

    return Response({
        "message": "Listing marked as sold.",
        "listing_id": listing.id,
        "status": listing.status,
    })

class ListingViewSet(viewsets.ModelViewSet):

    # DRF router needs this
    queryset = Listing.objects.all()

    serializer_class = ListingSerializer
    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):

        # My Listings:
        # /api/listings/?mine=true
        if self.request.query_params.get("mine") == "true":

            if not self.request.user.is_authenticated:
                return Listing.objects.none()

            return Listing.objects.filter(
                seller=self.request.user
            )

        # Home / marketplace:
        # Only AVAILABLE listings
        if self.action == "list":
            return Listing.objects.filter(status="AVAILABLE")

        # Specific listing:
        # Owner can access their own SOLD listing
        if self.request.user.is_authenticated:
            return Listing.objects.filter(
                Q(status="AVAILABLE") |
                Q(seller=self.request.user)
            )

        # Logged-out users
        return Listing.objects.filter(status="AVAILABLE")

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)