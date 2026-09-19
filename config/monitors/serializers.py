from rest_framework import serializers
from monitors.models import APIMonitor,MonitorResult,Incident

class APIMonitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIMonitor
        fields = '__all__'

class MonitorResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonitorResult
        fields = '__all__'
 
class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = '__all__'       
