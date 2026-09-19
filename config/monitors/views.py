from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets , status
from monitors.models import APIMonitor , MonitorResult , Incident
from monitors.serializers import APIMonitorSerializer , MonitorResultSerializer , IncidentSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from monitors.health_checker import check_monitor
from monitors.metrics import calculate_metrics
from monitors.degradation import detect_degradation
from .ai_analyzer import analyze_incident
from .metrics import calculate_metrics

class APIMonitorViewSet(viewsets.ModelViewSet):
    queryset = APIMonitor.objects.all()
    serializer_class = APIMonitorSerializer
    
    @action(detail=True,methods=['get'])
    def metrics(self,request,pk=None):
        metrics = calculate_metrics(pk)
        return Response(metrics)
    
    @action(detail=True,methods=['post'])
    def check(self,request,pk=None):
        result = check_monitor(pk)
        
        return Response({
            'status_code':result.status_code,
            'response_time':result.response_time,
            'is_healthy':result.is_healthy,
        },
                        
        status = status.HTTP_200_OK)
        
          
          
    @action(detail=True,methods=['get'])
    def degradation(self,request,pk=None):
            result = detect_degradation(pk)
            return Response(result)
        
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        monitor = self.get_object()
        results = monitor.results.all().order_by('-checked_at')

        serializer = MonitorResultSerializer(results, many=True)

        return Response(serializer.data)
class IncidentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Incident.objects.all().order_by('-created_at')
    
    serializer_class = IncidentSerializer
    
    @action(detail=True, methods=['get'])
    def analyze(self, request, pk=None):
        incident = self.get_object()

        monitor = incident.monitor

        latest_result = monitor.results.order_by('-checked_at').first()

        metrics = calculate_metrics(monitor.id)

        incident_data = {
            "incident_type": str(incident.incident_type).strip().upper(),
            "status_code": (
                latest_result.status_code
                if latest_result
                else None
            ),
            "response_time": (
                latest_result.response_time
                if latest_result
                else None
            ),
            "historical_response_time": (
                metrics["average_response_time"]
            ),
            "availability": metrics["availability"],
        }

        analysis = analyze_incident(incident_data)

        return Response({
            "incident_type_received": incident_data["incident_type"],
            "analysis": analysis,
        })

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        incident = self.get_object()

        incident.status = "RESOLVED"
        incident.resolved_at = timezone.now()
        incident.save(update_fields=["status", "resolved_at"])

        serializer = self.get_serializer(incident)

        return Response(serializer.data)
