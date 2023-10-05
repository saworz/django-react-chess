from rest_framework import serializers


class UserIdSerializer(serializers.Serializer):
    pk = serializers.HyperlinkedRelatedField(
        view_name='pk',
        read_only=True
    )
