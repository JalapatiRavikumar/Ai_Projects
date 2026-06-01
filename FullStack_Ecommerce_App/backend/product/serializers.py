import os
from rest_framework import serializers
from .models import Product

GITHUB_RAW_IMAGE_BASE = (
    'https://raw.githubusercontent.com/JalapatiRavikumar/AI-Projects/main/'
    'FullStack_Ecommerce_App/backend/static'
)


class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock', 'image']

    def get_image(self, obj):
        if not obj.image:
            return None

        image_url = obj.image.url if hasattr(obj.image, 'url') else str(obj.image)
        if image_url.startswith('http'):
            return image_url

        if os.environ.get('VERCEL'):
            filename = str(obj.image).replace('\\', '/').split('/')[-1]
            return f'{GITHUB_RAW_IMAGE_BASE}/images/{filename}'

        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(image_url)

        return image_url
