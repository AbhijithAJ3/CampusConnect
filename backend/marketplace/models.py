from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


# -------------------------
# College
# -------------------------
class College(models.Model):
    name = models.CharField(max_length=200)
    email_domain = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class UserManager(BaseUserManager):

    def create_user(self, admission_number, password=None, **extra_fields):
        if not admission_number:
            raise ValueError("Admission number is required")

        user = self.model(
            admission_number=admission_number,
            **extra_fields
        )

        # Hash the password before storing it
        user.set_password(password)

        user.save(using=self._db)

        return user

    def create_superuser(self, admission_number, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        return self.create_user(
            admission_number,
            password,
            **extra_fields
        )
# -------------------------
# Custom User
# -------------------------
class User(AbstractUser):
    username = None
    admission_number = models.CharField(
        max_length=50,
        unique=True
    )
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        )

    college = models.ForeignKey(
        College,
        on_delete=models.CASCADE,
        related_name="students"
    )

    is_verified = models.BooleanField(default=False)

    # Login will eventually use admission number
    # instead of Django's default username.
    USERNAME_FIELD = "admission_number"
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return self.admission_number


# -------------------------
# Student Registry
# -------------------------
class StudentRegistry(models.Model):
    admission_number = models.CharField(max_length=50)

    phone_number = models.CharField(
        max_length=15,
        blank=True
    )

    name = models.CharField(max_length=150)

    department = models.CharField(max_length=100)

    college = models.ForeignKey(
        College,
        on_delete=models.CASCADE,
        related_name="student_registry"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["college", "admission_number"],
                name="unique_student_per_college"
            )
        ]

    def __str__(self):
        return self.admission_number


# -------------------------
# Category
# -------------------------
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


# -------------------------
# Listing
# -------------------------
class Listing(models.Model):

    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="listings"
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="listings"
    )

    condition = models.CharField(max_length=30)

    location = models.CharField(max_length=150)

    negotiable = models.BooleanField(default=False)

    reason = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ("AVAILABLE", "Available"),
            ("SOLD", "Sold"),
            ("HIDDEN", "Hidden"),
        ],
        default="AVAILABLE",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# -------------------------
# Listing Images
# -------------------------
class ListingImage(models.Model):

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="listing_images/"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

class SavedListing(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="saved_listings"
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="saved_by"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "listing"],
                name="unique_saved_listing"
            )
        ]

    def __str__(self):
        return f"{self.user} saved {self.listing}"

class ListingInterest(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("ACCEPTED", "Accepted"),
        ("REJECTED", "Rejected"),
        ("CANCELLED", "Cancelled"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="listing_interests"
    )

    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name="interests"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "listing"],
                name="unique_listing_interest"
            )
        ]

    def __str__(self):
        return f"{self.user} interested in {self.listing}"