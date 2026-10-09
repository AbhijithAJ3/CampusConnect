from rest_framework import serializers
from .models import (
    Listing,
    ListingImage,
    Category,
    User,
)

from django.contrib.auth import get_user_model
from .models import StudentRegistry


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ["id", "image"]


class ListingSerializer(serializers.ModelSerializer):
    
    # Shows the uploaded images belonging to this listing
    images = ListingImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(
    source="category.name",
    read_only=True,
    
    )
    saved = serializers.SerializerMethodField()
    class Meta:
        model = Listing
        fields = [
            "id",
            "seller",
            "title",
            "description",
            "price",
            "category",
            "condition",
            "location",
            "negotiable",
            "reason",
            "status",
            "created_at",
            "images",
            "category_name",
            "saved",
             
        ]
        read_only_fields = ["seller","saved"]
    def get_saved(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        return obj.saved_by.filter(
            user=request.user
        ).exists()       

    
User = get_user_model()


class RegisterSerializer(serializers.Serializer):

    admission_number = serializers.CharField(max_length=50)
    password = serializers.CharField(write_only=True, min_length=8)

    def create(self, validated_data):

        admission_number = validated_data["admission_number"]
        password = validated_data["password"]

        # Check whether this student exists in the college registry
        try:
            student = StudentRegistry.objects.get(
                admission_number=admission_number
            )
        except StudentRegistry.DoesNotExist:
            raise serializers.ValidationError(
                "Student is not registered in the college registry."
            )

        # Prevent duplicate accounts
        if User.objects.filter(
            admission_number=admission_number
        ).exists():
            raise serializers.ValidationError(
                "An account with this admission number already exists."
            )

        user = User.objects.create_user(
        admission_number=admission_number,
        password=password,
        first_name=student.name,
        college=student.college,
        phone_number=student.phone_number,
        is_verified=True,
    )
        return user